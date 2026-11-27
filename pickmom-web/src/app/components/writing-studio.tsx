"use client";

import { useEffect, useMemo, useState } from "react";

type Category = "맛집·카페" | "여행·체험" | "교육 정보" | "리빙·제품" | "생활·정책" | "부동산·주거";
type Purpose = "정보" | "실사용 후기" | "비교" | "문제 해결";
type Photo = { id: string; src: string; caption: string };
type Props = {
  initialKeyword?: string;
  initialCategory?: Category;
  initialPhotos?: string[];
  initialData?: string;
  onSave: (v: { title: string; keyword: string; category: Category; purpose: string; date: string; draft: string; photos: string[]; formData: string; status: "원고 작성" | "발행 준비" }) => void;
};
const categories: Category[] = ["맛집·카페", "여행·체험", "교육 정보", "리빙·제품", "생활·정책", "부동산·주거"];
const purposes: Purpose[] = ["정보", "실사용 후기", "비교", "문제 해결"];
const detect = (s: string): Category => /맛집|식당|카페|디저트|빵|케이크|쿠키|국수|음식/.test(s) ? "맛집·카페" : /여행|호텔|리조트|나들이|체험|전시|마켓|가볼|실내/.test(s) ? "여행·체험" : /영어|수학|초등|유치원|학원|교육|책|독서|입학/.test(s) ? "교육 정보" : /지원금|정책|신청|정부|할인|혜택|공휴일/.test(s) ? "생활·정책" : /부동산|아파트|전세|월세|청약|이사|주거/.test(s) ? "부동산·주거" : "리빙·제품";
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
export default function WritingStudio({ initialKeyword = "", initialCategory, initialPhotos = [], initialData, onSave }: Props) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [category, setCategory] = useState<Category>(initialCategory || detect(initialKeyword));
  const [purpose, setPurpose] = useState<Purpose>(/맛집|카페|여행|체험/.test(initialKeyword) ? "실사용 후기" : "정보");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState(initialKeyword);
  const [draft, setDraft] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tips, setTips] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!initialData) { setKeyword(initialKeyword); setTitle(initialKeyword); setCategory(initialCategory || detect(initialKeyword)); setPurpose(/맛집|카페|여행|체험/.test(initialKeyword) ? "실사용 후기" : "정보"); }
  }, [initialKeyword, initialCategory, initialData]);
  useEffect(() => {
    if (!initialData) return;
    try {
      const d = JSON.parse(initialData);
      setKeyword(d.keyword || initialKeyword);
      setTitle(d.title || d.keyword || initialKeyword);
      setCategory(d.category || initialCategory || detect(d.keyword || initialKeyword));
      setPurpose(d.purpose === "직접 경험·방문 후기" ? "실사용 후기" : d.purpose === "비교·분석" ? "비교" : d.purpose === "문제 해결·노하우" ? "문제 해결" : "정보");
      setDate(d.date || today());
      setNotes(d.notes || Object.values(d.values || {}).filter(Boolean).join("\n"));
      setDraft(typeof d.draft === "string" ? d.draft : "");
      setTips(d.tips || "");
      const restored = initialPhotos.length ? initialPhotos : (d.photos || []).map((p: any) => typeof p === "string" ? p : p.src).filter(Boolean);
      setPhotos(restored.map((src: string, i: number) => ({ id: d.photoMeta?.[i]?.id || String(i), src, caption: d.photoMeta?.[i]?.caption || "" })));
      setStep(3);
    } catch { /* Keep a fresh editor if legacy data cannot be parsed. */ }
  }, [initialData, initialKeyword, initialCategory, initialPhotos]);
  const titleIdeas = useMemo(() => {
    const k = keyword.trim() || "주제";
    return purpose === "실사용 후기"
      ? [`${k} 직접 이용해 본 후기와 방문 전 알아둘 점`, `${k} 솔직 후기｜좋았던 점과 아쉬웠던 점`, `${k} 방문 기록, 가격·주차·이용 정보 정리`]
      : purpose === "비교"
      ? [`${k} 비교｜차이점과 선택 기준 정리`, `${k} 무엇이 다를까? 장단점 한눈에 보기`, `${k} 비교해 보니, 내게 맞는 선택은?`]
      : purpose === "문제 해결"
      ? [`${k} 해결 방법과 꼭 확인할 사항`, `${k} 막막할 때 확인할 순서와 실제 팁`, `${k} 실수 줄이는 방법, 단계별 정리`]
      : [`${k} 핵심 정보와 꼭 알아둘 내용`, `${k} 일정·비용·조건 한 번에 정리`, `${k} 처음 알아보는 사람을 위한 안내`];
  }, [keyword, purpose]);
  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    const added = await Promise.all(Array.from(files).slice(0, 12 - photos.length).map(file => new Promise<Photo>(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: `${Date.now()}-${Math.random()}`, src: String(reader.result), caption: "" });
      reader.readAsDataURL(file);
    })));
    setPhotos(old => [...old, ...added]);
    setBusy(false);
  };
  const movePhoto = (i: number, delta: number) => setPhotos(old => {
    const next = [...old], j = i + delta;
    if (j < 0 || j >= next.length) return old;
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
  const save = (status: "원고 작성" | "발행 준비") => {
    const data = { keyword, title, category, purpose, date, notes, tips, photoMeta: photos.map(({ id, caption }) => ({ id, caption })), draft };
    onSave({ title: title || keyword, keyword, category, purpose, date, draft, photos: photos.map(p => p.src), formData: JSON.stringify(data), status });
  };
  return <section className="mx-auto max-w-4xl space-y-5 pb-8">
    <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5">
      <div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-[#80678F]">PICKMOM LAB · WRITING FLOW</p><h2 className="mt-1 font-semibold">키워드 조사부터 원고 완성까지</h2></div><span className="text-xs text-[#918995]">STEP {step}/3</span></div>
      <div className="mt-4 grid grid-cols-3 gap-2">{["주제·유형", "내 경험·자료", "원고 편집"].map((x,i)=><button key={x} onClick={()=>setStep((i+1) as 1|2|3)} className={`rounded-lg p-2.5 text-xs font-semibold ${step===i+1?"bg-[#665174] text-white":"bg-[#F5F1F6] text-[#80678F]"}`}>{i+1}. {x}</button>)}</div>
    </div>
    {step===1 && <div className="rounded-2xl border bg-white p-5 md:p-6">
      <h3 className="font-semibold">어떤 글을 쓸까요?</h3>
      <label className="mt-4 block text-xs text-[#817787]">핵심 키워드<input value={keyword} onChange={e=>{setKeyword(e.target.value);if(!title||title===keyword)setTitle(e.target.value);}} placeholder="예: 서울 머랭롤 맛집" className="mt-2 w-full rounded-xl border p-3 text-sm"/></label>
      <label className="mt-4 block text-xs text-[#817787]">카테고리<select value={category} onChange={e=>setCategory(e.target.value as Category)} className="mt-2 w-full rounded-xl border bg-white p-3 text-sm">{categories.map(x=><option key={x}>{x}</option>)}</select></label>
      <p className="mt-4 text-xs text-[#817787]">콘텐츠 유형</p><div className="mt-2 grid grid-cols-2 gap-2">{purposes.map(x=><button key={x} onClick={()=>setPurpose(x)} className={`rounded-xl border p-3 text-sm ${purpose===x?"border-[#8D789C] bg-[#F7F3F9] font-semibold text-[#665174]":""}`}>{x}</button>)}</div>
      <button disabled={!keyword.trim()} onClick={()=>setStep(2)} className="mt-5 rounded-xl bg-[#665174] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">다음 단계 →</button>
    </div>}
    {step===2 && <div className="space-y-4 rounded-2xl border bg-white p-5 md:p-6">
      <div><h3 className="font-semibold">경험과 알고 있는 내용을 편하게 적어주세요.</h3><p className="mt-1 text-xs leading-5 text-[#918995]">항목별로 나눠 입력할 필요 없습니다. 방문 과정, 좋았던 점, 아쉬운 점, 가격, 주소, 주차 등 기억나는 내용을 한 번에 적으면 AI가 글의 유형에 맞춰 정리하도록 설계합니다.</p></div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={9} placeholder="예: 어디를 방문했는지, 왜 선택했는지, 실제로 어땠는지, 독자에게 알려주고 싶은 점을 자유롭게 적어주세요." className="w-full rounded-xl border p-4 text-sm leading-7"/>
      <div className="rounded-xl border border-dashed p-4"><h4 className="text-sm font-semibold">사진 첨부 (최대 12장)</h4><input type="file" accept="image/*" multiple disabled={busy||photos.length>=12} onChange={e=>{void addPhotos(e.target.files);e.currentTarget.value="";}} className="mt-3 w-full text-xs"/>{photos.map((p,i)=><div key={p.id} className="mt-3 flex items-center gap-3 border-t pt-3"><img src={p.src} alt="" className="h-16 w-16 rounded-lg object-cover"/><div className="min-w-0 flex-1"><input value={p.caption} onChange={e=>setPhotos(old=>old.map((x,j)=>j===i?{...x,caption:e.target.value}:x))} placeholder="선택: 사진 설명" className="w-full rounded border p-2 text-xs"/><div className="mt-2 flex gap-3 text-xs"><button onClick={()=>movePhoto(i,-1)} disabled={!i}>위로</button><button onClick={()=>movePhoto(i,1)} disabled={i===photos.length-1}>아래로</button><button onClick={()=>setPhotos(old=>old.filter((_,j)=>j!==i))} className="text-rose-700">삭제</button></div></div></div>)}</div>
      <button onClick={()=>setShowTips(v=>!v)} className="text-xs font-semibold text-[#665174]">{showTips?"▾":"▸"} 이번 글 작성 팁 (선택)</button>{showTips&&<textarea value={tips} onChange={e=>setTips(e.target.value)} rows={3} placeholder="이번 글에만 적용할 요청사항" className="w-full rounded-xl border p-3 text-sm"/>}
      <div className="flex gap-2"><button onClick={()=>setStep(1)} className="rounded-xl border px-4 py-3 text-sm">← 이전</button><button onClick={()=>setStep(3)} className="rounded-xl bg-[#665174] px-5 py-3 text-sm text-white">원고 편집 화면 →</button></div>
      <p className="text-[10px] leading-5 text-[#A49AA9]">현재 이 버전에는 외부 AI 조사·작성 API가 아직 연결되지 않았습니다. 실제 검색·출처 검증·AI 원고 생성이 연결되기 전에는 생성 완료나 검증 완료로 표시하지 않습니다.</p>
    </div>}
    {step===3 && <div className="rounded-2xl border bg-white p-5 md:p-6">
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">통합 원고 편집기</h3><p className="mt-1 text-xs text-[#918995]">제목과 본문을 한 화면에서 직접 수정합니다. 외부 AI 조사·원고 생성은 아직 연결되지 않았습니다.</p></div><button onClick={()=>setStep(2)} className="text-xs text-[#665174]">← 입력 수정</button></div>
      <div className="mt-4"><p className="mb-1 text-xs font-semibold">제목 구성 예시</p><p className="mb-2 text-[10px] text-[#A49AA9]">키워드와 글 유형을 바탕으로 만든 문장 예시입니다. AI 조사·분석 결과는 아닙니다.</p><div className="space-y-2">{titleIdeas.map((x,i)=><button key={x} onClick={()=>setTitle(x)} className={`block w-full rounded-lg border p-3 text-left text-xs leading-5 ${title===x?"border-[#8D789C] bg-[#F7F3F9]":"border-[#ECE8EA]"}`}>{i+1}. {x}</button>)}</div><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="직접 제목 입력" className="mt-3 w-full rounded-xl border p-3 text-sm"/></div>
      <label className="mt-4 block text-xs font-semibold">본문<textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={20} placeholder="조사한 자료나 직접 작성한 내용을 붙여넣고 편집하세요. AI 조사·원고 생성 기능은 아직 연결되지 않았습니다." className="mt-2 w-full rounded-xl border p-4 text-sm leading-7 font-normal"/></label>
      <div className="mt-4 rounded-xl bg-[#F8F5F9] p-4"><p className="text-xs font-semibold text-[#665174]">발행 전 직접 확인할 항목</p><ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-[#817787]"><li>핵심 키워드와 검색 의도에 답하고 있는가</li><li>주소·가격·영업시간 등 변동 정보의 출처와 확인일을 표시했는가</li><li>실제 경험과 외부에서 확인한 사실을 구분했는가</li><li>연관 표현이 자연스럽고 반복이 과도하지 않은가</li><li>사진 설명과 문단 구성이 독자의 이해를 돕는가</li></ul></div>
      <label className="mt-4 block text-xs text-[#817787]">발행 예정일<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label>
      <div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>save("원고 작성")} className="rounded-xl border px-4 py-3 text-sm">임시 저장</button><button onClick={()=>save("발행 준비")} className="rounded-xl bg-[#665174] px-4 py-3 text-sm text-white">발행 준비 저장</button><button onClick={()=>navigator.clipboard?.writeText(draft)} className="rounded-xl border px-4 py-3 text-sm">본문 복사</button><a href="https://blog.naver.com/" target="_blank" rel="noreferrer" className="rounded-xl border px-4 py-3 text-sm">네이버 블로그 열기</a></div>
    </div>}
  </section>;
}
