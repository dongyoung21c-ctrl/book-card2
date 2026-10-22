import { useState, useRef } from 'react';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  RotateCw,
  Printer,
  HelpCircle,
  AlertCircle,
  Send,
  RefreshCcw,
  BookMarked,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { QuestionCard, ApiResponse } from './types';
import { FlipCard } from './components/FlipCard';

interface PresetExample {
  title: string;
  tag: string;
  bookTitle: string;
  scene: string;
}

const PRESET_EXAMPLES: PresetExample[] = [
  {
    title: '샬롯의 거미줄',
    tag: 'E.B. 화이트',
    bookTitle: '샬롯의 거미줄',
    scene: '샬롯이 겁에 질린 돼지 윌버를 구하기 위해 밤새 거미줄에 빛나는 이슬 방울로 \'대단한 돼지\'라는 글자를 엮어 넣은 장면',
  },
  {
    title: '푸른 사자 와니니',
    tag: '이현',
    bookTitle: '푸른 사자 와니니',
    scene: '무리에서 쫓겨나 겁 많던 와니니가 친구 아산테, 잠보와 함께 서로를 지켜주며 마침내 자신만의 용기를 찾는 장면',
  },
  {
    title: '자전거 도둑',
    tag: '박완서',
    bookTitle: '자전거 도둑',
    scene: '바람에 넘어진 자전거 때문에 고급 승용차가 긁히자, 주변 사람들의 재촉에 양심의 가책을 느끼며 자전거를 들고 달아나는 수남이의 장면',
  },
];

