import { useState, useEffect } from 'react';
import { profileService } from '../../services/profileService';
import type { Order } from '../../types/profile';
import { formatPrice } from '../../utils/formatPrice';

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="profile-tab">
        <div className="profile-tab__header">
          <h2>Đơn hàng</h2>
        </div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-tab">
        <div className="profile-tab__header">
          <h2>Đơn hàng</h2>
        </div>
        <div className="profile-message error">{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-tab">
      <div className="profile-tab__header">
        <h2>Lịch sử đơn hàng</h2>
      </div>

      {orders.length === 0 ? (
        <div className="profile-empty">
          <p>📦 Bạn chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card__header">
                <div className="order-card__info">
                  <h3>Đơn hàng #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="order-card__date">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className={`order-card__status ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="order-card__items">
                <p><strong>Sản phẩm:</strong></p>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.name} x{item.quantity} - {formatPrice(item.price, item.currency)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-card__footer">
                <div className="order-card__total">
                  <strong>Tổng tiền: {formatPrice(order.totalAmount, order.items[0]?.currency || 'VND')}</strong>
                </div>
                <button
                  className="profile-button secondary"
                  onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                >
                  {selectedOrder?._id === order._id ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                </button>
              </div>

              {selectedOrder?._id === order._id && (
                <div className="order-card__details">
                  <div className="order-details">
                    <h4>Thông tin khách hàng</h4>
                    <p><strong>Tên:</strong> {order.customer.name}</p>
                    <p><strong>Email:</strong> {order.customer.email}</p>
                    <p><strong>Số điện thoại:</strong> {order.customer.phone}</p>
                  </div>
                  <div className="order-details">
                    <h4>Chi tiết sản phẩm</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item-detail">
                        <p><strong>{item.name}</strong></p>
                        <p>Số lượng: {item.quantity}</p>
                        <p>Giá: {formatPrice(item.price, item.currency)}</p>
                        <p>Thành tiền: {formatPrice(item.price * item.quantity, item.currency)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

