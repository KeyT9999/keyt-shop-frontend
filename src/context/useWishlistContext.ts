import { useContext } from 'react';
import { WishlistContext } from './wishlist-context';

export function useWishlistContext() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlistContext must be used within a WishlistProvider');
    }
    return context;
}
