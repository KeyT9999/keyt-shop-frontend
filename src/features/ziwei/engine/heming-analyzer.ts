import type { ZiweiChart, Palace, SiHua } from './types';
import { STEMS, BRANCHES } from './constants';
import { getSiHuaByStem } from './sihua';
import {
  STAR_IN_FUQI_GU,
  SIHUA_IN_FUQI_GU,
  MARRIAGE_STARS_BRIEF,
} from './heming-knowledge';
import {
  translatePalaceName,
  translateStarName,
  translateBrightness,
  translateSiHua,
  translateStem,
  translateBranch,
  translateChineseAstrologyText,
} from '../utils/ziweiLocalization';

export interface FlyingSihuaImpact {
  siHua: SiHua;
  siHuaVi: string;
  starNameCn: string;
  starNameVi: string;
  targetPalaceNameCn: string;
  targetPalaceNameVi: string;
  targetBranchVi: string;
  nature: 'positive' | 'caution' | 'neutral';
  interpretationVi: string;
}

export interface FuqiPalaceAudit {
  ownerLabel: string;
  palaceBranchVi: string;
  majorStarsVi: string[];
  sihuaBadgesVi: string[];
  marriageMinorStarsVi: { nameVi: string; noteVi: string }[];
  deductionsVi: {
    starVi: string;
    summaryVi: string;
    goodVi: string;
    badVi: string;
    spouseTraitsVi: string;
    timingVi: string;
    niQuoteVi?: string;
  }[];
  sihuaNotesVi: string[];
  fudeMajorStarsVi: string[];
  fudeHasShaOrJi: boolean;
}

export interface SunMoonAuditItem {
  ownerLabel: string;
  gender: 'male' | 'female';
  sunPalaceVi: string;
  sunBrightnessVi: string;
  sunSiHuaVi?: string;
  moonPalaceVi: string;
  moonBrightnessVi: string;
  moonSiHuaVi?: string;
  verdictVi: string;
  isAuspicious: boolean;
}

export interface DeterministicHemingReport {
  overallScore: number; // 1..5 stars
  scoreTitleVi: string;
  scoreSummaryVi: string;
  step1Foundation: {
    groupAVi: string;
    groupBVi: string;
    mingStarsAVi: string[];
    mingStarsBVi: string[];
    compatibilityLabelVi: string;
    analysisVi: string;
  };
  step2FuqiCross: {
    matchLevel: 'two-way' | 'one-way' | 'complementary' | 'independent';
    matchBadgeVi: string;
    matchDetailVi: string;
    auditA: FuqiPalaceAudit;
    auditB: FuqiPalaceAudit;
  };
  step3SunMoon: {
    itemA: SunMoonAuditItem;
    itemB: SunMoonAuditItem;
  };
  step4FlyingSiHua: {
    stemAVi: string;
    stemBVi: string;
    aToB: FlyingSihuaImpact[];
    bToA: FlyingSihuaImpact[];
    karmicBondTypeVi: string;
    karmicSummaryVi: string;
  };
  step5DaxianAndBusiness: {
    daxianAVi: string;
    daxianBVi: string;
    marriageTimingAdviceVi: string;
    businessScore: number; // 1..5
    businessVerdictVi: string;
    businessDetailsVi: string[];
  };
  promptContextTextVi: string;
}

const GROUP_SPL = new Set(['七杀', '破军', '贪狼']);
const GROUP_TFWX = new Set(['紫微', '天府', '武曲', '天相', '廉贞']);
const GROUP_JYTL = new Set(['天机', '太阴', '天同', '天梁']);
const GROUP_JURI = new Set(['太阳', '巨门']);

function getEffectiveMajorStars(_chart: ZiweiChart, palace: Palace): string[] {
  const majors = palace.stars.filter((s) => s.type === 'major').map((s) => s.name);
  if (majors.length > 0) return majors;
  return palace.borrowedStars || [];
}

