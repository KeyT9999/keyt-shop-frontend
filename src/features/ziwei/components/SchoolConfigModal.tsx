import { useMemo } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  GitCompare,
} from 'lucide-react';
import type { BirthInfo, ZiweiChart } from '../engine/types';
import {
  type SchoolConfig,
  SCHOOL_DEFAULT_CONFIG,
} from '../engine/school-config';
import { generateChart } from '../engine/algorithm';
import { BRANCHES } from '../engine/constants';
import {
  translatePalaceName,
  translateStarName,
  translateBrightness,
  translateSiHua,
  translateBranch,
  translateWuxingJu,
} from '../utils/ziweiLocalization';

interface SchoolConfigModalProps {
  birthInfo: BirthInfo;
  config: SchoolConfig;
  onChange: (nextConfig: SchoolConfig) => void;
  onReset: () => void;
  onClose: () => void;
}

interface RuleOptionVi<T extends string> {
  value: T;
  labelVi: string;
  labelCn: string;
  descVi: string;
}

interface RuleGroupVi<K extends keyof SchoolConfig> {
  key: K;
  index: number;
  titleVi: string;
  titleCn: string;
  subtitleVi: string;
  options: RuleOptionVi<SchoolConfig[K]>[];
}

export const SCHOOL_RULE_GROUPS_VI: RuleGroupVi<keyof SchoolConfig>[] = [
  {
    key: 'brightnessSchool',
    index: 1,
    titleVi: 'Bảng Độ Sáng 14 Chính Tinh (7–8 Mức Miếu / Vượng / Đắc / Địa / Lợi / Bình / Nhàn / Hãm)',
    titleCn: '星曜亮度表',
    subtitleVi:
      'Quyết định độ sáng tối (Miếu, Vượng, Đắc, Địa, Lợi, Bình, Nhàn, Bất, Hãm) của 14 Chính tinh tại 12 địa chi.',
    options: [
      {
        value: 'default',
        labelVi: '《Đẩu Số Toàn Thư》Phái (Mặc định)',
        labelCn: '《斗数全书》派',
        descVi: 'Chuẩn cổ tịch phổ biến nhất, đồng nhất với hệ thống an sao chuẩn quốc tế.',
      },
      {
        value: 'ZZ',
        labelVi: 'Trung Châu Phái (Vương Đình Chi)',
        labelCn: '中州派',
        descVi: 'Hệ thống độ sáng của Trung Châu Phái (bổ sung phân cấp Nhàn cung & Địa cung).',
      },
      {
        value: 'XD2',
        labelVi: 'Hiện Đại Hiệu Đính (Bản v2)',
        labelCn: '现代修正 v2',
        descVi: 'Bảng độ sáng hiệu đính hiện đại lần 2 theo thực chứng mệnh lý.',
      },
      {
        value: 'XD1',
        labelVi: 'Hiện Đại Hiệu Đính (Bản v1)',
        labelCn: '现代修正 v1',
        descVi: 'Bảng độ sáng hiệu đính hiện đại lần 1.',
      },
    ],
  },
  {
    key: 'gengYearSihua',
    index: 2,
    titleVi: 'Khẩu Quyết Tứ Hóa Năm Canh (Can Canh: Lộc – Quyền – Khoa – Kỵ)',
    titleCn: '庚年四化',
    subtitleVi:
      'Năm Canh (Canh Tý, Canh Dần, Canh Thìn, Canh Ngọ, Canh Thân, Canh Tuất) có 5 dị bản về Hóa Khoa và Hóa Kỵ trong cổ thư.',
    options: [
      {
        value: 'GYWYT',
        labelVi: 'Dương – Vũ – Âm – Đồng (Mặc định)',
        labelCn: '阳武阴同',
        descVi: 'Thái Dương Hóa Lộc, Vũ Khúc Hóa Quyền, Thái Âm Hóa Khoa, Thiên Đồng Hóa Kỵ (Chuẩn Toàn Thư).',
      },
      {
        value: 'GYWTY',
        labelVi: 'Dương – Vũ – Đồng – Âm (Khoa Kỵ Hoán Đổi)',
        labelCn: '阳武同阴',
        descVi: 'Thái Dương Hóa Lộc, Vũ Khúc Hóa Quyền, Thiên Đồng Hóa Khoa, Thái Âm Hóa Kỵ (Trung Châu / Đài Loan).',
      },
      {
        value: 'GYWFT',
        labelVi: 'Dương – Vũ – Phủ – Đồng',
        labelCn: '阳武府同',
        descVi: 'Thái Dương Hóa Lộc, Vũ Khúc Hóa Quyền, Thiên Phủ Hóa Khoa, Thiên Đồng Hóa Kỵ.',
      },
      {
        value: 'GYWFX',
        labelVi: 'Dương – Vũ – Phủ – Tướng',
        labelCn: '阳武府相',
        descVi: 'Thái Dương Hóa Lộc, Vũ Khúc Hóa Quyền, Thiên Phủ Hóa Khoa, Thiên Tướng Hóa Kỵ.',
      },
      {
        value: 'GYWTX',
        labelVi: 'Dương – Vũ – Đồng – Tướng',
        labelCn: '阳武同相',
        descVi: 'Thái Dương Hóa Lộc, Vũ Khúc Hóa Quyền, Thiên Đồng Hóa Khoa, Thiên Tướng Hóa Kỵ.',
      },
    ],
  },
  {
    key: 'tianmaSchool',
    index: 3,
    titleVi: 'Quy Tắc An Sao Thiên Mã (Niên Mã / Nguyệt Mã)',
    titleCn: '安天马',
    subtitleVi:
      'Sao Thiên Mã chủ về dịch chuyển, xuất ngoại, biến động và tài lộc phương xa (Lộc Mã Giao Trì).',
    options: [
      {
        value: 'year-branch',
        labelVi: 'An Theo Địa Chi Năm Sinh (Mặc định)',
        labelCn: '依据年支',
        descVi: 'Khởi Thiên Mã tại Tứ Sinh (Dần – Thân – Tỵ – Hợi) dựa trên Tam hợp Địa chi năm sinh.',
      },
      {
        value: 'month-branch',
        labelVi: 'An Theo Địa Chi Tháng Sinh (Nguyệt Mã)',
        labelCn: '依据月支',
        descVi: 'Khởi Thiên Mã dựa trên Địa chi của tháng Âm lịch sinh ra.',
      },
    ],
  },
  {
    key: 'tiankongSchool',
    index: 4,
    titleVi: 'Quy Tắc An Sao Thiên Không',
    titleCn: '安天空',
    subtitleVi:
      'Sao Thiên Không trong hệ Tạp Diệu chủ về sự trống rỗng, triết lý ngộ đạo hoặc hao tán bất ngờ.',
    options: [
      {
        value: 'normal',
        labelVi: 'An Thường Quy Theo Chi Năm (Mặc định)',
        labelCn: '常规排法',
        descVi: 'Đặt tại cung đứng ngay sau Địa chi năm sinh (Thái Tuế tiến 1 cung).',
      },
      {
        value: 'shun-jia-shi',
        labelVi: 'Thuận Gia Sinh Thời',
        labelCn: '顺加生时',
        descVi: 'Từ giờ sinh khởi thuận theo quy tắc riêng của phái dân gian.',
      },
    ],
  },
  {
    key: 'jiekongSchool',
    index: 5,
    titleVi: 'Quy Tắc An Triệt Không & Tuần Không',
    titleCn: '安截空旬空',
    subtitleVi:
      'Triệt Lộ Không Vong và Tuần Trung Không Vong có tác dụng cản trở hoặc giảm lực của cả cát tinh lẫn sát tinh.',
    options: [
      {
        value: 'double',
        labelVi: 'Chính – Phó Song Tinh (Mặc định)',
        labelCn: '正副双星',
        descVi: 'An đầy đủ cả Chính Không và Phó Không (Triệt Không + Phó Triệt, Tuần Không + Phó Tuần).',
      },
      {
        value: 'single',
        labelVi: 'Đơn Tinh Thường Quy',
        labelCn: '常规单星',
        descVi: 'Chỉ an 1 sao Triệt Không và 1 sao Tuần Không theo Âm Dương năm sinh.',
      },
      {
        value: 'zhanyan',
        labelVi: 'Chiêm Nghiệm Phái (Trung Châu)',
        labelCn: '占验派',
        descVi: 'Phương pháp phân định Chính Không / Phó Không theo Chiêm Nghiệm Phái.',
      },
    ],
  },
  {
    key: 'kuiyueSchool',
    index: 6,
    titleVi: 'Khẩu Quyết An Thiên Khôi & Thiên Việt (Song Quý Nhân)',
    titleCn: '安魁钺',
    subtitleVi:
      'Thiên Khôi (Dương Quý) và Thiên Việt (Âm Quý) khác nhau ở các tuổi Canh, Tân, Nhâm, Quý tùy cách hiểu ca quyết cổ.',
    options: [
      {
        value: 'qs1',
        labelVi: '《Đẩu Số Toàn Thư》Ca Quyết 1 (Mặc định)',
        labelCn: '《斗数全书》理解 1',
        descVi: 'Giáp Mậu Canh Ngưu Dương, Ất Kỷ Thử Hầu Hương, Bính Đinh Trư Kê Vị, Nhâm Quý Thỏ Xà Tàng, Lục Tân Phùng Mã Hổ.',
      },
      {
        value: 'qs2',
        labelVi: '《Đẩu Số Toàn Thư》Ca Quyết 2',
        labelCn: '《斗数全书》理解 2',
        descVi: 'Khác biệt vị trí Khôi – Việt ở các năm Canh, Tân, Nhâm, Quý.',
      },
      {
        value: 'zhong-yiming',
        labelVi: 'Sách Chung Nghĩa Minh Tiên Sinh',
        labelCn: '钟义明先生书籍排法',
        descVi: 'Theo khảo chứng của học giả Tử Vi Đài Loan Chung Nghĩa Minh.',
      },
      {
        value: 'network',
        labelVi: 'Bản Lưu Truyền Dân Gian',
        labelCn: '网络流传排法',
        descVi: 'Biến thể lưu truyền trong một số phần mềm an sao dân gian.',
      },
    ],
  },
  {
    key: 'tianshiTianshang',
    index: 7,
    titleVi: 'Quy Tắc An Thiên Sứ & Thiên Thương',
    titleCn: '安天使天伤',
    subtitleVi:
      'Thiên Thương và Thiên Sứ luôn kẹp cung Thiên Di (tọa tại Nô Bộc và Tật Ách), dùng để xét tai ách lưu niên.',
    options: [
      {
        value: 'normal',
        labelVi: 'Thường Quy Cố Định (Mặc định)',
        labelCn: '常规排法',
        descVi: 'Thiên Thương cố định ở cung Nô Bộc, Thiên Sứ cố định ở cung Tật Ách.',
      },
      {
        value: 'zhongzhou',
        labelVi: 'Trung Châu Phái (Hoán Đổi Theo Âm Dương)',
        labelCn: '中州派排法',
        descVi: 'Dương Nam Âm Nữ giữ nguyên; Âm Nam Dương Nữ hoán đổi vị trí Thiên Thương – Thiên Sứ.',
      },
    ],
  },
  {
    key: 'changshengSchool',
    index: 8,
    titleVi: 'Vòng Trường Sinh 12 Thần (Trường Sinh, Mộc Dục, Quan Đới...)',
    titleCn: '长生十二神',
    subtitleVi:
      'Xác định cung khởi Trường Sinh và chiều thuận/nghịch của 12 thần theo Ngũ Hành Cục.',
    options: [
      {
        value: 'yin-yang-shun-ni',
        labelVi: 'Phân Biệt Âm Dương Thuận Nghịch (Mặc định)',
        labelCn: '区分阴阳顺逆',
        descVi: 'Dương Nam Âm Nữ đi thuận; Âm Nam Dương Nữ đi nghịch. Thủy Thổ khởi Thân, Hỏa khởi Dần, Mộc khởi Hợi, Kim khởi Tỵ.',
      },
      {
        value: 'shui-tu',
        labelVi: 'Thủy – Thổ Cộng Trường Sinh (Không Phân Âm Dương)',
        labelCn: '水土共长生',
        descVi: 'Thổ Ngũ Cục khởi Trường Sinh tại Thân cùng Thủy Nhị Cục.',
      },
      {
        value: 'huo-tu',
        labelVi: 'Hỏa – Thổ Cộng Trường Sinh',
        labelCn: '火土共长生',
        descVi: 'Thổ Ngũ Cục khởi Trường Sinh tại Dần cùng Hỏa Lục Cục.',
      },
    ],
  },
  {
    key: 'lateZishi',
    index: 9,
    titleVi: 'Xử Lý Giờ Tý Muộn / Dạ Tý (23:00 – 24:00)',
    titleCn: '晚子时',
    subtitleVi:
      'Người sinh trong khoảng 23:00 đến 23:59 thuộc Giờ Tý Muộn (Dạ Tý). Học phái Nghê Hải Hạ và phái truyền thống xử lý khác nhau.',
    options: [
      {
        value: 'next-day',
        labelVi: 'Tính Sang Ngày Hôm Sau (Mặc định)',
        labelCn: '视为次日',
        descVi: 'Sau 23:00 bước sang giờ Tý của ngày mới — đổi sang ngày Âm lịch tiếp theo để an sao.',
      },
      {
        value: 'current-day',
        labelVi: 'Giữ Nguyên Ngày Hôm Đó — Phái Nghê Hải Hạ《Thiên Kỷ》',
        labelCn: '视为当日',
        descVi: 'Chưa qua 00:00 vẫn giữ nguyên ngày Âm lịch hôm đó và an theo giờ Tý (Chuẩn Nghê Sư).',
      },
      {
        value: 'all-current',
        labelVi: 'Trụ Ngày Hôm Đó / Trụ Giờ Hôm Đó (Bát Tự)',
        labelCn: '日柱当日 / 时柱当日（八字）',
        descVi: 'Dùng trụ ngày của ngày hôm đó kết hợp can giờ Tý của cùng ngày.',
      },
      {
        value: 'day-cur-time-next',
        labelVi: 'Trụ Ngày Hôm Đó / Trụ Giờ Hôm Sau (Bát Tự Dạ Tý)',
        labelCn: '日柱当日 / 时柱次日（八字）',
        descVi: 'Giữ trụ ngày hôm đó nhưng lấy can giờ Tý của ngày hôm sau.',
      },
    ],
  },
  {
    key: 'leapMonth',
    index: 10,
    titleVi: 'Xử Lý Tháng Nhuận Âm Lịch (4 Phương Pháp)',
    titleCn: '闰月归属',
    subtitleVi:
      'Khi đương số sinh vào tháng Nhuận Âm lịch (VD: Nhuận tháng 4), các trường phái có 4 cách quy thuộc tháng sinh.',
    options: [
      {
        value: 'split',
        labelVi: 'Phân Đôi Giữa Tháng — Ngày 15 Làm Ranh Giới (Mặc định)',
        labelCn: '视为分半',
        descVi: 'Mồng 1–15 tính theo tháng chính trước đó; từ ngày 16–30 tính sang tháng kế tiếp (Chuẩn 150 lá số vàng).',
      },
      {
        value: 'next-month',
        labelVi: 'Tính Toàn Bộ Sang Tháng Kế Tiếp — Phái Nghê Hải Hạ《Thiên Kỷ》',
        labelCn: '视为下月',
        descVi: 'Cả tháng Nhuận đều quy về tháng sau (VD: Nhuận tháng 4 tính là tháng 5 Âm lịch).',
      },
      {
        value: 'prev-month',
        labelVi: 'Tính Toàn Bộ Theo Tháng Chính Trước Đó',
        labelCn: '视为本月',
        descVi: 'Cả tháng Nhuận đều giữ nguyên như tháng chính (VD: Nhuận tháng 4 tính là tháng 4).',
      },
      {
        value: 'origin-month',
        labelVi: 'Giữ Nguyên Nhãn Tháng Nhuận Gốc',
        labelCn: '保持闰月',
        descVi: 'Không dịch chuyển tháng, giữ nguyên trạng thái tháng nhuận của lịch số.',
      },
    ],
  },
];

