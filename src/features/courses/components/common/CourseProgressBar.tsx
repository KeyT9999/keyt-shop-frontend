interface CourseProgressBarProps {
  percent: number;
  label?: string;
  showPercentText?: boolean;
  color?: 'orange' | 'rose' | 'indigo' | 'emerald' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export default function CourseProgressBar({
  percent,
  label,
  showPercentText = true,
  color = 'orange',
  size = 'md'
}: CourseProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  }[size];

  const colorGradients = {
    orange: 'from-[#F05A28] to-amber-500',
    rose: 'from-rose-500 to-pink-500',
    indigo: 'from-indigo-600 to-violet-500',
    emerald: 'from-emerald-500 to-teal-500',
    blue: 'from-blue-600 to-cyan-500',
    purple: 'from-purple-600 to-indigo-500'
  }[color];

  return (
    <div className="w-full">
      {(label || showPercentText) && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span>{label}</span>
          {showPercentText && <span className="font-bold text-slate-800 font-mono">{clamped}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses} border border-slate-200/60 p-[1px]`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorGradients} transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
