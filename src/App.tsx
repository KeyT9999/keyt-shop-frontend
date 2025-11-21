import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// Interface TypeScript cho Product
interface Product {
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
  imageUrl?: string;
  stock: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gọi API khi component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
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

  // Format giá tiền
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ' + currency;
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>🏪 Tiệm Tạp Hóa KeyT</h1>
        <p>Chuyên cung cấp tài khoản Canva Pro & các dịch vụ chất lượng</p>
      </header>

      {/* Main Content */}
      <main className="main-content">
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
            {products.map((product) => (
              <div key={product._id} className="product-card">
                {/* Badge Hot */}
                {product.isHot && (
                  <div className="hot-badge">🔥 HOT</div>
                )}

                {/* Product Image */}
                <div className="product-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="image-placeholder">
                      <span>🎨</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="product-info">
                  <span className="category">{product.category}</span>
                  <h2 className="product-name">{product.name}</h2>
                  <p className="description">{product.description}</p>

                  {/* Price */}
                  <div className="price-section">
                    <span className="price">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    <span className="billing-cycle">/ {product.billingCycle}</span>
                  </div>

                  {/* Promotion */}
                  {product.promotion && (
                    <div className="promotion">
                      🎉 {product.promotion}
                    </div>
                  )}

                  {/* Features */}
                  <div className="features">
                    <h4>✨ Tính năng nổi bật:</h4>
                    <ul>
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Stock */}
                  <div className="stock">
                    📦 Còn lại: <strong>{product.stock}</strong> tài khoản
                  </div>

                  {/* Button */}
                  <button className="buy-button">
                    🛒 Mua ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Made with ❤️ by KeyT Shop</p>
      </footer>
    </div>
  )
}

export default App
