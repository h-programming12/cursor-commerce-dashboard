-- ============================================
-- users_select_review_authors 정책 무한 재귀 수정
-- ============================================
-- 0007 정책에서 is_admin() 사용 시 users 조회 → RLS 재평가 → 무한 재귀 발생.
-- 정책을 users 테이블을 참조하지 않는 조건만 사용하도록 수정.

DROP POLICY IF EXISTS "users_select_review_authors" ON public.users;

CREATE POLICY "users_select_review_authors"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews r WHERE r.user_id = public.users.id
    )
  );
