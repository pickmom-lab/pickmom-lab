"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const trends = [
  { keyword: "서울 크리스마스 마켓", category: "여행·나들이", change: "시즌 주목", intent: "일정·장소·주차" },
  { keyword: "아이와 겨울방학 체험", category: "교육·육아", change: "시즌 주목", intent: "체험·예약·연령" },
  { keyword: "초등 입학 준비물", category: "교육·육아", change: "꾸준한 관심", intent: "준비물·추천·가격" },
  { keyword: "서울 실내 아이랑", category: "여행·나들이", change: "꾸준한 관심", intent: "장소·비용·주차" },
];

const relatedSeeds = [
  "가볼 만한 곳",
  "추천",
  "후기",
  "가격",
  "비교",
  "예약 방법",
];

function makeKeywordRows(keyword: string) {
  const base = keyword.trim();
  if (!base) return { recommended: [], related: [] };
  const recommended = [
    { word: base, kind: "입력한 키워드" },
    { word: `${base} 추천`, kind: "추천 확장" },
    { word: `${base} 후기`, kind: "추천 확장" },
    { word: `${base} 가격`, kind: "추천 확장" },
  ];
  const recommendedWords = new Set(recommended.map((row) => row.word));
  return {
    recommended,
    // 추천 키워드에 이미 노출된 표현은 연관 키워드에서 제외해 중복 선택을 방지합니다.
    related: relatedSeeds
      .map((suffix) => ({ word: `${base} ${suffix}`, kind: "연관 확장" }))
      .filter((row) => !recommendedWords.has(row.word)),
  };
}

