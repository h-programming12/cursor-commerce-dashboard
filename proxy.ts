import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(req: NextRequest) {
  return await updateSession(req);
}

export const config = {
  matcher: [
    /*
     * API routes, static files, image optimization 제외
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
