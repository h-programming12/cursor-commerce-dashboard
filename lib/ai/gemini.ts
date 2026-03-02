import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

/**
 * GoogleGenAI 클라이언트를 생성합니다.
 * GEMINI_API_KEY 환경변수가 없으면 에러를 throw합니다.
 */
function createClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * 단일 프롬프트로 Gemini 모델에 텍스트 생성을 요청합니다.
 *
 * @param prompt - 사용자 프롬프트
 * @param model - 사용할 모델명 (기본값: gemini-2.5-flash)
 * @returns 생성된 텍스트
 * @throws 응답에 텍스트가 없을 경우
 */
export async function generateGeminiText(
  prompt: string,
  model: string = "gemini-2.5-flash"
): Promise<string> {
  const ai = createClient();
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = response.text;
  if (text === undefined || text === null) {
    throw new Error("Gemini API 응답에 텍스트가 없습니다.");
  }
  return text;
}

/**
 * 시스템 프롬프트와 사용자 프롬프트를 결합하여 Gemini 모델에 텍스트 생성을 요청합니다.
 *
 * @param systemPrompt - 시스템 지시사항 (역할/컨텍스트 정의)
 * @param userPrompt - 사용자 입력
 * @param model - 사용할 모델명 (기본값: gemini-2.5-flash)
 * @returns 생성된 텍스트
 * @throws 응답에 텍스트가 없을 경우
 */
export async function generateGeminiTextWithSystemPrompt(
  systemPrompt: string,
  userPrompt: string,
  model: string = "gemini-2.5-flash"
): Promise<string> {
  const combinedPrompt = `${systemPrompt}\n${userPrompt}`;
  return generateGeminiText(combinedPrompt, model);
}

/**
 * 스트리밍 방식으로 Gemini 모델에 텍스트 생성을 요청합니다.
 *
 * @param prompt - 사용자 프롬프트
 * @param model - 사용할 모델명 (기본값: gemini-2.5-flash)
 * @yields 생성된 텍스트 청크
 */
export async function* generateGeminiTextStream(
  prompt: string,
  model: string = "gemini-2.5-flash"
): AsyncGenerator<string, void, unknown> {
  const ai = createClient();
  const stream = await ai.models.generateContentStream({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) {
      yield text;
    }
  }
}
