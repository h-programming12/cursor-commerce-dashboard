"use client";

import React, { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiMessageCircle, FiFileText } from "react-icons/fi";
import { AdminSettingsCard } from "@/components/admin/AdminSettingsCard/AdminSettingsCard";
import { AdminToggle } from "@/components/admin/AdminToggle/AdminToggle";
import type { McpSettings } from "@/app/admin/queries";
import { updateMcpSettings } from "./settings-actions";

interface SettingsClientProps {
  settings: McpSettings;
}

export const SettingsClient: React.FC<SettingsClientProps> = ({ settings }) => {
  const [localSettings, setLocalSettings] = useState<McpSettings>(settings);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleUpdate = useCallback(
    (updates: Partial<McpSettings>) => {
      setLocalSettings((prev) => ({
        ...prev,
        ...updates,
      }));

      startTransition(async () => {
        const result = await updateMcpSettings(updates);
        if (!result.success) {
          // 실패 시 최소한 새로고침으로 서버 상태와 동기화
          router.refresh();
        } else if (result.data) {
          setLocalSettings(result.data);
        }
        router.refresh();
      });
    },
    [router]
  );

  const handleToggle = (key: keyof McpSettings) => (checked: boolean) => {
    handleUpdate({ [key]: checked } as Partial<McpSettings>);
  };

  const handleNotionUrlBlur: React.FocusEventHandler<HTMLInputElement> = (
    event
  ) => {
    const value = event.target.value.trim();
    handleUpdate({ notion_url: value || null });
  };

  const disabledButtonStyle: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: "var(--admin-radius-lg)",
    border: "1px solid var(--admin-border-card)",
    fontSize: "var(--admin-text-sm)",
    lineHeight: "20px",
    fontFamily: "var(--admin-font-inter)",
    fontWeight: "var(--admin-font-medium)",
    color: "var(--admin-text-primary)",
    backgroundColor: "var(--admin-background-default)",
    opacity: 0.5,
    cursor: "not-allowed",
  };

  const inputBaseStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "var(--admin-radius-lg)",
    border: "1px solid var(--admin-border-card)",
    fontSize: "var(--admin-text-sm)",
    lineHeight: "20px",
    fontFamily: "var(--admin-font-inter)",
    color: "var(--admin-text-primary)",
    outline: "none",
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminSettingsCard
        title="Slack 실시간 결제 알림"
        description="실시간 결제 알림을 Slack으로 받습니다"
        icon={<FiMessageCircle />}
      >
        <div className="flex items-center justify-between mb-4">
          <h1
            style={{
              fontSize: "var(--admin-text-lg)",
              lineHeight: "24px",
              fontFamily: "var(--admin-font-poppins)",
              fontWeight: "var(--admin-font-semibold)",
              color: "var(--admin-text-secondary)",
            }}
          >
            Slack 연동 상태
          </h1>
          <AdminToggle
            checked={localSettings.slack_enabled}
            onChange={handleToggle("slack_enabled")}
            disabled={isPending}
          />
        </div>

        <div className="mb-3">
          <label
            className="mb-1 block"
            style={{
              fontSize: "var(--admin-text-sm)",
              lineHeight: "20px",
              fontFamily: "var(--admin-font-inter)",
              color: "var(--admin-text-label)",
            }}
          >
            Channel ID
          </label>
          <input
            type="text"
            readOnly
            placeholder="#주문-공지"
            style={{
              ...inputBaseStyle,
              backgroundColor: "var(--admin-background-light)",
              cursor: "not-allowed",
            }}
            aria-label="Slack Channel ID (읽기 전용)"
          />
        </div>

        <p
          className="mb-3"
          style={{
            fontSize: "var(--admin-text-xs)",
            lineHeight: "18px",
            fontFamily: "var(--admin-font-inter)",
            color: "var(--admin-text-help)",
          }}
        >
          Slack 워크스페이스 &quot;주문-공지&quot; 채널에 테스트 메시지를
          전송해보세요
        </p>

        <button
          type="button"
          disabled
          style={disabledButtonStyle}
          aria-label="Slack 테스트 메시지 보내기 (준비 중)"
        >
          테스트 메시지 보내기
        </button>
      </AdminSettingsCard>

      <AdminSettingsCard
        title="Notion 주문 관리 리포트 생성"
        description="주문 관리 리포트를 Notion으로 자동 생성합니다"
        icon={<FiFileText />}
      >
        <div className="flex items-center justify-between mb-4">
          <h1
            style={{
              fontSize: "var(--admin-text-lg)",
              lineHeight: "24px",
              fontFamily: "var(--admin-font-poppins)",
              fontWeight: "var(--admin-font-semibold)",
              color: "var(--admin-text-secondary)",
            }}
          >
            Notion 연동 상태
          </h1>
          <AdminToggle
            checked={localSettings.notion_enabled}
            onChange={handleToggle("notion_enabled")}
            disabled={isPending}
          />
        </div>

        {localSettings.notion_enabled && (
          <div className="flex flex-col gap-4">
            <div>
              <label
                className="mb-1 block"
                style={{
                  fontSize: "var(--admin-text-sm)",
                  lineHeight: "20px",
                  fontFamily: "var(--admin-font-inter)",
                  color: "var(--admin-text-label)",
                }}
              >
                리포트 생성 Parent URL
              </label>
              <input
                type="url"
                defaultValue={localSettings.notion_url ?? ""}
                onBlur={handleNotionUrlBlur}
                placeholder="https://www.notion.so/..."
                style={inputBaseStyle}
                aria-label="Notion 리포트 Parent URL"
              />
              <p
                className="mt-1"
                style={{
                  fontSize: "var(--admin-text-xs)",
                  lineHeight: "18px",
                  fontFamily: "var(--admin-font-inter)",
                  color: "var(--admin-text-help)",
                }}
              >
                이 페이지 아래에 &quot;주문 리포트&quot; 페이지들을 생성합니다.
              </p>
            </div>

            <div>
              <button
                type="button"
                disabled
                style={disabledButtonStyle}
                aria-label="Notion 테스트 리포트 생성하기 (준비 중)"
              >
                테스트 리포트 생성하기
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    style={{
                      fontSize: "var(--admin-text-sm)",
                      lineHeight: "20px",
                      fontFamily: "var(--admin-font-inter)",
                      fontWeight: "var(--admin-font-semibold)",
                      color: "var(--admin-text-primary)",
                    }}
                  >
                    주문 1건당 페이지 생성
                  </p>
                  <p
                    style={{
                      fontSize: "var(--admin-text-xs)",
                      lineHeight: "18px",
                      fontFamily: "var(--admin-font-inter)",
                      color: "var(--admin-text-help)",
                    }}
                  >
                    개별 주문마다 상세 리포트 페이지를 생성합니다.
                  </p>
                </div>
                <AdminToggle
                  checked={localSettings.notion_report_per_payment}
                  onChange={handleToggle("notion_report_per_payment")}
                  disabled={isPending}
                />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    style={{
                      fontSize: "var(--admin-text-sm)",
                      lineHeight: "20px",
                      fontFamily: "var(--admin-font-inter)",
                      fontWeight: "var(--admin-font-semibold)",
                      color: "var(--admin-text-primary)",
                    }}
                  >
                    월별 요약 페이지 수동 생성
                  </p>
                  <p
                    style={{
                      fontSize: "var(--admin-text-xs)",
                      lineHeight: "18px",
                      fontFamily: "var(--admin-font-inter)",
                      color: "var(--admin-text-help)",
                    }}
                  >
                    필요한 시점에 월별 주문 요약 페이지를 직접 생성합니다.
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  style={disabledButtonStyle}
                  aria-label="월별 요약 페이지 수동 생성 (준비 중)"
                >
                  리포트 생성하기
                </button>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    style={{
                      fontSize: "var(--admin-text-sm)",
                      lineHeight: "20px",
                      fontFamily: "var(--admin-font-inter)",
                      fontWeight: "var(--admin-font-semibold)",
                      color: "var(--admin-text-primary)",
                    }}
                  >
                    월별 요약 페이지 자동 생성
                  </p>
                  <p
                    style={{
                      fontSize: "var(--admin-text-xs)",
                      lineHeight: "18px",
                      fontFamily: "var(--admin-font-inter)",
                      color: "var(--admin-text-help)",
                    }}
                  >
                    매월 말에 자동으로 월별 주문 요약 페이지를 생성합니다.
                  </p>
                </div>
                <AdminToggle
                  checked={localSettings.notion_report_monthly_auto}
                  onChange={handleToggle("notion_report_monthly_auto")}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        )}
      </AdminSettingsCard>
    </div>
  );
};
