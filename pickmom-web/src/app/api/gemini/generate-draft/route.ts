import { NextRequest, NextResponse } from "next/server";

const categories = ["맛집·카페", "여행·체험", "국내여행", "해외여행", "교육 정보", "리빙·제품", "생활·정책", "부동산·주거"];
const purposes = ["정보", "실사용 후기", "비교", "문제 해결"];
type RequestBody = { keyword?: unknown; category?: unknown; purpose?: unknown; notes?: unknown; tips?: unknown; photoCaptions?: unknown };
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API 키가 연결되지 않았습니다. Vercel 환경변수에 GEMINI_API_KEY를 추가해 주세요." }, { status: 503 });
  }

  let body: RequestBody;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "요청 내용을 읽을 수 없습니다." }, { status: 400 }); }

  const keyword = text(body.keyword, 120);
  const category = text(body.category, 40);
  const purpose = text(body.purpose, 40);
  const notes = text(body.notes, 12000);
  const tips = text(body.tips, 2000);
  if (!keyword || !notes) return NextResponse.json({ error: "핵심 키워드와 경험·자료를 입력해 주세요." }, { status: 400 });
  if (!categories.includes(category) || !purposes.includes(purpose)) return NextResponse.json({ error: "카테고리 또는 콘텐츠 유형이 올바르지 않습니다." }, { status: 400 });

  const photos = Array.isArray(body.photoCaptions)
    ? body.photoCaptions.slice(0, 12).map((item, index) => {
        const record = item && typeof item === "object" ? item as { caption?: unknown } : {};
        return `사진 ${index + 1}: ${text(record.caption, 180) || "사용자가 첨부한 사진(설명 없음)"}`;
      }).join("\n")
    : "첨부 사진 없음";

  const systemInstruction = `당신은 한국 네이버 블로그 전문 에디터다. 사용자 제공 경험과 자료를 토대로 자연스러운 한국어 초안을 작성한다.
절대 규칙:
- 사용자가 제공하지 않은 방문 경험, 감정, 구매·이용 사실, 가격, 주소, 운영시간, 메뉴, 성능, 수치, 정책 조건을 만들지 않는다.
- 실사용 후기에서는 사용자가 직접 겪었다고 말한 내용만 1인칭 경험으로 쓴다.
- 정보가 부족하거나 최신 확인이 필요한 항목은 [직접 확인 필요]로 표시한다.
- 첨부 사진의 실제 이미지는 분석하지 않는다. 제공된 사진 설명만 활용하고, 설명이 없으면 내용을 추측하지 않는다.
- 키워드를 자연스럽게 사용하고 반복 삽입을 피한다. 자연스러운 한국어 블로그 말투(했어요/좋았어요)로 쓴다.
- 사용자의 핵심 경험과 세부사항을 임의로 삭제하거나 의미를 바꾸지 않는다.
- 본문 사진 위치는 [이미지 번호 삽입 – 설명] 형식으로 표시한다.
콘텐츠 유형별 기준:
- 실사용 후기: 실제 이용 동기·과정·장단점·팁을 입력 범위에서 구성한다.
- 정보: 독자가 궁금해할 핵심 질문 순서로 설명하고 변동 정보는 확인 필요로 표시한다.
- 비교: 동일한 비교 기준을 사용하고 근거 없는 우열은 판단하지 않는다.
- 문제 해결: 확인된 원인과 해결 순서, 주의점을 구분한다.
불필요한 서론·결론 반복 없이 소제목으로 구성한다. 자료에 맞춰 충분히 작성하되 같은 말을 반복하지 않는다. 결과는 JSON 스키마에 맞춰 title과 body만 반환한다.`;

  const input = [
    `핵심 키워드: ${keyword}`,
    `카테고리: ${category}`,
    `콘텐츠 유형: ${purpose}`,
    `사용자가 제공한 경험·자료:\n${notes}`,
    tips ? `이번 글 추가 요청:\n${tips}` : "",
    `사진 설명(실제 이미지 분석 결과가 아님):\n${photos}`
  ].filter(Boolean).join("\n\n");

  const primaryModel = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL?.trim() || "gemini-3.6-flash";
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const requestModel = async (model: string) => {
    let response: Response | undefined;
    let result: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
          method: "POST",
          headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            input,
            system_instruction: systemInstruction,
            response_format: {
              type: "text",
              mime_type: "application/json",
              schema: {
                type: "object",
                properties: { title: { type: "string" }, body: { type: "string" } },
                required: ["title", "body"],
                additionalProperties: false
              }
            },
            store: false,
            generation_config: { max_output_tokens: 5000 }
          }),
          cache: "no-store"
        });
        result = await response.json();
      } catch (error) {
        if (attempt < 2) {
          await wait(attempt === 0 ? 1500 : 3500);
          continue;
        }
        throw error;
      }
      if (response.ok || response.status !== 503 || attempt === 2) break;
      await wait(attempt === 0 ? 1500 : 3500);
    }
    return { response: response!, result };
  };

  try {
    let activeModel = primaryModel;
    let { response, result } = await requestModel(primaryModel);

    // 429 indicates model rate-limit exhaustion; 503 indicates temporary capacity pressure.
    // Try the configured fallback model for either condition.
    if ((response.status === 429 || response.status === 503) && fallbackModel && fallbackModel !== primaryModel) {
      console.warn("Gemini primary model unavailable; trying fallback model:", fallbackModel);
      activeModel = fallbackModel;
      ({ response, result } = await requestModel(fallbackModel));
    }

    if (!response.ok) {
      console.error("Gemini Interactions API error:", { model: activeModel, status: response.status, code: result?.error?.status, message: result?.error?.message });
      const status = response.status === 429 ? 429 : 502;
      const message = response.status === 401 || response.status === 403
        ? "Gemini API 키 또는 Google AI Studio 프로젝트 권한을 확인해 주세요."
        : response.status === 429
          ? "Gemini API 사용 한도 또는 결제·요청 제한을 확인해 주세요."
          : response.status === 503
            ? "Gemini 서버가 혼잡합니다. 잠시 후 다시 시도해 주세요."
            : "Gemini 원고 생성 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.";
      return NextResponse.json({ error: message }, { status });
    }

    const outputText = (result.steps ?? [])
      .filter((step: { type?: string }) => step.type === "model_output")
      .flatMap((step: { content?: Array<{ type?: string; text?: string }> }) => step.content ?? [])
      .filter((part: { type?: string }) => part.type === "text")
      .map((part: { text?: string }) => part.text ?? "")
      .join("");
    if (!outputText) return NextResponse.json({ error: "Gemini가 빈 원고를 반환했습니다. 다시 시도해 주세요." }, { status: 502 });

    let draft: { title?: string; body?: string };
    try { draft = JSON.parse(outputText); }
    catch {
      console.error("Gemini returned non-JSON draft output.");
      return NextResponse.json({ error: "Gemini 응답을 원고 형식으로 변환하지 못했습니다. 다시 시도해 주세요." }, { status: 502 });
    }
    if (!draft.title?.trim() || !draft.body?.trim()) return NextResponse.json({ error: "Gemini가 제목 또는 본문을 완성하지 못했습니다." }, { status: 502 });

    return NextResponse.json({ title: draft.title.trim(), body: draft.body.trim(), model: result.model || activeModel }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Gemini draft generation request failed:", error);
    return NextResponse.json({ error: "Gemini API에 연결하지 못했습니다. 네트워크 설정을 확인해 주세요." }, { status: 502 });
  }
}
