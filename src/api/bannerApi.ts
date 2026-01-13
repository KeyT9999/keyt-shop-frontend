import axios from 'axios';
import API_BASE_URL from '../config/api';
import type { Banner, BannerFormData } from '../types/banner';

export const getBanners = async (position?: string) => {
    const response = await axios.get<Banner[]>(`${API_BASE_URL}/banners`, {
        params: { position }
    });
    return response.data;
};

export const getAllBannersAdmin = async (token: string) => {
    const response = await axios.get<Banner[]>(`${API_BASE_URL}/banners/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createBanner = async (data: BannerFormData, token: string) => {
    const response = await axios.post<Banner>(`${API_BASE_URL}/banners`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateBanner = async (id: string, data: Partial<BannerFormData>, token: string) => {
    const response = await axios.put<Banner>(`${API_BASE_URL}/banners/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const deleteBanner = async (id: string, token: string) => {
    await axios.delete(`${API_BASE_URL}/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

export const uploadBannerImage = async (file: File, token: string) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post<{ imageUrl: string }>(`${API_BASE_URL}/upload/banner`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data.imageUrl;
};
