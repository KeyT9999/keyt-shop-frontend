import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_USER_5DAY_SPLIT,
  GYM_EXERCISE_CATALOG,
  GYM_EXERCISE_MAP,
} from '../data/defaultGymCatalog';
import {
  computeSessionEnergyStats,
  computeSmartSetRecommendation,
  resolveCycleStatus,
} from '../utils/gymCycleAndProgressionUtils';
import {
  createDefaultCycleTracking,
  createDefaultFemaleBodyProfile,
  resolveExercisesForDay,
} from '../utils/gymStateUtils';
import FemaleCycleAndProfileModal from './FemaleCycleAndProfileModal';
import GymAiCoachDrawer from './GymAiCoachDrawer';
import GymExerciseSubstituteModal from './GymExerciseSubstituteModal';
import GymNeonHeroDashboard from './GymNeonHeroDashboard';

describe('GymNeonHeroDashboard & Female Gym Modals (Dark Charcoal #111114 & Neon Pink #FF5C8A)', () => {
  it('renders Progress header, WORKOUT hero, 3 neon pillar cards and triggers modals', () => {
    const profile = {
      ...createDefaultFemaleBodyProfile(),
      nickname: 'Quỳnh Anh',
      heightCm: 162,
      weightKg: 50,
      waistCm: 62,
      hipCm: 93,
    };
    const cycle = createDefaultCycleTracking();
    const activeDay = DEFAULT_USER_5DAY_SPLIT[0];
    const dayExercises = resolveExercisesForDay(activeDay);
    const currentExercise = dayExercises[0] || GYM_EXERCISE_CATALOG[0];

    const cycleStatus = resolveCycleStatus(cycle, currentExercise);
    const setRec = computeSmartSetRecommendation(currentExercise, undefined, cycleStatus);
    const sessionStats = computeSessionEnergyStats(dayExercises, [currentExercise.id], profile);

    const onOpenCycle = vi.fn();
    const onOpenSub = vi.fn();
    const onOpenAi = vi.fn();

    render(
      <GymNeonHeroDashboard
        userProfile={profile}
        cycleStatus={cycleStatus}
        sessionStats={sessionStats}
        setRecommendation={setRec}
        days={DEFAULT_USER_5DAY_SPLIT}
        activeDay={activeDay}
        currentExercise={currentExercise}
        workoutStreak={5}
        onSelectDay={vi.fn()}
        onOpenCycleProfileModal={onOpenCycle}
        onOpenSubstituteModal={onOpenSub}
        onOpenAiCoachDrawer={onOpenAi}
        onOpenCustomizerModal={vi.fn()}
      />
    );

    expect(screen.getByText('Progress')).toBeTruthy();
    expect(screen.getByText('WORKOUT')).toBeTruthy();
    expect(screen.getByText('Quỳnh Anh')).toBeTruthy();
    expect(screen.getAllByText(/62\/93/).length).toBeGreaterThanOrEqual(2);

    fireEvent.click(screen.getByRole('button', { name: /Đổi bài 0đ/i }));
    expect(onOpenSub).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Chu kỳ & Số đo/i }));
    expect(onOpenCycle).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Tư vấn TT Cá Nhân/i }));
    expect(onOpenAi).toHaveBeenCalledTimes(1);
  });

  it('allows updating female body metrics, menstrual phase, and applying female glute preset', () => {
    const onSaveProfile = vi.fn();
    const onSaveCycle = vi.fn();
    const onApplyPreset = vi.fn();

    render(
      <FemaleCycleAndProfileModal
        open={true}
        userProfile={createDefaultFemaleBodyProfile()}
        cycleTracking={createDefaultCycleTracking()}
        onClose={vi.fn()}
        onSaveProfile={onSaveProfile}
        onSaveCycle={onSaveCycle}
        onApplyPresetDays={onApplyPreset}
      />
    );

    fireEvent.change(screen.getByLabelText(/Tên \/ Biệt danh/i), {
      target: { value: 'Quỳnh Anh' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kỳ Dâu/i }));
    fireEvent.click(screen.getByRole('button', { name: /Đau bụng dưới/i }));
    fireEvent.click(
      screen.getByRole('button', { name: /Nạp Lịch Độ Mông Đào S-Line/i })
    );
    expect(onApplyPreset).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole('button', { name: /Lưu Hồ Sơ & Áp Dụng Ngay/i })
    );
    expect(onSaveProfile).toHaveBeenCalledWith(
      expect.objectContaining({ nickname: 'Quỳnh Anh' })
    );
    expect(onSaveCycle).toHaveBeenCalledWith(
      expect.objectContaining({
        manualPhaseOverride: 'menstrual',
        todaySymptoms: ['cramps'],
      })
    );
  });

  it('renders smart 0-cost exercise substitutes and swaps exercise on click', () => {
    const onSelectSubstitute = vi.fn();
    const onSetRestriction = vi.fn();

    render(
      <GymExerciseSubstituteModal
        open={true}
        currentExercise={GYM_EXERCISE_MAP.barbell_squat}
        currentDayExerciseIds={['barbell_squat']}
        restrictions={[]}
        userProfile={createDefaultFemaleBodyProfile()}
        isDeloadOrPeriod={true}
        onClose={vi.fn()}
        onSelectSubstitute={onSelectSubstitute}
        onSetRestriction={onSetRestriction}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Máy đang có người tập/i })
    );
    expect(onSetRestriction).toHaveBeenCalledWith('barbell_squat', 'busy');

    const swapButtons = screen.getAllByRole('button', {
      name: /Đổi sang bài này/i,
    });
    expect(swapButtons.length).toBeGreaterThan(0);
    fireEvent.click(swapButtons[0]);
    expect(onSelectSubstitute).toHaveBeenCalledTimes(1);
  });

  it('renders GymAiCoachDrawer with user metrics summary and quick prompts', () => {
    const profile = {
      ...createDefaultFemaleBodyProfile(),
      nickname: 'Quỳnh Anh',
      heightCm: 162,
      weightKg: 50,
      waistCm: 62,
      hipCm: 93,
    };
    const cycle = createDefaultCycleTracking();
    const activeDay = DEFAULT_USER_5DAY_SPLIT[0];
    const currentExercise = GYM_EXERCISE_MAP.machine_hip_thrust;
    const cycleStatus = resolveCycleStatus(cycle, currentExercise);

    render(
      <GymAiCoachDrawer
        open={true}
        token={null}
        userProfile={profile}
        cycleTracking={cycle}
        cycleStatus={cycleStatus}
        activeDay={activeDay}
        currentExercise={currentExercise}
        customDays={DEFAULT_USER_5DAY_SPLIT}
        exerciseLogs={{}}
        workoutStreak={3}
        chatHistory={[]}
        onClose={vi.fn()}
        onAppendMessages={vi.fn()}
        onClearHistory={vi.fn()}
        onApplyPresetDays={vi.fn()}
        onOpenProfileModal={vi.fn()}
      />
    );

    expect(screen.getByText('KeyT AI Coach')).toBeTruthy();
    expect(screen.getAllByText(/162cm • 50kg/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Eo\/Mông: 62\/93cm/)).toBeTruthy();
  });
});
