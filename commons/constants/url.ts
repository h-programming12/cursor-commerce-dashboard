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
  REVIEWS: "/account/reviews",
  WISHLIST: "/account/wishlist",
  ORDERS: "/account/orders",
  ORDER_DETAIL: (orderId: string) => `/account/orders/${orderId}`,
} as const;

// ============================================
// 관리자 전용 페이지 URL
// ============================================
export const ADMIN_URLS = {
  DASHBOARD: "/admin",
  SETTINGS: "/admin/settings",
  PRODUCTS: "/admin/products",
  NEW_PRODUCT: "/admin/products/new",
  ORDERS: "/admin/orders",
  USERS: "/admin/users",
  ADMINS: "/admin/admin_users",
  PAYMENTS: "/admin/payments",
  REVIEWS: "/admin/reviews",
} as const;

export function getAdminUserDetailUrl(userId: string): string {
  return `${ADMIN_URLS.USERS}/${userId}`;
}
export function getAdminAdminDetailUrl(adminId: string): string {
  return `${ADMIN_URLS.ADMINS}/${adminId}`;
}
export function getAdminPaymentDetailUrl(paymentId: string): string {
  return `${ADMIN_URLS.PAYMENTS}/${paymentId}`;
}
export function getAdminOrderDetailUrl(orderId: string): string {
  return `${ADMIN_URLS.ORDERS}/${orderId}`;
}
export function getAdminProductDetailUrl(productId: string): string {
  return `${ADMIN_URLS.PRODUCTS}/${productId}`;
}
export function getAdminReviewDetailUrl(reviewId: string): string {
  return `${ADMIN_URLS.REVIEWS}/${reviewId}`;
}

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
  [ACCOUNT_URLS.REVIEWS]: {
    path: ACCOUNT_URLS.REVIEWS,
    access: "authenticated",
    name: "리뷰 목록",
    description: "마이페이지 리뷰 목록",
  },
  [ACCOUNT_URLS.WISHLIST]: {
    path: ACCOUNT_URLS.WISHLIST,
    access: "authenticated",
    name: "찜 목록",
    description: "마이페이지 찜한 상품 목록",
  },
  [ACCOUNT_URLS.ORDERS]: {
    path: ACCOUNT_URLS.ORDERS,
    access: "authenticated",
    name: "주문 목록",
    description: "마이페이지 주문 목록",
  },

  // 관리자 전용 페이지
  [ADMIN_URLS.DASHBOARD]: {
    path: ADMIN_URLS.DASHBOARD,
    access: "admin",
    name: "관리자 대시보드",
    description: "관리자 대시보드 페이지",
  },
  [ADMIN_URLS.SETTINGS]: {
    path: ADMIN_URLS.SETTINGS,
    access: "admin",
    name: "설정",
    description: "관리자 설정 페이지",
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
  [ADMIN_URLS.USERS]: {
    path: ADMIN_URLS.USERS,
    access: "admin",
    name: "유저 관리",
    description: "관리자 유저 목록 페이지",
  },
  [ADMIN_URLS.ADMINS]: {
    path: ADMIN_URLS.ADMINS,
    access: "admin",
    name: "관리자 계정",
    description: "관리자 계정 목록 페이지",
  },
  [ADMIN_URLS.PAYMENTS]: {
    path: ADMIN_URLS.PAYMENTS,
    access: "admin",
    name: "결제 관리",
    description: "관리자 결제 목록 페이지",
  },
  [ADMIN_URLS.REVIEWS]: {
    path: ADMIN_URLS.REVIEWS,
    access: "admin",
    name: "리뷰 관리",
    description: "관리자 리뷰 목록 페이지",
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

  // 동적 라우트 매칭 (예: /account/orders/[orderId])
  if (path.startsWith("/account/orders/") && path !== "/account/orders") {
    return {
      path,
      access: "authenticated" as const,
      name: "주문 상세",
      description: "마이페이지 주문 상세 페이지",
    };
  }

  // 동적 라우트 매칭 (예: /admin/orders/[orderId])
  if (path.startsWith("/admin/orders/") && path !== "/admin/orders") {
    return {
      path,
      access: "admin" as const,
      name: "주문 상세",
      description: "관리자 주문 상세 페이지",
    };
  }
  if (path.startsWith("/admin/reviews/") && path !== "/admin/reviews") {
    return {
      path,
      access: "admin" as const,
      name: "리뷰 상세",
      description: "관리자 리뷰 상세 페이지",
    };
  }
  if (path.startsWith("/admin/users/") && path !== "/admin/users") {
    return {
      path,
      access: "admin" as const,
      name: "유저 상세",
      description: "관리자 유저 상세 페이지",
    };
  }
  if (path.startsWith("/admin/admin_users/") && path !== "/admin/admin_users") {
    return {
      path,
      access: "admin" as const,
      name: "관리자 상세",
      description: "관리자 계정 상세 페이지",
    };
  }
  if (path.startsWith("/admin/payments/") && path !== "/admin/payments") {
    return {
      path,
      access: "admin" as const,
      name: "결제 상세",
      description: "관리자 결제 상세 페이지",
    };
  }
  if (path.startsWith("/admin/products/") && path !== "/admin/products") {
    return {
      path,
      access: "admin" as const,
      name: "상품 상세",
      description: "관리자 상품 상세 페이지",
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
