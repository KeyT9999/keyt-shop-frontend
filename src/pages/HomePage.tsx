import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import {
    Truck, ShieldCheck,
    Pencil
} from 'lucide-react';
import { useAuthContext } from '../context/useAuthContext';
import ProductList from './ProductList';

import type { Banner } from '../types/banner';
import API_BASE_URL from '../config/api';
import { getBanners } from '../api/bannerApi';

export default function HomePage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const { t } = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const bannersRes = await getBanners();
                setBanners(bannersRes || []);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                // Set empty arrays để app vẫn render được
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
                            <Link to={heroBanner?.link || "/photo-frame"} className="px-8 py-3 bg-brand-orange text-white rounded-full font-bold hover:bg-orange-600 transition-colors shadow-lg">
                                {t('home.hero.shop_now')}
                            </Link>
                            <button
                                onClick={() => navigate('/evidence')}
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



            {/* SECTION 2: DANH SÁCH SẢN PHẨM */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-10">
                        <p className="text-[#F05A28] font-bold text-xs uppercase tracking-widest mb-2">Cửa hàng</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#1E293B] mb-3">Sản phẩm nổi bật</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Khám phá các tài khoản và công cụ số chất lượng cao với giá tốt nhất.</p>
                    </div>
                    <ProductList showHero={false} />
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


        </div>
    );
}
