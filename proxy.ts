/**
 * Next.js 16 `proxy` 훅: 구 `middleware`와 동일한 위치에서 요청마다 실행됩니다.
 * Supabase 세션 쿠키 갱신만 수행하며, 라우팅 분기는 하지 않습니다.
 */
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(req: NextRequest) {
  // 응답 본문·경로는 건드리지 않고 세션 메타만 동기화
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
