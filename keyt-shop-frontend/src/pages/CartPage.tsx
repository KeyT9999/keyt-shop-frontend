import { Link, useNavigate } from 'react-router-dom';
import { useCartContext } from '../context/useCartContext';
import { formatPrice } from '../utils/formatPrice';
import { useTranslation } from 'react-i18next';
import { X, ShoppingBag } from 'lucide-react';
import './CartPage.css';

export default function CartPage() {
  const { cart, totalAmount, updateQuantity, removeItem, clearCart } = useCartContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const subtotal = totalAmount;
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="cart-empty-container">
        <div className="cart-empty-content">
          <ShoppingBag size={64} strokeWidth={1} style={{ color: '#9ca3af' }} />
          <h2>{t('cart.empty')}</h2>
          <p>{t('cart.empty_desc')}</p>
          <Link to="/products" className="continue-shopping-btn">
            {t('cart.view_products')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-content">
        {/* Left Side - Cart Items */}
        <div className="cart-items-section">
          <div className="cart-header">
            <div>
              <h1>{t('cart.title')}</h1>
              <p className="cart-count">{cart.length} items in your cart</p>
            </div>
            <button className="clear-cart-btn" onClick={clearCart}>
              <span>🗑️</span> Clear Cart
            </button>
          </div>

          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item._id} className="cart-item-card">
                <button className="remove-item-btn" onClick={() => removeItem(item._id)}>
                  <X size={20} />
                </button>

                <div className="item-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="image-placeholder">
                      <ShoppingBag size={32} strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-category">{item.category}</p>
                  
                  <div className="item-meta">
                    {item.duration && (
                      <span className="meta-tag">Duration: {item.duration}</span>
                    )}
                    {item.type && (
                      <span className="meta-tag">Type: {item.type}</span>
                    )}
                  </div>
                </div>

                <div className="item-actions">
                  <div className="quantity-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                    >
                      −
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-pricing">
                    <div className="item-price">{formatPrice(item.price * item.quantity, item.currency)}</div>
                    <div className="item-price-each">{formatPrice(item.price, item.currency)} each</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Order Summary */}
        <div className="order-summary-section">
          <div className="order-summary-card">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span className="summary-amount">{formatPrice(subtotal, 'VNĐ')}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="summary-amount free-badge">Free</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Total</span>
              <span className="total-amount">{formatPrice(total, 'VNĐ')}</span>
            </div>

            <button className="checkout-btn" onClick={() => navigate('/checkout')}>
              {t('cart.checkout')}
            </button>

            <button className="continue-shopping-btn-secondary" onClick={() => navigate('/products')}>
              {t('cart.continue_shopping')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
