import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useWishlistContext } from '../context/useWishlistContext';
import { useCartContext } from '../context/useCartContext';
import { formatPrice } from '../utils/formatPrice';

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlistContext();
    const { addItem } = useCartContext();

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-brand-navy mb-8">Danh sách yêu thích ({wishlist.length})</h1>

                {wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <p className="text-slate-500 mb-6">Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
                        <Link to="/products" className="btn btn-primary">
                            Khám phá sản phẩm ngay
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col group">
                                <Link to={`/products/${product._id}`} className="relative aspect-video block overflow-hidden bg-slate-100">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <span className="text-4xl">🖼️</span>
                                        </div>
                                    )}
                                </Link>

                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">
                                        <Link to={`/products/${product._id}`} className="hover:text-brand-orange transition-colors">
                                            {product.name}
                                        </Link>
                                    </h3>

                                    <div className="mt-auto pt-4 flex items-center justify-between">
                                        <span className="text-brand-orange font-bold">
                                            {formatPrice(product.price, product.currency)}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => addItem(product)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-brand-navy text-white py-2 rounded-md hover:bg-brand-orange transition-colors text-sm font-medium"
                                        >
                                            <ShoppingCart size={16} /> Thêm vào giỏ
                                        </button>
                                        <button
                                            onClick={() => removeFromWishlist(product._id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                            title="Xóa khỏi danh sách yêu thích"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
