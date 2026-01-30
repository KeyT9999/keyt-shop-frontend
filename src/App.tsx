import { useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import ProductList from './pages/ProductList';
import HomePage from './pages/HomePage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import YoutubeSummarizerPage from './pages/YoutubeSummarizerPage';
import GetOtpPage from './pages/GetOtpPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBannerPage from './pages/admin/AdminBannerPage';
import EvidenceCheckerPage from './pages/EvidenceCheckerPage';
import ChatGptAccountsPage from './pages/admin/ChatGptAccountsPage';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';
import UserLoginHistoryPage from './pages/admin/UserLoginHistoryPage';
import OtpRequestsPage from './pages/admin/OtpRequestsPage';
import UsersPage from './pages/admin/UsersPage';
import ProductsPage from './pages/admin/ProductsPage';
import OrdersPage from './pages/admin/OrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import OrderDetailPage from './pages/OrderDetailPage';
import UserOrdersPage from './pages/UserOrdersPage';
import InvoiceView from './components/order/InvoiceView';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import QrPaymentPage from './pages/QrPaymentPage';
import WarrantyRefundPage from './pages/WarrantyRefundPage';
import PurchaseGuidePage from './pages/PurchaseGuidePage';
import FAQPage from './pages/FAQPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import { useAuthContext } from './context/useAuthContext';
import Footer from './components/Footer';
import Header from './components/Header';
import FloatingContact from './components/FloatingContact';
import ProtectedRoute from './components/ProtectedRoute';
import Seo from './components/Seo';
import StructuredData from './components/StructuredData';

export default function App() {
    const { user } = useAuthContext();
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();

    // Debug: Log user admin status
    useEffect(() => {
        if (user) {
            console.log('Current user:', user);
            console.log('Is admin:', user.admin);
        }
    }, [user]);



    const seoConfig = useMemo(() => {
        const path = location.pathname;
        const base = {
            title: 'Tiệm Tạp Hóa KeyT | Dịch vụ Premium Chính Hãng - Canva Pro, CapCut Pro, ChatGPT Plus',
            description:
                'Kho dịch vụ số đa dạng, uy tín, hỗ trợ tận tâm. Mua Canva Pro, CapCut Pro, ChatGPT Plus, Microsoft 365, Netflix, Spotify Premium và nhiều tài khoản premium chính hãng với giá tốt nhất. Bảo hành đầy đủ, hỗ trợ 24/7. Đăng ký ngay nhận mã giảm giá 10% cho đơn hàng đầu tiên!',
            canonicalPath: path,
            type: 'website' as const,
        };

        if (path === '/') {
            return {
                ...base,
                title: 'Tiệm Tạp Hóa KeyT – Canva Pro, CapCut Pro, ChatGPT Plus, Office Premium Chính Hãng',
                description: 'Kho dịch vụ số đa dạng, uy tín, hỗ trợ tận tâm. Mua Canva Pro, CapCut Pro, ChatGPT Plus, Microsoft 365, Netflix, Spotify Premium và nhiều tài khoản premium chính hãng với giá tốt nhất. Bảo hành đầy đủ, hỗ trợ 24/7. Đăng ký ngay nhận mã giảm giá 10% cho đơn hàng đầu tiên!',
                canonicalPath: '/',
            };
        }

        if (path.startsWith('/products/')) {
            return {
                ...base,
                title: 'Chi tiết dịch vụ premium | Tiệm Tạp Hóa KeyT',
                description:
                    'Xem mô tả, gói và chính sách bảo hành cho dịch vụ premium (Canva Pro, CapCut Pro, ChatGPT Plus, Microsoft 365...).',
            };
        }

        if (path === '/products') {
            return {
                ...base,
                title: 'Danh sách dịch vụ premium | Canva Pro, CapCut Pro, ChatGPT Plus, Office',
                canonicalPath: '/products',
            };
        }

        if (path === '/purchase-guide') {
            return {
                ...base,
                title: 'Hướng dẫn mua dịch vụ premium KeyT – Canva Pro, CapCut Pro, ChatGPT Plus',
                description:
                    'Các bước mua và kích hoạt dịch vụ premium tại Tiệm Tạp Hóa KeyT: chọn gói, thanh toán, nhận và sử dụng.',
                canonicalPath: '/purchase-guide',
            };
        }

        if (path === '/faq') {
            return {
                ...base,
                title: 'FAQ Tiệm Tạp Hóa KeyT – Canva Pro, CapCut Pro, ChatGPT Plus, Office',
                canonicalPath: '/faq',
            };
        }

        if (path === '/warranty-refund') {
            return {
                ...base,
                title: 'Bảo hành & hoàn tiền – Tiệm Tạp Hóa KeyT',
                canonicalPath: '/warranty-refund',
            };
        }

        return base;
    }, [location.pathname]);


    return (
        <div className="app">
            <Seo {...seoConfig} />
            <StructuredData />
            <FloatingContact />

            <Header onSearch={setSearchQuery} searchValue={searchQuery} />

            <main className="main-content-full">
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
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/chatgpt-accounts" element={<ChatGptAccountsPage />} />
                    <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
                    <Route path="/admin/banners" element={<AdminBannerPage />} />
                    <Route path="/admin/users" element={<UsersPage />} />
                    <Route path="/admin/products" element={<ProductsPage />} />
                    <Route path="/admin/orders" element={<OrdersPage />} />
                    <Route path="/admin/orders/:id" element={<AdminOrderDetailPage />} />
                    <Route path="/admin/user-login-history/:userId" element={<UserLoginHistoryPage />} />
                    <Route path="/admin/otp-requests" element={<OtpRequestsPage />} />
                </Routes>
            </main>

            <Footer />
        </div>
    );
}
