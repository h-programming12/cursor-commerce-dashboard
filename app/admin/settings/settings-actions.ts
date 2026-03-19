"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/admin";
import { ADMIN_URLS } from "@/commons/constants/url";
import type { McpSettings } from "@/app/admin/queries";
import { getMcpSettings } from "@/app/admin/queries";

export interface UpdateMcpSettingsResult {
  success: boolean;
  error?: string;
  data?: McpSettings;
}

export interface SendSlackTestMessageResult {
  success: boolean;
  message: string;
}

export async function updateMcpSettings(
  updates: Partial<McpSettings>
): Promise<UpdateMcpSettingsResult> {
  await requireAdminAccess();

  const supabase = await createClient();

  const { data: current, error: selectError } = await supabase
    .from("mcp_settings")
    .select(
      "id, slack_enabled, notion_enabled, notion_url, notion_report_per_payment, notion_report_monthly_manual, notion_report_monthly_auto, created_at, updated_at"
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (selectError && selectError.code !== "PGRST116") {
    return {
      success: false,
      error: selectError.message,
    };
  }

  if (!current) {
    const baseInsert = {
      slack_enabled: false,
      notion_enabled: false,
      notion_url: null,
      notion_report_per_payment: false,
      notion_report_monthly_manual: false,
      notion_report_monthly_auto: false,
    };

    const insertPayload = {
      ...baseInsert,
      ...updates,
    };

    const mcpInsertQuery = supabase.from("mcp_settings") as unknown as {
      insert: (values: never) => {
        select: (columns: string) => {
          maybeSingle: () => Promise<{
            data: McpSettings | null;
            error: { message: string } | null;
          }>;
        };
      };
    };

    const { data: inserted, error: insertError } = await mcpInsertQuery
      .insert(insertPayload as never)
      .select(
        "id, slack_enabled, notion_enabled, notion_url, notion_report_per_payment, notion_report_monthly_manual, notion_report_monthly_auto, created_at, updated_at"
      )
      .maybeSingle();

    if (insertError || !inserted) {
      return {
        success: false,
        error: insertError?.message ?? "mcp_settings 생성에 실패했습니다.",
      };
    }

    revalidatePath(ADMIN_URLS.SETTINGS);

    return {
      success: true,
      data: inserted as unknown as McpSettings,
    };
  }

  const mcpUpdateQuery = supabase.from("mcp_settings") as unknown as {
    update: (values: never) => {
      eq: (
        column: string,
        value: string
      ) => {
        select: (columns: string) => {
          maybeSingle: () => Promise<{
            data: McpSettings | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };

  const { data: updated, error: updateError } = await mcpUpdateQuery
    .update(updates as never)
    .eq("id", (current as { id: string }).id)
    .select(
      "id, slack_enabled, notion_enabled, notion_url, notion_report_per_payment, notion_report_monthly_manual, notion_report_monthly_auto, created_at, updated_at"
    )
    .maybeSingle();

  if (updateError || !updated) {
    return {
      success: false,
      error: updateError?.message ?? "mcp_settings 업데이트에 실패했습니다.",
    };
  }

  revalidatePath(ADMIN_URLS.SETTINGS);

  return {
    success: true,
    data: updated as unknown as McpSettings,
  };
}

export async function sendSlackTestMessage(): Promise<SendSlackTestMessageResult> {
  await requireAdminAccess();

  try {
    const settings = await getMcpSettings();
    if (!settings.slack_enabled) {
      return {
        success: false,
        message: "Slack 알림이 비활성화 상태입니다",
      };
    }

    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    const slackChannelId = process.env.SLACK_CHANNEL_ID;

    if (!slackBotToken || !slackChannelId) {
      return {
        success: false,
        message: "Slack 환경변수가 설정되지 않았습니다.",
      };
    }

    const now = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    });

    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${slackBotToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        channel: slackChannelId,
        text: `🔔 [테스트] 커머스 대시보드에서 보낸 테스트 메시지입니다.\n전송 시각: ${now}`,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Slack API 호출에 실패했습니다.",
      };
    }

    const result = (await response.json()) as {
      ok?: boolean;
      error?: string;
    };

    if (!result.ok) {
      return {
        success: false,
        message: result.error ?? "Slack 메시지 전송에 실패했습니다.",
      };
    }

    return {
      success: true,
      message: "✅ 테스트 메시지를 전송했습니다",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Slack 테스트 메시지 전송 중 오류가 발생했습니다.",
    };
  }
}
