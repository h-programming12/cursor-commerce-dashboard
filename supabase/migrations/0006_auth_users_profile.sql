-- ============================================
-- auth.users와 public.users 1대1 대응 마이그레이션
-- ============================================
-- 이 마이그레이션은 auth.users와 public.users를 1대1로 대응시킵니다.
-- auth.users에 사용자가 생성되면 자동으로 public.users에 프로필이 생성됩니다.

-- ============================================
-- 1. user_role enum 생성 (이미 존재하면 생성하지 않음)
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
  END IF;
END $$;

-- ============================================
-- 2. 기존 public.users 테이블 백업 및 재정의
-- ============================================

-- 기존 테이블이 있다면 임시 백업 테이블로 이동
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    -- 기존 테이블을 백업 (필요시)
    DROP TABLE IF EXISTS public.users_backup CASCADE;
    CREATE TABLE public.users_backup AS SELECT * FROM public.users;
    
    -- 기존 테이블 삭제 (외래 키 제약 때문에 CASCADE 필요)
    DROP TABLE public.users CASCADE;
  END IF;
END $$;

-- public.users 테이블 재생성 (auth.users.id와 동일한 id 사용)
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT users_auth_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.users IS '사용자 정보 테이블 (auth.users와 1대1 대응)';
COMMENT ON COLUMN public.users.id IS '사용자 고유 ID (auth.users.id와 동일)';
COMMENT ON COLUMN public.users.email IS '이메일 주소 (고유)';
COMMENT ON COLUMN public.users.display_name IS '표시 이름';
COMMENT ON COLUMN public.users.role IS '사용자 역할 (user, admin)';
COMMENT ON COLUMN public.users.created_at IS '생성 일시';
COMMENT ON COLUMN public.users.updated_at IS '수정 일시';

-- 인덱스 재생성
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- ============================================
-- 3. handle_new_auth_user() 함수 생성
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_display_name TEXT;
  v_email TEXT;
BEGIN
  -- email 추출
  v_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
  
  -- display_name 추출: raw_user_meta_data에서 가져오거나, 없으면 이메일 앞부분 사용
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(v_email, '@', 1)
  );
  
  -- public.users에 프로필 생성 (중복 방지)
  INSERT INTO public.users (id, email, display_name, role, created_at)
  VALUES (
    NEW.id,
    v_email,
    v_display_name,
    'user',
    COALESCE(NEW.created_at, now())
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_auth_user() IS 'auth.users에 사용자가 생성되면 public.users에 프로필을 자동 생성하는 함수';

-- ============================================
-- 4. 트리거 생성
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================
-- 5. 기존 auth.users 데이터 마이그레이션
-- ============================================

-- auth.users에 존재하는 모든 유저에 대해 public.users에 프로필 생성
INSERT INTO public.users (id, email, display_name, role, created_at)
SELECT 
  au.id,
  COALESCE(au.email, au.raw_user_meta_data->>'email', 'unknown@example.com') as email,
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'full_name',
    SPLIT_PART(COALESCE(au.email, au.raw_user_meta_data->>'email', 'unknown@example.com'), '@', 1)
  ) as display_name,
  'user'::user_role as role,
  COALESCE(au.created_at, now()) as created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. RLS 정책 재적용 (기존 정책이 삭제되었을 수 있으므로)
-- ============================================

-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own_or_admin" ON public.users;
DROP POLICY IF EXISTS "users_delete_admin_only" ON public.users;

-- SELECT: 로그인한 일반 유저는 자신의 profile만 조회, admin은 전체 조회
CREATE POLICY "users_select_own_or_admin"
  ON public.users
  FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin()
  );

-- INSERT: 트리거를 통해서만 생성되므로, 로그인한 사용자가 자기 id로만 insert 가능
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  WITH CHECK (
    auth.uid() = id
  );

-- UPDATE: 일반 유저는 자신의 profile만 수정 가능 (role 수정 불가), admin은 전체 수정 가능
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
CREATE POLICY "users_delete_admin_only"
  ON public.users
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- 7. Orphaned 데이터 정리 (users 테이블에 존재하지 않는 user_id 참조 삭제)
-- ============================================

-- orders 테이블의 orphaned 데이터 삭제
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    DELETE FROM public.orders 
    WHERE user_id NOT IN (SELECT id FROM public.users);
  END IF;
END $$;

-- payments 테이블의 orphaned 데이터 삭제
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
    DELETE FROM public.payments 
    WHERE user_id NOT IN (SELECT id FROM public.users);
  END IF;
END $$;

-- reviews 테이블의 orphaned 데이터 삭제
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
    DELETE FROM public.reviews 
    WHERE user_id NOT IN (SELECT id FROM public.users);
  END IF;
END $$;

-- cart_items 테이블의 orphaned 데이터 삭제
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cart_items') THEN
    DELETE FROM public.cart_items 
    WHERE user_id NOT IN (SELECT id FROM public.users);
  END IF;
END $$;

-- like_items 테이블의 orphaned 데이터 삭제
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'like_items') THEN
    DELETE FROM public.like_items 
    WHERE user_id NOT IN (SELECT id FROM public.users);
  END IF;
END $$;

-- ============================================
-- 8. 외래 키 제약 재생성 (다른 테이블들이 users를 참조하는 경우)
-- ============================================

-- orders 테이블의 외래 키 재생성
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'orders_user_id_fkey' 
      AND table_name = 'orders'
    ) THEN
      ALTER TABLE public.orders 
      ADD CONSTRAINT orders_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- payments 테이블의 외래 키 재생성
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'payments_user_id_fkey' 
      AND table_name = 'payments'
    ) THEN
      ALTER TABLE public.payments 
      ADD CONSTRAINT payments_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- reviews 테이블의 외래 키 재생성
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'reviews_user_id_fkey' 
      AND table_name = 'reviews'
    ) THEN
      ALTER TABLE public.reviews 
      ADD CONSTRAINT reviews_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- cart_items 테이블의 외래 키 재생성
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cart_items') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'cart_items_user_id_fkey' 
      AND table_name = 'cart_items'
    ) THEN
      ALTER TABLE public.cart_items 
      ADD CONSTRAINT cart_items_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- like_items 테이블의 외래 키 재생성
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'like_items') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'like_items_user_id_fkey' 
      AND table_name = 'like_items'
    ) THEN
      ALTER TABLE public.like_items 
      ADD CONSTRAINT like_items_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;
