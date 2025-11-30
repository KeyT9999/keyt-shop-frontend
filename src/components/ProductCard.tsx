import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/formatPrice';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
      <article className="product-card">
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

        <div className="product-info">
          <span className="category">{product.category}</span>
          <h2 className="product-name">{product.name}</h2>

          <div className="price-section">
            <span className="price">{formatPrice(product.price, product.currency)}</span>
            <span className="billing-cycle">/ {product.billingCycle}</span>
          </div>

        <Link to={`/products/${product._id}`} className="view-detail-button">
          Xem chi tiết
        </Link>
        </div>
      </article>
  );
}
