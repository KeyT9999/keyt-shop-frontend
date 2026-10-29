# KeyT Gym 3D Coach (`src/features/gym`)

Module huấn luyện viên phòng gym cá nhân trên `taphoakeyt.com/gym` với thiết kế **Mobile-First Above-the-Fold Cockpit**.

## Kiến trúc Component
- `components/GymSelectorCockpit.tsx`: Thanh điều khiển gọn 2 hàng gồm **Dropdown chọn Ngày tập (Ngày 1–5)** và **Dropdown chọn Bài tập** kèm nút `Trước` / `Tiếp` / `Đánh dấu xong` 1 chạm.
- `components/GymMannequin3DViewer.tsx`: Mô hình vận động viên 3D màu bạc titan tương phản cao xoay 360° (Three.js), tô sáng nhóm cơ chính (`#F05A28`) và cơ phụ (`#FBBF24`), hỗ trợ nhịp thở và nạp `.glb` tùy chọn từ Blender.
- `components/ExerciseReferenceDualView.tsx`: Khung đối chiếu 2 ảnh thực tế (Tư thế Bắt đầu & Đỉnh co cơ) đồng bộ chiều cao với khung 3D.
- `components/GymInlineMetricsTools.tsx`: Thanh ngang gọn gàng kết hợp `Hiệp × Lần`, đồng hồ nghỉ đếm ngược 1 chạm (có chuông báo nhẹ) và nút tăng/giảm `±2.5kg` + ngăn kéo ghi chú nấc ghế.
- `components/SplitCustomizerModal.tsx`: Modal tùy chỉnh linh hoạt bài tập của từng ngày hoặc chọn preset chu kỳ.
- `hooks/useGymCoachState.ts` & `services/gymSyncService.ts`: Lưu tức thì `localStorage` (0ms) + đồng bộ ngầm với `/api/gym/profile` khi đã đăng nhập.
