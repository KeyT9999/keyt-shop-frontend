import axios from 'axios';
import API_BASE_URL from '../config/api';

export const uploadService = {
  /**
   * Upload single product image
   */
  async uploadProductImage(file: File, token: string): Promise<{ imageUrl: string; publicId: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${API_BASE_URL}/upload/product`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },

  /**
   * Upload multiple product images
   */
  async uploadProductImages(files: File[], token: string): Promise<{ images: Array<{ imageUrl: string; publicId: string }> }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await axios.post(`${API_BASE_URL}/upload/products`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File, token: string): Promise<{ imageUrl: string; publicId: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${API_BASE_URL}/upload/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }
};

