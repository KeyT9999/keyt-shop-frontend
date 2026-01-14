import { useNavigate } from 'react-router-dom';
import OrdersTab from '../components/profile/OrdersTab';

export default function UserOrdersPage() {
    const navigate = useNavigate();

    return (
        <div className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/profile')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: '#ffffff',
                        color: '#374151',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        marginBottom: '1rem'
                    }}
                >
                    ← Quay lại Profile
                </button>
                <h1 style={{ color: '#1f2937', margin: 0 }}>Lịch sử đơn hàng</h1>
                <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                    Xem và quản lý tất cả đơn hàng của bạn
                </p>
            </div>
            <OrdersTab />
        </div>
    );
}
