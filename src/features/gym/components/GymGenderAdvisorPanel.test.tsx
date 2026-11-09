import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GymGenderAdvisorPanel from './GymGenderAdvisorPanel';
import {
  createDefaultCycleTracking,
  createDefaultFemaleBodyProfile,
} from '../utils/gymStateUtils';

afterEach(() => {
  cleanup();
});

describe('GymGenderAdvisorPanel', () => {
  it('renders Male questionnaire on /gym/nam and shows single detailed 3D exercise + meal plan on submit', () => {
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

    expect(screen.getByLabelText(/Vòng ngực \(cm\)/i)).toBeTruthy();
    expect(screen.getByLabelText(/Bắp tay \(cm\)/i)).toBeTruthy();

    const submitBtn = screen.getByRole('button', {
      name: /PHÂN TÍCH NAM GIỚI & ĐỀ XUẤT BÀI TẬP \+ ĂN UỐNG NGAY/i,
    });
    fireEvent.click(submitBtn);

    expect(onSaveProfile).toHaveBeenCalled();
    expect(
      screen.getByText(/1\. Đề Xuất Bài Tập Trọng Tâm Cho Bạn/i)
    ).toBeTruthy();
    expect(screen.getByText(/Bài 1\/6/i)).toBeTruthy();

    const nextBtn = screen.getByRole('button', {
      name: /Tập Xong • Qua Bài 2 \(Next\)/i,
    });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/Bài 2\/6/i)).toBeTruthy();

    expect(
      screen.getByText(/2\. Đề Xuất Chế Độ Ăn Uống & Thực Đơn 4 Bữa Trong Ngày/i)
    ).toBeTruthy();
  });

  it('renders Female questionnaire on /gym/nu and triggers route switch when clicking GYM NAM', () => {
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

    expect(screen.getByLabelText(/Vòng eo V2 \(cm\)/i)).toBeTruthy();
    expect(screen.getByLabelText(/Vòng mông V3 \(cm\)/i)).toBeTruthy();

    const maleTab = screen.getByRole('tab', { name: /GYM NAM \(\/gym\/nam\)/i });
    fireEvent.click(maleTab);
    expect(onSelectGenderRoute).toHaveBeenCalledWith('male');
  });
});
