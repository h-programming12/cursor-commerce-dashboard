import type { BlockObjectRequest } from "@notionhq/client";
import { getNotionClient } from "@/lib/notion/client";
import { extractPageId, formatPageUrl } from "@/lib/notion/utils";
import {
  getMonthlyReportData,
  getOrderReportData,
  type MonthlyReportData,
  type OrderReportData,
} from "@/lib/notion/report-queries";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

const NOTION_RICH_TEXT_MAX = 2000;
const NOTION_APPEND_CHUNK = 100;

type NotionMcpRow = {
  notion_enabled: boolean;
  notion_url: string | null;
  notion_report_per_payment: boolean;
  notion_report_monthly_auto: boolean;
};

function truncateNotionText(text: string, max = NOTION_RICH_TEXT_MAX): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function makeHeading(text: string): BlockObjectRequest {
  return {
    type: "heading_2",
    heading_2: {
      rich_text: [
        {
          type: "text",
          text: { content: truncateNotionText(text) },
        },
      ],
    },
  };
}

export function makeBullet(text: string): BlockObjectRequest {
  return {
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: truncateNotionText(text) || " " },
        },
      ],
    },
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

async function fetchNotionMcpSettings(): Promise<NotionMcpRow | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("mcp_settings")
    .select(
      "notion_enabled, notion_url, notion_report_per_payment, notion_report_monthly_auto"
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }
  return data as NotionMcpRow;
}

async function appendBlocksInChunks(
  pageId: string,
  blocks: BlockObjectRequest[]
): Promise<void> {
  if (blocks.length === 0) return;
  const client = getNotionClient();
  for (let i = 0; i < blocks.length; i += NOTION_APPEND_CHUNK) {
    const slice = blocks.slice(i, i + NOTION_APPEND_CHUNK);
    await client.blocks.children.append({
      block_id: pageId,
      children: slice,
    });
  }
}

async function createPageWithBlocks(
  parentPageId: string,
  title: string,
  blocks: BlockObjectRequest[]
): Promise<{ id: string }> {
  const client = getNotionClient();
  const safeTitle = truncateNotionText(title, NOTION_RICH_TEXT_MAX);
  const first = blocks.slice(0, NOTION_APPEND_CHUNK);
  const rest = blocks.slice(NOTION_APPEND_CHUNK);

  const response = await client.pages.create({
    parent: { page_id: parentPageId },
    properties: {
      title: {
        title: [{ type: "text", text: { content: safeTitle } }],
        type: "title",
      },
    },
    children: first,
  });

  if (rest.length > 0) {
    await appendBlocksInChunks(response.id, rest);
  }

  return { id: response.id };
}

function buildMonthlyReportBlocks(
  startDate: string,
  endDate: string,
  data: MonthlyReportData
): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = [];

  blocks.push(makeHeading("📊 월간 요약"));
  blocks.push(
    makeBullet(`기간: ${startDate} ~ ${endDate}`),
    makeBullet(`총 주문 수: ${data.totalOrders}건`),
    makeBullet(`총 매출: ${formatCurrency(data.totalRevenue)}`),
    makeBullet(`평균 주문 금액: ${formatCurrency(data.avgOrderAmount)}`)
  );

  blocks.push(makeHeading("📈 일별 매출 추이"));
  const topDays = [...data.dailySales]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  if (topDays.length === 0) {
    blocks.push(makeBullet("데이터 없음"));
  } else {
    for (const d of topDays) {
      blocks.push(
        makeBullet(
          `${d.date}: ${d.orders}건, ${formatCurrency(
            d.revenue
          )} (매출 기준 상위)`
        )
      );
    }
  }

  blocks.push(makeHeading("🏆 베스트셀러 Top 10"));
  const topProducts = data.productSales.slice(0, 10);
  if (topProducts.length === 0) {
    blocks.push(makeBullet("데이터 없음"));
  } else {
    for (const p of topProducts) {
      blocks.push(
        makeBullet(
          `${p.productName}: ${p.quantity}개, ${formatCurrency(p.revenue)}`
        )
      );
    }
  }

  blocks.push(makeHeading("💰 결제 수단별 통계"));
  const methodEntries = Object.entries(data.paymentMethods);
  if (methodEntries.length === 0) {
    blocks.push(makeBullet("데이터 없음"));
  } else {
    for (const [method, stat] of methodEntries) {
      blocks.push(
        makeBullet(
          `${method}: ${stat.count}건, ${formatCurrency(stat.revenue)}`
        )
      );
    }
  }

  blocks.push(makeHeading("📋 주문 상태별 통계"));
  const statusEntries = Object.entries(data.orderStatuses);
  if (statusEntries.length === 0) {
    blocks.push(makeBullet("데이터 없음"));
  } else {
    for (const [status, count] of statusEntries) {
      blocks.push(makeBullet(`${status}: ${count}건`));
    }
  }

  return blocks;
}

