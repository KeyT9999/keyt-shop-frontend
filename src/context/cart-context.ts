import { createContext } from 'react';
import type { Product } from '../types/product';

export interface CartItem extends Product {
  quantity: number;
  selectedOptionIndex?: number; // Index của option được chọn (nếu có)
  requiredFieldsData?: Record<string, string>; // Lưu dữ liệu requiredFields: { fieldLabel: value }
}

export interface CartContextType {
  cart: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateCartItem: (productId: string, productData: Partial<Product>) => void;
  updateCartItemOption: (productId: string, optionIndex: number) => void;
  updateCartItemRequiredField: (productId: string, fieldLabel: string, value: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

