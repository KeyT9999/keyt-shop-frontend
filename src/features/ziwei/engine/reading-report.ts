import { BRANCHES, NAYIN_ELEMENTS, STEMS } from './constants';
import type { TopicKey } from './db-analysis';
import { solarToLunar } from './lunar-solar';
import { SCHOOL_AX } from './school-tables.generated';
import { getLiuNianSiHua, getLiuYueSiHua } from './sihua';
import type { Palace, SiHua, StarBrightness, ZiweiChart } from './types';
import { translateBranch, translatePalaceName, translateSiHua, translateStarName, translateStem, translateWuxingJu } from '../utils/ziweiLocalization';

export type ReadingChapterKey = TopicKey | 'forecast';

type Chapter = {
  key: ReadingChapterKey;
  title: string;
  short: string;
  palace: string;
  prefix: string;
  coverage: string;
  lens: string;
};

export const READING_CHAPTERS: readonly Chapter[] = [
  { key: 'overview', title: 'Luận giải tổng quan', short: 'Tổng quan', palace: 'Mệnh – Thân', prefix: '命宫', coverage: 'Bản mệnh, ngũ hành, cục mệnh, chủ mệnh, chủ thân, cân lượng, Thân cư', lens: 'Đọc Mệnh để thấy nét nền, rồi đối chiếu Thân để xem lĩnh vực nào thường được đặt nhiều công sức.' },
  { key: 'personality', title: 'Luận về cung Mệnh', short: 'Cung Mệnh', palace: 'Mệnh', prefix: '命宫', coverage: 'Tính cách, tư chất, ưu nhược điểm, năng lực, xu hướng cuộc đời', lens: 'Nhìn sao chính để hiểu cách bạn thường phản ứng. Đối chiếu các dấu hỗ trợ và thử thách để tìm điểm mạnh có thể phát huy và thói quen nên điều chỉnh.' },
  { key: 'career', title: 'Luận về công danh, sự nghiệp', short: 'Sự nghiệp', palace: 'Quan Lộc', prefix: '官禄', coverage: 'Nghề nghiệp, công danh, thăng tiến, học vấn, thử thách', lens: 'Xem bạn dễ phát huy trong kiểu công việc nào, nên rèn năng lực gì và có thể vướng ở đâu khi chuyển việc hoặc nhận vai trò mới.' },
  { key: 'wealth', title: 'Luận về tiền tài', short: 'Tiền tài', palace: 'Tài Bạch', prefix: '财帛', coverage: 'Kiếm tiền, thu nhập, tích lũy, quản lý tài chính', lens: 'Tách cách tạo thu nhập khỏi cách giữ tiền. Đọc các dấu trong cung cùng thói quen thu chi thực tế của bạn.' },
  { key: 'love', title: 'Luận về tình duyên, hôn nhân', short: 'Tình duyên', palace: 'Phu Thê', prefix: '夫妻', coverage: 'Tình cảm, đặc điểm bạn đời, hôn nhân, hòa hợp', lens: 'Xem điều bạn coi trọng ở bạn đời, cách thể hiện tình cảm và những khác biệt hai người có thể cần trao đổi.' },
  { key: 'parents', title: 'Luận về cha mẹ', short: 'Cha mẹ', palace: 'Phụ Mẫu', prefix: '父母', coverage: 'Quan hệ với cha mẹ, sự hỗ trợ, tình cảm gia đình', lens: 'Xem cách gia đình hỗ trợ bạn, sự khác biệt về kỳ vọng và những việc có thể trao đổi rõ hơn với cha mẹ.' },
  { key: 'family', title: 'Luận về anh/chị/em', short: 'Anh chị em', palace: 'Huynh Đệ', prefix: '兄弟', coverage: 'Anh chị em, gắn kết, hỗ trợ và mâu thuẫn', lens: 'Nhìn cách anh chị em hỗ trợ nhau và cách ứng xử khi bất đồng, nhất là khi cùng chia sẻ trách nhiệm gia đình.' },
  { key: 'children', title: 'Luận về con cái', short: 'Con cái', palace: 'Tử Tức', prefix: '子女', coverage: 'Đường con cái, tình cảm và quan hệ giữa các thế hệ', lens: 'Xem thiên hướng nuôi dạy, cách trao đổi với thế hệ sau và cách cân bằng giữa bảo bọc với để con tự lập.' },
  { key: 'health', title: 'Luận về sức khỏe', short: 'Sức khỏe', palace: 'Tật Ách', prefix: '疾厄', coverage: 'Thể trạng, sức khỏe, những vấn đề cần lưu tâm', lens: 'Điểm chỉ mô tả các dấu theo cách đọc Tử Vi. Với triệu chứng hoặc lo lắng về sức khỏe, hãy dựa vào đánh giá y tế.' },
  { key: 'home', title: 'Luận về nhà cửa, đất đai', short: 'Nhà cửa', palace: 'Điền Trạch', prefix: '田宅', coverage: 'Nhà ở, bất động sản, tài sản gia đình', lens: 'Xem xu hướng ổn định chỗ ở, cách chăm lo không gian sống và cách nhìn về tài sản chung trong gia đình.' },
  { key: 'friends', title: 'Luận về bạn bè', short: 'Bạn bè', palace: 'Nô Bộc', prefix: '交友', coverage: 'Bạn bè, đồng nghiệp, cấp dưới, quan hệ xã hội', lens: 'Xem bạn dễ xây dựng quan hệ qua môi trường nào, hợp cách hợp tác nào và nên đặt ranh giới ở đâu.' },
  { key: 'spirit', title: 'Luận về dòng họ', short: 'Dòng họ', palace: 'Phúc Đức', prefix: '福德', coverage: 'Gia tộc, tổ tiên, phúc khí, đời sống tinh thần', lens: 'Đọc các dấu như một cách suy ngẫm về nếp nhà, giá trị được truyền lại và những nguồn nâng đỡ tinh thần.' },
  { key: 'move', title: 'Luận về di chuyển', short: 'Di chuyển', palace: 'Thiên Di', prefix: '迁移', coverage: 'Đi xa, xuất ngoại, lập nghiệp xa nhà, môi trường bên ngoài', lens: 'Xem cách thích nghi khi đổi môi trường, gặp người mới hoặc làm việc xa nhà.' },
  { key: 'forecast', title: 'Luận giải vận hạn năm và tháng', short: 'Năm và tháng', palace: 'Tiểu hạn – Nguyệt hạn', prefix: '', coverage: 'Cung Tiểu hạn, sao Tứ Hóa lưu năm và diễn biến theo 12 tháng âm lịch', lens: 'Dùng Tiểu hạn làm cung trọng tâm, rồi đối chiếu các sao đổi Hóa theo năm và theo từng tháng âm lịch.' },
];

