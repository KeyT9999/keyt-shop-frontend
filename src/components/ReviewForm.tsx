import { useState } from 'react';
import { reviewService, type CreateReviewData } from '../services/reviewService';
import './ReviewForm.css';

interface ReviewFormProps {
  productId: string;
  productName: string;
  productImage: string;
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewForm({
  productId,
  productName,
  productImage,
  orderId,
  onClose,
  onSuccess
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Nội dung đánh giá phải có ít nhất 10 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reviewData: CreateReviewData = {
        productId,
        orderId,
        rating,
        comment: comment.trim()
      };

      await reviewService.createReview(reviewData);
      alert('✅ Đánh giá thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = [
    'Rất tệ',
    'Tệ',
    'Bình thường',
    'Tốt',
    'Tuyệt vời'
  ];

  return (
    <div className="review-form-overlay" onClick={onClose}>
      <div className="review-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-form-header">
          <h2>Đánh giá sản phẩm</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="review-product-info">
          <img src={productImage || '/placeholder.png'} alt={productName} />
          <div>
            <h3>{productName}</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label>Đánh giá của bạn *</label>
            <div className="star-rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  ★
                </button>
              ))}
              <span className="rating-label">
                {ratingLabels[(hoveredRating || rating) - 1]}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Nhận xét của bạn *</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (tối thiểu 10 ký tự)"
              rows={6}
              required
              minLength={10}
              maxLength={1000}
            />
            <div className="char-count">
              {comment.length}/1000 ký tự
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
