import React from 'react';
import {
  MapPin,
  Building2,
  Users,
  Music,
  Tv,
  BookOpen,
  Coffee,
  UtensilsCrossed,
  Car,
  Waves,
  CloudRain,
  Award,
  Beer,
  Ticket,
  Calendar,
  Sparkles
} from 'lucide-react';
import type { SpeakingQuestion } from '../../../types/speaking';

interface VisualScenarioCardProps {
  question: SpeakingQuestion;
}

export const VisualScenarioCard: React.FC<VisualScenarioCardProps> = ({ question }) => {
  const { imageType, imageDescription, questionJapanese } = question;

  // 1. PARTY CHARACTERS SCENARIOS (Lesson 7 Party)
  const isParty = imageType?.startsWith('party_');
  if (isParty) {
    const characters = [
      { id: 'nataphon', name: 'ナタポンさん', role: 'Hát (歌を歌う)', action: '歌っています', icon: Music, active: imageType === 'party_singing' || questionJapanese.includes('ナタポン') || questionJapanese.includes('うた') },
      { id: 'santos', name: 'サントスさん', role: 'Xem TV (テレビを見る)', action: '見ています', icon: Tv, active: imageType === 'party_tv' || questionJapanese.includes('サントス') || questionJapanese.includes('テレビ') },
      { id: 'miller', name: 'ミレーさん', role: 'Đọc sách (本を読む)', action: '読んでいます', icon: BookOpen, active: imageType === 'party_reading' || questionJapanese.includes('ミレー') || questionJapanese.includes('ミラー') || questionJapanese.includes('本') },
      { id: 'carlos', name: 'カルロスさん', role: 'Gảy đàn (ギターを弾く)', action: '弾いています', icon: Music, active: imageType === 'party_guitar' || questionJapanese.includes('カルロス') || questionJapanese.includes('ギター') },
      { id: 'mary', name: 'メアリーさん', role: 'Uống cà phê (コーヒーを飲む)', action: '飲んでいます', icon: Coffee, active: imageType === 'party_coffee' || questionJapanese.includes('メアリー') || questionJapanese.includes('コーヒー') },
      { id: 'elena', name: 'エレナさん', role: 'Ăn sushi (寿司を食べる)', action: '食べています', icon: UtensilsCrossed, active: imageType === 'party_sushi' || questionJapanese.includes('エレナ') || questionJapanese.includes('すし') }
    ];

    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-orange-50/50 to-white border-2 border-amber-300/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Bối cảnh tranh: Bữa tiệc giao lưu Marugoto (パーティー)
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200/70 text-amber-900">
            Hành động đang diễn ra (〜ています)
          </span>
        </div>

        <p className="text-xs text-slate-600 italic">
          * Đề bài yêu cầu quan sát hành động của từng nhân vật trong phòng tiệc để trả lời:
        </p>

        {/* Characters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {characters.map((char) => {
            const Icon = char.icon;
            return (
              <div
                key={char.id}
                className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                  char.active
                    ? 'bg-white border-[#F05A28] shadow-md ring-2 ring-[#F05A28]/30 scale-102'
                    : 'bg-white/70 border-slate-200/80 hover:bg-white'
                }`}
              >
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    char.active
                      ? 'bg-orange-100 text-[#F05A28]'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div className="font-japanese font-bold text-slate-900 text-xs truncate">
                  {char.name}
                </div>
                <div
                  className={`text-[10px] font-bold mt-0.5 ${
                    char.active ? 'text-[#F05A28]' : 'text-slate-500'
                  }`}
                >
                  {char.action}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                  {char.role.split(' (')[0]}
                </div>
                {char.active && (
                  <div className="mt-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#F05A28] text-white">
                    <Sparkles size={8} />
                    <span>Đang hỏi</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs text-slate-700 flex items-center gap-2">
          <Users size={15} className="text-amber-600 shrink-0" />
          <span>
            <strong>Chi tiết kịch bản:</strong> {imageDescription || 'Các nhân vật đang tham gia bữa tiệc sinh nhật.'}
          </span>
        </div>
      </div>
    );
  }

  // 2. TOWN MAP SPATIAL RELATIONS (Lesson 7 Map)
  const isMap = imageType?.startsWith('map_');
  if (isMap) {
    const locations = [
      { id: 'koban', name: '交番 (こうばん)', vi: 'Đồn cảnh sát', row: 1, col: 1, highlight: questionJapanese.includes('こうばん') },
      { id: 'yuubinkyoku', name: '郵便局', vi: 'Bưu điện', row: 1, col: 2, highlight: questionJapanese.includes('郵便局') || questionJapanese.includes('こうばんの となり') },
      { id: 'hanaya', name: '花屋 (はなや)', vi: 'Tiệm hoa', row: 1, col: 3, highlight: questionJapanese.includes('はなや') },
      { id: 'keekiya', name: 'ケーキ屋', vi: 'Tiệm bánh kem', row: 1, col: 4, highlight: questionJapanese.includes('ケーキ') || questionJapanese.includes('はなやの となり') },
      { id: 'station', name: '駅 (えき)', vi: 'Nhà ga trung tâm', row: 2, col: 1, highlight: false },
      { id: 'honya', name: '本屋 (ほんや)', vi: 'Hiệu sách', row: 2, col: 2, highlight: questionJapanese.includes('本や') || questionJapanese.includes('ほんや') },
      { id: 'restaurant', name: 'レストラン', vi: 'Nhà hàng', row: 2, col: 3, highlight: questionJapanese.includes('レストラン') },
      { id: 'bus', name: 'バス停 (バスてい)', vi: 'Trạm xe buýt', row: 2, col: 4, highlight: questionJapanese.includes('バス') },
      { id: 'supermarket', name: 'スーパー', vi: 'Siêu thị', row: 3, col: 1, highlight: questionJapanese.includes('スーパー') },
      { id: 'hospital', name: '病院 (びょういん)', vi: 'Bệnh viện', row: 3, col: 2, highlight: questionJapanese.includes('びょういん') },
      { id: 'man', name: '男の人', vi: 'Người đàn ông (đứng trước bệnh viện)', row: 3, col: 3, highlight: questionJapanese.includes('おとこのひと') || questionJapanese.includes('おとこの　ひと') },
      { id: 'park', name: '公園 (木と犬)', vi: 'Công viên (chú chó dưới gốc cây)', row: 3, col: 4, highlight: questionJapanese.includes('いぬ') || questionJapanese.includes('こうえん') }
    ];

    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 via-indigo-50/50 to-white border-2 border-sky-300/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-sky-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
              Bối cảnh tranh: Bản đồ khu phố (まちのちず - Vị trí không gian)
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-200/70 text-sky-900">
            Từ khóa: まえ／うしろ／となり／あいだ
          </span>
        </div>

        <p className="text-xs text-slate-600 italic">
          * Quan sát vị trí tương đối giữa các địa điểm trên bản đồ mô phỏng bên dưới:
        </p>

        {/* Map Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-100/90 p-3 rounded-2xl border border-slate-200">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className={`p-3 rounded-xl border transition-all duration-200 text-center flex flex-col justify-between ${
                loc.highlight
                  ? 'bg-white border-[#F05A28] shadow-md ring-2 ring-[#F05A28]/30 scale-102'
                  : 'bg-white/80 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Building2 size={13} className={loc.highlight ? 'text-[#F05A28]' : 'text-slate-400'} />
                <span className="font-japanese font-bold text-xs text-slate-900">{loc.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{loc.vi}</span>
              {loc.highlight && (
                <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-wider text-white bg-[#F05A28] px-1.5 py-0.2 rounded-full">
                  Mục tiêu hỏi
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 bg-white/90 rounded-xl border border-sky-200 text-xs text-slate-700 flex items-center gap-2">
          <MapPin size={14} className="text-sky-600 shrink-0" />
          <span>
            <strong>Chi tiết tranh:</strong> {imageDescription}
          </span>
        </div>
      </div>
    );
  }

  // 3. TRANSIT & ROUTE MAP (Lesson 4 Tokyo-Seoul / Danang-HCM)
  if (imageType === 'route_seoul' || imageType === 'route_danang' || imageType === 'route') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-white border-2 border-indigo-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
            <Car size={15} className="text-indigo-600" />
            <span>Sơ đồ tuyến đường & Phương tiện di chuyển (こうつう)</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
            Từ 〜 đến 〜 mất bao lâu
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span>Điểm khởi hành (から)</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Điểm đến (まで)</span>
              <span className="w-3 h-3 rounded-full bg-[#F05A28]"></span>
            </div>
          </div>

          <div className="relative flex items-center justify-between py-2">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-[#F05A28] w-full rounded-full"></div>
          </div>

          <p className="text-xs text-slate-700 font-medium text-center">
            {imageDescription}
          </p>
        </div>
      </div>
    );
  }

  // 4. ONSEN SCENARIO (Lesson 5)
  if (imageType === 'onsen') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 to-white border-2 border-teal-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
            <Waves size={15} className="text-teal-600" />
            <span>Tranh: Suối nước nóng truyền thống Nhật Bản (温泉 - おんせん)</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800">
            Cảm nhận quá khứ (〜かったです)
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-teal-100 text-xs text-slate-700 flex items-center gap-2.5">
          <Waves size={18} className="text-teal-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 block">Bối cảnh Onsen ngoài trời:</span>
            <span>{imageDescription}</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. CAR BMW (Lesson 5)
  if (imageType === 'car_bmw') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-300 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Car size={15} className="text-[#F05A28]" />
            <span>Tranh: Xe ô tô hạng sang (ドイツのBMW)</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-[#F05A28]">
            Mong muốn (ほしい／買いたい)
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2.5">
          <Car size={18} className="text-slate-800 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 block">Dữ liệu xe BMW nước Đức:</span>
            <span>{imageDescription}</span>
          </div>
        </div>
      </div>
    );
  }

  // 6. WEATHER / RAIN (Lesson 5)
  if (imageType === 'weather') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-white border-2 border-blue-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
            <CloudRain size={15} className="text-blue-600" />
            <span>Tranh: Thời tiết hôm qua (きのうのてんき)</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
            Tính từ thời tiết quá khứ
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-blue-100 text-xs text-slate-700 flex items-center gap-2.5">
          <CloudRain size={18} className="text-blue-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 block">Tình hình thời tiết trong tranh:</span>
            <span>{imageDescription}</span>
          </div>
        </div>
      </div>
    );
  }

  // 7. EXAM (Lesson 5)
  if (imageType === 'exam') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-white border-2 border-emerald-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
            <Award size={15} className="text-emerald-600" />
            <span>Tranh: Bài thi kiểm tra (テスト)</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            Điểm 100 tuyệt đối (よかったです)
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-emerald-100 text-xs text-slate-700 flex items-center gap-2.5">
          <Award size={18} className="text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 block">Kết quả bài thi:</span>
            <span>{imageDescription}</span>
          </div>
        </div>
      </div>
    );
  }

  // 8. IZAKAYA DRINKING (Lesson 5)
  if (imageType === 'izakaya') {
    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-white border-2 border-amber-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <Beer size={15} className="text-amber-600" />
            <span>Tranh: Quán rượu Izakaya (お酒を飲みました)</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            Ai đi cùng ai (〜と)
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-amber-100 text-xs text-slate-700 flex items-center gap-2.5">
          <Beer size={18} className="text-amber-600 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 block">Chi tiết người tham gia:</span>
            <span>{imageDescription}</span>
          </div>
        </div>
      </div>
    );
  }

  // 9. LESSON 6 SCENARIOS (Yokohama event, stadium, drinks, food, tickets)
  if (imageType === 'event' || imageType === 'stadium' || imageType === 'drinks' || imageType === 'food_compare' || imageType === 'tickets') {
    const iconMap: Record<string, any> = {
      event: Calendar,
      stadium: Building2,
      drinks: Coffee,
      food_compare: UtensilsCrossed,
      tickets: Ticket
    };
    const Icon = iconMap[imageType] || Sparkles;

    return (
      <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-white border-2 border-orange-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F05A28] flex items-center gap-1.5">
            <Icon size={15} />
            <span>Dữ liệu kịch bản trong đề thi Bài 6</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-[#F05A28]">
            {imageType === 'tickets'
              ? 'Đếm số lượng (なんまい)'
              : imageType === 'food_compare'
              ? 'So sánh hơn (どちらが)'
              : imageType === 'drinks'
              ? 'So sánh nhất (いちばん)'
              : 'Sự kiện (〜が あります)'}
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-orange-100 text-xs text-slate-700 flex items-center gap-2.5">
          <Icon size={18} className="text-[#F05A28] shrink-0" />
          <div>
            <span className="font-bold text-slate-900 block">Dữ liệu tranh quan sát:</span>
            <span>{imageDescription}</span>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT FALLBACK
  return (
    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center gap-3 text-xs text-slate-700">
      <Sparkles size={18} className="text-amber-600 shrink-0" />
      <div>
        <strong className="block text-slate-900 font-bold">Dữ liệu tranh minh họa:</strong>
        <span>{imageDescription || 'Quan sát kỹ các chi tiết trong tranh để trả lời đúng nội dung.'}</span>
      </div>
    </div>
  );
};
