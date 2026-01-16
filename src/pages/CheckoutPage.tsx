import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useCartContext } from '../context/useCartContext';
import { useAuthContext } from '../context/useAuthContext';
import { formatPrice } from '../utils/formatPrice';
import { profileService } from '../services/profileService';
import type { Product } from '../types/product';
import API_BASE_URL from '../config/api';
import { CreditCard, User, CheckCircle2 } from 'lucide-react';

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

  // Calculate subtotal and total
  const subtotal = totalAmount;
  const shippingFee = 0; // Free shipping
  const finalTotal = subtotal + shippingFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Cart Link */}
        <Link 
          to="/cart" 
          className="inline-flex items-center text-gray-600 hover:text-[#F05A28] mb-6 transition"
        >
          <span className="mr-2">←</span>
          <span>Quay lại giỏ hàng</span>
        </Link>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán</h1>
          <p className="text-gray-600">Hoàn tất đơn hàng của bạn</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Customer Info, Shipping, Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#F05A28]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Thông tin khách hàng</h2>
                    <p className="text-sm text-gray-500">Điền thông tin giao hàng</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05A28] focus:border-transparent"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05A28] focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05A28] focus:border-transparent"
                      placeholder="0912345678"
                    />
                  </div>

                  {/* Required Fields cho từng sản phẩm */}
                  {cart.map((item) => {
                    if (!item.requiredFields || item.requiredFields.length === 0) {
                      return null;
                    }

                    const hasAllRequiredData = item.requiredFields.every(field => {
                      if (!field.required) return true;
                      const value = item.requiredFieldsData?.[field.label] || requiredFieldsData[item._id]?.[field.label];
                      return value && value.trim() !== '';
                    });

                    if (hasAllRequiredData) {
                      return null;
                    }

                    return (
                      <div key={item._id} className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Thông tin bổ sung cho: {item.name}
                        </h3>
                        {item.requiredFields.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type={field.type === 'email' ? 'email' : 'text'}
                              value={requiredFieldsData[item._id]?.[field.label] || ''}
                              onChange={(e) => handleRequiredFieldChange(item._id, field.label, e.target.value)}
                              placeholder={field.placeholder || ''}
                              required={field.required}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05A28] focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú đơn hàng (tùy chọn)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F05A28] focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#F05A28]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Phương thức thanh toán</h2>
                    <p className="text-sm text-gray-500">Chọn cách thanh toán</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-[#F05A28] rounded-lg cursor-pointer bg-orange-50">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      defaultChecked
                      className="w-4 h-4 text-[#F05A28] focus:ring-[#F05A28]"
                    />
                    <div className="ml-4 flex-1">
                      <div className="font-semibold text-gray-900">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-gray-600">Chuyển khoản trực tiếp</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                {/* Items List */}
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-start gap-3 pb-4 border-b border-gray-200">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-gray-400 text-xs">IMG</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm mb-1">{item.name}</div>
                        <div className="text-xs text-gray-500">Số lượng: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity, item.currency || 'VNĐ')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="text-gray-900 font-medium">{formatPrice(subtotal, 'VNĐ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-2xl font-bold text-[#F05A28]">{formatPrice(finalTotal, 'VNĐ')}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-[#F05A28] hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Đặt hàng ngay</span>
                    </>
                  )}
                </button>

                {/* Guarantees */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Thanh toán an toàn & bảo mật</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Giao hàng tức thì sau thanh toán</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Hoàn tiền 100% nếu có lỗi</span>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {status === 'error' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {message}
                  </div>
                )}
                {status === 'success' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
