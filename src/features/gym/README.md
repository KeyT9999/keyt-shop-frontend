# KeyT Gym 3D Coach — Female Dark Neon Edition (`src/features/gym`)

Module huấn luyện viên phòng gym cá nhân trên `taphoakeyt.com/gym` với thiết kế **Dark Charcoal & Neon Pink (`#111114` · `#FF5C8A` · `#F7F7F7`)**, khớp 1:1 toàn bộ dàn máy **BRTW & Impulse** tại phòng tập thực tế và tích hợp trọn bộ tính năng chuyên biệt cho **nữ tập gym** + **AI Coach cá nhân hóa**.

## Kiến trúc Component, 3D Engine & Female Fitness Intelligence
- `components/GymNeonHeroDashboard.tsx`: Bảng điều khiển **Progress / WORKOUT** nền đen than `#111114` điểm nhấn hồng neon `#FF5C8A`, dải 7 ngày viên nang, khối Hero vận động viên nữ kèm thanh tiến độ dọc đa sắc và 3 thẻ Pillar (`Technique`, `Cycle Sync`, `AI Coach`).
- `components/FemaleCycleAndProfileModal.tsx`: Quản lý chỉ số cơ thể nữ (chiều cao, cân nặng, BMI, vòng eo V2, vòng mông V3, mục tiêu *Độ mông đào không to đùi*, *Bảo vệ lưng dưới/khớp gối*) và theo dõi 4 pha chu kỳ kinh nguyệt (*Kỳ Dâu, Nang trứng, Rụng trứng, Hoàng thể*) + triệu chứng hàng ngày.
- `components/GymExerciseSubstituteModal.tsx`: Đổi bài tập thông minh 0đ (`rankExerciseSubstitutes`) khi máy đang bận, bài tập gây mỏi lưng/khớp, hoặc người dùng muốn ưu tiên cô lập cơ mông hạn chế đùi trước.
- `components/GymAiCoachDrawer.tsx`: Khung chat **KeyT Neon AI Coach** kết nối đa luồng (`DeepSeek` → `SiliconFlow` → `xKiro` + Smart Fallback) tự động nạp toàn bộ hồ sơ cơ thể, số đo, pha chu kỳ và lịch tập của người dùng để giải đáp mọi câu hỏi.
- `components/GymSelectorCockpit.tsx`: Thanh điều khiển gọn 2 hàng gồm **Dropdown chọn Ngày tập** và **Dropdown chọn Bài tập** kèm nút `Trước` / `Tiếp` / `Đánh dấu xong` / `Đổi bài`.
- `components/GymMannequin3DViewer.tsx`: Mô hình vận động viên 3D xoay 360° (Three.js), tô sáng nhóm cơ chính và cơ phụ, hỗ trợ nhịp thở và nạp `.glb` tùy chọn từ Blender.
- `components/RealGymMachineView.tsx`: Tab **Máy thật** hiển thị ảnh chụp thực tế máy tập ngay tại phòng gym (`/images/gym-machines/*.webp`).
- `components/ExerciseReferenceDualView.tsx`: Khung đối chiếu 2 ảnh thực tế (Tư thế Bắt đầu & Đỉnh co cơ).
- `components/GymInlineMetricsTools.tsx`: Thanh ngang gọn kết hợp `Hiệp × Lần`, đồng hồ nghỉ đếm ngược 1 chạm, gợi ý mức tạ theo chu kỳ (`Deload` / `Progression`) và nút tăng/giảm `±2.5kg` + ghi chú nấc ghế.
- `utils/gymCycleAndProgressionUtils.ts` & `utils/gymExerciseSubstitutionUtils.ts`: Các hàm Pure TypeScript tính toán chu kỳ kinh nguyệt, hệ số Deload ngày đèn đỏ, gợi ý tăng/giảm tạ, ước tính Calo/Phút tập và chấm điểm bài tập thay thế.
