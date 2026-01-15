import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Star, Heart, ShoppingCart, Eye,
    Truck, ShieldCheck, Clock, Award,
    Pencil
} from 'lucide-react';
import { useAuthContext } from '../context/useAuthContext';

import type { Banner } from '../types/banner';
import type { Product } from '../types/product';
import API_BASE_URL from '../config/api';
import { getBanners } from '../api/bannerApi';
import { useCartContext } from '../context/useCartContext';
import { formatPrice } from '../utils/formatPrice';
import './HomePage.css';



export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCartContext();
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const { t } = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsRes, bannersRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/products`),
                    getBanners()
                ]);
                setProducts(productsRes.data);
                setBanners(bannersRes);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const heroBanners = banners.filter(b => b.position === 'hero');
    const heroBanner = heroBanners.length > 0 ? heroBanners[currentHeroIndex] : null;

    useEffect(() => {
        if (heroBanners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentHeroIndex(prev => (prev + 1) % heroBanners.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [heroBanners.length]);

    const flashSaleBanner = banners.find(b => b.position === 'flash_sale');
    const promoBanner = banners.find(b => b.position === 'promo');

    const featuredProducts = products.slice(0, 8);
    const bestSellers = products.filter(p => p.isHot).slice(0, 6);
    const newArrivals = products.slice().reverse().slice(0, 8);

    // New Design Component: Product Card
    const HomeProductCard = ({ product }: { product: Product }) => (
        <div className="hp-product-card group">
            <div className="hp-card-media">
                {product.isHot && <span className="hp-badge hot">{t('product.hot')}</span>}
                {product.promotion && <span className="hp-badge sale">{product.promotion}</span>}

                <img
                    src={product.imageUrl || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="hp-card-img"
                />

                <div className="hp-card-actions">
                    <button className="hp-action-btn" title="Add to Wishlist">
                        <Heart size={18} />
                    </button>
                    <button className="hp-action-btn" title="Quick View" onClick={() => navigate(`/products/${product._id}`)}>
                        <Eye size={18} />
                    </button>
                </div>

                <button
                    className="hp-add-cart-btn"
                    onClick={() => addItem(product)}
                    disabled={product.status === 'out_of_stock'}
                >
                    <ShoppingCart size={18} />
                    {product.status === 'out_of_stock' ? t('product.out_of_stock') : t('product.add_to_cart')}
                </button>
            </div>

            <div className="hp-card-info">
                <div className="hp-rating">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} fill="#fbbf24" color="#fbbf24" />
                    ))}
                    <span className="hp-rating-count">(25)</span>
                </div>
                <h3 className="hp-product-name">
                    <Link to={`/products/${product._id}`}>{product.name}</Link>
                </h3>
                <div className="hp-price-box">
                    <span className="hp-price">{formatPrice(product.price, product.currency)}</span>
                    {product.billingCycle && <span className="hp-cycle">/{product.billingCycle}</span>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="homepage">
            {/* 1. Hero Section */}
            <section className="hero-section" style={{
                backgroundImage: heroBanner ? `url(${heroBanner.imageUrl})` : undefined,
                transition: 'background-image 0.5s ease-in-out'
            }}>
                <div className="hero-bg-overlay"></div>
                {user?.admin && (
                    <button
                        className="admin-edit-btn"
                        onClick={() => navigate('/admin/banners')}
                        title="Edit Banner"
                    >
                        <Pencil size={20} />
                    </button>
                )}
                <div className="container hero-content">
                    <div className="hero-text-block">
                        <span className="hero-eyebrow">{heroBanner?.title || t('home.hero.eyebrow')}</span>
                        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: heroBanner?.description || t('home.hero.title') }}></h1>
                        {!heroBanner?.description && <p className="hero-desc">{t('home.hero.desc')}</p>}
                        <div className="hero-cta-group">
                            <Link to={heroBanner?.link || "/products"} className="btn btn-primary">{t('home.hero.shop_now')}</Link>
                            <Link to="/about" className="btn btn-outline">{t('home.hero.view_collection')}</Link>
                        </div>
                        <div className="hero-trust-badges">
                            <span><Truck size={16} /> {t('home.hero.instant_delivery')}</span>
                            <span><ShieldCheck size={16} /> {t('home.hero.secure_payment')}</span>
                        </div>
                        {heroBanners.length > 1 && (
                            <div className="hero-indicators" style={{ display: 'flex', gap: '8px', marginTop: '2rem' }}>
                                {heroBanners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentHeroIndex(idx)}
                                        style={{
                                            width: '12px', height: '12px', borderRadius: '50%', border: 'none',
                                            backgroundColor: idx === currentHeroIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                                            cursor: 'pointer', transition: 'background-color 0.3s'
                                        }}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>



            {/* 3. Featured Products */}
            <section className="section featured-section bg-light">
                <div className="container">
                    <div className="section-header center">
                        <span className="eyebrow">{t('home.featured.eyebrow')}</span>
                        <h2>{t('home.featured.title')}</h2>
                        <div className="header-divider"></div>
                    </div>

                    <div className="products-grid-4">
                        {loading ? (
                            <div className="loading-spinner">Loading...</div>
                        ) : (
                            featuredProducts.map(p => <HomeProductCard key={p._id} product={p} />)
                        )}
                    </div>
                </div>
            </section>

            {/* 4. Flash Sale (Banner style for now) */}
            {flashSaleBanner && (
                <section className="section flash-sale-section" style={{ backgroundImage: `url(${flashSaleBanner.imageUrl})`, backgroundSize: 'cover' }}>
                    <div className="container">
                        <div className="flash-sale-wrapper">
                            <div className="flash-content">
                                <span className="flash-badge">{t('home.flash_sale.badge')}</span>
                                <h2 dangerouslySetInnerHTML={{ __html: flashSaleBanner.title || '' }}></h2>
                                {flashSaleBanner.description && <p style={{ marginBottom: '1.5rem', color: 'rgba(255,255,255,0.9)' }}>{flashSaleBanner.description}</p>}
                                <Link to={flashSaleBanner.link || "/products"} className="btn btn-white">{t('home.flash_sale.shop_btn')}</Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Best Sellers */}
            < section className="section best-sellers-section" >
                <div className="container">
                    <div className="section-header">
                        <h2>{t('home.best_sellers.title')}</h2>
                    </div>
                    <div className="products-grid-4">
                        {bestSellers.map(p => <HomeProductCard key={p._id} product={p} />)}
                    </div>
                </div>
            </section >

            {/* 6. Why Choose Us */}
            < section className="section trust-section" >
                <div className="container">
                    <div className="trust-grid">
                        <div className="trust-item">
                            <div className="trust-icon"><Truck size={32} /></div>
                            <h3>{t('home.trust.instant_delivery.title')}</h3>
                            <p>{t('home.trust.instant_delivery.desc')}</p>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon"><ShieldCheck size={32} /></div>
                            <h3>{t('home.trust.secure_payment.title')}</h3>
                            <p>{t('home.trust.secure_payment.desc')}</p>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon"><Clock size={32} /></div>
                            <h3>{t('home.trust.support.title')}</h3>
                            <p>{t('home.trust.support.desc')}</p>
                        </div>
                        <div className="trust-item">
                            <div className="trust-icon"><Award size={32} /></div>
                            <h3>{t('home.trust.quality.title')}</h3>
                            <p>{t('home.trust.quality.desc')}</p>
                        </div>
                    </div>
                </div>
            </section >

            {/* 7. Promo Banner */}
            {promoBanner && (
                <section className="section promo-banner-section">
                    <div className="container">
                        <div className="promo-banner" style={{ backgroundImage: `url(${promoBanner.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            <div className="promo-text" style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                <h2>{promoBanner.title}</h2>
                                <p>{promoBanner.description}</p>
                            </div>
                            {promoBanner.link && (
                                <div className="promo-action">
                                    <Link to={promoBanner.link} className="btn btn-primary">Discover</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* 8. New Arrivals */}
            < section className="section new-arrivals-section" >
                <div className="container">
                    <div className="section-header">
                        <h2>{t('home.new_arrivals.title')}</h2>
                    </div>
                    <div className="products-grid-4">
                        {newArrivals.map(p => <HomeProductCard key={p._id} product={p} />)}
                    </div>
                </div>
            </section >


        </div >
    );
}
