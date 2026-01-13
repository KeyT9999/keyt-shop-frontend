import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowRight, Star, Heart, ShoppingCart, Eye,
    Truck, ShieldCheck, Clock, Award,
    Instagram
} from 'lucide-react';

import type { Product } from '../types/product';
import API_BASE_URL from '../config/api';
import { useCartContext } from '../context/useCartContext';
import { formatPrice } from '../utils/formatPrice';
import './HomePage.css';

// Mock Data for Categories
const CATEGORIES = [
    { id: 1, name: 'Premium Accounts', image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400', slug: 'accounts' },
    { id: 2, name: 'Software Keys', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400', slug: 'software' },
    { id: 3, name: 'Streaming Services', image: 'https://images.unsplash.com/photo-1522869635100-1f4d061dd70f?auto=format&fit=crop&q=80&w=400', slug: 'streaming' },
    { id: 4, name: 'Gaming', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=400', slug: 'gaming' },
    { id: 5, name: 'Education', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400', slug: 'education' },
];

// Mock Data for Reviews
const REVIEWS = [
    { id: 1, name: 'Sarah J.', rating: 5, text: "Best service I've ever used. Delivery was instant!", avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 2, name: 'Michael C.', rating: 4, text: "Great prices for genuine keys. Will buy again.", avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 3, name: 'Jessica T.', rating: 5, text: "Customer support is amazing, helped me setup everything.", avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
];

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCartContext();
    const navigate = useNavigate();

    const { t } = useTranslation();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/products`);
                setProducts(response.data);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

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
            <section className="hero-section">
                <div className="hero-bg-overlay"></div>
                <div className="container hero-content">
                    <div className="hero-text-block">
                        <span className="hero-eyebrow">{t('home.hero.eyebrow')}</span>
                        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: t('home.hero.title') }}></h1>
                        <p className="hero-desc">{t('home.hero.desc')}</p>
                        <div className="hero-cta-group">
                            <Link to="/products" className="btn btn-primary">{t('home.hero.shop_now')}</Link>
                            <Link to="/about" className="btn btn-outline">{t('home.hero.view_collection')}</Link>
                        </div>
                        <div className="hero-trust-badges">
                            <span><Truck size={16} /> {t('home.hero.instant_delivery')}</span>
                            <span><ShieldCheck size={16} /> {t('home.hero.secure_payment')}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Categories Section */}
            <section className="section categories-section">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('home.categories.title')}</h2>
                        <Link to="/products" className="view-all-link">{t('home.categories.view_all')} <ArrowRight size={16} /></Link>
                    </div>
                    <div className="categories-grid">
                        {CATEGORIES.map(cat => (
                            <Link to={`/products?category=${cat.slug}`} key={cat.id} className="category-card">
                                <div className="cat-img-wrapper">
                                    <img src={cat.image} alt={cat.name} />
                                </div>
                                <div className="cat-overlay">
                                    <h3>{cat.name}</h3>
                                </div>
                            </Link>
                        ))}
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
            <section className="section flash-sale-section">
                <div className="container">
                    <div className="flash-sale-wrapper">
                        <div className="flash-content">
                            <span className="flash-badge">{t('home.flash_sale.badge')}</span>
                            <h2 dangerouslySetInnerHTML={{ __html: t('home.flash_sale.title') }}></h2>
                            <div className="countdown-timer">
                                <div className="timer-box"><span>02</span><small>{t('home.flash_sale.days')}</small></div>
                                <div className="timer-box"><span>14</span><small>{t('home.flash_sale.hours')}</small></div>
                                <div className="timer-box"><span>30</span><small>{t('home.flash_sale.mins')}</small></div>
                                <div className="timer-box"><span>45</span><small>{t('home.flash_sale.secs')}</small></div>
                            </div>
                            <Link to="/products" className="btn btn-white">{t('home.flash_sale.shop_btn')}</Link>
                        </div>
                        <div className="flash-image">
                            {/* Replace with a transparent png of a product bundle if available */}
                            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600" alt="Flash Sale" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Best Sellers */}
            <section className="section best-sellers-section">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('home.best_sellers.title')}</h2>
                    </div>
                    <div className="products-grid-4">
                        {bestSellers.map(p => <HomeProductCard key={p._id} product={p} />)}
                    </div>
                </div>
            </section>

            {/* 6. Why Choose Us */}
            <section className="section trust-section">
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
            </section>

            {/* 7. Promo Banner */}
            <section className="section promo-banner-section">
                <div className="container">
                    <div className="promo-banner">
                        <div className="promo-text">
                            <h2>{t('home.newsletter.title')}</h2>
                            <p>{t('home.newsletter.desc')}</p>
                        </div>
                        <div className="promo-action">
                            <div className="newsletter-form-inline">
                                <input type="email" placeholder={t('home.newsletter.placeholder')} />
                                <button className="btn btn-black">{t('home.newsletter.btn')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. New Arrivals */}
            <section className="section new-arrivals-section">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('home.new_arrivals.title')}</h2>
                    </div>
                    <div className="products-grid-4">
                        {newArrivals.map(p => <HomeProductCard key={p._id} product={p} />)}
                    </div>
                </div>
            </section>

            {/* 9. Customer Reviews */}
            <section className="section reviews-section bg-light">
                <div className="container">
                    <div className="section-header center">
                        <h2>{t('home.reviews.title')}</h2>
                    </div>
                    <div className="reviews-grid">
                        {REVIEWS.map(item => (
                            <div key={item.id} className="review-card">
                                <div className="review-rating">
                                    {[...Array(item.rating)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />)}
                                </div>
                                <p className="review-text">"{item.text}"</p>
                                <div className="review-author">
                                    <img src={item.avatar} alt={item.name} />
                                    <span>{item.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. Brand Logos */}
            <section className="section brands-section">
                <div className="container">
                    <div className="brands-wrapper">
                        {['Netflix', 'Spotify', 'Adobe', 'Microsoft', 'Google'].map(brand => (
                            <div key={brand} className="brand-item">{brand}</div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 11 & 12. Blog & Newsletter (Combined or simple) */}
            <section className="section blog-section">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('home.blog.title')}</h2>
                    </div>
                    <div className="blog-grid">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="blog-card">
                                <div className="blog-img">
                                    <img src={`https://picsum.photos/seed/${i + 10}/400/250`} alt="Blog" />
                                </div>
                                <div className="blog-content">
                                    <span className="blog-date">Oct 24, 2026</span>
                                    <h3>Top 10 Tools for Digital Nomads in 2026</h3>
                                    <Link to="#" className="read-more">{t('home.blog.read_more')} <ArrowRight size={14} /></Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 13. Social Feed Placeholder */}
            <div className="social-feed-section">
                <div className="container">
                    <div className="social-header">
                        <Instagram size={24} />
                        <h3>@KeyTShop</h3>
                    </div>
                    <div className="social-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <img key={i} src={`https://picsum.photos/seed/${i + 50}/200/200`} alt="Social" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
