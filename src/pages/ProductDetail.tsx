import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/formatPrice';
import { useCartContext } from '../context/useCartContext';
import { useAuthContext } from '../context/useAuthContext';
import { reviewService, type Review, type ReviewStats } from '../services/reviewService';
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const { addItem } = useCartContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const isOutOfStock = useMemo(() => {
    if (!product) return false;
    return product.status === 'out_of_stock' || product.status === 'discontinued' || (product.stock !== undefined && product.stock <= 0);
  }, [product]);

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

  // Load reviews when switching to reviews tab
  useEffect(() => {
    if (activeTab === 'reviews' && id && !reviewsLoading && reviews.length === 0) {
      loadReviews();
    }
  }, [activeTab, id]);

  const loadReviews = async () => {
    if (!id) return;
    
    try {
      setReviewsLoading(true);
      const data = await reviewService.getProductReviews(id, 1, 10);
      setReviews(data.reviews);
      setReviewStats(data.stats);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
                disabled={isOutOfStock}
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
              {isOutOfStock ? 'Hết hàng' : '🛒 Thêm vào giỏ hàng'}
            </button>
              <button
                type="button"
                className="buy-btn buy-now-btn"
                disabled={isOutOfStock}
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
                {isOutOfStock ? 'Hết hàng' : '⚡ Mua ngay'}
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
              <h2 className="panel-title">Đánh giá sản phẩm</h2>
              
              {reviewStats && (
                <div className="review-summary">
                  <div className="rating-overview">
                    <div className="average-rating">
                      <span className="rating-number">{reviewStats.averageRating.toFixed(1)}</span>
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= Math.round(reviewStats.averageRating) ? 'star filled' : 'star'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="total-reviews">{reviewStats.totalReviews} đánh giá</span>
                    </div>
                    
                    <div className="rating-breakdown">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewStats[`rating${star}` as keyof ReviewStats] as number;
                        const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                        return (
                          <div key={star} className="rating-bar-item">
                            <span className="star-label">{star} ★</span>
                            <div className="bar-container">
                              <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {reviewsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>Đang tải đánh giá...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                  <p>Hãy là người đầu tiên đánh giá!</p>
                </div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.userId.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="reviewer-name">{review.userId.username}</div>
                            <div className="review-date">{formatDate(review.createdAt)}</div>
                          </div>
                        </div>
                        <div className="review-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= review.rating ? 'star filled' : 'star'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="review-content">
                        <p>{review.comment}</p>
                      </div>
                      {review.reply && (
                        <div className="review-reply">
                          <div className="reply-header">
                            <strong>Phản hồi từ người bán</strong>
                            <span>{formatDate(review.reply.repliedAt)}</span>
                          </div>
                          <p>{review.reply.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