function buildOrderReportBlocks(data: OrderReportData): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = [];

  blocks.push(makeHeading("👤 주문자 정보"));
  blocks.push(
    makeBullet(`주문 ID: ${data.orderId}`),
    makeBullet(`이름: ${data.customerName ?? "—"}`),
    makeBullet(`이메일: ${data.customerEmail ?? "—"}`),
    makeBullet(`전화: ${data.customerPhone ?? "—"}`),
    makeBullet(`주문 상태: ${data.status}`),
    makeBullet(`결제 상태: ${data.paymentStatus}`),
    makeBullet(`주문일: ${data.createdAt ?? "—"}`),
    makeBullet(`주문 합계: ${formatCurrency(data.totalAmount)}`)
  );

  blocks.push(makeHeading("🛍️ 주문 상품"));
  if (data.items.length === 0) {
    blocks.push(makeBullet("데이터 없음"));
  } else {
    for (const it of data.items) {
      blocks.push(
        makeBullet(
          `${it.productName} × ${it.quantity} / 단가 ${formatCurrency(
            it.unitPrice
          )} / 소계 ${formatCurrency(it.lineTotal)}`
        )
      );
    }
  }

  blocks.push(makeHeading("💳 결제 정보"));
  if (data.payments.length === 0) {
    blocks.push(makeBullet("데이터 없음"));
  } else {
    for (const p of data.payments) {
      blocks.push(
        makeBullet(
          `${p.method} / ${formatCurrency(p.amount)} / ${p.status} / 승인: ${
            p.approvedAt ?? "—"
          }`
        )
      );
    }
  }

  blocks.push(makeHeading("📦 배송 정보"));
  blocks.push(
    makeBullet(`수령인: ${data.receiverName ?? "—"}`),
    makeBullet(`연락처: ${data.receiverPhone ?? "—"}`),
    makeBullet(`우편번호: ${data.receiverZipcode ?? "—"}`),
    makeBullet(`주소1: ${data.receiverAddress1 ?? "—"}`),
    makeBullet(`주소2: ${data.receiverAddress2 ?? "—"}`)
  );

  return blocks;
}

export async function createMonthlyReport(
  startDate: string,
  endDate: string,
  title: string
): Promise<{ success: boolean; pageUrl?: string; error?: string }> {
  try {
    const settings = await fetchNotionMcpSettings();
    if (!settings?.notion_enabled) {
      return { success: false, error: "Notion 연동이 꺼져 있습니다." };
    }
    const url = settings.notion_url?.trim() ?? "";
    if (!url) {
      return {
        success: false,
        error: "Notion Parent URL이 설정되어 있지 않습니다.",
      };
    }
    const parentPageId = extractPageId(url);
    if (!parentPageId) {
      return {
        success: false,
        error: "Parent URL에서 페이지 ID를 추출할 수 없습니다.",
      };
    }

    const reportData = await getMonthlyReportData(startDate, endDate);
    const blocks = buildMonthlyReportBlocks(startDate, endDate, reportData);
    const { id } = await createPageWithBlocks(parentPageId, title, blocks);
    return { success: true, pageUrl: formatPageUrl(id) };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "월간 리포트 생성에 실패했습니다.";
    return { success: false, error: message };
  }
}

export async function createOrderReport(
  orderId: string
): Promise<{ success: boolean; pageUrl?: string; error?: string }> {
  try {
    const settings = await fetchNotionMcpSettings();
    if (!settings?.notion_enabled || !settings.notion_report_per_payment) {
      return { success: true };
    }
    const url = settings.notion_url?.trim() ?? "";
    if (!url) {
      return { success: true };
    }
    const parentPageId = extractPageId(url);
    if (!parentPageId) {
      return { success: true };
    }

    const orderData = await getOrderReportData(orderId);
    if (!orderData) {
      return { success: false, error: "주문을 찾을 수 없습니다." };
    }

    const blocks = buildOrderReportBlocks(orderData);
    const { id } = await createPageWithBlocks(
      parentPageId,
      `주문 리포트 — ${orderData.orderId}`,
      blocks
    );
    return { success: true, pageUrl: formatPageUrl(id) };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "주문 리포트 생성에 실패했습니다.";
    return { success: false, error: message };
  }
}
