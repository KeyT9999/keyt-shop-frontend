import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import UserOrdersPage from './pages/UserOrdersPage';
import InvoiceView from './components/order/InvoiceView';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import { useAuthContext } from './context/useAuthContext';
import Footer from './components/Footer';
import Header from './components/Header';
import FloatingContact from './components/FloatingContact';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    const { user } = useAuthContext();
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    // Debug: Log user admin status
    useEffect(() => {
        if (user) {
            console.log('Current user:', user);
            console.log('Is admin:', user.admin);
        }
    }, [user]);

    return (
        <div className="app">
            <FloatingContact />

            <Header onSearch={setSearchQuery} searchValue={searchQuery} />

            <main className={isHomePage ? "main-content-full" : "main-content"}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductList searchQuery={searchQuery} showHero={false} />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><UserOrdersPage /></ProtectedRoute>} />
                    <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                    <Route path="/orders/:id/invoice" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />
                    <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
                    <Route path="/evidence" element={<ProtectedRoute><EvidenceCheckerPage /></ProtectedRoute>} />
                    <Route path="/summarizer" element={<ProtectedRoute><YoutubeSummarizerPage /></ProtectedRoute>} />
                    <Route path="/get-otp" element={<ProtectedRoute><GetOtpPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
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
