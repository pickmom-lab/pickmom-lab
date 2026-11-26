"use client";

import { useMemo, useState } from "react";

const samplePosts = [
  { title: "아이와 함께 가기 좋은 서울 겨울 실내 여행지 10곳", blog: "오늘도 아이와", date: "2026.11.24", summary: "겨울철 실내 나들이 장소와 예약 정보를 정리한 글", tags: ["서울", "아이와", "실내 여행"], length: "약 2,400자", media: "사진 18장 · 영상 1개" },
  { title: "2026 서울 겨울 실내 놀거리 총정리, 아이랑 주말 나들이", blog: "육아 기록장", date: "2026.11.22", summary: "장소별 특징, 운영 시간, 주차 팁을 소개", tags: ["겨울", "실내 놀거리", "주말"], length: "약 1,900자", media: "사진 14장" },
  { title: "추운 날 아이와 어디 가지? 서울 실내 체험 추천", blog: "엄마의 하루", date: "2026.11.20", summary: "체험형 공간 중심으로 연령별 추천", tags: ["아이 체험", "서울 나들이"], length: "약 2,100자", media: "사진 21장 · 영상 2개" },
  { title: "서울 아이랑 가볼 만한 곳, 겨울방학 실내 코스", blog: "주말 탐험대", date: "2026.11.18", summary: "지역별 장소와 이동 동선을 안내", tags: ["겨울방학", "아이랑 가볼 만한 곳"], length: "약 1,700자", media: "사진 12장" },
];

