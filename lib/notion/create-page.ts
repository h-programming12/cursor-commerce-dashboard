import type { BlockObjectRequest, Client } from "@notionhq/client";

const MAX_TEXT_CHUNK = 2000;

function splitMessageChunks(text: string): string[] {
  if (text.length === 0) {
    return [""];
  }
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += MAX_TEXT_CHUNK) {
    chunks.push(text.slice(i, i + MAX_TEXT_CHUNK));
  }
  return chunks;
}

export function buildTestReportBlocks(
  testMessage: string,
  createdAt: Date
): BlockObjectRequest[] {
  const iso = createdAt.toISOString();
  const first: BlockObjectRequest = {
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [
        {
          type: "text",
          text: { content: `생성 일시: ${iso}` },
        },
      ],
    },
  };

  const chunks = splitMessageChunks(testMessage);
  const rest: BlockObjectRequest[] = chunks.map((chunk) => ({
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: { content: chunk.length > 0 ? chunk : " " },
        },
      ],
    },
  }));

  return [first, ...rest];
}

export async function createTestReportPage(
  client: Client,
  parentPageId: string,
  testMessage: string
): Promise<{ id: string }> {
  const createdAt = new Date();
  const titleBase = `테스트 리포트 ${createdAt.toISOString()}`;
  const title =
    titleBase.length > MAX_TEXT_CHUNK
      ? titleBase.slice(0, MAX_TEXT_CHUNK)
      : titleBase;

  const response = await client.pages.create({
    parent: { page_id: parentPageId },
    properties: {
      title: {
        title: [{ type: "text", text: { content: title } }],
        type: "title",
      },
    },
    children: buildTestReportBlocks(testMessage, createdAt),
  });

  return { id: response.id };
}
