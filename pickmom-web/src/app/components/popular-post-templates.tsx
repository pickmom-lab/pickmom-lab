"use client";

import { useEffect, useState } from "react";

type Template = {
  id: number;
  name: string;
  keyword: string;
  sourceUrl: string;
  titlePattern: string;
  introPattern: string;
  headings: string;
  photoNotes: string;
  differentiation: string;
};

const emptyTemplate = {
  name: "", keyword: "", sourceUrl: "", titlePattern: "", introPattern: "",
  headings: "", photoNotes: "", differentiation: "",
};

export default function PopularPostTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState(emptyTemplate);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("pickmom-popular-post-templates-v1");
      if (raw) setTemplates(JSON.parse(raw) as Template[]);
    } catch {
      // Keep the template workspace usable if local data is invalid.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) window.localStorage.setItem("pickmom-popular-post-templates-v1", JSON.stringify(templates));
  }, [templates, loaded]);

  const save = () => {
    if (!form.name.trim()) return;
    if (editingId !== null) {
      setTemplates(old => old.map(item => item.id === editingId ? { ...item, ...form } : item));
    } else {
      setTemplates(old => [{ id: Date.now(), ...form }, ...old]);
    }
    reset();
  };

  const reset = () => {
    setForm(emptyTemplate);
    setEditingId(null);
  };

  const edit = (item: Template) => {
    setEditingId(item.id);
    setForm({
      name: item.name, keyword: item.keyword, sourceUrl: item.sourceUrl,
      titlePattern: item.titlePattern, introPattern: item.introPattern,
      headings: item.headings, photoNotes: item.photoNotes, differentiation: item.differentiation,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = (id: number) => {
    if (window.confirm("이 템플릿을 삭제할까요?")) setTemplates(old => old.filter(item => item.id !== id));
  };

  const field = (label: string, key: keyof typeof emptyTemplate, placeholder: string, rows = 2) => (
    <label className="block text-xs text-[#817787]">{label}
      <textarea value={form[key]} onChange={e => setForm(old => ({ ...old, [key]: e.target.value }))} rows={rows} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] p-3 text-sm leading-6 text-[#29252D] outline-none focus:border-[#9B82AC]" />
    </label>
  );

  return (
    <section className="mx-auto max-w-5xl space-y-5 pb-8">
      <div className="rounded-3xl bg-[#665174] p-6 text-white md:p-8">
        <p className="text-[10px] tracking-[.2em] text-[#DCCFE5]">PICKMOM LAB · REFERENCE LIBRARY</p>
        <h2 className="mt-3 text-2xl font-semibold md:text-3xl">인기글 분석 · 템플릿 관리</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#E8DFEC]">참고할 인기글을 직접 등록하고, 글의 구조와 우리 블로그에 적용할 요소를 정리해 나만의 템플릿으로 관리합니다.</p>
      </div>

      <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
        <div className="mb-5">
          <h3 className="font-semibold">{editingId === null ? "참고 글 등록하기" : "템플릿 수정하기"}</h3>
          <p className="mt-1 text-xs leading-5 text-[#A49AA9]">인기글 URL과 내용을 직접 확인한 뒤, 분석한 패턴을 아래 항목에 기록해 주세요.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-[#817787]">템플릿 이름<input value={form.name} onChange={e => setForm(old => ({ ...old, name: e.target.value }))} placeholder="예: 지역 체험 장소 리스트형" className="mt-2 w-full rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] p-3 text-sm text-[#29252D]" /></label>
          <label className="block text-xs text-[#817787]">연관 키워드<input value={form.keyword} onChange={e => setForm(old => ({ ...old, keyword: e.target.value }))} placeholder="예: 서울 아이와 실내 체험" className="mt-2 w-full rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] p-3 text-sm text-[#29252D]" /></label>
          <label className="block text-xs text-[#817787] sm:col-span-2">참고 인기글 URL<input value={form.sourceUrl} onChange={e => setForm(old => ({ ...old, sourceUrl: e.target.value }))} placeholder="참고한 네이버 블로그 글 주소" className="mt-2 w-full rounded-xl border border-[#EAE6E8] bg-[#FCFBFC] p-3 text-sm text-[#29252D]" /></label>
          {field("제목 패턴", "titlePattern", "예: 지역 + 대상 + 계절 + 추천 개수")}
          {field("도입부 전개 방식", "introPattern", "예: 독자의 고민 제시 → 핵심 요약 → 추천 기준")}
          {field("소제목 / 본문 구성", "headings", "소제목을 순서대로 기록해 주세요.", 5)}
          {field("사진·정보 배치 특징", "photoNotes", "예: 대표 사진 다음에 요약표, 장소별 사진과 가격 정보 배치")}
          {field("우리 글에 적용할 차별화 요소", "differentiation", "예: 직접 방문 경험, 아이 연령별 반응, 주차 동선")}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={save} disabled={!form.name.trim()} className="rounded-xl bg-[#665174] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{editingId === null ? "템플릿 저장" : "수정 내용 저장"}</button>
          {editingId !== null && <button onClick={reset} className="rounded-xl border border-[#EAE6E8] px-5 py-3 text-sm text-[#716777]">수정 취소</button>}
        </div>
      </div>

      <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">저장한 템플릿</h3><span className="text-xs text-[#A49AA9]">{templates.length}개</span></div>
        {templates.length === 0 ? <p className="py-8 text-center text-sm text-[#A49AA9]">아직 저장한 템플릿이 없습니다. 참고 글을 분석해 첫 템플릿을 만들어 보세요.</p> :
          <div className="space-y-3">{templates.map(item => <article key={item.id} className="rounded-xl border border-[#F0ECF1] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h4 className="text-sm font-semibold text-[#51445A]">{item.name}</h4><p className="mt-1 text-xs text-[#918995]">{item.keyword || "키워드 미지정"}</p>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-xs text-[#80678F] underline">참고 글 열기</a>}</div><div className="flex shrink-0 gap-2"><button onClick={() => edit(item)} className="rounded-lg border border-[#EAE6E8] px-3 py-2 text-xs text-[#665174]">수정</button><button onClick={() => remove(item.id)} className="rounded-lg border border-[#EAE6E8] px-3 py-2 text-xs text-[#A16D79]">삭제</button></div></div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><p className="text-[10px] font-semibold text-[#9B82AC]">제목 패턴</p><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#817787]">{item.titlePattern || "미기록"}</p></div><div><p className="text-[10px] font-semibold text-[#9B82AC]">도입부</p><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#817787]">{item.introPattern || "미기록"}</p></div><div><p className="text-[10px] font-semibold text-[#9B82AC]">본문 구성</p><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#817787]">{item.headings || "미기록"}</p></div><div><p className="text-[10px] font-semibold text-[#9B82AC]">차별화 요소</p><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#817787]">{item.differentiation || "미기록"}</p></div></div>
          </article>)}</div>}
      </div>
      <p className="text-[10px] leading-5 text-[#A49AA9]">현재는 자동으로 인기글을 수집하거나 본문을 학습하지 않습니다. 사용자가 직접 확인한 분석 내용을 브라우저에 저장하는 관리 기능이며, 저장 데이터는 현재 브라우저에만 보관됩니다.</p>
    </section>
  );
}
