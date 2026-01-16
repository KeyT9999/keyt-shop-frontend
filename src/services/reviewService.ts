import axios from 'axios';
import API_BASE_URL from '../config/api';

export interface Review {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
  reply?: {
    content: string;
    repliedAt: string;
    repliedBy: string;
  };
  status: 'active' | 'hidden' | 'reported';
  likes: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  rating5: number;
  rating4: number;
  rating3: number;
  rating2: number;
  rating1: number;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: ReviewStats;
}

export interface CreateReviewData {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
  images?: string[];
}

export interface ReviewableProduct {
  productId: string;
  productName: string;
  productImage: string;
  hasReviewed: boolean;
  review: Review | null;
}

export interface CanReviewResponse {
  canReview: boolean;
  message?: string;
  products: ReviewableProduct[];
}

class ReviewService {
  /**
   * Tạo review mới
   */
  async createReview(data: CreateReviewData): Promise<{ message: string; review: Review }> {
    const response = await axios.post(`${API_BASE_URL}/reviews`, data);
    return response.data;
  }

  /**
   * Lấy tất cả reviews của 1 sản phẩm
   */
  async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
    rating?: number
  ): Promise<ProductReviewsResponse> {
    const params: any = { page, limit };
    if (rating) params.rating = rating;
    
    const response = await axios.get(`${API_BASE_URL}/reviews/product/${productId}`, { params });
    return response.data;
  }

  /**
   * Lấy tất cả reviews của user hiện tại
   */
  async getMyReviews(): Promise<{ reviews: Review[] }> {
    const response = await axios.get(`${API_BASE_URL}/reviews/my-reviews`);
    return response.data;
  }

  /**
   * Admin: Lấy tất cả reviews trong hệ thống
   */
  async getAllReviewsAdmin(): Promise<{ reviews: Review[] }> {
    const response = await axios.get(`${API_BASE_URL}/reviews/admin/all`);
    return response.data;
  }

  /**
   * Kiểm tra sản phẩm nào trong order có thể review
   */
  async canReviewOrder(orderId: string): Promise<CanReviewResponse> {
    const response = await axios.get(`${API_BASE_URL}/reviews/can-review/${orderId}`);
    return response.data;
  }

  /**
   * Cập nhật review
   */
  async updateReview(reviewId: string, data: UpdateReviewData): Promise<{ message: string; review: Review }> {
    const response = await axios.put(`${API_BASE_URL}/reviews/${reviewId}`, data);
    return response.data;
  }

  /**
   * Xóa review
   */
  async deleteReview(reviewId: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_BASE_URL}/reviews/${reviewId}`);
    return response.data;
  }

  /**
   * Admin trả lời review
   */
  async replyToReview(reviewId: string, content: string): Promise<{ message: string; review: Review }> {
    const response = await axios.post(`${API_BASE_URL}/reviews/${reviewId}/reply`, { content });
    return response.data;
  }
}

export const reviewService = new ReviewService();
