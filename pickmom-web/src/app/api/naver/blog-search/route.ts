import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();
  if (!query) {
    return NextResponse.json({ error: "검색어를 입력해 주세요." }, { status: 400 });
  }

  const clientId = process.env.NAVER_CLIENT_ID?.trim();
  const clientSecret = process.env.NAVER_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "네이버 API 환경변수가 설정되지 않았습니다. Vercel 설정을 확인해 주세요." },
      { status: 500 }
    );
  }

  const requestedSort = request.nextUrl.searchParams.get("sort");
  const sort = requestedSort === "date" ? "date" : "sim";
  const params = new URLSearchParams({ query, display: "10", start: "1", sort });

  try {
    const response = await fetch(
      `https://naverapihub.apigw.ntruss.com/search/v1/blog?${params.toString()}`,
      {
        headers: {
          "X-NCP-APIGW-API-KEY-ID": clientId,
          "X-NCP-APIGW-API-KEY": clientSecret,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Naver Blog Search API error:", {
        status: response.status,
        errorCode: data?.errorCode,
        errorMessage: data?.errorMessage,
      });
      return NextResponse.json(
        { error: data?.errorMessage || "네이버 블로그 검색 요청에 실패했습니다." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      query,
      total: Number(data.total ?? 0),
      display: Number(data.display ?? 0),
      items: (data.items ?? []).map((item: {
        title?: string;
        link?: string;
        description?: string;
        bloggername?: string;
        postdate?: string;
      }) => ({
        title: (item.title ?? "").replace(/<[^>]*>/g, ""),
        link: item.link ?? "",
        description: (item.description ?? "").replace(/<[^>]*>/g, ""),
        bloggerName: item.bloggername ?? "",
        postDate: item.postdate ?? "",
      })),
    });
  } catch (error) {
    console.error("Naver Blog Search request failed:", error);
    return NextResponse.json(
      { error: "네이버 API에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 }
    );
  }
}
