"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/browser";
import { Input, Button } from "@/components/ui";
import { commerceColors } from "@/commons/constants/color";
import { commerceTypography } from "@/commons/constants/typography";
import type { Database } from "@/types/supabase";

export interface AccountDetailsFormProps {
  initialDisplayName?: string | null;
  email?: string | null;
  className?: string;
}

export function AccountDetailsForm({
  initialDisplayName,
  email,
  className,
}: AccountDetailsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [displayName, setDisplayName] = useState(initialDisplayName || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const validate = useCallback((): boolean => {
    const next: Record<string, string> = {};

    if (newPassword || repeatPassword || oldPassword) {
      if (!oldPassword) {
        next.oldPassword = "기존 비밀번호를 입력해 주세요.";
      }
      if (!newPassword) {
        next.newPassword = "새 비밀번호를 입력해 주세요.";
      } else if (newPassword.length < 6) {
        next.newPassword = "비밀번호는 최소 6자 이상이어야 합니다.";
      }
      if (!repeatPassword) {
        next.repeatPassword = "새 비밀번호를 다시 입력해 주세요.";
      } else if (newPassword !== repeatPassword) {
        next.repeatPassword = "비밀번호가 일치하지 않습니다.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }, [oldPassword, newPassword, repeatPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      // Display name 업데이트
      if (displayName !== initialDisplayName) {
        type UsersUpdate = Database["public"]["Tables"]["users"]["Update"];
        const updateData: UsersUpdate = {
          display_name: displayName || null,
        };
        // Supabase 타입 추론 이슈로 인한 타입 단언 필요
        // update 메서드의 타입 추론이 제대로 작동하지 않아 unknown을 통해 타입 단언
        const usersTable = supabase.from("users") as unknown as {
          update: (values: UsersUpdate) => {
            eq: (
              column: string,
              value: string
            ) => Promise<{ error: { message: string } | null }>;
          };
        };
        const { error: updateError } = await usersTable
          .update(updateData)
          .eq("id", user.id);

        if (updateError) {
          toast.error("프로필 업데이트 중 오류가 발생했습니다.");
          return;
        }
      }

      // 비밀번호 변경
      if (newPassword && oldPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (passwordError) {
          toast.error(
            passwordError.message || "비밀번호 변경 중 오류가 발생했습니다."
          );
          return;
        }
      }

      toast.success("변경사항이 저장되었습니다.");
      router.refresh();

      // 비밀번호 필드 초기화
      setOldPassword("");
      setNewPassword("");
      setRepeatPassword("");
    } catch {
      toast.error("변경사항 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Account Details Section */}
      <div className="mb-10">
        <h2
          className="mb-6"
          style={{
            fontSize: "20px",
            lineHeight: "32px",
            fontFamily: commerceTypography.body["1"].fontFamily,
            fontWeight: 600,
            color: commerceColors.text.primary,
          }}
        >
          Account Details
        </h2>

        {/* Display Name */}
        <div className="mb-6">
          <div style={{ width: "707px" }}>
            <Input
              variant="commerce"
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              error={!!errors.displayName}
              helperText={
                errors.displayName ||
                "This will be how your name will be displayed in the account section and in reviews"
              }
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <div style={{ width: "707px" }}>
            <Input
              variant="commerce"
              label="Email *"
              value={email || ""}
              className="p-2 rounded-md"
              disabled
              style={{
                backgroundColor: "#E8ECEF",
                opacity: 0.75,
              }}
            />
          </div>
        </div>
      </div>

      {/* Password Section */}
      <div>
        <h2
          className="mb-6"
          style={{
            fontSize: "20px",
            lineHeight: "32px",
            fontFamily: commerceTypography.body["1"].fontFamily,
            fontWeight: 600,
            color: commerceColors.text.primary,
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
            error={!!errors.oldPassword}
            helperText={errors.oldPassword}
          />
        </div>

        {/* New Password */}
        <div className="mb-6">
          <Input
            variant="commerce"
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            error={!!errors.newPassword}
            helperText={errors.newPassword}
          />
        </div>

        {/* Repeat New Password */}
        <div className="mb-6">
          <Input
            variant="commerce"
            type="password"
            label="REPEAT NEW PASSWORD"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            placeholder="Repeat new password"
            error={!!errors.repeatPassword}
            helperText={errors.repeatPassword}
          />
        </div>

        {/* Save Changes Button */}
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="rounded-md cursor-pointer"
          style={{
            width: "183px",
            height: "52px",
            fontSize: "16px",
            lineHeight: "28px",
            letterSpacing: "-0.4px",
            fontFamily: commerceTypography.body["2"].fontFamily,
            fontWeight: 500,
          }}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}
