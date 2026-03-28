"use client";

import React, { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiMessageCircle, FiFileText } from "react-icons/fi";
import { AdminSettingsCard } from "@/components/admin/AdminSettingsCard/AdminSettingsCard";
import { AdminToggle } from "@/components/admin/AdminToggle/AdminToggle";
import type { McpSettings } from "@/app/admin/queries";
import { sendSlackTestMessage, updateMcpSettings } from "./settings-actions";

interface SettingsClientProps {
  settings: McpSettings;
}

export const SettingsClient: React.FC<SettingsClientProps> = ({ settings }) => {
  const [localSettings, setLocalSettings] = useState<McpSettings>(settings);
  const [isPending, startTransition] = useTransition();
  const [isSendingSlackTest, setIsSendingSlackTest] = useState(false);
  const [slackTestResult, setSlackTestResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [notionTestMessage, setNotionTestMessage] = useState("");
  const [isSendingNotionTest, setIsSendingNotionTest] = useState(false);
  const [notionTestResult, setNotionTestResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isCreatingMonthlyNotionReport, setIsCreatingMonthlyNotionReport] =
    useState(false);
  const [monthlyNotionReportResult, setMonthlyNotionReportResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const parentNotionUrlInputRef = useRef<HTMLInputElement>(null);
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

  const activeButtonStyle: React.CSSProperties = {
    ...disabledButtonStyle,
    opacity: 1,
    cursor: "pointer",
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

  const handleSendSlackTestMessage = useCallback(async () => {
    setIsSendingSlackTest(true);
    const result = await sendSlackTestMessage();
    setIsSendingSlackTest(false);

    if (result.success) {
      setSlackTestResult({
        type: "success",
        message: result.message,
      });
    } else {
      setSlackTestResult({
        type: "error",
        message: `❌ 전송 실패: ${result.message}`,
      });
    }

    setTimeout(() => {
      setSlackTestResult(null);
    }, 5000);
  }, []);

  const handleSendNotionTestReport = useCallback(async () => {
    const parentPageUrl =
      parentNotionUrlInputRef.current?.value.trim() ??
      localSettings.notion_url?.trim() ??
      "";
    if (!parentPageUrl) {
      setNotionTestResult({
        type: "error",
        message: "❌ 전송 실패: 리포트 생성 Parent URL을 입력하세요.",
      });
      setTimeout(() => setNotionTestResult(null), 5000);
      return;
    }

    setIsSendingNotionTest(true);
    try {
      const res = await fetch("/api/admin/notion/create-test-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentPageUrl,
          testMessage: notionTestMessage,
        }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        pageUrl?: string;
        error?: string;
      };

      if (data.success && data.pageUrl) {
        setNotionTestResult({
          type: "success",
          message: `생성된 페이지: ${data.pageUrl}`,
        });
        handleUpdate({ notion_url: parentPageUrl });
      } else {
        setNotionTestResult({
          type: "error",
          message: `❌ 전송 실패: ${data.error ?? "알 수 없는 오류"}`,
        });
      }
    } catch {
      setNotionTestResult({
        type: "error",
        message: "❌ 전송 실패: 요청을 처리할 수 없습니다.",
      });
    } finally {
      setIsSendingNotionTest(false);
    }

    setTimeout(() => {
      setNotionTestResult(null);
    }, 5000);
  }, [handleUpdate, localSettings.notion_url, notionTestMessage]);

  const handleCreateMonthlyNotionReport = useCallback(async () => {
    setIsCreatingMonthlyNotionReport(true);
    setMonthlyNotionReportResult(null);
    try {
      const res = await fetch("/api/admin/notion/create-monthly-report", {
        method: "POST",
      });
      const data = (await res.json()) as {
        success?: boolean;
        pageUrl?: string;
        error?: string;
      };
      if (data.success && data.pageUrl) {
        setMonthlyNotionReportResult({
          type: "success",
          message: `생성된 페이지: ${data.pageUrl}`,
        });
      } else {
        setMonthlyNotionReportResult({
          type: "error",
          message: `❌ 실패: ${data.error ?? "알 수 없는 오류"}`,
        });
      }
    } catch {
      setMonthlyNotionReportResult({
        type: "error",
        message: "❌ 실패: 요청을 처리할 수 없습니다.",
      });
    } finally {
      setIsCreatingMonthlyNotionReport(false);
    }
    setTimeout(() => setMonthlyNotionReportResult(null), 8000);
  }, []);

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
            placeholder="#전체-공지-알림"
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
          Slack 워크스페이스 &quot;전체-공지-알림&quot; 채널에 테스트 메시지를
          전송해보세요
        </p>

        <button
          type="button"
          disabled={!localSettings.slack_enabled || isSendingSlackTest}
          onClick={handleSendSlackTestMessage}
          style={
            !localSettings.slack_enabled || isSendingSlackTest
              ? disabledButtonStyle
              : activeButtonStyle
          }
          aria-label="Slack 테스트 메시지 보내기"
        >
          {isSendingSlackTest ? "전송 중..." : "테스트 메시지 보내기"}
        </button>
        {slackTestResult && (
          <p
            className="mt-2"
            style={{
              fontSize: "var(--admin-text-xs)",
              lineHeight: "18px",
              fontFamily: "var(--admin-font-inter)",
              color:
                slackTestResult.type === "success"
                  ? "var(--admin-semantic-success)"
                  : "var(--admin-semantic-error)",
            }}
          >
            {slackTestResult.message}
          </p>
        )}
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
                ref={parentNotionUrlInputRef}
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
              <label
                className="mb-1 block"
                style={{
                  fontSize: "var(--admin-text-sm)",
                  lineHeight: "20px",
                  fontFamily: "var(--admin-font-inter)",
                  color: "var(--admin-text-label)",
                }}
              >
                테스트 리포트 본문
              </label>
              <textarea
                value={notionTestMessage}
                onChange={(e) => setNotionTestMessage(e.target.value)}
                rows={5}
                placeholder="테스트로 남길 메시지를 입력하세요 (선택)"
                style={{
                  ...inputBaseStyle,
                  minHeight: "120px",
                  resize: "vertical",
                }}
                aria-label="Notion 테스트 리포트 본문"
              />
            </div>

            <div>
              <button
                type="button"
                disabled={!localSettings.notion_enabled || isSendingNotionTest}
                onClick={handleSendNotionTestReport}
                style={
                  !localSettings.notion_enabled || isSendingNotionTest
                    ? disabledButtonStyle
                    : activeButtonStyle
                }
                aria-label="Notion 테스트 리포트 생성하기"
              >
                {isSendingNotionTest ? "생성 중..." : "테스트 리포트 생성하기"}
              </button>
              {notionTestResult && (
                <p
                  className="mt-2"
                  style={{
                    fontSize: "var(--admin-text-xs)",
                    lineHeight: "18px",
                    fontFamily: "var(--admin-font-inter)",
                    color:
                      notionTestResult.type === "success"
                        ? "var(--admin-semantic-success)"
                        : "var(--admin-semantic-error)",
                  }}
                >
                  {notionTestResult.message}
                </p>
              )}
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
                      필요한 시점에 최근 30일 기준 월간 요약 페이지를
                      생성합니다.
                    </p>
                  </div>
                  <AdminToggle
                    checked={localSettings.notion_report_monthly_manual}
                    onChange={handleToggle("notion_report_monthly_manual")}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    disabled={
                      !localSettings.notion_report_monthly_manual ||
                      !localSettings.notion_url?.trim() ||
                      isPending ||
                      isCreatingMonthlyNotionReport
                    }
                    onClick={handleCreateMonthlyNotionReport}
                    style={
                      !localSettings.notion_report_monthly_manual ||
                      !localSettings.notion_url?.trim() ||
                      isPending ||
                      isCreatingMonthlyNotionReport
                        ? disabledButtonStyle
                        : activeButtonStyle
                    }
                    aria-label="최근 30일 월간 Notion 리포트 생성"
                  >
                    {isCreatingMonthlyNotionReport
                      ? "생성 중..."
                      : "리포트 생성하기"}
                  </button>
                  {monthlyNotionReportResult && (
                    <p
                      className="mt-2"
                      style={{
                        fontSize: "var(--admin-text-xs)",
                        lineHeight: "18px",
                        fontFamily: "var(--admin-font-inter)",
                        color:
                          monthlyNotionReportResult.type === "success"
                            ? "var(--admin-semantic-success)"
                            : "var(--admin-semantic-error)",
                      }}
                    >
                      {monthlyNotionReportResult.message}
                    </p>
                  )}
                </div>
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