const BRIGHTNESS: Record<StarBrightness, number> = { 庙: 10, 旺: 8, 得: 6, 利: 3, 平: 0, 不: -3, 闲: -4, 陷: -8, 地: 4 };
const TRANSFORM: Record<SiHua, number> = { 禄: 6, 权: 4, 科: 4, 忌: -8 };
const BASE = 50;
const limit = (value: number) => Math.max(0, Math.min(100, value));
const wrapBranch = (value: number) => (value % 12 + 12) % 12;

export type ScoreFactor = { label: string; value: number };

export function getPalaceScoreFactors(palace: Palace, palaces: Palace[]): ScoreFactor[] {
  const own = palace.stars.filter((star) => star.type === 'major');
  const opposite = palaces.find(({ branch }) => branch === wrapBranch(palace.branch + 6));
  const main = own.length ? own : opposite?.stars.filter((star) => star.type === 'major') ?? [];
  const brightness = main.reduce((sum, star) => sum + (star.brightnessRaw ? BRIGHTNESS[star.brightnessRaw] : 0), 0);
  return [
    { label: own.length ? 'Độ sáng sao chính' : 'Độ sáng sao chính mượn từ đối cung', value: Math.round(brightness / Math.max(1, main.length) * (own.length ? 1 : 0.5)) },
    { label: 'Sao hỗ trợ (tối đa 6 sao × 2)', value: Math.min(6, palace.stars.filter((star) => star.type === 'lucky').length) * 2 },
    { label: 'Sao thử thách (tối đa 5 sao × −3)', value: Math.min(5, palace.stars.filter((star) => star.type === 'sha').length) * -3 },
    { label: 'Tứ Hóa bản mệnh trong cung', value: palace.stars.reduce((sum, star) => sum + (star.siHua ? TRANSFORM[star.siHua] : 0), 0) },
  ];
}

