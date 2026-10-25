# Robot 3D AI Companion System (`src/components/robot/`)

## Tổng quan
Bộ component hiển thị và điều khiển **Robot 3D AI Companion** (`/models/robot.glb`) cho toàn bộ hệ sinh thái **Tiệm Tạp Hóa KeyT (KeyT Hub)**.

## Lý do kiến trúc (Architecture Decision & Trade-offs)
- **Dùng trực tiếp `three` + `GLTFLoader` + `AnimationMixer` thay vì `@react-three/fiber`:**
  - Dự án đang chạy **React 19** và đã cài sẵn `three` (`^0.181.2`). Sử dụng trực tiếp `three` giúp tránh xung đột peer-dependency với React 19, giảm kích thước bundle, kiểm soát chặt chẽ vòng đời WebGL (`dispose`) và tự động fallback sang SVG khi môi trường không có WebGL (như Vitest/JSDOM).
- **Singleton ArrayBuffer Cache (`robotSceneLoader.ts`):**
  - File `/models/robot.glb` (`290 KB`) chỉ tải qua mạng **1 lần duy nhất**, sau đó được parse độc lập cho từng instance mà không tốn băng thông lặp lại.
- **Kết hợp Animation có sẵn (`"Scene"`) + Procedural Node Animation (`robotMotionUtils.ts`):**
  - Điều khiển trực tiếp các node `Mouth` (nhép miệng lip-sync), `Hand origin` / `Hand origin.002` (vẫy tay), `Robot` (xoay nhìn theo chuột), và đổi màu chất liệu LED `Blue_Light` theo 5 trạng thái (`idle`, `thinking`, `speaking`, `happy`, `listening`).

## Các Component chính
1. **`Robot3DCanvas.tsx`**: Canvas 3D cốt lõi, nhận `status`, `audioLevel`, `isDragging`, `trackMouse`.
2. **`DraggableRobotWidget.tsx`**: Trợ lý 3D nổi toàn màn hình, hỗ trợ nắm chuột kéo thả tự do (`Pointer Events` + lưu vị trí `localStorage` + tự động giới hạn trong khung nhìn `clampRobotScreenPosition`).
3. **`SpeakingExaminerRobot.tsx`**: Giám thị AI 3D trong phòng thi nói (`MockExamSimulator`, `QAPracticeTab`).
4. **`CuteRobotLoader.tsx`**: Trạm radar 3D khi dò mã OTP 2FA (`AuthCodeHub`) và nén ảnh (`CompressPage`).