export interface ChartDiffItem {
  category: 'structure' | 'star_move' | 'brightness' | 'sihua';
  titleVi: string;
  beforeVi: string;
  afterVi: string;
}

/**
 * So sánh trực tiếp 2 lá số (Mặc định vs Trường phái đang chọn) để chỉ ra chính xác
 * cung nào, sao nào, độ sáng nào hoặc Tứ Hóa nào vừa thay đổi!
 */
export function computeSchoolChartDiff(
  baseChart: ZiweiChart,
  targetChart: ZiweiChart
): ChartDiffItem[] {
  const diffs: ChartDiffItem[] = [];

  // 1. Kiểm tra Cung Mệnh, Cung Thân, Ngũ Hành Cục
  if (baseChart.mingGongBranch !== targetChart.mingGongBranch) {
    diffs.push({
      category: 'structure',
      titleVi: 'Vị trí Cung Mệnh',
      beforeVi: `Cung ${translateBranch(BRANCHES[baseChart.mingGongBranch])}`,
      afterVi: `Cung ${translateBranch(BRANCHES[targetChart.mingGongBranch])}`,
    });
  }
  if (baseChart.shenGongBranch !== targetChart.shenGongBranch) {
    diffs.push({
      category: 'structure',
      titleVi: 'Vị trí Cung Thân',
      beforeVi: `Cung ${translateBranch(BRANCHES[baseChart.shenGongBranch])}`,
      afterVi: `Cung ${translateBranch(BRANCHES[targetChart.shenGongBranch])}`,
    });
  }
  if (baseChart.wuxingJuName !== targetChart.wuxingJuName) {
    diffs.push({
      category: 'structure',
      titleVi: 'Ngũ Hành Cục & Tuổi Khởi Đại Hạn',
      beforeVi: translateWuxingJu(baseChart.wuxingJuName),
      afterVi: translateWuxingJu(targetChart.wuxingJuName),
    });
  }

  // 2. Map vị trí sao, độ sáng, tứ hóa trên 12 cung
  const baseStarPos: Record<
    string,
    { branch: number; palaceName: string; brightness?: string; siHua?: string }[]
  > = {};
  const targetStarPos: Record<
    string,
    { branch: number; palaceName: string; brightness?: string; siHua?: string }[]
  > = {};

  baseChart.palaces.forEach((p) => {
    p.stars.forEach((s) => {
      if (!baseStarPos[s.name]) baseStarPos[s.name] = [];
      baseStarPos[s.name].push({
        branch: p.branch,
        palaceName: p.name,
        brightness: s.brightnessRaw,
        siHua: s.siHua,
      });
    });
  });

  targetChart.palaces.forEach((p) => {
    p.stars.forEach((s) => {
      if (!targetStarPos[s.name]) targetStarPos[s.name] = [];
      targetStarPos[s.name].push({
        branch: p.branch,
        palaceName: p.name,
        brightness: s.brightnessRaw,
        siHua: s.siHua,
      });
    });
  });

  const allStarNames = Array.from(
    new Set([...Object.keys(baseStarPos), ...Object.keys(targetStarPos)])
  );

  for (const starName of allStarNames) {
    const bList = baseStarPos[starName] || [];
    const tList = targetStarPos[starName] || [];
    const starVi = translateStarName(starName);

    const bBranches = bList
      .map((x) => `${translateBranch(BRANCHES[x.branch])} (${translatePalaceName(x.palaceName)})`)
      .join(', ');
    const tBranches = tList
      .map((x) => `${translateBranch(BRANCHES[x.branch])} (${translatePalaceName(x.palaceName)})`)
      .join(', ');

    if (bBranches !== tBranches) {
      diffs.push({
        category: 'star_move',
        titleVi: `Vị trí sao ${starVi}`,
        beforeVi: bBranches || 'Không an',
        afterVi: tBranches || 'Không an',
      });
      continue;
    }

    // Nếu cùng vị trí, kiểm tra độ sáng và Tứ Hóa
    if (bList.length === 1 && tList.length === 1) {
      const bItem = bList[0];
      const tItem = tList[0];
      const locLabel = `Cung ${translatePalaceName(tItem.palaceName)} (${translateBranch(
        BRANCHES[tItem.branch]
      )})`;

      if ((bItem.brightness || '') !== (tItem.brightness || '')) {
        diffs.push({
          category: 'brightness',
          titleVi: `Độ sáng sao ${starVi} tại ${locLabel}`,
          beforeVi: bItem.brightness ? translateBrightness(bItem.brightness) : 'Không ghi',
          afterVi: tItem.brightness ? translateBrightness(tItem.brightness) : 'Không ghi',
        });
      }

      if ((bItem.siHua || '') !== (tItem.siHua || '')) {
        diffs.push({
          category: 'sihua',
          titleVi: `Tứ Hóa của sao ${starVi} tại ${locLabel}`,
          beforeVi: bItem.siHua ? `Hóa ${translateSiHua(bItem.siHua)}` : 'Không Hóa',
          afterVi: tItem.siHua ? `Hóa ${translateSiHua(tItem.siHua)}` : 'Không Hóa',
        });
      }
    }
  }

  return diffs;
}

