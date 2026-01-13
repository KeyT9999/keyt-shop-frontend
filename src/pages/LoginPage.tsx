import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthContext } from '../context/useAuthContext';
import { profileService } from '../services/profileService';
import { User, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const { login, loginWithGoogle, loading, error, errorCode } = useAuthContext();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  // Animation state for entrance
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!credentials.username || !credentials.password) {
      setFormError('Điền đủ username và password');
      return;
    }
    setFormError(null);
    try {
      await login(credentials);
      navigate('/');
    } catch {
      // error message already saved in context
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response?.credential) {
      setFormError('Không nhận được token Google.');
      return;
    }

    setFormError(null);
    try {
      await loginWithGoogle(response.credential);
      navigate('/');
    } catch {
      // Axios error already handled inside AuthContext
    }
  };

  const handleGoogleError = () => {
    setFormError('Không thể đăng nhập bằng Google.');
  };

  const handleResendVerification = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resendEmail) {
      setResendMessage('Nhập email để nhận lại link xác minh.');
      return;
    }
    setResendLoading(true);
    setResendMessage(null);
    try {
      const response = await profileService.resendVerification(resendEmail);
      setResendMessage(response.message);
    } catch (err: any) {
      setResendMessage(err.response?.data?.message || 'Không thể gửi lại link xác minh.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-royal-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl opacity-60" />
      </div>

      <div
        className={`w-full max-w-[440px] bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10 relative z-10 transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
      >
        <div className="text-center mb-8">
          <p className="text-royal-blue-600 font-bold tracking-wider text-xs uppercase mb-2">Chào mừng trở lại</p>
          <h2 className="text-3xl font-bold text-gray-800">Tiệm Tạp Hóa KeyT</h2>
          <p className="text-gray-500 text-sm mt-2">Đăng nhập tài khoản của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group space-y-1">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-royal-blue-500 transition-colors">
                <User size={20} />
              </div>
              <input
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-royal-blue-500 focus:ring-4 focus:ring-royal-blue-500/10 transition-all duration-200"
                placeholder="Username"
                value={credentials.username}
                onChange={(event) => setCredentials((prev) => ({ ...prev, username: event.target.value }))}
                required
              />
            </div>
          </div>

          <div className="group space-y-1">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-royal-blue-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type="password"
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-royal-blue-500 focus:ring-4 focus:ring-royal-blue-500/10 transition-all duration-200"
                placeholder="Password"
                value={credentials.password}
                onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-royal-blue-600 focus:ring-royal-blue-500 cursor-pointer" />
              <span className="text-gray-500 group-hover:text-gray-700 transition-colors">Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password" className="text-royal-blue-600 hover:text-royal-blue-700 font-medium hover:underline transition-all">
              Quên mật khẩu?
            </Link>
          </div>

          {(formError || error) && (
            <div className="flex items-center gap-3 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 animate-pulse">
              <AlertCircle size={18} className="shrink-0" />
              <p>{formError || error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-royal-blue-600 to-royal-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-royal-blue-500/30 hover:shadow-royal-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium tracking-wide">Hoặc tiếp tục với</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full">
            {/* Google Login Component centered */}
            <div className="flex justify-center transform hover:-translate-y-0.5 transition-transform duration-200">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                shape="rectangular"
                text="signin_with"
                width="100%"
                locale="vi"
              />
            </div>
          </div>
        </div>

        {errorCode === 'EMAIL_NOT_VERIFIED' && (
          <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleResendVerification} className="space-y-4">
              <div className="flex items-start gap-3 bg-indigo-50 text-indigo-700 p-4 rounded-xl text-sm border border-indigo-100">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p>Tài khoản chưa xác minh email. Vui lòng nhập email để nhận lại liên kết kích hoạt.</p>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-royal-blue-500 focus:ring-4 focus:ring-royal-blue-500/10 transition-all"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                />
              </div>

              {resendMessage && (
                <div className={`p-3 rounded-lg text-sm border flex items-center gap-2 ${resendMessage.includes('thành công') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {resendMessage.includes('thành công') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {resendMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={resendLoading}
                className="w-full py-3 px-4 bg-indigo-100 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-200 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {resendLoading ? 'Đang gửi...' : 'Gửi lại link xác minh'}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-royal-blue-600 font-semibold hover:text-royal-blue-800 transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

