import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim();
  if (!query) {
    return NextResponse.json({ error: "검색어를 입력해 주세요." }, { status: 400 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "네이버 API 환경변수가 설정되지 않았습니다. Vercel 설정을 확인해 주세요." },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    query,
    display: "20",
    start: "1",
    sort: "sim",
  });

  try {
    const response = await fetch(`https://openapi.naver.com/v1/search/blog.json?${params.toString()}`, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.errorMessage || "네이버 블로그 검색 요청에 실패했습니다." },
        { status: response.status }
      );
    }

    return NextResponse.json({
      query,
      total: data.total ?? 0,
      display: data.display ?? 0,
      items: (data.items ?? []).map((item: {
        title: string;
        link: string;
        description: string;
        bloggername: string;
        bloggerlink: string;
        postdate: string;
      }) => ({
        title: item.title.replace(/<[^>]*>/g, ""),
        link: item.link,
        description: item.description.replace(/<[^>]*>/g, ""),
        bloggerName: item.bloggername,
        bloggerLink: item.bloggerlink,
        postDate: item.postdate,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "네이버 API에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 }
    );
  }
}
