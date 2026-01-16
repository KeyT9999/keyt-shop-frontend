export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface ProductOption {
  name: string;
  price: number;
}

export interface ProductRequiredField {
  label: string;        // "Email Canva", "Email để nhận docs", "Account:MK"
  type: 'email' | 'text' | 'account';
  placeholder: string;  // "Vui lòng nhập email Canva của bạn"
  required: boolean;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: string;
  category: string;
  isHot: boolean;
  promotion?: string | null;
  features: string[];
  description?: string | null;
  imageUrl?: string | null; // Giữ lại để backward compatible
  images?: string[] | null; // Array of image URLs
  stock: number;
  status?: 'in_stock' | 'out_of_stock' | 'discontinued';
  lowStockThreshold?: number;
  options?: ProductOption[];
  requiredFields?: ProductRequiredField[];
}
