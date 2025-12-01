import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/formatPrice';
import { useCartContext } from '../context/useCartContext';
import { useAuthContext } from '../context/useAuthContext';
import './ProductDetail.css';
import API_BASE_URL from '../config/api';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem } = useCartContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError('Không tìm thấy sản phẩm');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/products/${id}`);
        const productData = response.data;
        setProduct(productData);
        // Tự động chọn option đầu tiên nếu có options
        if (productData.options && productData.options.length > 0) {
          setSelectedOptionIndex(0);
        } else {
          setSelectedOptionIndex(null);
        }
        // Reset image index
        setCurrentImageIndex(0);
        setError(null);
      } catch (err) {
        console.error('❌ Lỗi khi lấy chi tiết:', err);
        setError('Không thể tải thông tin sản phẩm.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
  return (
      <div className="product-detail-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải chi tiết sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-box">
          <p>⚠️ {error || 'Không tìm thấy sản phẩm'}</p>
          <Link to="/" className="back-link">← Quay lại danh sách</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      {/* Main Content */}
      <div className="product-detail-container">
        {/* Left: Product Image */}
        <div className="product-image-section">
          <div className="product-image-wrapper">
            {(() => {
              const images = product.images && product.images.length > 0 
                ? product.images 
                : (product.imageUrl ? [product.imageUrl] : []);
              
              if (images.length === 0) {
                return (
              <div className="image-placeholder">
                <span>🎨</span>
              </div>
                );
              }

              const currentImage = images[currentImageIndex] || images[0];
              
              return (
                <>
                  <img src={currentImage} alt={`${product.name} - ${currentImageIndex + 1}`} />
                  
                  {images.length > 1 && (
                    <>
                      <button
                        className="image-nav-btn image-nav-prev"
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === 0 ? images.length - 1 : prev - 1
                        )}
                        aria-label="Ảnh trước"
                      >
                        ‹
                      </button>
                      <button
                        className="image-nav-btn image-nav-next"
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === images.length - 1 ? 0 : prev + 1
                        )}
                        aria-label="Ảnh sau"
                      >
                        ›
                      </button>
                      <div className="image-counter">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                  type="button"
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="product-info-section">
          <div className="product-label">Sản phẩm</div>
          <h1 className="product-title">{product.name}</h1>

          {/* Reviews & Stats */}
          <div className="product-stats">
            <div className="stars">★★★★★</div>
            <span className="stats-text">561 Reviews | Đã bán: 5750 | Khiếu nại: 0.0%</span>
          </div>

          {/* Usage Info */}
          {product.description && (
            <div className="usage-info">
              <p>{product.description}</p>
            </div>
          )}

          {/* Seller Info */}
          <div className="seller-info">
            <span className="seller-label">Người bán:</span>
            <span className="seller-name">Tiệm Tạp Hóa KeyT</span>
            <span className="seller-tag tag-online">Online</span>
            <span className="seller-tag tag-verified">Đã xác thực</span>
          </div>

          {/* Product Type & Stock */}
          <div className="product-meta">
            <div className="meta-item">
              <span className="meta-label">Sản phẩm:</span>
              <span className="meta-value">{product.category}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Kho:</span>
              <span className="meta-value">{product.stock}</span>
            </div>
          </div>

          {/* Price */}
          <div className="product-price">
            {selectedOptionIndex !== null && product.options && product.options[selectedOptionIndex]
              ? formatPrice(product.options[selectedOptionIndex].price, product.currency)
              : formatPrice(product.price, product.currency)}
          </div>

          {/* Product Options */}
          {product.options && product.options.length > 0 && (
            <div className="subscription-section">
              <h3 className="section-title">SẢN PHẨM</h3>
              <div className="subscription-options">
                {product.options.map((option, index) => (
                  <button
                    key={index}
                    className={`subscription-btn ${selectedOptionIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedOptionIndex(index)}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!user ? (
            <div className="action-section">
              <p className="login-message">
                Vui lòng đăng nhập để mua hàng, hoặc liên lạc với chủ shop.
              </p>
              <Link to="/login" className="login-btn">
                Đăng nhập
              </Link>
            </div>
          ) : (
            <div className="action-section">
            <button
              type="button"
                className="buy-btn add-to-cart-btn"
                onClick={() => {
                  // Nếu có option được chọn, tạo product với giá từ option
                  if (selectedOptionIndex !== null && product.options && product.options[selectedOptionIndex]) {
                    const selectedOption = product.options[selectedOptionIndex];
                    const productWithOption: Product = {
                      ...product,
                      price: selectedOption.price,
                      name: `${product.name} - ${selectedOption.name}`
                    };
                    addItem(productWithOption);
                  } else {
                    addItem(product);
                  }
                }}
            >
              🛒 Thêm vào giỏ hàng
            </button>
              <button
                type="button"
                className="buy-btn buy-now-btn"
                onClick={() => {
                  // Thêm sản phẩm vào giỏ hàng
                  if (selectedOptionIndex !== null && product.options && product.options[selectedOptionIndex]) {
                    const selectedOption = product.options[selectedOptionIndex];
                    const productWithOption: Product = {
                      ...product,
                      price: selectedOption.price,
                      name: `${product.name} - ${selectedOption.name}`
                    };
                    addItem(productWithOption);
                  } else {
                    addItem(product);
                  }
                  // Chuyển đến trang checkout
                  navigate('/checkout');
                }}
              >
                ⚡ Mua ngay
              </button>
          </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="product-tabs">
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Mô tả
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'description' && product && (
            <div className="tab-panel">
              <h2 className="panel-title">{product.name}</h2>
              
              {product.description && (
                <div className="content-section">
                  <div style={{ 
                    color: '#1f2937', 
                    lineHeight: '1.8', 
                    fontSize: '1rem',
                    whiteSpace: 'pre-line'
                  }}>
                    {product.description}
                  </div>
                </div>
              )}

              {product.features && product.features.length > 0 && (
                <>
                  {product.description && <div className="content-divider"></div>}
                  <div className="content-section">
                    <h3 className="section-heading green">Tính năng nổi bật:</h3>
                    <ul className="content-list">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-panel">
              <h2 className="panel-title">Reviews</h2>
              <p>Chức năng reviews đang được phát triển...</p>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
