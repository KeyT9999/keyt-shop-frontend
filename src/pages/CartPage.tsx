import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartContext } from '../context/useCartContext';
import { formatPrice } from '../utils/formatPrice';

export default function CartPage() {
  const { cart, totalAmount, updateQuantity, removeItem, clearCart, updateCartItemOption, updateCartItemRequiredField } = useCartContext();
  const navigate = useNavigate();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="cart-empty">
          <p>Giỏ hàng đang trống 🛒</p>
          <Link to="/products" className="cart-empty-link">
            Quay lại mua sắm
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = 0; // Free shipping
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <div className="cart-page-wrapper">
        <div className="cart-items-section">
          <div className="cart-header">
            <h2>Shopping Cart</h2>
            <p className="cart-count">{totalItems} items in your cart</p>
          </div>
          <button className="clear-cart-btn" onClick={clearCart}>
            🗑️ Clear Cart
          </button>

          <div className="cart-items-list">
            {cart.map((item) => {
              // Lấy hình ảnh: ưu tiên images[0], sau đó imageUrl
              const itemImage = item.images && item.images.length > 0 
                ? item.images[0] 
                : item.imageUrl;

              // Lấy giá hiện tại (từ option được chọn hoặc giá mặc định)
              const currentPrice = item.selectedOptionIndex !== undefined && item.options && item.options[item.selectedOptionIndex]
                ? item.options[item.selectedOptionIndex].price
                : item.price;

              return (
                <div key={item._id} className="cart-item-card">
                  <div className="cart-item-image">
                    {itemImage ? (
                      <img src={itemImage} alt={item.name} />
                    ) : (
                      <div className="image-placeholder">📦</div>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.name}</h3>
                    <p className="cart-item-category">{item.category}</p>
                    
                    {/* Hiển thị dropdown chọn gói nếu có options */}
                    {item.options && item.options.length > 0 && (
                      <div className="cart-item-options">
                        <label className="options-label">CHỌN GÓI:</label>
                        <div className="options-dropdown-wrapper">
                          <button 
                            className="options-dropdown-btn"
                            onClick={() => setOpenDropdownId(openDropdownId === item._id ? null : item._id)}
                          >
                            <span>{item.options[item.selectedOptionIndex ?? 0].name}</span>
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 16 16" 
                              fill="none"
                              style={{ transform: openDropdownId === item._id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                            >
                              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          {openDropdownId === item._id && (
                            <div className="options-dropdown-menu">
                              {item.options.map((option, idx) => (
                                <button
                                  key={idx}
                                  className={`option-item ${(item.selectedOptionIndex ?? 0) === idx ? 'active' : ''}`}
                                  onClick={() => {
                                    updateCartItemOption(item._id, idx);
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  {option.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Hiển thị thông tin bổ sung (requiredFields) */}
                    {item.requiredFields && item.requiredFields.length > 0 && (
                      <div className="cart-item-required-fields">
                        <div className="required-fields-header">
                          Thông tin bổ sung cho: <strong>{item.name}</strong>
                        </div>
                        {item.requiredFields.map((field, fieldIdx) => (
                          <div key={fieldIdx} className="required-field-group">
                            <label className="required-field-label">
                              {field.label} {field.required && <span className="required-asterisk">*</span>}
                            </label>
                            <input
                              type={field.type === 'email' ? 'email' : 'text'}
                              className="required-field-input"
                              placeholder={field.placeholder}
                              value={item.requiredFieldsData?.[field.label] || ''}
                              onChange={(e) => updateCartItemRequiredField(item._id, field.label, e.target.value)}
                              required={field.required}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="cart-item-quantity">
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-price">
                    <div className="item-total-price">{formatPrice(currentPrice * item.quantity, item.currency)}</div>
                    <div className="item-unit-price">{formatPrice(currentPrice, item.currency)} each</div>
                  </div>

                  <button 
                    className="cart-item-remove"
                    onClick={() => removeItem(item._id)}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cart-summary-section">
          <div className="order-summary-card">
            <h3 className="summary-title">Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span className="summary-value">{formatPrice(totalAmount, 'VNĐ')}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="summary-value free-badge">Free</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <span className="summary-value total-amount">{formatPrice(totalAmount + shippingCost, 'VNĐ')}</span>
            </div>

            <button 
              className="checkout-button"
              onClick={() => navigate('/checkout')}
            >
              Tiến hành thanh toán
            </button>

            <button 
              className="continue-shopping-button"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
