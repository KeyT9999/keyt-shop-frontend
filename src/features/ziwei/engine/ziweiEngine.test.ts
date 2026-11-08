import { describe, it, expect } from 'vitest';
import { calculateTrueSolarTime } from './true-solar-time';
import { generateChart } from './algorithm';
import { detectPatterns } from './patterns';
import { formToBirthInfo } from './share';
import { SCHOOL_DEFAULT_CONFIG } from './school-config';
import { computeSchoolChartDiff } from '../components/SchoolConfigModal';
import {
  THIRTEEN_DIMENSIONS_META,
  buildDeterministicDimensionReading,
} from './thirteen-dimensions';
import { analyzeDeterministicHeming } from './heming-analyzer';
import { getChildhoodYears, getDaXianYears } from './yunxian-context';
import { buildAllSelfSihua, getDaXianSiHua, getLiuNianSiHua } from './sihua';
import {
  translateStarName,
  translatePalaceName,
  localizePattern,
  buildVietnameseChartSummaryText,
} from '../utils/ziweiLocalization';

describe('Ziwei Dou Shu Core Engine & 6-Pillar Advanced Capabilities', () => {
  it('calculates True Solar Time accurately for Vietnam timezone (UTC+7 / 105°E meridian)', () => {
    const res = calculateTrueSolarTime({
      year: 1998,
      month: 6,
      day: 15,
      clockHour: 9,
      clockMinute: 30,
      longitude: 105.85,
      utcOffsetMinutes: 420,
    });

    expect(res.dateValid).toBe(true);
    expect(res.corrected).toBe(true);
    expect(res.longitudeCorrectionMinutes).toBeCloseTo(3.4, 2);
    expect(res.branch).toBe(5); // Giờ Tỵ (09:00 - 11:00)
  });

  it('generates a complete 12-palace Ziwei chart with DaXian, WuxingJu and Four Pillars', () => {
    const birthInfo = formToBirthInfo({
      name: 'Nguyễn Văn A',
      year: '1990',
      month: '5',
      day: '20',
      clockHour: '10',
      clockMinute: '15',
      unknownTime: false,
      gender: 'male',
      province: 'Miền Bắc',
      city: 'Hà Nội',
      longitude: 105.85,
      utcOffsetMinutes: 420,
      calendarType: 'solar',
    });

    const chart = generateChart(birthInfo);

    expect(chart.palaces).toHaveLength(12);
    expect(chart.daXians.length).toBeGreaterThanOrEqual(8);
    expect(chart.wuxingJu).toBeGreaterThanOrEqual(2);
    expect(chart.wuxingJu).toBeLessThanOrEqual(6);
    expect(chart.mingZhu).toBeTruthy();
    expect(chart.shenZhu).toBeTruthy();

    const mingPalace = chart.palaces.find((p) => p.isMingGong);
    expect(mingPalace).toBeDefined();
    expect(mingPalace?.branch).toBe(chart.mingGongBranch);
  });

  it('detects classical patterns and localizes all terms into Vietnamese accurately', () => {
    const chart = generateChart({
      year: 1971,
      month: 6,
      day: 28,
      hour: 4,
      gender: 'male',
      name: 'Elon Musk',
    });

    const patterns = detectPatterns(chart);
    expect(Array.isArray(patterns)).toBe(true);

    if (patterns.length > 0) {
      const localized = localizePattern(patterns[0]);
      expect(localized.nameVi).toBeTruthy();
      expect(localized.descriptionVi).toBeTruthy();
    }

    expect(translateStarName('紫微')).toBe('Tử Vi');
    expect(translateStarName('破军')).toBe('Phá Quân');
    expect(translatePalaceName('夫妻宫')).toBe('Phu Thê');
    expect(translatePalaceName('官禄')).toBe('Quan Lộc');

    const summary = buildVietnameseChartSummaryText(chart, patterns);
    expect(summary).toContain('=== THÔNG TIN ĐƯƠNG SỐ ===');
    expect(summary).toContain('=== MƯỜI HAI CUNG TRÊN LÁ SỐ ===');
    expect(summary).toContain('Cung Mệnh');
    expect(summary).toContain('Cung Phu Thê');
  });

  it('computes Before/After chart diffs across the 10-Group School Configuration', () => {
    // Tahun 1990 (Canh Ngọ - Geng Year)
    const birthInfo = {
      year: 1990,
      month: 6,
      day: 15,
      hour: 5,
      gender: 'male' as const,
      name: 'Test Canh Ngọ',
    };

    const defaultChart = generateChart(birthInfo, SCHOOL_DEFAULT_CONFIG);
    const zhongzhouChart = generateChart(birthInfo, {
      ...SCHOOL_DEFAULT_CONFIG,
      brightnessSchool: 'ZZ',
      gengYearSihua: 'GYWTY',
      tianmaSchool: 'month-branch',
    });

    const diffs = computeSchoolChartDiff(defaultChart, zhongzhouChart);
    expect(diffs.length).toBeGreaterThan(0);
    // Geng-year SiHua change between GYWYT and GYWTY must be detected
    expect(diffs.some((d) => d.category === 'sihua')).toBe(true);
  });

  it('generates deterministic rule-based readings for all 13 dimensions with Tianji corpus matching', () => {
    const chart = generateChart({
      year: 1998,
      month: 6,
      day: 15,
      hour: 5,
      gender: 'male',
      name: 'Đương Số Test',
    });

    expect(THIRTEEN_DIMENSIONS_META).toHaveLength(13);

    for (const dim of THIRTEEN_DIMENSIONS_META) {
      const reading = buildDeterministicDimensionReading(chart, dim.key);
      expect(reading.topicKey).toBe(dim.key);
      expect(reading.headlineVi.length).toBeGreaterThan(10);
      expect(reading.coreAnalysisBulletsVi.length).toBeGreaterThan(0);
      expect(reading.chartEvidenceBulletsVi.length).toBeGreaterThanOrEqual(2);
      if (dim.key === 'health') {
        expect(reading.tcmOrganNoteVi).toBeDefined();
      }
    }
  });

  it('executes the 5-step 2-way synastry analyzer (Heming A <-> B) and multi-layer Yunxian timeline', () => {
    const chartA = generateChart({
      year: 1995,
      month: 4,
      day: 12,
      hour: 4,
      gender: 'male',
      name: 'Nam A',
    });
    const chartB = generateChart({
      year: 1998,
      month: 8,
      day: 15,
      hour: 5,
      gender: 'female',
      name: 'Nữ B',
    });

    const report = analyzeDeterministicHeming(chartA, chartB);
    expect(report.overallScore).toBeGreaterThanOrEqual(1);
    expect(report.overallScore).toBeLessThanOrEqual(5);
    expect(report.step4FlyingSiHua.aToB.length).toBe(4);
    expect(report.step4FlyingSiHua.bToA.length).toBe(4);
    expect(report.step5DaxianAndBusiness.businessDetailsVi.length).toBeGreaterThan(0);

    // Multi-layer Yunxian & SiHua
    const dxYears = getDaXianYears(chartA, 0);
    expect(dxYears).toHaveLength(10);
    const childhoodYears = getChildhoodYears(chartA);
    expect(Array.isArray(childhoodYears)).toBe(true);
    expect(getDaXianSiHua(chartA, 0)).not.toBeNull();
    expect(getLiuNianSiHua(2026).transforms.禄).toBeTruthy();
    expect(typeof buildAllSelfSihua(chartA)).toBe('object');
  });
});
