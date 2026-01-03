-- ============================================
-- 초기 스키마 생성 마이그레이션
-- ============================================
-- 이 마이그레이션은 커머스 대시보드의 기본 데이터베이스 스키마를 생성합니다.
-- auth.users와의 연동은 향후 추가 예정입니다.

-- ============================================
-- 1. ENUM 타입 생성
-- ============================================

-- 사용자 역할 enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- ============================================
-- 2. users 테이블
-- ============================================

-- 사용자 정보 테이블
-- 참고: auth.users와의 연동은 나중에 추가할 예정
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS '사용자 정보 테이블';
COMMENT ON COLUMN public.users.id IS '사용자 고유 ID';
COMMENT ON COLUMN public.users.email IS '이메일 주소 (고유)';
COMMENT ON COLUMN public.users.display_name IS '표시 이름';
COMMENT ON COLUMN public.users.role IS '사용자 역할 (user, admin)';
COMMENT ON COLUMN public.users.created_at IS '생성 일시';
COMMENT ON COLUMN public.users.updated_at IS '수정 일시';

-- 인덱스
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- ============================================
-- 3. products 테이블
-- ============================================

-- 상품 정보 테이블
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    sale_price NUMERIC CHECK (sale_price >= 0),
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'hidden', 'sold_out')),
    additional_info TEXT,
    measurements TEXT,
    categories TEXT[],
    rating_average NUMERIC,
    review_summary JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.products IS '상품 정보 테이블';
COMMENT ON COLUMN public.products.id IS '상품 고유 ID';
COMMENT ON COLUMN public.products.name IS '상품명';
COMMENT ON COLUMN public.products.description IS '상품 설명';
COMMENT ON COLUMN public.products.price IS '정가 (>= 0)';
COMMENT ON COLUMN public.products.sale_price IS '할인가 (>= 0)';
COMMENT ON COLUMN public.products.image_url IS '상품 이미지 URL';
COMMENT ON COLUMN public.products.status IS '상품 상태 (registered, hidden, sold_out)';
COMMENT ON COLUMN public.products.additional_info IS '추가 정보';
COMMENT ON COLUMN public.products.measurements IS '치수 정보';
COMMENT ON COLUMN public.products.categories IS '카테고리 배열';
COMMENT ON COLUMN public.products.rating_average IS '평균 평점';
COMMENT ON COLUMN public.products.review_summary IS '리뷰 요약 정보 (JSON)';
COMMENT ON COLUMN public.products.created_at IS '생성 일시';
COMMENT ON COLUMN public.products.updated_at IS '수정 일시';

-- 인덱스
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_categories ON public.products USING GIN(categories);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

-- ============================================
-- 4. orders 테이블
-- ============================================

-- 주문 정보 테이블
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled', 'refunded')),
    total_amount NUMERIC NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    subtotal_amount NUMERIC NOT NULL DEFAULT 0 CHECK (subtotal_amount >= 0),
    shipping_fee NUMERIC NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    discount_amount NUMERIC NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_status TEXT NOT NULL DEFAULT 'requested' CHECK (payment_status IN ('requested', 'success', 'failed', 'refund_requested', 'refund_completed')),
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    shipping_name TEXT,
    shipping_phone TEXT,
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip TEXT,
    shipping_country TEXT,
    toss_order_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    paid_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE public.orders IS '주문 정보 테이블';
