# Module `features/gym` – KeyT Gym 3D Coach v2 (`/gym`, `/gym/nam`, `/gym/nu`)

## Kiến trúc Single Source of Truth (v2)
Trợ lý sổ tay phòng tập & mô phỏng giải phẫu 3D dành riêng cho **Nam (`/gym/nam` • Electric Cyan `#5CE1E6`)** và **Nữ (`/gym/nu` • Neon Pink `#FF5C8A`)**, tối ưu thao tác 1 tay trên điện thoại tại phòng gym:

1. **`GymGenderAdvisorPanel.tsx`:**
   - Bộ định tuyến đôi `/gym/nam` và `/gym/nu`, tự động dựng phác đồ nhiều buổi/tuần theo mục tiêu + thực đơn 4 bữa và thanh theo dõi uống nước (`±250ml`).
   - Đồng bộ trực tiếp với `maleCustomDays` và `femaleCustomDays` (`buildSessionsFromSavedSplitDays`) để mọi thao tác đổi bài hoặc chỉnh lịch phản ánh tức thì lên 3D Stage.
   - Tách bạch hoàn toàn sinh lý Nữ (4 pha chu kỳ kinh nguyệt + tự động tính từ `lastPeriodStartDate`) và trạng thái Nam (`maleEnergyLevel`, bảo vệ khớp vai trước `shoulderSafe`, bảo vệ lưng dưới/gối).

2. **`GymInlineMetricsTools.tsx` (1-Handed Set Cockpit):**
   - Tích từng hiệp (`Khởi động`, `Hiệp 1..4`), tự động chạy đồng hồ nghỉ dựa trên **Timestamp (`endAtMs - Date.now()`)** chống trôi giây khi khóa màn hình điện thoại, kèm chuông + rung và tùy chọn `WakeLock` (`Giữ sáng`).
   - Nút tăng/giảm tạ thông minh theo thiết bị (`±1kg/2kg` tạ đơn, `±2.5kg` máy cáp/tạ bánh), công cụ **Tính bánh tạ mỗi bên (Plate Calculator)**, ghi nhớ nấc ghế (`seatPinNote`) và hiển thị `PR` + `1RM` (công thức Epley).

3. **`GymMannequin3DViewer.tsx` & `gym3DSceneRig.ts`:**
   - Dựng nhân vật giải phẫu 3D theo giới tính (`gender: 'male' | 'female'` — khung V-Taper vai rộng cho Nam, khung S-Line cho Nữ) cùng 38 máy BRTW & Impulse thực tế.

4. **`GymProgressHistoryModal.tsx`:**
   - Thẻ chúc mừng sau buổi tập (`POST /api/gym/sessions/complete`), thống kê Smart Streak (cho phép nghỉ 1–3 ngày phục hồi cơ không đứt chuỗi), bảng kỷ lục PR/1RM, lịch sử Volume và nhật ký cân đo hình thể (`bodyMetricsHistory`).

5. **`GymExerciseSubstituteModal.tsx` & `SplitCustomizerModal.tsx`:**
   - Giao diện Dark Neon đồng bộ `#111114` / `#16161C`, chấm điểm đổi bài 0đ theo giới tính & an toàn khớp, tùy chỉnh thứ tự bài tập cho từng buổi.

6. **`GymAiCoachDrawer.tsx`:**
   - Trợ lý AI Coach góc phải màn hình nạp đầy đủ số đo Nam/Nữ, danh sách 38 máy tập thực tế, kỷ lục PR/1RM, lịch sử tập và gợi ý món ăn đời thường Việt Nam.

## Feature Flag (Kill Switch)
- Frontend: `VITE_ENABLE_GYM_COACH=false` trong `.env` sẽ ẩn route `/gym` và mục điều hướng trên Header.
- Backend: `ENABLE_GYM_API=false` trong `.env` sẽ tạm ngắt các endpoint `/api/gym/*`.
