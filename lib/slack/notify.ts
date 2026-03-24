import { createClient } from "@/lib/supabase/server";

export interface PaymentNotificationData {
  orderId: string;
  amount: number;
  method: string;
  userEmail: string;
  approvedAt: string;
}

interface McpSettingsRow {
  slack_enabled: boolean;
}

export async function sendPaymentSlackNotification(
  data: PaymentNotificationData
): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: settings } = await supabase
      .from("mcp_settings")
      .select("slack_enabled")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const typedSettings = settings as McpSettingsRow | null;
    if (!typedSettings?.slack_enabled) {
      return;
    }

    const slackBotToken = process.env.SLACK_BOT_TOKEN;
    const slackChannelId = process.env.SLACK_CHANNEL_ID;
    if (!slackBotToken || !slackChannelId) {
      return;
    }

    const approvedAtKst = new Date(data.approvedAt).toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    });
    const amountKrw = new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(data.amount);

    await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${slackBotToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        channel: slackChannelId,
        text: `결제 완료 알림 - 주문 ${data.orderId}`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "결제가 완료되었습니다.",
              emoji: true,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*주문번호*\n${data.orderId}`,
              },
              {
                type: "mrkdwn",
                text: `*결제금액*\n${amountKrw}`,
              },
              {
                type: "mrkdwn",
                text: `*결제수단*\n${data.method}`,
              },
              {
                type: "mrkdwn",
                text: `*구매자*\n${data.userEmail}`,
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `결제시각: ${approvedAtKst} (KST)`,
              },
            ],
          },
        ],
      }),
      cache: "no-store",
    });
  } catch {
    // 알림 실패는 결제 흐름에 영향 주지 않는다.
  }
}
