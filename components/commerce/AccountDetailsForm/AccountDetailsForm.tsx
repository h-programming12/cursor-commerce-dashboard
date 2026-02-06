"use client";

import React, { useState, FormEvent } from "react";
import { cn } from "@/commons/utils/cn";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export interface AccountDetailsFormProps {
  initialDisplayName: string | null;
  email: string;
  className?: string;
}

export const AccountDetailsForm: React.FC<AccountDetailsFormProps> = ({
  initialDisplayName,
  email,
  className,
}) => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // initialDisplayName이 변경되면 상태 업데이트
  React.useEffect(() => {
    setDisplayName(initialDisplayName || "");
  }, [initialDisplayName]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      // Display name 업데이트
      if (displayName !== initialDisplayName) {
        const updatePayload: { display_name: string | null } = {
          display_name: displayName || null,
        };
        const query = supabase.from("users").update(updatePayload as never);
        const { error: updateError } = await query.eq("id", user.id);

        if (updateError) {
          throw updateError;
        }

        // 업데이트 성공 후 즉시 상태 동기화 (서버 새로고침 전에 UI 업데이트)
        // router.refresh()가 서버 컴포넌트를 새로고침하면 useEffect가 새로운 initialDisplayName을 받아 상태를 업데이트합니다
      }

      // 비밀번호 변경 (모든 필드가 입력된 경우만)
      if (oldPassword && newPassword && repeatPassword) {
        if (newPassword !== repeatPassword) {
          throw new Error("새 비밀번호가 일치하지 않습니다.");
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (passwordError) {
          throw passwordError;
        }
      }

      setSuccess(true);
      // 비밀번호 필드 초기화
      setOldPassword("");
      setNewPassword("");
      setRepeatPassword("");

      // 서버 컴포넌트 새로고침으로 최신 데이터 가져오기
      router.refresh();

      // 성공 메시지 표시 후 2초 뒤에 사라지게
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "업데이트 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Account Details Form */}
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: commerceTypography.body["1-semi"].fontSize,
              lineHeight: "32px",
              fontFamily: commerceTypography.body["1-semi"].fontFamily,
              fontWeight: commerceTypography.body["1-semi"].fontWeight,
              color: commerceColors.text.primary,
              marginBottom: "24px",
            }}
          >
            Account Details
          </h2>

          {/* Display Name */}
          <div className="mb-6">
            <Input
              variant="commerce"
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
            />
            <p
              className="mt-1"
              style={{
                fontStyle: "italic",
                fontSize: "12px",
                lineHeight: "20px",
                color: commerceColors.text.tertiary,
                fontFamily: commerceTypography.caption["2"].fontFamily,
                fontWeight: commerceTypography.caption["2"].fontWeight,
              }}
            >
              This will be how your name will be displayed in the account
              section and in reviews
            </p>
          </div>

          {/* Email */}
          <div>
            <Input
              variant="commerce"
              label="Email *"
              value={email}
              className="p-2 rounded-md"
              disabled
              style={{
                backgroundColor: commerceColors.background.light,
                opacity: 0.75,
              }}
            />
          </div>
        </div>

        {/* Password Form */}
        <div style={{ marginTop: "20px" }}>
          <h2
            style={{
              fontSize: commerceTypography.body["1-semi"].fontSize,
              lineHeight: "32px",
              fontFamily: commerceTypography.body["1-semi"].fontFamily,
              fontWeight: commerceTypography.body["1-semi"].fontWeight,
              color: commerceColors.text.primary,
              marginBottom: "24px",
            }}
          >
            Password
          </h2>

          {/* Old Password */}
          <div className="mb-6">
            <Input
              variant="commerce"
              type="password"
              label="Old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Old password"
            />
          </div>

          {/* New Password */}
          <div className="mb-6">
            <Input
              variant="commerce"
              type="password"
              label="new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />
          </div>

          {/* Repeat New Password */}
          <div className="mb-6">
            <Input
              variant="commerce"
              type="password"
              label="rEPEAT NEW PASSWORD"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              placeholder="Repeat new password"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: commerceColors.semantic.error + "20",
              color: commerceColors.semantic.error,
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="p-3 rounded"
            style={{
              backgroundColor: commerceColors.semantic.success + "20",
              color: commerceColors.semantic.success,
            }}
          >
            프로필이 성공적으로 업데이트되었습니다.
          </div>
        )}

        {/* Submit Button */}
        <div style={{ marginTop: "24px" }}>
          <Button
            type="submit"
            variant="primary"
            size="medium"
            isLoading={isLoading}
            disabled={isLoading}
            className="rounded-md"
            style={{
              width: "183px",
              height: "52px",
            }}
          >
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
};
