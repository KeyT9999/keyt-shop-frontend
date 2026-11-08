import { Sparkles } from 'lucide-react';

export function FormattedAiReading({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-2.5 text-sm sm:text-[15px] leading-relaxed text-slate-700">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) return <div key={idx} className="h-1" />;

        const headerMatch = line.match(/^(?:\*\*)?【(.+?)】(?:\*\*)?(.*)$/);
        if (headerMatch) {
          const title = headerMatch[1];
          const rest = headerMatch[2]?.trim();
          return (
            <div key={idx} className="pt-4 first:pt-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-slate-900 font-extrabold text-xs sm:text-sm mb-1.5 shadow-2xs">
                <Sparkles size={14} className="text-[#F05A28] shrink-0" />
                <span>【{title}】</span>
              </div>
              {rest && <p className="text-slate-700 mt-1.5 pl-1">{rest}</p>}
            </div>
          );
        }

        const parts = line.split(/\*\*(.+?)\*\*/g);
        return (
          <p key={idx} className="text-slate-700 leading-relaxed pl-1">
            {parts.map((part, pIdx) =>
              pIdx % 2 === 1 ? (
                <strong key={pIdx} className="font-bold text-slate-900">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </div>
  );
}
