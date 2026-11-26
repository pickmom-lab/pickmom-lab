"use client";

import { useState } from "react";

type TrendPoint = { period: string; ratio: number };
type TrendResult = { title: string; keywords: string[]; data: TrendPoint[] };
type BlogItem = {
  title: string;
  link: string;
  description: string;
  bloggername: string;
  bloggerlink: string;
  postdate: string;
};

const categories = [
  {
    name: "여행·나들이",
    items: ["서울 아이와 가볼 만한 곳", "서울 실내 체험", "겨울 아이와 여행"],
  },
  {
    name: "교육·육아",
    items: ["초등 입학 준비", "7세 수학", "영어유치원 이후 영어"],
  },
  {
    name: "맛집·카페",
    items: ["아이와 브런치", "서래마을 맛집", "고속터미널 맛집"],
  },
  {
    name: "생활·할인",
    items: ["서울 키즈카페 할인", "겨울 난방비 절약", "연말정산 교육비"],
  },
  {
    name: "시즌·행사",
    items: ["서울 크리스마스 마켓", "겨울방학 체험", "새해 해돋이 명소"],
  },
];

const dateLabel = (value: string) => {
  if (!value) return "";
  return value.length === 8
    ? `${value.slice(0, 4)}.${value.slice(4, 6)}.${value.slice(6, 8)}`
    : value;
};

