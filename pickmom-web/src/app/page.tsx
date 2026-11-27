"use client";

import { useEffect, useMemo, useState } from "react";
import CompetitorAnalysis from "./components/competitor-analysis";
import PopularPostTemplates from "./components/popular-post-templates";
import WritingStudio from "./components/writing-studio";

type Category = "리빙·제품" | "맛집·카페" | "여행·체험" | "교육 정보" | "부동산·주거" | "생활·정책";
type Purpose = "경험 리뷰" | "비교·분석" | "정보 제공" | "문제 해결" | "추천·판매" | "직접 경험·방문 후기" | "정보 전달" | "추천·소개" | "문제 해결·노하우";
type Status = "아이디어" | "키워드 선정" | "자료 조사" | "원고 작성" | "발행 준비" | "발행 완료";
type Post = {
  id: number;
  title: string;
  keyword: string;
  category: Category;
  purpose: Purpose;
  date: string;
  status: Status;
  draft: string;
  url?: string;
  photos?: string[];
  formData?: string;
};
type DraftInput = {
  topic: string;
  keyword: string;
  category: Category;
  purpose: Purpose;
  notes: string;
  research: string;
};

const categories: Category[] = ["리빙·제품", "쇼핑·제품", "맛집·카페", "여행·체험", "교육 정보", "부동산·주거", "생활·정책"];
const purposes: Purpose[] = ["경험 리뷰", "비교·분석", "정보 제공", "문제 해결", "추천·판매"];
const statuses: Status[] = ["아이디어", "키워드 선정", "자료 조사", "원고 작성", "발행 준비", "발행 완료"];
const ideas = [
  { category: "리빙·제품" as Category, title: "겨울철 집안 정리, 자주 쓰는 물건부터 바꾸기", keyword: "겨울 집 정리", purpose: "문제 해결" as Purpose, why: "계절 변화와 생활 불편을 연결한 실용형 주제" },
  { category: "리빙·제품" as Category, title: "매일 쓰는 주방 수납용품, 구매 전 확인할 기준", keyword: "주방 수납용품 추천", purpose: "비교·분석" as Purpose, why: "구매 전 비교 기준을 제시하기 좋은 주제" },
  { category: "맛집·카페" as Category, title: "아이와 함께 방문한 식당, 방문 전 확인할 것", keyword: "아이와 가기 좋은 식당", purpose: "경험 리뷰" as Purpose, why: "주차·좌석·메뉴 등 실제 경험을 담기 좋은 주제" },
  { category: "여행·체험" as Category, title: "추운 날 아이와 가기 좋은 실내 체험 정리", keyword: "겨울 아이 실내 체험", purpose: "정보 제공" as Purpose, why: "시즌성과 지역 정보를 결합할 수 있는 주제" },
  { category: "교육 정보" as Category, title: "초등 입학 전 준비, 지금 확인할 생활 습관", keyword: "초등 입학 전 준비", purpose: "정보 제공" as Purpose, why: "학부모의 구체적인 준비 질문에 답하는 주제" },
  { category: "생활·정책" as Category, title: "연말에 놓치기 쉬운 생활 지원·신청 일정 확인", keyword: "연말 생활 지원 정보", purpose: "정보 제공" as Purpose, why: "공식 일정과 신청 조건 확인이 핵심인 주제" },
  { category: "부동산·주거" as Category, title: "이사 전 체크해야 할 관리비와 주거 비용 항목", keyword: "이사 전 주거 비용", purpose: "문제 해결" as Purpose, why: "실제 의사결정에 필요한 체크리스트형 주제" },
];

const statusClass: Record<Status, string> = {
  "아이디어": "bg-stone-100 text-stone-600",
  "키워드 선정": "bg-violet-50 text-violet-700",
  "자료 조사": "bg-sky-50 text-sky-700",
  "원고 작성": "bg-amber-50 text-amber-700",
  "발행 준비": "bg-orange-50 text-orange-700",
  "발행 완료": "bg-emerald-50 text-emerald-700",
};

