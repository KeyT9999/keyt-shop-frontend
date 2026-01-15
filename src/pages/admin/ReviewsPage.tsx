import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { reviewService, type Review } from '../../services/reviewService';
import { Star, Trash2, MessageSquare, Search } from 'lucide-react';

export default function ReviewsPage() {
  const { token } = useAuthContext();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | ''>('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    loadAllReviews();
  }, []);

  const loadAllReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAllReviewsAdmin();
      setReviews(data.reviews);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    
    try {
      await reviewService.deleteReview(reviewId);
      alert('✅ Xóa đánh giá thành công!');
      loadAllReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa đánh giá');
    }
  };

  const handleReply = (review: Review) => {
    setSelectedReview(review);
    setReplyContent(review.reply?.content || '');
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedReview || !replyContent.trim()) {
      alert('Vui lòng nhập nội dung phản hồi');
      return;
    }

    try {
      await reviewService.replyToReview(selectedReview._id, replyContent.trim());
      alert('✅ Phản hồi thành công!');
      setShowReplyModal(false);
      setSelectedReview(null);
      setReplyContent('');
      loadAllReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể gửi phản hồi');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.userId.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = filterRating === '' || review.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? '#fbbf24' : 'none'}
            stroke={star <= rating ? '#fbbf24' : '#d1d5db'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Đang tải danh sách đánh giá...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
          Quản lý Đánh giá
        </h2>
        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
          Tổng: {reviews.length} đánh giá
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '1rem', 
        background: '#f9fafb', 
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {/* Search */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
            Tìm kiếm
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Tìm theo nội dung hoặc tên user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>

        {/* Filter by Rating */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
            Lọc theo số sao
          </label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === '' ? '' : Number(e.target.value))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          >
            <option value="">Tất cả</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <p>Không tìm thấy đánh giá nào</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#3b82f6',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '1.25rem'
                  }}>
                    {review.userId.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
                      {review.userId.username}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Product Info */}
              <div style={{ 
                padding: '0.75rem', 
                background: '#f9fafb', 
                borderRadius: '6px', 
                marginBottom: '1rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <strong>Sản phẩm:</strong> {(review as any).productId?.name || 'N/A'}
              </div>

              {/* Comment */}
              <div style={{ 
                padding: '1rem', 
                background: '#f9fafb', 
                borderRadius: '6px', 
                marginBottom: '1rem',
                color: '#374151',
                lineHeight: '1.6'
              }}>
                {review.comment}
              </div>

              {/* Reply */}
              {review.reply && (
                <div style={{
                  padding: '1rem',
                  background: '#eff6ff',
                  borderLeft: '3px solid #3b82f6',
                  borderRadius: '6px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#3b82f6', fontSize: '0.875rem' }}>Phản hồi từ Shop</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {formatDate(review.reply.repliedAt)}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#374151', lineHeight: '1.6' }}>{review.reply.content}</p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleReply(review)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <MessageSquare size={16} />
                  {review.reply ? 'Sửa phản hồi' : 'Phản hồi'}
                </button>
                <button
                  onClick={() => handleDelete(review._id)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
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
              padding: '2rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#1f2937' }}>
              Phản hồi đánh giá
            </h3>
            
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
                <strong>Rating:</strong> {renderStars(selectedReview.rating)}
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
                marginBottom: '1rem'
              }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedReview(null);
                  setReplyContent('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReply}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