function classifyStarGroup(stars: string[]): { code: string; nameVi: string } {
  if (stars.some((s) => GROUP_SPL.has(s))) {
    return { code: 'SPL', nameVi: 'Sát Phá Tham (Khai phá, quyết đoán, biến động)' };
  }
  if (stars.some((s) => GROUP_TFWX.has(s))) {
    return { code: 'TFWX', nameVi: 'Tử Phủ Vũ Tướng Liêm (Lãnh đạo, quản trị, quy củ)' };
  }
  if (stars.some((s) => GROUP_JYTL.has(s))) {
    return { code: 'JYTL', nameVi: 'Cơ Nguyệt Đồng Lương (Mưu lược, ôn hòa, chuyên môn)' };
  }
  if (stars.some((s) => GROUP_JURI.has(s))) {
    return { code: 'JURI', nameVi: 'Cự Nhật (Quang minh, ngôn biện, hướng ngoại)' };
  }
  return { code: 'OTHER', nameVi: 'Trung tính linh hoạt' };
}

function getSanFangMajorStars(chart: ZiweiChart, centerBranch: number): Set<string> {
  const branches = [
    centerBranch,
    (centerBranch + 6) % 12,
    (centerBranch + 4) % 12,
    (centerBranch + 8) % 12,
  ];
  const out = new Set<string>();
  chart.palaces.forEach((p) => {
    if (branches.includes(p.branch)) {
      getEffectiveMajorStars(chart, p).forEach((st) => out.add(st));
    }
  });
  return out;
}

function buildFuqiAudit(chart: ZiweiChart, ownerLabel: string): FuqiPalaceAudit {
  const fuqi =
    chart.palaces.find((p) => p.name.startsWith('夫妻')) || chart.palaces[0];
  const fude =
    chart.palaces.find((p) => p.name.startsWith('福德')) || chart.palaces[0];

  const majorCn = getEffectiveMajorStars(chart, fuqi);
  const majorStarsVi = majorCn.map((s) => translateStarName(s));

  const sihuaBadgesVi: string[] = [];
  const sihuaNotesVi: string[] = [];

  fuqi.stars.forEach((s) => {
    if (s.siHua) {
      const key = `化${s.siHua}` as keyof typeof SIHUA_IN_FUQI_GU;
      sihuaBadgesVi.push(`${translateStarName(s.name)} Hóa ${translateSiHua(s.siHua)}`);
      if (SIHUA_IN_FUQI_GU[key]) {
        sihuaNotesVi.push(
          `【${translateStarName(s.name)} Hóa ${translateSiHua(s.siHua)} tại Phu Thê】: ${translateChineseAstrologyText(
            SIHUA_IN_FUQI_GU[key]
          )}`
        );
      }
    }
  });

  const marriageMinorStarsVi: { nameVi: string; noteVi: string }[] = [];
  chart.palaces.forEach((p) => {
    if (p.branch === chart.mingGongBranch || p.name.startsWith('夫妻')) {
      p.stars.forEach((s) => {
        if (MARRIAGE_STARS_BRIEF[s.name]) {
          marriageMinorStarsVi.push({
            nameVi: `${translateStarName(s.name)} (tại ${translatePalaceName(p.name)})`,
            noteVi: translateChineseAstrologyText(MARRIAGE_STARS_BRIEF[s.name]),
          });
        }
      });
    }
  });

  const deductionsVi = majorCn
    .filter((s) => STAR_IN_FUQI_GU[s])
    .map((s) => {
      const raw = STAR_IN_FUQI_GU[s];
      return {
        starVi: translateStarName(s),
        summaryVi: translateChineseAstrologyText(raw.summary),
        goodVi: translateChineseAstrologyText(raw.good),
        badVi: translateChineseAstrologyText(raw.bad),
        spouseTraitsVi: translateChineseAstrologyText(raw.spouse_traits),
        timingVi: translateChineseAstrologyText(raw.timing),
        niQuoteVi: raw.ni_quote ? translateChineseAstrologyText(raw.ni_quote) : undefined,
      };
    });

  const fudeMajorStarsVi = getEffectiveMajorStars(chart, fude).map((s) =>
    translateStarName(s)
  );
  const fudeHasShaOrJi = fude.stars.some(
    (s) => s.type === 'sha' || s.siHua === '忌'
  );

  return {
    ownerLabel,
    palaceBranchVi: translateBranch(BRANCHES[fuqi.branch] || ''),
    majorStarsVi: majorStarsVi.length > 0 ? majorStarsVi : ['Vô Chính Diệu'],
    sihuaBadgesVi,
    marriageMinorStarsVi,
    deductionsVi,
    sihuaNotesVi,
    fudeMajorStarsVi:
      fudeMajorStarsVi.length > 0 ? fudeMajorStarsVi : ['Vô Chính Diệu'],
    fudeHasShaOrJi,
  };
}

