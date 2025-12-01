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
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  // State để lưu dữ liệu requiredFields cho mỗi sản phẩm
  // Format: { productId: { fieldLabel: value } }
  const [requiredFieldsData, setRequiredFieldsData] = useState<Record<string, Record<string, string>>>({});

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
      setLoadingProducts(true);
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
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const profile = await profileService.getProfile();
      // Auto điền thông tin từ profile
      setCustomer({
        name: profile.displayName || profile.username || '',
        email: profile.email || '',
        phone: profile.phone || ''
      });
    } catch (err) {
      console.error('Error loading user profile:', err);
    } finally {
      setLoadingProfile(false);
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
        const productFieldsData = requiredFieldsData[item._id] || {};
        for (const field of item.requiredFields) {
          if (field.required && !productFieldsData[field.label]?.trim()) {
            setStatus('error');
            setMessage(`Vui lòng điền đầy đủ thông tin: ${field.label}`);
            return;
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
          const productFieldsData = requiredFieldsData[item._id] || {};
          itemData.requiredFieldsData = item.requiredFields
            .map(field => ({
              label: field.label,
              value: productFieldsData[field.label] || ''
            }))
            .filter(field => field.value.trim()); // Chỉ lưu field có giá trị
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Bạn cần đăng nhập</h2>
        <p>Đăng nhập để tiếp tục đặt đơn hàng.</p>
        <Link to="/login" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 2rem', background: '#2563eb', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Giỏ hàng trống</h2>
        <p>Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
        <Link to="/products" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 2rem', background: '#2563eb', color: 'white', borderRadius: '6px', textDecoration: 'none' }}>
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  // Debug: Log cart items để kiểm tra requiredFields
  useEffect(() => {
    console.log('🛒 Cart items:', cart);
    cart.forEach(item => {
      console.log(`Product ${item.name}:`, {
        hasRequiredFields: !!item.requiredFields,
        requiredFields: item.requiredFields
      });
    });
  }, [cart]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginTop: '2rem' }}>
          {/* Order Summary */}
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.25rem', fontWeight: 600 }}>
              Đơn hàng của bạn ({cart.length} sản phẩm)
            </h2>
            <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
              {cart.map((item) => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {formatPrice(item.price, item.currency)} x {item.quantity}
                    </div>
                    {/* Debug info */}
                    {item.requiredFields && item.requiredFields.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>
                        ⚠️ Cần thông tin bổ sung
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, color: '#1f2937' }}>
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>Tổng tiền</span>
              <strong style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>
                {formatPrice(totalAmount, 'VNĐ')}
              </strong>
            </div>
          </div>

          {/* Payment Information Form */}
          <div style={{ background: '#ffffff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1.25rem', fontWeight: 600 }}>
              Thông tin thanh toán
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                  Tên <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                  Số điện thoại <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(event) => handleChange('phone', event.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                  Email <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Required Fields cho từng sản phẩm */}
              {cart.map((item) => {
                // Debug log
                console.log(`🔍 Checking requiredFields for product ${item.name}:`, {
                  hasRequiredFields: !!item.requiredFields,
                  requiredFields: item.requiredFields,
                  requiredFieldsLength: item.requiredFields?.length || 0
                });

                if (!item.requiredFields || item.requiredFields.length === 0) {
                  return null;
                }

                return (
                  <div key={item._id} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#1f2937', fontSize: '1rem', fontWeight: 600 }}>
                      Thông tin bổ sung cho: {item.name}
                    </h3>
                    {item.requiredFields.map((field, fieldIndex) => (
                      <div key={fieldIndex} style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                          {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                        </label>
                        <input
                          type={field.type === 'email' ? 'email' : 'text'}
                          value={requiredFieldsData[item._id]?.[field.label] || ''}
                          onChange={(e) => handleRequiredFieldChange(item._id, field.label, e.target.value)}
                          placeholder={field.placeholder || ''}
                          required={field.required}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '1rem'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151' }}>
                  Ghi chú về đơn hàng
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: status === 'submitting' ? '#9ca3af' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {status === 'submitting' ? 'Đang xử lý...' : 'Thanh toán bằng chuyển khoản'}
              </button>

              {status === 'error' && (
                <p style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', textAlign: 'center' }}>
                  {message}
                </p>
              )}
              {status === 'success' && (
                <p style={{ marginTop: '1rem', padding: '0.75rem', background: '#d1fae5', color: '#059669', borderRadius: '6px', textAlign: 'center' }}>
                  {message}
                </p>
              )}
            </form>
          </div>
      </div>
    </div>
  );
}