function mondayOf(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}
function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}
function makeDraft(input: DraftInput, angle: string) {
  const topic = input.topic.trim() || input.keyword.trim() || "이번 주 기록";
  const keyword = input.keyword.trim() || topic;
  const personal = input.notes.trim() || "직접 경험한 내용과 확인한 사실을 이 부분에 구체적으로 정리해 주세요.";
  const facts = input.research.trim() || "가격·운영시간·주소·이용 조건 등 변동될 수 있는 정보는 발행 전에 공식 자료로 확인해 주세요.";
  return `# ${topic}

${keyword}를 찾는 분들이 실제로 궁금해할 내용을 중심으로 정리해 봤어요. 이번 글은 ${angle} 방향으로 구성합니다.

## 먼저 정리하는 핵심 내용
이 글에서 다룰 내용과 확인해야 할 기준을 간단히 소개해 주세요. 독자가 이 글을 읽고 무엇을 알 수 있는지 첫 부분에서 분명하게 전달합니다.

## 직접 경험하거나 확인한 내용
${personal}

## 알아두면 좋은 정보
${facts}

## 선택할 때 살펴볼 점
- 내 상황과 사용 목적에 맞는지 확인하기
- 가격과 조건은 작성 시점 기준으로 다시 확인하기
- 장점뿐 아니라 아쉬운 점과 주의할 점도 함께 비교하기

## 마무리
${keyword}를 알아보는 분들에게 도움이 되도록 핵심 내용을 정리했어요. 실제 경험과 확인된 정보를 구분해 참고해 주세요.

---
※ 이 초안은 입력한 메모를 바탕으로 만든 편집용 구조입니다. 확인되지 않은 정보나 경험을 사실처럼 추가하지 않았으며, 발행 전 사실 확인과 문장 보완이 필요합니다.`;
}