function buildSunMoonAudit(chart: ZiweiChart, ownerLabel: string): SunMoonAuditItem {
  let sunPalace = chart.palaces[0];
  let sunStar = sunPalace.stars[0];
  let moonPalace = chart.palaces[0];
  let moonStar = moonPalace.stars[0];

  chart.palaces.forEach((p) => {
    p.stars.forEach((s) => {
      if (s.name === '太阳') {
        sunPalace = p;
        sunStar = s;
      }
      if (s.name === '太阴') {
        moonPalace = p;
        moonStar = s;
      }
    });
  });

  const sunBright = sunStar?.brightnessRaw ? translateBrightness(sunStar.brightnessRaw) : 'Bình';
  const moonBright = moonStar?.brightnessRaw ? translateBrightness(moonStar.brightnessRaw) : 'Bình';
  const sunSiHua = sunStar?.siHua ? `Hóa ${translateSiHua(sunStar.siHua)}` : undefined;
  const moonSiHua = moonStar?.siHua ? `Hóa ${translateSiHua(moonStar.siHua)}` : undefined;

  const isSunBright = ['庙', '旺', '得'].includes(sunStar?.brightnessRaw || '');
  const isMoonBright = ['庙', '旺', '得'].includes(moonStar?.brightnessRaw || '');

  let verdictVi = '';
  let isAuspicious = true;

  if (chart.birthInfo.gender === 'female') {
    if (sunStar?.siHua === '忌') {
      isAuspicious = false;
      verdictVi =
        'Nữ mệnh có Thái Dương Hóa Kỵ: Theo khẩu quyết《Thiên Kỷ》, cần đặc biệt lưu tâm sức khỏe của người chồng và tránh kết hôn quá sớm.';
    } else if (isSunBright) {
      verdictVi =
        'Nữ mệnh có Thái Dương Miếu/Vượng: Tượng “Vượng Phu Ích Tử”, người chồng có năng lực, quang minh lỗi lạc và dễ được nhờ chồng.';
    } else {
      verdictVi =
        'Nữ mệnh có Thái Dương ở cung độ trầm tĩnh: Trong hôn nhân nên chủ động san sẻ áp lực và bao dung cho người phối ngẫu.';
    }
  } else {
    if (moonStar?.siHua === '忌') {
      isAuspicious = false;
      verdictVi =
        'Nam mệnh có Thái Âm Hóa Kỵ: Nghê Sư nhấn mạnh dễ phát sinh bất đồng giữa mẹ và vợ (mâu thuẫn mẹ chồng – nàng dâu), nên ở riêng để giữ hòa khí.';
    } else if (isMoonBright) {
      verdictVi =
        'Nam mệnh có Thái Âm Miếu/Vượng: Tượng “Thê Hiền Nội Trợ”, dễ cưới được người vợ dịu dàng, đảm đang và vượng tài sản.';
    } else {
      verdictVi =
        'Nam mệnh có Thái Âm ở cung độ trầm tĩnh: Cần quan tâm nhiều hơn tới cảm xúc và sức khỏe tinh thần của người bạn đời.';
    }
  }

  return {
    ownerLabel,
    gender: chart.birthInfo.gender,
    sunPalaceVi: `${translatePalaceName(sunPalace.name)} (${translateBranch(
      BRANCHES[sunPalace.branch] || ''
    )})`,
    sunBrightnessVi: sunBright,
    sunSiHuaVi: sunSiHua,
    moonPalaceVi: `${translatePalaceName(moonPalace.name)} (${translateBranch(
      BRANCHES[moonPalace.branch] || ''
    )})`,
    moonBrightnessVi: moonBright,
    moonSiHuaVi: moonSiHua,
    verdictVi,
    isAuspicious,
  };
}

