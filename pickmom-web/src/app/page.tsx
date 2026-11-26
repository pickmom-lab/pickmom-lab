
"use client";

import { useState } from "react";
import CompetitorAnalysis from "./components/competitor-analysis";

const menus = [
  { name: "Home", icon: "⌂" },
  { name: "새 글 만들기", icon: "✎" },
  { name: "시즌 상품 추천", icon: "◇" },
  { name: "릴스 · 클립 만들기", icon: "▷" },
  { name: "템플릿 관리", icon: "▤" },
  { name: "키워드 발굴", icon: "⌕" },
];

const topics = [
  {
    id: 1, category: "여행", title: "2026 서울 크리스마스 마켓 총정리",
    keyword: "서울 크리스마스 마켓", trend: "시즌성", competition: "보통",
    intent: "일정, 위치, 주차, 예약 방법",
    opportunity: "마켓별 운영 기간과 실제 방문 동선을 비교하면 차별화할 수 있어요.",
    questions: ["서울 크리스마스 마켓은 어디에서 열릴까?", "아이와 방문하기 좋은 곳은?", "예약이 필요한 곳은 어디일까?"],
    outline: ["2026년 서울 크리스마스 마켓 일정", "장소별 특징과 볼거리", "아이와 방문할 때 알아둘 점", "교통 및 주차 정보"],
  },
  {
    id: 2, category: "교육·육아", title: "초등 입학 전 수학, 어디까지 해야 할까?",
    keyword: "7세 수학 로드맵", trend: "꾸준함", competition: "높음",
    intent: "학습 수준, 교재, 학원 선택",
    opportunity: "아이의 현재 수준별로 실제 학습 단계를 정리하면 유용해요.",
    questions: ["초등 입학 전 연산은 어디까지 해야 할까?", "사고력 수학은 언제 시작할까?", "교재와 학원은 어떻게 선택할까?"],
    outline: ["입학 전 수학에서 중요한 기초", "연산과 사고력의 균형", "아이 수준별 학습 방향", "교재와 학원 선택 기준"],
  },
  {
    id: 3, category: "맛집", title: "아이와 가기 좋은 서울 브런치 맛집",
    keyword: "서울 아이와 브런치", trend: "상승", competition: "높음",
    intent: "위치, 메뉴, 주차, 아이 동반",
    opportunity: "아이 의자, 주차, 메뉴 구성 등 실제 방문 정보를 구체적으로 비교해요.",
    questions: ["아이와 방문하기 편할까?", "주차가 가능할까?", "아이 메뉴가 있을까?"],
    outline: ["매장 위치와 분위기", "메뉴와 가격", "아이와 방문하기 좋은 점", "주차 및 이용 팁"],
  },
  {
    id: 4, category: "쇼핑", title: "겨울철 아이 실내 놀이 아이템 추천",
    keyword: "겨울 실내 놀이", trend: "시즌성", competition: "보통",
    intent: "가격, 사용 후기, 연령",
    opportunity: "연령별 놀이 방식과 실제 사용 후기를 중심으로 구성해요.",
    questions: ["집에서 오래 가지고 놀 수 있을까?", "몇 살부터 사용할 수 있을까?", "공간을 많이 차지할까?"],
    outline: ["겨울철 실내 놀이 선택 기준", "연령별 추천 아이템", "가격과 활용도 비교", "구매 전 확인할 점"],
  },
  {
    id: 5, category: "책", title: "초등 저학년 추천 과학 그림책",
    keyword: "초등 과학 그림책", trend: "꾸준함", competition: "낮음",
    intent: "도서 추천, 연령, 독서",
    opportunity: "주제별 책 목록과 독후 활동을 함께 제안할 수 있어요.",
    questions: ["과학을 처음 접하는 아이에게 어떤 책이 좋을까?", "몇 학년부터 읽으면 좋을까?", "독후 활동은 어떻게 할까?"],
    outline: ["과학 그림책 선택 기준", "주제별 추천 도서", "아이 반응과 읽는 방법", "함께 해볼 독후 활동"],
  },
  {
    id: 6, category: "교육·육아", title: "영어유치원 졸업 후 영어 공부 방향",
    keyword: "영어유치원 이후 영어", trend: "꾸준함", competition: "높음",
    intent: "학습 방법, 교재, 교육 방향",
    opportunity: "유치원 이후 읽기·쓰기·말하기의 균형을 현실적으로 정리해요.",
    questions: ["영어유치원 이후 무엇을 이어가야 할까?", "리딩과 라이팅은 어떻게 관리할까?", "학원은 계속 다녀야 할까?"],
    outline: ["영어유치원 이후 달라지는 환경", "영역별 학습 방향", "가정에서 할 수 있는 활동", "학원과 교재 선택 기준"],
  },
];

