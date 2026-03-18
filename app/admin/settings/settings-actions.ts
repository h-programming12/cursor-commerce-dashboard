"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminAccess } from "@/lib/auth/admin";
import { ADMIN_URLS } from "@/commons/constants/url";
import type { McpSettings } from "@/app/admin/queries";

export interface UpdateMcpSettingsResult {
  success: boolean;
  error?: string;
  data?: McpSettings;
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
