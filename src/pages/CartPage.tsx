
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useCartContext } from '../context/useCartContext';
import { formatPrice } from '../utils/formatPrice';

export default function CartPage() {

    const { cart, removeItem, updateQuantity, totalAmount, totalItems } = useCartContext();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag size={40} className="text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Giỏ hàng trống</h2>
                    <p className="text-[#334155] mb-8">Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center justify-center px-8 py-3 bg-[#F05A28] text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-[0_4px_14px_0_rgba(240,90,40,0.39)] w-full"
                    >
                        Khám phá sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

  const { cart, totalAmount, updateQuantity, removeItem, clearCart, updateCartItemOption, updateCartItemRequiredField } = useCartContext();
  const navigate = useNavigate();
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);


    return (

        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans">
            <div className="container mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold text-[#1E293B] mb-8">Giỏ hàng của bạn <span className="text-slate-400 font-normal text-lg ml-2">({totalItems} sản phẩm)</span></h1>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column: Cart Items List */}
                    <div className="lg:w-[70%] space-y-4">
                        {cart.map(item => (
                            <div key={item._id} className="bg-white p-4 md:p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center gap-6 transition-all hover:shadow-md">
                                {/* Thumbnail */}
                                <div className="w-full sm:w-24 h-24 shrink-0 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ShoppingBag size={24} />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 w-full text-center sm:text-left">
                                    <h3 className="text-[#1E293B] font-bold text-lg mb-1 leading-tight">{item.name}</h3>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 text-[#334155] text-sm mb-2">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-600 uppercase tracking-wider">
                                            {item.category || 'Product'}
                                        </span>
                                    </div>
                                    {/* Price Mobile */}
                                    <div className="text-[#F05A28] font-bold text-lg sm:hidden mb-4">
                                        {formatPrice(item.price * item.quantity, item.currency)}
                                    </div>
                                </div>

                                {/* Actions Group */}
                                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                    {/* Quantity Stepper */}
                                    <div className="flex items-center bg-slate-100 rounded-full p-1">
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-500 hover:text-[#1E293B] shadow-sm transition-colors disabled:opacity-50"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-10 text-center text-sm font-bold text-[#1E293B]">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-500 hover:text-[#1E293B] shadow-sm transition-colors"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Price Desktop */}
                                    <div className="hidden sm:block text-[#F05A28] font-bold text-lg min-w-[100px] text-right">
                                        {formatPrice(item.price * item.quantity, item.currency)}
                                    </div>

                                    {/* Remove Action */}
                                    <button
                                        onClick={() => removeItem(item._id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        title="Remove item"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:w-[30%]">
                        <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100">
                            <h2 className="text-xl font-bold text-[#1E293B] mb-6 pb-4 border-b border-slate-50">Tóm tắt đơn hàng</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-[#334155]">
                                    <span>Tạm tính</span>
                                    <span className="font-medium">{formatPrice(totalAmount, cart.length > 0 ? cart[0].currency : 'đ')}</span>
                                </div>
                                <div className="flex justify-between text-[#334155]">
                                    <span>Giảm giá</span>
                                    <span className="text-green-600 font-medium">-0đ</span>
                                </div>
                                <div className="border-t border-slate-100 pt-4 flex justify-between items-center mt-4">
                                    <span className="font-bold text-[#1E293B] text-lg">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-[#F05A28]">{formatPrice(totalAmount, cart.length > 0 ? cart[0].currency : 'đ')}</span>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="w-full bg-[#F05A28] text-white font-bold py-4 rounded-xl hover:bg-orange-600 transition-all shadow-[0_4px_14px_0_rgba(240,90,40,0.39)] flex items-center justify-center gap-2 group"
                            >
                                Thanh toán ngay <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <p className="text-xs text-slate-400 text-center mt-4">
                                Bảo mật thanh toán 100% với SSL Secure
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

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
