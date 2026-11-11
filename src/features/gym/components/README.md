# Module `features/gym` – KeyT Gym Coach (Clean Light Sport 4-Tab Mobile App)

## Kiến trúc Phong cách A — Clean Light Sport (`/gym`, `/gym/nam`, `/gym/nu`)
Ứng dụng sổ tay phòng tập tối ưu trải nghiệm điện thoại & máy tính theo chuẩn **KeyT Design System** (`#F8FAFC` nền sáng thoáng, `#FFFFFF` thẻ sạch, `#F05A28` Brand Orange, `#1E293B` Brand Navy, `#16A34A` Emerald hoàn thành):

1. **`GymGenderAdvisorPanel.tsx` (4-Tab App Shell & Focus Workout Player):**
   - Thanh điều hướng **4 Tab** chuẩn ứng dụng thể thao hiện đại (Fixed Bottom Tab Bar trên mobile `<768px`, Segmented Top Tabs trên desktop `>=768px`):
     1. **`Tập Hôm Nay` (`workout`):** Danh sách bài tập kèm ảnh thật sắc nét + màn hình **Focus Workout Player** (ưu tiên ảnh máy thực tế / 2 tư thế, tùy chọn `Mô phỏng 3D` chỉ khi cần xoay xem cơ, không nhồi 6 mô hình 3D cùng lúc).
     2. **`Thực Đơn` (`GymNutritionTabView.tsx`):** Thẻ mục tiêu Calo & 3 nhóm chất (Đạm, Tinh bột, Chất béo), theo dõi uống nước tương tác (`±250ml`) và 4 bữa ăn chuẩn Việt Nam.
     3. **`Tiến Độ` (`GymProgressHistoryModal.tsx` chế độ `inline` & `modal`):** Smart Streak, bảng kỷ lục cá nhân PR & 1RM (Epley), nhật ký cân đo hình thể theo tuần và lịch sử buổi tập.
     4. **`Hồ Sơ & Mục Tiêu` (`GymProfileSetupTabView.tsx`):** Chỉ số cơ thể riêng biệt cho Nam (`/gym/nam`) và Nữ (`/gym/nu`), theo dõi 4 pha chu kỳ kinh nguyệt, bảo vệ khớp vai/lưng/gối và nút tùy chỉnh lịch tập.
   - Đồng bộ Single Source of Truth với `maleCustomDays` và `femaleCustomDays`.

2. **`GymInlineMetricsTools.tsx` (Hevy / Strong Style Vertical Set Table):**
   - Bảng tích từng hiệp dọc (`Hiệp | Mức tạ | Mục tiêu | Hoàn thành`) với vùng chạm lớn `40px–44px` dễ bấm bằng 1 ngón cái tại phòng tập.
   - Đồng hồ nghỉ dựa trên **Timestamp (`endAtMs - Date.now()`)** chống trôi giây khi khóa màn hình điện thoại, kèm chuông + rung và `WakeLock`.
   - Công cụ **Tính bánh tạ mỗi bên (Plate Calculator)**, ghi nhớ nấc ghế (`seatPinNote`) và hiển thị `PR` + `1RM`.

3. **`RealGymMachineView.tsx`, `ExerciseReferenceDualView.tsx` & `GymMannequin3DViewer.tsx`:**
   - Sân khấu trực quan sáng rõ (`#F1F5F9` studio 3D, ảnh chụp thực tế 38 máy BRTW & Impulse kèm nút nhanh `Xoay 3D`).

4. **`GymExerciseSubstituteModal.tsx`, `SplitCustomizerModal.tsx` & `GymAiCoachDrawer.tsx`:**
   - Đồng bộ 100% giao diện **Clean Light Sport**; trên mobile ẩn bong bóng nổi khi đóng để không bao giờ che khuất thanh điều hướng đáy (mở nhanh qua nút `Hỏi AI` trên thanh tiêu đề).

## Feature Flag (Kill Switch)
- Frontend: `VITE_ENABLE_GYM_COACH=false` trong `.env` sẽ ẩn route `/gym` và mục điều hướng trên Header.
- Backend: `ENABLE_GYM_API=false` trong `.env` sẽ tạm ngắt các endpoint `/api/gym/*`.
