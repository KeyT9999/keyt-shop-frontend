import { Facebook, Music, CreditCard, QrCode, Smartphone, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0f1016] text-gray-300 py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Cột 1: Thương hiệu */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-yellow-500 tracking-wide uppercase">KEYT STORE</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Kho dịch vụ số đa dạng, uy tín, hỗ trợ tận tâm. Nâng tầm trải nghiệm số của bạn với chi phí tối ưu nhất.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 group">
                {/* TikTok placeholder icon */}
                <Music size={20} className="group-hover:animate-bounce" />
              </a>
            </div>
          </div>

          {/* Cột 2: Sản phẩm */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Sản phẩm</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="#" className="hover:text-yellow-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span> Spotify Premium
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-yellow-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span> Netflix 4K
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-yellow-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span> Youtube Premium
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-yellow-500 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span> Adobe Creative
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-400 text-gray-500 transition-colors text-xs italic">
                  & nhiều hơn nữa...
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="#" className="hover:text-yellow-500 transition-colors">Bảo hành & Hoàn tiền</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-yellow-500 transition-colors">Hướng dẫn mua hàng</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-yellow-500 transition-colors">Câu hỏi thường gặp</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-yellow-500 transition-colors">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-yellow-500 transition-colors">Điều khoản dịch vụ</Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Thanh toán & Social */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Chấp nhận thanh toán</h3>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition cursor-pointer" title="Momo">
                  <Smartphone size={24} className="text-pink-500" />
                </div>
                <div className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition cursor-pointer" title="Visa/Mastercard">
                  <CreditCard size={24} className="text-blue-400" />
                </div>
                <div className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition cursor-pointer" title="QR Code">
                  <QrCode size={24} className="text-white" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Kết nối với chúng tôi</h3>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Nhập email nhận ưu đãi..."
                  className="w-full bg-gray-800 text-white text-sm rounded-lg pl-4 pr-12 py-3 border border-gray-700 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-gray-500"
                />
                <button className="absolute right-1 top-1 bottom-1 bg-yellow-500 hover:bg-yellow-400 text-black p-2 rounded-md transition-colors flex items-center justify-center">
                  <Send size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Đăng ký để nhận mã giảm giá 10% cho đơn hàng đầu tiên.</p>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} <span className="text-gray-300 font-medium">KeyT Store</span>. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <span className="hover:text-gray-300 cursor-pointer">Privacy</span>
            <span className="hover:text-gray-300 cursor-pointer">Terms</span>
            <span className="hover:text-gray-300 cursor-pointer">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
