export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
export const IS_RECAPTCHA_ENABLED = Boolean(RECAPTCHA_SITE_KEY);

if (import.meta.env.PROD && !IS_RECAPTCHA_ENABLED) {
  console.error(
    'VITE_RECAPTCHA_SITE_KEY chưa được cấu hình. Các form xác thực sẽ không thể gửi reCAPTCHA.'
  );
}
