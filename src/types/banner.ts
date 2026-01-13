export interface Banner {
    _id: string;
    title?: string;
    description?: string;
    imageUrl: string;
    link?: string;
    position: 'hero' | 'flash_sale' | 'promo' | 'footer';
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type BannerFormData = Omit<Banner, '_id' | 'createdAt' | 'updatedAt'>;
