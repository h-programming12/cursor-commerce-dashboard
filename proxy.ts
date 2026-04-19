/**
 * Next.js 16+ 요청 프록시(구 Middleware). 앱 라우트 앞단에서 세션 갱신·접근 제어를 수행합니다.
 *
 * - 실제 정책은 `@/lib/supabase/proxy`의 `updateSession`에 위임합니다.
 * - `matcher`로 API·정적 자산·이미지 최적화 경로는 실행 범위에서 제외합니다.
 *
 * @see https://nextjs.org/docs/app/getting-started/proxy
 */
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
