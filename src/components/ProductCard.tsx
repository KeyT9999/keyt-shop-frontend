import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/formatPrice';
import { useCartContext } from '../context/useCartContext';
import { useWishlistContext } from '../context/useWishlistContext';

import { useNotification } from '../context/NotificationContext';

import { useAddToCartAnimation } from '../context/AddToCartAnimationContext';


interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, clearCart } = useCartContext();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistContext();

  const { showNotification } = useNotification();

  const { triggerAnimation } = useAddToCartAnimation();
  const navigate = useNavigate();
  const isOutOfStock = product.status === 'out_of_stock' || product.status === 'discontinued' || (product.stock !== undefined && product.stock <= 0);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isOutOfStock) return;
    
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const startX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top + buttonRect.height / 2;
    
    triggerAnimation({
      id: `product-${product._id}-${Date.now()}`,
      startX,
      startY,
      productImage: product.imageUrl || undefined,
    });
    
    addItem(product);
    showNotification(`Đã thêm ${product.name} vào giỏ hàng`, 'success');
  };

  const handleBuyNow = (_e: React.MouseEvent<HTMLButtonElement>) => {
    if (isOutOfStock) return;
    
    // Clear existing cart first
    clearCart();
    
    // Add only this product to cart
    addItem(product);
    
    // Show notification
    showNotification(`Đã thêm ${product.name} vào giỏ hàng`, 'success');
    
    // Navigate to checkout
    navigate('/checkout');
  };

  return (
    <article className="group relative flex flex-col h-full bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-orange/30">
      {/* Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          {product.isHot && (
            <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              HOT
            </span>
          )}
          {product.promotion && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
              {product.promotion}
            </span>
          )}
        </div>

        {/* Quick Actions (Slide in on hover) */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            className={`p-2 rounded-full shadow transition-colors ${isInWishlist(product._id)
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-white text-slate-600 hover:bg-brand-orange hover:text-white'
              }`}
            title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isInWishlist(product._id)) {
                removeFromWishlist(product._id);
                showNotification(`Đã xóa ${product.name} khỏi yêu thích`, 'info');
              } else {
                addToWishlist(product);
                showNotification(`Đã thêm ${product.name} vào yêu thích`, 'success');
              }
            }}
          >
            <Heart size={16} fill={isInWishlist(product._id) ? "currentColor" : "none"} />
          </button>
          <Link to={`/products/${product._id}`} className="p-2 bg-white text-slate-600 rounded-full shadow hover:bg-brand-orange hover:text-white transition-colors" title="Quick View">
            <Eye size={16} />
          </Link>
        </div>

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="text-4xl">🖼️</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-4">
        <div className="mb-2 text-xs text-slate-500 uppercase tracking-wider font-medium">
          {product.category || 'Software'}
        </div>

        <h3 className="text-slate-800 font-semibold text-base mb-2 line-clamp-2 min-h-[3rem] hover:text-brand-orange transition-colors">
          <Link to={`/products/${product._id}`}>
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto pt-3 flex flex-col gap-2 border-t border-slate-100">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-brand-orange font-bold text-lg">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.billingCycle && (
                <span className="text-xs text-slate-400">/{product.billingCycle}</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">{isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
            </button>

            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-brand-navy text-white hover:bg-brand-orange'
                }`}
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              <span>{isOutOfStock ? 'Hết hàng' : 'Mua ngay'}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
