/**
 * Notion 연동 스모크 테스트: 지정 부모 아래 테스트 페이지 생성.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  APIErrorCode,
  APIResponseError,
  isNotionClientError,
} from "@notionhq/client";
import { checkAdminAccess } from "@/lib/auth/admin";
import { createTestReportPage } from "@/lib/notion/create-page";
import { getNotionClient } from "@/lib/notion/client";
import { extractPageId, formatPageUrl } from "@/lib/notion/utils";

type RequestBody = {
  parentPageUrl?: string;
  testMessage?: string;
};

function notionErrorMessage(error: APIResponseError): string {
  switch (error.code) {
    case APIErrorCode.ObjectNotFound:
      return "부모 페이지를 찾을 수 없습니다. Parent URL과 연동 권한을 확인하세요.";
    case APIErrorCode.Unauthorized:
      return "Notion API 인증에 실패했습니다. 토큰과 연동 설정을 확인하세요.";
    case APIErrorCode.RestrictedResource:
      return "해당 Notion 리소스에 접근할 권한이 없습니다.";
    case APIErrorCode.RateLimited:
      return "Notion API 요청 한도에 도달했습니다. 잠시 후 다시 시도하세요.";
    case APIErrorCode.ValidationError:
      return "요청 값이 올바르지 않습니다. Parent URL과 본문 내용을 확인하세요.";
    case APIErrorCode.InvalidRequest:
      return "잘못된 요청입니다. Parent URL과 본문을 확인하세요.";
    case APIErrorCode.ConflictError:
      return "요청이 기존 데이터와 충돌했습니다. 잠시 후 다시 시도하세요.";
    case APIErrorCode.InternalServerError:
    case APIErrorCode.ServiceUnavailable:
      return "Notion 서버 오류가 발생했습니다. 잠시 후 다시 시도하세요.";
    default:
      return error.message || "Notion API 요청에 실패했습니다.";
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkAdminAccess();
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: "관리자 권한이 필요합니다." },
      { status: 403 }
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "요청 본문이 올바른 JSON이 아닙니다." },
      { status: 400 }
    );
  }

  const parentPageUrl =
    typeof body.parentPageUrl === "string" ? body.parentPageUrl.trim() : "";
  const testMessage =
    typeof body.testMessage === "string" ? body.testMessage : "";

  if (!parentPageUrl) {
    return NextResponse.json(
      { success: false, error: "리포트 생성 Parent URL이 필요합니다." },
      { status: 400 }
    );
  }

  const parentId = extractPageId(parentPageUrl);
  if (!parentId) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Parent URL에서 페이지 ID를 찾을 수 없습니다. Notion 페이지 주소를 확인하세요.",
      },
      { status: 400 }
    );
  }

  let client;
  try {
    client = getNotionClient();
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Notion 클라이언트를 만들 수 없습니다.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }

  try {
    const { id } = await createTestReportPage(client, parentId, testMessage);
    const pageUrl = formatPageUrl(id);
    return NextResponse.json({ success: true, pageUrl });
  } catch (err) {
    if (APIResponseError.isAPIResponseError(err)) {
      return NextResponse.json(
        { success: false, error: notionErrorMessage(err) },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 }
      );
    }

    if (isNotionClientError(err)) {
      return NextResponse.json(
        {
          success: false,
          error: err.message || "Notion 요청 중 오류가 발생했습니다.",
        },
        { status: 502 }
      );
    }

    const message =
      err instanceof Error ? err.message : "테스트 리포트 생성에 실패했습니다.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
