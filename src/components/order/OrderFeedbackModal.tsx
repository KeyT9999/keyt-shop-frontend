import { useState, useEffect } from 'react';
import { profileService } from '../../services/profileService';
import type { Order, OrderFeedbackData } from '../../types/profile';

interface OrderFeedbackModalProps {
  order: Order;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OrderFeedbackModal({ order, onClose, onSuccess }: OrderFeedbackModalProps) {
  const [feedbacks, setFeedbacks] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Initialize feedbacks from existing order items
    const initialFeedbacks: Record<string, { rating: number; comment: string }> = {};
    order.items.forEach(item => {
      if (item.feedback) {
        initialFeedbacks[item.productId] = {
          rating: item.feedback.rating,
          comment: item.feedback.comment || ''
        };
      } else {
        initialFeedbacks[item.productId] = {
          rating: 0,
          comment: ''
        };
      }
    });
    setFeedbacks(initialFeedbacks);
  }, [order]);

  const handleRatingChange = (productId: string, rating: number) => {
    setFeedbacks(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        rating
      }
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setFeedbacks(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        comment
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Submit feedback for each item
      const promises = order.items.map(async (item) => {
        const feedback = feedbacks[item.productId];
        if (feedback && feedback.rating > 0) {
          const feedbackData: OrderFeedbackData = {
            productId: item.productId,
            rating: feedback.rating,
            comment: feedback.comment || undefined
          };
          await profileService.submitOrderFeedback(order._id, feedbackData);
        }
      });

      await Promise.all(promises);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasAnyRating = Object.values(feedbacks).some(f => f.rating > 0);

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
            Đánh giá sản phẩm
          </h2>
          <button
            onClick={onClose}
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

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <p style={{ fontSize: '1.125rem', color: '#10b981', fontWeight: 600 }}>
              Đánh giá đã được gửi thành công!
            </p>
          </div>
        ) : (
          <>
            <p style={{ margin: '0 0 1.5rem 0', color: '#6b7280', fontSize: '0.875rem' }}>
              Vui lòng đánh giá các sản phẩm trong đơn hàng của bạn. Bạn có thể đánh giá một hoặc nhiều sản phẩm.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              {order.items.map((item, index) => {
                const feedback = feedbacks[item.productId] || { rating: 0, comment: '' };
                const hasExistingFeedback = item.feedback;

                return (
                  <div
                    key={item.productId}
                    style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      border: hasExistingFeedback ? '2px solid #10b981' : '1px solid #e5e5e5'
                    }}
                  >
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                      {item.name}
                      {hasExistingFeedback && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#10b981' }}>
                          (Đã đánh giá)
                        </span>
                      )}
                    </h3>

                    {/* Star Rating */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                        Đánh giá <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(item.productId, star)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '2rem',
                              cursor: 'pointer',
                              color: star <= feedback.rating ? '#fbbf24' : '#d1d5db',
                              padding: 0,
                              lineHeight: 1,
                              transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (star <= feedback.rating) {
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      {feedback.rating > 0 && (
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                          {feedback.rating === 1 && 'Rất không hài lòng'}
                          {feedback.rating === 2 && 'Không hài lòng'}
                          {feedback.rating === 3 && 'Bình thường'}
                          {feedback.rating === 4 && 'Hài lòng'}
                          {feedback.rating === 5 && 'Rất hài lòng'}
                        </p>
                      )}
                    </div>

                    {/* Comment */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                        Nhận xét (tùy chọn)
                      </label>
                      <textarea
                        value={feedback.comment}
                        onChange={(e) => handleCommentChange(item.productId, e.target.value)}
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontFamily: 'inherit',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !hasAnyRating}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: hasAnyRating && !submitting ? '#10b981' : '#9ca3af',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: hasAnyRating && !submitting ? 'pointer' : 'not-allowed'
                }}
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