export default function CompetitorAnalysis() {
  const [keyword, setKeyword] = useState("서울 아이와 겨울 실내 가볼 만한 곳");
  const [count, setCount] = useState("20");
  const [scope, setScope] = useState("검색 결과 기본 분석");
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);
  const ready = keyword.trim().length > 0;
  const commonTags = useMemo(() => ["아이와", "서울", "실내", "겨울", "주차"], []);
  return (
    <section className="mx-auto max-w-5xl space-y-5">
      <div className="rounded-3xl bg-[#665174] p-6 text-white md:p-8">
        <div className="text-xs tracking-widest text-[#E0D5E8]">CONTENT INTELLIGENCE</div>
        <h2 className="mt-3 text-2xl font-semibold">상위 블로그는 어떻게 쓰고 있을까?</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#E6DDEB]">키워드로 검색 결과를 모아 제목, 콘텐츠 구성, 반복되는 정보와 아직 다루지 않은 주제를 비교합니다.</p>
      </div>

      <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">분석 조건</h3>
          <span className="rounded-full bg-[#F3EFF5] px-3 py-1 text-[10px] font-medium text-[#715B80]">화면 시안 · 샘플 데이터</span>
        </div>
        <label className="mt-5 block text-xs font-medium text-[#716777]">분석할 네이버 검색 키워드</label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && ready) setSearched(true); }} placeholder="예: 강남 아이와 가볼 만한 곳" className="min-w-0 flex-1 rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] px-4 py-3 text-sm outline-none focus:border-[#9B82AC]" />
          <button disabled={!ready} onClick={() => setSearched(true)} className="rounded-xl bg-[#665174] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40">분석 시작</button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="block text-xs text-[#918995]">검색 결과 수</label><select value={count} onChange={e => setCount(e.target.value)} className="mt-2 w-full rounded-xl border border-[#EAE6E8] bg-white px-3 py-3 text-sm"><option value="10">상위 10개</option><option value="20">상위 20개</option><option value="30">상위 30개</option></select></div>
          <div><label className="block text-xs text-[#918995]">분석 범위</label><select value={scope} onChange={e => setScope(e.target.value)} className="mt-2 w-full rounded-xl border border-[#EAE6E8] bg-white px-3 py-3 text-sm"><option>검색 결과 기본 분석</option><option>본문 구조 분석 포함</option></select></div>
        </div>
        <p className="mt-3 text-[10px] leading-5 text-[#A49AA9]">실제 네이버 검색 API와 본문 수집은 아직 연결 전입니다. 아래 결과는 화면과 분석 항목을 확인하기 위한 예시이며, 실제 검색 결과가 아닙니다.</p>
      </div>

      {searched && <div className="rounded-xl border border-[#DCD1E3] bg-[#F8F5F9] p-4 text-xs leading-6 text-[#665174]">현재는 UI 데모 모드입니다. ‘{keyword}’ 검색 결과를 실제로 조회한 것은 아니며, 샘플 분석 화면을 표시하고 있습니다. API 연결 후 실제 검색 결과로 대체됩니다.</div>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[["분석 대상", "20개 예시"], ["반복 키워드", "5개 예시"], ["주요 검색 의도", "장소·가격·주차"], ["콘텐츠 갭", "3개 제안"]].map(([k,v]) => <div key={k} className="rounded-2xl border border-[#ECE8EA] bg-white p-4"><p className="text-[11px] text-[#A49AA9]">{k}</p><p className="mt-2 text-sm font-semibold text-[#665174]">{v}</p></div>)}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5">
          <div className="flex items-center justify-between"><h3 className="font-semibold">검색 결과 목록</h3><span className="text-[10px] text-[#A49AA9]">샘플 {count}개 중 4개 표시</span></div>
          <div className="mt-4 space-y-2">
            {samplePosts.map((post,i) => <div key={post.title} className="rounded-xl border border-[#F0ECF1] p-4">
              <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full text-left"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] text-[#9B8BA4]">{post.blog} · {post.date}</p><h4 className="mt-2 text-sm font-semibold leading-6">{post.title}</h4></div><span className="text-[#8D789C]">{expanded === i ? "−" : "+"}</span></div></button>
              {expanded === i && <div className="mt-3 border-t border-[#F0ECF1] pt-3 text-xs leading-6 text-[#817787]"><p>{post.summary}</p><p className="mt-2">본문 길이: {post.length}</p><p>미디어: {post.media}</p><div className="mt-2 flex flex-wrap gap-1">{post.tags.map(t => <span key={t} className="rounded-full bg-[#F5F1F6] px-2 py-1 text-[10px] text-[#715B80]">#{t}</span>)}</div></div>}
            </div>)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5"><h3 className="font-semibold">반복해서 등장하는 키워드</h3><div className="mt-4 flex flex-wrap gap-2">{commonTags.map((t,i)=><span key={t} className="rounded-full bg-[#F3EFF5] px-3 py-2 text-xs text-[#665174]">{t} <b className="ml-1 text-[#A18EAE]">{[18,15,13,11,9][i]}</b></span>)}</div><p className="mt-3 text-[10px] text-[#A49AA9]">※ 빈도는 화면 예시용 임의 수치입니다.</p></div>
          <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5"><h3 className="font-semibold">공통 콘텐츠 구성</h3><ol className="mt-4 space-y-3 text-xs text-[#716777]">{["장소·시설 기본 소개","아이 연령 및 추천 대상","체험·놀이 요소 소개","가격·운영 시간","주차 및 방문 팁"].map((x,i)=><li key={x} className="flex gap-3"><span className="text-[#9B82AC]">{String(i+1).padStart(2,"0")}</span>{x}</li>)}</ol></div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
        <h3 className="font-semibold">경쟁 콘텐츠에서 찾은 작성 기회</h3>
        <p className="mt-1 text-xs text-[#A49AA9]">샘플 데이터를 바탕으로 구성한 제안 예시</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[["방문 전 의사결정 정보","연령별 추천, 실제 소요 시간, 예약 필요 여부를 한눈에 비교"],["엄마 관점의 현실 정보","유모차 동선, 화장실, 식사 공간, 주차 요금을 구체적으로 기록"],["직접 경험 기반 차별화","아이의 실제 반응과 좋았던 점·아쉬웠던 점을 사진과 함께 제시"]].map(([t,d])=><div key={t} className="rounded-xl bg-[#F8F5F9] p-4"><h4 className="text-sm font-semibold text-[#665174]">{t}</h4><p className="mt-2 text-xs leading-6 text-[#817787]">{d}</p></div>)}
        </div>
        <div className="mt-5 rounded-xl border border-[#EAE3EE] p-4"><p className="text-xs font-semibold text-[#665174]">추천 글 구성</p><ol className="mt-3 space-y-2 text-xs leading-6 text-[#716777]">{["방문 전 확인할 핵심 정보 요약","장소별 특징과 아이 연령대","직접 방문했을 때의 동선과 체험","주차·예약·비용 등 실용 정보","추천 대상과 아쉬운 점 정리"].map((x,i)=><li key={x}>{i+1}. {x}</li>)}</ol><button onClick={() => navigator.clipboard?.writeText("방문 전 확인할 핵심 정보 요약\n장소별 특징과 아이 연령대\n직접 방문했을 때의 동선과 체험\n주차·예약·비용 등 실용 정보\n추천 대상과 아쉬운 점 정리")} className="mt-4 rounded-lg bg-[#665174] px-4 py-2 text-xs font-semibold text-white">목차 복사</button></div>
      </div>
      <p className="px-1 text-[10px] leading-5 text-[#A49AA9]">분석 원칙: 실제 검색 결과에서 확인한 사실, 본문에서 추출한 항목, AI가 제안한 해석을 별도 표시합니다. 검색량·방문자 수·블로그 내부 통계처럼 제공되지 않는 값은 추정해 사실처럼 표시하지 않습니다.</p>
    </section>
  );
}
