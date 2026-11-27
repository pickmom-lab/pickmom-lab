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

const categories: Category[] = ["맛집·카페", "여행·체험", "교육 정보", "리빙·제품", "생활·정책", "부동산·주거"];
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
  { category: "맛집·카페" as Category, title: "서울 머랭롤 판매 매장과 메뉴 비교", keyword: "서울 머랭롤 맛집", purpose: "비교·분석" as Purpose, why: "판매 여부·메뉴 구성·가격·후기를 같은 기준으로 비교하는 정보형 주제" },
  { category: "여행·체험" as Category, title: "겨울방학 아이와 갈 만한 실내 체험 비교", keyword: "서울 겨울 실내 체험", purpose: "비교·분석" as Purpose, why: "연령·운영일·예약·주차·체험 내용을 비교해 방문 전 판단을 돕는 주제" },
  { category: "교육 정보" as Category, title: "초등 입학 전 영어·수학 학습 준비 비교", keyword: "초등 입학 전 학습 준비", purpose: "비교·분석" as Purpose, why: "교재·학습 방식·준비 시기를 비교하되 공식 교육과정과 개인 의견을 구분하는 주제" },
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
  const [homeSearchKeyword, setHomeSearchKeyword] = useState("");
  const [popularKeyword, setPopularKeyword] = useState("");
  const [topicCategory, setTopicCategory] = useState<Category | "">("");
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [preferredCategories, setPreferredCategories] = useState<Category[]>(["교육 정보", "여행·체험", "맛집·카페", "리빙·제품"]);
  const [showCategorySettings, setShowCategorySettings] = useState(false);
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
      if (raw) { const stored = JSON.parse(raw) as Array<Omit<Post, "category"> & { category: string }>; setPosts(stored.map((post) => ({ ...post, category: (post.category === "쇼핑·제품" ? "리빙·제품" : post.category) as Category }))); }
      const savedCategories = window.localStorage.getItem("pickmom-preferred-categories-v1");
      if (savedCategories) { const parsed = JSON.parse(savedCategories) as string[]; const valid = parsed.filter((value): value is Category => categories.includes(value as Category)); setPreferredCategories(valid); }
    } catch {
      // Ignore invalid local data and keep the workspace usable.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem("pickmom-blog-posts-v2", JSON.stringify(posts));
  }, [posts, loaded]);

  useEffect(() => {
    if (loaded) window.localStorage.setItem("pickmom-preferred-categories-v1", JSON.stringify(preferredCategories));
  }, [preferredCategories, loaded]);

  const visibleIdeas = ideas.filter((idea) => preferredCategories.includes(idea.category));

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
    if (/선물|추천|구매|가격|제품|상품|쇼핑/.test(text)) return "리빙·제품";
    if (/지원금|정책|신청|정부|할인|혜택|노동절|공휴일/.test(text)) return "생활·정책";
    return "리빙·제품";
  };
  const startWriting = (topic = "", keyword = "", category?: Category, purpose?: Purpose, researchBrief = "") => {
    const detectedCategory = category || inferCategory(keyword || topic);
    const detectedPurpose = purpose || (detectedCategory === "맛집·카페" || detectedCategory === "여행·체험" ? "경험 리뷰" : "정보 제공");
    setDraftInput({ topic, keyword, category: detectedCategory, purpose: detectedPurpose, notes: "", research: researchBrief });
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
    { id: "writing" as const, label: "글쓰기", icon: "✎" },
    { id: "calendar" as const, label: "캘린더", icon: "▦" },
    { id: "keywords" as const, label: "트렌드", icon: "⌕" },
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
              <section className="mb-8 rounded-3xl border border-[#EAE4ED] bg-white px-5 py-6 sm:px-7 sm:py-8">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9A8AA4]">PICKMOM BLOG STUDIO</p>
                <h2 className="mt-3 text-2xl font-semibold leading-snug text-[#332B38] sm:text-3xl">오늘은 어떤 이야기를 기록할까요?</h2>
                <p className="mt-2 text-sm text-[#817787]">키워드를 검색하면 트렌드 화면에서 추천 키워드와 연관 키워드를 살펴볼 수 있어요.</p>
                <form className="mt-6 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); if (homeSearchKeyword.trim()) { setDirectKeyword(homeSearchKeyword.trim()); navigate("keywords"); } }}>
                  <input value={homeSearchKeyword} onChange={(event) => setHomeSearchKeyword(event.target.value)} placeholder="키워드를 검색하세요. 예: 아이와 겨울여행" className="min-w-0 flex-1 rounded-xl border border-[#E6E0E8] bg-white px-4 py-3.5 text-sm outline-none focus:border-[#80678F]" />
                  <button type="submit" disabled={!homeSearchKeyword.trim()} className="rounded-xl bg-[#665174] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#574364] disabled:cursor-not-allowed disabled:bg-[#C9C1CE]">키워드 발굴하기 →</button>
                </form>
              </section>

              <section className="mb-8">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div><h2 className="text-lg font-semibold">내 관심 분야의 이번 주 글감</h2><p className="mt-1 text-xs text-[#A49AA9]">선택한 카테고리에 맞춰 정보·비교형 주제를 먼저 제안해요.</p></div>
                  <button onClick={() => setShowCategorySettings((value) => !value)} className="rounded-lg border border-[#E6E0E8] px-3 py-2 text-xs font-semibold text-[#665174]">{showCategorySettings ? "관심 분야 닫기" : "관심 분야 설정 ⚙"}</button>
                </div>
                {showCategorySettings && <div className="mb-4 rounded-2xl border border-[#EAE4ED] bg-white p-4">
                  <p className="mb-3 text-xs font-medium text-[#817787]">자주 쓰는 카테고리를 선택하세요. 선택 내용은 이 브라우저에 저장됩니다.</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{categories.map((category) => <label key={category} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#F0ECF1] p-3 text-xs"><input type="checkbox" checked={preferredCategories.includes(category)} onChange={(event) => setPreferredCategories((old) => event.target.checked ? [...old, category] : old.filter((value) => value !== category))} />{category}</label>)}</div>
                  {preferredCategories.length === 0 && <p className="mt-2 text-xs text-rose-600">추천을 보려면 카테고리를 하나 이상 선택해 주세요.</p>}
                </div>}
                {visibleIdeas.length === 0 ? <div className="rounded-2xl border border-dashed border-[#DED6E3] bg-white p-8 text-center text-sm text-[#918995]">관심 카테고리를 하나 이상 선택하면 관련 글감이 여기에 보여요.</div> :
                <div className="grid gap-3 lg:grid-cols-2">
                  {visibleIdeas.map((idea, i) => {
                    const researchBrief = [
                      "[PICKMOM LAB 사전 조사 방향]",
                      "콘텐츠 유형: 직접 방문 후기가 아닌 정보·비교형으로 시작합니다. 실제 경험이 없는 내용은 방문한 것처럼 쓰지 마세요.",
                      `추천 이유: ${idea.why}`,
                      `조사할 항목: ${idea.category === "맛집·카페" ? "현재 판매 여부, 대표 메뉴와 가격, 지점·주소, 영업시간, 실제 후기의 공통점과 차이" : idea.category === "여행·체험" ? "운영 기간·요일, 연령 제한, 예약 방법, 이용료, 주차, 실내 시설과 체험 내용" : idea.category === "교육 정보" ? "공식 교육자료, 대상 연령, 준비 시기, 학습 방식별 장단점, 근거가 되는 기관 자료" : "공식 제품·기관 정보, 가격과 조건, 비교 기준, 장단점, 업데이트 날짜"}`,
                      "자료 검증: 변동 정보는 공식 홈페이지·공식 SNS·기관 공지를 우선 확인하고, 출처 URL과 확인 날짜를 기록하세요. 검색량이나 문서 수를 확인하지 못했다면 수치로 표현하지 마세요.",
                      "사진 계획: 대표 이미지 1장(공식 출처), 장소·제품의 세부 사진 2~3장, 비교 항목을 설명하는 사진 1장. 사진마다 원본 게시물 URL과 이용 허락 여부를 확인하고, 무단 다운로드·재사용은 하지 마세요.",
                      "사진 삽입 위치: 제목 아래 대표 사진 → 업체/장소 소개 문단 아래 외관·대표 이미지 → 메뉴·시설·제품 비교 문단 아래 세부 사진 → 비교 요약 아래 보충 사진.",
                      "사용자가 직접 경험한 내용은 별도 메모로 추가하고, 확인된 사실과 추정·의견을 구분해 작성하세요."
                    ].join("\n");
                    const search = encodeURIComponent(idea.keyword + " 공식 홈페이지 인스타그램 사진");
                    const images = encodeURIComponent(idea.keyword + " 공식");
                    return <article key={idea.keyword} className="rounded-2xl border border-[#ECE8EA] bg-white p-5">
                      <div className="flex items-center justify-between gap-2"><span className="text-[10px] text-[#8B7898]">추천 {String(i + 1).padStart(2, "0")} · {idea.category}</span><span className="rounded-full bg-[#F5F1F6] px-2.5 py-1 text-[10px] text-[#715B80]">{idea.purpose}</span></div>
                      <h3 className="mt-3 text-sm font-semibold leading-6">{idea.title}</h3>
                      <p className="mt-2 text-xs text-[#918995]">핵심 키워드 · {idea.keyword}</p>
                      <p className="mt-3 text-xs leading-5 text-[#817787]">{idea.why}</p>
                      <div className="mt-4 rounded-xl bg-[#F8F5F9] p-3"><p className="text-xs font-semibold text-[#665174]">이 글에서 조사할 것</p><p className="mt-1 text-xs leading-5 text-[#817787]">{idea.category === "맛집·카페" ? "판매 여부 · 메뉴/가격 · 매장 정보 · 실제 후기 비교" : idea.category === "여행·체험" ? "운영 기간 · 연령 · 예약 · 이용료 · 주차" : idea.category === "교육 정보" ? "공식 교육자료 · 대상 연령 · 학습 방식 · 준비 시기" : "공식 정보 · 가격/조건 · 비교 기준 · 장단점"}</p></div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a href={`https://www.google.com/search?q=${search}`} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-2 text-xs text-[#665174]">공식 출처 찾기 ↗</a>
                        <a href={`https://www.google.com/search?tbm=isch&q=${images}`} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-2 text-xs text-[#665174]">사진 검색 ↗</a>
                        <a href={`https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(idea.keyword)}`} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-2 text-xs text-[#665174]">블로그 후기 확인 ↗</a>
                      </div>
                      <button onClick={() => startWriting(idea.title, idea.keyword, idea.category, idea.purpose, researchBrief)} className="mt-4 rounded-lg bg-[#665174] px-3 py-2.5 text-xs font-semibold text-white">조사 방향을 담아 글쓰기 →</button>
                      <button onClick={() => setSelectedIdea((old) => old === idea.keyword ? null : idea.keyword)} className="ml-2 mt-4 rounded-lg border px-3 py-2.5 text-xs text-[#665174]">{selectedIdea === idea.keyword ? "사진 배치 안내 닫기" : "사진 배치 안내"}</button>
                      {selectedIdea === idea.keyword && <div className="mt-3 rounded-xl border border-[#ECE8EA] p-3 text-xs leading-6 text-[#817787]"><b>권장 사진 순서</b><ol className="ml-4 list-decimal"><li>제목 아래: 주제를 대표하는 공식 사진</li><li>첫 번째 정보 문단 아래: 장소·제품의 전체 모습</li><li>세부 비교 문단 아래: 메뉴·시설·제품 디테일</li><li>비교 요약 아래: 차이를 보여주는 보충 사진</li></ol><p className="mt-2">각 사진은 원본 게시물 링크와 사용 허락 여부를 확인한 뒤 삽입하세요.</p></div>}
                    </article>;
                  })}
                </div>}
                <p className="mt-3 text-[10px] leading-5 text-[#A49AA9]">※ 현재 추천은 카테고리 기반 편집 제안입니다. 실시간 검색량·경쟁도 검증이나 사진 원본 수집은 아직 자동화되지 않았으며, 검색 링크는 공식 자료를 찾기 위한 출발점입니다.</p>
              </section>

              <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5"><p className="text-xs text-[#918995]">이번 주 발행</p><p className="mt-2 text-3xl font-semibold text-[#665174]">{publishedCount}<span className="text-base font-normal text-[#A49AA9]"> / 5</span></p><div className="mt-3 h-1.5 rounded-full bg-[#F0ECF1]"><div className="h-full rounded-full bg-[#80678F]" style={{ width: progress + "%" }} /></div></div>
                <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5"><p className="text-xs text-[#918995]">작성 중인 글</p><p className="mt-2 text-3xl font-semibold text-[#665174]">{posts.filter((p) => p.status === "원고 작성" || p.status === "자료 조사").length}<span className="text-sm font-normal text-[#A49AA9]"> 편</span></p><p className="mt-2 text-xs text-[#A49AA9]">자료 조사 · 원고 작성 단계</p></div>
                <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5"><p className="text-xs text-[#918995]">캘린더 등록</p><p className="mt-2 text-3xl font-semibold text-[#665174]">{posts.length}<span className="text-sm font-normal text-[#A49AA9]"> 편</span></p><p className="mt-2 text-xs text-[#A49AA9]">저장된 아이디어와 원고</p></div>
              </section>

              <section className="rounded-2xl border border-[#ECE8EA] bg-white p-5">
                <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">최근 작업</h2><button onClick={() => navigate("calendar")} className="text-xs text-[#715B80]">캘린더 보기 →</button></div>
                {posts.length === 0 ? <p className="py-6 text-center text-sm text-[#A49AA9]">아직 저장한 글이 없어요. 추천 주제로 첫 글을 시작해 보세요.</p> : <div className="space-y-3">{posts.slice(0, 4).map((post) => <button key={post.id} onClick={() => editPost(post)} className="flex w-full items-center justify-between gap-3 border-b border-[#F1EEF0] pb-3 text-left last:border-0 last:pb-0"><span className="min-w-0"><span className="block truncate text-sm font-medium">{post.title}</span><span className="mt-1 block text-[10px] text-[#A49AA9]">{post.category} · {post.date}</span></span><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] ${statusClass[post.status]}`}>{post.status}</span></button>)}</div>}
              </section>
            </>
          )}
          {page === "keywords" && <section className="rounded-2xl border border-[#ECE8EA] bg-white p-4 sm:p-6"><div className="mb-5"><h2 className="font-semibold">키워드 연구소</h2><p className="mt-1 text-xs leading-5 text-[#918995]">기존 키워드 분석 화면을 유지합니다. 검색 API 연결이나 인증 설정은 이번 화면 개편에서 변경하지 않습니다.</p></div><CompetitorAnalysis initialKeyword={directKeyword} onSelectKeyword={(keyword) => startWriting(keyword, keyword)} /></section>}

          {page === "templates" && <PopularPostTemplates />}

          {page === "writing" && (
            <WritingStudio
              key={editingId ?? "new"}
              initialKeyword={draftInput.keyword}
              initialCategory={draftInput.category}
              initialNotes={draftInput.research}
              initialPhotos={editingId ? posts.find((post) => post.id === editingId)?.photos : undefined}
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
