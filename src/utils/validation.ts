/**
 * Kiểm tra xem một chuỗi Secret Key có đúng định dạng Base32 hợp lệ hay không.
 * Secret Key chuẩn cho Google Authenticator (TOTP) chỉ chứa các ký tự A-Z và 2-7.
 */
export function isValid2FAKey(secretKey: string): boolean {
  if (!secretKey) return false;
  // Loại bỏ tất cả khoảng trắng
  const cleaned = secretKey.replace(/\s+/g, '');
  if (!cleaned) return false;

  // Regex kiểm tra chuỗi Base32 (cho phép ký tự A-Z, 2-7 và dấu = padding ở cuối)
  const base32Regex = /^[A-Z2-7]+=*$/i;
  return base32Regex.test(cleaned);
}