COMMENT ON COLUMN public.orders.id IS '주문 고유 ID';
COMMENT ON COLUMN public.orders.user_id IS '주문한 사용자 ID';
COMMENT ON COLUMN public.orders.status IS '주문 상태 (pending, paid, canceled, refunded)';
COMMENT ON COLUMN public.orders.total_amount IS '총 주문 금액 (>= 0)';
COMMENT ON COLUMN public.orders.subtotal_amount IS '소계 금액 (>= 0)';
COMMENT ON COLUMN public.orders.shipping_fee IS '배송비 (>= 0)';
COMMENT ON COLUMN public.orders.discount_amount IS '할인 금액 (>= 0)';
COMMENT ON COLUMN public.orders.currency IS '통화 (기본값: USD)';
COMMENT ON COLUMN public.orders.payment_status IS '결제 상태 (requested, success, failed, refund_requested, refund_completed)';
COMMENT ON COLUMN public.orders.contact_name IS '연락처 이름';
COMMENT ON COLUMN public.orders.contact_phone IS '연락처 전화번호';
COMMENT ON COLUMN public.orders.contact_email IS '연락처 이메일';
COMMENT ON COLUMN public.orders.shipping_name IS '배송지 수령인 이름';
COMMENT ON COLUMN public.orders.shipping_phone IS '배송지 전화번호';
COMMENT ON COLUMN public.orders.shipping_address_line1 IS '배송지 주소 1';
COMMENT ON COLUMN public.orders.shipping_address_line2 IS '배송지 주소 2';
COMMENT ON COLUMN public.orders.shipping_city IS '배송지 도시';
COMMENT ON COLUMN public.orders.shipping_state IS '배송지 주/도';
COMMENT ON COLUMN public.orders.shipping_zip IS '배송지 우편번호';
COMMENT ON COLUMN public.orders.shipping_country IS '배송지 국가';
COMMENT ON COLUMN public.orders.toss_order_id IS '토스페이먼츠 주문 ID';
COMMENT ON COLUMN public.orders.created_at IS '생성 일시';
COMMENT ON COLUMN public.orders.updated_at IS '수정 일시';
COMMENT ON COLUMN public.orders.paid_at IS '결제 완료 일시';

-- 인덱스
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_toss_order_id ON public.orders(toss_order_id) WHERE toss_order_id IS NOT NULL;

-- ============================================
-- 5. order_items 테이블
-- ============================================

-- 주문 아이템 테이블
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
    unit_sale_price NUMERIC CHECK (unit_sale_price >= 0),
    product_name TEXT,
    product_image_url TEXT,
    line_subtotal NUMERIC NOT NULL DEFAULT 0 CHECK (line_subtotal >= 0)
);

COMMENT ON TABLE public.order_items IS '주문 아이템 테이블';
COMMENT ON COLUMN public.order_items.id IS '주문 아이템 고유 ID';
COMMENT ON COLUMN public.order_items.order_id IS '주문 ID';
COMMENT ON COLUMN public.order_items.product_id IS '상품 ID';
COMMENT ON COLUMN public.order_items.quantity IS '주문 수량 (> 0)';
COMMENT ON COLUMN public.order_items.unit_price IS '단가 (>= 0)';
COMMENT ON COLUMN public.order_items.unit_sale_price IS '할인 단가 (>= 0)';
COMMENT ON COLUMN public.order_items.product_name IS '주문 시점 상품명 (스냅샷)';
COMMENT ON COLUMN public.order_items.product_image_url IS '주문 시점 상품 이미지 URL (스냅샷)';
COMMENT ON COLUMN public.order_items.line_subtotal IS '라인 소계 (>= 0)';

-- 인덱스
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- ============================================
-- 6. payments 테이블
-- ============================================

-- 결제 정보 테이블
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'mock',
    method TEXT NOT NULL DEFAULT 'card',
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
    transaction_id TEXT,
    payment_key TEXT,
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    approved_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE public.payments IS '결제 정보 테이블';
COMMENT ON COLUMN public.payments.id IS '결제 고유 ID';
COMMENT ON COLUMN public.payments.order_id IS '주문 ID';
COMMENT ON COLUMN public.payments.user_id IS '사용자 ID';
COMMENT ON COLUMN public.payments.provider IS '결제 제공자 (기본값: mock)';
COMMENT ON COLUMN public.payments.method IS '결제 수단 (기본값: card)';
COMMENT ON COLUMN public.payments.amount IS '결제 금액 (>= 0)';
COMMENT ON COLUMN public.payments.currency IS '통화 (기본값: USD)';
COMMENT ON COLUMN public.payments.status IS '결제 상태 (pending, succeeded, failed, cancelled)';
COMMENT ON COLUMN public.payments.transaction_id IS '거래 ID';
COMMENT ON COLUMN public.payments.payment_key IS '결제 키';
COMMENT ON COLUMN public.payments.raw_payload IS '원본 결제 응답 데이터 (JSON)';
COMMENT ON COLUMN public.payments.created_at IS '생성 일시';
COMMENT ON COLUMN public.payments.approved_at IS '승인 일시';

