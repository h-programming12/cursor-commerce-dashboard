-- ============================================
-- users UPDATE 정책 무한 재귀 수정
-- ============================================
-- WITH CHECK의 (SELECT role FROM public.users WHERE id = auth.uid()) 가
-- users를 읽으면서 SELECT 정책 평가 → is_admin() → users 조회 → 무한 재귀 발생.
-- 서브쿼리 제거 후, 본인 role 변경 방지는 트리거로 대체.
-- is_admin()를 users 테이블 소유자로 이전하여 RLS를 우회하도록 함.

-- 0. is_admin() 소유자를 users 테이블 소유자와 동일하게 (RLS 우회, 권한 없으면 스킵)
DO $$
DECLARE
  table_owner name;
BEGIN
  SELECT tableowner INTO table_owner
  FROM pg_tables
  WHERE schemaname = 'public' AND tablename = 'users';
  IF table_owner IS NOT NULL THEN
    EXECUTE format('ALTER FUNCTION public.is_admin() OWNER TO %I', table_owner);
  END IF;
EXCEPTION
  WHEN insufficient_privilege OR OTHERS THEN
    NULL;
END
$$;

-- 1. 트리거: 본인 행 수정 시 role 변경 불가 (일반 유저)
CREATE OR REPLACE FUNCTION public.users_force_own_role_unchanged()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.id = auth.uid() AND NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_force_own_role_unchanged_trigger ON public.users;
CREATE TRIGGER users_force_own_role_unchanged_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.users_force_own_role_unchanged();

-- 2. UPDATE 정책에서 users를 읽는 서브쿼리 제거
DROP POLICY IF EXISTS "users_update_own_or_admin" ON public.users;

CREATE POLICY "users_update_own_or_admin"
  ON public.users
  FOR UPDATE
  USING (
    auth.uid() = id OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = id OR public.is_admin()
  );
