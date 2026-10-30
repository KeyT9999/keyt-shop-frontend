# KeyT Gym 3D Coach (`src/features/gym`)

Module huấn luyện viên phòng gym cá nhân trên `taphoakeyt.com/gym` với thiết kế **Mobile-First Above-the-Fold Cockpit**, khớp 1:1 toàn bộ dàn máy **BRTW & Impulse** tại phòng tập thực tế.

## Kiến trúc Component & 3D Engine
- `components/GymSelectorCockpit.tsx`: Thanh điều khiển gọn 2 hàng gồm **Dropdown chọn Ngày tập (Ngày 1–5)** và **Dropdown chọn Bài tập** kèm nút `Trước` / `Tiếp` / `Đánh dấu xong` 1 chạm.
- `components/GymMannequin3DViewer.tsx`: Mô hình vận động viên 3D màu bạc titan tương phản cao xoay 360° (Three.js), tô sáng nhóm cơ chính (`#F05A28`) và cơ phụ (`#FBBF24`), hỗ trợ nhịp thở và nạp `.glb` tùy chọn từ Blender.
- `three/gym3DPoseData.ts` & `three/gym3DMachinePoses.ts`: 33 chuyển động 3D chuyên biệt bao phủ từ tạ đơn/cáp đến đầy đủ máy lắp tạ BRTW / Impulse (Incline Press, Laydown Press, Chest-Supported Row, Iso High Pulldown, Assisted Pull-Up/Dip, Preacher Curl, Seated Lateral Raise, Reverse Pec Deck, Super Squat, Leg Extension, Hip Thrust, Hip Abductor, Roman Chair 45°).
- `three/gym3DSceneRig.ts` & `three/gym3DMachineProps.ts`: Dựng khung máy tập 3D đồng bộ chuyển động tay đòn, đệm quỳ trợ lực, con lăn đá đùi và thanh đẩy hông.
- `components/RealGymMachineView.tsx`: Tab **Máy thật** hiển thị ảnh chụp thực tế máy tập ngay tại phòng gym (`/images/gym-machines/*.webp`) giúp nhận diện đúng máy trong 1 giây.
- `components/ExerciseReferenceDualView.tsx`: Khung đối chiếu 2 ảnh thực tế (Tư thế Bắt đầu & Đỉnh co cơ).
- `components/GymInlineMetricsTools.tsx`: Thanh ngang gọn kết hợp `Hiệp × Lần`, đồng hồ nghỉ đếm ngược 1 chạm và nút tăng/giảm `±2.5kg` + ghi chú nấc ghế.
- `components/SplitCustomizerModal.tsx`: Modal tùy chỉnh linh hoạt bài tập của từng ngày hoặc chọn preset chu kỳ.
- `hooks/useGymCoachState.ts` & `utils/gymStateUtils.ts`: Lưu tức thì `localStorage` (0ms), tự động nâng cấp lịch v1 lên danh sách full máy phòng gym mà không mất log mức tạ, đồng bộ ngầm với `/api/gym/profile`.
