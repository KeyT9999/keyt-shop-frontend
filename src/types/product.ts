export interface ProductOption {
  name: string;
  price: number;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: string;
  category: string;
  isHot: boolean;
  promotion?: string;
  features: string[];
  description: string;
  imageUrl?: string; // Giữ lại để backward compatible
  images?: string[]; // Array of image URLs
  stock: number;
  options?: ProductOption[];
}
