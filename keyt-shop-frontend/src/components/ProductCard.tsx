import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/formatPrice';
import { useCartContext } from '../context/useCartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discountLabel = product.isHot ? '-16%' : undefined;
  const { addItem } = useCartContext();
  const isOutOfStock = product.status === 'out_of_stock' || product.status === 'discontinued' || (product.stock !== undefined && product.stock <= 0);

  return (
    <article className="product-card">
      <div className="product-card__media">
        {discountLabel && <div className="discount-badge">{discountLabel}</div>}
        {product.isHot && <div className="hot-badge">🔥 HOT</div>}

        <div className="product-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="image-placeholder">
              <span>🎨</span>
            </div>
          )}
        </div>
      </div>

      <div className="product-info">
        <span className="category">{product.category}</span>
        <h2 className="product-name">{product.name}</h2>

        <div className="price-section">
          <span className="price">{formatPrice(product.price, product.currency)}</span>
          <span className="billing-cycle">/ {product.billingCycle}</span>
        </div>

        <div className="product-actions">
          <Link to={`/products/${product._id}`} className="view-detail-button">
            <span aria-hidden="true">🔎</span>
            <span>Xem chi tiết</span>
          </Link>
          <button
            type="button"
            className="product-card__cta"
            onClick={() => addItem(product)}
            disabled={isOutOfStock}
          >
            <span aria-hidden="true">🛒</span>
            <span>{isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