function computeFlyingSiHua(
  sourceChart: ZiweiChart,
  targetChart: ZiweiChart,
  sourceLabel: string,
  targetLabel: string
): FlyingSihuaImpact[] {
  const transforms = getSiHuaByStem(sourceChart.lunarInfo.yearStem);
  const list: FlyingSihuaImpact[] = [];

  (['禄', '权', '科', '忌'] as SiHua[]).forEach((sh) => {
    const starName = transforms[sh];
    if (!starName) return;

    const targetPalace = targetChart.palaces.find((p) =>
      p.stars.some((s) => s.name === starName)
    );
    if (!targetPalace) return;

    const shVi = translateSiHua(sh);
    const starVi = translateStarName(starName);
    const pNameVi = translatePalaceName(targetPalace.name);
    const branchVi = translateBranch(BRANCHES[targetPalace.branch] || '');

    const isCorePalace =
      targetPalace.isMingGong ||
      targetPalace.name.startsWith('夫妻') ||
      targetPalace.name.startsWith('福德') ||
      targetPalace.name.startsWith('财帛') ||
      targetPalace.name.startsWith('官禄') ||
      targetPalace.name.startsWith('田宅');

    let nature: 'positive' | 'caution' | 'neutral' = 'neutral';
    let interpretationVi = '';

    if (sh === '禄') {
      nature = 'positive';
      interpretationVi = `${sourceLabel} phi Hóa Lộc (${starVi}) nhập Cung ${pNameVi} của ${targetLabel}: Mang lại duyên lành, tài lộc và sự nâng đỡ ấm áp cho phương diện ${pNameVi} của ${targetLabel}.`;
    } else if (sh === '科') {
      nature = 'positive';
      interpretationVi = `${sourceLabel} phi Hóa Khoa (${starVi}) nhập Cung ${pNameVi} của ${targetLabel}: Chủ về sự tôn trọng, thấu hiểu lý tính và quý nhân tương trợ tại Cung ${pNameVi}.`;
    } else if (sh === '权') {
      nature = isCorePalace ? 'neutral' : 'neutral';
      interpretationVi = `${sourceLabel} phi Hóa Quyền (${starVi}) nhập Cung ${pNameVi} của ${targetLabel}: Đóng vai trò thúc đẩy, định hướng và chủ đạo trong phương diện ${pNameVi} của ${targetLabel}.`;
    } else {
      nature = isCorePalace ? 'caution' : 'neutral';
      if (targetPalace.isMingGong || targetPalace.name.startsWith('夫妻')) {
        interpretationVi = `${sourceLabel} phi Hóa Kỵ (${starVi}) nhập Cung ${pNameVi} của ${targetLabel}: Tượng “Duyên nợ tiền kiếp” — rất gắn bó nhưng dễ gây áp lực tâm lý hoặc đòi hỏi cao, cần học cách buông lỏng kiểm soát.`;
      } else {
        interpretationVi = `${sourceLabel} phi Hóa Kỵ (${starVi}) nhập Cung ${pNameVi} của ${targetLabel}: Cần lưu tâm giữ sự minh bạch và nhường nhịn nhau ở phương diện ${pNameVi}.`;
      }
    }

    list.push({
      siHua: sh,
      siHuaVi: shVi,
      starNameCn: starName,
      starNameVi: starVi,
      targetPalaceNameCn: targetPalace.name,
      targetPalaceNameVi: pNameVi,
      targetBranchVi: branchVi,
      nature,
      interpretationVi,
    });
  });

  return list;
}

