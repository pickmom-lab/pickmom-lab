"use client";

import { useEffect, useMemo, useState } from "react";
import CompetitorAnalysis from "./components/competitor-analysis";
import PopularPostTemplates from "./components/popular-post-templates";
import WritingStudio from "./components/writing-studio";

type Category = "리빙·제품" | "맛집·카페" | "여행·체험" | "국내여행" | "해외여행" | "교육 정보" | "부동산·주거" | "생활·정책";
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

const categories: Category[] = ["맛집·카페", "국내여행", "해외여행", "교육 정보", "리빙·제품", "생활·정책", "부동산·주거"];
const purposes: Purpose[] = ["경험 리뷰", "비교·분석", "정보 제공", "문제 해결", "추천·판매"];
const statuses: Status[] = ["아이디어", "키워드 선정", "자료 조사", "원고 작성", "발행 준비", "발행 완료"];
const ideaSeeds: Record<Category, Array<{ title: string; keyword: string; purpose: Purpose; why: string }>> = {
  "맛집·카페": [
    { title: "서울 머랭롤 판매 매장과 메뉴 비교", keyword: "서울 머랭롤 맛집", purpose: "비교·분석", why: "판매 여부와 메뉴·가격·후기를 같은 기준으로 비교하는 주제" },
    { title: "아이와 가기 좋은 브런치 식당 고르는 기준", keyword: "아이와 브런치 맛집", purpose: "정보 제공", why: "좌석·주차·키즈 메뉴 등 방문 전 궁금한 정보를 정리하기 좋아요" },
    { title: "겨울에 생각나는 시즌 디저트와 판매 매장", keyword: "겨울 시즌 디저트", purpose: "추천·판매", why: "시즌 메뉴의 판매 기간과 구매 방법을 확인해 소개할 수 있어요" },
    { title: "포장하기 좋은 케이크와 디저트 비교", keyword: "서울 디저트 포장 추천", purpose: "비교·분석", why: "보관·이동 편의와 구성, 가격을 비교하기 좋은 주제" },
    { title: "아이 생일에 방문하기 좋은 식당 체크리스트", keyword: "아이 생일 식당 추천", purpose: "정보 제공", why: "예약·룸·주차·메뉴처럼 실제 선택에 필요한 조건을 다룰 수 있어요" },
  ],
  "국내여행": [
    { title: "아이와 떠나는 겨울 국내여행, 지역별 가족 여행지", keyword: "아이와 겨울 국내여행", purpose: "비교·분석", why: "이동 시간과 날씨, 아이 연령에 맞춰 지역을 비교하는 주제" },
    { title: "추운 날 아이와 가기 좋은 실내 체험 5곳", keyword: "겨울 아이 실내 체험", purpose: "정보 제공", why: "운영일·연령·예약·주차를 정리하면 방문 계획에 도움이 돼요" },
    { title: "눈놀이와 겨울 축제, 아이 연령별 선택 기준", keyword: "아이와 겨울 축제", purpose: "비교·분석", why: "체험 난이도와 안전·운영 기간을 기준으로 비교할 수 있어요" },
    { title: "서울 근교 아이와 당일치기 겨울 나들이", keyword: "서울 근교 겨울 당일치기", purpose: "추천·소개", why: "이동 부담과 실내 대안을 함께 제시하기 좋은 주제" },
    { title: "아이 동반 가족 숙소, 예약 전 확인할 항목", keyword: "아이 동반 가족 숙소", purpose: "문제 해결", why: "객실 구조·침구·수영장·키즈 시설 등 놓치기 쉬운 조건을 정리해요" },
  ],
  "해외여행": [
    { title: "아이와 겨울 해외여행, 따뜻한 여행지 비교", keyword: "아이와 겨울 해외여행", purpose: "비교·분석", why: "비행시간·기후·비용·아이 동반 시설을 같은 기준으로 비교해요" },
    { title: "아이와 동남아 리조트 선택할 때 볼 것", keyword: "아이와 동남아 리조트 추천", purpose: "비교·분석", why: "키즈클럽·수영장·식사·의료 접근성을 비교하기 좋아요" },
    { title: "가족 일본 여행, 도시별 이동과 체험 비교", keyword: "아이와 일본 여행", purpose: "비교·분석", why: "비행시간과 대중교통, 아이가 즐길 활동을 함께 살펴볼 수 있어요" },
    { title: "아이와 장거리 비행 준비, 연령별 체크리스트", keyword: "아이와 장거리 비행 준비", purpose: "문제 해결", why: "좌석·수면·기내 준비물·환승 등 실질적인 질문에 답하는 주제" },
    { title: "가족 해외여행 예산, 항공·숙박비 계산법", keyword: "가족 해외여행 경비", purpose: "정보 제공", why: "조회일을 명시해 항공·숙박·교통·식비를 나눠 정리할 수 있어요" },
  ],
  "교육 정보": [
    { title: "초등 입학 전 영어·수학 학습 준비 비교", keyword: "초등 입학 전 학습 준비", purpose: "비교·분석", why: "가정·기관 학습과 영역별 준비 기준을 균형 있게 다루는 주제" },
    { title: "초등 입학 전 생활 습관, 지금 점검할 5가지", keyword: "초등 입학 전 생활 습관", purpose: "정보 제공", why: "학습보다 먼저 점검할 일상 독립과 학교생활 준비를 정리해요" },
    { title: "영어 리딩 다음 단계, 읽고 이해하는 힘 기르기", keyword: "초등 영어 리딩 독해", purpose: "정보 제공", why: "읽기 수준과 요약·이해 활동을 연결해 설명할 수 있어요" },
    { title: "아이 영어 쓰기 시작할 때 부담 줄이는 방법", keyword: "초등 영어 글쓰기 시작", purpose: "문제 해결", why: "짧은 문장부터 생각을 구체화하는 연습 과정을 소개하기 좋아요" },
    { title: "초등 수학 사고력과 교과 연산, 균형 잡는 법", keyword: "초등 수학 사고력 연산", purpose: "비교·분석", why: "학습 목표와 아이의 현재 수준에 따라 선택 기준을 제시해요" },
  ],
  "리빙·제품": [
    { title: "매일 쓰는 주방 수납용품, 구매 전 확인할 기준", keyword: "주방 수납용품 추천", purpose: "비교·분석", why: "크기·용량·소재·관리 편의와 가격을 같은 기준으로 비교해요" },
    { title: "겨울철 실내 건조, 가습기 선택 전 체크할 점", keyword: "겨울 가습기 선택 기준", purpose: "정보 제공", why: "사용 공간과 관리 방식, 세척 편의 등 구매 기준을 정리해요" },
    { title: "아이 겨울 외출용품, 실제 사용 목적별 비교", keyword: "어린이 겨울 외출용품", purpose: "비교·분석", why: "보온성·활동성·세탁·사이즈를 기준으로 제품군을 비교할 수 있어요" },
    { title: "좁은 집 정리, 자주 쓰는 물건부터 수납하기", keyword: "좁은 집 수납 정리", purpose: "문제 해결", why: "공간과 사용 빈도를 기준으로 실행 순서를 제안하는 주제" },
    { title: "아이와 함께 쓰는 생활용품, 소재와 관리법 비교", keyword: "어린이 생활용품 소재", purpose: "비교·분석", why: "소재·안전 표시·세척·교체 주기를 확인해 소개할 수 있어요" },
  ],
  "생활·정책": [
    { title: "연말에 놓치기 쉬운 생활 지원·신청 일정 확인", keyword: "연말 생활 지원 정보", purpose: "정보 제공", why: "공식 공지의 신청 기간과 대상 조건을 확인해 정리하는 주제" },
    { title: "2027년 달라지는 생활 제도, 공식 발표 확인하기", keyword: "2027년 달라지는 제도", purpose: "정보 제공", why: "발표된 내용과 시행 예정 내용을 구분해 안내하기 좋아요" },
    { title: "아이 돌봄 지원 제도, 신청 전 확인할 조건", keyword: "아이 돌봄 지원 신청", purpose: "정보 제공", why: "지역·가구 조건과 신청 절차를 공식 자료로 정리할 수 있어요" },
    { title: "연말정산 전 가족 관련 공제 항목 점검", keyword: "연말정산 자녀 공제", purpose: "정보 제공", why: "적용 요건과 증빙 서류를 국세청 자료로 확인하는 주제" },
    { title: "겨울철 난방비 절약 지원, 대상과 신청 방법", keyword: "겨울 난방비 지원", purpose: "정보 제공", why: "지원 대상·기간·신청 창구를 최신 공고 기준으로 안내해요" },
  ],
  "부동산·주거": [
    { title: "이사 전 체크해야 할 관리비와 주거 비용 항목", keyword: "이사 전 주거 비용", purpose: "문제 해결", why: "초기 비용과 매달 반복되는 비용을 구분해 정리하는 주제" },
    { title: "전세와 월세, 우리 집 상황에 맞게 비교하기", keyword: "전세 월세 비용 비교", purpose: "비교·분석", why: "보증금·월세·이자·관리비를 같은 기간 기준으로 비교해요" },
    { title: "아이 있는 집 이사, 계약 전 확인할 주거 환경", keyword: "아이 있는 집 이사 체크리스트", purpose: "정보 제공", why: "통학·소음·수납·주차·생활 편의 조건을 점검할 수 있어요" },
    { title: "겨울철 아파트 결로와 곰팡이 예방 점검", keyword: "겨울 아파트 결로 예방", purpose: "문제 해결", why: "환기·습도·단열 상태 등 확인할 항목을 순서대로 안내해요" },
    { title: "아파트 관리비 고지서, 항목별로 읽는 방법", keyword: "아파트 관리비 항목", purpose: "정보 제공", why: "공용·개별 사용료와 변동 항목을 구분해 설명할 수 있어요" },
  ],
};
const ideas = categories.flatMap((category) => ideaSeeds[category].map((idea) => ({ ...idea, category })));

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
  const [preferredCategories, setPreferredCategories] = useState<Category[]>(["교육 정보", "국내여행", "해외여행", "맛집·카페", "리빙·제품"]);
  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [expandedRecommendationCategory, setExpandedRecommendationCategory] = useState<Category | null>("교육 정보");
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
      if (savedCategories) { const parsed = JSON.parse(savedCategories) as string[]; const migrated = parsed.includes("여행·체험") ? [...parsed.filter((value) => value !== "여행·체험"), "국내여행", "해외여행"] : parsed; const valid = Array.from(new Set(migrated)).filter((value): value is Category => categories.includes(value as Category)); setPreferredCategories(valid); }
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

  const visibleCategories = categories.filter((category) => preferredCategories.includes(category));

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
    if (/해외|국제선|비행기|항공권|일본|베트남|괌|발리|나트랑|다낭|싱가포르|해외여행/.test(text)) return "해외여행";\n    if (/국내|제주|강릉|부산|경주|전주|속초|여수|국내여행/.test(text)) return "국내여행";\n    if (/여행|호텔|리조트|나들이|체험|전시|마켓|가볼|실내/.test(text)) return "여행·체험";
    if (/영어|수학|초등|유치원|학원|교육|책|독서|입학/.test(text)) return "교육 정보";
    if (/부동산|아파트|전세|월세|청약|이사|주거/.test(text)) return "부동산·주거";
    if (/선물|추천|구매|가격|제품|상품|쇼핑/.test(text)) return "리빙·제품";
    if (/지원금|정책|신청|정부|할인|혜택|노동절|공휴일/.test(text)) return "생활·정책";
    return "리빙·제품";
  };
  const startWriting = (topic = "", keyword = "", category?: Category, purpose?: Purpose, researchBrief = "") => {
    const detectedCategory = category || inferCategory(keyword || topic);
    const detectedPurpose = purpose || (detectedCategory === "맛집·카페" || detectedCategory === "여행·체험" || detectedCategory === "국내여행" || detectedCategory === "해외여행" ? "경험 리뷰" : "정보 제공");
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
                  <div><h2 className="text-lg font-semibold">내 관심 분야의 이번 주 글감</h2><p className="mt-1 text-xs text-[#A49AA9]">관심 분야마다 이번 주 글감 5개를 간결하게 모았어요. 실제 검색량 순위가 아닌 편집 추천이에요.</p></div>
                  <button onClick={() => setShowCategorySettings((value) => !value)} className="rounded-lg border border-[#E6E0E8] px-3 py-2 text-xs font-semibold text-[#665174]">{showCategorySettings ? "관심 분야 닫기" : "관심 분야 설정 ⚙"}</button>
                </div>
                {showCategorySettings && <div className="mb-4 rounded-2xl border border-[#EAE4ED] bg-white p-4">
                  <p className="mb-3 text-xs font-medium text-[#817787]">자주 쓰는 카테고리를 선택하세요. 선택 내용은 이 브라우저에 저장됩니다.</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{categories.map((category) => <label key={category} className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#F0ECF1] p-3 text-xs"><input type="checkbox" checked={preferredCategories.includes(category)} onChange={(event) => setPreferredCategories((old) => event.target.checked ? [...old, category] : old.filter((value) => value !== category))} />{category}</label>)}</div>
                  {preferredCategories.length === 0 && <p className="mt-2 text-xs text-rose-600">추천을 보려면 카테고리를 하나 이상 선택해 주세요.</p>}
                </div>}
                {visibleCategories.length === 0 ? <div className="rounded-xl border border-dashed border-[#DED6E3] bg-white p-5 text-center text-xs text-[#918995]">관심 카테고리를 하나 이상 선택하면 주간 추천을 볼 수 있어요.</div> :
                <div className="space-y-2">
                  {visibleCategories.map((category) => {
                    const categoryIdeas = ideas.filter((idea) => idea.category === category);
                    const expanded = expandedRecommendationCategory === category;
                    return <div key={category} className="overflow-hidden rounded-xl border border-[#ECE8EA] bg-white">
                      <button type="button" onClick={() => setExpandedRecommendationCategory(expanded ? null : category)} aria-expanded={expanded} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
                        <span className="min-w-0"><span className="block text-sm font-semibold">{category}</span><span className="mt-0.5 block text-[10px] text-[#A49AA9]">이번 주 추천 주제 5개</span></span>
                        <span className="shrink-0 text-xs font-medium text-[#715B80]">{expanded ? "접기 −" : "펼치기 +"}</span>
                      </button>
                      {expanded && <div className="border-t border-[#F0ECF1] px-3">
                        {categoryIdeas.map((idea, i) => {
                          const comparisonPlan = idea.keyword === "주방 수납용품 추천"
                            ? "비교 대상: 서랍 칸막이형 vs 적층 수납함 vs 벽면·걸이형 수납. 기준: 설치 공간·실측 크기, 용량, 소재·내구성, 세척 편의성, 가격대, 주방 동선."
                            : idea.keyword === "서울 머랭롤 맛집"
                            ? "비교 대상: 서울에서 현재 판매가 확인되는 매장 3~5곳. 기준: 판매 지점·판매 여부, 메뉴 종류·크기·구성, 확인 가능한 가격, 구매 방식, 최근 후기의 맛·식감. 판매 여부가 확인되지 않은 매장은 제외합니다."
                            : idea.keyword === "아이와 겨울 해외여행"
                            ? "비교 대상: 가족 여행 후보 국가·도시 또는 리조트 지역 3~5곳. 기준: 총 비행시간·직항, 여행 시기별 기후, 항공·숙박 예상 비용(조회 날짜 명시), 이동 편의, 아이 연령별 즐길 거리, 키즈 프로그램·수영장, 식사, 의료 접근성, 안전·비자·입국 조건."
                            : idea.keyword === "아이와 겨울 국내여행"
                            ? "비교 대상: 국내 여행 지역 또는 숙소 유형 3~5곳. 기준: 출발지 기준 이동시간, 겨울 날씨와 실내 대안, 숙박비·부대비용, 아이 연령별 체험, 식사·편의시설, 주차, 일정 난이도."
                            : idea.keyword === "초등 입학 전 학습 준비"
                            ? "비교 대상: 가정 학습 vs 기관·학원 학습. 기준: 교육과정 연계, 혼자 수행 가능한 정도, 주당 소요 시간, 비용, 피드백, 학습 부담. 영어는 파닉스·리딩·쓰기, 수학은 교과 기본·연산·사고력으로 나눕니다."
                            : "비교 대상과 기준을 3~5개 항목으로 정하고, 가격·조건·장단점은 같은 기준으로 확인합니다.";
                          const researchBrief = [
                            "[글쓰기 단계에 전달할 조사·구성 제안]",
                            "주제: " + idea.title,
                            "핵심 키워드: " + idea.keyword,
                            "카테고리: " + idea.category,
                            "콘텐츠 유형: " + idea.purpose,
                            "추천 이유: " + idea.why,
                            idea.purpose === "비교·분석" ? "비교 기획: " + comparisonPlan : "구성 제안: 독자가 먼저 궁금해할 질문 3~5개를 소제목으로 만들고 핵심 답변 → 세부 조건 → 예외·주의사항 순서로 정리합니다.",
                            "필수 조사 항목: " + (idea.category === "맛집·카페" ? "현재 판매 여부, 지점별 메뉴·가격, 주소·영업시간, 구매·예약 방법, 최근 후기의 공통점" : idea.category === "국내여행" ? "지역별 이동시간, 계절·날씨, 숙박비, 아이 동반 체험, 주차·식사·편의시설, 실내 대안" : idea.category === "해외여행" ? "비행시간·직항, 기후·강수, 항공·숙박 총비용, 입국 조건, 아이 동반 시설·체험, 의료·안전 정보" : idea.category === "교육 정보" ? "공식 교육자료, 대상 연령, 준비 시기, 학습 방식별 목표와 한계" : idea.category === "생활·정책" ? "담당 기관의 최신 공지, 신청 대상·기간, 지원 내용, 제외 조건과 신청 절차" : idea.category === "부동산·주거" ? "공식 제도·계약 정보, 비용 항목, 지역·주택별 조건, 확인 날짜" : "공식 제품·매장 정보, 가격·조건, 규격·이용 방법, 유지·관리, 장단점"),
                            "자료 원칙: 공식 홈페이지·기관 공지와 신뢰할 수 있는 후기를 확인하고, 출처 URL과 확인 날짜를 기록합니다. 확인되지 않은 가격·운영시간·판매 여부는 사실처럼 쓰지 않습니다.",
                            "사진 원칙: 사용자가 직접 첨부한 사진을 우선하며, 외부 사진은 사용 허가와 개별 라이선스를 확인한 경우에만 사용합니다.",
                            "주의: 실제 방문·구매·사용 경험을 만들어 쓰지 말고, 확인된 사실·후기에서 확인한 경향·편집자의 해석을 구분합니다."
                          ].join("\\n");
                          return <div key={idea.keyword} className="flex items-start gap-3 border-b border-[#F2EFF2] py-3 last:border-0">
                            <span className="mt-0.5 w-4 shrink-0 text-[10px] tabular-nums text-[#A49AA9]">{String(i + 1).padStart(2, "0")}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2"><h3 className="text-xs font-semibold leading-5">{idea.title}</h3><span className="rounded-full bg-[#F5F1F6] px-2 py-0.5 text-[9px] text-[#715B80]">{idea.purpose}</span></div>
                              <p className="mt-1 text-[10px] text-[#8D8491]">키워드 · {idea.keyword}</p>
                              <p className="mt-1 text-[11px] leading-4 text-[#817787]">{idea.why}</p>
                            </div>
                            <button onClick={() => startWriting(idea.title, idea.keyword, idea.category, idea.purpose, researchBrief)} className="shrink-0 rounded-lg bg-[#665174] px-2.5 py-2 text-[10px] font-semibold text-white">글쓰기</button>
                          </div>;
                        })}
                      </div>}
                    </div>;
                  })}
                </div>}

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
              initialPurpose={draftInput.purpose}
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
