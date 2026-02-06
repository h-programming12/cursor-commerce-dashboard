-- ============================================
-- auth.users와 public.users 연결 마이그레이션
-- ============================================
-- 이 마이그레이션은 Supabase Auth의 auth.users와
-- public.users 테이블을 연결하고 자동 프로필 생성을 설정합니다.

-- ============================================
-- 1. user_role enum에 super_admin 추가
-- ============================================

-- super_admin이 없으면 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_role'
  ) THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
  ELSIF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'super_admin' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'super_admin';
  END IF;
END $$;

-- ============================================
-- 2. 기존 users 테이블 데이터 백업 및 재구성
-- ============================================

-- 기존 데이터를 임시 테이블에 백업
CREATE TABLE IF NOT EXISTS public.users_backup AS
SELECT * FROM public.users;

-- 기존 users 테이블의 외래 키 제약 조건 제거 (다른 테이블에서 참조 중인 경우)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'users'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%users%'
  ) LOOP
    EXECUTE 'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
  END LOOP;
END $$;

-- 기존 users 테이블 삭제 (CASCADE로 관련 객체도 함께 삭제)
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- 3. public.users 테이블 재생성 (auth.users와 연결)
-- ============================================

-- auth.users.id와 동일한 id를 사용하는 users 테이블 생성
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT users_auth_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.users IS '사용자 정보 테이블 (auth.users와 연결)';
COMMENT ON COLUMN public.users.id IS '사용자 고유 ID (auth.users.id와 동일)';
COMMENT ON COLUMN public.users.email IS '이메일 주소 (고유)';
COMMENT ON COLUMN public.users.display_name IS '표시 이름';
COMMENT ON COLUMN public.users.role IS '사용자 역할 (user, admin, super_admin)';
COMMENT ON COLUMN public.users.created_at IS '생성 일시';
COMMENT ON COLUMN public.users.updated_at IS '수정 일시';

-- 인덱스 재생성
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- ============================================
-- 4. handle_new_auth_user() 함수 생성
-- ============================================

-- auth.users에 INSERT 시 public.users에 프로필 자동 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  -- display_name 추출: raw_user_meta_data에서 가져오거나 이메일 앞부분 사용
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- public.users에 프로필 생성
  INSERT INTO public.users (id, email, display_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_display_name,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_auth_user() IS 'auth.users에 새 사용자가 생성될 때 public.users에 프로필을 자동 생성하는 함수';

-- ============================================
-- 5. 트리거 생성
-- ============================================

-- auth.users에 INSERT 시 트리거 실행
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================
-- 6. 기존 데이터 마이그레이션
-- ============================================

-- auth.users에 존재하는 모든 유저에 대해 public.users에 프로필 생성
INSERT INTO public.users (id, email, display_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1)
  ) as display_name,
  COALESCE(
    (au.raw_user_meta_data->>'role')::user_role,
    COALESCE(ub.role, 'user'::user_role)
  ) as role,
  COALESCE(ub.created_at, au.created_at, now()) as created_at,
  COALESCE(ub.updated_at, au.updated_at, now()) as updated_at
FROM auth.users au
LEFT JOIN public.users_backup ub ON au.id = ub.id
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
  role = COALESCE(EXCLUDED.role, public.users.role),
  updated_at = now();

-- ============================================
-- 7. updated_at 트리거 재생성
-- ============================================

-- users 테이블의 updated_at 자동 업데이트 트리거 재생성
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. RLS 정책 재생성
-- ============================================

-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- SELECT: 로그인한 일반 유저는 자신의 profile만 조회, admin은 전체 조회
DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
CREATE POLICY "users_select_own_or_admin"
  ON public.users
  FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin()
  );

-- INSERT: 로그인한 사용자가 자기 id로만 insert 가능
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
  );

-- UPDATE: 일반 유저는 자신의 profile만 수정 가능 (role 수정 불가), admin은 전체 수정 가능
DROP POLICY IF EXISTS "users_update_own_or_admin" ON public.users;
CREATE POLICY "users_update_own_or_admin"
  ON public.users
  FOR UPDATE
  USING (
    auth.uid() = id OR public.is_admin()
  )
  WITH CHECK (
    -- 일반 유저는 role을 변경할 수 없음
    (auth.uid() = id AND role = (SELECT role FROM public.users WHERE id = auth.uid()))
    OR public.is_admin()
  );

-- DELETE: admin만 허용
DROP POLICY IF EXISTS "users_delete_admin_only" ON public.users;
CREATE POLICY "users_delete_admin_only"
  ON public.users
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- 9. 백업 테이블 정리 (선택사항)
-- ============================================

-- 마이그레이션 확인 후 수동으로 삭제할 수 있도록 주석 처리
-- DROP TABLE IF EXISTS public.users_backup;
