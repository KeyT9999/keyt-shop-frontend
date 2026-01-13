import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import ProductList from './pages/ProductList';
import HomePage from './pages/HomePage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
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
import InvoiceView from './components/order/InvoiceView';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import { useAuthContext } from './context/useAuthContext';
import Footer from './components/Footer';
import Header from './components/Header';

export default function App() {
    const { user } = useAuthContext();
    const [searchQuery, setSearchQuery] = useState('');

    // Debug: Log user admin status
    useEffect(() => {
        if (user) {
            console.log('Current user:', user);
            console.log('Is admin:', user.admin);
        }
    }, [user]);

    return (
        <div className="app">
            <div className="floating-rail">
                <a href="https://zalo.me" className="rail-item" aria-label="Zalo">ZL</a>
                <a href="https://m.me" className="rail-item" aria-label="Messenger">MS</a>
                <a href="#contact" className="rail-item" aria-label="Liên hệ">☎</a>
            </div>

            <Header onSearch={setSearchQuery} searchValue={searchQuery} />

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductList searchQuery={searchQuery} showHero={false} />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    <Route path="/orders/:id/invoice" element={<InvoiceView />} />
                    <Route path="/payment-success" element={<PaymentSuccessPage />} />
                    <Route path="/evidence" element={<EvidenceCheckerPage />} />
                    <Route path="/summarizer" element={<YoutubeSummarizerPage />} />
                    <Route path="/get-otp" element={<GetOtpPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
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
