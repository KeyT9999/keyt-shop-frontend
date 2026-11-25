export function getWorkoutUiHelp(question: string, restSeconds: number): string | null {
  const normalized = question.toLowerCase().normalize('NFD')
    .replace(/\p{M}/gu, '').replace(/đ/g, 'd');
  const asksAboutSets = /(?:ghi|tich|danh dau|log) (?:tung )?(?:hiep|set)|log set/.test(normalized);
  const asksAboutTimer = /dong ho nghi|rest timer|nut nghi|dem nguoc.*(?:nghi|hiep)/.test(normalized);
  if (!asksAboutSets && !asksAboutTimer) return null;

  const lines: string[] = [];
  if (asksAboutSets) {
    lines.push('- **Ghi hiệp:** Trong bảng hiệp, chỉnh số lần thực tế rồi bấm dấu tích cuối dòng của hiệp (nút **Xong** trên màn hình rộng). Bấm lại để bỏ dấu tích.');
  }
  if (asksAboutTimer) {
    lines.push(restSeconds > 0
      ? '- **Đồng hồ nghỉ:** Tích xong hiệp chính sẽ tự chạy ' + restSeconds + ' giây ở bài đang mở. Bấm **Nghỉ ' + restSeconds + 's** để bắt đầu thủ công, hoặc **Bỏ qua** nếu đã sẵn sàng tập tiếp.'
      : '- **Đồng hồ nghỉ:** Bài đang mở không có thời gian nghỉ tự động.');
  }
  return lines.join('\n');
}