export default function CompetitorAnalysis({ onSelectKeyword, initialKeyword = "" }: { onSelectKeyword: (keyword: string) => void; initialKeyword?: string }) {
  const [tab, setTab] = useState("discover");
  const [keyword, setKeyword] = useState("서울 아이와 겨울 실내 가볼 만한 곳");
  const [searched, setSearched] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [toast, setToast] = useState("");
  const [documentCounts, setDocumentCounts] = useState<Record<string, number | null>>({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const query = initialKeyword.trim();
    if (query) {
      setKeyword(query);
      setTab("analyze");
      setSelectedKeyword("");
      runAnalysis(query);
    }
  }, [initialKeyword, runAnalysis]);

  const rows = useMemo(() => makeKeywordRows(keyword), [keyword]);
  const copy = (value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(value);
    setToast("복사했어요.");
  };
  const runAnalysis = useCallback(async (inputKeyword: string) => {
    const query = inputKeyword.trim();
    if (!query) return;
    setSearched(true);
    setSelectedKeyword("");
    setDocumentCounts({});
    setApiError("");
    setLoadingCounts(true);
    const candidates = makeKeywordRows(query);
    const words = [...candidates.recommended, ...candidates.related].map((row) => row.word);
    const results = await Promise.allSettled(words.map(async (word) => {
      const response = await fetch("/api/naver/blog-search?query=" + encodeURIComponent(word), { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "블로그 검색에 실패했습니다.");
      return [word, Number(data.total ?? 0)] as const;
    }));
    const nextCounts: Record<string, number | null> = {};
    let failures = 0;
    results.forEach((result, index) => {
      if (result.status === "fulfilled") nextCounts[result.value[0]] = result.value[1];
      else { nextCounts[words[index]] = null; failures += 1; }
    });
    setDocumentCounts(nextCounts);
    if (failures === words.length) setApiError("네이버 API 연결에 실패했어요. Vercel 환경변수와 API 권한을 확인해 주세요.");
    else if (failures > 0) setApiError(failures + "개 키워드의 문서 수를 불러오지 못했어요.");
    setLoadingCounts(false);
  }, []);

  return (
    <section className="mx-auto max-w-6xl space-y-5 pb-8">
      <div className="rounded-3xl bg-[#665174] p-6 text-white md:p-8">
        <p className="text-[10px] tracking-[.2em] text-[#DCCFE5]">PICKMOM LAB · CONTENT RADAR</p>
        <h2 className="mt-3 text-2xl font-semibold md:text-3xl">검색되는 키워드부터 찾기</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#E8DFEC]">키워드 후보를 비교하고, 최종 키워드 하나를 선택해 블로그 글쓰기로 연결해요.</p>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-white/15 px-3 py-1.5">01 키워드 발굴</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5">02 키워드 선택</span>
          <span className="rounded-full bg-white/15 px-3 py-1.5">03 글쓰기 연결</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[#ECE8EA] bg-white p-2">
        {[["discover", "키워드 발굴"], ["analyze", "키워드 분석"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`shrink-0 rounded-xl px-4 py-3 text-xs font-semibold ${tab === id ? "bg-[#665174] text-white" : "text-[#817787] hover:bg-[#F8F5F9]"}`}>{label}</button>
        ))}
      </div>

      {tab === "discover" && (
        <>
          <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">오늘의 인기 글감</h3>
              <span className="rounded-full bg-[#FFF5E9] px-3 py-1 text-[10px] text-[#9B7042]">실시간 데이터 연동 전 · 예시 주제</span>
            </div>
            <p className="mt-1 text-xs text-[#A49AA9]">시즌·교육·여행·맛집 등 블로그에 쓸 만한 주제를 빠르게 탐색합니다.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {trends.map((item) => (
                <button key={item.keyword} onClick={() => { setKeyword(item.keyword); setTab("analyze"); setSearched(false); setSelectedKeyword(""); }} className="rounded-xl border border-[#F0ECF1] p-4 text-left hover:border-[#B9A7C5]">
                  <div className="flex items-center justify-between gap-2"><span className="text-[10px] text-[#9B82AC]">{item.category}</span><span className="text-[10px] text-[#A49AA9]">{item.change}</span></div>
                  <p className="mt-2 text-sm font-semibold text-[#51445A]">{item.keyword}</p>
                  <p className="mt-2 text-[11px] text-[#918995]">검색 의도: {item.intent}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
            <h3 className="font-semibold">키워드 직접 발굴</h3>
            <p className="mt-1 text-xs text-[#A49AA9]">관심 있는 주제나 상품·장소를 입력해 추천 키워드와 연관 키워드를 확인하세요.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && keyword.trim()) { setTab("analyze"); runAnalysis(keyword); } }} placeholder="예: 아이와 겨울 여행, 초등 영어 교재" className="min-w-0 flex-1 rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] px-4 py-3 text-sm outline-none focus:border-[#9B82AC]" />
              <button onClick={() => { setTab("analyze"); runAnalysis(keyword); }} disabled={!keyword.trim()} className="rounded-xl bg-[#665174] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">키워드 분석하기</button>
            </div>
          </div>
        </>
      )}

      {tab === "analyze" && (
        <>
          <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
            <h3 className="font-semibold">분석할 키워드</h3>
            <p className="mt-1 text-xs text-[#A49AA9]">처음 입력한 검색어를 확인하고, 필요하면 수정한 뒤 분석을 실행하세요.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input value={keyword} onChange={(e) => { setKeyword(e.target.value); setSearched(false); setSelectedKeyword(""); setDocumentCounts({}); setApiError(""); }} onKeyDown={(e) => { if (e.key === "Enter") runAnalysis(keyword); }} placeholder="분석할 키워드 입력" className="min-w-0 flex-1 rounded-xl border border-[#EAE6E8] px-4 py-3 text-sm outline-none focus:border-[#9B82AC]" />
              <button onClick={() => runAnalysis(keyword)} disabled={!keyword.trim()} className="rounded-xl bg-[#665174] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">분석 실행</button>
            </div>
          </div>

          {searched && (
            <>
              <div className="rounded-2xl border border-[#E9E1ED] bg-[#F8F5F9] p-4">
                <p className="text-xs font-semibold text-[#665174]">‘{keyword}’ 키워드 후보</p>
                <p className="mt-1 text-xs leading-5 text-[#817787]">아래 두 영역에서 글쓰기에 사용할 키워드 하나를 선택하세요. 선택은 두 영역 전체에서 한 번에 하나만 가능합니다.</p>
              </div>

              <KeywordSection
                title="추천 키워드"
                description="입력한 키워드와 글쓰기 주제를 구체화할 수 있는 확장 후보입니다."
                rows={rows.recommended}
                documentCounts={documentCounts}
                loadingCounts={loadingCounts}
                selectedKeyword={selectedKeyword}
                onSelect={setSelectedKeyword}
              />

              <KeywordSection
                title="연관 키워드"
                description="검색 의도를 세분화해 함께 검토할 수 있는 연관 표현입니다."
                rows={rows.related}
                documentCounts={documentCounts}
                loadingCounts={loadingCounts}
                selectedKeyword={selectedKeyword}
                onSelect={setSelectedKeyword}
              />

              {apiError && <p role="status" className="rounded-xl bg-[#FFF7F1] px-4 py-3 text-xs text-[#956B4B]">{apiError}</p>}

              <div className="sticky bottom-20 z-10 rounded-2xl border border-[#E5DCE9] bg-white p-4 shadow-lg md:bottom-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#665174]">선택한 키워드</p>
                    <p className="mt-1 truncate text-sm text-[#51445A]">{selectedKeyword || "키워드를 하나 선택해 주세요."}</p>
                  </div>
                  <button onClick={() => selectedKeyword && onSelectKeyword(selectedKeyword)} disabled={!selectedKeyword} className="shrink-0 rounded-xl bg-[#665174] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#C9C1CE]">선택한 키워드로 글쓰기 →</button>
                </div>
              </div>
            </>
          )}
          {!searched && (
            <div className="rounded-2xl border border-dashed border-[#DCD3E1] bg-[#FCFBFC] p-8 text-center">
              <p className="text-sm font-semibold text-[#665174]">키워드 분석을 시작해 주세요.</p>
              <p className="mt-2 text-xs leading-5 text-[#A49AA9]">분석 실행 후 추천 키워드와 연관 키워드가 표시됩니다.</p>
            </div>
          )}
        </>
      )}

      {toast && <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#51445A] px-4 py-2 text-xs text-white shadow-lg">{toast}<button onClick={() => setToast("")} className="ml-3">닫기</button></div>}
      <p className="px-1 text-[10px] leading-5 text-[#A49AA9]">데이터 원칙: 현재 이 화면은 키워드 확장 후보를 보여주는 UI이며, 검색량·문서 수는 아직 API에 연결되지 않았습니다. 실제 값이 연결되기 전에는 숫자를 임의로 표시하지 않습니다. 현재 추천·연관 표현은 예시 확장어이며 실시간 검색량 기반 추천이 아닙니다.</p>
    </section>
  );
}

function KeywordSection({ title, description, rows, documentCounts, loadingCounts, selectedKeyword, onSelect }: {
  title: string;
  description: string;
  rows: { word: string; kind: string }[];
  documentCounts: Record<string, number | null>;
  loadingCounts: boolean;
  selectedKeyword: string;
  onSelect: (keyword: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#ECE8EA] bg-white">
      <div className="border-b border-[#F0ECF1] p-5">
        <h3 className="font-semibold text-[#51445A]">{title}</h3>
        <p className="mt-1 text-xs text-[#A49AA9]">{description}</p>
      </div>
      <div className="w-full">
        <table className="w-full table-fixed text-left text-[10px] sm:text-xs">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[36%]" />
            <col className="w-[24%]" />
            <col className="w-[28%]" />
          </colgroup>
          <thead className="bg-[#FAF9FA] text-[#918995]">
            <tr>
              <th className="break-keep px-1.5 py-3 text-center sm:px-3">선택</th>
              <th className="break-keep px-1.5 py-3 sm:px-3">키워드</th>
              <th className="break-keep px-1.5 py-3 sm:px-3">월 검색량</th>
              <th className="break-keep px-1.5 py-3 sm:px-3">블로그 문서 수</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const count = documentCounts[row.word];
              return (
              <tr key={row.word} className={`border-t border-[#F2EFF3] ${selectedKeyword === row.word ? "bg-[#F8F5F9]" : ""}`}>
                <td className="px-1.5 py-3 text-center sm:px-3">
                  <input type="radio" name="final-keyword" aria-label={`${row.word} 선택`} checked={selectedKeyword === row.word} onChange={() => onSelect(row.word)} className="h-4 w-4 accent-[#665174]" />
                </td>
                <td className="break-words px-1.5 py-3 sm:px-3">
                  <span className="font-medium text-[#51445A]">{row.word}</span>
                  <span className="mt-1 block text-[9px] text-[#806B8E] sm:inline sm:ml-2 sm:mt-0">{row.kind}</span>
                </td>
                <td className="break-words px-1.5 py-3 text-[#A49AA9] sm:px-3">별도 데이터 필요</td>
                <td className="break-words px-1.5 py-3 text-[#665174] sm:px-3">{loadingCounts ? "조회 중…" : count === null ? "조회 실패" : count === undefined ? "—" : count.toLocaleString("ko-KR")}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
