# KeyT Focus Café (`src/features/focus/`)

Không gian tự học & tập trung toàn màn hình tích hợp nhạc Lofi, bộ trộn âm thanh đời thực, đồng hồ đếm giờ học nhỏ gọn và chuyển động nhân vật mượt mà.

## Cấu Trúc Module

- `types/focusTypes.ts`: Single Source of Truth cho toàn bộ kiểu dữ liệu của Focus Café.
- `data/focusCatalog.ts`: Danh mục 6 khung cảnh video chuyển động (trong đó Cảnh 2 `loft-room` hỗ trợ 4 chế độ thời tiết Ngày/Đêm/Mưa), 6 bản nhạc Lofi theo 3 mood và 6 lớp âm thanh nền.
- `utils/focusAudioManager.ts`: Singleton quản lý `HTMLAudioElement` độc lập khỏi vòng đời render của React để không bị ngắt nhạc khi chuyển sang trang học từ vựng (`/courses/*`).
- `utils/focusFullscreen.ts`: Helper bật/tắt Fullscreen an toàn đa trình duyệt.
- `utils/focusStorage.ts`: Pure functions tính chuỗi ngày học (*Streak*), định dạng đồng hồ và đọc/ghi `localStorage`.
- `components/FocusMiniClockCard.tsx`: Đồng hồ học tập nhỏ gọn ở góc phải trên (hỗ trợ cả Pomodoro `15/25/45/60p` lẫn Đếm xuôi, có nút thu gọn thành viên thuốc siêu nhỏ).
- `components/FocusBottomDock.tsx`: Thanh điều khiển kính mờ tự làm mờ khi không rê chuột sau `4.5s`.
- `components/FocusFloatingMiniPlayer.tsx`: Viên thuốc điều khiển nổi khi người dùng vừa nghe nhạc/đếm giờ vừa học từ vựng ở các trang khác.

## Ghi Chú Quyết Định Kiến Trúc (Trade-offs)

1. **Tự host video `.mp4` & âm thanh `.mp3` tối ưu dung lượng trong `public/focus/`:**
   - *Lý do:* Tránh 100% rủi ro link S3 bên thứ 3 hết hạn, chặn CORS hoặc chèn quảng cáo như YouTube iframe. Tổng dung lượng mỗi cảnh chỉ `430KB – 1.3MB` kèm ảnh `poster` tĩnh `~35KB` giúp hiển thị tức thì `0ms`.
   - *Đánh đổi:* Tăng nhẹ kích thước thư mục `public/`, nhưng trình duyệt chỉ tải video của cảnh đang được chọn (`lazy on demand`).
2. **Kích hoạt `requestFullscreen()` + `audio.play()` ngay trong sự kiện `onClick` chuyển trang:**
   - *Lý do:* Các trình duyệt hiện đại chặn `requestFullscreen()` nếu gọi trong `useEffect` sau khi chuyển route. Gọi trực tiếp thông qua `enterFocusSession()` tại nút bấm trên `Header` / `CoursesHubPage` đảm bảo bật toàn màn hình và phát nhạc thành công ngay lập tức.
