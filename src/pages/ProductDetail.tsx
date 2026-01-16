import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/formatPrice';
import { useCartContext } from '../context/useCartContext';
import { useAuthContext } from '../context/useAuthContext';
import './ProductDetail.css';
import API_BASE_URL from '../config/api';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
    const { addItem } = useCartContext();
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const isOutOfStock = useMemo(() => {
        if (!product) return false;
        return product.status === 'out_of_stock' || product.status === 'discontinued' || (product.stock !== undefined && product.stock <= 0);
    }, [product]);

    useEffect(() => {
        if (!id) {
            setError('Không tìm thấy sản phẩm');
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/products/${id}`);
                const productData = response.data;
                setProduct(productData);
                if (productData.options && productData.options.length > 0) {
                    setSelectedOptionIndex(0);
                } else {
                    setSelectedOptionIndex(null);
                }
                setError(null);
            } catch (err) {
                console.error('❌ Lỗi khi lấy chi tiết:', err);
                setError('Không thể tải thông tin sản phẩm.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="bg-[#fdfbf7] min-h-screen flex items-center justify-center text-slate-800">
                <div className="text-2xl font-game animate-pulse text-[#F05A28]">LOADING...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="bg-[#fdfbf7] min-h-screen flex flex-col items-center justify-center text-slate-800 gap-4">
                <div className="text-2xl font-game text-[#F05A28]">ERROR: {error || 'Product Not Found'}</div>
                <Link to="/" className="px-6 py-2 bg-[#F05A28] text-white rounded hover:bg-orange-600 transition">Return to Base</Link>
            </div>
        );
    }

    const currentPrice = selectedOptionIndex !== null && product.options && product.options[selectedOptionIndex]
        ? product.options[selectedOptionIndex].price
        : product.price;

    const currentName = selectedOptionIndex !== null && product.options && product.options[selectedOptionIndex]
        ? `${product.name} - ${product.options[selectedOptionIndex].name}`
        : product.name;

    const handleAddToCart = () => {
        if (selectedOptionIndex !== null && product.options && product.options[selectedOptionIndex]) {
            const selectedOption = product.options[selectedOptionIndex];
            const productWithOption: Product = {
                ...product,
                price: selectedOption.price,
                name: `${product.name} - ${selectedOption.name}`
            };
            addItem(productWithOption);
        } else {
            addItem(product);
        }
    };

    const handleBuyNow = () => {
        handleAddToCart();
        navigate('/checkout');
    };

    const displayImage = (product.images && product.images.length > 0) ? product.images[0] : (product.imageUrl || 'https://design.duolingo.com/images/brand/duo-happy.svg');

    return (
        <div className="bg-[#fff9f5] text-slate-800 min-h-screen w-full font-sans overflow-x-hidden selection:bg-[#F05A28]/20 pb-20 relative">
            {/* Background Ambience (Light/Pastel) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Soft Orange Blob */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#ffedd5] rounded-full blur-[100px] opacity-60"></div>
                {/* Soft Pink/Peach Blob */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#ffe4e6] rounded-full blur-[100px] opacity-60"></div>
                {/* Subtle texture grid overlay if needed, but keeping it clean for now */}
            </div>

            <div className="w-full max-w-7xl mx-auto relative z-10 px-6 py-12 flex flex-col gap-16">

                {/* HERO SECTION */}
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                    {/* Left: Image Showcase */}
                    <div className="w-full md:w-1/2 flex justify-center relative group p-10">
                        {/* Glow Effect behind image - Warm Orange */}
                        <div className="absolute inset-0 bg-[#F05A28]/10 rounded-full blur-[60px] transform scale-75 group-hover:scale-90 transition-transform duration-700"></div>

                        <img
                            src={displayImage}
                            alt={product.name}
                            className="relative w-64 md:w-96 object-contain drop-shadow-[0_20px_40px_rgba(240,90,40,0.15)] transform hover:-translate-y-2 transition-transform duration-500 z-10"
                        />

                        {/* Floating Elements (Light Mode Style) */}
                        <div className="absolute -right-4 top-10 animate-bounce delay-700 bg-white/80 backdrop-blur-md border border-white/50 p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hidden md:block">
                            <i className="fas fa-bolt text-yellow-500 text-xl"></i>
                        </div>
                        <div className="absolute -left-4 bottom-20 animate-bounce delay-1000 bg-white/80 backdrop-blur-md border border-white/50 p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hidden md:block">
                            <i className="fas fa-shield-alt text-green-500 text-xl"></i>
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="w-full md:w-1/2 flex flex-col gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-[#F05A28] text-xs font-bold tracking-wider uppercase shadow-sm">
                                    {product.category || 'Premium Package'}
                                </span>
                                {product.stock && product.stock > 0 && (
                                    <span className="px-3 py-1 rounded-full bg-green-100/80 border border-green-200 text-green-600 text-xs font-bold tracking-wider uppercase shadow-sm">
                                        In Stock
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight tracking-tight mb-2">
                                {currentName}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex text-yellow-400 gap-0.5">
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <i key={i} className="fas fa-star text-sm"></i>
                                    ))}
                                </div>
                                <span>(561 reviews)</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="text-slate-500">Đã bán: </span>
                                <span className="font-bold text-slate-700">5.7k</span>
                            </div>
                        </div>

                        <div className="text-4xl md:text-5xl font-bold text-[#F05A28] w-fit tracking-tight">
                            {formatPrice(currentPrice, product.currency)}
                        </div>

                        {/* Badges / Key Features Row - Light Cards */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:border-orange-200 hover:shadow-orange-100/50 transition-all">
                                <i className="fas fa-shipping-fast text-[#F05A28]"></i>
                                <span className="text-sm font-medium text-slate-600">Giao ngay</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:border-orange-200 hover:shadow-orange-100/50 transition-all">
                                <i className="fas fa-infinity text-purple-500"></i>
                                <span className="text-sm font-medium text-slate-600">Bảo hành trọn đời</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:border-orange-200 hover:shadow-orange-100/50 transition-all">
                                <i className="fas fa-globe text-green-500"></i>
                                <span className="text-sm font-medium text-slate-600">Chính chủ</span>
                            </div>
                        </div>

                        {/* Options Selection */}
                        {product.options && product.options.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Chọn gói:</label>
                                <div className="flex flex-wrap gap-3">
                                    {product.options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedOptionIndex(idx)}
                                            className={`px-6 py-3 rounded-xl border transition-all duration-200 font-medium text-sm ${selectedOptionIndex === idx
                                                ? 'bg-gradient-to-br from-[#F05A28] to-orange-500 text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-200 border-transparent'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-orange-50 hover:border-orange-200 hover:text-[#F05A28]'
                                                }`}
                                        >
                                            {option.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button
                                onClick={() => addItem(product)}
                                className="p-4 rounded-xl border-2 border-slate-200 bg-white text-slate-400 hover:border-[#F05A28] hover:text-[#F05A28] hover:bg-orange-50 transition-all flex items-center justify-center min-w-[64px]"
                                disabled={isOutOfStock}
                            >
                                <i className="fas fa-cart-plus text-xl"></i>
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                                className="flex-1 bg-gradient-to-r from-[#F05A28] to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl shadow-[0_10px_30px_rgba(240,90,40,0.3)] hover:shadow-[0_15px_35px_rgba(240,90,40,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg tracking-wide"
                            >
                                {isOutOfStock ? 'HẾT HÀNG' : 'MUA NGAY'}
                                <i className="fas fa-arrow-right text-sm opacity-90"></i>
                            </button>
                        </div>

                        {/* Trust Text */}
                        <p className="text-xs text-slate-400 flex items-center gap-2 mt-2 pl-1">
                            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                                <i className="fas fa-check text-[8px] text-green-600"></i>
                            </div>
                            Cam kết hoàn tiền trong 7 ngày nếu không hài lòng.
                        </p>
                    </div>
                </div>

                {/* CONTENT & DETAILS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">

                    {/* Left: Detailed Description & Features */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description Card */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] relative overflow-hidden group">
                            {/* Decorative pastel blob */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-100 rounded-full blur-3xl group-hover:bg-orange-200/50 transition-colors opacity-60"></div>

                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 relative z-10">
                                <span className="w-1 h-6 rounded-full bg-[#F05A28] block shadow-sm"></span>
                                Thông tin chi tiết
                            </h2>
                            <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-light relative z-10">
                                <p className="whitespace-pre-line">{product.description}</p>
                            </div>
                        </div>

                        {/* Features Grid */}
                        {product.features && product.features.length > 0 && (
                            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <span className="w-1 h-6 rounded-full bg-[#F05A28] block shadow-sm"></span>
                                    Quyền lợi nâng cấp
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.features.map((feature, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-xl bg-orange-50/50 border border-orange-100/50 hover:bg-orange-50 hover:border-orange-200 transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-all duration-300">
                                                <i className="fas fa-check text-[#F05A28] text-sm"></i>
                                            </div>
                                            <div>
                                                <p className="text-slate-700 font-medium text-sm pt-2">{feature}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Sidebar Info */}
                    <div className="space-y-6">

                        {/* Rating Card */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent"></div>
                            <div className="text-[#F05A28] text-xs font-bold uppercase tracking-widest mb-4">Khách hàng đánh giá</div>
                            <div className="flex flex-col items-center justify-center gap-2 mb-4">
                                <span className="text-6xl font-black text-slate-800 tracking-tighter drop-shadow-sm">5.0</span>
                                <div className="flex text-yellow-400 text-sm gap-1">
                                    <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                                </div>
                                <div className="text-slate-400 text-xs mt-1">Dựa trên 561 đánh giá</div>
                            </div>
                        </div>

                        {/* Why Buy Card */}
                        <div className="bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-xl rounded-2xl p-6 border border-white shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                            <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider border-b border-orange-100 pb-4 flex items-center">
                                <i className="fas fa-crown text-[#F05A28] mr-2 text-lg"></i>
                                Vì sao chọn KeyT?
                            </h3>
                            <div className="space-y-5">
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 mt-1 shadow-sm">
                                        <i className="fas fa-rocket text-xs"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700 text-sm">Giao hàng thần tốc</h4>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Hệ thống tự động gửi tài khoản ngay sau khi thanh toán.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#F05A28] shrink-0 mt-1 shadow-sm">
                                        <i className="fas fa-headset text-xs"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700 text-sm">Hỗ trợ 24/7</h4>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Đội ngũ kỹ thuật hỗ trợ xuyên suốt quá trình sử dụng.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 shrink-0 mt-1 shadow-sm">
                                        <i className="fas fa-shield-virus text-xs"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700 text-sm">Bảo hành an tâm</h4>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">Hoàn tiền 100% nếu có lỗi từ hệ thống.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
