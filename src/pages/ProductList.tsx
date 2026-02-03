import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types/product';
import API_BASE_URL from '../config/api';

interface ProductListProps {
  searchQuery?: string;
  showHero?: boolean;
}

export default function ProductList({ searchQuery = '', showHero = true }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const heroCards = [
    { title: 'Canva Pro', desc: 'Thiết kế nhanh - chỉ từ 49K', emoji: '🎨', tone: 'blue' },
    { title: 'Google One 400GB', desc: 'Lưu trữ đám mây an toàn', emoji: '☁️', tone: 'teal' },
    { title: 'YouTube Premium', desc: 'Không quảng cáo, nghe nền', emoji: '▶️', tone: 'red' },
    { title: 'Spotify', desc: 'Âm nhạc không giới hạn', emoji: '🎵', tone: 'green' }
  ];

  const quickCategories = [
    { icon: '🤖', label: 'AI' },
    { icon: '🎮', label: 'Game' },
    { icon: '💳', label: 'Giao dịch' },
    { icon: '🛡️', label: 'Bảo mật' },
    { icon: '☁️', label: 'Lưu trữ' },
    { icon: '🎓', label: 'Học tập' },
    { icon: '🎬', label: 'Giải trí' },
    { icon: '🎧', label: 'Nghe nhạc' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/products`);
        // Sort products by sortOrder (lower number = higher priority)
        // Backend already sorts by sortOrder, but we sort again here for safety
        const sortedProducts = (response.data || []).sort((a: Product, b: Product) => {
          const orderA = a.sortOrder ?? 999;
          const orderB = b.sortOrder ?? 999;
          return orderA - orderB;
        });
        setProducts(sortedProducts);
        setError(null);
      } catch (err) {
        console.error('❌ Lỗi khi gọi API:', err);
        setError('Không thể tải sản phẩm. Vui lòng kiểm tra Backend!');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      {showHero && (
        <section className="hero-section">
          <div className="hero-banner">
            <div className="hero-eyebrow">Ưu đãi nổi bật</div>
            <h1>Kho dịch vụ số đa dạng, giá tốt mỗi ngày</h1>
            <p>Netflix, Google One, Canva, Spotify, ChatGPT Plus và nhiều hơn nữa.</p>
            <div className="hero-actions">
              <button type="button" className="primary" onClick={() => navigate('/products')}>Khám phá ngay</button>
              <button type="button" className="ghost" onClick={() => navigate('/products')}>Xem gói khuyến mãi</button>
            </div>
          </div>
          <div className="hero-grid">
            {heroCards.map((card) => (
              <button
                key={card.title}
                type="button"
                className={`hero-card tone-${card.tone}`}
                onClick={() => navigate('/products')}
              >
                <div className="hero-card__icon">{card.emoji}</div>
                <div>
                  <p className="hero-card__title">{card.title}</p>
                  <p className="hero-card__desc">{card.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="container">
        {showHero && (
          <>
            <section className="quick-nav">
              {quickCategories.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="pill"
                  onClick={() => navigate('/products')}
                >
                  <span className="pill__icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </section>

            <div className="section-heading section-heading--center">
              <div>
                <p className="section-eyebrow">Best Seller</p>
                <h2>Sản phẩm bán chạy</h2>
                <p className="section-sub">Cập nhật liên tục các gói hot, nhiều ưu đãi.</p>
              </div>
            </div>
          </>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        )}

        {error && (
          <div className="error-box">
            <p>⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="empty-state">
            <p>📦 Chưa có sản phẩm nào</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="products-grid">
            {products
              .filter((product) => {
                const q = searchQuery.trim().toLowerCase();
                if (!q) return true;
                return (
                  product.name.toLowerCase().includes(q) ||
                  (product.category && product.category.toLowerCase().includes(q))
                );
              })
              .map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
          </div>
        )}
      </div>
    </>
  );
}
