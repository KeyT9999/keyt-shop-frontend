import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GymGenderAdvisorPanel from './GymGenderAdvisorPanel';
import GymProgressHistoryModal from './GymProgressHistoryModal';
import {
  createDefaultCycleTracking,
  createDefaultFemaleBodyProfile,
} from '../utils/gymStateUtils';

afterEach(() => {
  cleanup();
});

describe('GymGenderAdvisorPanel — Clean Light Sport 4-Tab Mobile-First UI', () => {
  it('opens immediately on Tập Hôm Nay workout view, navigates exercises, and saves Male profile in Hồ Sơ tab', () => {
    const onSelectGenderRoute = vi.fn();
    const onSaveProfile = vi.fn();
    const onSaveCycle = vi.fn();
    const onApplyRecommendedSplit = vi.fn();
    const onSelectExerciseFor3D = vi.fn();

    render(
      <GymGenderAdvisorPanel
        activeGender="male"
        userProfile={{ ...createDefaultFemaleBodyProfile(), gender: 'male' }}
        cycleTracking={createDefaultCycleTracking()}
        onSelectGenderRoute={onSelectGenderRoute}
        onSaveProfile={onSaveProfile}
        onSaveCycle={onSaveCycle}
        onApplyRecommendedSplit={onApplyRecommendedSplit}
        onSelectExerciseFor3D={onSelectExerciseFor3D}
        onOpenAiCoachDrawer={vi.fn()}
      />
    );

    // 1. Opens cleanly on Workout tab without form clutter blocking the workout
    expect(screen.getByText(/^Bài 1\/6$/i)).toBeTruthy();

    const nextBtn = screen.getByRole('button', {
      name: /Tập xong • Qua bài 2/i,
    });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/^Bài 2\/6$/i)).toBeTruthy();

    // 2. Switch to Hồ Sơ & Mục Tiêu tab -> renders Male measurements & saves back to Workout tab
    const profileTabBtns = screen.getAllByRole('button', {
      name: /Hồ Sơ & Mục Tiêu|Hồ sơ/i,
    });
    fireEvent.click(profileTabBtns[0]);

    expect(screen.getByLabelText(/Vòng ngực \(cm\)/i)).toBeTruthy();
    expect(screen.getByLabelText(/Bắp tay \(cm\)/i)).toBeTruthy();

    const submitBtn = screen.getByRole('button', {
      name: /Lưu Hồ Sơ & Cập Nhật Lộ Trình/i,
    });
    fireEvent.click(submitBtn);

    expect(onSaveProfile).toHaveBeenCalled();
    expect(onApplyRecommendedSplit).toHaveBeenCalled();
    expect(screen.getAllByText(/Bài 1\/6/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders Female profile in Hồ Sơ tab on /gym/nu and triggers clean route switch when clicking Gym Nam', () => {
    const onSelectGenderRoute = vi.fn();

    render(
      <GymGenderAdvisorPanel
        activeGender="female"
        userProfile={createDefaultFemaleBodyProfile()}
        cycleTracking={createDefaultCycleTracking()}
        onSelectGenderRoute={onSelectGenderRoute}
        onSaveProfile={vi.fn()}
        onSaveCycle={vi.fn()}
        onApplyRecommendedSplit={vi.fn()}
        onSelectExerciseFor3D={vi.fn()}
        onOpenAiCoachDrawer={vi.fn()}
      />
    );

    const profileTabBtns = screen.getAllByRole('button', {
      name: /Hồ Sơ & Mục Tiêu|Hồ sơ/i,
    });
    fireEvent.click(profileTabBtns[0]);

    expect(screen.getByLabelText(/Vòng eo V2 \(cm\)/i)).toBeTruthy();
    expect(screen.getByLabelText(/Vòng mông V3 \(cm\)/i)).toBeTruthy();

    const maleTab = screen.getByRole('tab', { name: /^Gym Nam$/i });
    fireEvent.click(maleTab);
    expect(onSelectGenderRoute).toHaveBeenCalledWith('male');
  });

  it('supports Hevy-style Set-by-Set checkoff, Plate Calculator, Thực Đơn Water tracker, and savedGenderDays Single Source of Truth', () => {
    const onSaveExerciseLog = vi.fn();
    const onAddWater = vi.fn();

    render(
      <GymGenderAdvisorPanel
        activeGender="male"
        savedGenderDays={[
          {
            id: 'm_session_1',
            dayLabel: 'Buổi 1',
            title: 'Ngực Custom',
            subtitle: 'Test',
            exerciseIds: ['brtw_incline_chest_press', 'pec_deck_fly'],
          },
        ]}
        userProfile={{ ...createDefaultFemaleBodyProfile(), gender: 'male' }}
        cycleTracking={createDefaultCycleTracking()}
        onSelectGenderRoute={vi.fn()}
        onSaveProfile={vi.fn()}
        onSaveCycle={vi.fn()}
        onApplyRecommendedSplit={vi.fn()}
        onSelectExerciseFor3D={vi.fn()}
        onSaveExerciseLog={onSaveExerciseLog}
        onAddWaterIntakeMl={onAddWater}
        onOpenAiCoachDrawer={vi.fn()}
      />
    );

    // Renders persisted 2-exercise day from savedGenderDays ("Bài 1/2")
    expect(screen.getByText(/Bài 1\/2/i)).toBeTruthy();

    // Ticking Set 1 triggers onSaveExerciseLog with setsDetail & auto-starts rest timer
    const set1Btn = screen.getByRole('button', { name: /Hiệp 1/i });
    fireEvent.click(set1Btn);
    expect(onSaveExerciseLog).toHaveBeenCalledWith(
      'brtw_incline_chest_press',
      expect.any(Number),
      expect.stringContaining('1/'),
      expect.any(String),
      expect.objectContaining({
        setsCompletedToday: [1],
      })
    );

    // Plate Calculator button opens plate breakdown for BRTW plate-loaded machine
    const plateBtn = screen.getByRole('button', { name: /Tính bánh tạ mỗi bên/i });
    fireEvent.click(plateBtn);
    expect(screen.getByText(/Mỗi bên lắp/i)).toBeTruthy();

    // Switch to Thực Đơn tab -> Water +250ml button triggers callback
    const nutritionTabBtns = screen.getAllByRole('button', {
      name: /^Thực Đơn$|^Thực đơn$/i,
    });
    fireEvent.click(nutritionTabBtns[0]);
    expect(screen.getByText(/Thực đơn gợi ý 4 bữa chuẩn Việt Nam/i)).toBeTruthy();

    const waterPlusBtn = screen.getByRole('button', { name: /Thêm 250ml nước/i });
    fireEvent.click(waterPlusBtn);
    expect(onAddWater).toHaveBeenCalledWith(250);
  });

  it('renders GymProgressHistoryModal (both modal & inline Tiến Độ tab) with celebration banner, PR/1RM table, and records body metrics', () => {
    const onRecordMetrics = vi.fn();

    render(
      <GymProgressHistoryModal
        open={true}
        gender="female"
        workoutStreak={6}
        userProfile={{
          ...createDefaultFemaleBodyProfile(),
          weightKg: 50,
          waistCm: 62,
          hipCm: 93,
        }}
        exerciseLogs={{
          machine_hip_thrust: {
            exerciseId: 'machine_hip_thrust',
            weightKg: 35,
            personalRecordKg: 40,
            estimated1RM: 53.3,
            seatPinNote: 'Đệm lưng nấc 2',
            repsNote: '4x12',
            personalTip: '',
            updatedAtMs: 2000,
          },
        }}
        workoutHistory={[
          {
            id: 'wh_1',
            dateKey: '2026-11-10',
            gender: 'female',
            dayId: 'f_session_1',
            dayTitle: 'Buổi 1: Độ Mông Đào',
            durationMinutes: 45,
            totalVolumeKg: 3200,
            completedExercisesCount: 6,
            caloriesBurned: 240,
            prCount: 1,
            prHighlights: ['Đẩy Hông Máy: 40kg'],
            createdAtMs: 2000,
          },
        ]}
        celebrationSession={{
          id: 'wh_1',
          dateKey: '2026-11-10',
          gender: 'female',
          dayId: 'f_session_1',
          dayTitle: 'Buổi 1: Độ Mông Đào',
          durationMinutes: 45,
          totalVolumeKg: 3200,
          completedExercisesCount: 6,
          caloriesBurned: 240,
          prCount: 1,
          prHighlights: ['Đẩy Hông Máy: 40kg'],
          createdAtMs: 2000,
        }}
        onRecordTodayBodyMetrics={onRecordMetrics}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Hoàn Thành Xuất Sắc: Buổi 1: Độ Mông Đào/i)).toBeTruthy();
    expect(screen.getByText(/PR 40kg/i)).toBeTruthy();
    expect(screen.getByText(/1RM ~53.3kg/i)).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', { name: /Lưu mốc cân đo hôm nay/i })
    );
    expect(onRecordMetrics).toHaveBeenCalledTimes(1);
  });
});
