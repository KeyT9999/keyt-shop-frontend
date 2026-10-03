# Kế hoạch triển khai: Nghe thụ động từ vựng

**Trạng thái:** Hoàn tất; cài sạch, CI cục bộ và responsive QA đã pass.
**Phạm vi repo:** `keyt-shop-frontend`
**Trang mẫu:** [JPD123 bài 4-1: Phương hướng và phương tiện](https://www.taphoakeyt.com/courses/jpd123/vocabulary/4-1-phuong-huong-va-phuong-tien)

## Mục tiêu

Người học mở một bài từ vựng, chọn số phút và bấm phát. Ứng dụng lần lượt đọc cách đọc tiếng Nhật và nghĩa tiếng Việt của từng từ, nghỉ ngắn, đọc từ kế tiếp; hết danh sách thì quay lại đầu và tiếp tục cho đến hết thời lượng. Người học có thể tạm dừng, tiếp tục hoặc dừng bất cứ lúc nào.

## Hiện trạng đã kiểm tra

- `VocabularyItem` đã có `order`, `term`, `reading`, `romaji`, `meaning` và ví dụ; không cần API hoặc schema mới.
- Trang bài từ vựng đang có các mode Flashcard, luyện gõ, trắc nghiệm, danh sách, v.v. Flashcard có phím `P` để đọc từ hiện tại. Chế độ mới là trình phát cả danh sách theo thời lượng, không thay thế thao tác đọc từng từ.
- Hook `useSpeechSynthesis` hiện đặt mọi utterance thành `ja-JP` và hủy lời đọc trước đó mỗi lần gọi; vì thế không dùng nguyên trạng cho cặp Nhật–Việt.
- Repo ban đầu chưa có script test, test runner hoặc GitHub Actions workflow. Vercel ban đầu chạy `npm install` và `npm run build`; build gồm TypeScript và Vite.
- Vite hiện tại yêu cầu Node `^20.19.0 || >=22.12.0`. Môi trường đang dùng Node 24.12.0; CI dự kiến dùng Node 22.

## Hợp đồng nghiệp vụ

1. Mode áp dụng cho **toàn bộ từ của bài đang mở**. Đây là giả định theo trang mẫu có 16 từ; không gom tất cả bài trong cả khóa.
2. Trình tự ổn định theo `order` tăng dần; nếu hai từ trùng `order`, giữ thứ tự ban đầu. Không xáo trộn.
3. Mỗi từ được đọc theo mẫu: `reading` (hoặc `term` nếu thiếu `reading`) bằng locale `ja-JP`, nghỉ khoảng 300 ms, rồi `meaning` bằng locale `vi-VN`; sau nghĩa nghỉ 1 giây trước khi sang từ tiếp theo.
4. Không đọc loại từ, romaji hoặc câu ví dụ trong lượt mặc định. Màn hình vẫn có thể hiển thị romaji để người học theo dõi.
5. Thời lượng có các lựa chọn 5, 10, 15, 20, 30 phút và nhập tùy chỉnh từ 1 đến 60 phút. Mặc định 5 phút. Không chấp nhận số lẻ, giá trị trống hoặc ngoài giới hạn.
6. Đồng hồ chạy khi đang phát; tạm dừng sẽ đóng băng thời gian còn lại. Tiếp tục phát đúng utterance/giai đoạn đang dở; không quay lại đầu từ. Dừng hoặc hết giờ sẽ hủy giọng đọc và mọi timer.
7. Kết thúc một vòng danh sách thì bắt đầu vòng mới ngay, không chèn khoảng nghỉ dài giữa hai vòng. Bộ đếm vòng và từ hiện tại giúp người học biết tiến trình.
8. Tính năng chỉ đọc dữ liệu đã tải sẵn. Không ghi nhận kết quả học, không đổi trạng thái nhớ/lưu từ, không gọi backend và không lưu lịch sử phiên.
9. Phát chỉ bắt đầu sau thao tác bấm của người dùng để phù hợp chính sách phát âm thanh của trình duyệt.

## Thuật toán và máy trạng thái

### Chuẩn bị dữ liệu

- Kiểm tra API `speechSynthesis` và `SpeechSynthesisUtterance` trước khi cho bắt đầu.
- Tạo bản sao danh sách, sắp theo `order`, trim chuỗi và chuẩn hóa thành các mục `{ id, order, japaneseText, vietnameseText }`.
- `japaneseText = reading.trim() || term.trim()`. Bỏ qua mục thiếu từ tiếng Nhật hoặc nghĩa; hiển thị số mục bị bỏ qua. Nếu không còn mục hợp lệ thì hiện trạng thái rỗng và không cho phát.
- Xác thực duration trước khi tạo phiên; không âm thầm ép giá trị sai về giới hạn.

### Trạng thái

`idle → playing ↔ paused → completed | stopped | error`

- `playing`: giữ `sessionId`, `deadline`, `itemIndex`, `cycleNumber`, `phase` (`japanese`, `gap-before-meaning`, `vietnamese`, `gap-before-next`) và handle timer hiện hành.
- `paused`: giữ lại `remainingMs`, pha hiện tại và thời gian còn lại của khoảng nghỉ nếu đang ở giữa hai utterance.
- `completed`: tự chuyển khi `performance.now() >= deadline`; hủy speech queue, xóa timer, hiện thông báo hết giờ.
- `stopped`: dừng theo yêu cầu; hủy queue và timer, đưa nút phát về trạng thái sẵn sàng.
- `error`: dừng phiên, giải phóng tài nguyên và hiện lỗi tiếng Việt; không tự lặp lại vô hạn khi giọng đọc gặp lỗi.

### Luồng phát

```text
start(duration):
  validate duration, browser support, and prepared item list
  invalidate any prior session; cancel prior speech
  sessionId += 1
  deadline = monotonicNow() + durationMinutes * 60_000
  itemIndex = 0; cycleNumber = 1; phase = japanese; status = playing
  speak(current.japaneseText, ja-JP)

on utterance end(sessionId):
  ignore if sessionId is stale or status is not playing
  if deadline reached: finish
  japanese end -> schedule 300 ms -> speak Vietnamese meaning (vi-VN)
  vietnamese end -> schedule 1,000 ms -> increment itemIndex
  if itemIndex == itemCount: itemIndex = 0; cycleNumber += 1
  speak next Japanese text

on timer tick / visibility return:
  recompute remaining = max(0, deadline - monotonicNow())
  if remaining == 0: finish and cancel current speech

pause:
  save max(0, deadline - monotonicNow())
  save/clear any inter-utterance delay
  speechSynthesis.pause(); status = paused

resume:
  deadline = monotonicNow() + savedRemainingMs
  speechSynthesis.resume(); restore saved delay if between utterances
  status = playing

stop / unmount / lesson change:
  invalidate sessionId before cancel() so cancel-generated callbacks are stale
  clear every timeout/interval; speechSynthesis.cancel(); status = stopped/idle
```

Dùng deadline dựa trên `performance.now()` thay vì cộng dồn tick để tránh drift khi tab bị throttle. Chỉ đưa **một utterance vào SpeechSynthesis tại một thời điểm**; như vậy có thể đổi locale, dừng sạch và tránh hàng đợi cũ tiếp tục phát. Mọi callback phải kiểm tra `sessionId` để callback cũ không khởi động lại phiên đã dừng.

### Giọng đọc và lỗi

- Chọn voice có locale bắt đầu bằng `ja` hoặc `vi` nếu trình duyệt cung cấp; danh sách voice có thể xuất hiện bất đồng bộ qua `voiceschanged`.
- Nếu không có voice khớp, vẫn đặt `utterance.lang` và để trình duyệt chọn voice dự phòng; hiển thị lời nhắc rằng cách đọc có thể khác. Không chặn người dùng chỉ vì danh sách voice chưa tải xong.
- Nếu API không được hỗ trợ, báo bằng tiếng Việt và disable nút phát. Nếu phát sinh lỗi utterance khi đang chạy, dừng phiên an toàn và đưa ra nút thử lại.
- Chỉ log `console.warn` có cấu trúc cho lỗi SpeechSynthesis bất ngờ (kèm session id và phase); không log nội dung từ vựng, không log mỗi tick.

## Quyết định kiến trúc

- Thêm `PassiveVocabularyPlayer` làm bộ điều khiển trạng thái, với hook `usePassiveVocabularyPlayer` sở hữu vòng đời React và đăng ký voice/visibility; không mở rộng hook cũ vì hook đó chỉ phát một locale và luôn cancel utterance trước.
- Tách chuẩn hóa danh sách/thời lượng thành hàm thuần để dễ kiểm thử.
- Dùng Web Speech API có sẵn, không thêm backend, lưu trữ hoặc dịch vụ trả phí.
- Thêm cờ build-time `VITE_ENABLE_PASSIVE_LISTENING`; mặc định bật nếu chưa khai báo, đặt `false` để ẩn mode. Cờ Vite cần build/deploy lại để có hiệu lực.
- Thêm tài liệu co-located cho component mới giải thích contract, luồng phát, trạng thái lỗi và đánh đổi.
- UI dùng Tailwind v4, màu brand hiện có, icon Lucide, nhãn form rõ ràng, trạng thái focus dễ thấy, `aria-live` chỉ cho thay đổi mục/trạng thái (không đọc đồng hồ mỗi giây), responsive theo 375/768/1024/1440 px và tôn trọng `prefers-reduced-motion`.

## Kế hoạch công việc

### Task 1 — Thêm nền tảng test

**Mô tả:** Thêm Vitest, jsdom và React Testing Library ở dev dependencies; cấu hình test cho Vite và script `npm test` chạy không watch. Dùng các phiên bản tương thích Vite 7/React 19.

**Tiêu chí:**
- [x] `npm ci` tái tạo dependency tree từ lockfile.
- [x] `npm test` chạy được trên CI, không cần secrets hoặc backend.
- [x] Test đặt cạnh feature courses và dùng truy vấn theo role/label cho UI.

**Xác minh:** Chạy smoke test nền tảng; `npm run build` vẫn type-check sạch.
**Files:** `package.json`, `package-lock.json`, `vite.config.ts` hoặc `vitest.config.ts`.
**Phụ thuộc:** Không.

### Task 2 — Chuẩn hóa session input và viết test nghiệp vụ

**Mô tả:** Tạo hàm thuần xác thực phút, sắp xếp/chuẩn hóa từ, xử lý dữ liệu thiếu. Viết test trước, xác nhận test đỏ rồi cài phần tối thiểu để test xanh.

**Tiêu chí:**
- [x] Hợp lệ: số nguyên 1–60; mọi giá trị sai bị từ chối rõ ràng.
- [x] Sắp đúng `order`, ổn định khi trùng thứ tự; dùng `reading` rồi fallback `term`.
- [x] Bỏ mục thiếu từ/nghĩa hoặc entry malformed, đếm được mục bị bỏ; danh sách rỗng không bắt đầu phiên.

**Xác minh:** Test đơn vị bằng Vitest.
**Files:** `src/features/courses/utils/passiveListeningSequence.ts`, `src/features/courses/utils/passiveListeningSequence.test.ts`.
**Phụ thuộc:** Task 1.

### Task 3 — Bộ điều khiển phát và kiểm thử vòng đời

**Mô tả:** Viết adapter mỏng cho SpeechSynthesis và hook state machine. Inject adapter/clock/timer ở ranh giới test để mô phỏng event và thời gian mà không cần giọng đọc thật.

**Tiêu chí:**
- [x] Đọc Nhật → gap 300 ms → nghĩa Việt → gap 1 giây → từ tiếp theo.
- [x] Tự quay vòng; tự dừng đúng deadline; pause/resume giữ pha, delay và thời gian còn lại.
- [x] Stop/unmount/đổi bài hủy sạch queue/timer; callback cũ không thể phát tiếp.
- [x] Speech error đưa phiên về `error`, hiện thông điệp Việt và không tạo vòng lặp.
- [x] Voice Nhật/Việt được chọn theo locale khi có; thiếu voice khớp vẫn có fallback và thông báo.

**Xác minh:** Test hook/adapter với fake timers và mock SpeechSynthesis; kiểm tra stale callback, dừng đúng hạn và listener `voiceschanged` được dọn.
**Files:** `src/features/courses/services/passiveSpeechSynthesis.ts`, `src/features/courses/services/passiveSpeechSynthesis.test.ts`, `src/features/courses/services/passiveVocabularyPlayer.ts`, `src/features/courses/services/passiveVocabularyPlayer.test.ts`, `src/features/courses/hooks/usePassiveVocabularyPlayer.ts`, `src/features/courses/hooks/usePassiveVocabularyPlayer.test.tsx`.
**Phụ thuộc:** Task 1–2.

### Task 4 — Xây component player

**Mô tả:** Tạo bảng điều khiển có preset/custom duration, phát/tạm dừng/tiếp tục/dừng, thời gian còn lại, số từ/vòng, và thông tin từ đang đọc.

**Tiêu chí:**
- [x] Nhãn input, trạng thái disabled, focus và thông báo screen reader rõ ràng.
- [x] Không có từ hợp lệ hoặc API không hỗ trợ thì không thể bắt đầu và có giải thích.
- [x] Lỗi/hoàn tất/dừng đều có trạng thái riêng và cho phép bắt đầu phiên mới.
- [x] Không tạo horizontal scroll ở 375 px; giữ hierarchy và màu sắc của trang khóa học.

**Xác minh:** Test component theo role/label; xem thực tế ở 375, 768, 1024, 1440 px.
**Files:** `src/features/courses/components/vocabulary/modes/PassiveListeningMode.tsx`, `src/features/courses/components/vocabulary/modes/PassiveListeningMode.test.tsx`, `src/features/courses/components/vocabulary/modes/PassiveListeningMode.md`.
**Phụ thuộc:** Task 2–3.

### Task 5 — Nối mode vào bài học và thêm kill switch

**Mô tả:** Thêm `passive-listening` vào union mode, selector và `VocabularyDetailPage`; chỉ render tab khi feature flag bật. Chuyển items của bài đang mở vào player.

**Tiêu chí:**
- [x] Có thể bật/tắt mode mà không đổi route/API/DB.
- [x] Khi đổi bài hoặc chuyển mode, speech/timer của player cũ dừng sạch.
- [x] Mode không gọi `handleRecordResult` và không đổi tiến độ/bookmark.
- [x] `VITE_ENABLE_PASSIVE_LISTENING=false` ẩn mode; thiếu env mặc định bật.
- [x] Flashcard `P` và nút đọc từng dòng vẫn hoạt động.

**Xác minh:** TypeScript build; smoke flow bài JPD123 4-1 và một bài khác; kiểm tra cờ bật/tắt.
**Files:** `src/features/courses/types/index.ts`, `src/features/courses/components/vocabulary/LearningModeSelector.tsx`, `src/pages/courses/VocabularyDetailPage.tsx`, `src/config/features.ts`, `.env.example`.
**Phụ thuộc:** Task 4.

### Task 6 — Gắn CI và cổng deploy Vercel

**Mô tả:** Tạo script `npm run check` chạy lint, test và build tuần tự; workflow GitHub chạy cùng script với Node 22 và `npm ci`; cấu hình Vercel cài bằng `npm ci` và build bằng `npm run check` để test/lint fail thì deploy cũng fail.

**Tiêu chí:**
- [x] PR và push lên `main` chạy đúng cùng một lệnh `npm run check`.
- [x] Workflow dùng lockfile (`npm ci`), Node tương thích yêu cầu Vite và không cần secret.
- [x] Vercel cài dependencies sạch và chỉ tạo deploy khi lint feature, test, TypeScript/Vite build đều pass.
- [x] Không đưa `.env` hoặc dữ liệu riêng vào workflow.

**Xác minh:** Chạy sạch `npm ci`, `npm run check`; kiểm tra cấu hình Vercel và workflow. `npm run check` chạy `lint:feature` trên mọi file nguồn/test đổi trong feature, toàn bộ Vitest suite và build. Full `npm run lint` hiện có hơn 200 lỗi ở các file cũ ngoài phạm vi; pipeline mới kiểm tra lint các file feature thay đổi để không biến task này thành đợt sửa toàn bộ codebase. Branch protection bắt buộc status check là cài đặt GitHub ngoài repo, cần chủ repo bật nếu muốn chặn merge khi CI đỏ.
**Files:** `package.json`, `.github/workflows/ci.yml`, `vercel.json`.
**Phụ thuộc:** Task 1–5.

### Task 7 — Review và kiểm thử trình duyệt

**Mô tả:** Rà diff, chạy cổng chất lượng và xem giao diện local tại 375/768/1024/1440 px; hành vi speech được kiểm tra bằng adapter mock.

**Tiêu chí:**
- [x] `npm run lint:feature`, `npm test`, `npm run build`, `npm run check` đều pass.
- [x] Test phát → pause → resume → stop; test hết giờ với fake clock; xác nhận speech/timer được hủy khi stop/unmount.
- [x] Test voice không khả dụng/API không hỗ trợ; lỗi tiếng Việt, không crash.
- [x] Responsive ở 375/768/1024/1440, không tràn ngang; contrast, cursor, focus, hover 150–300 ms và reduced motion đạt checklist UI/UX Pro Max.
- [x] Diff không chứa `.env`, generated output hay preview tạm; `git diff --check` sạch.

**Files:** Chỉ sửa bổ sung những file feature/CI phát hiện lỗi trong QA.
**Phụ thuộc:** Task 1–6.

## Cổng CI/CD dự kiến

```text
Pull request / push main
  → npm ci (Node 22)
  → npm run lint:feature (mọi file feature thay đổi)
  → npm test (Vitest, run một lần)
  → npm run build (tsc -b && vite build)

Vercel
  → npm ci
  → npm run check
  → chỉ deploy nếu lint + test + build đều xanh
```

Repo ban đầu không có GitHub Actions workflow và full ESLint hiện báo hơn 200 lỗi legacy trên các file ngoài phạm vi. Cổng mới lint tất cả file nguồn/test thuộc feature, chạy toàn bộ test suite và production build. Vercel và GitHub Actions dùng chung `npm run check`. Việc bật branch protection để yêu cầu status check trước merge cần thao tác trong cài đặt GitHub; workflow tự nó không thay đổi chính sách merge.

## Rủi ro và cách giảm thiểu

| Rủi ro | Tác động | Giảm thiểu |
|---|---|---|
| Thiết bị không có voice `ja` hoặc `vi` | Giọng mặc định có thể đọc sai ngôn ngữ | Chọn voice theo locale; fallback có cảnh báo; thử trên Chrome desktop và mobile thật |
| Voice load bất đồng bộ | Phiên đầu có thể chưa chọn được voice cụ thể | Theo dõi `voiceschanged`, không phụ thuộc voice list để bắt đầu |
| SpeechSynthesis là API dùng chung của trang | Nút đọc khác có thể hủy/chen lời đang phát | Chỉ queue một utterance; session ID; hủy sạch khi đổi mode; lỗi external cancel dừng player an toàn |
| Timer bị throttle ở tab nền | Đồng hồ hiển thị cập nhật chậm | Deadline monotonic, tính lại trên tick và khi trang hiện lại; dừng khi code được scheduler đánh thức |
| Trình duyệt/mobile dừng TTS khi khóa màn hình hoặc chuyển app | Không đảm bảo nghe liên tục khi màn hình tắt | Đợt đầu dùng browser TTS không tốn backend; ghi rõ giới hạn và kiểm chứng máy thật. Nếu yêu cầu bắt buộc phát khi khóa màn hình, cần thiết kế riêng audio asset/server TTS ở phase khác |
| Thêm test runner/CI làm tăng dependency và thời gian deploy | Pipeline lâu hơn | Chỉ thêm ba dev dependencies cần thiết; CI và Vercel dùng chung `npm run check`; đo runtime trong PR |
| Audit dependency | `npm ci` báo 22 advisories (1 low, 6 moderate, 15 high) | Không chạy bulk `npm audit fix` trong feature này; xử lý từng dependency riêng để tránh thay đổi phiên bản ngoài scope |
| Cờ Vite là build-time | Đổi cờ phải build/deploy lại | Mặc định bật; tài liệu rõ cách tắt và triển khai lại để rollback |

## Điều kiện cần chốt khi duyệt

- Phạm vi là danh sách của **bài hiện tại**, không phải tự chuyển tiếp qua mọi bài của khóa.
- Âm thanh đọc cách đọc tiếng Nhật từ `reading` (kana), không phát âm chuỗi romaji theo giọng tiếng Anh; sau đó đọc `meaning` bằng tiếng Việt.
- Chấp nhận browser TTS làm phiên bản đầu; không cam kết tiếp tục khi khóa màn hình/chuyển ứng dụng.
- Đồng ý thêm Vitest/test dependencies, GitHub Actions workflow và đổi cổng build Vercel để cả lint/test/build đều được kiểm tra trước deploy.

## Tài liệu kỹ thuật tham khảo

- [MDN: SpeechSynthesis.pause()](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/pause)
- [MDN: SpeechSynthesis.resume()](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/resume)
- [MDN: SpeechSynthesis.cancel()](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel)
- [MDN: SpeechSynthesis.getVoices()](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices)
- [MDN: SpeechSynthesisUtterance end event](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/end_event)
