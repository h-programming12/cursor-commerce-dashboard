import {
  ACCOUNT_URLS,
  AUTH_URLS,
  COMMERCE_URLS,
} from "../../commons/constants/url";

export const URLS = {
  AUTH: AUTH_URLS,
  COMMERCE: COMMERCE_URLS,
  ACCOUNT: ACCOUNT_URLS,
} as const;

export interface TestUserCredentials {
  email: string;
  password: string;
}

function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`환경 변수 ${name}가 설정되어 있지 않습니다.`);
  }
  return value;
}

/** process.env `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` (접근 시 읽음) */
export const TEST_USER: TestUserCredentials = {
  get email() {
    return readRequiredEnv("TEST_USER_EMAIL");
  },
  get password() {
    return readRequiredEnv("TEST_USER_PASSWORD");
  },
};
