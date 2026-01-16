import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useCartContext } from '../context/useCartContext';
import { useAuthContext } from '../context/useAuthContext';
import { formatPrice } from '../utils/formatPrice';
import { profileService } from '../services/profileService';
import type { Product } from '../types/product';
import API_BASE_URL from '../config/api';

export default function CheckoutPage() {
  const { cart, totalAmount, clearCart, updateCartItem } = useCartContext();
  const { user, token } = useAuthContext();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({ 
    name: '', 
    email: '', 
    phone: ''
  });
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  // State để lưu dữ liệu requiredFields cho mỗi sản phẩm
  const [requiredFieldsData, setRequiredFieldsData] = useState<Record<string, Record<string, string>>>(() => {
    const initialData: Record<string, Record<string, string>> = {};
    cart.forEach(item => {
      if (item.requiredFieldsData) {
        initialData[item._id] = item.requiredFieldsData;
      }
    });
    return initialData;
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Reload product data từ API để đảm bảo có requiredFields mới nhất
  useEffect(() => {
    if (cart.length > 0) {
      reloadProductsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi component mount

  const reloadProductsData = async () => {
    if (cart.length === 0) return;

    try {
      // Fetch product data cho tất cả items trong cart
      const productPromises = cart.map(async (item) => {
        try {
          const response = await axios.get(`${API_BASE_URL}/products/${item._id}`);
          const productData: Product = response.data;

          // Update cart item với product data mới (đặc biệt là requiredFields)
          if (productData.requiredFields && productData.requiredFields.length > 0) {
            updateCartItem(item._id, {
              requiredFields: productData.requiredFields
            });
            console.log(`✅ Updated product ${item.name} with requiredFields:`, productData.requiredFields);
          }

          return productData;
        } catch (err) {
          console.error(`❌ Error loading product ${item._id}:`, err);
          return null;
        }
      });

      await Promise.all(productPromises);
    } catch (err) {
      console.error('❌ Error reloading products data:', err);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      // Auto điền thông tin từ profile
      setCustomer({
        name: profile.displayName || profile.username || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  const handleChange = (field: keyof typeof customer, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleRequiredFieldChange = (productId: string, fieldLabel: string, value: string) => {
    setRequiredFieldsData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [fieldLabel]: value
      }
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!customer.name || !customer.email || !customer.phone) {
      setStatus('error');
      setMessage('Vui lòng điền đầy đủ thông tin liên hệ.');
      return;
    }

    if (cart.length === 0) {
      setStatus('error');
      setMessage('Giỏ hàng đang trống.');
      return;
    }

    // Validate requiredFields
    for (const item of cart) {
      if (item.requiredFields && item.requiredFields.length > 0) {
        for (const field of item.requiredFields) {
          if (field.required) {
            const value = item.requiredFieldsData?.[field.label] || requiredFieldsData[item._id]?.[field.label];
            if (!value?.trim()) {
              setStatus('error');
              setMessage(`Vui lòng điền đầy đủ thông tin: ${field.label} cho sản phẩm ${item.name}`);
              return;
            }
          }
        }
      }
    }

    setStatus('submitting');

    const payload = {
      customer,
      items: cart.map((item) => {
        const itemData: any = {
          productId: item._id,
          name: item.name,
          price: item.price,
          currency: item.currency,
          quantity: item.quantity
        };

        // Thêm requiredFieldsData nếu có
        if (item.requiredFields && item.requiredFields.length > 0) {
          itemData.requiredFieldsData = item.requiredFields
            .map(field => ({
              label: field.label,
              value: item.requiredFieldsData?.[field.label] || requiredFieldsData[item._id]?.[field.label] || ''
            }))
            .filter(field => field.value.trim());
        }

        return itemData;
      }),
      totalAmount,
      note: note.trim() || undefined
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/orders`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      clearCart();

      // If PayOS checkout URL is available, redirect to it immediately
      if (response.data.checkoutUrl) {
        // Redirect to PayOS checkout page immediately
        window.location.href = response.data.checkoutUrl;
      } else {
        // Fallback: redirect to order detail page if PayOS link not available
        setStatus('success');
        setMessage(`Đơn hàng ${response.data._id} đã được tạo. Đang chuyển đến trang chi tiết...`);
        setTimeout(() => navigate(`/orders/${response.data._id}`), 1500);
      }
    } catch (error: any) {
      console.error('❌ Lỗi khi tạo đơn hàng:', error);
      setStatus('error');
      const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi đơn hàng, vui lòng thử lại sau.';
      setMessage(errorMessage);

      // If order was created but PayOS failed, show specific message
      if (error.response?.data?._id && !error.response?.data?.checkoutUrl) {
        setMessage('Đơn hàng đã được tạo nhưng chưa thể tạo link thanh toán. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Bạn cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">Đăng nhập để tiếp tục đặt đơn hàng.</p>
          <Link 
            to="/login" 
            className="inline-block px-6 py-3 bg-[#F05A28] text-white rounded-lg hover:bg-orange-600 transition"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
          <Link 
            to="/products" 
            className="inline-block px-6 py-3 bg-[#F05A28] text-white rounded-lg hover:bg-orange-600 transition"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>
    );
  }


  // Debug: Log cart items để kiểm tra requiredFields
  // useEffect(() => {
  //   console.log('🛒 Cart items:', cart);
  //   cart.forEach(item => {
  //     console.log(`Product ${item.name}:`, {
  //       hasRequiredFields: !!item.requiredFields,
  //       requiredFields: item.requiredFields
  //     });
  //   });
  // }, [cart]);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <style>
        {`
          .checkout-input:focus {
            border-color: #F05A28 !important;
            box-shadow: 0 0 0 1px #F05A28 !important;
            outline: none;
          }
          .checkout-btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(240, 90, 40, 0.3);
          }
          .checkout-btn-primary:active {
            transform: translateY(0);
          }
          @media (max-width: 768px) {
            .checkout-grid {
              grid-template-columns: 1fr !important;
            }
            .checkout-form-row {
              flex-direction: column !important;
            }
          }
        `}
      </style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#1E293B',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          Thanh toán
        </h1>

        <form onSubmit={handleSubmit} className="checkout-grid" style={{
          display: 'grid',
          gridTemplateColumns: '65% 35%',
          gap: '32px',
          alignItems: 'start'
        }}>

          {/* LEFT COLUMN: BILLING DETAILS */}
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #E2E8F0' }}>
                Thông tin thanh toán
              </h2>

              {/* Name & Phone Row */}
              <div className="checkout-form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                    Họ và tên <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(event) => handleChange('name', event.target.value)}
                    required
                    className="checkout-input"
                    placeholder="Nhập họ tên của bạn"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      color: '#1E293B',
                      background: '#FFFFFF',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                    Số điện thoại <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(event) => handleChange('phone', event.target.value)}
                    required
                    className="checkout-input"
                    placeholder="Nhập số điện thoại"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      color: '#1E293B',
                      background: '#FFFFFF',
                      transition: 'all 0.2s'
                    }}
                  />
                </div>
              </div>

              {/* Email - Full Width */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                  Email <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  required
                  className="checkout-input"
                  placeholder="Nhập địa chỉ email"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    color: '#1E293B',
                    background: '#FFFFFF',
                    transition: 'all 0.2s'
                  }}
                />
              </div>

              {/* Required Fields cho từng sản phẩm */}
              {cart.map((item) => {
                if (!item.requiredFields || item.requiredFields.length === 0) {
                  return null;
                }

                return (
                  <div key={item._id} style={{ marginTop: '20px', padding: '20px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                    <h3 style={{ marginBottom: '16px', color: '#1E293B', fontSize: '1rem', fontWeight: 600 }}>
                      Thông tin bổ sung cho: <span style={{ color: '#F05A28' }}>{item.name}</span>
                    </h3>
                    {item.requiredFields.map((field, fieldIndex) => (
                      <div key={fieldIndex} style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                          {field.label} {field.required && <span style={{ color: '#EF4444' }}>*</span>}
                        </label>
                        <input
                          type={field.type === 'email' ? 'email' : 'text'}
                          value={requiredFieldsData[item._id]?.[field.label] || ''}
                          onChange={(e) => handleRequiredFieldChange(item._id, field.label, e.target.value)}
                          placeholder={field.placeholder || ''}
                          required={field.required}
                          className="checkout-input"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            color: '#1E293B',
                            background: '#FFFFFF',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Additional Note */}
              <div style={{ marginTop: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                  Ghi chú đơn hàng (Tùy chọn)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Thời gian giao hàng, địa chỉ chi tiết..."
                  rows={4}
                  className="checkout-input"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    color: '#1E293B',
                    background: '#FFFFFF',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY (Sticky) */}
          <div style={{ position: 'sticky', top: '24px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '20px' }}>
                  Đơn hàng của bạn
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {cart.map((item) => (
                    <div key={item._id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '8px',
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {item.imageUrl || (item.images && item.images[0]) ? (
                          <img
                            src={item.imageUrl || (item.images && item.images[0]) || undefined}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ fontSize: '24px' }}>📦</span>
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.95rem', lineHeight: '1.4' }}>
                          {item.name}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', alignItems: 'center' }}>
                          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                            SL: {item.quantity} x {formatPrice(item.price, item.currency)}
                          </div>
                          <div style={{ fontWeight: 600, color: '#F05A28', fontSize: '0.95rem' }}>
                            {formatPrice(item.price * item.quantity, item.currency)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ borderTop: '2px dashed #E2E8F0', margin: '20px 0' }}></div>

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#475569' }}>Tổng tiền</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F05A28' }}>
                    {formatPrice(totalAmount, 'VNĐ')}
                  </span>
                </div>

                {/* Status Message */}
                {status === 'error' && (
                  <div style={{ padding: '12px', background: '#FEF2F2', color: '#B91C1C', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>
                    {message}
                  </div>
                )}
                {status === 'success' && (
                  <div style={{ padding: '12px', background: '#ECFDF5', color: '#047857', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center' }}>
                    {message}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="checkout-btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: '#F05A28',
                    color: 'white',
                    border: 'none',
                    borderRadius: '9999px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(240, 90, 40, 0.2)',
                    opacity: status === 'submitting' ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {status === 'submitting' ? 'Đang xử lý...' : 'THANH TOÁN NGAY'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '16px', color: '#64748B', fontSize: '0.8rem' }}>
                  <p>Thông tin thanh toán của bạn được bảo mật an toàn.</p>
                </div>
              </div>
            </div>
        </form>
      </div>
    </div>
  );
}
