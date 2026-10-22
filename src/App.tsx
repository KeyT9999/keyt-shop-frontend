import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import { useAuthContext } from './context/useAuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
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
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBannerPage = lazy(() => import('./pages/admin/AdminBannerPage'));
const EvidenceCheckerPage = lazy(() => import('./pages/EvidenceCheckerPage'));
const ChatGptAccountsPage = lazy(() => import('./pages/admin/ChatGptAccountsPage'));
const GeminiAccountsPage = lazy(() => import('./pages/admin/GeminiAccountsPage'));
const SubscriptionsPage = lazy(() => import('./pages/admin/SubscriptionsPage'));
const UserLoginHistoryPage = lazy(() => import('./pages/admin/UserLoginHistoryPage'));
const OtpRequestsPage = lazy(() => import('./pages/admin/OtpRequestsPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));
const NetflixReplacementTicketsPage = lazy(() => import('./pages/admin/NetflixReplacementTicketsPage'));
const AdminAffiliatePage = lazy(() => import('./pages/admin/AdminAffiliatePage'));
const ReviewsPage = lazy(() => import('./pages/admin/ReviewsPage'));
const AnnouncementPage = lazy(() => import('./pages/admin/AnnouncementPage'));
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
const AiImagePage = lazy(() => import('./pages/AiImagePage'));
const VideoTranslatePage = lazy(() => import('./pages/VideoTranslatePage'));
const AdminChatPage = lazy(() => import('./pages/admin/AdminChatPage'));

// Multi-Language Course Pages
const CoursesHubPage = lazy(() => import('./pages/courses/CoursesHubPage'));
const CourseLandingPage = lazy(() => import('./pages/courses/CourseLandingPage'));
const VocabularyLessonListPage = lazy(() => import('./pages/courses/VocabularyLessonListPage'));
const VocabularyDetailPage = lazy(() => import('./pages/courses/VocabularyDetailPage'));
const KanjiLessonListPage = lazy(() => import('./pages/courses/KanjiLessonListPage'));
const KanjiDetailPage = lazy(() => import('./pages/courses/KanjiDetailPage'));
const GrammarLessonListPage = lazy(() => import('./pages/courses/GrammarLessonListPage'));
const GrammarDetailPage = lazy(() => import('./pages/courses/GrammarDetailPage'));
const ExamListPage = lazy(() => import('./pages/courses/ExamListPage'));
const SpeakingPage = lazy(() => import('./pages/courses/SpeakingPage'));
const KanaQuizPage = lazy(() => import('./pages/courses/KanaQuizPage'));

export default function App() {
    const { user, token } = useAuthContext();
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const [announcementOpen, setAnnouncementOpen] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementMessage, setAnnouncementMessage] = useState('');

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
            title: 'KeyT Hub – Hệ Sinh Thái Ngoại Ngữ AI (Nhật • Trung • Anh), Cổng OTP 2FA & Studio Ảnh',
            description:
                'KeyT Hub - Học Tiếng Nhật FPT (JPD113/123 & Kana), Tiếng Trung HSK 1–2, Tiếng Anh Hackers TOEIC, lấy mã OTP ChatGPT/Gemini & 2FA Live 30s, Tạo khung ảnh EXIF 4K và Xử lý ảnh AI miễn phí ✓',
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
                title: 'KeyT Hub – Học Ngoại Ngữ AI (Nhật • Trung • Anh), Lấy Mã OTP 2FA & Khung Ảnh EXIF',
                description:
                    'Khám phá hệ sinh thái KeyT Hub: Cổng lấy mã OTP ChatGPT/Gemini & 2FA Live 30s, Học viện Tiếng Nhật FPT (JPD113/123, Giám thị AI 1-1, Kana), Tiếng Trung HSK 1–2, Hackers TOEIC 5.900+ từ & Studio Ảnh EXIF 4K.',
                canonicalPath: '/',
            };
        }

        if (path.startsWith('/products/') && path !== '/products') {
            return base;
        }

        if (path === '/products') {
            return {
                ...base,
                title: 'Danh Sách Công Cụ & Dịch Vụ Số | KeyT Hub',
                description:
                    'Xem bảng giá và đăng ký các công cụ AI hỗ trợ học tập, làm việc hiệu quả tại KeyT Hub. Dịch vụ chất lượng, kích hoạt nhanh, bảo hành rõ ràng.',
                canonicalPath: '/products',
            };
        }

        if (path === '/purchase-guide') {
            return {
                ...base,
                title: 'Hướng Dẫn Mua Hàng & Sử Dụng Dịch Vụ | KeyT Hub',
                description:
                    'Xem hướng dẫn chi tiết các bước đặt mua và sử dụng các công cụ AI, dịch vụ công nghệ tại KeyT Hub – thao tác đơn giản, thanh toán an toàn, kích hoạt nhanh chóng.',
                canonicalPath: '/purchase-guide',
            };
        }

        if (path === '/faq') {
            return {
                ...base,
                title: 'FAQ KeyT Hub – Giải Đáp Thắc Mắc Về Dịch Vụ & Bảo Hành',
                description:
                    'Câu hỏi thường gặp về đặt hàng, thanh toán, thời gian nhận dịch vụ, bảo hành và hoàn tiền khi sử dụng các công cụ AI và dịch vụ công nghệ tại KeyT Hub.',
                canonicalPath: '/faq',
            };
        }

        if (path === '/warranty-refund') {
            return {
                ...base,
                title: 'Chính Sách Bảo Hành & Hoàn Tiền – KeyT Hub',
                description:
                    'Tìm hiểu chi tiết chính sách bảo hành và hoàn tiền tại KeyT Hub: điều kiện được hoàn tiền, thời gian xử lý, phạm vi bảo hành cho các công cụ AI và dịch vụ công nghệ.',
                canonicalPath: '/warranty-refund',
            };
        }

        if (path === '/photo-frame') {
            return {
                ...base,
                title: 'Tạo Khung Ảnh EXIF Chuyên Nghiệp Online Miễn Phí | KeyT Hub',
                description:
                    'Công cụ ghép khung ảnh thông minh, tự động thêm số liệu EXIF (Leica, Sony, Fujifilm, Canon, Apple) và watermark dành cho Photographer. Sử dụng 100% miễn phí ngay trên trình duyệt ✓',
                canonicalPath: '/photo-frame',
            };
        }

        if (path === '/ai-image') {
            return {
                ...base,
                title: 'AI Xử Lý Ảnh Online – Tách Nền 1 Chạm, Caption AI, Gợi Ý Khung | KeyT Hub',
                description:
                    'Công cụ AI xử lý ảnh miễn phí: tự động viết caption + hashtag, gợi ý khung ảnh đẹp, xóa nền tự động 100% không cần key và kiểm tra metadata AI.',
                canonicalPath: '/ai-image',
            };
        }

        if (path === '/video-translate') {
            return {
                ...base,
                title: 'AI Dịch & Lồng Tiếng Video Tự Động (YouTube • TikTok • Douyin) | KeyT Hub',
                description:
                    'Hệ thống tự động tải video, nhận diện giọng nói Groq Whisper V3, dịch ngữ cảnh bằng AI, lồng tiếng Việt tự nhiên & đóng phụ đề chạy 24/7 trên VPS KeyT.',
                canonicalPath: '/video-translate',
            };
        }

        if (path === '/compress') {
            return {
                ...base,
                title: 'Nén Ảnh Online Miễn Phí – Giảm 90% Dung Lượng Chuẩn HD | KeyT Compress',
                description:
                    'Nén ảnh online miễn phí, hỗ trợ WebP, AVIF, PNG, JPEG, GIF. Giảm dung lượng ảnh tới 90% không giảm chất lượng. Không cần đăng ký, nén tới 10 ảnh cùng lúc.',
                canonicalPath: '/compress',
            };
        }

        if (path === '/courses/kana' || path.endsWith('/kana')) {
            return {
                ...base,
                title: 'Luyện Gõ Bảng Chữ Cái Tiếng Nhật Kana Quiz (Hiragana & Katakana) | KeyT Hub',
                description:
                    'Luyện nhớ và gõ bảng chữ cái Hiragana, Katakana chuẩn Tofugu Kana Quiz. Hỗ trợ đa dạng font chữ Nhật Bản, âm đục, âm ghép và phát âm giọng bản xứ.',
                canonicalPath: '/courses/kana',
            };
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
            {!isAdminPage && <FloatingContact />}
            {showChatWidget && <ChatWidget />}
            {isAdmin && <AdminChatBubble />}
            <AnnouncementModal
                open={announcementOpen}
                title={announcementTitle}
                message={announcementMessage}
                onClose={() => setAnnouncementOpen(false)}
            />

            {!isAdminPage && <Header onSearch={setSearchQuery} searchValue={searchQuery} />}

            <main className={isAdminPage ? "main-content-admin" : "main-content-full"}>
                <Suspense
                    fallback={
                        <div className="bg-[#F8FAFC] min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-800">
                            <div className="w-10 h-10 rounded-2xl border-3 border-[#F05A28]/20 border-t-[#F05A28] animate-spin" />
                            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                                Đang tải KeyT Hub...
                            </div>
                        </div>
                    }
                >
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
                        <Route path="/get-otp-gemini" element={<ProtectedRoute><GetOtpPage /></ProtectedRoute>} />
                        <Route path="/get-otp/gemini" element={<Navigate to="/get-otp-gemini" replace />} />
                        <Route path="/gemini-otp" element={<Navigate to="/get-otp-gemini" replace />} />
                        <Route path="/2falive" element={<ProtectedRoute><GetOtpPage /></ProtectedRoute>} />
                        <Route path="/get-2fa" element={<Navigate to="/2falive" replace />} />
                        <Route path="/2fa" element={<Navigate to="/2falive" replace />} />
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
                        <Route path="/ai-image" element={<AiImagePage />} />
                        <Route path="/video-translate" element={<VideoTranslatePage />} />

                        {/* Multi-Language Course Routes */}
                        <Route path="/courses" element={<CoursesHubPage />} />
                        <Route path="/courses/hsk1" element={<Navigate to="/courses/hsk1/vocabulary" replace />} />
                        <Route path="/courses/hsk2" element={<Navigate to="/courses/hsk2/vocabulary" replace />} />
                        <Route path="/courses/toeichackers" element={<Navigate to="/courses/toeichackers/vocabulary" replace />} />
                        <Route path="/courses/toeic120" element={<Navigate to="/courses/toeic120/vocabulary" replace />} />
                        <Route path="/courses/engbk" element={<Navigate to="/courses/engbk/vocabulary" replace />} />
                        <Route path="/courses/engbk2" element={<Navigate to="/courses/engbk2/vocabulary" replace />} />
                        <Route path="/courses/eng1000" element={<Navigate to="/courses/eng1000/vocabulary" replace />} />
                        <Route path="/courses/kana" element={<KanaQuizPage />} />
                        <Route path="/courses/kana/:type" element={<KanaQuizPage />} />
                        <Route path="/courses/:courseCode" element={<CourseLandingPage />} />
                        <Route path="/courses/:courseCode/kana" element={<KanaQuizPage />} />
                        <Route path="/courses/:courseCode/kana/:type" element={<KanaQuizPage />} />
                        <Route path="/courses/:courseCode/vocabulary" element={<VocabularyLessonListPage />} />
                        <Route path="/courses/:courseCode/vocabulary/:lessonSlug" element={<VocabularyDetailPage />} />
                        <Route path="/courses/:courseCode/kanji" element={<KanjiLessonListPage />} />
                        <Route path="/courses/:courseCode/kanji/:lessonSlug" element={<KanjiDetailPage />} />
                        <Route path="/courses/:courseCode/kanji/:lessonSlug/:mode" element={<KanjiDetailPage />} />
                        <Route path="/courses/:courseCode/grammar" element={<GrammarLessonListPage />} />
                        <Route path="/courses/:courseCode/grammar/:lessonSlug" element={<GrammarDetailPage />} />
                        <Route path="/courses/:courseCode/exam" element={<ExamListPage />} />
                        <Route path="/courses/:courseCode/exam/:examSlug" element={<ExamListPage />} />
                        <Route path="/courses/:courseCode/speaking" element={<SpeakingPage />} />
                        <Route path="/courses/:courseCode/speaking/:tab" element={<SpeakingPage />} />

                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="chatgpt-accounts" element={<ChatGptAccountsPage />} />
                            <Route path="gemini" element={<GeminiAccountsPage />} />
                            <Route path="subscriptions" element={<SubscriptionsPage />} />
                            <Route path="banners" element={<AdminBannerPage />} />
                            <Route path="users" element={<UsersPage />} />
                            <Route path="products" element={<ProductsPage />} />
                            <Route path="orders" element={<OrdersPage />} />
                            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                            <Route path="affiliate" element={<AdminAffiliatePage />} />
                            <Route path="netflix-replacements" element={<NetflixReplacementTicketsPage />} />
                            <Route path="user-login-history/:userId" element={<UserLoginHistoryPage />} />
                            <Route path="otp-requests" element={<OtpRequestsPage />} />
                            <Route path="reviews" element={<ReviewsPage />} />
                            <Route path="announcement" element={<AnnouncementPage />} />
                            <Route path="chat" element={<AdminChatPage />} />
                            <Route path="video-translate" element={<VideoTranslatePage />} />
                        </Route>
                    </Routes>
                </Suspense>
            </main>

            {!isAdminPage && <Footer />}
        </div>
    );
}