export function analyzeDeterministicHeming(
  chartA: ZiweiChart,
  chartB: ZiweiChart
): DeterministicHemingReport {
  const nameA = chartA.birthInfo.name || 'Bên A';
  const nameB = chartB.birthInfo.name || 'Bên B';

  const mingA =
    chartA.palaces.find((p) => p.branch === chartA.mingGongBranch) || chartA.palaces[0];
  const mingB =
    chartB.palaces.find((p) => p.branch === chartB.mingGongBranch) || chartB.palaces[0];
  const fuqiA =
    chartA.palaces.find((p) => p.name.startsWith('夫妻')) || chartA.palaces[0];
  const fuqiB =
    chartB.palaces.find((p) => p.name.startsWith('夫妻')) || chartB.palaces[0];

  const mingStarsA = getEffectiveMajorStars(chartA, mingA);
  const mingStarsB = getEffectiveMajorStars(chartB, mingB);
  const fuqiStarsA = getEffectiveMajorStars(chartA, fuqiA);
  const fuqiStarsB = getEffectiveMajorStars(chartB, fuqiB);

  // Step 1: Nền tảng Mệnh Cách
  const grpA = classifyStarGroup(mingStarsA);
  const grpB = classifyStarGroup(mingStarsB);

  let compatibilityLabelVi = 'Tương Hợp Bổ Khuyết';
  let step1AnalysisVi = '';
  let basePoints = 3.5;

  if (grpA.code === 'SPL' && grpB.code === 'SPL') {
    compatibilityLabelVi = 'Song Hổ Tương Tranh (Cần Nhường Nhịn)';
    step1AnalysisVi =
      'Cả hai lá số đều thuộc cách Sát Phá Tham tại Mệnh: Cá tính đều mạnh mẽ, độc lập và quyết liệt. Khi đồng lòng có thể tạo đột phá lớn, nhưng trong đời sống thường nhật cần tránh tranh quyền quyết định.';
    basePoints = 3.0;
  } else if (grpA.code === grpB.code) {
    compatibilityLabelVi = 'Đồng Thanh Tương Ứng (Cùng Hệ Tinh Đẩu)';
    step1AnalysisVi = `Cả ${nameA} và ${nameB} đều thuộc hệ ${grpA.nameVi}, có thế giới quan, nhịp sống và chuẩn mực giá trị tương đồng, dễ dàng thấu hiểu suy nghĩ của nhau.`;
    basePoints = 4.2;
  } else if (
    (grpA.code === 'SPL' && grpB.code === 'JYTL') ||
    (grpA.code === 'JYTL' && grpB.code === 'SPL')
  ) {
    compatibilityLabelVi = 'Động Tĩnh Bổ Khuyết (Một Mở Đường – Một Giữ Vững)';
    step1AnalysisVi =
      'Một người thuộc nhóm Sát Phá Tham (tiên phong mở đường), người kia thuộc nhóm Cơ Nguyệt Đồng Lương (tham mưu giữ nhịp). Đây là cấu trúc bù trừ kinh điển nếu biết tôn trọng nhịp độ của đối phương.';
    basePoints = 3.8;
  } else {
    compatibilityLabelVi = 'Cương Nhu Phối Hợp Hài Hòa';
    step1AnalysisVi = `${nameA} (${grpA.nameVi}) và ${nameB} (${grpB.nameVi}) mang hai sắc thái bổ trợ lẫn nhau, một bên giữ đại cục, một bên linh hoạt ứng biến.`;
    basePoints = 4.0;
  }

  // Step 2: Đối chiếu Phu Thê 2 chiều (A <-> B)
  const sanFangMingA = getSanFangMajorStars(chartA, chartA.mingGongBranch);
  const sanFangMingB = getSanFangMajorStars(chartB, chartB.mingGongBranch);

  const aFuqiMatchesBMing = fuqiStarsA.some(
    (s) => mingStarsB.includes(s) || sanFangMingB.has(s)
  );
  const bFuqiMatchesAMing = fuqiStarsB.some(
    (s) => mingStarsA.includes(s) || sanFangMingA.has(s)
  );

  let matchLevel: 'two-way' | 'one-way' | 'complementary' | 'independent' = 'complementary';
  let matchBadgeVi = 'Tương Phối Bổ Trợ';
  let matchDetailVi = '';

  if (aFuqiMatchesBMing && bFuqiMatchesAMing) {
    matchLevel = 'two-way';
    matchBadgeVi = '★ Thiên Tác Chi Hợp (Phu Thê Tương Chiếu 2 Chiều)';
    matchDetailVi = `Chính tinh Cung Phu Thê của ${nameA} ứng trực tiếp với hệ Mệnh của ${nameB}, và ngược lại Cung Phu Thê của ${nameB} cũng ứng với hệ Mệnh của ${nameA}. Theo《Thiên Kỷ》của Nghê Hải Hạ, đây là dấu hiệu duyên tiền định sâu sắc nhất.`;
    basePoints += 0.8;
  } else if (aFuqiMatchesBMing || bFuqiMatchesAMing) {
    matchLevel = 'one-way';
    matchBadgeVi = 'Lương Duyên Tương Ứng (Ứng Hợp Tinh Hệ)';
    matchDetailVi = aFuqiMatchesBMing
      ? `Chính tinh Cung Phu Thê của ${nameA} trùng khớp với tinh hệ Mệnh/Tam phương của ${nameB} — ${nameB} chính là hình mẫu bạn đời trong tiềm thức của ${nameA}.`
      : `Chính tinh Cung Phu Thê của ${nameB} trùng khớp với tinh hệ Mệnh/Tam phương của ${nameA} — ${nameA} chính là hình mẫu bạn đời trong tiềm thức của ${nameB}.`;
    basePoints += 0.4;
  } else {
    matchDetailVi = `Cung Phu Thê của hai người mang tinh hệ độc lập với Chính tinh Mệnh đối phương, đòi hỏi sự chủ động lắng nghe và vun đắp từ cả hai phía cùng Cung Phúc Đức.`;
  }

  const auditA = buildFuqiAudit(chartA, nameA);
  const auditB = buildFuqiAudit(chartB, nameB);

  // Step 3: Thái Dương & Thái Âm
  const sunMoonA = buildSunMoonAudit(chartA, nameA);
  const sunMoonB = buildSunMoonAudit(chartB, nameB);
  if (!sunMoonA.isAuspicious) basePoints -= 0.3;
  if (!sunMoonB.isAuspicious) basePoints -= 0.3;

  // Step 4: Tứ Hóa Phi Hóa Tương Tác A <-> B
  const aToB = computeFlyingSiHua(chartA, chartB, nameA, nameB);
  const bToA = computeFlyingSiHua(chartB, chartA, nameB, nameA);

  const posCount = [...aToB, ...bToA].filter((x) => x.nature === 'positive').length;
  const cautionCount = [...aToB, ...bToA].filter((x) => x.nature === 'caution').length;

  let karmicBondTypeVi = 'Chính Duyên Tương Trợ (Lộc Khoa Hội Chiếu)';
  let karmicSummaryVi = '';
  if (cautionCount >= 2) {
    karmicBondTypeVi = 'Duyên Nợ Sâu Nặng (Hóa Kỵ Giao Chiếu — Cần Tu Dưỡng Nhường Nhịn)';
    karmicSummaryVi =
      'Cả hai chiều phi hóa đều có Hóa Kỵ chạm vào các cung trọng yếu của đối phương: Lực hút cảm xúc ban đầu rất mạnh nhưng dễ kèm theo sự khắt khe. Chìa khóa giữ gìn hạnh phúc là “bớt lời trách móc, tăng sự ghi nhận”.';
    basePoints -= 0.4;
  } else if (posCount >= 3) {
    karmicBondTypeVi = 'Phúc Lộc Tương Sinh (Hóa Lộc & Hóa Khoa Bổ Ích Hai Chiều)';
    karmicSummaryVi =
      'Tứ Hóa năm sinh của hai người khi phi nhập sang lá số đối phương tạo nhiều Hóa Lộc / Hóa Khoa tại các cung trọng yếu: Càng gắn bó lâu dài càng mang lại may mắn và quý nhân cho nhau.';
    basePoints += 0.4;
  } else {
    karmicBondTypeVi = 'Nhân Duyên Quân Bình (Lộc Quyền Khoa Kỵ Đan Xen)';
    karmicSummaryVi =
      'Tương tác Tứ Hóa giữa hai lá số có cả sự nâng đỡ (Lộc/Khoa) lẫn thử thách rèn giũa (Quyền/Kỵ), phản ánh mối quan hệ thực tế, trưởng thành qua sự thấu hiểu.';
  }

  // Step 5: Đại Hạn đồng bộ & Hợp tác kinh doanh
  const dxA =
    chartA.currentDaXianIndex >= 0 ? chartA.daXians[chartA.currentDaXianIndex] : chartA.daXians[0];
  const dxB =
    chartB.currentDaXianIndex >= 0 ? chartB.daXians[chartB.currentDaXianIndex] : chartB.daXians[0];

  const daxianAVi = dxA
    ? `Đại hạn ${dxA.startAge}–${dxA.endAge} tuổi (Cung ${translatePalaceName(dxA.palaceName)})`
    : 'Đồng hạn';
  const daxianBVi = dxB
    ? `Đại hạn ${dxB.startAge}–${dxB.endAge} tuổi (Cung ${translatePalaceName(dxB.palaceName)})`
    : 'Đồng hạn';

  const lateMarriageStars = new Set(['武曲', '廉贞', '七杀', '破军', '紫微']);
  const needLateMarriage =
    fuqiStarsA.some((s) => lateMarriageStars.has(s)) ||
    fuqiStarsB.some((s) => lateMarriageStars.has(s));

  const marriageTimingAdviceVi = needLateMarriage
    ? 'Cung Phu Thê có sao thuộc nhóm Cương tinh / Sát Phá Liêm Vũ: Cổ thư và《Thiên Kỷ》đều khuyên nên kết hôn muộn (sau 28–30 tuổi) hoặc trải qua thời gian tìm hiểu kỹ lưỡng để hóa giải tính hình khắc tiên thiên.'
    : 'Cung Phu Thê có tinh hệ ôn hòa: Thuận lợi kết hôn đúng độ tuổi trưởng thành khi Lưu niên gặp Hồng Loan, Thiên Hỷ hoặc Hóa Lộc chiếu nhập Phu Thê.';

  // Xét Hợp tác kinh doanh (Quan Lộc + Huynh Đệ/Nô Bộc)
  const businessDetailsVi: string[] = [];
  let businessScore = 4;

  const xiongdiA = chartA.palaces.find((p) => p.name.startsWith('兄弟') || p.name.startsWith('交友'));
  const xiongdiB = chartB.palaces.find((p) => p.name.startsWith('兄弟') || p.name.startsWith('交友'));
  const hasJumenInFriends =
    xiongdiA?.stars.some((s) => s.name === '巨门') ||
    xiongdiB?.stars.some((s) => s.name === '巨门');

  if (hasJumenInFriends) {
    businessScore -= 1;
    businessDetailsVi.push(
      'Cung Huynh Đệ / Nô Bộc có sao Cự Môn: Theo khẩu quyết Nghê Hải Hạ, nếu hùn vốn làm ăn chung bắt buộc phải có hợp đồng phân chia cổ phần và quyền hạn thật minh bạch để tránh khẩu thiệt thị phi.'
    );
  } else {
    businessDetailsVi.push(
      'Cung Huynh Đệ & Quan Lộc không phạm cách Cự Môn Hóa Kỵ xung phá: Có nền tảng tin cậy để đồng hành trong công việc.'
    );
  }

  const luIntoWealthOrCareer = [...aToB, ...bToA].filter(
    (x) =>
      x.siHua === '禄' &&
      (x.targetPalaceNameCn.startsWith('财帛') ||
        x.targetPalaceNameCn.startsWith('官禄') ||
        x.targetPalaceNameCn.startsWith('田宅'))
  );
  if (luIntoWealthOrCareer.length > 0) {
    businessScore = Math.min(5, businessScore + 1);
    luIntoWealthOrCareer.forEach((x) => {
      businessDetailsVi.push(`★ Điểm cộng hợp tác lớn: ${x.interpretationVi}`);
    });
  }

  const jiIntoWealthOrCareer = [...aToB, ...bToA].filter(
    (x) =>
      x.siHua === '忌' &&
      (x.targetPalaceNameCn.startsWith('财帛') || x.targetPalaceNameCn.startsWith('官禄'))
  );
  if (jiIntoWealthOrCareer.length > 0) {
    businessScore = Math.max(2, businessScore - 1);
    businessDetailsVi.push(
      'Lưu ý tài chính khi hợp tác: Có Hóa Kỵ phi nhập cung Tài Bạch / Quan Lộc đối phương — nên tách bạch sổ sách tài chính, một người chuyên môn, một người quản trị dòng tiền.'
    );
  }

  const finalStars = Math.max(2, Math.min(5, Math.round(basePoints)));
  const scoreTitleMap: Record<number, string> = {
    5: 'Ngũ Tinh Lương Duyên — Thiên Tác Chi Hợp (5/5 Sao)',
    4: 'Tứ Tinh Giai Phối — Tâm Đầu Ý Hợp (4/5 Sao)',
    3: 'Tam Tinh Tương Dung — Động Tĩnh Bù Trừ (3/5 Sao)',
    2: 'Nhị Tinh Thử Thách — Cần Tu Dưỡng & Nhường Nhịn (2/5 Sao)',
  };

  const scoreTitleVi = scoreTitleMap[finalStars] || scoreTitleMap[4];
  const scoreSummaryVi = `${matchBadgeVi} • ${karmicBondTypeVi}. ${step1AnalysisVi}`;

  const promptContextTextVi = [
    `=== KẾT QUẢ ĐỐI CHIẾU THUẬT TOÁN HỢP BÀN 5 BƯỚC (${nameA} & ${nameB}) ===`,
    `- Điểm tương hợp thuật toán: ${finalStars}/5 sao (${scoreTitleVi})`,
    `- Bước 1 (Nền tảng Mệnh Cách): ${nameA} thuộc nhóm ${grpA.nameVi}; ${nameB} thuộc nhóm ${grpB.nameVi} -> ${compatibilityLabelVi}.`,
    `- Bước 2 (Đối chiếu Phu Thê 2 chiều): ${matchBadgeVi} — ${matchDetailVi}`,
    `- Bước 3 (Nhật Nguyệt Tinh Tượng): ${nameA}: ${sunMoonA.verdictVi} | ${nameB}: ${sunMoonB.verdictVi}`,
    `- Bước 4 (Phi Hóa Tương Tác A↔B): ${karmicBondTypeVi}.`,
    ...aToB.map((x) => `  • [A→B] ${x.interpretationVi}`),
    ...bToA.map((x) => `  • [B→A] ${x.interpretationVi}`),
    `- Bước 5 (Vận hạn & Hợp tác kinh doanh): ${nameA} đang ở ${daxianAVi}; ${nameB} đang ở ${daxianBVi}. Điểm hợp tác sự nghiệp: ${businessScore}/5.`,
  ].join('\n');

  return {
    overallScore: finalStars,
    scoreTitleVi,
    scoreSummaryVi,
    step1Foundation: {
      groupAVi: grpA.nameVi,
      groupBVi: grpB.nameVi,
      mingStarsAVi: mingStarsA.map((s) => translateStarName(s)),
      mingStarsBVi: mingStarsB.map((s) => translateStarName(s)),
      compatibilityLabelVi,
      analysisVi: step1AnalysisVi,
    },
    step2FuqiCross: {
      matchLevel,
      matchBadgeVi,
      matchDetailVi,
      auditA,
      auditB,
    },
    step3SunMoon: {
      itemA: sunMoonA,
      itemB: sunMoonB,
    },
    step4FlyingSiHua: {
      stemAVi: translateStem(STEMS[chartA.lunarInfo.yearStem] || ''),
      stemBVi: translateStem(STEMS[chartB.lunarInfo.yearStem] || ''),
      aToB,
      bToA,
      karmicBondTypeVi,
      karmicSummaryVi,
    },
    step5DaxianAndBusiness: {
      daxianAVi,
      daxianBVi,
      marriageTimingAdviceVi,
      businessScore,
      businessVerdictVi:
        businessScore >= 4
          ? 'Rất thuận lợi để đồng hành phát triển sự nghiệp & tích lũy tài sản chung'
          : 'Phù hợp hỗ trợ tinh thần; nếu hùn vốn kinh doanh cần phân định rõ vai trò tài chính',
      businessDetailsVi,
    },
    promptContextTextVi,
  };
}
