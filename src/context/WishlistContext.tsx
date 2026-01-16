import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../types/product';
import { WishlistContext } from './wishlist-context';
import type { WishlistItem } from './wishlist-context';
import { useAuthContext } from './useAuthContext';

const STORAGE_KEY_BASE = 'keyt-wishlist';

function loadWishlistFromStorage(storageKey: string): WishlistItem[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('❌ Error reading wishlist from localStorage', error);
        return [];
    }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { user } = useAuthContext();
    const activeStorageKey = useMemo(
        () => `${STORAGE_KEY_BASE}-${user?.id || (user as any)?._id || 'guest'}`,
        [user?.id, (user as any)?._id]
    );

    const [wishlist, setWishlist] = useState<WishlistItem[]>(() =>
        loadWishlistFromStorage(activeStorageKey)
    );

    // Sync to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(activeStorageKey, JSON.stringify(wishlist));
        }
    }, [wishlist, activeStorageKey]);

    // Load when user changes
    useEffect(() => {
        setWishlist(loadWishlistFromStorage(activeStorageKey));
    }, [activeStorageKey]);

    const addToWishlist = (product: Product) => {
        setWishlist((prev) => {
            if (prev.some((item) => item._id === product._id)) {
                return prev;
            }
            return [...prev, { ...product, addedAt: Date.now() }];
        });
    };

    const removeFromWishlist = (productId: string) => {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some((item) => item._id === productId);
    };

    const clearWishlist = () => {
        setWishlist([]);
    };

    return (
        <WishlistContext.Provider
            value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}
        >
            {children}
        </WishlistContext.Provider>
    );
}
