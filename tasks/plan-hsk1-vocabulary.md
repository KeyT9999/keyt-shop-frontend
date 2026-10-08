# Kế hoạch: Từ vựng HSK1

## Mục tiêu

Đưa 11 chủ đề và 150 mục từ HSK1 vào luồng học từ vựng hiện có của JPD123, giữ tiến độ, bookmark, các chế độ luyện tập và trải nghiệm responsive. Dùng chữ Hán giản thể làm mặt từ, giữ Pinyin và nghĩa tiếng Việt theo tệp người dùng cung cấp.

## Quyết định

- HSK1 dùng chung `CourseLesson`, `VocabularyItem`, API học và các mode hiện có; không tạo hệ thống học song song.
- Bài học đánh mã `1-1` đến `1-11` để tương thích seeder chung.
- Nội dung nguồn không có ví dụ hoặc loại từ; để ví dụ trống và dùng nhãn loại từ trung tính.
- TTS tiếng Trung dùng locale `zh-CN`, nói chữ Hán; phần đọc hiển thị là Pinyin.
- HSK1 chỉ mở phần từ vựng; route khóa học chuyển thẳng đến danh sách chủ đề.

## Công việc

1. Thêm metadata khóa học, manifest 11 chủ đề và 11 tệp dữ liệu; đối chiếu tổng là 150 mục.
2. Thêm cấu hình ngôn ngữ dùng chung để chọn locale và nhãn tiếng Trung/Nhật.
3. Nối ngôn ngữ này vào flashcard, gõ từ, quiz, ghép cặp, đấu 60 giây, từ hay sai, bảng từ và nghe thụ động.
4. Cho API ghi kết quả chấp nhận các mode luyện tập nâng cao đang được frontend gửi.
5. Thêm điểm vào HSK1 từ cổng khóa học và menu desktop/mobile; điều hướng HSK1 đến từ vựng.
6. Kiểm tra cấu trúc/count JSON và chạy build frontend; không chạy seed lên database đang cấu hình.

## Tiêu chí hoàn tất

- HSK1 hiển thị 11 chủ đề, tổng 150 mục; từng chủ đề có đúng số lượng nguồn.
- Người học xem Hán tự/Pinyin, phát âm tiếng Trung, tra nghĩa, gõ đáp án, làm quiz/game và lưu tiến độ như các khóa hiện tại.
- Các trang JPD giữ ngôn ngữ, locale và hành vi hiện có.
- Không cài dependency mới.
