import { useMemo } from 'react';
import {
  Sparkles,
  Volume2,
  Type,
  ArrowRight
} from 'lucide-react';
import {
  MAIN_KANA_ROWS,
  DAKUTEN_KANA_ROWS,
  COMBINATION_KANA_ROWS,
  EXTENDED_KATAKANA_ROWS,
  ALL_KANA_ROWS,
  KANA_FONT_OPTIONS,
  type KanaType,
  type KanaRowDef
} from '../../data/kanaData';

interface KanaSetupProps {
  kanaType: KanaType;
  onKanaTypeChange: (type: KanaType) => void;
  selectedFontId: string;
  onFontChange: (fontId: string) => void;
  selectedRowIds: Set<string>;
  onToggleRow: (rowId: string) => void;
  onSelectRows: (rowIds: string[], selectAll: boolean) => void;
  isShuffled: boolean;
  onShuffleChange: (shuffled: boolean) => void;
  soundEnabled: boolean;
  onSoundChange: (enabled: boolean) => void;
  onStartQuiz: () => void;
}

export default function KanaSetup({
  kanaType,
  onKanaTypeChange,
  selectedFontId,
  onFontChange,
  selectedRowIds,
  onToggleRow,
  onSelectRows,
  isShuffled,
  onShuffleChange,
  soundEnabled,
  onSoundChange,
  onStartQuiz
}: KanaSetupProps) {
  // Selected Font
  const activeFont = useMemo(
    () => KANA_FONT_OPTIONS.find((f) => f.id === selectedFontId) || KANA_FONT_OPTIONS[0],
    [selectedFontId]
  );

  // Helper row lists
  const mainRowIds = useMemo(() => MAIN_KANA_ROWS.map((r) => r.id), []);
  const dakutenRowIds = useMemo(() => DAKUTEN_KANA_ROWS.map((r) => r.id), []);
  const combinationRowIds = useMemo(() => COMBINATION_KANA_ROWS.map((r) => r.id), []);
  const extendedRowIds = useMemo(() => EXTENDED_KATAKANA_ROWS.map((r) => r.id), []);

  // Filter available rows based on type
  const availableRows = useMemo(() => {
    if (kanaType === 'hiragana') {
      return [...MAIN_KANA_ROWS, ...DAKUTEN_KANA_ROWS, ...COMBINATION_KANA_ROWS];
    }
    return ALL_KANA_ROWS;
  }, [kanaType]);

  const allAvailableRowIds = useMemo(() => availableRows.map((r) => r.id), [availableRows]);

  // Total selected items count
  const totalSelectedCount = useMemo(() => {
    let count = 0;
    availableRows.forEach((row) => {
      if (selectedRowIds.has(row.id)) {
        count += row.items.length;
      }
    });
    return kanaType === 'both' ? count * 2 : count;
  }, [availableRows, selectedRowIds, kanaType]);

  const isAllMainSelected = mainRowIds.every((id) => selectedRowIds.has(id));
  const isAllDakutenSelected = dakutenRowIds.every((id) => selectedRowIds.has(id));
  const isAllCombinationSelected = combinationRowIds.every((id) => selectedRowIds.has(id));
  const isAllExtendedSelected = extendedRowIds.every((id) => selectedRowIds.has(id));
  const isAllKanaSelected = allAvailableRowIds.every((id) => selectedRowIds.has(id));

  // Render individual row toggle button
  const renderRowButton = (row: KanaRowDef) => {
    const isSelected = selectedRowIds.has(row.id);
    let label = row.labelHiragana;
    if (kanaType === 'katakana') {
      label = row.labelKatakana;
    } else if (kanaType === 'both') {
      label = `${row.items[0]?.hiragana || ''}${row.items[0]?.katakana || ''}/${row.primaryRomaji}`;
    }

    return (
      <button
        key={row.id}
        type="button"
        onClick={() => onToggleRow(row.id)}
        style={{ fontFamily: activeFont.fontFamily }}
        className={`w-full py-2.5 px-2.5 rounded-lg border-2 text-xs sm:text-sm font-black transition-all cursor-pointer select-none flex items-center justify-center gap-1 ${
          isSelected
            ? 'bg-[#388bea] text-white border-[#2b77d6] shadow-sm hover:bg-[#2e7acf]'
            : 'bg-white text-[#388bea] border-[#388bea]/40 hover:border-[#388bea] hover:bg-blue-50/50'
        }`}
      >
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      {/* Top Banner / Font Selection */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#388bea] text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles size={15} />
          <span>Tofugu Kana Quiz • Toàn Bộ Bảng Chữ Cái Nhật Bản</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Học & Luyện Gõ Bảng Chữ Cái Tiếng Nhật
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          Đầy đủ 100% chữ cái: Hiragana, Katakana, Âm đục (Dakuten), Âm ghép (Yōon) và Âm ngoại lai mở rộng.
        </p>

        {/* Font Selector Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-700">
          <label htmlFor="kana-font-select" className="font-bold flex items-center gap-1.5 text-slate-700">
            <Type size={16} className="text-[#388bea]" />
            <span>Choose kana font:</span>
          </label>
          <div className="relative">
            <select
              id="kana-font-select"
              value={selectedFontId}
              onChange={(e) => onFontChange(e.target.value)}
              className="appearance-none bg-white border border-slate-300 rounded-lg py-1.5 pl-3 pr-8 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#388bea] focus:border-[#388bea] shadow-xs cursor-pointer"
            >
              {KANA_FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <span className="text-xs">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher: 3 Options (Hiragana / Katakana / Both) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <button
          type="button"
          onClick={() => onKanaTypeChange('hiragana')}
          className={`py-3 px-4 rounded-xl font-black text-sm border-2 transition-all cursor-pointer text-center ${
            kanaType === 'hiragana'
              ? 'bg-[#388bea] text-white border-[#2b77d6] shadow-md'
              : 'bg-white text-slate-700 border-slate-300 hover:border-[#388bea] hover:text-[#388bea]'
          }`}
        >
          Practice Hiragana (ひらがな)
        </button>

        <button
          type="button"
          onClick={() => onKanaTypeChange('katakana')}
          className={`py-3 px-4 rounded-xl font-black text-sm border-2 transition-all cursor-pointer text-center ${
            kanaType === 'katakana'
              ? 'bg-[#388bea] text-white border-[#2b77d6] shadow-md'
              : 'bg-white text-slate-700 border-slate-300 hover:border-[#388bea] hover:text-[#388bea]'
          }`}
        >
          Practice Katakana (カタカナ)
        </button>

        <button
          type="button"
          onClick={() => onKanaTypeChange('both')}
          className={`py-3 px-4 rounded-xl font-black text-sm border-2 transition-all cursor-pointer text-center ${
            kanaType === 'both'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-700 shadow-md'
              : 'bg-white text-slate-700 border-slate-300 hover:border-[#388bea] hover:text-[#388bea]'
          }`}
        >
          Luyện Cả Hai (Hira + Kata)
        </button>
      </div>

      {/* All Kana Master Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => onSelectRows(allAvailableRowIds, !isAllKanaSelected)}
          className={`w-full py-2.5 px-4 rounded-xl font-black text-sm border-2 transition-all cursor-pointer text-center ${
            isAllKanaSelected
              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
              : 'bg-white text-slate-800 border-slate-300 hover:border-[#388bea] hover:text-[#388bea]'
          }`}
        >
          {isAllKanaSelected ? 'Deselect All Kana' : 'All Kana (Chọn Tất Cả Nhóm Chữ)'}
        </button>
      </div>

      {/* Columns Setup Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-3 ${
          kanaType !== 'hiragana' ? 'lg:grid-cols-4' : ''
        } gap-5 mb-8`}
      >
        {/* Column 1: Main Kana */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
          <h2 className="text-base font-black text-[#388bea] text-center mb-3">
            Main Kana (46 âm)
          </h2>
          <button
            type="button"
            onClick={() => onSelectRows(mainRowIds, !isAllMainSelected)}
            className={`w-full py-2 px-3 rounded-lg font-bold text-xs border-2 mb-3 transition-colors cursor-pointer text-center ${
              isAllMainSelected
                ? 'bg-[#388bea] text-white border-[#2b77d6]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#388bea]'
            }`}
          >
            {isAllMainSelected ? 'Deselect All Main' : 'All Main Kana'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            {MAIN_KANA_ROWS.map((row) => renderRowButton(row))}
          </div>
        </div>

        {/* Column 2: Dakuten Kana */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
          <h2 className="text-base font-black text-[#388bea] text-center mb-3">
            Dakuten (25 âm)
          </h2>
          <button
            type="button"
            onClick={() => onSelectRows(dakutenRowIds, !isAllDakutenSelected)}
            className={`w-full py-2 px-3 rounded-lg font-bold text-xs border-2 mb-3 transition-colors cursor-pointer text-center ${
              isAllDakutenSelected
                ? 'bg-[#388bea] text-white border-[#2b77d6]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#388bea]'
            }`}
          >
            {isAllDakutenSelected ? 'Deselect All Dakuten' : 'All Dakuten Kana'}
          </button>

          <div className="grid grid-cols-1 gap-2">
            {DAKUTEN_KANA_ROWS.map((row) => renderRowButton(row))}
          </div>
        </div>

        {/* Column 3: Combination Kana */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
          <h2 className="text-base font-black text-[#388bea] text-center mb-3">
            Combination (36 âm)
          </h2>
          <button
            type="button"
            onClick={() => onSelectRows(combinationRowIds, !isAllCombinationSelected)}
            className={`w-full py-2 px-3 rounded-lg font-bold text-xs border-2 mb-3 transition-colors cursor-pointer text-center ${
              isAllCombinationSelected
                ? 'bg-[#388bea] text-white border-[#2b77d6]'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#388bea]'
            }`}
          >
            {isAllCombinationSelected ? 'Deselect All Combination' : 'All Combination Kana'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            {COMBINATION_KANA_ROWS.map((row) => renderRowButton(row))}
          </div>
        </div>

        {/* Column 4: Extended Katakana (Shown for Katakana & Both) */}
        {kanaType !== 'hiragana' && (
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
            <h2 className="text-base font-black text-[#388bea] text-center mb-3">
              Extended (20 âm ngoại lai)
            </h2>
            <button
              type="button"
              onClick={() => onSelectRows(extendedRowIds, !isAllExtendedSelected)}
              className={`w-full py-2 px-3 rounded-lg font-bold text-xs border-2 mb-3 transition-colors cursor-pointer text-center ${
                isAllExtendedSelected
                  ? 'bg-[#388bea] text-white border-[#2b77d6]'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-[#388bea]'
              }`}
            >
              {isAllExtendedSelected ? 'Deselect All Extended' : 'All Extended Kana'}
            </button>

            <div className="grid grid-cols-1 gap-2">
              {EXTENDED_KATAKANA_ROWS.map((row) => renderRowButton(row))}
            </div>
          </div>
        )}
      </div>

      {/* Extra Options & Start Quiz Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto text-center">
        {/* Toggle options row */}
        <div className="flex flex-wrap items-center justify-center gap-5 mb-5 text-xs sm:text-sm text-slate-700 font-medium">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isShuffled}
              onChange={(e) => onShuffleChange(e.target.checked)}
              className="w-4 h-4 rounded text-[#388bea] focus:ring-[#388bea] cursor-pointer"
            />
            <span>Xáo trộn ngẫu nhiên (Shuffle)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => onSoundChange(e.target.checked)}
              className="w-4 h-4 rounded text-[#388bea] focus:ring-[#388bea] cursor-pointer"
            />
            <Volume2 size={16} className="text-slate-500" />
            <span>Phát âm khi gõ đúng (Audio)</span>
          </label>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          disabled={totalSelectedCount === 0}
          onClick={onStartQuiz}
          className={`w-full py-4 px-8 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
            totalSelectedCount > 0
              ? 'bg-[#388bea] hover:bg-[#2a7bd8] text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Start Quiz! ({totalSelectedCount} Thẻ Kana)</span>
          <ArrowRight size={18} />
        </button>

        {totalSelectedCount === 0 && (
          <p className="mt-2 text-xs text-rose-500 font-medium">
            Vui lòng chọn ít nhất 1 hàng chữ để bắt đầu luyện tập.
          </p>
        )}
      </div>
    </div>
  );
}
