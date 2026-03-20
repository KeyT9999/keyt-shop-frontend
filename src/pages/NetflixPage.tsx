import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import type { Product } from '../types/product';
import { useCartContext } from '../context/useCartContext';
import { useAuthContext } from '../context/useAuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatPrice } from '../utils/formatPrice';
import './NetflixPage.css';

const INTERNAL_SKU_ENV = import.meta.env.VITE_NETFLIX_PRODUCT_ID as string | undefined;

function buildCartProduct(p: Product, optionIndex: number): Product {
  if (p.options && p.options.length > 0) {
    const opt = p.options[optionIndex] ?? p.options[0];
    return {
      ...p,
      price: opt.price,
      name: `${p.name} - ${opt.name}`
    };
  }
  return p;
}

/**
 * Trang Netflix độc lập — không đi qua danh sách / chi tiết sản phẩm.
 * Đơn hàng PayOS vẫn dùng một SKU nội bộ trên backend (MONGO_ID), khai báo qua env.
 */
export default function NetflixPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { upsertCartLine, clearCart } = useCartContext();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** env = VITE_NETFLIX_PRODUCT_ID; catalog = tự tìm sản phẩm isTiemBanhNetflix / tên Netflix */
  const [resolvedVia, setResolvedVia] = useState<'env' | 'catalog' | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const loadById = async (id: string, via: 'env' | 'catalog') => {
      const { data } = await axios.get<Product>(`${API_BASE_URL}/products/${id}`);
      if (!cancelled) {
        setProduct(data);
        setError(null);
        setResolvedVia(via);
      }
    };

    const run = async () => {
      setLoading(true);
      setError(null);
      setResolvedVia(null);
      const envId = INTERNAL_SKU_ENV?.trim();

      try {
        if (envId) {
          try {
            await loadById(envId, 'env');
            return;
          } catch {
            if (cancelled) return;
            /* ID trong env sai — thử tìm trong catalog */
          }
        }

        const { data: list } = await axios.get<Product[]>(`${API_BASE_URL}/products`);
        if (cancelled) return;

        const flagged = list.find((p) => p.isTiemBanhNetflix);
        const byName = list.find((p) => /\bnetflix\b/i.test(p.name));
        const pick = flagged || byName;

        if (!pick?._id) {
          setProduct(null);
          setError('missing_config');
          return;
        }

        await loadById(pick._id, 'catalog');
      } catch {
        if (!cancelled) {
          setProduct(null);
          setError('fetch_failed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedOptionIndex(0);
    setQuantity(1);
  }, [product?._id]);

  const lineProduct = product ? buildCartProduct(product, selectedOptionIndex) : null;

  const handleAddToCart = () => {
    if (!lineProduct) return;
    upsertCartLine(lineProduct, quantity);
    showNotification(`Đã thêm ${quantity} gói vào giỏ hàng.`, 'success');
  };

  const handleBuyNow = () => {
    if (!lineProduct) return;
    clearCart();
    upsertCartLine(lineProduct, quantity);
    showNotification('Đã tạo giỏ chỉ gồm gói Netflix — chuyển tới thanh toán.', 'success');
    navigate('/checkout');
  };

  const displayImage =
    product?.images?.[0] ||
    product?.imageUrl ||
    'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=60';

  const displayPrice = lineProduct
    ? formatPrice(lineProduct.price * quantity, lineProduct.currency)
    : null;

  return (
    <div className="netflix-page">
      <div className="netflix-page__bg" aria-hidden />
      <div className="netflix-page__inner">
        <nav className="netflix-page__breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span aria-hidden>/</span>
          <span>Netflix</span>
        </nav>

        <header className="netflix-page__hero">
          <span className="netflix-page__badge">Giao tự động sau thanh toán</span>
          <h1>Netflix Premium</h1>
          <p className="netflix-page__lead">
            Kênh mua riêng — không nằm trong danh mục sản phẩm chung. Sau khi thanh toán PayOS
            thành công, hệ thống gọi API đối tác để cấp cookie và link đăng nhập (PC & Mobile).
          </p>
        </header>

        <div className="netflix-page__grid">
          <div className="netflix-page__card netflix-page__card--visual">
            <img src={displayImage} alt="" className="netflix-page__img" />
            {!loading && lineProduct ? (
              <p className="netflix-page__price-tag">
                {displayPrice}
                {product?.billingCycle ? (
                  <span className="netflix-page__cycle"> / {product.billingCycle}</span>
                ) : null}
                {quantity > 1 ? (
                  <span className="netflix-page__cycle"> ({quantity} gói)</span>
                ) : null}
              </p>
            ) : null}
          </div>

          <div className="netflix-page__card netflix-page__card--copy">
            <h2>Quy trình</h2>
            <ol className="netflix-page__steps">
              <li>Chọn gói / số lượng, bấm <strong>Mua ngay</strong> (giỏ chỉ Netflix) hoặc{' '}
                <strong>Thêm vào giỏ</strong>.</li>
              <li>Thanh toán qua <strong>PayOS</strong> — cần{' '}
                <Link to="/login" state={{ from: '/netflix' }}>
                  đăng nhập
                </Link>
                .</li>
              <li>Sau khi nhận tiền, hệ thống tự lấy cookie và link đăng nhập; xem trong{' '}
                <Link to="/orders">đơn hàng</Link> / email xác nhận.</li>
              <li>Link đăng nhập có thời hạn; làm mới hoặc xin đổi cookie trong trang chi tiết đơn.</li>
            </ol>

            <h2>Lưu ý</h2>
            <ul className="netflix-page__notes">
              <li>
                <strong>Đơn hỗn hợp</strong> (Netflix + sản phẩm khác trong cùng đơn): hệ thống có thể không tự
                đánh dấu hoàn tất như đơn chỉ Netflix — nên dùng <strong>Mua ngay</strong> để giỏ chỉ chứa gói
                Netflix, hoặc đặt tách đơn.
              </li>
              <li>Một tài khoản Netflix — vui lòng không chia sẻ cookie công khai.</li>
              <li>Lỗi hộ gia đình / quốc gia: dùng luồng hỗ trợ đổi cookie theo chính sách shop.</li>
            </ul>

            {loading ? (
              <p className="netflix-page__status">Đang tải gói…</p>
            ) : error === 'missing_config' ? (
              <p className="netflix-page__status netflix-page__status--err">
                Không tìm thấy gói Netflix trên shop: cần gắn cờ <strong>isTiemBanhNetflix</strong> cho một
                sản phẩm trong admin, hoặc cấu hình <strong>VITE_NETFLIX_PRODUCT_ID</strong> (MongoDB{' '}
                <code style={{ color: '#fecaca' }}>_id</code>) khi build frontend. Liên hệ admin / Zalo hỗ trợ.
              </p>
            ) : error === 'fetch_failed' || !product ? (
              <p className="netflix-page__status netflix-page__status--err">
                Không lấy được thông tin gói. Kiểm tra kết nối hoặc ID cấu hình.
              </p>
            ) : (
              <>
                {resolvedVia === 'catalog' ? (
                  <p className="netflix-page__catalog-hint">
                    Đang dùng gói Netflix tự nhận từ danh mục sản phẩm. Trên môi trường production nên set{' '}
                    <strong>VITE_NETFLIX_PRODUCT_ID</strong> để khóa đúng một SKU.
                  </p>
                ) : null}
                {!user ? (
                  <p className="netflix-page__login-hint">
                    Bạn cần{' '}
                    <Link to="/login" state={{ from: '/netflix' }}>
                      đăng nhập
                    </Link>{' '}
                    để thanh toán. Sau đăng nhập bạn sẽ quay lại trang này nếu cần.
                  </p>
                ) : null}

                {product.options && product.options.length > 1 ? (
                  <div className="netflix-page__pickers">
                    <label className="netflix-page__label" htmlFor="netflix-option">
                      Chọn gói
                    </label>
                    <select
                      id="netflix-option"
                      className="netflix-page__select"
                      value={selectedOptionIndex}
                      onChange={(e) => setSelectedOptionIndex(Number(e.target.value))}
                    >
                      {product.options.map((opt, idx) => (
                        <option key={idx} value={idx}>
                          {opt.name} — {formatPrice(opt.price, product.currency)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className="netflix-page__pickers">
                  <label className="netflix-page__label" htmlFor="netflix-qty">
                    Số lượng (số slot Netflix)
                  </label>
                  <input
                    id="netflix-qty"
                    className="netflix-page__qty"
                    type="number"
                    min={1}
                    max={99}
                    value={quantity}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      if (Number.isNaN(n)) setQuantity(1);
                      else setQuantity(Math.max(1, Math.min(99, n)));
                    }}
                  />
                </div>

                <div className="netflix-page__actions">
                  <button type="button" className="netflix-page__cta" onClick={handleBuyNow}>
                    Mua ngay &amp; thanh toán
                  </button>
                  <button type="button" className="netflix-page__secondary" onClick={handleAddToCart}>
                    Thêm vào giỏ
                  </button>
                  <Link to="/cart" className="netflix-page__ghost">
                    Xem giỏ hàng
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