export default function SchoolConfigModal({
  birthInfo,
  config,
  onChange,
  onReset,
  onClose,
}: SchoolConfigModalProps) {
  const { currentChart, diffs } = useMemo(() => {
    const defChart = generateChart(birthInfo, SCHOOL_DEFAULT_CONFIG);
    const curChart = generateChart(birthInfo, config);
    return {
      currentChart: curChart,
      diffs: computeSchoolChartDiff(defChart, curChart),
    };
  }, [birthInfo, config]);

  const activeCustomCount = useMemo(() => {
    let count = 0;
    (Object.keys(SCHOOL_DEFAULT_CONFIG) as (keyof SchoolConfig)[]).forEach((k) => {
      if (config[k] !== SCHOOL_DEFAULT_CONFIG[k]) count++;
    });
    return count;
  }, [config]);

  const applyPreset = (preset: 'default' | 'nihaixia' | 'zhongzhou') => {
    if (preset === 'default') {
      onChange({ ...SCHOOL_DEFAULT_CONFIG });
    } else if (preset === 'nihaixia') {
      onChange({
        ...SCHOOL_DEFAULT_CONFIG,
        lateZishi: 'current-day',
        leapMonth: 'next-month',
      });
    } else if (preset === 'zhongzhou') {
      onChange({
        ...SCHOOL_DEFAULT_CONFIG,
        brightnessSchool: 'ZZ',
        gengYearSihua: 'GYWTY',
        jiekongSchool: 'zhanyan',
        tianshiTianshang: 'zhongzhou',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-white flex items-center justify-between gap-3 border-b border-indigo-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F05A28] text-white flex items-center justify-center shadow-sm shrink-0">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold">
                  Thiết Lập 10 Nhóm Quy Tắc Trường Phái An Sao
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  {activeCustomCount === 0
                    ? 'Đang dùng Chuẩn Mặc Định'
                    : `Đang tùy chỉnh ${activeCustomCount}/10 quy tắc`}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Đổi quy tắc lập tức tính lại lá số và đối chiếu trực tiếp những cung/sao thay đổi
                trước – sau
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick School Presets Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-slate-600 inline-flex items-center gap-1">
              <Layers size={14} className="text-[#F05A28]" />
              Chọn nhanh Tổ Hợp Trường Phái:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('default')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
            >
              1. Chuẩn Toàn Thư &amp; Quốc Tế (Mặc định)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('nihaixia')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 transition-colors cursor-pointer"
            >
              2. Chuẩn Nghê Hải Hạ《Thiên Kỷ》
            </button>
            <button
              type="button"
              onClick={() => applyPreset('zhongzhou')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors cursor-pointer"
            >
              3. Chuẩn Trung Châu Phái (Vương Đình Chi)
            </button>
          </div>

          {activeCustomCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Khôi phục Mặc định</span>
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* LIVE BEFORE/AFTER DIFF PANEL */}
          <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/70 via-white to-amber-50/40 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GitCompare size={18} className="text-purple-700" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Đối Chiếu Sự Khác Biệt Trên Lá Số Hiện Tại (Trước vs. Sau Khi Đổi Trường Phái)
                </h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  diffs.length > 0
                    ? 'bg-[#F05A28] text-white'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {diffs.length > 0
                  ? `Phát hiện ${diffs.length} điểm thay đổi trên lá số`
                  : '0 điểm khác biệt so với Chuẩn Mặc Định'}
              </span>
            </div>

            {diffs.length === 0 ? (
              <p className="text-xs text-slate-600 leading-relaxed">
                Với ngày giờ sinh hiện tại (
                <strong>
                  {birthInfo.day}/{birthInfo.month}/{birthInfo.year}
                </strong>
                ), cấu hình trường phái đang chọn cho kết quả an sao đồng nhất với Chuẩn Mặc Định (
                {translateWuxingJu(currentChart.wuxingJuName)}, Mệnh tại{' '}
                {translateBranch(BRANCHES[currentChart.mingGongBranch])}). Hãy thử đổi bảng độ sáng
                sang <strong>Trung Châu Phái</strong> hoặc đổi <strong>Khẩu quyết Khôi Việt / Thiên Mã</strong> để xem sự thay đổi tức thời.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {diffs.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-purple-200/80 shadow-2xs flex flex-col justify-between gap-1 text-xs"
                  >
                    <div className="font-bold text-slate-900">{d.titleVi}</div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 line-through">
                        {d.beforeVi}
                      </span>
                      <ArrowRight size={12} className="text-[#F05A28] shrink-0" />
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200">
                        {d.afterVi}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 10 RULE GROUPS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCHOOL_RULE_GROUPS_VI.map((group) => {
              const currentValue = config[group.key];
              const isModified = currentValue !== SCHOOL_DEFAULT_CONFIG[group.key];
              return (
                <div
                  key={group.key}
                  className={`rounded-2xl border p-4 space-y-3 transition-all ${
                    isModified
                      ? 'bg-orange-50/30 border-[#F05A28]/60 shadow-2xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-white">
                        Nhóm {group.index}/10 • {group.titleCn}
                      </span>
                      {isModified && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#F05A28]">
                          Đã tùy chỉnh
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 pt-1">{group.titleVi}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{group.subtitleVi}</p>
                  </div>

                  <div className="space-y-2">
                    {group.options.map((opt) => {
                      const selected = currentValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            onChange({
                              ...config,
                              [group.key]: opt.value,
                            })
                          }
                          className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                            selected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                              : 'bg-slate-50/80 hover:bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {selected ? (
                              <CheckCircle2 size={15} className="text-[#F05A28]" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-400" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-extrabold flex flex-wrap items-center gap-1.5">
                              <span>{opt.labelVi}</span>
                              <span
                                className={`text-[10px] font-normal ${
                                  selected ? 'text-amber-300' : 'text-slate-400'
                                }`}
                              >
                                ({opt.labelCn})
                              </span>
                            </div>
                            <p
                              className={`text-[11px] leading-relaxed ${
                                selected ? 'text-slate-300' : 'text-slate-500'
                              }`}
                            >
                              {opt.descVi}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#F05A28]" />
            <span>
              Cấu hình được lưu tự động trên trình duyệt và đồng bộ trực tiếp vào đường dẫn chia sẻ
              lá số.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#d94b1c] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-colors cursor-pointer"
          >
            Áp Dụng &amp; Xem Bàn Lá Số ({diffs.length} thay đổi)
          </button>
        </div>
      </div>
    </div>
  );
}
