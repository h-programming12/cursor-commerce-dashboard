"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/commons/hooks/useAuth";
import { Button } from "@/components/ui";
import { AUTH_URLS } from "@/commons/constants/url";

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push(AUTH_URLS.LOGIN);
    router.refresh();
  };

  return (
    <div>
      <h1>계정 관리 페이지</h1>
      {isAuthenticated && user && (
        <>
          <p>{user.email}</p>
          <Button type="button" onClick={handleSignOut}>
            로그아웃
          </Button>
        </>
      )}
      {!isAuthenticated && <p>로그인한 사용자만 이용할 수 있습니다.</p>}
    </div>
  );
}