export function sumScore(factors: ScoreFactor[]) {
  return limit(BASE + factors.reduce((sum, factor) => sum + factor.value, 0));
}

export function getChapterPalace(chart: ZiweiChart, chapter: Chapter) {
  return chart.palaces.find(({ name }) => name.startsWith(chapter.prefix)
    || (chapter.key === 'friends' && name.startsWith('仆役')))
    ?? chart.palaces.find(({ branch }) => branch === chart.mingGongBranch) ?? chart.palaces[0];
}

export function getChapterScore(chart: ZiweiChart, chapter: Chapter) {
  const factors = getPalaceScoreFactors(getChapterPalace(chart, chapter), chart.palaces);
  if (chapter.key === 'overview' && chart.shenGongBranch !== chart.mingGongBranch) {
    const shen = chart.palaces.find(({ branch }) => branch === chart.shenGongBranch);
    if (shen) {
      const shenScore = sumScore(getPalaceScoreFactors(shen, chart.palaces));
      const combined = Math.round((sumScore(factors) + shenScore) / 2);
      factors.push({ label: 'Điều chỉnh để lấy trung bình điểm Mệnh và Thân', value: combined - sumScore(factors) });
    }
  }
  return { factors, score: sumScore(factors) };
}

export function getTransitMarks(chart: ZiweiChart, focus: Palace, transforms: Record<SiHua, string>) {
  return (Object.entries(transforms) as [SiHua, string][]).map(([kind, star]) => {
    const palace = chart.palaces.find((entry) => entry.stars.some(({ name }) => name === star));
    const distance = palace ? wrapBranch(palace.branch - focus.branch) : -1;
    const weight = distance === 0 ? 1 : [4, 6, 8].includes(distance) ? 0.5 : 0;
    return {
      label: `${translateStarName(star)} Hóa ${translateSiHua(kind)}`,
      palace: palace ? translatePalaceName(palace.name) : 'Chưa an sao',
      value: Math.round(TRANSFORM[kind] * weight),
    };
  });
}

export function buildAnnualOutlook(chart: ZiweiChart, year: number) {
  if (!Number.isInteger(year)) return null;
  const age = year - chart.lunarInfo.lunarYear + 1;
  if (age < 1) return null;
  const start = SCHOOL_AX.XIAOXIAN[chart.lunarInfo.yearBranch + 1] - 1;
  const direction = chart.birthInfo.gender === 'male' ? 1 : -1;
  const focus = chart.palaces.find(({ branch }) => branch === wrapBranch(start + direction * (age - 1)));
  if (!focus) return null;
  const yearSihua = getLiuNianSiHua(year);
  const marks = getTransitMarks(chart, focus, yearSihua.transforms);
  const factors = [
    ...getPalaceScoreFactors(focus, chart.palaces),
    ...marks.map(({ label, palace, value }) => ({ label: `Lưu năm · ${label} tại ${palace}`, value })),
  ];
  return { age, focus, marks, factors, score: sumScore(factors) };
}

export function buildYearOutlook(chart: ZiweiChart, year: number) {
  const annual = buildAnnualOutlook(chart, year);
  if (!annual) return null;
  const { focus, factors } = annual;
  const { stemIndex } = getLiuNianSiHua(year);
  const months = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const lunar = getLiuYueSiHua(stemIndex, month);
    const marks = getTransitMarks(chart, focus, lunar.transforms);
    const factorsForMonth = [...factors, ...marks.map(({ label, palace, value }) => ({
      label: `Lưu tháng · ${label} tại ${palace}`, value,
    }))];
    return { month, marks, factors: factorsForMonth, score: sumScore(factorsForMonth) };
  });
  return { ...annual, months };
}

