import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { profileService } from '../services/profileService';
import './ForgotPasswordPage.css';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Đang xác minh email...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Link xác minh không hợp lệ.');
      return;
    }

    const verify = async () => {
      try {
        const response = await profileService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Xác minh email thành công.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Link xác minh không hợp lệ hoặc đã hết hạn.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-card__header">
          <h2>{status === 'success' ? '🎉 Email đã được xác minh' : '🔐 Xác minh email'}</h2>
        </div>

        <div className="forgot-password-card__content">
          <p>{message}</p>
        </div>

        <div className="forgot-password-card__actions">
          <Link to="/login" className="forgot-password-button primary">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

