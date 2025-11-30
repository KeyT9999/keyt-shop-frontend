import { Link, useNavigate } from 'react-router-dom';
import { useCartContext } from '../context/useCartContext';
import { formatPrice } from '../utils/formatPrice';

export default function CartPage() {
  const { cart, totalAmount, updateQuantity, removeItem, clearCart } = useCartContext();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <p>Giỏ hàng đang trống 🛒</p>
        <Link to="/" className="cart-empty-link">
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>Giỏ hàng của bạn</h2>
      <div className="cart-grid">
        {cart.map((item) => (
          <div key={item._id} className="cart-item">
            <div className="item-meta">
              <h3>{item.name}</h3>
              <p className="category">{item.category}</p>
              <p className="description">{item.description}</p>
            </div>

            <div className="item-actions">
              <div className="quantity-control">
                <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}>-</button>
                <input
                  type="number"
                  value={item.quantity}
                  min={1}
                  onChange={(e) => updateQuantity(item._id, Math.max(1, Number(e.target.value) || 1))}
                />
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
              </div>

              <div className="price">
                {formatPrice(item.price, item.currency)} x {item.quantity}
              </div>

              <div className="item-total">
                Tổng: {formatPrice(item.price * item.quantity, item.currency)}
              </div>

              <div className="item-actions-bottom">
                <button className="remove" onClick={() => removeItem(item._id)}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div>
          <p>Tổng tiền:</p>
          <h3>{formatPrice(totalAmount, 'VNĐ')}</h3>
        </div>
        <div className="summary-actions">
          <button className="clear" onClick={clearCart}>
            Xóa giỏ hàng
          </button>
          <button className="checkout" onClick={() => navigate('/checkout')}>
            Tiến hành thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