export default function CompetitorAnalysis({ onUseKeyword }: { onUseKeyword?: (keyword: string) => void }) {
  const [tab, setTab] = useState<"discover" | "analyze" | "templates">("discover");
  const [keyword, setKeyword] = useState("서울 아이와 가볼 만한 곳");
  const [trends, setTrends] = useState<TrendResult[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [blogItems, setBlogItems] = useState<BlogItem[]>([]);
  const [blogTotal, setBlogTotal] = useState<number | null>(null);
  const [blogLoading, setBlogLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [collectedAt, setCollectedAt] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

  const requestTrend = async (groups: { name: string; keywords: string[] }[]) => {
    const response = await fetch("/api/keyword-research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "trend", groups }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "검색어 트렌드를 가져오지 못했습니다.");
    return data;
  };

  const discoverTrends = async () => {
    setTrendLoading(true);
    setError("");
    setTrends([]);
    try {
      const candidates = categories
        .filter((category) => activeCategory === "전체" || category.name === activeCategory)
        .flatMap((category) => category.items.map((item) => ({ name: item, keywords: [item] })));
      const batches: { name: string; keywords: string[] }[][] = [];
      for (let index = 0; index < candidates.length; index += 5) {
        batches.push(candidates.slice(index, index + 5));
      }
      const responses = await Promise.all(batches.map(requestTrend));
      const allResults = responses.flatMap((response) => response.results ?? []);
      setTrends(allResults);
      setSource("NAVER API HUB · 검색어 트렌드");
      setCollectedAt(new Date().toISOString());
      if (allResults.length === 0) setError("조회 결과가 없습니다. API 권한과 검색어를 확인해 주세요.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "트렌드 조회 중 오류가 발생했습니다.");
    } finally {
      setTrendLoading(false);
    }
  };

  const analyzeKeyword = async (value = keyword) => {
    const target = value.trim();
    if (!target) return;
    setKeyword(target);
    setTab("analyze");
    setError("");
    setBlogLoading(true);
    setTrendLoading(true);
    setBlogItems([]);
    setBlogTotal(null);
    setTrends([]);
    try {
      const [blogResponse, trendResponse] = await Promise.all([
        fetch("/api/keyword-research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "blog", keyword: target }),
        }),
        requestTrend([{ name: target, keywords: [target] }]),
      ]);
      const blogData = await blogResponse.json();
      const trendData = await trendResponse;
      if (!blogResponse.ok) throw new Error(blogData.error || "블로그 검색에 실패했습니다.");
      setBlogItems(blogData.items ?? []);
      setBlogTotal(typeof blogData.total === "number" ? blogData.total : null);
      setTrends(trendData.results ?? []);
      setSource("NAVER API HUB · 블로그 검색 + 검색어 트렌드");
      setCollectedAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "키워드 분석 중 오류가 발생했습니다.");
    } finally {
      setBlogLoading(false);
      setTrendLoading(false);
    }
  };

  const formatChange = (data: TrendPoint[]) => {
    if (data.length < 2) return "비교 데이터 부족";
    const current = Number(data[data.length - 1].ratio);
    const previous = Number(data[data.length - 2].ratio);
    if (previous === 0) return "직전 주 데이터 없음";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}% (전 구간 대비)`;
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError("클립보드 복사 권한을 확인해 주세요.");
    }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-5 pb-8">
      <div className="rounded-3xl bg-[#665174] p-6 text-white md:p-8">
        <p className="text-[10px] tracking-[.2em] text-[#DCCFE5]">PICKMOM LAB · CONTENT RADAR</p>
        <h2 className="mt-3 text-2xl font-semibold md:text-3xl">검색되는 키워드부터 찾기</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#E8DFEC]">
          네이버 검색어 트렌드와 블로그 검색 결과를 연결해 키워드의 관심 흐름과 실제 콘텐츠를 확인합니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-white/15 px-3 py-1.5">01 키워드 발굴</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5">02 검색 결과 분석</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5">03 템플릿 개선</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[#ECE8EA] bg-white p-2">
        {([
          ["discover", "키워드 발굴"],
          ["analyze", "키워드 분석"],
          ["templates", "상위 글 분석 · 템플릿"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`shrink-0 rounded-xl px-4 py-3 text-xs font-semibold ${tab === id ? "bg-[#665174] text-white" : "text-[#817787] hover:bg-[#F8F5F9]"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-[#EBD9D9] bg-[#FFF8F7] p-4 text-xs leading-5 text-[#9B5555]">
          {error}
          {error.includes("아직 설정") && (
            <p className="mt-2">Vercel 환경 변수 NCP_NAVER_API_KEY_ID와 NCP_NAVER_API_KEY를 등록한 뒤 다시 시도해 주세요.</p>
          )}
        </div>
      )}

      {tab === "discover" && (
        <>
          <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">키워드 후보 탐색</h3>
              <span className="rounded-full bg-[#F3EFF5] px-3 py-1 text-[10px] text-[#715B80]">네이버 데이터 연결</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-[#A49AA9]">
              분야별 후보 키워드의 최근 6개월 검색 관심도 추이를 조회합니다. 후보 목록은 초기 탐색용 주제어이며, 네이버가 제공하는 자동 급상승 검색어 목록은 아닙니다.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["전체", ...categories.map((category) => category.name)].map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-3 py-2 text-[11px] ${activeCategory === category ? "bg-[#665174] text-white" : "bg-[#F7F4F8] text-[#817787]"}`}
                >
                  {category}
                </button>
              ))}
            </div>
            <button
              onClick={discoverTrends}
              disabled={trendLoading}
              className="mt-4 w-full rounded-xl bg-[#665174] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {trendLoading ? "네이버 트렌드 조회 중..." : "선택 분야 키워드 트렌드 조회"}
            </button>
            {trends.length > 0 && (
              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-[#51445A]">검색 관심도 결과</h4>
                  <span className="text-[10px] text-[#A49AA9]">최근 6개월 · 주간 단위</span>
                </div>
                {trends.map((item) => {
                  const last = item.data?.[item.data.length - 1];
                  const max = Math.max(...(item.data ?? []).map((point) => Number(point.ratio)), 1);
                  return (
                    <button
                      key={item.title}
                      onClick={() => analyzeKeyword(item.title)}
                      className="w-full rounded-xl border border-[#F0ECF1] p-4 text-left hover:border-[#B9A7C5]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[#51445A]">{item.title}</span>
                        <span className="text-[10px] text-[#806B8E]">{formatChange(item.data ?? [])}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F0ECF1]">
                        <div className="h-full rounded-full bg-[#9B82AC]" style={{ width: `${(Number(last?.ratio ?? 0) / max) * 100}%` }} />
                      </div>
                      <p className="mt-2 text-[10px] text-[#A49AA9]">최근 지수 {Number(last?.ratio ?? 0).toFixed(1)} · 기간 내 최고 지수 100 기준 · 눌러서 블로그 결과 분석</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
            <h3 className="font-semibold">관심 키워드 직접 분석</h3>
            <p className="mt-1 text-xs text-[#A49AA9]">키워드를 입력하면 검색어 트렌드와 블로그 검색 결과를 함께 가져옵니다.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") analyzeKeyword(); }}
                placeholder="예: 아이와 겨울 여행, 초등 영어 교재"
                className="min-w-0 flex-1 rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] px-4 py-3 text-sm outline-none focus:border-[#9B82AC]"
              />
              <button onClick={() => analyzeKeyword()} disabled={!keyword.trim() || blogLoading} className="rounded-xl bg-[#665174] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">
                키워드 분석하기
              </button>
            </div>
          </div>
        </>
      )}

      {tab === "analyze" && (
        <>
          <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
            <h3 className="font-semibold">키워드 검색 분석</h3>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") analyzeKeyword(); }} className="min-w-0 flex-1 rounded-xl border border-[#EAE6E8] px-4 py-3 text-sm outline-none focus:border-[#9B82AC]" />
              <button onClick={() => analyzeKeyword()} disabled={!keyword.trim() || blogLoading} className="rounded-xl bg-[#665174] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">다시 분석</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-[#A49AA9]">
              <span>{source || "데이터 출처 대기"}</span>
              {collectedAt && <span>조회 시각 {new Date(collectedAt).toLocaleString("ko-KR")}</span>}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F8F5F9] p-4">
              <div>
                <p className="text-xs font-semibold text-[#665174]">분석한 키워드로 글쓰기 시작</p>
                <p className="mt-1 text-[10px] text-[#918995]">키워드를 글쓰기 화면에 자동으로 전달합니다.</p>
              </div>
              <button onClick={() => onUseKeyword?.(keyword.trim())} disabled={!keyword.trim()} className="rounded-xl bg-[#665174] px-4 py-3 text-xs font-semibold text-white disabled:opacity-40">
                이 키워드로 글쓰기 →
              </button>
            </div>
          </div>

          {trends.map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">검색 관심도 추이 · {item.title}</h3>
                <span className="text-[10px] text-[#806B8E]">{formatChange(item.data ?? [])}</span>
              </div>
              <div className="mt-4 flex h-24 items-end gap-1">
                {(item.data ?? []).map((point) => (
                  <div key={point.period} title={`${point.period}: ${point.ratio}`} className="flex-1 rounded-t-sm bg-[#9B82AC]" style={{ height: `${Math.max(3, Number(point.ratio))}%` }} />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[9px] text-[#A49AA9]">
                <span>{item.data?.[0]?.period}</span>
                <span>{item.data?.[item.data.length - 1]?.period}</span>
              </div>
              <p className="mt-3 text-[10px] leading-5 text-[#A49AA9]">상대 검색 관심도 지수입니다. 기간 내 가장 높은 시점이 100이며, 월간 검색 횟수나 절대 검색량을 의미하지 않습니다.</p>
            </div>
          ))}

          <div className="overflow-hidden rounded-2xl border border-[#ECE8EA] bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0ECF1] p-5">
              <div>
                <h3 className="font-semibold">네이버 블로그 검색 결과</h3>
                <p className="mt-1 text-xs text-[#A49AA9]">정확도순으로 반환된 검색 결과입니다. 고정된 실제 노출 순위와는 다를 수 있습니다.</p>
              </div>
              {blogTotal !== null && <span className="text-[11px] text-[#806B8E]">API 전체 결과 {blogTotal.toLocaleString("ko-KR")}건</span>}
            </div>
            {blogLoading ? (
              <p className="p-6 text-sm text-[#918995]">네이버 블로그 검색 결과를 가져오고 있어요.</p>
            ) : blogItems.length > 0 ? (
              <div className="divide-y divide-[#F0ECF1]">
                {blogItems.map((item, index) => (
                  <article key={item.link || index} className="p-5">
                    <a href={item.link} target="_blank" rel="noreferrer" className="text-sm font-semibold leading-6 text-[#665174] hover:underline">{item.title}</a>
                    <p className="mt-2 text-xs leading-5 text-[#817787]">{item.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-[#A49AA9]">
                      <a href={item.bloggerlink} target="_blank" rel="noreferrer">{item.bloggername}</a>
                      <span>{dateLabel(item.postdate)}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="p-6 text-sm text-[#A49AA9]">아직 조회 결과가 없습니다. 키워드를 입력해 분석을 실행해 주세요.</p>
            )}
          </div>
        </>
      )}

      {tab === "templates" && (
        <>
          <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
            <h3 className="font-semibold">검색 결과를 글쓰기 템플릿으로 연결</h3>
            <p className="mt-2 text-xs leading-6 text-[#A49AA9]">
              현재 연결된 블로그 API는 제목과 요약문, 블로그 주소, 작성일을 제공합니다. 본문 전체와 실제 사진 배치 정보는 제공하지 않으므로, URL을 열어 확인하거나 본문을 별도로 제공받은 뒤 분석해야 합니다.
            </p>
            <div className="mt-4 rounded-xl bg-[#F8F5F9] p-4">
              <p className="text-xs font-semibold text-[#665174]">다음 단계의 템플릿 분석 항목</p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-[#817787]">
                <li>· 실제 검색 결과 제목의 키워드·대상·지역 구성</li>
                <li>· 검색 결과 요약문에서 확인되는 정보 유형</li>
                <li>· 사용자가 제공한 본문에서 소제목·구성·사진 패턴 분석</li>
                <li>· 상위 글에서 빠진 정보와 우리 경험으로 보완할 지점 도출</li>
              </ul>
            </div>
            <button onClick={() => copy(blogItems.map((item) => `${item.title}\n${item.link}\n${item.description}`).join("\n\n"))} disabled={blogItems.length === 0} className="mt-4 rounded-xl bg-[#665174] px-5 py-3 text-xs font-semibold text-white disabled:opacity-40">
              현재 검색 결과 복사
            </button>
          </div>
        </>
      )}

      <p className="px-1 text-[10px] leading-5 text-[#A49AA9]">
        데이터 기준: 네이버 API HUB 응답을 사용합니다. 검색 관심도는 상대 지수이며 절대 검색량이 아닙니다. 블로그 검색 API의 전체 결과 건수는 API 검색 결과의 total 값으로, 키워드 도구의 월간 검색량이나 정확한 경쟁 문서 수와 동일하지 않습니다. 검색 결과는 사용자·시점·검색 조건에 따라 달라질 수 있습니다.
      </p>
    </section>
  );
}