// Cân xương dân gian, tính bằng chỉ. Tháng nhuận lấy số của tháng chính.
// Bảng đối chiếu: https://thientuvi.com/can-xuong-doan-so.html
const YEAR_WEIGHT = [
  12,9,6,7,12,5,9,8,7,8,15,9,
  16,8,8,19,12,6,8,7,5,15,6,16,
  15,7,9,12,10,7,15,6,5,14,14,9,
  7,7,9,12,8,7,13,5,14,5,9,17,
  5,7,12,8,8,6,19,6,8,16,10,6,
];
const MONTH_WEIGHT = [6,7,18,9,5,16,9,15,18,8,9,5];
const DAY_WEIGHT = [5,10,8,15,16,15,8,16,8,16,9,17,8,17,10,8,9,18,5,15,10,9,8,9,15,18,7,8,16,6];
const HOUR_WEIGHT = [16,6,7,10,9,16,10,8,8,9,6,6];
const NAP_AM = [
  'Hải Trung Kim', 'Lư Trung Hỏa', 'Đại Lâm Mộc', 'Lộ Bàng Thổ', 'Kiếm Phong Kim', 'Sơn Đầu Hỏa',
  'Giản Hạ Thủy', 'Thành Đầu Thổ', 'Bạch Lạp Kim', 'Dương Liễu Mộc', 'Tuyền Trung Thủy', 'Ốc Thượng Thổ',
  'Tích Lịch Hỏa', 'Tùng Bách Mộc', 'Trường Lưu Thủy', 'Sa Trung Kim', 'Sơn Hạ Hỏa', 'Bình Địa Mộc',
  'Bích Thượng Thổ', 'Kim Bạch Kim', 'Phú Đăng Hỏa', 'Thiên Hà Thủy', 'Đại Trạch Thổ', 'Thoa Xuyến Kim',
  'Tang Đố Mộc', 'Đại Khê Thủy', 'Sa Trung Thổ', 'Thiên Thượng Hỏa', 'Thạch Lựu Mộc', 'Đại Hải Thủy',
];
const ELEMENT_VI: Record<string, string> = { 金: 'Kim', 木: 'Mộc', 水: 'Thủy', 火: 'Hỏa', 土: 'Thổ' };

export function getBirthOverview(chart: ZiweiChart, unknownTime: boolean) {
  const { lunarYear, lunarMonth, lunarDay, yearStem, yearBranch } = chart.lunarInfo;
  const index = ((lunarYear - 4) % 60 + 60) % 60;
  const { year, month, day, hour } = chart.birthInfo;
  const birthDate = solarToLunar(year, month, day);
  const birthYear = birthDate?.lunarYear ?? lunarYear;
  const weightYear = ((birthYear - 4) % 60 + 60) % 60;
  const weights = [
    YEAR_WEIGHT[weightYear],
    MONTH_WEIGHT[Math.abs(birthDate?.lunarMonth ?? lunarMonth) - 1],
    DAY_WEIGHT[(birthDate?.lunarDay ?? lunarDay) - 1],
    HOUR_WEIGHT[hour],
  ];
  const total = !unknownTime && weights.every(Number.isFinite) ? weights.reduce((sum, weight) => sum + weight, 0) : null;
  const shen = chart.palaces.find(({ branch }) => branch === chart.shenGongBranch);
  return {
    year: `${translateStem(STEMS[yearStem])} ${translateBranch(BRANCHES[yearBranch])}`,
    napAm: NAP_AM[Math.floor(index / 2)],
    element: ELEMENT_VI[NAYIN_ELEMENTS[Math.floor(index / 2)]],
    cycle: translateWuxingJu(chart.wuxingJuName),
    ming: chart.mingZhu ? translateStarName(chart.mingZhu) : 'Chưa có',
    shen: chart.shenZhu ? translateStarName(chart.shenZhu) : 'Chưa có',
    shenPalace: shen ? translatePalaceName(shen.name) : 'Chưa có',
    weight: total === null ? null : `${Math.floor(total / 10)} lượng ${total % 10} chỉ`,
    weights,
  };
}
