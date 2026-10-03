# Todo: Nghe thụ động từ vựng

Kế hoạch chi tiết: [plan.md](./plan.md). Người dùng đã duyệt; implementation hoàn tất, cài sạch và CI cục bộ đã pass.

## Task 1 — Nền tảng test

- [x] Thêm Vitest, jsdom và React Testing Library ở dev dependencies.
- [x] Cấu hình Vitest và `npm test` chạy một lần trong CI.
- [x] Xác nhận `npm ci` và build hiện có vẫn hoạt động.

## Task 2 — Chuẩn hóa input và nghiệp vụ

- [x] Viết test trước cho thời lượng hợp lệ 1–60 phút.
- [x] Viết test sắp xếp ổn định theo `order` và fallback `reading → term`.
- [x] Viết test mục thiếu dữ liệu, số mục bị bỏ và danh sách rỗng.
- [x] Cài helper thuần đến khi toàn bộ test xanh.

## Task 3 — Speech adapter và playback state machine

- [x] Viết test cho chuỗi Nhật → 300 ms → Việt → 1 giây → từ kế tiếp.
- [x] Viết test vòng lặp, deadline, pause/resume và thời gian còn lại.
- [x] Viết test stop/unmount, stale callback và SpeechSynthesis error.
- [x] Implement adapter, player state machine và hook với một utterance tại một thời điểm.
- [x] Chọn voice theo locale, fallback an toàn và dọn listener/timer.

## Task 4 — UI player

- [x] Tạo giao diện chọn phút, gồm preset và số phút tùy chỉnh.
- [x] Tạo trạng thái idle/playing/paused/completed/stopped/error.
- [x] Hiển thị thời gian còn lại, từ hiện tại, số thứ tự và vòng lặp.
- [x] Thêm trạng thái empty/unsupported/voice fallback bằng tiếng Việt.
- [x] Viết test component dùng role/label; thêm tài liệu component.

## Task 5 — Tích hợp trang và feature flag

- [x] Thêm learning mode `passive-listening` và icon Lucide.
- [x] Nối player với danh sách từ của bài hiện tại.
- [x] Hủy player khi đổi mode/bài/unmount; không ghi nhận tiến độ học.
- [x] Thêm `VITE_ENABLE_PASSIVE_LISTENING`, mặc định bật, `false` để ẩn.
- [x] Xác nhận mode khác, Flashcard `P` và nút phát từng từ không bị ảnh hưởng qua diff và test selector.

## Task 6 — CI/CD

- [x] Thêm `npm run check` thực thi lint feature → toàn bộ test → build.
- [x] Tạo GitHub Actions workflow cho pull request và push `main`, Node 22 + `npm ci`.
- [x] Đổi Vercel build command sang `npm run check`.
- [x] Chạy sạch `npm ci && npm run check`; xác nhận workflow dùng đúng lệnh.
- [ ] Chủ repo bật branch protection để bắt buộc status check nếu muốn chặn merge khi CI đỏ.

## Task 7 — QA cuối

- [x] Chạy lint trên file feature đổi, unit/component tests và production build.
- [x] Thử trạng thái voice thiếu/API không hỗ trợ và lỗi speech qua mock.
- [x] Kiểm tra giao diện tại 375/768/1024/1440 px; không phát hiện tràn ngang.
- [x] Review diff và xác nhận không có `.env`, backend/API hoặc thay đổi ngoài scope.
