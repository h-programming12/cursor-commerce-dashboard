-- ============================================
-- Row Level Security (RLS) 활성화 및 정책 설정
-- ============================================
-- 이 마이그레이션은 모든 주요 테이블에 RLS를 활성화하고
-- 역할 기반 및 소유권 기반 접근 제어 정책을 설정합니다.

-- ============================================
-- 헬퍼 함수: Admin 여부 확인
-- ============================================

-- 현재 사용자가 admin인지 확인하는 함수
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin() IS '현재 로그인한 사용자가 admin인지 확인';

-- ============================================
-- 1. public.users 테이블 RLS
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- SELECT: 로그인한 일반 유저는 자신의 profile만 조회, admin은 전체 조회
CREATE POLICY "users_select_own_or_admin"
  ON public.users
  FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin()
  );

-- INSERT: 로그인한 사용자가 자기 id로만 insert 가능
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
-- 2. public.products 테이블 RLS
-- ============================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- SELECT: 비로그인/로그인 모두 status != 'hidden'인 상품 읽기 가능, admin은 전체 읽기
CREATE POLICY "products_select_public_or_admin"
  ON public.products
  FOR SELECT
  USING (
    status != 'hidden' OR public.is_admin()
  );

-- INSERT: admin만 허용
CREATE POLICY "products_insert_admin_only"
  ON public.products
  FOR INSERT
  WITH CHECK (public.is_admin());

-- UPDATE: admin만 허용
CREATE POLICY "products_update_admin_only"
  ON public.products
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: admin만 허용
CREATE POLICY "products_delete_admin_only"
  ON public.products
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- 3. public.orders 테이블 RLS
-- ============================================

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- SELECT: 로그인 유저는 자신의 주문만 조회, admin은 전체 조회
CREATE POLICY "orders_select_own_or_admin"
  ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- INSERT: 로그인 유저만 가능하며, user_id = auth.uid()인 row만 insert 허용
CREATE POLICY "orders_insert_own"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- UPDATE: admin만 허용 (주문 상태 변경은 관리자 전용)
CREATE POLICY "orders_update_admin_only"
  ON public.orders
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: admin만 허용
CREATE POLICY "orders_delete_admin_only"
  ON public.orders
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- 4. public.order_items 테이블 RLS
-- ============================================

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- SELECT: 해당 order가 본인 소유이거나 admin인 경우만 허용
CREATE POLICY "order_items_select_own_order_or_admin"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- INSERT: 해당 order가 본인 소유이거나 admin인 경우만 허용
CREATE POLICY "order_items_insert_own_order_or_admin"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- UPDATE: 해당 order가 본인 소유이거나 admin인 경우만 허용
CREATE POLICY "order_items_update_own_order_or_admin"
  ON public.order_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- DELETE: 해당 order가 본인 소유이거나 admin인 경우만 허용
CREATE POLICY "order_items_delete_own_order_or_admin"
  ON public.order_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ============================================
-- 5. public.payments 테이블 RLS
-- ============================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- SELECT: 해당 order가 본인 소유이거나 admin인 경우만 허용
CREATE POLICY "payments_select_own_order_or_admin"
  ON public.payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
      AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

-- INSERT: admin만 허용
CREATE POLICY "payments_insert_admin_only"
  ON public.payments
  FOR INSERT
  WITH CHECK (public.is_admin());

-- UPDATE: admin만 허용
CREATE POLICY "payments_update_admin_only"
  ON public.payments
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: admin만 허용
CREATE POLICY "payments_delete_admin_only"
  ON public.payments
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- 6. public.reviews 테이블 RLS
-- ============================================

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- SELECT: 로그인 여부와 관계 없이 모든 리뷰 읽기 허용
CREATE POLICY "reviews_select_all"
  ON public.reviews
  FOR SELECT
  USING (true);

-- INSERT: 로그인 유저만 가능하며, user_id = auth.uid()인 row만 insert 허용
CREATE POLICY "reviews_insert_own"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- UPDATE: 본인이 작성한 리뷰만 수정 가능
CREATE POLICY "reviews_update_own"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: 본인 또는 admin만 삭제 가능
CREATE POLICY "reviews_delete_own_or_admin"
  ON public.reviews
  FOR DELETE
  USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- ============================================
-- 7. public.cart_items 테이블 RLS
-- ============================================

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- SELECT: 사용자는 자신의 장바구니만 조회 가능
CREATE POLICY "cart_items_select_own"
  ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 사용자는 자신의 장바구니만 추가 가능
CREATE POLICY "cart_items_insert_own"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- UPDATE: 사용자는 자신의 장바구니만 수정 가능
CREATE POLICY "cart_items_update_own"
  ON public.cart_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: 사용자는 자신의 장바구니만 삭제 가능
CREATE POLICY "cart_items_delete_own"
  ON public.cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 8. public.like_items 테이블 RLS
-- ============================================

ALTER TABLE public.like_items ENABLE ROW LEVEL SECURITY;

-- SELECT: 사용자는 자신의 찜하기만 조회 가능
CREATE POLICY "like_items_select_own"
  ON public.like_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 사용자는 자신의 찜하기만 추가 가능
CREATE POLICY "like_items_insert_own"
  ON public.like_items
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid() = user_id
  );

-- DELETE: 사용자는 자신의 찜하기만 삭제 가능
CREATE POLICY "like_items_delete_own"
  ON public.like_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. public.mcp_settings 테이블 RLS
-- ============================================

ALTER TABLE public.mcp_settings ENABLE ROW LEVEL SECURITY;

-- SELECT: admin만 허용
CREATE POLICY "mcp_settings_select_admin_only"
  ON public.mcp_settings
  FOR SELECT
  USING (public.is_admin());

-- INSERT: admin만 허용
CREATE POLICY "mcp_settings_insert_admin_only"
  ON public.mcp_settings
  FOR INSERT
  WITH CHECK (public.is_admin());

-- UPDATE: admin만 허용
CREATE POLICY "mcp_settings_update_admin_only"
  ON public.mcp_settings
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE: admin만 허용
CREATE POLICY "mcp_settings_delete_admin_only"
  ON public.mcp_settings
  FOR DELETE
  USING (public.is_admin());

