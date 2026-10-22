import { useState } from 'react';
import { QuestionCard } from '../types';
import {
  RotateCw,
  Lightbulb,
  Search,
  Heart,
  Compass,
  MessageSquareQuote,
  Pencil,
  Check,
} from 'lucide-react';

interface FlipCardProps {
  card: QuestionCard;
  index: number;
  isFlipped: boolean;
  onToggleFlip: () => void;
}

export function FlipCard({ card, index, isFlipped, onToggleFlip }: FlipCardProps) {
  const [studentThought, setStudentThought] = useState('');
  const [copied, setCopied] = useState(false);

  // Type-specific styling and icons
  const getTheme = () => {
    switch (card.type) {
      case 'fact':
        return {
          label: '사실 확인',
          icon: <Search className="w-5 h-5 text-blue-600" />,
          cardBgFront: 'bg-gradient-to-br from-blue-50/90 via-sky-50/60 to-white border-blue-200/90 shadow-blue-100/60',
          cardBgBack: 'bg-gradient-to-br from-sky-50 via-indigo-50/40 to-white border-blue-300 shadow-blue-100/60',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
          accentColor: 'text-blue-700',
          hintBadge: 'bg-blue-50 text-blue-700 border-blue-200',
          flipBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
          tagline: '이야기 속 사실을 다시 꼼꼼히 떠올려 봐요',
        };
      case 'feeling':
        return {
          label: '인물 마음 추측',
          icon: <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />,
          cardBgFront: 'bg-gradient-to-br from-rose-50/90 via-pink-50/60 to-white border-rose-200/90 shadow-rose-100/60',
          cardBgBack: 'bg-gradient-to-br from-pink-50 via-amber-50/40 to-white border-rose-300 shadow-rose-100/60',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          accentColor: 'text-rose-700',
          hintBadge: 'bg-rose-50 text-rose-700 border-rose-200',
          flipBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
          tagline: '등장인물의 감정과 까닭을 상상해 봐요',
        };
      case 'connect':
      default:
        return {
          label: '나와 연결하기',
          icon: <Compass className="w-5 h-5 text-emerald-600" />,
          cardBgFront: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-white border-emerald-200/90 shadow-emerald-100/60',
          cardBgBack: 'bg-gradient-to-br from-teal-50 via-lime-50/40 to-white border-emerald-300 shadow-emerald-100/60',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          accentColor: 'text-emerald-700',
          hintBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          flipBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          tagline: '책 속 이야기를 나의 경험과 이어 봐요',
        };
    }
  };

  const theme = getTheme();

  const handleCopyCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `[${theme.label}] ${card.question}\n💡 생각 힌트: ${card.hint}${studentThought ? `\n✏️ 내 생각: ${studentThought}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full h-[470px] perspective-1000 select-none">
      <div
        className={`relative w-full h-full transition-transform duration-600 transform-style-preserve-3d rounded-3xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ================= FRONT SIDE ================= */}
        <div
          onClick={onToggleFlip}
          className={`absolute inset-0 w-full h-full backface-hidden rounded-3xl border-2 p-6 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${theme.cardBgFront}`}
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs bg-white/90 text-stone-700">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                질문 카드 #{index + 1}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${theme.badgeBg}`}
              >
                {theme.icon}
                {theme.label}
              </span>
            </div>

            <p className="text-xs text-stone-500 font-medium mb-3">{theme.tagline}</p>

            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-6 border border-stone-200/80 shadow-xs mb-3 min-h-[170px] flex items-center justify-center">
              <div className="space-y-3 text-center">
                <MessageSquareQuote className={`w-8 h-8 mx-auto opacity-40 ${theme.accentColor}`} />
                <h3 className="text-lg md:text-xl font-bold leading-relaxed text-stone-800 break-keep">
                  {card.question}
                </h3>
              </div>
            </div>
          </div>

          {/* Footer Call-to-action */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2.5 px-1">
              <span>카드 앞면</span>
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5" /> 뒷면에 힌트가 있어요
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFlip();
              }}
              className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95 ${theme.flipBtn}`}
            >
              <RotateCw className="w-4 h-4" />
              <span>카드 뒤집어 힌트 보기</span>
            </button>
          </div>
        </div>

        {/* ================= BACK SIDE ================= */}
        <div
          onClick={(e) => {
            // Only flip back if clicking outside of input
            if ((e.target as HTMLElement).tagName !== 'TEXTAREA') {
              onToggleFlip();
            }
          }}
          className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl border-2 p-6 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl ${theme.cardBgBack}`}
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-amber-100 text-amber-900 border-amber-300">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 fill-amber-300" />
                생각을 돕는 힌트
              </span>

              <button
                type="button"
                onClick={handleCopyCard}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white border border-stone-200 text-stone-600 font-medium flex items-center gap-1 transition"
                title="카드 내용 복사"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>복사됨!</span>
                  </>
                ) : (
                  <>
                    <span>내용 복사</span>
                  </>
                )}
              </button>
            </div>

            {/* Hint Box */}
            <div className="bg-white/95 rounded-2xl p-4 border border-amber-200/90 shadow-xs mb-3">
              <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                <span>💡 힌트를 읽고 자유롭게 상상해봐요!</span>
              </p>
              <p className="text-sm md:text-base leading-relaxed text-stone-700 font-medium break-keep">
                {card.hint}
              </p>
            </div>

            {/* Interactive Thinking Scratchpad (Not saved to server, pure local reflection) */}
            <div
              className="bg-stone-50/90 rounded-2xl p-3 border border-stone-200 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                <span className="flex items-center gap-1 font-semibold text-stone-700">
                  <Pencil className="w-3.5 h-3.5 text-stone-500" />
                  내 생각 메모해보기 (선택)
                </span>
                <span className="text-[11px] text-stone-400">저장되지 않아요</span>
              </div>
              <textarea
                value={studentThought}
                onChange={(e) => setStudentThought(e.target.value)}
                placeholder={card.thinkingPrompt || '내 생각이나 떠오르는 답변을 가볍게 적어보세요...'}
                rows={2}
                maxLength={200}
                className="w-full text-xs md:text-sm bg-white p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-300 resize-none text-stone-800 placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFlip();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 shadow-xs transition active:scale-95 text-xs md:text-sm"
            >
              <RotateCw className="w-4 h-4" />
              <span>질문 카드로 다시 돌아가기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
