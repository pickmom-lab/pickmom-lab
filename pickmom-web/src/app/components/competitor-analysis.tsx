"use client";

import { useState } from "react";

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
const topPosts = [
  { title: "서울 아이와 가볼 만한 곳, 겨울 실내 체험 BEST", blog: "예시 블로그 A", pattern: "지역+대상+시즌+추천형", sections: ["장소 한눈에 비교", "연령별 추천", "이용 요금과 예약", "주차와 방문 팁"] },
  { title: "아이랑 주말 어디 가지? 서울 실내 놀거리 모음", blog: "예시 블로그 B", pattern: "질문형 도입+리스트형", sections: ["방문 전 요약", "장소별 특징", "아이 반응과 추천 연령", "운영 시간·주차"] },
  { title: "겨울방학 아이와 가기 좋은 서울 체험 공간 7곳", blog: "예시 블로그 C", pattern: "숫자 리스트+상황 해결형", sections: ["추천 기준", "체험별 소개", "가격·예약 정보", "방문 시 유의점"] },
];

export default function CompetitorAnalysis() {
  const [tab, setTab] = useState("discover");
  const [keyword, setKeyword] = useState("서울 아이와 겨울 실내 가볼 만한 곳");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Array<{title:string;link:string;description:string;bloggerName:string;bloggerLink:string;postDate:string}>>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [total, setTotal] = useState(0);
  const searchBlogs = async () => {
    if (!keyword.trim()) return;
    setLoading(true); setSearchError(""); setSearched(true);
    try {
      const response = await fetch(`/api/naver/blog-search?query=${encodeURIComponent(keyword.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "검색에 실패했습니다.");
      setResults(data.items || []); setTotal(data.total || 0);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "검색 중 오류가 발생했습니다.");
      setResults([]); setTotal(0);
    } finally { setLoading(false); }
  };
  const [selected, setSelected] = useState<string[]>(["서울 아이와 가볼 만한 곳", "서울 아이와 실내 체험"]);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const [expanded, setExpanded] = useState(0);
  const copy = (value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(value);
    setToast("복사했어요.");
  };
  const saveTemplate = () => { setSaved(true); setToast("분석한 구성 요소를 글쓰기 템플릿에 반영할 준비가 됐어요."); };
  return (
    <section className="mx-auto max-w-6xl space-y-5 pb-8">
      <div className="rounded-3xl bg-[#665174] p-6 text-white md:p-8">
        <p className="text-[10px] tracking-[.2em] text-[#DCCFE5]">PICKMOM LAB · CONTENT RADAR</p>
        <h2 className="mt-3 text-2xl font-semibold md:text-3xl">검색되는 키워드부터 찾기</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#E8DFEC]">사람들이 찾는 주제를 발견하고, 검색 결과를 분석해 우리 블로그만의 글쓰기 템플릿으로 연결해요.</p>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-white/15 px-3 py-1.5">01 키워드 발굴</span><span className="rounded-full bg-white/15 px-3 py-1.5">02 상위 글 분석</span><span className="rounded-full bg-white/15 px-3 py-1.5">03 템플릿 업데이트</span>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[#ECE8EA] bg-white p-2">
        {[["discover","키워드 발굴"],["analyze","키워드 분석"],["templates","상위 글 분석 · 템플릿"]].map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`shrink-0 rounded-xl px-4 py-3 text-xs font-semibold ${tab===id?"bg-[#665174] text-white":"text-[#817787] hover:bg-[#F8F5F9]"}`}>{label}</button>)}
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
          <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={keyword} onChange={e=>setKeyword(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&keyword.trim()){setTab("analyze");searchBlogs();}}} placeholder="예: 아이와 겨울 여행, 초등 영어 교재" className="min-w-0 flex-1 rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] px-4 py-3 text-sm outline-none focus:border-[#9B82AC]"/><button onClick={()=>{setTab("analyze");searchBlogs();}} disabled={!keyword.trim()} className="rounded-xl bg-[#665174] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">키워드 분석하기</button></div>
        </div>
      </>}

      {tab==="analyze" && <>
        <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
          <h3 className="font-semibold">키워드 검색량·경쟁도 분석</h3><div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="분석할 키워드 입력" className="min-w-0 flex-1 rounded-xl border border-[#EAE6E8] px-4 py-3 text-sm outline-none focus:border-[#9B82AC]"/><button onClick={searchBlogs} disabled={!keyword.trim()||loading} className="rounded-xl bg-[#665174] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">{loading?"검색 중...":"네이버 블로그 검색"}</button></div>
          <p className="mt-3 text-[10px] leading-5 text-[#A49AA9]">실제 월간 검색량은 네이버 검색광고 키워드 도구/API, 블로그 문서 수와 노출 글은 네이버 검색 결과를 연결해 표시해야 합니다. 아직 API 연결 전이므로 숫자를 임의로 만들지 않습니다.</p>
        </div>
        {searchError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">{searchError}</div>}
        {results.length > 0 && <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">네이버 블로그 검색 결과</h3><span className="text-[11px] text-[#918995]">총 {total.toLocaleString()}건 중 {results.length}건 · 유사도순</span></div><div className="mt-4 space-y-3">{results.map((item,i)=><article key={item.link} className="rounded-xl border border-[#F0ECF1] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] text-[#9B82AC]">{item.bloggerName || "블로그"} · {item.postDate}</span><span className="text-[10px] text-[#A49AA9]">검색 결과 {i+1}</span></div><a href={item.link} target="_blank" rel="noreferrer" className="mt-2 block text-sm font-semibold leading-6 text-[#51445A] hover:underline" /><p className="mt-2 text-xs leading-5 text-[#817787]" /><a href={item.bloggerLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[10px] text-[#9B82AC]">블로그 보기 ↗</a></article>)}</div></div>}
        <div className="rounded-2xl border border-[#E9E1ED] bg-[#F8F5F9] p-4"><p className="text-xs font-semibold text-[#665174]">{loading?"네이버 블로그 검색 중입니다.":results.length>0?`네이버 블로그 검색 결과 ${results.length}건을 불러왔어요.`:searched?"검색 결과가 없거나 검색에 실패했습니다.":"분석할 키워드를 입력해 주세요."}</p><p className="mt-1 text-xs leading-5 text-[#817787]">검색량, 블로그 문서 수, 검색량 대비 경쟁도, PC·모바일 비중, 최근 관심도, 연관 키워드를 한 번에 비교하는 영역입니다.</p></div>
        <div className="overflow-hidden rounded-2xl border border-[#ECE8EA] bg-white">
          <div className="border-b border-[#F0ECF1] p-5"><h3 className="font-semibold">연관 키워드 후보</h3><p className="mt-1 text-xs text-[#A49AA9]">키워드를 선택해 글감 후보로 모을 수 있어요.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-[#FAF9FA] text-[#918995]"><tr><th className="p-3">선택</th><th className="p-3">연관 키워드</th><th className="p-3">월 검색량</th><th className="p-3">블로그 문서 수</th><th className="p-3">기회도</th></tr></thead><tbody>{related.map(row=><tr key={row.word} className="border-t border-[#F2EFF3]"><td className="p-3"><input type="checkbox" checked={selected.includes(row.word)} onChange={e=>setSelected(old=>e.target.checked?[...old,row.word]:old.filter(x=>x!==row.word))}/></td><td className="p-3 font-medium text-[#51445A]">{row.word}</td><td className="p-3 text-[#A49AA9]">{row.volume}</td><td className="p-3 text-[#A49AA9]">{row.docs}</td><td className="p-3"><span className="rounded-full bg-[#F5F1F6] px-2 py-1 text-[#806B8E]">{row.score}</span></td></tr>)}</tbody></table></div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F0ECF1] p-4"><span className="text-xs text-[#817787]">{selected.length}개 키워드 선택</span><button onClick={()=>copy(selected.join("
"))} className="rounded-lg bg-[#665174] px-4 py-2 text-xs font-semibold text-white">선택 키워드 복사</button></div>
        </div>
      </>}

      {tab==="templates" && <>
        <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6"><h3 className="font-semibold">검색 결과 상위 블로그 글 비교</h3><p className="mt-1 text-xs leading-5 text-[#A49AA9]">실제 상위 노출 글을 수집한 뒤 제목·소제목·본문 구성·사진 배치·검색 의도를 비교합니다. 아래는 화면 구조 확인용 예시입니다.</p>
          <div className="mt-4 space-y-3">{topPosts.map((post,i)=><div key={post.title} className="rounded-xl border border-[#F0ECF1] p-4"><button onClick={()=>setExpanded(expanded===i?-1:i)} className="flex w-full items-start justify-between gap-3 text-left"><div><p className="text-[10px] text-[#9B82AC]">{post.blog} · 예시 데이터</p><p className="mt-1 text-sm font-semibold leading-6 text-[#51445A]">{post.title}</p><p className="mt-1 text-[10px] text-[#918995]">제목 패턴: {post.pattern}</p></div><span className="text-[#9B82AC]">{expanded===i?"−":"+"}</span></button>{expanded===i&&<div className="mt-3 border-t border-[#F0ECF1] pt-3"><p className="text-xs font-semibold text-[#665174]">본문 목차 패턴</p><ol className="mt-2 space-y-2 text-xs text-[#817787]">{post.sections.map((s,j)=><li key={s}>{j+1}. {s}</li>)}</ol><button onClick={()=>copy(post.sections.join("
"))} className="mt-3 rounded-lg border border-[#E5DCE9] px-3 py-2 text-[11px] text-[#665174]">구성 복사</button></div>}</div>)}</div>
        </div>
        <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold">내 글쓰기 템플릿 업데이트</h3><p className="mt-1 text-xs text-[#A49AA9]">상위 글의 공통 구성은 참고하고, 내 경험과 차별화 요소를 추가합니다.</p></div><span className="rounded-full bg-[#F3EFF5] px-3 py-1 text-[10px] text-[#715B80]">템플릿 연결 예정</span></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2"><div className="rounded-xl bg-[#F8F5F9] p-4"><p className="text-xs font-semibold text-[#665174]">공통으로 참고할 항목</p><ul className="mt-2 space-y-2 text-xs leading-5 text-[#817787]"><li>· 제목에 핵심 키워드와 구체적 대상 포함</li><li>· 첫 부분에 핵심 정보 요약</li><li>· 소제목으로 장소·가격·예약·주차 분리</li><li>· 사진과 실제 경험을 근거로 설명</li></ul></div><div className="rounded-xl bg-[#F8F5F9] p-4"><p className="text-xs font-semibold text-[#665174]">내 글에서 차별화할 항목</p><ul className="mt-2 space-y-2 text-xs leading-5 text-[#817787]"><li>· 우리 아이 연령과 실제 반응</li><li>· 직접 방문하며 확인한 장단점</li><li>· 부모가 결정할 때 필요한 현실 정보</li><li>· 다른 글에 없는 구체적인 팁</li></ul></div></div>
          <button onClick={saveTemplate} className="mt-4 w-full rounded-xl bg-[#665174] px-5 py-3 text-sm font-semibold text-white">{saved?"템플릿 반영 준비 완료":"이 구성을 글쓰기 템플릿에 반영"}</button>
          {saved&&<p className="mt-3 text-xs text-[#665174]">현재 화면에서 반영 상태를 표시했습니다. 실제 글쓰기 템플릿 저장·자동 반영은 다음 연동 단계에서 구현합니다.</p>}
        </div>
      </>}
      {toast&&<div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#51445A] px-4 py-2 text-xs text-white shadow-lg">{toast}<button onClick={()=>setToast("")} className="ml-3">닫기</button></div>}
      <p className="px-1 text-[10px] leading-5 text-[#A49AA9]">데이터 원칙: 검색량·문서 수·급상승률은 공식 또는 확인 가능한 데이터 연결 후 표시합니다. 샘플 화면의 주제와 예시 블로그는 실제 상위 노출 결과가 아닙니다. 상위 노출과 홈판 추천은 별도 노출면으로 구분해 분석합니다.</p>
    </section>
  );
}
