import { useState, useRef } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import { uploadService } from '../../services/uploadService';
import type { Product, ProductOption } from '../../types/product';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

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
    billingCycle: product?.billingCycle || 'tháng',
    category: product?.category || '',
    stock: product?.stock || 0,
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
        features: formData.features
          .split('\n')
          .map((f) => f.trim())
          .filter((f) => f.length > 0),
        promotion: formData.promotion || null,
        description: formData.description || null,
        images: images.length > 0 ? images : null,
        imageUrl: images.length > 0 ? images[0] : null, // Giữ lại imageUrl cho backward compatible
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
    <div>
      <h2 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>
        {product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
      </h2>

      {error && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
              Danh mục *
            </label>
            {categories.length > 0 ? (
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
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
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
              Giá *
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
                padding: '0.75rem',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
              Đơn vị tiền tệ *
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="VND">VND</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
              Chu kỳ thanh toán *
            </label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="tháng">Tháng</option>
              <option value="năm">Năm</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
              Tồn kho
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              min="0"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
            <input
              type="checkbox"
              checked={formData.isHot}
              onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
            />
            Sản phẩm Hot
          </label>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
            Mô tả
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
            Khuyến mãi
          </label>
          <input
            type="text"
            value={formData.promotion}
            onChange={(e) => setFormData({ ...formData, promotion: e.target.value })}
            placeholder="VD: Giảm 20%"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
            Hình ảnh sản phẩm (có thể chọn nhiều ảnh)
          </label>
          
          {imagePreviews.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '120px',
                      borderRadius: '8px',
                      border: '1px solid #e5e5e5',
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
                      background: '#ef4444',
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
                      fontWeight: 'bold'
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
              padding: '0.75rem 1.5rem',
              background: '#f3f4f6',
              color: '#1f2937',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            + Thêm ảnh
          </button>
        </div>

        {/* Options Section */}
        <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <label style={{ display: 'block', marginBottom: '1rem', color: '#1f2937', fontWeight: '600', fontSize: '1rem' }}>
            Options (VD: 1 tháng, 5 tháng, 12 tháng)
          </label>
          
          {options.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              {options.map((option, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  marginBottom: '0.5rem',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#ffffff',
                  borderRadius: '6px',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#1f2937' }}>{option.name}</strong>
                  </div>
                  <div style={{ color: '#2563eb', fontWeight: '600' }}>
                    {option.price.toLocaleString('vi-VN')} {formData.currency}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOptions(options.filter((_, i) => i !== index))}
                    style={{
                      padding: '0.5rem',
                      background: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>
                Tên option (VD: 1 tháng)
              </label>
              <input
                type="text"
                id="option-name"
                placeholder="VD: 1 tháng"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>
                Giá
              </label>
              <input
                type="number"
                id="option-price"
                placeholder="0"
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '1rem'
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
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#22c55e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              + Thêm
            </button>
          </div>
        </div>

        {/* Required Fields Section */}
        <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <label style={{ display: 'block', marginBottom: '1rem', color: '#1f2937', fontWeight: '600', fontSize: '1rem' }}>
            Điều kiện cần (Required Fields)
            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 'normal', marginLeft: '0.5rem' }}>
              - Thông tin bổ sung khách hàng cần nhập khi mua sản phẩm
            </span>
          </label>
          
          {requiredFields.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              {requiredFields.map((field, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  marginBottom: '0.5rem',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#ffffff',
                  borderRadius: '6px',
                  border: '1px solid #e5e5e5'
                }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <strong style={{ color: '#1f2937', fontSize: '0.9rem' }}>{field.label}</strong>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        background: field.type === 'email' ? '#dbeafe' : field.type === 'account' ? '#fef3c7' : '#f3f4f6',
                        color: field.type === 'email' ? '#1e40af' : field.type === 'account' ? '#92400e' : '#374151',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {field.type}
                      </span>
                      {field.required && (
                        <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>*</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {field.placeholder}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequiredFields(requiredFields.filter((_, i) => i !== index))}
                    style={{
                      padding: '0.5rem',
                      background: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto auto', gap: '0.5rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>
                Label (VD: Email Canva)
              </label>
              <input
                type="text"
                id="required-field-label"
                placeholder="VD: Email Canva"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>
                Type
              </label>
              <select
                id="required-field-type"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="account">Account</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>
                Placeholder
              </label>
              <input
                type="text"
                id="required-field-placeholder"
                placeholder="VD: Vui lòng nhập email Canva"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="required-field-required"
                  defaultChecked={true}
                  style={{ cursor: 'pointer' }}
                />
                Required
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
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#22c55e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              + Thêm
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937', fontWeight: '600' }}>
            Tính năng (mỗi dòng một tính năng)
          </label>
          <textarea
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            rows={5}
            placeholder="Tính năng 1&#10;Tính năng 2&#10;Tính năng 3"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f3f4f6',
              color: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1
            }}
          >
            {uploading ? 'Đang upload ảnh...' : loading ? 'Đang lưu...' : product ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
}

