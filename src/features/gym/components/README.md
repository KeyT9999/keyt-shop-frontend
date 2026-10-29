# Module `features/gym` – KeyT Gym 3D Coach (`/gym`)

## Mục đích
Trợ lý sổ tay & mô phỏng 3D tại phòng tập thiết kế tối ưu cho thao tác 1 tay trên điện thoại:
1. **Nhớ chu kỳ tự động (Ngày 1 → Ngày 5):** Tự động chuyển sang buổi tập tiếp theo khi qua ngày mới nếu buổi hôm trước đã đánh dấu hoàn thành bài tập.
2. **Mô phỏng Hybrid 3D + Đối chiếu ảnh thực tế:**
   - `GymMannequin3DViewer.tsx`: Dựng nhân vật giải phẫu 3D + thiết bị tập (`three@^0.181.2` + `OrbitControls`), phát sáng bó cơ chính màu `#F05A28` và hiển thị nhịp hít/thở theo pha chuyển động.
   - `ExerciseReferenceDualView.tsx`: Hiển thị song song 2 ảnh thực tế *Tư thế Bắt đầu & Đỉnh co cơ* cùng hướng dẫn chỉnh ghế/nhận diện máy tập.
3. **Offline-first + Cloud Sync:** Lưu tức thì vào `localStorage` (`keyt_gym_coach_state_v1`) và đồng bộ ngầm với `PUT /api/gym/profile` khi người dùng đăng nhập KeyT.

## Hướng dẫn nạp thêm Model 3D xuất từ Blender (`.glb`)
Nếu muốn thay thế một động tác bằng file `.glb` xuất riêng từ **Blender** (ví dụ từ kho giải phẫu *Z-Anatomy* hoặc *Sketchfab*):
1. Trong Blender, chọn nhân vật/nhóm cơ -> `File > Export > glTF 2.0 (.glb)`, bật **Animation** và nén Geometry nếu cần (giữ dung lượng `< 1.5MB`).
2. Đặt file vào `keyt-shop-frontend/public/models/gym/<exerciseId>.glb` (ví dụ `hammer_curl.glb`).
3. Thêm `<exerciseId>` vào tập `REGISTERED_BLENDER_GLB_EXERCISES` trong `src/features/gym/three/gym3DSceneRig.ts`.

## Feature Flag (Kill Switch)
- Frontend: `VITE_ENABLE_GYM_COACH=false` trong `.env` sẽ ẩn route `/gym` và mục điều hướng trên Header.
- Backend: `ENABLE_GYM_API=false` trong `.env` sẽ tạm ngắt endpoint `/api/gym/profile`.