const products = [
  { id: 1, category: "교육·놀이", name: "자석 블록·구성 놀이", season: "실내 놀이", reason: "겨울철 실내 활동 콘텐츠", price: "가격 조사 필요" },
  { id: 2, category: "키즈 라이프", name: "겨울 아동 실내복", season: "겨울 시즌", reason: "계절 상품 비교 및 착용 후기", price: "가격 조사 필요" },
  { id: 3, category: "교육·교재", name: "초등 입학 준비 교재", season: "입학 시즌", reason: "연령별 학습 준비 콘텐츠", price: "가격 조사 필요" },
  { id: 4, category: "엄마 라이프", name: "주방 정리·수납 아이템", season: "상시 관심", reason: "실사용 중심 추천 콘텐츠", price: "가격 조사 필요" },
];

const categories = ["전체", "여행", "맛집", "교육·육아", "쇼핑", "책"];

export default function Home() {
  const [activeMenu, setActiveMenu] = useState("Home");
  const [view, setView] = useState("home");
  const [selectedTopic, setSelectedTopic] = useState<(typeof topics)[number] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[number] | null>(null);
  const [category, setCategory] = useState("전체");
  const [moreOpen, setMoreOpen] = useState(false);

  const [writingTitle, setWritingTitle] = useState("");
  const [writingStep, setWritingStep] = useState(1);
  const [writingType, setWritingType] = useState("직접 경험 후기");
  const [writingTargetKeyword, setWritingTargetKeyword] = useState("");
  const [writingDocumentCount, setWritingDocumentCount] = useState<number | null>(null);
  const [writingRelatedKeywords, setWritingRelatedKeywords] = useState<string[]>([]);
  const [writingKeywordLoading, setWritingKeywordLoading] = useState(false);
  const [writingKeywordError, setWritingKeywordError] = useState("");
  const [writingKeyword, setWritingKeyword] = useState("");
  const [writingNotes, setWritingNotes] = useState("");
  const [writingFiles, setWritingFiles] = useState<string[]>([]);

  const filteredTopics = category === "전체"
    ? topics
    : topics.filter((topic) => topic.category === category);

  const goMenu = (name: string) => {
    setActiveMenu(name);
    setView(
      name === "Home"
        ? "home"
        : name === "시즌 상품 추천"
          ? "products"
           : name === "새 글 만들기"
            ? "writing"
            : name === "키워드 발굴"
              ? "competitor"
              : "placeholder"
    );
    setMoreOpen(false);
  };

  const goTopicDetail = (topic: (typeof topics)[number]) => {
    setSelectedTopic(topic);
    setView("topicDetail");
  };

  const startWriting = (title: string) => {
    setWritingTitle(title);
    setWritingStep(1);
    setWritingType("직접 경험 후기");
    setWritingTargetKeyword("");
    setWritingDocumentCount(null);
    setWritingRelatedKeywords([]);
    setWritingKeywordError("");
    setWritingKeyword("");

    setWritingNotes("");
    setWritingFiles([]);
    setActiveMenu("새 글 만들기");
    setView("writing");
  };

  const searchWritingKeyword = async () => {
    const target = writingTargetKeyword.trim();
    if (!target) return;
    setWritingKeywordLoading(true);
    setWritingKeywordError("");
    setWritingDocumentCount(null);
    setWritingRelatedKeywords([]);
    try {
      const response = await fetch("/api/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "blog", keyword: target }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "키워드 검색에 실패했습니다.");
      setWritingDocumentCount(typeof data.total === "number" ? data.total : null);
      const stopWords = new Set(["그리고", "하지만", "정말", "너무", "있는", "없는", "하는", "위한", "에서", "으로", "아이", "추천", "후기"]);
      const counts = new Map<string, number>();
      for (const item of data.items ?? []) {
        const text = `${item.title ?? ""} ${item.description ?? ""}`.replace(/<[^>]*>/g, " ");
        const words = text.match(/[가-힣A-Za-z0-9]{2,}/g) ?? [];
        for (const word of words) {
          const normalized = word.trim();
          if (!stopWords.has(normalized) && normalized !== target && !target.includes(normalized)) {
            counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
          }
        }
      }
      setWritingRelatedKeywords(
        [...counts.entries()]
          .filter(([, count]) => count >= 2)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([word]) => word)
      );
    } catch (error) {
      setWritingKeywordError(error instanceof Error ? error.message : "키워드 검색 중 오류가 발생했습니다.");
    } finally {
      setWritingKeywordLoading(false);
    }
  };

  const backToTopics = () => {
    setSelectedTopic(null);
    setView("topics");
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-[#29252D]">
      <div className="flex min-h-screen">

        {/* PC 사이드바 */}
        <aside className="hidden w-[245px] shrink-0 border-r border-[#EAE6E8] bg-white px-6 py-8 md:flex md:flex-col">
          <button onClick={() => goMenu("Home")} className="mb-12 text-left">
            <div className="text-[23px] font-bold tracking-tight text-[#5B456D]">PICKMOM LAB</div>
            <div className="mt-2 text-xs tracking-widest text-[#A49AA9]">MOM&apos;S CONTENT WORKSPACE</div>
          </button>

          <div className="mb-4 text-[11px] font-semibold tracking-widest text-[#A49AA9]">WORKSPACE</div>
          <nav className="flex flex-col gap-2">
            {menus.map((menu) => (
              <button
                key={menu.name}
                onClick={() => goMenu(menu.name)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${
                  activeMenu === menu.name
                    ? "bg-[#F0EAF4] font-semibold text-[#634B78]"
                    : "text-[#77717B] hover:bg-[#F8F6F8]"
                }`}
              >
                <span className="text-lg">{menu.icon}</span>
                {menu.name}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-[#F8F5F9] p-4">
            <div className="text-sm font-semibold text-[#634B78]">PICKMOM&apos;S NOTE</div>
            <p className="mt-2 text-xs leading-6 text-[#817787]">
              엄마의 선택이 조금 더 쉬워지도록.<br />
              찾고, 비교하고, 기록해요.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 pb-28 sm:px-6 md:px-10 md:py-10 md:pb-10">

          {/* 헤더 */}
          <header className="mb-7">
            <div className="text-xl font-bold text-[#5B456D] md:hidden">PICKMOM LAB</div>
            <div className="mt-3 flex items-center justify-between md:mt-0">
              <div>
                <h1 className="text-xl font-semibold md:text-2xl">
                  {view === "home" ? "Home"
                    : view === "topics" ? "인기 주제 전체보기"
                    : view === "topicDetail" ? "주제 상세 분석"
                    : view === "products" ? "인기 상품 전체보기"
                    : view === "productDetail" ? "상품 상세"
                    : view === "competitor" ? "키워드 발굴"
                    : activeMenu}
                </h1>
                <p className="mt-2 text-xs text-[#918995] sm:text-sm">
                  {view === "home"
                    ? "오늘의 트렌드와 콘텐츠 아이디어를 발견해 보세요."
                    : "PICKMOM LAB 콘텐츠 작업 공간"}
                </p>
              </div>
              {view !== "home" && (
                <button
                  onClick={() => goMenu("Home")}
                  className="rounded-full border border-[#EAE6E8] bg-white px-4 py-2 text-xs text-[#817787]"
                >
                  Home으로
                </button>
              )}
            </div>
          </header>

          {/* HOME */}
          {view === "home" && (
            <>
              <section className="mb-8 rounded-3xl bg-[#665174] px-6 py-7 text-white md:px-9 md:py-9">
                <div className="text-xs tracking-widest text-[#E0D5E8]">YOUR CONTENT, YOUR WAY</div>
                <h2 className="mt-4 text-2xl font-semibold leading-snug md:text-3xl">
                  오늘은 어떤 이야기를<br />기록해 볼까요?
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#E6DDEB]">
                  트렌드를 발견하고, 나만의 경험을 더해<br className="hidden sm:block" />
                  오래 읽히는 콘텐츠를 만들어 보세요.
                </p>
                <button
                  onClick={() => startWriting("")}
                  className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#665174]"
                >
                  새 글 시작하기 →
                </button>
              </section>

              <section className="mb-10">
                <div className="mb-5 flex items-end justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">이번 주 인기 주제</h2>
                    <p className="mt-1 text-xs text-[#A49AA9]">콘텐츠로 만들 만한 아이디어</p>
                  </div>
                  <button onClick={() => setView("topics")} className="text-xs font-semibold text-[#715B80]">
                    전체보기 →
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {topics.slice(0, 3).map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => goTopicDetail(topic)}
                      className="rounded-2xl border border-[#ECE8EA] bg-white p-4 text-left transition hover:border-[#CDBFD5]"
                    >
                      <div className="mb-2 text-[10px] text-[#8B7898]">{topic.category} · {topic.trend}</div>
                      <div className="text-sm font-semibold leading-6">{topic.title}</div>
                      <div className="mt-2 text-xs text-[#918995]">키워드 · {topic.keyword}</div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-[#A49AA9]">※ 현재는 화면 테스트용 샘플 데이터입니다.</p>
              </section>

              <section>
                <div className="mb-5 flex items-end justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">이번 주 인기 상품</h2>
                    <p className="mt-1 text-xs text-[#A49AA9]">콘텐츠와 수익으로 연결할 상품 후보</p>
                  </div>
                  <button onClick={() => setView("products")} className="text-xs font-semibold text-[#715B80]">
                    전체보기 →
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {products.slice(0, 2).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => { setSelectedProduct(product); setView("productDetail"); }}
                      className="rounded-2xl border border-[#ECE8EA] bg-white p-5 text-left"
                    >
                      <div className="mb-3 flex h-20 items-center justify-center rounded-xl bg-[#F5F1F6] text-3xl text-[#8D789C]">◇</div>
                      <div className="text-[10px] text-[#8B7898]">{product.category} · {product.season}</div>
                      <h3 className="mt-2 text-sm font-semibold">{product.name}</h3>
                      <p className="mt-2 text-xs text-[#918995]">{product.reason}</p>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-[#A49AA9]">※ 실제 판매 순위나 제휴 가능 여부가 확인된 데이터는 아닙니다.</p>
              </section>
            </>
          )}

          {/* 인기 주제 전체보기 */}
          {view === "topics" && (
            <section>
              <div className="mb-5 rounded-2xl bg-[#F0EAF4] p-5">
                <div className="font-semibold text-[#665174]">콘텐츠 주제 탐색</div>
                <p className="mt-2 text-xs leading-6 text-[#817787]">
                  관심 있는 주제를 선택해 검색 의도와 콘텐츠 기회를 자세히 확인해 보세요.
                </p>
              </div>
              <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs ${
                      category === item
                        ? "bg-[#665174] text-white"
                        : "border border-[#EAE6E8] bg-white text-[#817787]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="mb-3 text-xs text-[#A49AA9]">
                총 {filteredTopics.length}개 주제 · 주제를 누르면 상세 분석을 볼 수 있어요.
              </div>
              <div className="flex flex-col gap-3">
                {filteredTopics.map((topic, index) => (
                  <button
                    key={topic.id}
                    onClick={() => goTopicDetail(topic)}
                    className="rounded-2xl border border-[#ECE8EA] bg-white p-5 text-left transition hover:border-[#BBA9C7]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-2 text-[10px] text-[#8B7898]">
                          {topic.category} · SAMPLE {String(index + 1).padStart(2, "0")}
                        </div>
                        <h3 className="text-sm font-semibold leading-6">{topic.title}</h3>
                        <p className="mt-2 text-xs text-[#918995]">메인 키워드 · {topic.keyword}</p>
                      </div>
                      <span className="text-lg text-[#8D789C]">›</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 border-t border-[#F1EEF0] pt-3 text-[10px] text-[#89818D]">
                      <span>트렌드 <b className="text-[#665174]">{topic.trend}</b></span>
                      <span>경쟁도 <b className="text-[#665174]">{topic.competition}</b></span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 주제 상세 분석 */}
          {view === "topicDetail" && selectedTopic && (
            <section>
              <button onClick={backToTopics} className="mb-5 text-xs text-[#715B80]">
                ← 인기 주제 목록으로
              </button>
              <div className="rounded-3xl bg-[#665174] p-6 text-white md:p-8">
                <div className="text-xs text-[#E0D5E8]">{selectedTopic.category} · 주제 분석</div>
                <h2 className="mt-3 text-xl font-semibold leading-8 md:text-2xl">{selectedTopic.title}</h2>
                <p className="mt-3 text-sm text-[#E6DDEB]">메인 키워드 · {selectedTopic.keyword}</p>
                <button
                  onClick={() => startWriting(selectedTopic.title)}
                  className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#665174]"
                >
                  이 주제로 글 만들기 →
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  ["트렌드", selectedTopic.trend],
                  ["경쟁도", selectedTopic.competition],
                  ["카테고리", selectedTopic.category],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[#ECE8EA] bg-white p-4">
                    <div className="text-xs text-[#A49AA9]">{label}</div>
                    <div className="mt-2 text-sm font-semibold text-[#665174]">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-[#ECE8EA] bg-white p-5">
                <h3 className="font-semibold">① 사람들이 궁금해하는 질문</h3>
                <ul className="mt-4 space-y-3 text-sm text-[#716777]">
                  {selectedTopic.questions.map((q) => <li key={q}>• {q}</li>)}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-[#ECE8EA] bg-white p-5">
                <h3 className="font-semibold">② 콘텐츠 기회와 차별화 방향</h3>
                <p className="mt-3 text-sm leading-7 text-[#716777]">{selectedTopic.opportunity}</p>
              </div>

              <div className="mt-4 rounded-2xl border border-[#ECE8EA] bg-white p-5">
                <h3 className="font-semibold">③ 추천 콘텐츠 목차</h3>
                <ol className="mt-4 space-y-3 text-sm text-[#716777]">
                  {selectedTopic.outline.map((item, i) => <li key={item}>{i + 1}. {item}</li>)}
                </ol>
              </div>

              <div className="mt-4 rounded-2xl border border-[#ECE8EA] bg-white p-5">
                <h3 className="font-semibold">④ 검색 의도</h3>
                <p className="mt-3 text-sm leading-7 text-[#716777]">{selectedTopic.intent}</p>
              </div>

              <p className="mt-4 text-[10px] leading-5 text-[#A49AA9]">
                ※ 현재 상세 분석은 화면 구조 확인용 예시입니다. 실제 검색 트렌드·상위 블로그·경쟁 분석은 API와 검색 자료를 연결한 뒤 제공됩니다.
              </p>
              <button
                onClick={() => startWriting(selectedTopic.title)}
                className="mt-6 w-full rounded-xl bg-[#665174] py-4 text-sm font-semibold text-white"
              >
                이 주제로 글 만들기
              </button>
            </section>
          )}

          {/* 상품 전체보기 */}
          {view === "products" && (
            <section>
              <div className="mb-5 rounded-2xl bg-[#F0EAF4] p-5">
                <h2 className="font-semibold text-[#665174]">상품 발굴 작업실</h2>
                <p className="mt-2 text-xs leading-6 text-[#817787]">
                  시즌성, 쇼핑 클릭 추이, 가격, 리뷰, 제휴 가능성을 살펴볼 예정이에요.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => { setSelectedProduct(product); setView("productDetail"); }}
                    className="rounded-2xl border border-[#ECE8EA] bg-white p-5 text-left"
                  >
                    <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-[#F5F1F6] text-3xl text-[#8D789C]">◇</div>
                    <div className="text-xs text-[#8B7898]">{product.category} · {product.season}</div>
                    <h3 className="mt-2 font-semibold">{product.name}</h3>
                    <p className="mt-2 text-xs text-[#918995]">{product.reason}</p>
                    <p className="mt-3 text-xs text-[#817787]">{product.price}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 상품 상세 */}
          {view === "productDetail" && selectedProduct && (
            <section>
              <button onClick={() => setView("products")} className="mb-5 text-xs text-[#715B80]">
                ← 상품 목록으로
              </button>
              <div className="rounded-3xl bg-[#665174] p-6 text-white">
                <div className="text-xs text-[#E0D5E8]">{selectedProduct.category}</div>
                <h2 className="mt-3 text-2xl font-semibold">{selectedProduct.name}</h2>
                <p className="mt-3 text-sm text-[#E6DDEB]">{selectedProduct.reason}</p>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["시즌성", selectedProduct.season],
                  ["가격", selectedProduct.price],
                  ["콘텐츠 방향", selectedProduct.reason],
                  ["제휴 가능 여부", "확인 필요 · 쇼핑커넥트에서 확인 예정"],
                  ["판매 및 리뷰 데이터", "실제 데이터 연결 전"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[#ECE8EA] bg-white p-5">
                    <div className="text-xs text-[#A49AA9]">{label}</div>
                    <div className="mt-2 text-sm font-medium">{value}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 키워드 발굴 */}
          {view === "competitor" && <CompetitorAnalysis />}

          {/* 글쓰기 */}
          {view === "writing" && (
            <section className="mx-auto max-w-3xl">
              <div className="mb-7 rounded-2xl border border-[#ECE8EA] bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#665174]">CONTENT CREATION</span>
                  <span className="text-xs text-[#A49AA9]">STEP {writingStep} / 5</span>
                </div>

                <div className="mt-4 flex gap-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full ${
                        writingStep >= step ? "bg-[#665174]" : "bg-[#EEE9F0]"
                      }`}
                    />
                  ))}
                </div>

                <h2 className="mt-5 font-semibold">
                  {writingStep === 1 && "먼저 검색 키워드를 정해 주세요."}
                  {writingStep === 2 && "어떤 방향으로 글을 쓸까요?"}
                  {writingStep === 3 && "나의 경험과 사진을 추가해 주세요."}
                  {writingStep === 4 && "조사한 정보와 추가 메모를 입력해 주세요."}
                  {writingStep === 5 && "작성 내용을 확인해 주세요."}
                </h2>

                <p className="mt-2 text-xs text-[#918995]">
                  {writingStep === 1 && "실제로 검색되는 단어를 입력하고 문서 수와 함께 등장하는 표현을 확인합니다."}
                  {writingStep === 2 && "검색 의도에 맞는 글의 유형을 하나 선택해 주세요."}
                  {writingStep === 3 && "기억나는 경험을 편하게 적고 사진을 첨부해 주세요."}
                  {writingStep === 4 && "영업시간, 주차, 가격 등 조사한 정보를 자유롭게 붙여 넣으세요."}
                  {writingStep === 5 && "선택한 키워드와 글 방향, 입력한 자료를 확인해 주세요."}
                </p>
              </div>

              {/* STEP 1. 키워드 선택 */}
              {writingStep === 1 && (
                <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 sm:p-7">
                  <h3 className="font-semibold">어떤 키워드로 검색 유입을 만들까요?</h3>
                  <p className="mt-2 text-xs leading-6 text-[#918995]">문장보다 실제 검색창에 입력할 만한 핵심 단어를 입력해 주세요. 예: 서래마을 맛집, 초등 영어 교재, 서울 크리스마스 마켓</p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <input value={writingTargetKeyword} onChange={(e) => setWritingTargetKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") searchWritingKeyword(); }} placeholder="검색 키워드 입력" className="min-w-0 flex-1 rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] px-4 py-3 text-sm outline-none focus:border-[#9B82AC]" />
                    <button onClick={searchWritingKeyword} disabled={!writingTargetKeyword.trim() || writingKeywordLoading} className="rounded-xl bg-[#665174] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{writingKeywordLoading ? "검색 중..." : "키워드 분석"}</button>
                  </div>
                  {writingKeywordError && <p className="mt-3 text-xs text-[#A15B5B]">{writingKeywordError}</p>}
                  {writingDocumentCount !== null && (
                    <div className="mt-5 rounded-xl bg-[#F8F5F9] p-4">
                      <p className="text-xs text-[#817787]">네이버 블로그 검색 결과 문서 수</p>
                      <p className="mt-1 text-2xl font-semibold text-[#665174]">{writingDocumentCount.toLocaleString("ko-KR")}<span className="ml-1 text-xs font-normal">건</span></p>
                      <p className="mt-2 text-[10px] leading-5 text-[#A49AA9]">네이버 블로그 검색 API의 전체 결과 수입니다. 월간 검색량이나 전체 웹문서 수와는 다른 지표입니다.</p>
                    </div>
                  )}
                  {writingRelatedKeywords.length > 0 && (
                    <div className="mt-5">
                      <h4 className="text-sm font-semibold">검색 결과에서 함께 발견된 표현</h4>
                      <p className="mt-1 text-[10px] text-[#A49AA9]">수집된 블로그 제목·요약에 반복 등장한 단어입니다. 네이버 공식 연관검색어 목록은 아닙니다.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {writingRelatedKeywords.map((word) => (
                          <button key={word} onClick={() => setWritingTargetKeyword(word)} className={`rounded-full border px-3 py-2 text-xs ${writingTargetKeyword === word ? "border-[#8D789C] bg-[#F0EAF4] text-[#665174]" : "border-[#ECE8EA] bg-white text-[#817787]"}`}>{word}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2. 글 방향 */}
              {writingStep === 2 && (
                <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 sm:p-7">
                  <h3 className="font-semibold">글 방향을 하나 선택해주세요.</h3>
                  <p className="mt-2 text-xs text-[#918995]">선택한 방향에 맞춰 제목과 본문 구성을 만들게요.</p>
                  <div className="mt-5 flex flex-col gap-3">
                    {[
                      ["정보·방법", "꿀팁 · 방법 · 가이드"],
                      ["직접 경험 후기", "내돈내산 · 솔직 리뷰"],
                      ["비교·선택", "장단점 비교 · 추천"],
                      ["문제 해결", "궁금증 · 오류 해결"],
                    ].map(([name, desc]) => (
                      <button key={name} onClick={() => setWritingType(name)} className={`rounded-xl border p-4 text-left ${writingType === name ? "border-[#8D789C] bg-[#F7F3F9]" : "border-[#ECE8EA]"}`}>
                        <div className="flex items-center justify-between text-sm font-semibold">{name}<span>{writingType === name ? "●" : "○"}</span></div>
                        <p className="mt-2 text-xs text-[#918995]">{desc}</p>
                      </button>
                    ))}
                  </div>
                  <p className="mt-5 text-xs font-medium text-[#665174]">다음: 제목 만들기 →</p>
                </div>
              )}

              {/* STEP 2. 경험 메모와 사진 */}
              {writingStep === 2 && (
                <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 sm:p-7">
                  <h3 className="font-semibold">나의 경험과 이야기</h3>
                  <p className="mt-2 text-xs text-[#918995]">
                    완성된 문장이 아니어도 괜찮아요. 기억나는 내용을 편하게 적어 주세요.
                  </p>

                  <textarea
                    value={writingNotes}
                    onChange={(e) => setWritingNotes(e.target.value)}
                    placeholder={"방문하게 된 계기\n찾아가는 과정과 첫인상\n직접 먹거나 이용한 것\n좋았던 점과 아쉬웠던 점\n아이의 반응이나 기억에 남는 순간\n다시 방문할 의향"}
                    rows={10}
                    className="mt-5 w-full resize-y rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] p-4 text-sm leading-7 outline-none focus:border-[#9B82AC]"
                  />

                  <h3 className="mt-7 text-sm font-semibold">사진 첨부</h3>
                  <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#CDBFD5] bg-[#FAF8FB] p-7 text-center">
                    <span className="text-2xl text-[#8D789C]">＋</span>
                    <span className="mt-2 text-sm font-medium text-[#665174]">사진 선택하기</span>
                    <span className="mt-1 text-xs text-[#A49AA9]">여러 장 선택 가능</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        setWritingFiles(Array.from(e.target.files ?? []).map((file) => file.name))
                      }
                    />
                  </label>

                  {writingFiles.length > 0 && (
                    <div className="mt-4 rounded-xl bg-[#F8F5F9] p-4">
                      <p className="text-xs font-semibold text-[#665174]">
                        선택한 사진 {writingFiles.length}장
                      </p>
                      {writingFiles.map((file, i) => (
                        <p key={`${file}-${i}`} className="mt-2 truncate text-xs text-[#817787]">
                          {file}
                        </p>
                      ))}
                      <button
                        onClick={() => setWritingFiles([])}
                        className="mt-3 text-xs text-[#A16D79]"
                      >
                        사진 초기화
                      </button>
                    </div>
                  )}

                  <p className="mt-3 text-[10px] text-[#A49AA9]">
                    현재는 사진 파일명만 표시해요. 실제 사진 업로드는 추후 연결할 예정이에요.
                  </p>
                </div>
              )}

              {/* STEP 3. 조사 정보 및 추가 메모 */}
              {writingStep === 3 && (
                <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 sm:p-7">
                  <h3 className="font-semibold">조사한 정보 및 추가 메모</h3>
                  <p className="mt-2 text-xs leading-6 text-[#918995]">
                    직접 조사하거나 확인한 정보를 자유롭게 붙여 넣어 주세요.
                    항목별로 나눠 적지 않아도 괜찮아요.
                  </p>

                  <textarea
                    value={writingKeyword}
                    onChange={(e) => setWritingKeyword(e.target.value)}
                    placeholder={"예시\n\n주소: 서울 ○○구 ○○로\n영업시간: 매일 10:00~21:00\n주차: 건물 지하 주차장 2시간 무료\n가격: 대표 메뉴 15,000원\n예약: 네이버 예약 가능\n\n공식 홈페이지나 참고한 사이트 주소도 함께 적어 주세요.\n그 외에 글에 반영하고 싶은 내용도 자유롭게 입력해 주세요."}
                    rows={14}
                    className="mt-5 w-full resize-y rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] p-4 text-sm leading-7 outline-none focus:border-[#9B82AC]"
                  />

                  <div className="mt-4 rounded-xl bg-[#F8F5F9] p-4">
                    <p className="text-xs leading-6 text-[#817787]">
                      이 메모는 실제 경험과 구분해서 활용할 예정이에요.
                      영업시간, 가격, 주차 등 확인이 필요한 정보는 추후 출처와 함께 검증하도록 구성할게요.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4. 입력 내용 확인 */}
              {writingStep === 4 && (
                <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 sm:p-7">
                  <h3 className="font-semibold">작성 정보 확인</h3>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-xl bg-[#F8F5F9] p-4">
                      <p className="text-xs text-[#A49AA9]">메인 키워드</p>
                      <p className="mt-2 text-sm font-semibold">{writingTargetKeyword || "선택한 키워드가 없어요."}</p>
                      {writingDocumentCount !== null && <p className="mt-1 text-xs text-[#817787]">네이버 블로그 검색 결과 {writingDocumentCount.toLocaleString("ko-KR")}건</p>}
                    </div>
                    <div className="rounded-xl bg-[#F8F5F9] p-4">
                      <p className="text-xs text-[#A49AA9]">글 방향</p>
                      <p className="mt-2 text-sm font-semibold">{writingType}</p>
                    </div>

                    {writingRelatedKeywords.length > 0 && <div className="rounded-xl bg-[#F8F5F9] p-4"><p className="text-xs text-[#A49AA9]">함께 발견된 표현</p><p className="mt-2 text-sm text-[#716777]">{writingRelatedKeywords.join(" · ")}</p></div>}\n                    {writingTitle && (
                      <div className="rounded-xl bg-[#F8F5F9] p-4">
                        <p className="text-xs text-[#A49AA9]">선택한 주제</p>
                        <p className="mt-2 text-sm font-semibold">{writingTitle}</p>
                      </div>
                    )}

                    <div className="rounded-xl bg-[#F8F5F9] p-4">
                      <p className="text-xs text-[#A49AA9]">나의 경험과 이야기</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#716777]">
                        {writingNotes || "작성된 메모가 없어요."}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F8F5F9] p-4">
                      <p className="text-xs text-[#A49AA9]">조사 정보 및 추가 메모</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#716777]">
                        {writingKeyword || "작성된 메모가 없어요."}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F8F5F9] p-4">
                      <p className="text-xs text-[#A49AA9]">첨부 사진</p>
                      <p className="mt-2 text-sm">{writingFiles.length}장 선택</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-[#EAE3EE] p-4">
                    <p className="text-sm font-semibold text-[#665174]">다음 단계에서 진행할 작업</p>
                    <ul className="mt-3 space-y-2 text-xs leading-6 text-[#817787]">
                      <li>✓ 선택한 키워드와 글 방향으로 제목 후보 생성</li>
                      <li>✓ 네이버 검색 결과와 경쟁 콘텐츠 조사</li>
                      <li>✓ 공식 자료 및 사실 확인</li>
                      <li>✓ 경험과 자료를 반영한 본문 작성</li>
                    </ul>
                  </div>

                  <p className="mt-4 text-xs text-[#A49AA9]">
                    실제 AI 분석과 글 생성은 API 연결 후 활성화할 예정이에요.
                  </p>
                </div>
              )}

              {/* 이전 / 다음 버튼 */}
              <div className="mt-6 flex gap-3">
                {writingStep > 1 && (
                  <button
                    onClick={() => setWritingStep(writingStep - 1)}
                    className="flex-1 rounded-xl border border-[#EAE6E8] bg-white py-4 text-sm font-semibold text-[#716777]"
                  >
                    ← 이전
                  </button>
                )}

                {writingStep < 5 ? (
                  <button
                    onClick={() => setWritingStep(writingStep + 1)}
                    className="flex-1 rounded-xl bg-[#665174] py-4 text-sm font-semibold text-white"
                  >
                    다음 단계 →
                  </button>
                ) : (
                  <button
                    onClick={() => setWritingStep(2)}
                    className="flex-1 rounded-xl bg-[#665174] py-4 text-sm font-semibold text-white"
                  >
                    내용 수정하기
                  </button>
                )}
              </div>
            </section>
          )}

          {/* 준비 중인 기능 */}
          {view === "placeholder" && (
            <section className="rounded-3xl border border-[#ECE8EA] bg-white p-6">
              <h2 className="text-lg font-semibold">{activeMenu}</h2>
              <p className="mt-3 text-sm leading-7 text-[#918995]">
                이 기능은 다음 개발 단계에서 연결할 예정이에요.
              </p>
              <span className="mt-5 inline-block rounded-full bg-[#F3EFF5] px-3 py-2 text-xs text-[#715B80]">
                준비 중
              </span>
            </section>
          )}

          <footer className="mt-12 border-t border-[#EAE6E8] py-6 text-center text-[10px] tracking-widest text-[#B0A8B2]">
            PICKMOM LAB · FIND WHAT MATTERS
          </footer>
        </main>
      </div>

      {/* 모바일 하단 메뉴 */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#EAE6E8] bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {[
            { name: "Home", icon: "⌂" },
            { name: "새 글 만들기", icon: "✎" },
            { name: "시즌 상품 추천", icon: "◇" },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => goMenu(item.name)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-1 text-[10px] ${
                activeMenu === item.name ? "font-semibold text-[#665174]" : "text-[#A49AA9]"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.name === "시즌 상품 추천" ? "상품" : item.name === "새 글 만들기" ? "글쓰기" : "Home"}
            </button>
          ))}

          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-1 text-[10px] ${
              moreOpen ? "font-semibold text-[#665174]" : "text-[#A49AA9]"
            }`}
          >
            <span className="text-xl">☰</span>
            더보기
          </button>
        </div>

        {moreOpen && (
          <div className="mx-auto mt-2 grid max-w-lg grid-cols-2 gap-2 border-t border-[#EEE9F0] px-2 pt-3">
            <button
              onClick={() => goMenu("릴스 · 클립 만들기")}
              className="rounded-xl bg-[#F8F5F9] p-3 text-xs text-[#665174]"
            >
              ▷ 릴스 · 클립 만들기
            </button>
            <button
              onClick={() => goMenu("템플릿 관리")}
              className="rounded-xl bg-[#F8F5F9] p-3 text-xs text-[#665174]"
            >
              ▤ 템플릿 관리
            </button>
            <button
              onClick={() => goMenu("키워드 발굴")}
              className="rounded-xl bg-[#F8F5F9] p-3 text-xs text-[#665174]"
            >
              ⌕ 키워드 발굴
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
