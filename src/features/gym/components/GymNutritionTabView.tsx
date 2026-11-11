import {
  Activity,
  CheckCircle2,
  Clock,
  Droplets,
  Flame,
  Minus,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Utensils,
  Zap,
} from 'lucide-react';
import type { GymGenderMode } from '../types/gym';
import type { RecommendedNutritionPlan } from '../utils/gymGenderAdvisorUtils';

interface GymNutritionTabViewProps {
  gender: GymGenderMode;
  goalLabelVi: string;
  nutritionPlan: RecommendedNutritionPlan;
  displayedWaterMl: number;
  onAdjustWater: (deltaMl: number) => void;
}

function extractShortFoodChips(menuOption: string): string[] {
  return menuOption
    .replace(/\([^)]*\)/g, '')
    .split('+')
    .map((part) => part.replace(/\.$/, '').trim())
    .filter(Boolean)
    .slice(0, 4);
}

export default function GymNutritionTabView({
  gender,
  goalLabelVi,
  nutritionPlan,
  displayedWaterMl,
  onAdjustWater,
}: GymNutritionTabViewProps) {
  const targetWaterMl = Math.round(nutritionPlan.waterLiters * 1000);
  const waterPercent = Math.min(
    100,
    Math.round((displayedWaterMl / Math.max(1000, targetWaterMl)) * 100)
  );

  const totalMacroKcal =
    nutritionPlan.proteinGrams * 4 +
    nutritionPlan.carbsGrams * 4 +
    nutritionPlan.fatGrams * 9;
  const safeTotalKcal = Math.max(1, totalMacroKcal);
  const proteinPct = Math.round(((nutritionPlan.proteinGrams * 4) / safeTotalKcal) * 100);
  const carbsPct = Math.round(((nutritionPlan.carbsGrams * 4) / safeTotalKcal) * 100);
  const fatPct = Math.max(10, 100 - proteinPct - carbsPct);

  return (
    <div className="space-y-4">
      {/* 1. Calorie & Macro Summary Hero + Interactive Water Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Flame size={14} className="text-[#F05A28]" />
                <span>Dinh dưỡng mục tiêu trong ngày</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                  {nutritionPlan.targetCaloriesKcal.toLocaleString('vi-VN')}
                </span>
                <span className="text-sm font-bold text-slate-500">kcal / ngày</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Tối ưu cho mục tiêu <strong className="text-slate-800">{goalLabelVi}</strong> (
                {gender === 'male' ? 'Nam giới' : 'Nữ giới'})
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#F05A28] text-xs font-bold">
              {nutritionPlan.calorieBadgeVi}
            </span>
          </div>

          {/* 3 Clean Macro Cards with Visual Bars */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Zap size={13} className="text-emerald-600" />
                  <span>Đạm</span>
                </span>
                <span className="text-[11px] text-slate-500">{proteinPct}%</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                {nutritionPlan.proteinGrams}g
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${Math.min(100, proteinPct * 1.8)}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Activity size={13} className="text-sky-600" />
                  <span>Tinh bột</span>
                </span>
                <span className="text-[11px] text-slate-500">{carbsPct}%</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                {nutritionPlan.carbsGrams}g
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-600"
                  style={{ width: `${Math.min(100, carbsPct * 1.4)}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck size={13} className="text-amber-600" />
                  <span>Chất béo</span>
                </span>
                <span className="text-[11px] text-slate-500">{fatPct}%</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-slate-900 tabular-nums">
                {nutritionPlan.fatGrams}g
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${Math.min(100, fatPct * 2)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Water Tracker Card */}
        <div className="lg:col-span-4 rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 inline-flex items-center gap-1.5">
                <Droplets size={15} className="text-sky-600" />
                <span>Lượng nước hôm nay</span>
              </span>
              <span className="text-xs font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full tabular-nums">
                {waterPercent}%
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                {(displayedWaterMl / 1000).toFixed(2)}
              </span>
              <span className="text-sm font-bold text-slate-500">
                / {nutritionPlan.waterLiters} Lít
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-slate-100 border border-slate-200/70 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-200"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onAdjustWater(-250)}
              aria-label="Giảm 250ml nước"
              className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Minus size={15} />
              <span>-250 ml</span>
            </button>

            <button
              type="button"
              onClick={() => onAdjustWater(250)}
              aria-label="Thêm 250ml nước"
              className="h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={15} />
              <span>+250 ml</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Daily Meals Grid */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 px-1">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Utensils size={17} className="text-[#F05A28]" />
            <span>Thực đơn gợi ý 4 bữa chuẩn Việt Nam</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Dễ chuẩn bị tại nhà hoặc gọi món ngoài quán
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {nutritionPlan.meals.map((meal, index) => {
            const chips = extractShortFoodChips(meal.menuOptionsVi[0] || '');
            const altOption = meal.menuOptionsVi[1];
            return (
              <div
                key={meal.id}
                className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {index + 1}. {meal.mealTitleVi.split('(')[0].trim()}
                    </div>
                    <div className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      <span>
                        {meal.timingVi} • {meal.macroTagVi.split('•')[0].trim()}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold shrink-0 tabular-nums">
                    ~{meal.approxKcal} kcal
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {chips.map((chip, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                {altOption && (
                  <p className="text-xs text-slate-600 pt-1 border-t border-slate-100 leading-relaxed">
                    <strong className="text-slate-700">Đổi món nhanh:</strong> {altOption}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Prioritize vs Limit Foods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 space-y-2">
          <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>Thực phẩm nên ưu tiên</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {nutritionPlan.prioritizeFoodsVi.map((food) => (
              <span
                key={food}
                className="px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-xs font-semibold text-emerald-900"
              >
                {food}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 space-y-2">
          <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <ShieldAlert size={14} />
            <span>Nên hạn chế để giữ form nét</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {nutritionPlan.avoidFoodsVi.map((food) => (
              <span
                key={food}
                className="px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs font-semibold text-amber-900"
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
