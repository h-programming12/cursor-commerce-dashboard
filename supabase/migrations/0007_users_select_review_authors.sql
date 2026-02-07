-- ============================================
-- 리뷰 작성자 프로필 공개 조회 정책
-- ============================================
-- 리뷰 목록에서 users(display_name) 조인 시 RLS로 인해 null이 반환되던 문제 해결.
-- 최소 한 건 이상 리뷰를 작성한 사용자의 행은 누구나 SELECT 가능 (display_name 표시용).
--
-- 주의: 이 정책에서는 is_admin() 또는 users 테이블을 참조하지 않음.
--       (is_admin()가 users를 읽으면 RLS 재평가로 무한 재귀 발생)
--       본인/관리자 조회는 기존 users_select_own_or_admin 정책으로 처리됨.

CREATE POLICY "users_select_review_authors"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews r WHERE r.user_id = public.users.id
    )
  );
