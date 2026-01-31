import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Truck, ShieldCheck, Clock, Award,
    Pencil, ChevronRight
} from 'lucide-react';
import { useAuthContext } from '../context/useAuthContext';


import type { Banner } from '../types/banner';
import type { Product } from '../types/product';
import API_BASE_URL from '../config/api';
import { getBanners } from '../api/bannerApi';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
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
                setProducts(productsRes.data || []);
                setBanners(bannersRes || []);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                // Set empty arrays để app vẫn render được
                setProducts([]);
                setBanners([]);
                // Log chi tiết lỗi để debug
                if (err?.response) {
                    console.error('API Error Response:', err.response.status, err.response.data);
                } else if (err?.request) {
                    console.error('API Request failed - có thể do CORS hoặc network issue');
                    console.error('API URL đang dùng:', API_BASE_URL);
                } else {
                    console.error('API Error:', err.message);
                }
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
        }, 5000);
        return () => clearInterval(interval);
    }, [heroBanners.length]);

    const flashSaleBanner = banners.find(b => b.position === 'flash_sale');
    const promoBanner = banners.find(b => b.position === 'promo');

    const featuredProducts = products.slice(0, 8);
    const bestSellers = products.filter(p => p.isHot).slice(0, 6); // Just 6 for center alignment demo? Or up to 4 if user wants specific grid.
    const newArrivals = products.slice().reverse().slice(0, 8);

    const trustItems = [
        { icon: Truck, title: t('home.trust.instant_delivery.title', 'Giao Hàng Tốc Độ'), desc: t('home.trust.instant_delivery.desc', 'Nhận key ngay qua email') },
        { icon: ShieldCheck, title: t('home.trust.secure_payment.title', 'Bảo Mật An Toàn'), desc: t('home.trust.secure_payment.desc', 'Thanh toán được bảo vệ 100%') },
        { icon: Clock, title: t('home.trust.support.title', 'Hỗ Trợ 24/7'), desc: t('home.trust.support.desc', 'Đội ngũ hỗ trợ chuyên nghiệp') },
        { icon: Award, title: t('home.trust.quality.title', 'Uy Tín Hàng Đầu'), desc: t('home.trust.quality.desc', 'Cam kết hoàn tiền nếu lỗi') },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-orange"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-brand-text">

            {/* SECTION 1: HERO BANNER */}
            {/* SECTION 1: HERO BANNER (Restored & Tailwind-ified) */}
            <section className="relative h-[600px] flex items-center bg-brand-navy bg-cover bg-center transition-all duration-500" style={{
                backgroundImage: heroBanner ? `url(${heroBanner.imageUrl})` : undefined,
            }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>

                {user?.admin && (
                    <button
                        className="absolute top-5 right-5 z-20 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-brand-orange transition-colors title='Edit Banner'"
                        onClick={() => navigate('/admin/banners')}
                    >
                        <Pencil size={20} />
                    </button>
                )}

                <div className="container mx-auto px-4 relative z-10 w-full">
                    <div className="max-w-2xl text-white">
                        <span className="block text-brand-orange font-bold text-sm uppercase tracking-widest mb-4">
                            {heroBanner?.title || t('home.hero.eyebrow')}
                        </span>

                        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6" dangerouslySetInnerHTML={{ __html: heroBanner?.description || t('home.hero.title') }}></h1>

                        {!heroBanner?.description && <p className="text-xl text-slate-200 mb-8 max-w-lg leading-relaxed">{t('home.hero.desc')}</p>}

                        <div className="flex gap-4 mb-8">
                            <Link to={heroBanner?.link || "/products"} className="px-8 py-3 bg-brand-orange text-white rounded-full font-bold hover:bg-orange-600 transition-colors shadow-lg">
                                {t('home.hero.shop_now')}
                            </Link>
                            <button
                                onClick={() => {
                                    const element = document.getElementById('featured-software');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-full font-bold hover:bg-white hover:text-brand-navy transition-colors cursor-pointer"
                            >
                                {t('home.hero.view_collection')}
                            </button>
                        </div>

                        {/* Trust Badges - User requested these inside Hero */}
                        <div className="flex gap-6 text-sm text-slate-300 font-medium">
                            <span className="flex items-center gap-2"><Truck size={18} className="text-brand-orange" /> {t('home.hero.instant_delivery')}</span>
                            <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-brand-orange" /> {t('home.hero.secure_payment')}</span>
                        </div>

                        {heroBanners.length > 1 && (
                            <div className="flex gap-2 mt-8">
                                {heroBanners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentHeroIndex(idx)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentHeroIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/80'}`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>



            {/* SECTION 3: FEATURED PRODUCTS */}
            <section id="featured-software" className="py-20 bg-brand-bg-alt">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-brand-orange font-semibold tracking-wider uppercase text-sm">Sản phẩm nổi bật</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mt-2">Phần Mềm Phổ Biến</h2>
                        <div className="w-24 h-1 bg-brand-orange mx-auto mt-6 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map(p => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/products" className="inline-flex items-center text-brand-navy font-semibold hover:text-brand-orange transition-colors">
                            Xem tất cả sản phẩm <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* SECTION 4: FLASH SALE */}
            {flashSaleBanner && (
                <section className="py-20 relative bg-brand-navy overflow-hidden">
                    <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: `url(${flashSaleBanner.imageUrl})` }}></div>
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <span className="bg-red-600 text-white px-4 py-1 rounded-full font-bold animate-pulse inline-block mb-4">
                            FLASH SALE
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6" dangerouslySetInnerHTML={{ __html: flashSaleBanner.title || 'Giảm Giá Cực Sốc' }}></h2>
                        <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">{flashSaleBanner.description}</p>
                        <Link to={flashSaleBanner.link || "/products"} className="inline-block px-10 py-4 bg-white text-brand-navy font-bold rounded-full hover:bg-brand-orange hover:text-white transition-all shadow-lg">
                            {t('home.flash_sale.shop_btn', 'Săn Deal Ngay')}
                        </Link>
                    </div>
                </section>
            )}

            {/* SECTION 5: BEST SELLERS */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-brand-navy">{t('home.best_sellers.title', 'Bán Chạy Nhất')}</h2>
                        <p className="text-slate-500 mt-2">Các sản phẩm được nhiều khách hàng tin dùng</p>
                    </div>

                    {/* Dynamic Grid: Center if few items */}
                    <div className={bestSellers.length > 0 && bestSellers.length < 4
                        ? "flex flex-wrap justify-center gap-6"
                        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    }>
                        {bestSellers.length > 0 ? bestSellers.map(p => (
                            <div key={p._id} className={bestSellers.length < 4 ? "w-full sm:max-w-[calc(50%-12px)] lg:max-w-[calc(25%-18px)] flex-grow-0 flex-shrink-0" : "w-full"}>
                                <ProductCard product={p} />
                            </div>
                        )) : (
                            <p className="text-slate-400 col-span-full text-center py-10">Đang cập nhật...</p>
                        )}
                    </div>

                    {/* Mobile View More */}
                    <div className="mt-8 text-center md:hidden">
                        <Link to="/products?filter=hot" className="btn btn-outline">Xem thêm</Link>
                    </div>
                </div>
            </section>

            {/* SECTION 6: PROMO BANNER */}
            {promoBanner && (
                <section className="py-12 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl min-h-[300px] flex items-center bg-slate-800">
                            <img src={promoBanner.imageUrl} alt="Promo" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                            <div className="relative z-10 p-8 md:p-12 max-w-2xl">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{promoBanner.title}</h2>
                                <p className="text-slate-200 text-lg mb-8">{promoBanner.description}</p>
                                {promoBanner.link && (
                                    <Link to={promoBanner.link} className="px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition">
                                        Khám phá ngay
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* SECTION 7: NEW ARRIVALS */}
            <section className="py-20 bg-brand-bg-alt">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-brand-navy">{t('home.new_arrivals.title', 'Sản Phẩm Mới')}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
                    </div>
                </div>
            </section>

            {/* SECTION 8: TRUST INDICATORS (Bottom) */}
            <section className="bg-white py-16 border-t border-slate-100">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {trustItems.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center p-4 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="p-4 bg-brand-orange/10 text-brand-orange rounded-full mb-4">
                                    <item.icon size={32} />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed max-w-[250px] mx-auto">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
