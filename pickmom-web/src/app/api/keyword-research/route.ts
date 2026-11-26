import { NextRequest, NextResponse } from "next/server";

const NAVER_API_BASE = "https://naverapihub.apigw.ntruss.com";

function getNaverHeaders() {
  const keyId = process.env.NCP_NAVER_API_KEY_ID;
  const key = process.env.NCP_NAVER_API_KEY;

  if (!keyId || !key) {
    throw new Error("NAVER_API_KEYS_MISSING");
  }

  return {
    "X-NCP-APIGW-API-KEY-ID": keyId,
    "X-NCP-APIGW-API-KEY": key,
    "Content-Type": "application/json",
  };
}

function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function readNaverResponse(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data?.error?.details ||
      data?.error?.message ||
      data?.errorMessage ||
      data?.errMsg ||
      `NAVER_API_ERROR_${response.status}`;
    throw new Error(String(message));
  }
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = getNaverHeaders();

    if (body.action === "blog") {
      const keyword = String(body.keyword ?? "").trim();
      if (!keyword || keyword.length > 100) {
        return NextResponse.json({ error: "검색어를 1~100자 입력해 주세요." }, { status: 400 });
      }

      const params = new URLSearchParams({
        query: keyword,
        display: "20",
        start: "1",
        sort: "sim",
        format: "json",
      });
      const response = await fetch(`${NAVER_API_BASE}/search/v1/blog?${params}`, {
        headers,
        cache: "no-store",
      });
      const data = await readNaverResponse(response);

      return NextResponse.json({
        source: "NAVER API HUB · 블로그 검색",
        keyword,
        total: data.total ?? null,
        collectedAt: new Date().toISOString(),
        items: (data.items ?? []).map((item: Record<string, unknown>) => ({
          title: String(item.title ?? "").replace(/<[^>]*>/g, ""),
          link: String(item.link ?? ""),
          description: String(item.description ?? "").replace(/<[^>]*>/g, ""),
          bloggername: String(item.bloggername ?? ""),
          bloggerlink: String(item.bloggerlink ?? ""),
          postdate: String(item.postdate ?? ""),
        })),
      });
    }

    if (body.action === "trend") {
      const requestedGroups = Array.isArray(body.groups) ? body.groups : [];
      if (requestedGroups.length < 1 || requestedGroups.length > 5) {
        return NextResponse.json({ error: "트렌드 비교는 한 번에 1~5개 주제까지 가능합니다." }, { status: 400 });
      }

      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 180);

      const keywordGroups = requestedGroups.map((group: { name?: string; keywords?: string[] }) => {
        const name = String(group.name ?? "").trim();
        const keywords = Array.isArray(group.keywords)
          ? group.keywords.map((word) => String(word).trim()).filter(Boolean).slice(0, 20)
          : [];
        if (!name || keywords.length === 0) {
          throw new Error("각 트렌드 주제에는 이름과 검색어가 필요합니다.");
        }
        return { groupName: name.slice(0, 100), keywords };
      });

      const response = await fetch(`${NAVER_API_BASE}/search-trend/v1/search`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          startDate: dateString(start),
          endDate: dateString(end),
          timeUnit: "week",
          keywordGroups,
        }),
        cache: "no-store",
      });
      const data = await readNaverResponse(response);

      return NextResponse.json({
        source: "NAVER API HUB · 검색어 트렌드",
        collectedAt: new Date().toISOString(),
        startDate: data.startDate,
        endDate: data.endDate,
        timeUnit: data.timeUnit,
        results: data.results ?? [],
        metricNote: "검색량 절대값이 아닌 조회 기간 내 상대 검색 관심도(최대 100)입니다.",
      });
    }

    return NextResponse.json({ error: "지원하지 않는 요청입니다." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    if (message === "NAVER_API_KEYS_MISSING") {
      return NextResponse.json(
        { error: "서버에 네이버 API 키가 아직 설정되지 않았습니다.", code: "NAVER_API_KEYS_MISSING" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