export default function Home() {
  const [page, setPage] = useState<"home" | "keywords" | "templates" | "writing" | "calendar">("home");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const [topicMode, setTopicMode] = useState<"direct" | "popular" | "category" | null>(null);
  const [directKeyword, setDirectKeyword] = useState("");
  const [popularKeyword, setPopularKeyword] = useState("");
  const [topicCategory, setTopicCategory] = useState<Category | "">("");
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [draftInput, setDraftInput] = useState<DraftInput>({
    topic: "", keyword: "", category: "리빙·제품", purpose: "경험 리뷰", notes: "", research: "",
  });
  const [angle, setAngle] = useState("");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [writingStep, setWritingStep] = useState<1 | 2 | 3>(1);
  const [photos, setPhotos] = useState<string[]>([]);
  // Use deterministic initial values during prerender; set the real date after mount.
  const [today, setToday] = useState(() => new Date(2000, 0, 1));
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(2000, 0, 1));
  const [scheduleDate, setScheduleDate] = useState("2000-01-01");

  useEffect(() => {
    const now = new Date();
    setToday(now);
    setCalendarMonth(now);
    setScheduleDate(dateKey(now));
    try {
      const raw = window.localStorage.getItem("pickmom-blog-posts-v2");
      if (raw) setPosts(JSON.parse(raw) as Post[]);
    } catch {
      // Ignore invalid local data and keep the workspace usable.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem("pickmom-blog-posts-v2", JSON.stringify(posts));
  }, [posts, loaded]);

  const weekStart = mondayOf(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const thisWeekPosts = posts.filter((post) => {
    const d = new Date(post.date + "T00:00:00");
    return d >= weekStart && d <= weekEnd;
  });
  const publishedCount = thisWeekPosts.filter((post) => post.status === "발행 완료").length;
  const progress = Math.min(100, Math.round((publishedCount / 5) * 100));

  const monthDays = useMemo(() => {
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const start = mondayOf(first);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [calendarMonth]);

  const navigate = (next: typeof page) => setPage(next);
  const inferCategory = (value: string): Category => {
    const text = value.toLowerCase();
    if (/맛집|식당|카페|디저트|빵|케이크|쿠키|국수|고기|음식/.test(text)) return "맛집·카페";
    if (/여행|호텔|리조트|나들이|체험|전시|마켓|가볼|실내/.test(text)) return "여행·체험";
    if (/영어|수학|초등|유치원|학원|교육|책|독서|입학/.test(text)) return "교육 정보";
    if (/부동산|아파트|전세|월세|청약|이사|주거/.test(text)) return "부동산·주거";
    if (/선물|추천|구매|가격|제품|상품|쇼핑/.test(text)) return "쇼핑·제품";
    if (/지원금|정책|신청|정부|할인|혜택|노동절|공휴일/.test(text)) return "생활·정책";
    return "리빙·제품";
  };
  const startWriting = (topic = "", keyword = "", category?: Category, purpose?: Purpose) => {
    const detectedCategory = category || inferCategory(keyword || topic);
    const detectedPurpose = purpose || (detectedCategory === "맛집·카페" || detectedCategory === "여행·체험" ? "경험 리뷰" : "정보 제공");
    setDraftInput({ topic, keyword, category: detectedCategory, purpose: detectedPurpose, notes: "", research: "" });
    setScheduleDate(dateKey(new Date()));
    setAngle("");
    setDraft("");
    setPhotos([]);
    setWritingStep(1);
    setEditingId(null);
    setPage("writing");
  };
  const savePost = (status: Status = "원고 작성") => {
    const title = draftInput.topic.trim() || draftInput.keyword.trim() || "제목 미정";
    if (editingId) {
      setPosts((old) => old.map((p) => p.id === editingId ? { ...p, title, keyword: draftInput.keyword, category: draftInput.category, purpose: draftInput.purpose, date: scheduleDate, draft, photos, status } : p));
    } else {
      setPosts((old) => [{ id: Date.now(), title, keyword: draftInput.keyword, category: draftInput.category, purpose: draftInput.purpose, date: scheduleDate, status, draft, photos }, ...old]);
    }
    setPage("calendar");
  };
  const editPost = (post: Post) => {
    setEditingId(post.id);
    setDraftInput({ topic: post.title, keyword: post.keyword, category: post.category, purpose: post.purpose, notes: "", research: "" });
    setScheduleDate(post.date || dateKey(new Date()));
    setDraft(post.draft);
    setPhotos(post.photos || []);
    setAngle(post.purpose === "비교·분석" ? "비교 중심" : post.purpose === "정보 제공" ? "정보 중심" : post.purpose === "문제 해결" ? "문제 해결 중심" : "경험 중심");
    setWritingStep(post.draft ? 3 : 2);
    setPage("writing");
  };
  const updatePost = (id: number, patch: Partial<Post>) => setPosts((old) => old.map((p) => p.id === id ? { ...p, ...patch } : p));
  const addIdeaToCalendar = (idea: typeof ideas[number]) => {
    setPosts((old) => [{ id: Date.now(), title: idea.title, keyword: idea.keyword, category: idea.category, purpose: idea.purpose, date: dateKey(new Date()), status: "아이디어", draft: "" }, ...old]);
    setSelectedIdea(null);
  };

  const navItems = [
    { id: "home" as const, label: "홈", icon: "⌂" },
    { id: "keywords" as const, label: "키워드 연구소", icon: "⌕" },
    { id: "writing" as const, label: "글쓰기", icon: "✎" },
    { id: "calendar" as const, label: "콘텐츠 캘린더", icon: "▦" },
    { id: "templates" as const, label: "인기글 분석·템플릿", icon: "▤" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F4] text-[#29252D]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[250px] shrink-0 border-r border-[#EAE6E8] bg-white px-6 py-8 md:flex md:flex-col">
          <button onClick={() => navigate("home")} className="mb-12 text-left">
            <div className="text-[23px] font-bold tracking-tight text-[#5B456D]">PICKMOM LAB</div>
            <div className="mt-2 text-[10px] tracking-[0.18em] text-[#A49AA9]">BLOG CONTENT WORKSPACE</div>
          </button>
          <p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-[#A49AA9]">BLOG WORKSPACE</p>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => navigate(item.id)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${page === item.id ? "bg-[#F0EAF4] font-semibold text-[#634B78]" : "text-[#77717B] hover:bg-[#F8F6F8]"}`}>
                <span className="text-lg">{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto rounded-2xl bg-[#F8F5F9] p-4">
            <div className="text-sm font-semibold text-[#634B78]">이번 주 목표</div>
            <div className="mt-2 text-2xl font-semibold text-[#5B456D]">{publishedCount}<span className="text-sm font-normal text-[#A49AA9]"> / 5편</span></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E9E2ED]"><div className="h-full rounded-full bg-[#80678F]" style={{ width: progress + "%" }} /></div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 md:px-10 md:py-9 md:pb-10">
          <header className="mb-7 flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-[#5B456D] md:hidden">PICKMOM LAB</div>
              <h1 className="mt-2 text-xl font-semibold md:mt-0 md:text-2xl">{navItems.find((n) => n.id === page)?.label}</h1>
              <p className="mt-1 text-xs text-[#918995] sm:text-sm">블로그를 꾸준히 발행하고, 콘텐츠 성과를 쌓는 작업 공간</p>
            </div>
            <button onClick={() => startWriting()} className="shrink-0 rounded-full bg-[#665174] px-4 py-2.5 text-xs font-semibold text-white shadow-sm">+ 새 글</button>
          </header>

          {page === "home" && (
            <>
              <section className="mb-7 rounded-3xl border border-[#EAE4ED] bg-white px-5 py-6 sm:px-7 sm:py-8">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9A8AA4]">PICKMOM BLOG STUDIO</p>
                <h2 className="mt-3 text-2xl font-semibold leading-snug text-[#332B38] sm:text-3xl">오늘의 발행 주제는?</h2>
                <p className="mt-2 text-sm text-[#817787]">아래 세 가지 방법 중 하나로 주제를 선택하세요.</p>

                <div className="mt-6 grid gap-3 lg:grid-cols-3">
                  <button type="button" onClick={() => setTopicMode("direct")} className={`rounded-2xl border p-4 text-left transition ${topicMode === "direct" ? "border-[#80678F] bg-[#F8F4FA] ring-1 ring-[#80678F]" : "border-[#ECE8EA] bg-white hover:bg-[#FAF9FA]"}`}>
                    <span className="text-xs font-semibold text-[#80678F]">① 키워드 직접 입력</span>
                    <span className="mt-2 block text-sm font-medium text-[#39313E]">작성하고 싶은 키워드를 입력하세요.</span>
                  </button>
                  <button type="button" onClick={() => setTopicMode("popular")} className={`rounded-2xl border p-4 text-left transition ${topicMode === "popular" ? "border-[#80678F] bg-[#F8F4FA] ring-1 ring-[#80678F]" : "border-[#ECE8EA] bg-white hover:bg-[#FAF9FA]"}`}>
                    <span className="text-xs font-semibold text-[#80678F]">② 요즘 인기 주제 키워드</span>
                    <span className="mt-2 block text-sm font-medium text-[#39313E]">인기 키워드 중 하나를 선택</span>
                  </button>
                  <button type="button" onClick={() => setTopicMode("category")} className={`rounded-2xl border p-4 text-left transition ${topicMode === "category" ? "border-[#80678F] bg-[#F8F4FA] ring-1 ring-[#80678F]" : "border-[#ECE8EA] bg-white hover:bg-[#FAF9FA]"}`}>
                    <span className="text-xs font-semibold text-[#80678F]">③ 카테고리 선택</span>
                    <span className="mt-2 block text-sm font-medium text-[#39313E]">관심 분야 하나를 선택</span>
                  </button>
                </div>

                {topicMode === "direct" && (
                  <div className="mt-4">
                    <label htmlFor="home-direct-keyword" className="mb-2 block text-xs font-medium text-[#716777]">작성할 키워드</label>
                    <input id="home-direct-keyword" value={directKeyword} onChange={(e) => setDirectKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && directKeyword.trim()) startWriting(directKeyword.trim(), directKeyword.trim()); }} placeholder="예: 아이와 겨울여행" className="w-full rounded-xl border border-[#E6E0E8] bg-white px-4 py-3 text-sm outline-none focus:border-[#80678F]" />
                  </div>
                )}
                {topicMode === "popular" && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-[#716777]">추천 키워드 중 하나를 선택</p>
                    <div className="flex flex-wrap gap-2">
                      {ideas.slice(0, 5).map((idea) => <button key={idea.keyword} type="button" onClick={() => setPopularKeyword(idea.keyword)} className={`rounded-full border px-3 py-2 text-xs transition ${popularKeyword === idea.keyword ? "border-[#80678F] bg-[#80678F] text-white" : "border-[#EAE6E8] bg-white text-[#716777]"}`}>{idea.keyword}</button>)}
                    </div>
                    <p className="mt-2 text-[10px] leading-5 text-[#A49AA9]">※ 현재는 편집 추천 키워드 예시입니다. 실시간 인기 순위나 검색량 데이터가 아닙니다.</p>
                  </div>
                )}
                {topicMode === "category" && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-[#716777]">관심 카테고리 하나를 선택</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {(["맛집·카페", "여행·체험", "교육 정보", "리빙·제품", "생활·정책", "부동산·주거"] as Category[]).map((category) => <button key={category} type="button" onClick={() => setTopicCategory(category)} className={`rounded-xl border px-3 py-3 text-sm transition ${topicCategory === category ? "border-[#80678F] bg-[#F3EDF6] font-semibold text-[#634B78]" : "border-[#ECE8EA] bg-white text-[#716777]"}`}>{category}</button>)}
                    </div>
                  </div>
                )}
                <button type="button" disabled={!topicMode || (topicMode === "direct" && !directKeyword.trim()) || (topicMode === "popular" && !popularKeyword) || (topicMode === "category" && !topicCategory)} onClick={() => {
                  if (topicMode === "direct" && directKeyword.trim()) startWriting(directKeyword.trim(), directKeyword.trim());
                  if (topicMode === "popular" && popularKeyword) startWriting(popularKeyword, popularKeyword);
                  if (topicMode === "category" && topicCategory) startWriting("", "", topicCategory);
                }} className="mt-6 w-full rounded-xl bg-[#665174] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#574364] disabled:cursor-not-allowed disabled:bg-[#C9C1CE] sm:w-auto">키워드 발굴하기 →</button>
              </section>

              <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5"><p className="text-xs text-[#918995]">이번 주 발행</p><p className="mt-2 text-3xl font-semibold text-[#665174]">{publishedCount}<span className="text-base font-normal text-[#A49AA9]"> / 5</span></p><div className="mt-3 h-1.5 rounded-full bg-[#F0ECF1]"><div className="h-full rounded-full bg-[#80678F]" style={{ width: progress + "%" }} /></div></div>
                <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5"><p className="text-xs text-[#918995]">작성 중인 글</p><p className="mt-2 text-3xl font-semibold text-[#665174]">{posts.filter((p) => p.status === "원고 작성" || p.status === "자료 조사").length}<span className="text-sm font-normal text-[#A49AA9]"> 편</span></p><p className="mt-2 text-xs text-[#A49AA9]">자료 조사 · 원고 작성 단계</p></div>
                <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5"><p className="text-xs text-[#918995]">캘린더 등록</p><p className="mt-2 text-3xl font-semibold text-[#665174]">{posts.length}<span className="text-sm font-normal text-[#A49AA9]"> 편</span></p><p className="mt-2 text-xs text-[#A49AA9]">저장된 아이디어와 원고</p></div>
              </section>

              <section className="mb-8">
                <div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-semibold">이번 주 추천 포스팅 5개</h2><p className="mt-1 text-xs text-[#A49AA9]">콘텐츠 분야를 섞어 발행 리듬을 만드는 편집 아이디어</p></div><button onClick={() => setShowIdeas(!showIdeas)} className="text-xs font-semibold text-[#715B80]">{showIdeas ? "접기" : "전체 보기"} →</button></div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {ideas.slice(0, showIdeas ? ideas.length : 5).map((idea, i) => (
                    <div key={idea.keyword} className="rounded-2xl border border-[#ECE8EA] bg-white p-5">
                      <div className="flex items-center justify-between gap-2"><span className="text-[10px] text-[#8B7898]">IDEA {String(i + 1).padStart(2, "0")} · {idea.category}</span><span className="rounded-full bg-[#F5F1F6] px-2.5 py-1 text-[10px] text-[#715B80]">{idea.purpose}</span></div>
                      <h3 className="mt-3 text-sm font-semibold leading-6">{idea.title}</h3><p className="mt-2 text-xs text-[#918995]">키워드 제안 · {idea.keyword}</p><p className="mt-3 text-xs leading-5 text-[#817787]">{idea.why}</p>
                      <div className="mt-4 flex gap-2"><button onClick={() => startWriting(idea.title, idea.keyword, idea.category, idea.purpose)} className="rounded-lg bg-[#665174] px-3 py-2 text-xs font-semibold text-white">이 주제로 글쓰기</button><button onClick={() => addIdeaToCalendar(idea)} className="rounded-lg border border-[#EAE6E8] px-3 py-2 text-xs text-[#716777]">캘린더에 저장</button></div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] leading-5 text-[#A49AA9]">※ 위 5개는 편집 방향을 보여주는 예시 아이디어이며 실시간 인기 순위나 검색량 데이터가 아닙니다. 실제 검색어/API 연동은 별도 영역으로 유지합니다.</p>
              </section>

              <section className="rounded-2xl border border-[#ECE8EA] bg-white p-5">
                <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">최근 작업</h2><button onClick={() => navigate("calendar")} className="text-xs text-[#715B80]">캘린더 보기 →</button></div>
                {posts.length === 0 ? <p className="py-6 text-center text-sm text-[#A49AA9]">아직 저장한 글이 없어요. 추천 주제로 첫 글을 시작해 보세요.</p> : <div className="space-y-3">{posts.slice(0, 4).map((post) => <button key={post.id} onClick={() => editPost(post)} className="flex w-full items-center justify-between gap-3 border-b border-[#F1EEF0] pb-3 text-left last:border-0 last:pb-0"><span className="min-w-0"><span className="block truncate text-sm font-medium">{post.title}</span><span className="mt-1 block text-[10px] text-[#A49AA9]">{post.category} · {post.date}</span></span><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] ${statusClass[post.status]}`}>{post.status}</span></button>)}</div>}
              </section>
            </>
          )}

          {page === "keywords" && <section className="rounded-2xl border border-[#ECE8EA] bg-white p-4 sm:p-6"><div className="mb-5"><h2 className="font-semibold">키워드 연구소</h2><p className="mt-1 text-xs leading-5 text-[#918995]">기존 키워드 분석 화면을 유지합니다. 검색 API 연결이나 인증 설정은 이번 화면 개편에서 변경하지 않습니다.</p></div><CompetitorAnalysis onSelectKeyword={(keyword) => startWriting(keyword, keyword)} /></section>}

          {page === "templates" && <PopularPostTemplates />}

          {page === "writing" && (
            <WritingStudio
              key={editingId ?? "new"}
              initialKeyword={draftInput.keyword}
              initialCategory={draftInput.category}
              initialData={editingId ? (posts.find((post) => post.id === editingId)?.formData || JSON.stringify(posts.find((post) => post.id === editingId) || {})) : undefined}
              onSave={(value) => {
                const saved: Post = {
                  id: editingId ?? Date.now(),
                  title: value.title,
                  keyword: value.keyword,
                  category: value.category as Category,
                  purpose: value.purpose as Purpose,
                  date: value.date,
                  status: value.status,
                  draft: value.draft,
                  photos: value.photos,
                  formData: value.formData,
                };
                setPosts((old) => editingId ? old.map((post) => post.id === editingId ? saved : post) : [saved, ...old]);
                setEditingId(null);
                setPage("calendar");
              }}
            />
          )}

          {page === "calendar" && (
            <section>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ECE8EA] bg-white p-4">
                <div><h2 className="font-semibold">블로그 콘텐츠 캘린더</h2><p className="mt-1 text-xs text-[#918995]">아이디어부터 발행 완료까지 한곳에서 관리해요.</p></div>
                <div className="flex items-center gap-2"><button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="rounded-lg border px-3 py-2 text-sm">‹</button><span className="min-w-24 text-center text-sm font-semibold">{calendarMonth.getFullYear()}.{String(calendarMonth.getMonth() + 1).padStart(2, "0")}</span><button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="rounded-lg border px-3 py-2 text-sm">›</button></div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#ECE8EA] bg-white">
                <div className="grid grid-cols-7 border-b bg-[#FAF9FA]">{["월", "화", "수", "목", "금", "토", "일"].map((d) => <div key={d} className="py-3 text-center text-xs font-semibold text-[#817787]">{d}</div>)}</div>
                <div className="grid grid-cols-7">{monthDays.map((day) => {
                  const key = dateKey(day);
                  const dayPosts = posts.filter((p) => p.date === key);
                  const inMonth = day.getMonth() === calendarMonth.getMonth();
                  return <div key={key} className={`min-h-24 border-b border-r border-[#F1EEF0] p-1.5 sm:min-h-32 sm:p-2 ${inMonth ? "bg-white" : "bg-[#FAF9FA]"}`}><div className={`text-[10px] ${inMonth ? "text-[#716777]" : "text-[#C4BEC7]"}`}>{day.getDate()}</div><div className="mt-1 space-y-1">{dayPosts.map((post) => <button key={post.id} onClick={() => editPost(post)} className="block w-full truncate rounded px-1 py-1 text-left text-[9px] leading-4 sm:text-[10px]" style={{ backgroundColor: post.status === "발행 완료" ? "#EAF5EE" : "#F2EDF5", color: post.status === "발행 완료" ? "#477257" : "#665174" }}>{post.title}</button>)}</div></div>;
                })}</div>
              </div>
              <div className="mt-6 rounded-2xl border border-[#ECE8EA] bg-white p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">전체 글 목록</h3><span className="text-xs text-[#A49AA9]">{posts.length}건</span></div>
                {posts.length === 0 ? <p className="py-6 text-center text-sm text-[#A49AA9]">등록된 콘텐츠가 없습니다.</p> : <div className="space-y-3">{posts.map((post) => <div key={post.id} className="flex flex-col gap-3 border-b border-[#F1EEF0] pb-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"><button onClick={() => editPost(post)} className="min-w-0 text-left"><span className="block truncate text-sm font-medium">{post.title}</span><span className="mt-1 block text-[10px] text-[#A49AA9]">{post.date} · {post.category} · {post.purpose}</span></button><div className="flex items-center gap-2"><select aria-label="발행 상태" value={post.status} onChange={(e) => updatePost(post.id, { status: e.target.value as Status })} className="rounded-lg border border-[#EAE6E8] bg-white px-2 py-2 text-xs">{statuses.map((s) => <option key={s}>{s}</option>)}</select><button onClick={() => { if (window.confirm("이 콘텐츠를 삭제할까요?")) setPosts((old) => old.filter((p) => p.id !== post.id)); }} className="rounded-lg border border-[#EAE6E8] px-3 py-2 text-xs text-[#A16D79]">삭제</button></div></div>)}</div>}
              </div>
              <p className="mt-3 text-[10px] leading-5 text-[#A49AA9]">저장한 글과 일정은 현재 사용 중인 브라우저의 로컬 저장소에 보관됩니다. 다른 기기와 자동 동기화되거나 네이버 블로그에 자동 발행되지는 않습니다.</p>
            </section>
          )}

          <footer className="mt-12 border-t border-[#EAE6E8] py-6 text-center text-[10px] tracking-widest text-[#B0A8B2]">PICKMOM LAB · FIND WHAT MATTERS</footer>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#EAE6E8] bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur md:hidden"><div className="mx-auto flex max-w-lg items-center justify-around">{navItems.map((item) => <button key={item.id} onClick={() => navigate(item.id)} className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-1 text-[10px] ${page === item.id ? "font-semibold text-[#665174]" : "text-[#A49AA9]"}`}><span className="text-xl">{item.icon}</span>{item.label}</button>)}</div></nav>
    </div>
  );
}
