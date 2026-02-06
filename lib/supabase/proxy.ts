import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getPublicEnv } from "@/commons/config/env";
import { getRouteConfig } from "@/commons/constants/url";
import { AUTH_URLS, COMMERCE_URLS } from "@/commons/constants/url";
import type { Database } from "@/types/supabase";

const STATIC_PATHS = ["/_next", "/images", "/icons", "/favicon.ico"];

function isStaticOrExcludedPath(pathname: string): boolean {
  if (STATIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (pathname === "/favicon.ico") return true;
  if (/\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/i.test(pathname)) return true;
  return false;
}

export async function updateSession(
  request: NextRequest
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  if (isStaticOrExcludedPath(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const { supabase } = getPublicEnv();

  const supabaseClient = createServerClient<Database>(
    supabase.url,
    supabase.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  const routeConfig = getRouteConfig(pathname);

  if (routeConfig) {
    const { access } = routeConfig;

    if (access === "public") {
      const isAuthPage =
        pathname === AUTH_URLS.LOGIN || pathname === AUTH_URLS.SIGNUP;
      if (isAuthPage && user) {
        return NextResponse.redirect(new URL(COMMERCE_URLS.HOME, request.url));
      }
    }

    if (access === "authenticated") {
      if (!user) {
        const loginUrl = new URL(AUTH_URLS.LOGIN, request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    if (access === "admin") {
      if (!user) {
        return NextResponse.redirect(new URL(COMMERCE_URLS.HOME, request.url));
      }
      const { data: userRow } = await supabaseClient
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      const role =
        (userRow as { role?: "user" | "admin" } | null)?.role ?? "user";
      if (role !== "admin") {
        return NextResponse.redirect(new URL(COMMERCE_URLS.HOME, request.url));
      }
    }
  }

  return response;
}
