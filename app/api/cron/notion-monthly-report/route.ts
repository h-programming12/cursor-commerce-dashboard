import { NextRequest, NextResponse } from "next/server";
import { createMonthlyReport } from "@/lib/notion/create-report";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

type McpCronRow = {
  notion_enabled: boolean;
  notion_report_monthly_auto: boolean;
};

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { success: false, error: "CRON_SECRET이 설정되어 있지 않습니다." },
      { status: 500 }
    );
  }

  const auth = request.headers.get("authorization")?.trim() ?? "";
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();
  const { data: settings, error } = await supabase
    .from("mcp_settings")
    .select("notion_enabled, notion_report_monthly_auto")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[notion] cron: mcp_settings 조회 실패:", error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  const row = settings as McpCronRow | null;
  if (!row?.notion_enabled || !row?.notion_report_monthly_auto) {
    return NextResponse.json({ message: "disabled" });
  }

  const now = new Date();
  const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfLastMonth = new Date(firstThisMonth.getTime() - 1);
  const firstDayOfLastMonth = new Date(
    lastDayOfLastMonth.getFullYear(),
    lastDayOfLastMonth.getMonth(),
    1
  );
  const startDate = firstDayOfLastMonth.toISOString().split("T")[0];
  const endDate = lastDayOfLastMonth.toISOString().split("T")[0];
  const year = lastDayOfLastMonth.getFullYear();
  const month = lastDayOfLastMonth.getMonth() + 1;
  const title = `월간 리포트 - ${year}년 ${month}월`;

  console.warn("[notion] cron: 월간 리포트 생성 시작", {
    startDate,
    endDate,
    title,
  });

  const result = await createMonthlyReport(startDate, endDate, title);
  if (!result.success) {
    console.error("[notion] cron: 월간 리포트 생성 실패:", result.error);
    return NextResponse.json({
      success: false,
      error: result.error ?? "리포트 생성 실패",
    });
  }

  console.warn("[notion] cron: 월간 리포트 생성 완료", result.pageUrl);
  return NextResponse.json({
    success: true,
    pageUrl: result.pageUrl,
  });
}
