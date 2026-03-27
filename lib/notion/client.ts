import { Client } from "@notionhq/client";

export function getNotionClient(): Client {
  const key = process.env.NOTION_API_KEY;
  if (!key?.trim()) {
    throw new Error("NOTION_API_KEY 환경변수가 설정되어 있지 않습니다.");
  }
  return new Client({ auth: key.trim() });
}
