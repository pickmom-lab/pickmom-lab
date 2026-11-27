import { NextRequest, NextResponse } from "next/server";

const categories = ["맛집·카페", "여행·체험", "교육 정보", "리빙·제품", "생활·정책", "부동산·주거"];
const purposes = ["정보", "실사용 후기", "비교", "문제 해결"];

type RequestBody = {
  keyword?: unknown;
  category?: unknown;
  purpose?: unknown;
  notes?: unknown;
  tips?: unknown;
  photoCaptions?: unknown;
};

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API 키가 아직 연결되지 않았습니다. Vercel 환경변수에 OPENAI_API_KEY를 추가해 주세요." },
      { status: 503 }
    );
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 내용을 읽을 수 없습니다." }, { status: 400 });
  }

  const keyword = text(body.keyword, 120);
  const category = text(body.category, 40);
  const purpose = text(body.purpose, 40);
  const notes = text(body.notes, 12000);
  const tips = text(body.tips, 2000);

  if (!keyword || !notes) {
    return NextResponse.json({ error: "핵심 키워드와 경험·자료를 입력해 주세요." }, { status: 400 });
  }
  if (!categories.includes(category) || !purposes.includes(purpose)) {
    return NextResponse.json({ error: "카테고리 또는 콘텐츠 유형이 올바르지 않습니다." }, { status: 400 });
  }

  const photoCaptions = Array.isArray(body.photoCaptions)
    ? body.photoCaptions.slice(0, 12).map((item, index) => {
        const record = item && typeof item === "object" ? item as { caption?: unknown } : {};
        return { number: index + 1, caption: text(record.caption, 180) };
      })
    : [];

  const photoGuide = photoCaptions.length
    ? photoCaptions.map((photo) => `사진 ${photo.number}: ${photo.caption || "사용자가 첨부한 사진(내용 설명 없음)"}`).join("\n")
    : "첨부 사진 없음";

  const instructions = `당신은 한국 네이버 블로그 전문 에디터다. 사용자가 제공한 경험과 자료를 토대로 발행 직전까지 편집할 수 있는 자연스러운 한국어 초안을 작성한다.

절대 규칙:
- 사용자가 제공하지 않은 방문 경험, 감정, 구매·이용 사실, 가격, 주소, 운영시간, 메뉴, 성능, 수치, 정책 조건을 만들어내지 않는다.
- 실사용 후기에서는 사용자가 직접 겪었다고 말한 내용만 1인칭 경험으로 쓴다. 정보가 부족한 부분은 일반화하거나 [직접 확인 필요]로 표시한다.
- 정보·비교·문제 해결 글에서도 근거가 없는 최신 사실이나 단정적 주장을 만들지 않는다. 확인이 필요한 변동 정보는 [공식 자료 확인 필요: 항목]으로 표시한다.
- 첨부 사진의 실제 이미지 내용은 분석할 수 없다. 사진 설명이 제공된 경우에만 그 설명을 활용한다. 설명이 없는 사진은 내용을 추측하지 말고 이미지 삽입 위치만 표시한다.
- 키워드를 제목과 본문에 자연스럽게 사용하되 반복 삽입이나 부자연스러운 SEO 문구를 피한다.
- 광고성 과장, 허위 체험담, 검증되지 않은 최상급 표현을 쓰지 않는다.
- 문체는 자연스러운 한국어 블로그 말투(했어요/좋았어요 등)로 쓴다. 기계적인 보고서 문체를 피한다.
- 본문은 주제에 맞는 소제목을 사용해 읽기 쉽게 구성한다. 불필요한 서론·결론 반복을 피한다.
- 사용자의 핵심 경험과 세부사항을 임의로 삭제하거나 의미를 바꾸지 않는다.
- 사진 삽입 표시는 본문 안에 [이미지 번호 삽입 – 설명] 형식으로 넣는다. 제공된 사진 번호와 1:1로 맞추고, 사진을 본 것처럼 설명하지 않는다.
- 최종 출력은 지정된 JSON 스키마에 맞춘다. body에는 본문만 넣고, 별도 해설이나 SEO 점수는 넣지 않는다.

콘텐츠 유형별 작성 기준:
- 실사용 후기: 실제 이용 동기와 과정, 구체적 경험, 장단점, 독자에게 유용한 팁을 입력된 범위에서 구성한다. 입력되지 않은 체험을 추가하지 않는다.
- 정보: 독자가 궁금해할 핵심 질문을 순서대로 설명한다. 최신 정보 확인이 필요한 항목은 명확히 표시한다.
- 비교: 동일한 비교 기준을 사용하고, 제공된 근거가 없는 우열은 판단하지 않는다. 자료가 부족한 항목은 확인 필요로 남긴다.
- 문제 해결: 문제 상황, 원인(확인된 경우만), 해결 순서, 주의점을 구분한다. 검증되지 않은 해결책을 확정적으로 말하지 않는다.

분량은 주제와 입력 자료에 맞춰 충분히 작성하되 같은 말을 반복해 늘리지 않는다. 일반적인 블로그 초안은 약 1,200~1,800자 정도를 목표로 한다.`;

  const input = [
    `핵심 키워드: ${keyword}`,
    `카테고리: ${category}`,
    `콘텐츠 유형: ${purpose}`,
    `사용자가 제공한 경험·자료:\n${notes}`,
    tips ? `이번 글 추가 요청:\n${tips}` : "",
    `사진 설명(실제 이미지 분석 결과가 아님):\n${photoGuide}`,
  ].filter(Boolean).join("\n\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-5.5",
        store: false,
        max_output_tokens: 5000,
        instructions,
        input,
        text: {
          format: {
            type: "json_schema",
            name: "pickmom_blog_draft",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                body: { type: "string" },
              },
              required: ["title", "body"],
              additionalProperties: false,
            },
          },
        },
      }),
      cache: "no-store",
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("OpenAI Responses API error:", {
        status: response.status,
        code: result?.error?.code,
        type: result?.error?.type,
      });
      const status = response.status === 429 ? 429 : 502;
      const message = response.status === 401
        ? "OpenAI API 키가 유효하지 않습니다. 키와 API 프로젝트 설정을 확인해 주세요."
        : response.status === 429
          ? "OpenAI API 사용 한도 또는 결제 설정을 확인해 주세요."
          : "OpenAI 원고 생성 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.";
      return NextResponse.json({ error: message }, { status });
    }

    const outputText = (result.output ?? [])
      .filter((item: { type?: string }) => item.type === "message")
      .flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? [])
      .filter((item: { type?: string }) => item.type === "output_text")
      .map((item: { text?: string }) => item.text ?? "")
      .join("");

    if (!outputText) {
      return NextResponse.json({ error: "AI가 빈 원고를 반환했습니다. 다시 시도해 주세요." }, { status: 502 });
    }

    let draft: { title?: string; body?: string };
    try {
      draft = JSON.parse(outputText);
    } catch {
      console.error("OpenAI returned non-JSON draft output.");
      return NextResponse.json({ error: "AI 응답을 원고 형식으로 변환하지 못했습니다. 다시 시도해 주세요." }, { status: 502 });
    }

    if (!draft.title?.trim() || !draft.body?.trim()) {
      return NextResponse.json({ error: "AI가 제목 또는 본문을 완성하지 못했습니다. 다시 시도해 주세요." }, { status: 502 });
    }

    return NextResponse.json(
      { title: draft.title.trim(), body: draft.body.trim(), model: result.model || process.env.OPENAI_MODEL || "gpt-5.5" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("OpenAI draft generation request failed:", error);
    return NextResponse.json({ error: "OpenAI API에 연결하지 못했습니다. 네트워크 설정을 확인해 주세요." }, { status: 502 });
  }
}
