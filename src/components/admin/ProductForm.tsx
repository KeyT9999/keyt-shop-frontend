import { useState, useRef } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import { uploadService } from '../../services/uploadService';
import type { Product, ProductOption, Category } from '../../types/product';

interface ProductFormProps {
  product?: Product | null;
  categories?: Category[];
  onClose: () => void;
}

export default function ProductForm({ product, categories = [], onClose }: ProductFormProps) {
  const { token } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.images || (product?.imageUrl ? [product.imageUrl] : []));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    currency: product?.currency || 'VND',
    billingCycle: product?.billingCycle || '1 tháng',
    category: product?.category || '',
    stock: product?.stock || 0,
    status: product?.status || 'in_stock',
    lowStockThreshold: product?.lowStockThreshold || 0,
    isHot: product?.isHot || false,
    promotion: product?.promotion || '',
    description: product?.description || '',
    imageUrl: product?.imageUrl || '',
    features: product?.features?.join('\n') || ''
  });
  const [options, setOptions] = useState<ProductOption[]>(product?.options || []);
  const [requiredFields, setRequiredFields] = useState<Array<{
    label: string;
    type: 'email' | 'text' | 'account';
    placeholder: string;
    required: boolean;
  }>>(product?.requiredFields || []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File ảnh không được vượt quá 5MB');
        return;
      }
    }

    setSelectedFiles(prev => [...prev, ...files]);
    setError(null);

    // Create previews for all files
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Bạn cần đăng nhập để thực hiện thao tác này');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let images: string[] = product?.images || (product?.imageUrl ? [product.imageUrl] : []);

      // Upload new images if files are selected
      if (selectedFiles.length > 0) {
        setUploading(true);
        try {
          const uploadResult = await uploadService.uploadProductImages(selectedFiles, token);
          const newImageUrls = uploadResult.images.map(img => img.imageUrl);
          // Merge với ảnh cũ (nếu có)
          images = [...images, ...newImageUrls];
        } catch (uploadErr: any) {
          const uploadErrorMsg = uploadErr.response?.data?.message || 'Không thể upload ảnh';
          setError(uploadErrorMsg);
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        status: formData.status as 'in_stock' | 'out_of_stock' | 'discontinued',
        lowStockThreshold: Number(formData.lowStockThreshold),
        features: formData.features
          .split('\n')
          .map((f) => f.trim())
          .filter((f) => f.length > 0),
        promotion: formData.promotion || undefined,
        description: formData.description || undefined,
        images: images.length > 0 ? images : undefined,
        imageUrl: images.length > 0 ? images[0] : undefined, // Giữ lại imageUrl cho backward compatible
        options: options.length > 0 ? options.map(opt => ({
          name: opt.name.trim(),
          price: Number(opt.price)
        })).filter(opt => opt.name && opt.price > 0) : [],
        requiredFields: requiredFields.length > 0
          ? requiredFields
            .filter(field => field.label.trim() && field.placeholder.trim())
            .map(field => ({
              label: field.label.trim(),
              type: field.type,
              placeholder: field.placeholder.trim(),
              required: field.required
            }))
          : []
      };

      if (product) {
        await adminService.updateProduct(product._id, productData, token);
      } else {
        await adminService.createProduct(productData, token);
      }

      onClose();
    } catch (err: any) {
      console.error('Product save error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Token used:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

      let errorMessage = 'Có lỗi xảy ra';

      if (err.response) {
        if (err.response.status === 401) {
          const errorCode = err.response.data?.code;
          if (errorCode === 'TOKEN_EXPIRED') {
            errorMessage = 'Token đã hết hạn. Vui lòng đăng nhập lại.';
            // Tự động logout nếu token hết hạn
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else {
            errorMessage = err.response.data?.message || 'Token không hợp lệ. Vui lòng đăng nhập lại.';
          }
        } else if (err.response.data?.errors && err.response.data.errors.length > 0) {
          errorMessage = err.response.data.errors[0].msg || err.response.data.message || errorMessage;
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#1E293B', marginBottom: '24px', fontSize: '1.5rem', fontWeight: 700 }}>
        {product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      </h2>

      {error && (
        <div style={{ padding: '16px', background: '#FEF2F2', color: '#B91C1C', borderRadius: '8px', marginBottom: '24px', border: '1px solid #FECACA' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
              Tên sản phẩm <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Nhập tên sản phẩm..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F05A28';
                e.target.style.boxShadow = '0 0 0 1px #F05A28';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
              Danh mục <span style={{ color: '#EF4444' }}>*</span>
            </label>
            {categories.length > 0 ? (
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  background: 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#F05A28'}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                placeholder="Nhập danh mục"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#F05A28'}
                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              />
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
              Giá bán <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#F05A28'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
              Đơn vị tiền tệ <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                background: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#F05A28'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
              Chu kỳ thanh toán <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                background: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#F05A28'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            >
              <option value="1 tháng">1 tháng</option>
              <option value="3 tháng">3 tháng</option>
              <option value="6 tháng">6 tháng</option>
              <option value="1 năm">1 năm</option>
              <option value="Vĩnh viễn">Vĩnh viễn</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
              Tồn kho
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              min="0"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#F05A28'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                background: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#F05A28'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            >
              <option value="in_stock">🟢 Còn hàng</option>
              <option value="out_of_stock">🔴 Hết hàng</option>
              <option value="discontinued">⚪ Ngừng kinh doanh</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
              Ngưỡng cảnh báo tồn kho thấp
            </label>
            <input
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
              min="0"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#F05A28'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1E293B', fontWeight: '600', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={formData.isHot}
              onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: '#F05A28' }}
            />
            🔥 Sản phẩm Hot (Hiển thị nổi bật)
          </label>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Mô tả sản phẩm
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Nhập mô tả chi tiết..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            onFocus={(e) => e.target.style.borderColor = '#F05A28'}
            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Khuyến mãi / Tag (Optional)
          </label>
          <input
            type="text"
            value={formData.promotion}
            onChange={(e) => setFormData({ ...formData, promotion: e.target.value })}
            placeholder="VD: Giảm 20%, Mua 1 Tặng 1"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '0.95rem',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#F05A28'}
            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>
            Hình ảnh sản phẩm
          </label>

          {imagePreviews.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '12px',
              marginBottom: '16px'
            }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '10px 20px',
              background: '#F1F5F9',
              color: '#1E293B',
              border: '1px dashed #94A3B8',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E2E8F0';
              e.currentTarget.style.borderColor = '#64748B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F1F5F9';
              e.currentTarget.style.borderColor = '#94A3B8';
            }}
          >
            <span>📷</span> Thêm hình ảnh
          </button>
        </div>

        {/* Options Section */}
        <div style={{ marginBottom: '24px', padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <label style={{ display: 'block', marginBottom: '16px', color: '#1E293B', fontWeight: 600, fontSize: '1rem' }}>
            Các gói tùy chọn (Options)
          </label>

          {options.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {options.map((option, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ flex: 1, fontWeight: 500, color: '#1E293B' }}>{option.name}</div>
                  <div style={{ color: '#F05A28', fontWeight: '700' }}>
                    {option.price.toLocaleString('vi-VN')} {formData.currency}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOptions(options.filter((_, i) => i !== index))}
                    style={{
                      padding: '6px 12px',
                      background: '#FEF2F2',
                      color: '#EF4444',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#64748B', fontSize: '0.85rem', fontWeight: 500 }}>
                Tên gói (VD: 12 tháng)
              </label>
              <input
                type="text"
                id="option-name"
                placeholder="VD: 1 tháng"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#64748B', fontSize: '0.85rem', fontWeight: 500 }}>
                Giá (+{formData.currency})
              </label>
              <input
                type="number"
                id="option-price"
                placeholder="0"
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const nameInput = document.getElementById('option-name') as HTMLInputElement;
                const priceInput = document.getElementById('option-price') as HTMLInputElement;
                const name = nameInput.value.trim();
                const price = Number(priceInput.value);

                if (name && price > 0) {
                  setOptions([...options, { name, price }]);
                  nameInput.value = '';
                  priceInput.value = '';
                  nameInput.focus();
                }
              }}
              style={{
                padding: '10px 20px',
                background: '#1E293B',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                height: '42px'
              }}
            >
              + Thêm
            </button>
          </div>
        </div>

        {/* Required Fields Section */}
        <div style={{ marginBottom: '24px', padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#1E293B', fontWeight: 600, fontSize: '1rem' }}>
              Trường thông tin bắt buộc (Required Fields)
            </label>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>
              Thông tin khách hàng cần cung cấp khi đặt hàng (VD: Email, ID tài khoản)
            </p>
          </div>

          {requiredFields.length > 0 && (
            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {requiredFields.map((field, index) => (
                <div key={index} style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>{field.label}</span>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        background: '#F1F5F9',
                        color: '#64748B',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        fontWeight: 600
                      }}>{field.type}</span>
                      {field.required && <span style={{ color: '#EF4444', fontSize: '0.75rem' }}>REQUIRED</span>}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '2px' }}>{field.placeholder}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequiredFields(requiredFields.filter((_, i) => i !== index))}
                    style={{
                      padding: '6px 12px',
                      background: '#FEF2F2',
                      color: '#EF4444',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#64748B', fontSize: '0.85rem', fontWeight: 500 }}>
                Nhãn (VD: Email Canva)
              </label>
              <input
                type="text"
                id="required-field-label"
                placeholder="VD: Email Canva"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#64748B', fontSize: '0.85rem', fontWeight: 500 }}>
                Loại
              </label>
              <select
                id="required-field-type"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="account">Account</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#64748B', fontSize: '0.85rem', fontWeight: 500 }}>
                Gợi ý (Placeholder)
              </label>
              <input
                type="text"
                id="required-field-placeholder"
                placeholder="VD: Nhập email..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ paddingBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.85rem', color: '#1E293B', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  id="required-field-required"
                  defaultChecked={true}
                />
                Bắt buộc
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                const labelInput = document.getElementById('required-field-label') as HTMLInputElement;
                const typeInput = document.getElementById('required-field-type') as HTMLSelectElement;
                const placeholderInput = document.getElementById('required-field-placeholder') as HTMLInputElement;
                const requiredInput = document.getElementById('required-field-required') as HTMLInputElement;

                const label = labelInput.value.trim();
                const type = typeInput.value as 'email' | 'text' | 'account';
                const placeholder = placeholderInput.value.trim();
                const required = requiredInput.checked;

                if (label && placeholder) {
                  setRequiredFields([...requiredFields, { label, type, placeholder, required }]);
                  labelInput.value = '';
                  typeInput.value = 'text';
                  placeholderInput.value = '';
                  requiredInput.checked = true;
                  labelInput.focus();
                }
              }}
              style={{
                padding: '10px 20px',
                background: '#1E293B',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                height: '42px'
              }}
            >
              + Thêm
            </button>
          </div>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: '#ffffff',
              color: '#64748B',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            style={{
              padding: '12px 32px',
              background: (loading || uploading) ? '#94A3B8' : '#F05A28',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              cursor: (loading || uploading) ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 4px 6px -1px rgba(240, 90, 40, 0.2)',
              transition: 'all 0.2s',
              minWidth: '160px'
            }}
            onMouseEnter={(e) => {
              if (!loading && !uploading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(240, 90, 40, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !uploading) {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(240, 90, 40, 0.2)';
              }
            }}
          >
            {loading ? 'Đang lưu...' : uploading ? 'Đang upload...' : product ? 'Cập nhật' : 'Tạo sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
}