export default function App() {
  const [bookTitle, setBookTitle] = useState('');
  const [memorableScene, setMemorableScene] = useState('');
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<QuestionCard[] | null>(null);
  const [currentBookTitle, setCurrentBookTitle] = useState('');
  const [flippedStates, setFlippedStates] = useState<boolean[]>([false, false, false]);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  const inputFormRef = useRef<HTMLDivElement>(null);

  const handleApplyPreset = (preset: PresetExample) => {
    setBookTitle(preset.bookTitle);
    setMemorableScene(preset.scene);
    setRejectionMessage(null);
  };

  const handleToggleFlip = (index: number) => {
    setFlippedStates((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleFlipAll = (flipTo: boolean) => {
    setFlippedStates([flipTo, flipTo, flipTo]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      setRejectionMessage('책 제목을 적어 줄래? 읽은 책의 제목을 알려주면 질문 카드를 만들 수 있어! 📖');
      return;
    }
    if (!memorableScene.trim()) {
      setRejectionMessage('인상 깊었던 장면을 적어 줄래? 가장 기억에 남는 장면이나 대사를 들려줘! ✍️');
      return;
    }

    setLoading(true);
    setRejectionMessage(null);

    try {
      const res = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookTitle: bookTitle.trim(),
          memorableScene: memorableScene.trim(),
        }),
      });

      const data: ApiResponse = await res.json();

      if (!data.isAppropriate) {
        setRejectionMessage(
          data.rejectionReason ||
            '책 이야기와 어울리는 바르고 고운 말로 책 제목과 기억에 남는 장면을 정성껏 다시 적어 줄래? 책 속 이야기를 자세히 들려주면 멋진 생각 카드를 만들어 줄게! 😊'
        );
        setCards(null);
      } else if (data.cards && data.cards.length >= 3) {
        setCards(data.cards.slice(0, 3));
        setCurrentBookTitle(data.bookTitle || bookTitle.trim());
        setFlippedStates([false, false, false]);
        setRejectionMessage(null);
      } else {
        setRejectionMessage('질문 카드를 만드는 중에 작은 문제가 생겼어요. 잠시 후 다시 시도해 줄래? 😊');
      }
    } catch (err) {
      console.error(err);
      setRejectionMessage('서버와 연결하는 동안 오류가 발생했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCards(null);
    setRejectionMessage(null);
    setFlippedStates([false, false, false]);
    setTimeout(() => {
      inputFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col font-sans">
      {/* Top Banner: Privacy Protection Notice */}
      <header className="bg-amber-100/70 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-900 print:hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>안심 독서 공간:</strong> 학생의 이름이나 개인정보는 일절 묻지 않으며, 입력한 내용은 창을 닫으면 바로 지워져요.
            </span>
          </div>
          <span className="inline-flex items-center gap-1 bg-amber-200/80 px-2 py-0.5 rounded-full text-[11px] font-semibold text-amber-800">
            초등 4~6학년 대상
          </span>
        </div>
      </header>

      {/* Main Navigation / Hero */}
      <nav className="bg-white border-b border-stone-200 shadow-xs px-4 py-4 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg md:text-xl text-stone-900 tracking-tight">
                  생각 쑥쑥 독서 질문 카드
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  3단계 생각 확장
                </span>
              </div>
              <p className="text-xs text-stone-500">
                책 이야기로 사실 확인, 인물 마음 추측, 나와 연결하기 카드를 만나요!
              </p>
            </div>
          </div>

          {cards && (
            <button
              onClick={handleReset}
              className="text-xs md:text-sm px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>다른 책 쓰기</span>
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Printable Header (Visible only when printing) */}
        <div className="hidden print:block mb-6 border-b border-stone-300 pb-4">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">
            [독서 생각 카드 활동지] {currentBookTitle || bookTitle}
          </h1>
          <p className="text-sm text-stone-600 mb-2">인상 깊었던 장면: {memorableScene}</p>
          <div className="text-xs text-stone-400 flex justify-between">
            <span>생각 쑥쑥 독서 질문 카드 (사실 확인 · 인물 마음 추측 · 나와 연결하기)</span>
            <span>일자: ______년 ___월 ___일</span>
          </div>
        </div>

        {/* ================= VIEW 1: Input Form (when cards are not yet generated) ================= */}
        {!cards && (
          <div ref={inputFormRef} className="max-w-3xl mx-auto space-y-6">
            {/* Friendly Greeting Card */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-400 to-amber-400 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-amber-50 border border-white/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  스스로 생각하는 힘이 쑥쑥!
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                  읽은 책의 기억에 남는 장면을 알려줘!
                </h2>
                <p className="text-sm md:text-base text-amber-50/95 leading-relaxed font-normal">
                  책 제목과 인상 깊은 장면을 적으면, 네 생각을 깊고 넓게 열어 줄
                  <strong> 3장의 생각 카드(사실 확인, 인물 마음, 나와 연결)</strong>를 선물해 줄게.
                </p>
              </div>

              {/* Decorative background shapes */}
              <div className="absolute -right-6 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute right-12 top-4 w-20 h-20 bg-amber-300/20 rounded-full blur-md pointer-events-none" />
            </div>

            {/* Inappropriate Input / Rejection Alert Box */}
            {rejectionMessage && (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-rose-900 text-sm md:text-base">
                      잠깐만 확인해 줄래? 🌸
                    </h3>
                    <p className="text-sm text-rose-800 leading-relaxed font-medium">
                      {rejectionMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm space-y-6">
              {/* Field 1: Book Title */}
              <div className="space-y-2">
                <label htmlFor="bookTitle" className="block text-sm md:text-base font-bold text-stone-800 flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-amber-600" />
                  <span>1. 읽은 책 제목이 무엇인가요?</span>
                </label>
                <input
                  id="bookTitle"
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="예: 샬롯의 거미줄, 자전거 도둑, 마당을 나온 암탉..."
                  maxLength={60}
                  className="w-full px-4 py-3.5 rounded-2xl border border-stone-300 bg-stone-50/50 text-stone-800 placeholder:text-stone-400 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                  disabled={loading}
                />
              </div>

              {/* Field 2: Memorable Scene */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="memorableScene" className="block text-sm md:text-base font-bold text-stone-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>2. 가장 기억에 남거나 인상 깊었던 장면은 어디인가요?</span>
                  </label>
                  <span className="text-xs text-stone-400 font-medium">
                    {memorableScene.length} / 500자
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  주인공이 어떤 행동을 했는지, 마음에 와닿은 대사나 사건을 2~3문장 정도로 들려주세요.
                </p>
                <textarea
                  id="memorableScene"
                  rows={4}
                  value={memorableScene}
                  onChange={(e) => setMemorableScene(e.target.value)}
                  placeholder="예: 수남이가 자전거를 타고 가다가 바람 때문에 고급 승용차를 긁었을 때, 어른들이 다그치자 무서워서 자전거를 번쩍 들고 도망치던 장면이 가장 가슴 떨리고 기억에 남았어요."
                  maxLength={500}
                  className="w-full px-4 py-3.5 rounded-2xl border border-stone-300 bg-stone-50/50 text-stone-800 placeholder:text-stone-400 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition leading-relaxed resize-none"
                  disabled={loading}
                />
              </div>

              {/* Preset Examples Helper */}
              <div className="pt-2 border-t border-stone-100">
                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-semibold mb-2.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>예시를 눌러 바로 시작해볼 수도 있어요:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESET_EXAMPLES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="text-left p-3 rounded-2xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/60 transition group active:scale-98"
                      disabled={loading}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-stone-800 group-hover:text-amber-900 truncate">
                          {preset.title}
                        </span>
                        <span className="text-[10px] text-stone-400 px-1.5 py-0.5 rounded-md bg-stone-100">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-snug">
                        {preset.scene}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !bookTitle.trim() || !memorableScene.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base md:text-lg shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    <span>책 속 이야기를 들여다보며 카드를 만드는 중...✨</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>생각 질문 카드 3장 열어보기 🪄</span>
                  </>
                )}
              </button>
            </form>

            {/* Guide: Why these 3 cards? */}
            <div className="bg-white/80 rounded-3xl p-6 border border-stone-200/80">
              <h3 className="text-sm font-bold text-stone-700 flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-amber-600" />
                <span>선생님이 알려주는 3가지 질문 카드 안내</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <div className="font-bold text-blue-800 mb-1 flex items-center gap-1">
                    <span>🔍 1. 사실 확인 카드</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    책 속 장면에서 일어난 일과 사건의 순서를 꼼꼼하게 되짚어보며 내용을 정확히 이해해요.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                  <div className="font-bold text-rose-800 mb-1 flex items-center gap-1">
                    <span>💭 2. 인물 마음 추측 카드</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    그 순간 인물이 어떤 감정을 느꼈을지, 왜 그런 선택을 했는지 따뜻하게 공감해 봐요.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <span>🌱 3. 나와 연결하기 카드</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    주인공의 이야기를 나의 생활, 내 생각, 나와 친구들의 경험으로 이어보는 깊은 생각을 해요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: Question Cards Display ================= */}
        {cards && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white rounded-3xl border border-stone-200 p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                    생각 카드 완성
                  </span>
                  <h2 className="text-lg md:text-xl font-black text-stone-900">
                    📖 《{currentBookTitle}》 질문 카드 3장
                  </h2>
                </div>
                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  카드를 클릭하면 뒤집혀서 <strong className="text-amber-800">생각을 돕는 힌트</strong>가 보여요!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Flip all buttons */}
                <button
                  type="button"
                  onClick={() => handleFlipAll(true)}
                  className="text-xs px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold flex items-center gap-1.5 transition active:scale-95"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>모두 뒤집기 (힌트)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFlipAll(false)}
                  className="text-xs px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-bold flex items-center gap-1.5 transition active:scale-95"
                >
                  <span>앞면으로 정렬</span>
                </button>
                {/* Print button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="text-xs px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>인쇄하기 / 저장</span>
                </button>
              </div>
            </div>

            {/* Displaying original scene for context */}
            <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4 text-xs md:text-sm text-stone-700 leading-relaxed print:bg-white print:border-stone-300">
              <span className="font-bold text-amber-900">📍 내가 적은 기억에 남는 장면: </span>
              <span>"{memorableScene}"</span>
            </div>

            {/* The 3 Question Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cards.map((card, idx) => (
                <FlipCard
                  key={idx}
                  card={card}
                  index={idx}
                  isFlipped={flippedStates[idx]}
                  onToggleFlip={() => handleToggleFlip(idx)}
                />
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200 print:hidden">
              <div className="text-xs text-stone-500">
                💡 친구들이나 선생님과 함께 카드를 뽑아 돌아가며 이야기 나누어 보세요!
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-xs transition active:scale-95 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>새로운 책으로 질문 만들기</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 px-4 text-center text-xs text-stone-400 print:hidden">
        <div className="max-w-5xl mx-auto space-y-1">
          <p className="font-semibold text-stone-500">
            생각 쑥쑥 독서 질문 카드 · 초등학교 4~6학년 독서 생각 나침반
          </p>
          <p>
            질문은 답을 정해주지 않고 스스로 생각의 날개를 펼치도록 돕습니다. 학생의 개인정보는 수집하거나 저장하지 않습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