-- 인덱스
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_transaction_id ON public.payments(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX idx_payments_payment_key ON public.payments(payment_key) WHERE payment_key IS NOT NULL;

-- ============================================
-- 7. reviews 테이블
-- ============================================

-- 리뷰 테이블
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reviews IS '리뷰 테이블';
COMMENT ON COLUMN public.reviews.id IS '리뷰 고유 ID';
COMMENT ON COLUMN public.reviews.user_id IS '작성자 사용자 ID';
COMMENT ON COLUMN public.reviews.product_id IS '상품 ID';
COMMENT ON COLUMN public.reviews.rating IS '평점 (1-5)';
COMMENT ON COLUMN public.reviews.content IS '리뷰 내용';
COMMENT ON COLUMN public.reviews.created_at IS '생성 일시';

-- 인덱스
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- ============================================
-- 8. cart_items 테이블
-- ============================================

-- 장바구니 아이템 테이블
-- 참고: user_id는 나중에 auth.users.id로 변경 예정
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.cart_items IS '장바구니 아이템 테이블';
COMMENT ON COLUMN public.cart_items.id IS '장바구니 아이템 고유 ID';
COMMENT ON COLUMN public.cart_items.user_id IS '사용자 ID (향후 auth.users.id로 변경 예정)';
COMMENT ON COLUMN public.cart_items.product_id IS '상품 ID';
COMMENT ON COLUMN public.cart_items.quantity IS '수량 (> 0)';
COMMENT ON COLUMN public.cart_items.created_at IS '생성 일시';
COMMENT ON COLUMN public.cart_items.updated_at IS '수정 일시';

-- 인덱스
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);
-- 사용자별 상품 중복 방지를 위한 유니크 인덱스
CREATE UNIQUE INDEX idx_cart_items_user_product ON public.cart_items(user_id, product_id);

-- ============================================
-- 9. like_items 테이블
-- ============================================

-- 찜하기 아이템 테이블
CREATE TABLE public.like_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

COMMENT ON TABLE public.like_items IS '찜하기 아이템 테이블';
COMMENT ON COLUMN public.like_items.id IS '찜하기 아이템 고유 ID';
COMMENT ON COLUMN public.like_items.user_id IS '사용자 ID';
COMMENT ON COLUMN public.like_items.product_id IS '상품 ID';
COMMENT ON COLUMN public.like_items.created_at IS '생성 일시';

-- 인덱스
CREATE INDEX idx_like_items_user_id ON public.like_items(user_id);
CREATE INDEX idx_like_items_product_id ON public.like_items(product_id);

-- ============================================
-- 10. mcp_settings 테이블
-- ============================================

-- MCP 설정 테이블
CREATE TABLE public.mcp_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slack_enabled BOOLEAN NOT NULL DEFAULT false,
    notion_enabled BOOLEAN NOT NULL DEFAULT false,
    notion_url TEXT,
    notion_report_per_payment BOOLEAN NOT NULL DEFAULT false,
    notion_report_monthly_manual BOOLEAN NOT NULL DEFAULT false,
    notion_report_monthly_auto BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.mcp_settings IS 'MCP 설정 테이블';
COMMENT ON COLUMN public.mcp_settings.id IS '설정 고유 ID';
COMMENT ON COLUMN public.mcp_settings.slack_enabled IS 'Slack 연동 활성화 여부';
COMMENT ON COLUMN public.mcp_settings.notion_enabled IS 'Notion 연동 활성화 여부';
COMMENT ON COLUMN public.mcp_settings.notion_url IS 'Notion URL';
COMMENT ON COLUMN public.mcp_settings.notion_report_per_payment IS '결제별 Notion 리포트 생성 여부';
COMMENT ON COLUMN public.mcp_settings.notion_report_monthly_manual IS '월별 수동 Notion 리포트 생성 여부';
COMMENT ON COLUMN public.mcp_settings.notion_report_monthly_auto IS '월별 자동 Notion 리포트 생성 여부';
COMMENT ON COLUMN public.mcp_settings.created_at IS '생성 일시';
COMMENT ON COLUMN public.mcp_settings.updated_at IS '수정 일시';

-- ============================================
-- 11. updated_at 자동 업데이트 함수 및 트리거
-- ============================================

-- updated_at 컬럼을 자동으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 각 테이블에 updated_at 트리거 설정
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mcp_settings_updated_at
    BEFORE UPDATE ON public.mcp_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

