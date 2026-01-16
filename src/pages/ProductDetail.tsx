import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/formatPrice';
import { useCartContext } from '../context/useCartContext';


import { useNotification } from '../context/NotificationContext';

import { useAddToCartAnimation } from '../context/AddToCartAnimationContext';

import { reviewService, type Review, type ReviewStats } from '../services/reviewService';
import { useAuthContext } from '../context/useAuthContext';
import './ProductDetail.css';
import API_BASE_URL from '../config/api';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // HEAD states
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);

  // Remote states for Reviews
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  // Admin reply states
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replying, setReplying] = useState(false);
  
  const { user, token } = useAuthContext();

  const { addItem, clearCart } = useCartContext();
  const { showNotification } = useNotification();
  const { triggerAnimation } = useAddToCartAnimation();

  
  const navigate = useNavigate();

  const isOutOfStock = useMemo(() => {
    if (!product) return false;
    return product.status === 'out_of_stock' || product.status === 'discontinued' || (product.stock !== undefined && product.stock <= 0);
  }, [product]);

  // Fetch Product (HEAD Logic)
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
        if (productData.options && productData.options.length > 0) {
          setSelectedOptionIndex(0);
        } else {
          setSelectedOptionIndex(null);
        }

        // Also fetch review stats initially if possible, or wait till tab switch?
        // Let's safe-check stats loading
        try {
          const reviewData = await reviewService.getProductReviews(id, 1, 1);
          setReviewStats(reviewData.stats);
        } catch (e) {
          console.error("Error fetching initial review stats", e);
        }

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

  // Auto-switch to reviews tab if hash is #reviews
  useEffect(() => {
    if (window.location.hash === '#reviews') {
      setActiveTab('reviews');
      // Remove hash from URL after switching
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Fetch Reviews (Remote Logic)
  useEffect(() => {
    if (activeTab === 'reviews' && id && !reviewsLoading) {
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

  const handleReplyClick = (review: Review) => {
    setSelectedReview(review);
    setReplyContent(review.reply?.content || '');
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedReview || !replyContent.trim()) {
      showNotification('Vui lòng nhập nội dung phản hồi', 'error');
      return;
    }

    if (!user?.admin) {
      showNotification('Chỉ admin mới có thể phản hồi đánh giá', 'error');
      return;
    }

    try {
      setReplying(true);
      if (!token) {
        showNotification('Bạn cần đăng nhập để phản hồi đánh giá', 'error');
        return;
      }
      await reviewService.replyToReview(selectedReview._id, replyContent.trim(), token);
      showNotification('✅ Phản hồi thành công!', 'success');
      setShowReplyModal(false);
      setSelectedReview(null);
      setReplyContent('');
      // Reload reviews to show the new reply
      await loadReviews();
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Không thể gửi phản hồi', 'error');
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#fdfbf7] min-h-screen flex items-center justify-center text-slate-800">
        <div className="text-2xl font-game animate-pulse text-[#F05A28]">LOADING...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#fdfbf7] min-h-screen flex flex-col items-center justify-center text-slate-800 gap-4">
        <div className="text-2xl font-game text-[#F05A28]">ERROR: {error || 'Product Not Found'}</div>
        <Link to="/" className="px-6 py-2 bg-[#F05A28] text-white rounded hover:bg-orange-600 transition">Return to Base</Link>
      </div>
    );
  }

  const currentPrice = selectedOptionIndex !== null && product.options && product.options[selectedOptionIndex]
    ? product.options[selectedOptionIndex].price
    : product.price;

  const currentName = selectedOptionIndex !== null && product.options && product.options[selectedOptionIndex]
    ? `${product.name} - ${product.options[selectedOptionIndex].name}`
    : product.name;

  const handleAddToCart = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Get button position for animation
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;
    
    if (e?.currentTarget) {
      const buttonRect = e.currentTarget.getBoundingClientRect();
      startX = buttonRect.left + buttonRect.width / 2;
      startY = buttonRect.top + buttonRect.height / 2;
    }
    
    // Trigger animation
    triggerAnimation({
      id: `product-${product._id}-${Date.now()}`,
      startX,
      startY,
      productImage: product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : undefined),
    });
    
    // Add to cart
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
    showNotification(`Đã thêm ${currentName} vào giỏ hàng`, 'success');
  };

  const handleBuyNow = (_e?: React.MouseEvent<HTMLButtonElement>) => {
    // Clear existing cart first
    clearCart();
    
    // Add only this product to cart
    if (selectedOptionIndex !== null && product.options && product.options[selectedOptionIndex]) {
      const selectedOption = product.options[selectedOptionIndex];
      const productWithOption: Product = {
        ...product,
        price: selectedOption.price,
        name: `${product.name} - ${selectedOption.name}`
      };
      addItem(productWithOption);
      showNotification(`Đã thêm ${productWithOption.name} vào giỏ hàng`, 'success');
    } else {
      addItem(product);
      showNotification(`Đã thêm ${currentName} vào giỏ hàng`, 'success');
    }
    
    // Navigate to checkout
    navigate('/checkout');
  };

  const displayImage = (product.images && product.images.length > 0) ? product.images[0] : (product.imageUrl || 'https://design.duolingo.com/images/brand/duo-happy.svg');

  return (
    <div className="bg-[#fff9f5] text-slate-800 min-h-screen w-full font-sans overflow-x-hidden selection:bg-[#F05A28]/20 pb-20 relative">
      {/* Background Ambience (Light/Pastel) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#ffedd5] rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#ffe4e6] rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10 px-6 py-12 flex flex-col gap-16">

        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Left: Image Showcase */}
          <div className="w-full md:w-1/2 flex justify-center relative group p-10">
            <div className="absolute inset-0 bg-[#F05A28]/10 rounded-full blur-[60px] transform scale-75 group-hover:scale-90 transition-transform duration-700"></div>

            <img
              src={displayImage}
              alt={product.name}
              className="relative w-64 md:w-96 object-contain drop-shadow-[0_20px_40px_rgba(240,90,40,0.15)] transform hover:-translate-y-2 transition-transform duration-500 z-10"
            />

            {/* Floating Icons */}
            <div className="absolute -right-4 top-10 animate-bounce delay-700 bg-white/80 backdrop-blur-md border border-white/50 p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hidden md:block">
              <i className="fas fa-bolt text-yellow-500 text-xl"></i>
            </div>
            <div className="absolute -left-4 bottom-20 animate-bounce delay-1000 bg-white/80 backdrop-blur-md border border-white/50 p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hidden md:block">
              <i className="fas fa-shield-alt text-green-500 text-xl"></i>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-[#F05A28] text-xs font-bold tracking-wider uppercase shadow-sm">
                  {product.category || 'Premium Package'}
                </span>
                {product.stock && product.stock > 0 && (
                  <span className="px-3 py-1 rounded-full bg-green-100/80 border border-green-200 text-green-600 text-xs font-bold tracking-wider uppercase shadow-sm">
                    In Stock
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight tracking-tight mb-2">
                {currentName}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex text-yellow-400 gap-0.5">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <i key={i} className={`fas fa-star text-sm ${reviewStats && i < Math.round(reviewStats.averageRating) ? '' : 'text-slate-300'}`}></i>
                  ))}
                </div>
                <span>({reviewStats?.totalReviews || 561} reviews)</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-slate-500">Đã bán: </span>
                <span className="font-bold text-slate-700">39</span>
              </div>
            </div>

            <div className="text-4xl md:text-5xl font-bold text-[#F05A28] w-fit tracking-tight">
              {formatPrice(currentPrice, product.currency)}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:border-orange-200 hover:shadow-orange-100/50 transition-all">
                <i className="fas fa-shipping-fast text-[#F05A28]"></i>
                <span className="text-sm font-medium text-slate-600">Giao ngay</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:border-orange-200 hover:shadow-orange-100/50 transition-all">
                <i className="fas fa-infinity text-purple-500"></i>
                <span className="text-sm font-medium text-slate-600">Bảo hành trọn đời</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:border-orange-200 hover:shadow-orange-100/50 transition-all">
                <i className="fas fa-globe text-green-500"></i>
                <span className="text-sm font-medium text-slate-600">Chính chủ</span>
              </div>
            </div>

            {/* Options Selection */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Chọn gói:</label>
                <div className="flex flex-wrap gap-3">
                  {product.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOptionIndex(idx)}
                      className={`px-6 py-3 rounded-xl border transition-all duration-200 font-medium text-sm ${selectedOptionIndex === idx
                        ? 'bg-gradient-to-br from-[#F05A28] to-orange-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-200 border-transparent'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-200 hover:text-[#F05A28]'
                        }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={(e) => handleAddToCart(e)}
                className="flex-1 bg-white border-2 border-slate-200 text-slate-700 hover:border-[#F05A28] hover:text-[#F05A28] hover:bg-orange-50 transition-all flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isOutOfStock}
                title="Thêm vào giỏ hàng"
              >
                <i className="fas fa-cart-plus text-xl"></i>
                <span className="hidden sm:inline">{isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}</span>
              </button>
              <button
                onClick={(e) => handleBuyNow(e)}
                disabled={isOutOfStock}
                className="flex-1 bg-gradient-to-r from-[#F05A28] to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl shadow-[0_10px_30px_rgba(240,90,40,0.3)] hover:shadow-[0_15px_35px_rgba(240,90,40,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg tracking-wide"
              >
                {isOutOfStock ? 'HẾT HÀNG' : 'MUA NGAY'}
                <i className="fas fa-arrow-right text-sm opacity-90"></i>
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT & DETAILS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">

          {/* Left: Detailed Description & Features */}
          <div className="lg:col-span-2 space-y-8">

            {/* Tab Switcher */}
            <div className="flex gap-6 border-b border-slate-200 pb-0">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 px-2 font-bold text-sm uppercase tracking-wider transition-all relative ${activeTab === 'description' ? 'text-[#F05A28]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Mô tả chi tiết
                {activeTab === 'description' && <span className="absolute bottom-[-1px] left-0 w-full h-1 bg-[#F05A28] rounded-t-full"></span>}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 px-2 font-bold text-sm uppercase tracking-wider transition-all relative ${activeTab === 'reviews' ? 'text-[#F05A28]' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Đánh giá ({reviewStats?.totalReviews || 0})
                {activeTab === 'reviews' && <span className="absolute bottom-[-1px] left-0 w-full h-1 bg-[#F05A28] rounded-t-full"></span>}
              </button>
            </div>

            {activeTab === 'description' && (
              <>
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-100 rounded-full blur-3xl group-hover:bg-orange-200/50 transition-colors opacity-60"></div>

                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 relative z-10">
                    <span className="w-1 h-6 rounded-full bg-[#F05A28] block shadow-sm"></span>
                    Thông tin chi tiết
                  </h2>
                  <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-light relative z-10">
                    <p className="whitespace-pre-line">{product.description}</p>
                  </div>
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                      <span className="w-1 h-6 rounded-full bg-[#F05A28] block shadow-sm"></span>
                      Quyền lợi nâng cấp
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex gap-4 p-4 rounded-xl bg-orange-50/50 border border-orange-100/50 hover:bg-orange-50 hover:border-orange-200 transition-all group">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-all duration-300">
                            <i className="fas fa-check text-[#F05A28] text-sm"></i>
                          </div>
                          <div>
                            <p className="text-slate-700 font-medium text-sm pt-2">{feature}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <span className="w-1 h-6 rounded-full bg-[#F05A28] block shadow-sm"></span>
                  Đánh giá từ khách hàng
                </h2>

                {reviewStats && (
                  <div className="review-summary mb-8 bg-slate-50 p-6 rounded-xl">
                    <div className="rating-overview grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="average-rating text-center">
                        <span className="rating-number text-5xl font-black text-slate-800 block">{reviewStats.averageRating.toFixed(1)}</span>
                        <div className="stars my-2 text-yellow-400 text-xl">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= Math.round(reviewStats.averageRating) ? 'fas fa-star' : 'far fa-star text-slate-300'}></span>
                          ))}
                        </div>
                        <span className="total-reviews text-slate-500">{reviewStats.totalReviews} đánh giá</span>
                      </div>

                      <div className="rating-breakdown flex flex-col gap-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviewStats[`rating${star}` as keyof ReviewStats] as number;
                          const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                          return (
                            <div key={star} className="rating-bar-item flex items-center gap-3 text-sm">
                              <span className="star-label w-8 font-bold text-slate-600">{star} <i className="fas fa-star text-xs text-yellow-400"></i></span>
                              <div className="bar-container flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="bar-fill h-full bg-[#F05A28]" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <span className="count w-6 text-right text-slate-400">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {reviewsLoading ? (
                  <div className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F05A28]"></div>
                    <p className="mt-2 text-slate-500">Đang tải đánh giá...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                    <p>Hãy là người đầu tiên đánh giá!</p>
                  </div>
                ) : (
                  <div className="reviews-list space-y-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="review-item border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                        <div className="review-header flex justify-between items-start mb-3">
                          <div className="reviewer-info flex gap-4 items-center">
                            <div className="reviewer-avatar w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                              {review.userId.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="reviewer-name font-bold text-slate-800">{review.userId.username}</div>
                              <div className="review-date text-xs text-slate-400">{formatDate(review.createdAt)}</div>
                            </div>
                          </div>
                          <div className="review-rating text-yellow-400 text-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i key={star} className={star <= review.rating ? 'fas fa-star' : 'far fa-star text-slate-300'}></i>
                            ))}
                          </div>
                        </div>
                        <div className="review-content">
                          <p className="text-slate-600 leading-relaxed">{review.comment}</p>
                        </div>
                        {review.reply && (
                          <div className="review-reply mt-4 p-4 bg-slate-50 rounded-lg border-l-4 border-blue-500">
                            <div className="reply-header flex justify-between items-center mb-2">
                              <strong className="text-blue-600 text-sm">Phản hồi từ người bán</strong>
                              <span className="text-xs text-slate-400">{formatDate(review.reply.repliedAt)}</span>
                            </div>
                            <p className="text-sm text-slate-600">{review.reply.content}</p>
                          </div>
                        )}
                        
                        {/* Admin Reply Button */}
                        {user?.admin && (
                          <div className="mt-3">
                            <button
                              onClick={() => handleReplyClick(review)}
                              className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                              {review.reply ? '✏️ Sửa phản hồi' : '💬 Phản hồi'}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Sidebar Info (Using HEAD style, mostly) */}
          <div className="space-y-6">

            {/* Rating Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
              <div className="text-[#F05A28] text-xs font-bold uppercase tracking-widest mb-4">Khách hàng đánh giá</div>
              <div className="flex flex-col items-center justify-center gap-2 mb-4">
                <span className="text-6xl font-black text-slate-800 tracking-tighter drop-shadow-sm">{reviewStats?.averageRating?.toFixed(1) || '5.0'}</span>
                <div className="flex text-yellow-400 text-sm gap-1">
                  <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                </div>
                <div className="text-slate-400 text-xs mt-1">Dựa trên {reviewStats?.totalReviews || 561} đánh giá</div>
              </div>
            </div>

            {/* Why Buy Card */}
            <div className="bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
              <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider border-b border-orange-100 pb-4 flex items-center">
                <i className="fas fa-crown text-[#F05A28] mr-2 text-lg"></i>
                Vì sao chọn KeyT?
              </h3>
              <div className="space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 mt-1 shadow-sm">
                    <i className="fas fa-rocket text-xs"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">Giao hàng thần tốc</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Hệ thống tự động gửi tài khoản ngay sau khi thanh toán.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F05A28] shrink-0 mt-1 shadow-sm">
                    <i className="fas fa-headset text-xs"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">Hỗ trợ 24/7</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Đội ngũ kỹ thuật hỗ trợ xuyên suốt quá trình sử dụng.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 shrink-0 mt-1 shadow-sm">
                    <i className="fas fa-shield-virus text-xs"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">Bảo hành an tâm</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Hoàn tiền 100% nếu có lỗi từ hệ thống.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Admin Reply Modal */}
      {showReplyModal && selectedReview && user?.admin && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowReplyModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1f2937' }}>
                {selectedReview.reply ? 'Sửa phản hồi đánh giá' : 'Phản hồi đánh giá'}
              </h3>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedReview(null);
                  setReplyContent('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.25rem',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
            
            {/* Review Info */}
            <div style={{ 
              padding: '1rem', 
              background: '#f9fafb', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>User:</strong> {selectedReview.userId.username}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Rating:</strong> {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className={star <= selectedReview.rating ? 'fas fa-star text-yellow-400' : 'far fa-star text-slate-300'}></i>
                ))}
              </div>
              <div>
                <strong>Nội dung:</strong> {selectedReview.comment}
              </div>
            </div>

            {/* Reply Input */}
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Nhập phản hồi của bạn..."
              rows={5}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '1rem',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#F05A28'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedReview(null);
                  setReplyContent('');
                }}
                disabled={replying}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: replying ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                  opacity: replying ? 0.5 : 1
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={replying || !replyContent.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: replying || !replyContent.trim() ? '#9ca3af' : '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: replying || !replyContent.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {replying ? 'Đang gửi...' : selectedReview.reply ? 'Cập nhật phản hồi' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
