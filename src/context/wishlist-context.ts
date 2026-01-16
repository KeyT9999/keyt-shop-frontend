import { createContext } from 'react';
import type { Product } from '../types/product';

export interface WishlistItem extends Product {
    addedAt: number;
}

export interface WishlistContextType {
    wishlist: WishlistItem[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

export const WishlistContext = createContext<WishlistContextType | null>(null);
