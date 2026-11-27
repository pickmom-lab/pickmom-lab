"use client";

import { useEffect, useState } from "react";

const trends = [
  { keyword: "서울 크리스마스 마켓", category: "여행·나들이", change: "시즌 주목", intent: "일정·장소·주차" },
  { keyword: "아이와 겨울방학 체험", category: "교육·육아", change: "시즌 주목", intent: "체험·예약·연령" },
  { keyword: "초등 입학 준비물", category: "교육·육아", change: "꾸준한 관심", intent: "준비물·추천·가격" },
  { keyword: "서울 실내 아이랑", category: "여행·나들이", change: "꾸준한 관심", intent: "장소·비용·주차" },
];
const related = [
  { word: "서울 아이와 가볼 만한 곳", volume: "검색량 조회 필요", docs: "문서수 조회 필요", score: "분석 대기" },
  { word: "서울 아이와 실내 체험", volume: "검색량 조회 필요", docs: "문서수 조회 필요", score: "분석 대기" },
  { word: "서울 겨울 실내 놀거리", volume: "검색량 조회 필요", docs: "문서수 조회 필요", score: "분석 대기" },
  { word: "아이와 주말 나들이 서울", volume: "검색량 조회 필요", docs: "문서수 조회 필요", score: "분석 대기" },
  { word: "서울 아이 체험 예약", volume: "검색량 조회 필요", docs: "문서수 조회 필요", score: "분석 대기" },
];
export default function CompetitorAnalysis({ onSelectKeyword, initialKeyword = "" }: { onSelectKeyword: (keyword: string) => void; initialKeyword?: string }) {
  const [tab, setTab] = useState("discover");
  const [keyword, setKeyword] = useState("서울 아이와 겨울 실내 가볼 만한 곳");
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<string[]>(["서울 아이와 가볼 만한 곳", "서울 아이와 실내 체험"]);
  const [toast, setToast] = useState("");
  useEffect(() => { if (initialKeyword.trim()) { setKeyword(initialKeyword); setTab("analyze"); setSearched(false); } }, [initialKeyword]);
  const copy = (value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(value);
    setToast("복사했어요.");
  };
  return (
    <section className="mx-auto max-w-6xl space-y-5 pb-8">
      <div className="rounded-3xl bg-[#665174] p-6 text-white md:p-8">
        <p className="text-[10px] tracking-[.2em] text-[#DCCFE5]">PICKMOM LAB · CONTENT RADAR</p>
        <h2 className="mt-3 text-2xl font-semibold md:text-3xl">검색되는 키워드부터 찾기</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#E8DFEC]">키워드 후보를 비교하고, 선택한 키워드를 블로그 글쓰기 화면으로 바로 가져가요.</p>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-white/15 px-3 py-1.5">01 키워드 발굴</span><span className="rounded-full bg-white/15 px-3 py-1.5">02 글쓰기 연결</span>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[#ECE8EA] bg-white p-2">
        {[["discover","키워드 발굴"],["analyze","키워드 분석"]].map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`shrink-0 rounded-xl px-4 py-3 text-xs font-semibold ${tab===id?"bg-[#665174] text-white":"text-[#817787] hover:bg-[#F8F5F9]"}`}>{label}</button>)}
      </div>

      {tab==="discover" && <>
        <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">오늘의 인기 글감</h3><span className="rounded-full bg-[#FFF5E9] px-3 py-1 text-[10px] text-[#9B7042]">실시간 데이터 연동 전 · 예시 주제</span></div>
          <p className="mt-1 text-xs text-[#A49AA9]">시즌·교육·여행·맛집 등 블로그에 쓸 만한 주제를 빠르게 탐색합니다.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {trends.map((item,i)=><button key={item.keyword} onClick={()=>{setKeyword(item.keyword);setTab("analyze");setSearched(false);}} className="rounded-xl border border-[#F0ECF1] p-4 text-left hover:border-[#B9A7C5]"><div className="flex items-center justify-between gap-2"><span className="text-[10px] text-[#9B82AC]">{item.category}</span><span className="text-[10px] text-[#A49AA9]">{item.change}</span></div><p className="mt-2 text-sm font-semibold text-[#51445A]">{item.keyword}</p><p className="mt-2 text-[11px] text-[#918995]">검색 의도: {item.intent}</p></button>)}
          </div>
        </div>
        <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
          <h3 className="font-semibold">키워드 직접 발굴</h3><p className="mt-1 text-xs text-[#A49AA9]">관심 있는 주제나 상품·장소를 입력해 연관 키워드로 확장하세요.</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={keyword} onChange={e=>setKeyword(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&keyword.trim())setTab("analyze");}} placeholder="예: 아이와 겨울 여행, 초등 영어 교재" className="min-w-0 flex-1 rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] px-4 py-3 text-sm outline-none focus:border-[#9B82AC]"/><button onClick={()=>{setTab("analyze");setSearched(true);}} disabled={!keyword.trim()} className="rounded-xl bg-[#665174] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">키워드 분석하기</button></div>
        </div>
      </>}

      {tab==="analyze" && <>
        <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
          <h3 className="font-semibold">키워드 검색량·경쟁도 분석</h3><div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="분석할 키워드 입력" className="min-w-0 flex-1 rounded-xl border border-[#EAE6E8] px-4 py-3 text-sm outline-none focus:border-[#9B82AC]"/><button onClick={()=>setSearched(true)} disabled={!keyword.trim()} className="rounded-xl bg-[#665174] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">분석 실행</button></div>
          <p className="mt-3 text-[10px] leading-5 text-[#A49AA9]">실제 월간 검색량은 네이버 검색광고 키워드 도구/API, 블로그 문서 수와 노출 글은 네이버 검색 결과를 연결해 표시해야 합니다. 아직 API 연결 전이므로 숫자를 임의로 만들지 않습니다.</p>
        </div>
        <div className="rounded-2xl border border-[#E9E1ED] bg-[#F8F5F9] p-4"><p className="text-xs font-semibold text-[#665174]">{searched?"분석 요청이 입력됐어요. 실제 데이터 연결 전입니다.":"분석할 키워드를 입력해 주세요."}</p><p className="mt-1 text-xs leading-5 text-[#817787]">검색량, 블로그 문서 수, 검색량 대비 경쟁도, PC·모바일 비중, 최근 관심도, 연관 키워드를 한 번에 비교하는 영역입니다.</p></div>
        <div className="overflow-hidden rounded-2xl border border-[#ECE8EA] bg-white">
          <div className="border-b border-[#F0ECF1] p-5"><h3 className="font-semibold">연관 키워드 후보</h3><p className="mt-1 text-xs text-[#A49AA9]">키워드를 선택해 글감 후보로 모을 수 있어요.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-[#FAF9FA] text-[#918995]"><tr><th className="p-3">선택</th><th className="p-3">연관 키워드</th><th className="p-3">월 검색량</th><th className="p-3">블로그 문서 수</th><th className="p-3">기회도</th></tr></thead><tbody>{related.map(row=><tr key={row.word} className="border-t border-[#F2EFF3]"><td className="p-3"><input type="checkbox" checked={selected.includes(row.word)} onChange={e=>setSelected(old=>e.target.checked?[...old,row.word]:old.filter(x=>x!==row.word))}/></td><td className="p-3 font-medium text-[#51445A]">{row.word}</td><td className="p-3 text-[#A49AA9]">{row.volume}</td><td className="p-3 text-[#A49AA9]">{row.docs}</td><td className="p-3"><span className="rounded-full bg-[#F5F1F6] px-2 py-1 text-[#806B8E]">{row.score}</span></td></tr>)}</tbody></table></div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F0ECF1] p-4"><span className="text-xs text-[#817787]">{selected.length}개 키워드 선택</span><button onClick={()=>copy(selected.join("\n"))} className="rounded-lg border border-[#E5DCE9] px-4 py-2 text-xs font-semibold text-[#665174]">선택 키워드 복사</button></div>
          <div className="border-t border-[#F0ECF1] p-4"><p className="mb-3 text-xs font-semibold text-[#665174]">글쓰기로 가져갈 키워드 하나를 선택하세요.</p><div className="flex flex-wrap gap-2">{related.filter(row=>selected.includes(row.word)).map(row=><button key={row.word} onClick={()=>onSelectKeyword(row.word)} aria-label={`‘${row.word}’ 글쓰기 시작`} title="이 키워드로 글쓰기" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#665174] text-white"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m14 4 6 6"/><path d="M5 19 4 20l1-5L16 4a2.1 2.1 0 0 1 3 3L8 18z"/></svg></button>)}</div></div>
        </div>
      </>}

      {toast&&<div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#51445A] px-4 py-2 text-xs text-white shadow-lg">{toast}<button onClick={()=>setToast("")} className="ml-3">닫기</button></div>}
      <p className="px-1 text-[10px] leading-5 text-[#A49AA9]">데이터 원칙: 검색량·문서 수·급상승률은 공식 또는 확인 가능한 데이터 연결 후 표시합니다. 샘플 화면의 주제와 예시 블로그는 실제 상위 노출 결과가 아닙니다. 상위 노출과 홈판 추천은 별도 노출면으로 구분해 분석합니다.</p>
    </section>
  );
}
