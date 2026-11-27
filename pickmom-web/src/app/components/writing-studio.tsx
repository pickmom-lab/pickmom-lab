"use client";

import { useEffect, useMemo, useState } from "react";

type Category = "맛집·카페" | "여행·체험" | "국내여행" | "해외여행" | "교육 정보" | "리빙·제품" | "생활·정책" | "부동산·주거";
type Purpose = "정보" | "실사용 후기" | "비교" | "문제 해결";
type Photo = { id: string; src: string; caption: string };
type Props = {
  initialKeyword?: string;
  initialCategory?: Category;
  initialPurpose?: string;
  initialNotes?: string;
  initialPhotos?: string[];
  initialData?: string;
  onSave: (v: { title: string; keyword: string; category: Category; purpose: string; date: string; draft: string; photos: string[]; formData: string; status: "원고 작성" | "발행 준비" }) => void;
};
const categories: Category[] = ["맛집·카페", "국내여행", "해외여행", "여행·체험", "교육 정보", "리빙·제품", "생활·정책", "부동산·주거"];
const purposes: Purpose[] = ["정보", "실사용 후기", "비교", "문제 해결"];
const detect = (s: string): Category => /맛집|식당|카페|디저트|빵|케이크|쿠키|국수|음식/.test(s) ? "맛집·카페" : /해외|국제선|항공권|일본|베트남|괌|발리|나트랑|다낭|싱가포르|해외여행/.test(s) ? "해외여행" : /국내|제주|강릉|부산|경주|전주|속초|여수|국내여행/.test(s) ? "국내여행" : /여행|호텔|리조트|나들이|체험|전시|마켓|가볼|실내/.test(s) ? "여행·체험" : /영어|수학|초등|유치원|학원|교육|책|독서|입학/.test(s) ? "교육 정보" : /지원금|정책|신청|정부|할인|혜택|공휴일/.test(s) ? "생활·정책" : /부동산|아파트|전세|월세|청약|이사|주거/.test(s) ? "부동산·주거" : "리빙·제품";
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const compressPhoto = (file: File) => new Promise<string>((resolve) => {
  const reader = new FileReader();
  reader.onerror = () => resolve("");
  reader.onload = () => {
    const raw = String(reader.result || "");
    const image = new Image();
    image.onerror = () => resolve(raw);
    image.onload = () => {
      const scale = Math.min(1, 1280 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) { resolve(raw); return; }
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let result = canvas.toDataURL("image/jpeg", 0.76);
      if (result.length > 450000) result = canvas.toDataURL("image/jpeg", 0.62);
      resolve(result);
    };
    image.src = raw;
  };
  reader.readAsDataURL(file);
});
export default function WritingStudio({ initialKeyword = "", initialCategory, initialPurpose, initialNotes = "", initialPhotos, initialData, onSave }: Props) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [category, setCategory] = useState<Category>(initialCategory || detect(initialKeyword));
  const [purpose, setPurpose] = useState<Purpose>(/맛집|카페|여행|체험|국내|해외|제주|일본|베트남|괌|발리|나트랑/.test(initialKeyword) ? "실사용 후기" : "정보");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [researchPlan, setResearchPlan] = useState("");
  const [title, setTitle] = useState(initialKeyword);
  const [draft, setDraft] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tips, setTips] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [externalStatus, setExternalStatus] = useState("");
  const [externalPrompt, setExternalPrompt] = useState("");
  const [revisionRequest, setRevisionRequest] = useState("내가 제공한 경험과 세부사항은 빠뜨리지 말고, 자연스러운 했어요체로 다듬어 주세요. 도입부는 짧게, 소제목은 검색 의도에 맞게 정리하고 반복 표현은 줄여 주세요. 새로운 사실이나 경험은 추가하지 마세요.");
  useEffect(() => {
    if (!initialData) { setKeyword(initialKeyword); setTitle(initialKeyword); setCategory(initialCategory || detect(initialKeyword)); setPurpose(initialPurpose === "비교·분석" ? "비교" : initialPurpose === "문제 해결" ? "문제 해결" : initialPurpose === "경험 리뷰" || initialPurpose === "직접 경험·방문 후기" ? "실사용 후기" : "정보"); setResearchPlan(initialNotes); setNotes(""); }
  }, [initialKeyword, initialCategory, initialPurpose, initialNotes, initialData]);
  useEffect(() => {
    if (!initialData) return;
    try {
      const d = JSON.parse(initialData);
      setKeyword(d.keyword || initialKeyword);
      setTitle(d.title || d.keyword || initialKeyword);
      setCategory((d.category === "쇼핑·제품" ? "리빙·제품" : d.category) || initialCategory || detect(d.keyword || initialKeyword));
      setPurpose(d.purpose === "직접 경험·방문 후기" ? "실사용 후기" : d.purpose === "비교·분석" ? "비교" : d.purpose === "문제 해결·노하우" ? "문제 해결" : "정보");
      setDate(d.date || today());
      setNotes(d.notes || Object.values(d.values || {}).filter(Boolean).join("\n"));
      setDraft(typeof d.draft === "string" ? d.draft : "");
      setTips(d.tips || "");
      const savedPhotoSources = initialPhotos || [];
      const restored = savedPhotoSources.length ? savedPhotoSources : (d.photos || []).map((p: any) => typeof p === "string" ? p : p.src).filter(Boolean);
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
    const selectedFiles = Array.from(files).slice(0, 12 - photos.length);
    const added = await Promise.all(selectedFiles.map(async (file, index) => ({
      id: `${Date.now()}-${index}-${Math.random()}`,
      src: await compressPhoto(file),
      caption: "",
    })));
    setPhotos(old => [...old, ...added.filter(photo => photo.src)]);
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
  const insertNoteStarter = () => {
    const starters: Record<Purpose, string> = {
      "실사용 후기": "왜 이용하게 됐나요?\n이용 전 궁금했던 점은요?\n직접 이용한 과정은 어땠나요?\n가장 좋았던 점은요?\n아쉬웠던 점이나 팁은요?",
      "정보": "이 정보를 누가 필요로 할까요?\n독자가 가장 궁금해할 질문은요?\n확인한 공식 자료나 출처는요?\n대상·조건·기간·비용 중 확인한 내용은요?\n아직 확인하지 못한 내용은요?",
      "비교": "무엇과 무엇을 비교하나요?\n각 대상의 가격·조건은요?\n가장 중요한 선택 기준은요?\n각각의 장점과 아쉬운 점은요?\n어떤 사람에게 어떤 선택이 맞을까요?",
      "문제 해결": "어떤 문제가 있었나요?\n어떤 상황에서 생겼나요?\n확인된 원인은요?\n시도한 해결 방법은요?\n결과와 주의할 점은요?"
    };
    const starter = starters[purpose];
    setNotes(old => old.trim() ? `${old.trim()}\n\n${starter}` : starter);
  };
  const buildChatGPTPrompt = () => [
    "당신은 한국 네이버 블로그 전문 에디터입니다. 아래 사용자 제공 정보만 근거로 자연스러운 한국어 블로그 원고를 작성하세요.",
    "절대 규칙: 제공되지 않은 방문·구매 경험, 감정, 가격, 주소, 운영시간, 메뉴, 수치, 정책 조건을 만들지 마세요. 실제 후기에서는 사용자가 직접 경험했다고 말한 내용만 1인칭으로 쓰세요. 불확실하거나 최신 확인이 필요한 내용은 [직접 확인 필요]로 표시하세요. 사진은 실제로 분석하지 말고 사진 설명만 활용하세요. 핵심 경험과 세부사항을 임의로 삭제하지 말고, 자연스러운 했어요체로 작성하세요. 키워드 반복을 피하고 소제목으로 읽기 쉽게 구성하세요. 본문 사진 위치는 [이미지 번호 삽입 – 설명] 형식으로 표시하세요.",
    "콘텐츠 유형별 기준: 실사용 후기는 실제 동기·과정·장단점·팁을 입력 범위에서 구성, 정보 글은 핵심 질문 순서로 설명, 비교 글은 동일 기준으로 비교하고 근거 없는 우열 금지, 문제 해결 글은 확인된 원인과 해결 순서를 구분하세요.",
    "분량은 자료에 맞춰 충분히 작성하되 반복하지 마세요. 제목 후보 3개를 먼저 제안하고, 최종 추천 제목 1개와 본문을 작성하세요.",\n    "입력 자료가 짧으면 확인된 사실만으로 초안을 구성하세요. 자료가 없는 항목은 [추가 입력 필요] 또는 [공식 자료 확인 필요]로 표시하세요. 실사용 후기의 경험이 비어 있으면 체험담을 만들지 말고 사용자가 채울 문장 틀을 제시하세요.",
    `핵심 키워드: ${keyword.trim()}`,
    `카테고리: ${category}`,
    `콘텐츠 유형: ${purpose}`,
    `조사·비교 기획안:\n${researchPlan.trim() || "별도 기획안 없음"}`,
    `사용자가 제공한 경험·자료:\n${notes.trim() || "아직 입력하지 않았습니다. 실제 경험이나 사실을 만들지 말고 글의 구조와 추가 입력이 필요한 부분을 표시하세요."}`,
    tips.trim() ? `추가 요청:\n${tips.trim()}` : "",
    `사진 설명(실제 이미지 분석 아님):\n${photos.map((p,i)=>`사진 ${i+1}: ${p.caption.trim() || "설명 없음"}`).join("\n") || "첨부 사진 없음"}`,
    "출력 형식: 제목 후보 3개, 최종 제목, 본문을 구분해 주세요. 근거가 없는 정보는 추측하지 마세요."
  ].filter(Boolean).join("\n\n");
  const sendToChatGPT = async () => {
    if (!keyword.trim()) { setExternalStatus("핵심 키워드를 먼저 입력해 주세요."); return; }
    const prompt = buildChatGPTPrompt();
    // ChatGPT's q parameter pre-fills the composer; the user reviews and sends it there.
    const chatUrl = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
    if (prompt.length <= 5500) {
      window.open(chatUrl, "_blank", "noopener,noreferrer");
      setExternalPrompt("");
      setExternalStatus("입력 내용이 ChatGPT에 전달됐어요. ChatGPT 입력창에서 내용을 확인한 뒤 전송해 주세요.");
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt);
      window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer");
      setExternalPrompt("");
      setExternalStatus("내용이 길어 자동 입력 대신 복사했어요. 열린 ChatGPT 입력창에 붙여넣어 주세요.");
    } catch {
      setExternalPrompt(prompt);
      setExternalStatus("내용이 길어 직접 복사가 필요해요. 아래 프롬프트를 복사해 ChatGPT에 붙여넣어 주세요.");
    }
  };
  const reviseWithChatGPT = async () => {
    if (!draft.trim()) { setExternalStatus("먼저 초안을 작성해 주세요."); return; }
    const prompt = [
      "당신은 네이버 블로그 전문 편집자입니다. 아래 초안을 새로 지어내지 말고 편집해 주세요.",
      "사용자가 제공한 경험·사실·수치·고유한 표현을 삭제하거나 바꾸지 마세요. 근거 없는 사실, 방문 경험, 가격, 주소, 운영시간을 추가하지 마세요. 확인이 필요한 부분은 [직접 확인 필요]로 표시하세요.",
      "자연스러운 한국어 했어요체를 사용하고, 기계적인 문장과 불필요한 서론·결론 반복을 줄이세요. 검색 키워드는 자연스럽게 유지하고 제목과 소제목을 읽기 쉽게 다듬으세요.",
      `이번 수정 요청: ${revisionRequest.trim() || "문장 흐름과 가독성을 자연스럽게 다듬어 주세요."}`,
      `키워드: ${keyword}`,
      `콘텐츠 유형: ${purpose}`,
      `현재 제목: ${title}`,
      `현재 초안:\\n${draft}`,
      "출력은 수정한 제목과 전체 본문만 제공해 주세요."
    ].join("\\n\\n");
    setExternalStatus("");
    setExternalPrompt("");
    if (prompt.length <= 5500) {
      window.open(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, "_blank", "noopener,noreferrer");
      setExternalStatus("ChatGPT에 수정 요청을 전달했어요. 결과를 확인한 뒤 수정된 원고를 이 화면에 붙여넣어 주세요.");
      return;
    }
    try {
      await navigator.clipboard.writeText(prompt);
      window.open("https://chatgpt.com/", "_blank", "noopener,noreferrer");
      setExternalStatus("수정 요청이 길어 복사했어요. 열린 ChatGPT에 붙여넣어 주세요.");
    } catch {
      setExternalPrompt(prompt);
      setExternalStatus("수정 요청을 복사할 수 없어요. 아래 내용을 복사해 ChatGPT에 붙여넣어 주세요.");
    }
  };
  const generateWithGemini = async () => {
    if (!keyword.trim() || !notes.trim()) { setGenerationError("핵심 키워드와 경험·자료를 먼저 입력해 주세요."); return; }
    setGenerating(true); setGenerationError(""); setExternalStatus("");
    try {
      const response = await fetch("/api/gemini/generate-draft", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim(), category, purpose, notes: `[조사·비교 기획안]\n${researchPlan.trim()}\n\n[사용자 제공 자료]\n${notes.trim()}`, tips: tips.trim(),
          photoCaptions: photos.map((photo,index)=>({number:index+1,caption:photo.caption.trim()}))
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gemini 원고 생성에 실패했습니다.");
      setTitle(result.title || keyword); setDraft(result.body || ""); setStep(3);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Gemini 원고 생성 중 오류가 발생했습니다.");
    } finally { setGenerating(false); }
  };
  const generateDraft = async () => {
    if (!keyword.trim() || !notes.trim()) {
      setGenerationError("핵심 키워드와 경험·자료를 먼저 입력해 주세요.");
      return;
    }
    setGenerating(true);
    setGenerationError("");
    try {
      const response = await fetch("/api/openai/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim(),
          category,
          purpose,
          notes: `[조사·비교 기획안]\n${researchPlan.trim()}\n\n[사용자 제공 자료]\n${notes.trim()}`,
          tips: tips.trim(),
          photoCaptions: photos.map((photo, index) => ({ number: index + 1, caption: photo.caption.trim() })),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "원고 생성에 실패했습니다.");
      setTitle(result.title || keyword);
      setDraft(result.body || "");
      setStep(3);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "원고 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setGenerating(false);
    }
  };
  return <section className="mx-auto max-w-4xl space-y-5 pb-8">
    <div className="rounded-2xl border border-[#ECE8EA] bg-white p-5">
      <div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-[#80678F]">PICKMOM LAB · WRITING FLOW</p><h2 className="mt-1 font-semibold">키워드 조사부터 원고 완성까지</h2></div><span className="text-xs text-[#918995]">STEP {step}/3</span></div>
      <div className="mt-4 grid grid-cols-3 gap-2">{["주제·유형", "내 경험·자료", "원고 편집"].map((x,i)=><button key={x} onClick={()=>setStep((i+1) as 1|2|3)} className={`rounded-lg p-2.5 text-xs font-semibold ${step===i+1?"bg-[#665174] text-white":"bg-[#F5F1F6] text-[#80678F]"}`}>{i+1}. {x}</button>)}</div>
    </div>
    {step===1 && <div className="rounded-2xl border bg-white p-5 md:p-6">
      <h3 className="font-semibold">어떤 글을 쓸까요?</h3>
      <label className="mt-4 block text-xs text-[#817787]">핵심 키워드<input value={keyword} onChange={e=>{setKeyword(e.target.value);if(!title||title===keyword)setTitle(e.target.value);}} placeholder="예: 서울 머랭롤 맛집" className="mt-2 w-full rounded-xl border p-3 text-sm"/></label>
      <p className="mt-4 text-xs text-[#817787]">콘텐츠 유형</p><div className="mt-2 grid grid-cols-2 gap-2">{purposes.map(x=><button key={x} onClick={()=>setPurpose(x)} className={`rounded-xl border p-3 text-sm ${purpose===x?"border-[#8D789C] bg-[#F7F3F9] font-semibold text-[#665174]":""}`}>{x}</button>)}</div>
      <button disabled={!keyword.trim()} onClick={()=>setStep(2)} className="mt-5 rounded-xl bg-[#665174] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">다음 단계 →</button>
    </div>}
    {step===2 && <div className="space-y-4 rounded-2xl border bg-white p-5 md:p-6">
      <div><h3 className="font-semibold">경험과 알고 있는 내용을 편하게 적어주세요.</h3><p className="mt-1 text-xs leading-5 text-[#918995]">완성된 문장으로 쓸 필요 없어요. 단어와 짧은 메모만 적어도 됩니다. 자료가 없다면 아래 질문을 넣어 하나씩 채우거나, 키워드만으로 글의 뼈대부터 만들 수 있어요.</p><button type="button" onClick={insertNoteStarter} className="mt-3 rounded-lg border border-[#DCD2E3] bg-[#F8F5F9] px-3 py-2 text-xs font-semibold text-[#665174]">내 글 유형에 맞는 메모 질문 넣기</button></div>
      {researchPlan.trim() && <div className="rounded-xl border border-[#E5DCEB] bg-[#F8F5F9] p-4"><h4 className="text-sm font-semibold text-[#665174]">이 주제의 조사·비교 제안</h4><p className="mt-1 text-[11px] leading-5 text-[#817787]">아래 내용을 바탕으로 자료를 확인한 뒤, 본인이 찾은 정보와 의견을 추가해 주세요.</p><pre className="mt-3 whitespace-pre-wrap font-sans text-xs leading-6 text-[#665174]">{researchPlan}</pre></div>}
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={9} placeholder="예: 주차 편했음 / 아이가 만들기 수업을 좋아함 / 책을 재미있게 읽어주심… 짧은 메모만 적어도 돼요." className="w-full rounded-xl border p-4 text-sm leading-7"/>
      <div className="rounded-xl border border-dashed p-4"><h4 className="text-sm font-semibold">사진 첨부 (최대 12장)</h4><input type="file" accept="image/*" multiple disabled={busy||photos.length>=12} onChange={e=>{void addPhotos(e.target.files);e.currentTarget.value="";}} className="mt-3 w-full text-xs"/>{photos.map((p,i)=><div key={p.id} className="mt-3 flex items-center gap-3 border-t pt-3"><img src={p.src} alt="" className="h-16 w-16 rounded-lg object-cover"/><div className="min-w-0 flex-1"><input value={p.caption} onChange={e=>setPhotos(old=>old.map((x,j)=>j===i?{...x,caption:e.target.value}:x))} placeholder="선택: 사진 설명" className="w-full rounded border p-2 text-xs"/><div className="mt-2 flex gap-3 text-xs"><button onClick={()=>movePhoto(i,-1)} disabled={!i}>위로</button><button onClick={()=>movePhoto(i,1)} disabled={i===photos.length-1}>아래로</button><button onClick={()=>setPhotos(old=>old.filter((_,j)=>j!==i))} className="text-rose-700">삭제</button></div></div></div>)}</div>
      <button onClick={()=>setShowTips(v=>!v)} className="text-xs font-semibold text-[#665174]">{showTips?"▾":"▸"} 이번 글 작성 팁 (선택)</button>{showTips&&<textarea value={tips} onChange={e=>setTips(e.target.value)} rows={3} placeholder="이번 글에만 적용할 요청사항" className="w-full rounded-xl border p-3 text-sm"/>}
      <div className="flex flex-wrap gap-2"><button onClick={()=>setStep(1)} disabled={generating} className="rounded-xl border px-4 py-3 text-sm disabled:opacity-50">← 이전</button><button onClick={()=>void sendToChatGPT()} disabled={generating || !keyword.trim()} className="rounded-xl bg-[#665174] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">ChatGPT로 초안 만들기</button><button onClick={()=>void generateWithGemini()} disabled={generating || !keyword.trim() || !notes.trim()} className="rounded-xl border px-3 py-3 text-xs disabled:opacity-50">Gemini API</button><button onClick={()=>void generateDraft()} disabled={generating || !keyword.trim() || !notes.trim()} className="rounded-xl border px-3 py-3 text-xs disabled:opacity-50">{generating ? "작성 중..." : "OpenAI API"}</button></div>{externalStatus && <p role="status" className="rounded-lg bg-[#F5F1F6] p-3 text-xs leading-5 text-[#665174]">{externalStatus}</p>}{externalPrompt && <textarea readOnly value={externalPrompt} rows={8} className="w-full rounded-xl border p-3 text-xs leading-5" onFocus={e=>e.currentTarget.select()}/>}
      {generationError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs leading-5 text-rose-700">{generationError}</p>}
      <p className="text-[10px] leading-5 text-[#A49AA9]">ChatGPT 버튼은 별도 API 키 없이 ChatGPT 입력창을 여는 방식이며, 열린 화면에서 직접 전송해야 합니다. 조사·비교 제안은 실제 검색 결과가 아니라 글의 구성 가이드일 수 있으므로, 가격·주소·운영시간 등은 공식 출처로 확인해 주세요.</p>
    </div>}
    {step===3 && <div className="rounded-2xl border bg-white p-5 md:p-6">
      <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">통합 원고 편집기</h3><p className="mt-1 text-xs text-[#918995]">AI가 생성한 초안을 제목과 본문 한 화면에서 직접 수정합니다.</p></div><button onClick={()=>setStep(2)} className="text-xs text-[#665174]">← 입력 수정</button></div>
      <div className="mt-4"><p className="mb-1 text-xs font-semibold">제목 구성 예시</p><p className="mb-2 text-[10px] text-[#A49AA9]">키워드와 글 유형을 바탕으로 만든 문장 예시입니다. AI 조사·분석 결과는 아닙니다.</p><div className="space-y-2">{titleIdeas.map((x,i)=><button key={x} onClick={()=>setTitle(x)} className={`block w-full rounded-lg border p-3 text-left text-xs leading-5 ${title===x?"border-[#8D789C] bg-[#F7F3F9]":"border-[#ECE8EA]"}`}>{i+1}. {x}</button>)}</div><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="직접 제목 입력" className="mt-3 w-full rounded-xl border p-3 text-sm"/></div>
      <label className="mt-4 block text-xs font-semibold">본문<textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={20} placeholder="AI가 생성한 초안을 검토하고, 사실관계와 표현을 직접 수정하세요." className="mt-2 w-full rounded-xl border p-4 text-sm leading-7 font-normal"/></label>
      <div className="mt-4 rounded-xl border border-[#E5DCEB] bg-[#FAF8FB] p-4">
        <p className="text-xs font-semibold text-[#665174]">초안 다듬기</p>
        <p className="mt-1 text-[11px] leading-5 text-[#817787]">수정하고 싶은 점만 적으면 현재 원고를 유지하면서 ChatGPT에 편집을 요청합니다.</p>
        <textarea value={revisionRequest} onChange={e=>setRevisionRequest(e.target.value)} rows={3} className="mt-3 w-full rounded-lg border bg-white p-3 text-xs leading-5"/>
        <button type="button" onClick={()=>void reviseWithChatGPT()} className="mt-2 rounded-lg bg-[#665174] px-4 py-2.5 text-xs font-semibold text-white">ChatGPT로 원고 다듬기</button>
        {externalStatus && <p role="status" className="mt-2 rounded-lg bg-white p-3 text-xs leading-5 text-[#665174]">{externalStatus}</p>}
        {externalPrompt && <textarea readOnly value={externalPrompt} rows={6} className="mt-2 w-full rounded-lg border bg-white p-3 text-xs leading-5" onFocus={e=>e.currentTarget.select()}/>}
      </div>
      <div className="mt-4 rounded-xl bg-[#F8F5F9] p-4"><p className="text-xs font-semibold text-[#665174]">발행 전 직접 확인할 항목</p><ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-[#817787]"><li>핵심 키워드와 검색 의도에 답하고 있는가</li><li>주소·가격·영업시간 등 변동 정보의 출처와 확인일을 표시했는가</li><li>실제 경험과 외부에서 확인한 사실을 구분했는가</li><li>연관 표현이 자연스럽고 반복이 과도하지 않은가</li><li>사진 설명과 문단 구성이 독자의 이해를 돕는가</li></ul></div>
      <label className="mt-4 block text-xs text-[#817787]">발행 예정일<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label>
      <div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>save("원고 작성")} className="rounded-xl border px-4 py-3 text-sm">임시 저장</button><button onClick={()=>save("발행 준비")} className="rounded-xl bg-[#665174] px-4 py-3 text-sm text-white">발행 준비 저장</button><button onClick={()=>navigator.clipboard?.writeText(draft)} className="rounded-xl border px-4 py-3 text-sm">본문 복사</button><a href="https://blog.naver.com/" target="_blank" rel="noreferrer" className="rounded-xl border px-4 py-3 text-sm">네이버 블로그 열기</a></div>
    </div>}
  </section>;
}
