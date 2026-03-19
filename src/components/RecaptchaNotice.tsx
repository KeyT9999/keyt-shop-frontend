export default function RecaptchaNotice({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs leading-5 text-slate-500 ${className}`.trim()}>
      Trang này được bảo vệ bởi reCAPTCHA và áp dụng{' '}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noreferrer"
        className="text-[#F05A28] hover:underline"
      >
        Chính sách quyền riêng tư
      </a>{' '}
      cùng{' '}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noreferrer"
        className="text-[#F05A28] hover:underline"
      >
        Điều khoản dịch vụ
      </a>{' '}
      của Google.
    </p>
  );
}
