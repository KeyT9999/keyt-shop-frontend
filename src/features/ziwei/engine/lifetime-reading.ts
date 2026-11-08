import type { Palace, ZiweiChart } from './types';
import { getDaXianSiHua } from './sihua';
import { getDaXianYears, getChildhoodYears } from './yunxian-context';
import { getPalaceScoreFactors, getTransitMarks, sumScore } from './reading-report';
import { translatePalaceName } from '../utils/ziweiLocalization';

const LINKED_PALACES = [
  { offset: 0, roleLabel: 'Cung trọng tâm' },
  { offset: 6, roleLabel: 'Đối cung' },
  { offset: 4, roleLabel: 'Cung tam hợp thứ nhất' },
  { offset: 8, roleLabel: 'Cung tam hợp thứ hai' },
] as const;

export function getFourPalaceGroup(chart: ZiweiChart, focus: Palace) {
  return LINKED_PALACES.flatMap(({ offset, roleLabel }) => {
    const palace = chart.palaces.find(({ branch }) => branch === (focus.branch + offset) % 12);
    return palace ? [{ palace, roleLabel }] : [];
  });
}

export function buildFourPalaceReading(chart: ZiweiChart, focus: Palace) {
  const group = getFourPalaceGroup(chart, focus).map(({ palace, roleLabel }) => {
    const factors = getPalaceScoreFactors(palace, chart.palaces);
    return { palace, roleLabel, score: sumScore(factors) };
  });
  const linked = group.filter(({ palace }) => palace.branch !== focus.branch);
  const higher = linked.filter(({ score }) => score > group[0]?.score);
  const lower = linked.filter(({ score }) => score < group[0]?.score);
  return { group, higher, lower };
}

export function buildLifePeriods(chart: ZiweiChart) {
  return chart.daXians.flatMap((period, index) => {
    const palace = chart.palaces.find(({ branch }) => branch === period.palaceBranch);
    const years = getDaXianYears(chart, index);
    if (!palace || !years.length) return [];

    const transforms = getDaXianSiHua(chart, index)?.transforms;
    const marks = transforms ? getTransitMarks(chart, palace, transforms) : [];
    const factors = [
      ...getPalaceScoreFactors(palace, chart.palaces),
      ...marks.map(({ label, palace: location, value }) => ({ label: `Đại vận · ${label} tại ${location}`, value })),
    ];

    return [{ index, startAge: period.startAge, endAge: period.endAge, palace, years, marks, factors, score: sumScore(factors) }];
  });
}

export function getLifetimeYears(chart: ZiweiChart, index: number) {
  return index === -1 ? getChildhoodYears(chart) : getDaXianYears(chart, index);
}

export const PALACE_FOCUS: Record<string, string> = {
  Mệnh: 'bản thân, năng lực và cách đưa ra lựa chọn',
  'Huynh Đệ': 'quan hệ anh chị em và cách chia sẻ trách nhiệm',
  'Phu Thê': 'tình cảm, cam kết và cách sống cùng bạn đời',
  'Tử Nữ': 'quan hệ với con cái và thế hệ sau',
  'Tài Bạch': 'thu nhập, chi tiêu và cách giữ tiền',
  'Tật Ách': 'nếp sống và cách chăm sóc bản thân',
  'Thiên Di': 'đổi môi trường, đi xa và thích nghi',
  'Nô Bộc': 'bạn bè, đồng nghiệp và mạng lưới hỗ trợ',
  'Quan Lộc': 'học tập, công việc và trách nhiệm nghề nghiệp',
  'Điền Trạch': 'chỗ ở và cách quản lý tài sản gia đình',
  'Phúc Đức': 'đời sống tinh thần và ảnh hưởng từ gia đình',
  'Phụ Mẫu': 'quan hệ với cha mẹ và sự hỗ trợ của gia đình',
};

export function getPalaceFocus(palace: Palace) {
  const name = translatePalaceName(palace.name);
  return PALACE_FOCUS[name] ?? name;
}
