"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/browser";
import {
  useSessionStore,
  type UserSession,
} from "@/commons/store/session-store";

function mapToUserSession(
  id: string,
  email: string,
  displayName: string | null,
  role: "user" | "admin"
): UserSession {
  return { id, email, displayName, role };
}

async function syncSessionToStore() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { setUser, clearUser } = useSessionStore.getState();

  if (!session?.user) {
    clearUser();
    return;
  }

  const { id, email } = session.user;
  type UserProfile = { display_name: string | null; role: "user" | "admin" };
  const { data: profile } = (await supabase
    .from("users")
    .select("display_name, role")
    .eq("id", id)
    .maybeSingle()) as { data: UserProfile | null };

  if (profile) {
    setUser(
      mapToUserSession(
        id,
        email ?? "",
        profile.display_name ?? null,
        profile.role ?? "user"
      )
    );
  } else {
    const displayName =
      session.user.user_metadata?.display_name ??
      session.user.user_metadata?.full_name ??
      null;
    setUser(
      mapToUserSession(
        id,
        email ?? "",
        displayName,
        (session.user.user_metadata?.role as "user" | "admin") ?? "user"
      )
    );
  }
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    syncSessionToStore();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncSessionToStore();
      } else {
        useSessionStore.getState().clearUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
