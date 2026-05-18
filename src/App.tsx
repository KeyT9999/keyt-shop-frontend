import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import { useAuthContext } from './context/useAuthContext';

import Header from './components/Header';
import FloatingContact from './components/FloatingContact';
import ChatWidget from './components/chat/ChatWidget';
import AdminChatBubble from './components/chat/AdminChatBubble';
import ProtectedRoute from './components/ProtectedRoute';
import Seo from './components/Seo';
import StructuredData from './components/StructuredData';
import VisitTracker from './components/VisitTracker';
import AnnouncementModal from './components/AnnouncementModal';
import AffiliateReferralTracker from './components/affiliate/AffiliateReferralTracker';
import { announcementService } from './services/announcementService';

// Lazy loading pages
const ProductList = lazy(() => import('./pages/ProductList'));
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const YoutubeSummarizerPage = lazy(() => import('./pages/YoutubeSummarizerPage'));
const GetOtpPage = lazy(() => import('./pages/GetOtpPage'));
const GetOtpGeminiPage = lazy(() => import('./pages/GetOtpGeminiPage'));
const Get2faPage = lazy(() => import('./pages/Get2faPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBannerPage = lazy(() => import('./pages/admin/AdminBannerPage'));
const EvidenceCheckerPage = lazy(() => import('./pages/EvidenceCheckerPage'));
const ChatGptAccountsPage = lazy(() => import('./pages/admin/ChatGptAccountsPage'));
const SubscriptionsPage = lazy(() => import('./pages/admin/SubscriptionsPage'));
const UserLoginHistoryPage = lazy(() => import('./pages/admin/UserLoginHistoryPage'));
const OtpRequestsPage = lazy(() => import('./pages/admin/OtpRequestsPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));
const NetflixReplacementTicketsPage = lazy(() => import('./pages/admin/NetflixReplacementTicketsPage'));
const AdminAffiliatePage = lazy(() => import('./pages/admin/AdminAffiliatePage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const UserOrdersPage = lazy(() => import('./pages/UserOrdersPage'));
const InvoiceView = lazy(() => import('./components/order/InvoiceView'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const QrPaymentPage = lazy(() => import('./pages/QrPaymentPage'));
const WarrantyRefundPage = lazy(() => import('./pages/WarrantyRefundPage'));
const PurchaseGuidePage = lazy(() => import('./pages/PurchaseGuidePage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const PhotoFramePage = lazy(() => import('./pages/PhotoFramePage'));
const CompressPage = lazy(() => import('./pages/CompressPage'));
const AdminChatPage = lazy(() => import('./pages/admin/AdminChatPage'));

export default function App() {
    const { user, token } = useAuthContext();
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const [announcementOpen, setAnnouncementOpen] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementMessage, setAnnouncementMessage] = useState('');

    // Debug: Log user admin status
    useEffect(() => {
        if (user) {
            console.log('Current user:', user);
            console.log('Is admin:', user.admin);
        }
    }, [user]);

    // Fetch active announcement once after login; dismissal is session-only (no localStorage)
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (!token || !user) return;
            try {
                const announcement = await announcementService.getActiveAnnouncement(token);
                if (cancelled) return;
                if (announcement && announcement.isActive) {
                    setAnnouncementTitle(announcement.title || '');
                    setAnnouncementMessage(announcement.message || '');
                    setAnnouncementOpen(true);
                }
            } catch (err) {
                // non-blocking
                console.warn('Failed to load announcement:', err);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [token, user]);



    const seoConfig = useMemo(() => {
        const path = location.pathname;
        const base = {
            title: 'Mua Tài Khoản Premium Chính Hãng, Giá Rẻ | Tiệm Tạp Hóa KeyT',
            description:
                'Tiệm Tạp Hóa KeyT - Đại lý bán tài khoản Premium giá siêu rẻ: Canva Pro, CapCut Pro, ChatGPT Plus, Office và nhiều dịch vụ khác. Bảo hành rõ ràng, hỗ trợ nhanh 24/7 ✓',
            canonicalPath: path,
            type: 'website' as const,
            noIndex: false,
        };

        const staticNoIndexPaths = [
            '/cart',
            '/checkout',
            '/profile',
            '/wishlist',
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
            '/verify-email',
            '/payment-success',
            '/payment-qr',
            '/get-otp',
            '/get-otp-gemini',
            '/2falive',
            '/summarizer',
            '/evidence',
        ];

        if (
            staticNoIndexPaths.includes(path) ||
            path.startsWith('/orders') ||
            path.startsWith('/admin') ||
            path.startsWith('/payment')
        ) {
            return { ...base, noIndex: true };
        }

        if (path === '/') {
            return {
                ...base,
                title: 'Tiệm Tạp Hóa KeyT – Canva Pro, CapCut Pro, ChatGPT Plus Giá Rẻ, Giao Nhanh',
                description:
                    'Mua Canva Pro, CapCut Pro, ChatGPT Plus, Office chính hãng tại Tiệm Tạp Hóa KeyT – giá rẻ, kích hoạt nhanh, bảo hành suốt thời gian dùng, hỗ trợ Zalo 24/7. Đặt mua ngay!',
                canonicalPath: '/',
            };
        }

        // Removed dynamic logic for /products/:id. ProductDetail will handle its own SEO now.
        if (path.startsWith('/products/') && path !== '/products') {
           return base; // Let the ProductDetail component override
        }

        if (path === '/products') {
            return {
                ...base,
                title: 'Danh Sách Dịch Vụ Premium – Canva Pro, CapCut Pro, ChatGPT Plus, Office | KeyT',
                description:
                    'Xem bảng giá chi tiết Canva Pro, CapCut Pro, ChatGPT Plus, Office chính hãng tại Tiệm Tạp Hóa KeyT. Dịch vụ premium giá rẻ, kích hoạt nhanh, bảo hành rõ ràng, ưu đãi cho sinh viên.',
                canonicalPath: '/products',
            };
        }

        if (path === '/purchase-guide') {
            return {
                ...base,
                title: 'Hướng Dẫn Mua Canva Pro, CapCut Pro, ChatGPT Plus Tại Tiệm Tạp Hóa KeyT',
                description:
                    'Xem hướng dẫn chi tiết cách đặt mua Canva Pro, CapCut Pro, ChatGPT Plus, Office tại Tiệm Tạp Hóa KeyT – thao tác đơn giản, thanh toán an toàn, nhận dịch vụ nhanh, có bảo hành rõ ràng.',
                canonicalPath: '/purchase-guide',
            };
        }

        if (path === '/faq') {
            return {
                ...base,
                title: 'FAQ Tiệm Tạp Hóa KeyT – Giải Đáp Về Canva Pro, CapCut Pro, ChatGPT Plus, Bảo Hành',
                description:
                    'Câu hỏi thường gặp về đặt hàng, thanh toán, thời gian nhận dịch vụ, bảo hành và hoàn tiền tại Tiệm Tạp Hóa KeyT. Giải đáp thắc mắc trước khi mua Canva Pro, CapCut Pro, ChatGPT Plus, Office.',
                canonicalPath: '/faq',
            };
        }

        if (path === '/warranty-refund') {
            return {
                ...base,
                title: 'Chính Sách Bảo Hành & Hoàn Tiền – Tiệm Tạp Hóa KeyT',
                description:
                    'Tìm hiểu chi tiết chính sách bảo hành và hoàn tiền tại Tiệm Tạp Hóa KeyT: điều kiện được hoàn tiền, thời gian xử lý, phạm vi bảo hành cho Canva Pro, CapCut Pro, ChatGPT Plus, Office.',
                canonicalPath: '/warranty-refund',
            };
        }

        if (path === '/photo-frame') {
            return {
                ...base,
                title: 'Tạo Khung Ảnh Chuyên Nghiệp Online Miễn Phí | Tiệm KeyT',
                description:
                    'Công cụ ghép khung ảnh thông minh, tự động thêm số liệu EXIF và watermark dành cho các Photographer. Sử dụng 100% miễn phí ngay trên trình duyệt ✓',
                canonicalPath: '/photo-frame',
            }
        }

        if (path === '/compress') {
            return {
                ...base,
                title: 'Nén Ảnh Online Miễn Phí – Giảm Dung Lượng Ảnh Nhanh | KeyT Compress',
                description:
                    'Nén ảnh online miễn phí, hỗ trợ WebP, AVIF, PNG, JPEG, GIF. Giảm dung lượng ảnh tới 90% không giảm chất lượng. Không cần đăng ký, nén tới 10 ảnh cùng lúc. Phù hợp cho website và bán hàng online.',
                canonicalPath: '/compress',
            }
        }

        return base;
    }, [location.pathname]);


    const isAdminPage = location.pathname.startsWith('/admin');
    const isAdmin = user?.admin === true;
    const showChatWidget = !isAdmin && !isAdminPage;

    return (
        <div className="app">
            <VisitTracker />
            <AffiliateReferralTracker />
            <Seo {...seoConfig} />
            <StructuredData />
            <FloatingContact />
            {showChatWidget && <ChatWidget />}
            {isAdmin && <AdminChatBubble />}
            <AnnouncementModal
                open={announcementOpen}
                title={announcementTitle}
                message={announcementMessage}
                onClose={() => setAnnouncementOpen(false)}
            />

            <Header onSearch={setSearchQuery} searchValue={searchQuery} />

            <main className="main-content-full">
                <Suspense fallback={
                    <div className="bg-[#fdfbf7] min-h-[70vh] flex items-center justify-center text-slate-800">
                      <div className="text-xl font-game animate-pulse text-[#F05A28]">LOADING...</div>
                    </div>
                }>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductList searchQuery={searchQuery} showHero={false} />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><UserOrdersPage /></ProtectedRoute>} />
                        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                        <Route path="/orders/:id/invoice" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />
                        <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
                        <Route path="/payment-qr" element={<QrPaymentPage />} />
                        <Route path="/evidence" element={<ProtectedRoute><EvidenceCheckerPage /></ProtectedRoute>} />
                        <Route path="/summarizer" element={<ProtectedRoute><YoutubeSummarizerPage /></ProtectedRoute>} />
                        <Route path="/get-otp" element={<ProtectedRoute><GetOtpPage /></ProtectedRoute>} />
                        <Route path="/get-otp-gemini" element={<ProtectedRoute><GetOtpGeminiPage /></ProtectedRoute>} />
                        <Route path="/2falive" element={<ProtectedRoute><Get2faPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/verify-email" element={<VerifyEmailPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/warranty-refund" element={<WarrantyRefundPage />} />
                        <Route path="/purchase-guide" element={<PurchaseGuidePage />} />
                        <Route path="/faq" element={<FAQPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                        <Route path="/photo-frame" element={<PhotoFramePage />} />
                        <Route path="/compress" element={<CompressPage />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/chatgpt-accounts" element={<ChatGptAccountsPage />} />
                        <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
                        <Route path="/admin/banners" element={<AdminBannerPage />} />
                        <Route path="/admin/users" element={<UsersPage />} />
                        <Route path="/admin/products" element={<ProductsPage />} />
                        <Route path="/admin/orders" element={<OrdersPage />} />
                        <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
                        <Route path="/admin/affiliate" element={<AdminAffiliatePage />} />
                        <Route path="/admin/netflix-replacements" element={<NetflixReplacementTicketsPage />} />
                        <Route path="/admin/user-login-history/:userId" element={<UserLoginHistoryPage />} />
                        <Route path="/admin/otp-requests" element={<OtpRequestsPage />} />
                        <Route path="/admin/chat" element={<AdminChatPage />} />
                    </Routes>
                </Suspense>
            </main>

        </div>
    );
}
