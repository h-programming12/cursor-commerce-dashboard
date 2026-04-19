/**
 * 관리자 UI에서 호출: MCP 설정을 읽고 Notion 월간 리포트 페이지를 수동 생성.
 */
import { NextResponse } from "next/server";
import { getMcpSettings } from "@/app/admin/queries";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createMonthlyReport } from "@/lib/notion/create-report";

export async function POST() {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: "관리자 권한이 필요합니다." },
      { status: 403 }
    );
  }

  let settings;
  try {
    settings = await getMcpSettings();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "설정을 불러오지 못했습니다.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }

  if (!settings.notion_enabled) {
    return NextResponse.json(
      { success: false, error: "Notion 연동이 꺼져 있습니다." },
      { status: 400 }
    );
  }

  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  const endDate = end.toISOString().split("T")[0];
  const startDate = start.toISOString().split("T")[0];
  const title = `월간 리포트 (최근 30일) - ${endDate}`;

  console.warn(
    "[notion] 월간 리포트(수동) 요청:",
    JSON.stringify({ startDate, endDate, title })
  );

  const result = await createMonthlyReport(startDate, endDate, title);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error ?? "리포트 생성에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    pageUrl: result.pageUrl,
  });
}
