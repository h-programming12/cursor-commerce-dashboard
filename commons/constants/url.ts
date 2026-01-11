/**
 * URL 상수 정의
 *
 * 프로젝트의 모든 라우트를 중앙에서 관리하며,
 * 접근 권한과 함께 정의합니다.
 */

// ============================================
// 인증 관련 URL
// ============================================
export const AUTH_URLS = {
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const;

// ============================================
// 커머스 공개 페이지 URL
// ============================================
export const COMMERCE_URLS = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (productId: string) => `/products/${productId}`,
} as const;

// ============================================
// 회원 전용 페이지 URL
// ============================================
export const ACCOUNT_URLS = {
  CART: "/cart",
  CHECKOUT: "/checkout",
  ACCOUNT: "/account",
} as const;

// ============================================
// 관리자 전용 페이지 URL
// ============================================
export const ADMIN_URLS = {
  DASHBOARD: "/admin",
  PRODUCTS: "/admin/products",
  ORDERS: "/admin/orders",
} as const;

// ============================================
// 접근 권한 타입
// ============================================
export type RouteAccess = "public" | "authenticated" | "admin";

// ============================================
// 라우트 설정 인터페이스
// ============================================
export interface RouteConfig {
  path: string;
  access: RouteAccess;
  name: string;
  description?: string;
}

// ============================================
// 라우트 설정 맵
// ============================================
export const ROUTE_CONFIG_MAP: Record<string, RouteConfig> = {
  // 인증
  [AUTH_URLS.LOGIN]: {
    path: AUTH_URLS.LOGIN,
    access: "public",
    name: "로그인",
    description: "사용자 로그인 페이지",
  },
  [AUTH_URLS.SIGNUP]: {
    path: AUTH_URLS.SIGNUP,
    access: "public",
    name: "회원가입",
    description: "신규 회원가입 페이지",
  },

  // 커머스 공개 페이지
  [COMMERCE_URLS.HOME]: {
    path: COMMERCE_URLS.HOME,
    access: "public",
    name: "홈",
    description: "커머스 메인 랜딩 페이지",
  },
  [COMMERCE_URLS.PRODUCTS]: {
    path: COMMERCE_URLS.PRODUCTS,
    access: "public",
    name: "상품 목록",
    description: "전체 상품 목록 페이지",
  },

  // 회원 전용 페이지
  [ACCOUNT_URLS.CART]: {
    path: ACCOUNT_URLS.CART,
    access: "authenticated",
    name: "장바구니",
    description: "장바구니 페이지",
  },
  [ACCOUNT_URLS.CHECKOUT]: {
    path: ACCOUNT_URLS.CHECKOUT,
    access: "authenticated",
    name: "결제",
    description: "결제 페이지",
  },
  [ACCOUNT_URLS.ACCOUNT]: {
    path: ACCOUNT_URLS.ACCOUNT,
    access: "authenticated",
    name: "계정 관리",
    description: "계정 정보 관리 페이지",
  },

  // 관리자 전용 페이지
  [ADMIN_URLS.DASHBOARD]: {
    path: ADMIN_URLS.DASHBOARD,
    access: "admin",
    name: "관리자 대시보드",
    description: "관리자 대시보드 페이지",
  },
  [ADMIN_URLS.PRODUCTS]: {
    path: ADMIN_URLS.PRODUCTS,
    access: "admin",
    name: "상품 관리",
    description: "관리자 상품 관리 페이지",
  },
  [ADMIN_URLS.ORDERS]: {
    path: ADMIN_URLS.ORDERS,
    access: "admin",
    name: "주문 관리",
    description: "관리자 주문 관리 페이지",
  },
};

// ============================================
// 헬퍼 함수: 동적 라우트 설정 추가
// ============================================
/**
 * 동적 라우트의 설정을 가져옵니다.
 * @param path - 라우트 경로 (예: "/products/123")
 * @returns RouteConfig 또는 undefined
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  // 정확한 매칭
  if (ROUTE_CONFIG_MAP[path]) {
    return ROUTE_CONFIG_MAP[path];
  }

  // 동적 라우트 매칭 (예: /products/[productId])
  if (path.startsWith("/products/") && path !== "/products") {
    return {
      path,
      access: "public" as const,
      name: "상품 상세",
      description: "상품 상세 정보 페이지",
    };
  }

  // 동적 라우트 매칭 (예: /admin/orders/[orderId] - 향후 확장 가능)
  if (path.startsWith("/admin/orders/") && path !== "/admin/orders") {
    return {
      path,
      access: "admin" as const,
      name: "주문 상세",
      description: "관리자 주문 상세 페이지",
    };
  }

  return undefined;
}

/**
 * 라우트 접근 권한을 확인합니다.
 * @param path - 라우트 경로
 * @param isAuthenticated - 로그인 여부
 * @param isAdmin - 관리자 여부
 * @returns 접근 가능 여부
 */
export function canAccessRoute(
  path: string,
  isAuthenticated: boolean,
  isAdmin: boolean
): boolean {
  const config = getRouteConfig(path);
  if (!config) {
    return false;
  }

  switch (config.access) {
    case "public":
      return true;
    case "authenticated":
      return isAuthenticated;
    case "admin":
      return isAdmin;
    default:
      return false;
  }
}
