import { useEffect, useMemo, useState, Suspense } from 'react';
import { Link, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import { useAuthContext } from './context/useAuthContext';
import { lazyWithRetry } from './utils/lazyWithRetry';

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
import DraggableRobotWidget from './components/robot/DraggableRobotWidget';
import {
    IS_GYM_COACH_ENABLED,
    IS_ROBOT_3D_ENABLED,
    IS_ZIWEI_ENABLED,
} from './config/features';
import { announcementService } from './services/announcementService';

// Lazy loading pages (with auto-recovery on stale deployment chunks)
const HomePage = lazyWithRetry(() => import('./pages/HomePage'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage'));
const YoutubeSummarizerPage = lazyWithRetry(() => import('./pages/YoutubeSummarizerPage'));
const GetOtpPage = lazyWithRetry(() => import('./pages/GetOtpPage'));
const ProfilePage = lazyWithRetry(() => import('./pages/ProfilePage'));
const ForgotPasswordPage = lazyWithRetry(() => import('./pages/ForgotPasswordPage'));
const VerifyEmailPage = lazyWithRetry(() => import('./pages/VerifyEmailPage'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/ResetPasswordPage'));
const AdminLayout = lazyWithRetry(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard'));
const EvidenceCheckerPage = lazyWithRetry(() => import('./pages/EvidenceCheckerPage'));
const ChatGptAccountsPage = lazyWithRetry(() => import('./pages/admin/ChatGptAccountsPage'));
const GeminiAccountsPage = lazyWithRetry(() => import('./pages/admin/GeminiAccountsPage'));
const SubscriptionsPage = lazyWithRetry(() => import('./pages/admin/SubscriptionsPage'));
const UserLoginHistoryPage = lazyWithRetry(() => import('./pages/admin/UserLoginHistoryPage'));
const OtpRequestsPage = lazyWithRetry(() => import('./pages/admin/OtpRequestsPage'));
const UsersPage = lazyWithRetry(() => import('./pages/admin/UsersPage'));
const OrdersPage = lazyWithRetry(() => import('./pages/admin/OrdersPage'));
const AdminOrderDetailPage = lazyWithRetry(() => import('./pages/admin/AdminOrderDetailPage'));
const NetflixReplacementTicketsPage = lazyWithRetry(() => import('./pages/admin/NetflixReplacementTicketsPage'));
const AnnouncementPage = lazyWithRetry(() => import('./pages/admin/AnnouncementPage'));
const OrderDetailPage = lazyWithRetry(() => import('./pages/OrderDetailPage'));
const UserOrdersPage = lazyWithRetry(() => import('./pages/UserOrdersPage'));
const InvoiceView = lazyWithRetry(() => import('./components/order/InvoiceView'));
const WarrantyRefundPage = lazyWithRetry(() => import('./pages/WarrantyRefundPage'));
const PrivacyPolicyPage = lazyWithRetry(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazyWithRetry(() => import('./pages/TermsOfServicePage'));
const PhotoFramePage = lazyWithRetry(() => import('./pages/PhotoFramePage'));
const CompressPage = lazyWithRetry(() => import('./pages/CompressPage'));
const AiImagePage = lazyWithRetry(() => import('./pages/AiImagePage'));
const VideoTranslatePage = lazyWithRetry(() => import('./pages/VideoTranslatePage'));
const GymCoachPage = lazyWithRetry(() => import('./pages/GymCoachPage'));
const ZiweiPage = lazyWithRetry(() => import('./pages/ZiweiPage'));
const AdminChatPage = lazyWithRetry(() => import('./pages/admin/AdminChatPage'));

// Multi-Language Course Pages
const CoursesHubPage = lazyWithRetry(() => import('./pages/courses/CoursesHubPage'));
const CourseLandingPage = lazyWithRetry(() => import('./pages/courses/CourseLandingPage'));
const VocabularyLessonListPage = lazyWithRetry(() => import('./pages/courses/VocabularyLessonListPage'));
const VocabularyDetailPage = lazyWithRetry(() => import('./pages/courses/VocabularyDetailPage'));
const KanjiLessonListPage = lazyWithRetry(() => import('./pages/courses/KanjiLessonListPage'));
const KanjiDetailPage = lazyWithRetry(() => import('./pages/courses/KanjiDetailPage'));
const GrammarLessonListPage = lazyWithRetry(() => import('./pages/courses/GrammarLessonListPage'));
const GrammarDetailPage = lazyWithRetry(() => import('./pages/courses/GrammarDetailPage'));
const ExamListPage = lazyWithRetry(() => import('./pages/courses/ExamListPage'));
const SpeakingPage = lazyWithRetry(() => import('./pages/courses/SpeakingPage'));
const KanaQuizPage = lazyWithRetry(() => import('./pages/courses/KanaQuizPage'));

export default function App() {
    const { user, token } = useAuthContext();
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
            '/profile',
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
            '/verify-email',
            '/get-otp',
            '/get-otp-gemini',
            '/2falive',
            '/summarizer',
            '/evidence',
        ];

        if (
            staticNoIndexPaths.includes(path) ||
            path.startsWith('/orders') ||
            path.startsWith('/admin')
        ) {
            return { ...base, noIndex: true };
        }

        if (path === '/') {
            return {
                ...base,
                title: 'KeyT Hub – Tử Vi Đẩu Số AI, Ngoại Ngữ (Nhật • Trung • Anh), Gym 3D, OTP 2FA & Ảnh EXIF',
                description:
                    'Khám phá hệ sinh thái KeyT Hub: Lập lá số Tử Vi Đẩu Số AI 12 cung & Hợp Hôn, Huấn luyện viên Gym 3D Nam/Nữ, Cổng lấy mã OTP ChatGPT/Gemini & 2FA Live 30s, Học viện Tiếng Nhật FPT (JPD113/123), HSK, TOEIC & Studio Ảnh EXIF 4K.',
                canonicalPath: '/',
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

        if (path === '/gym' || path.startsWith('/gym/')) {
            const isMaleGym = path.startsWith('/gym/nam');
            const isFemaleGym = path.startsWith('/gym/nu');
            return {
                ...base,
                title: isMaleGym
                    ? 'KeyT Gym 3D Nam (/gym/nam) – Lịch Tập Ngực Dày, Vai 3D, 6 Múi & Thực Đơn Tăng Cơ'
                    : isFemaleGym
                      ? 'KeyT Gym 3D Nữ (/gym/nu) – Độ Mông Đào S-Line, Đồng Bộ Chu Kỳ & Thực Đơn Giữ Dáng'
                      : 'KeyT Gym 3D Coach – Lộ Trình Tập Gym Nam & Nữ, Mô Phỏng 3D & Thực Đơn Cá Nhân Hóa',
                description:
                    'Trợ lý tập Gym 3D chuyên biệt cho Nam (/gym/nam) và Nữ (/gym/nu): Khảo sát thể trạng, đề xuất bài tập máy BRTW/Impulse, mô hình 3D xoay 360° và thực đơn ăn uống 4 bữa.',
                canonicalPath: isMaleGym ? '/gym/nam' : isFemaleGym ? '/gym/nu' : '/gym',
            };
        }

        if (path === '/tu-vi') {
            return {
                ...base,
                title: 'Lập Lá Số Tử Vi Đẩu Số AI & Xem Hợp Hôn (Thiên Kỷ Nghê Hải Hạ) | KeyT Hub',
                description:
                    'Hệ thống an sao Tử Vi Đẩu Số chuẩn Thiên Kỷ Nghê Hải Hạ & Toàn Thư, hiệu chỉnh Giờ Mặt Trời Thực 63 tỉnh thành Việt Nam (UTC+7), tự động bắt 40+ Cách Cục và luận giải bằng AI.',
                canonicalPath: '/tu-vi',
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
    const isGymPage = location.pathname === '/gym' || location.pathname.startsWith('/gym/');
    const isZiweiPage = location.pathname === '/tu-vi';
    const isAdmin = user?.admin === true;
    const showChatWidget = !isAdmin && !isAdminPage && !isGymPage && !isZiweiPage;

    return (
        <div className="app">
            <VisitTracker />
            <Seo {...seoConfig} />
            <StructuredData />
            {!isAdminPage && !isGymPage && !isZiweiPage && <FloatingContact />}
            {!isAdminPage && !isGymPage && !isZiweiPage && IS_ROBOT_3D_ENABLED && <DraggableRobotWidget />}
            {showChatWidget && <ChatWidget />}
            {isAdmin && !isGymPage && !isZiweiPage && <AdminChatBubble />}
            <AnnouncementModal
                open={announcementOpen}
                title={announcementTitle}
                message={announcementMessage}
                onClose={() => setAnnouncementOpen(false)}
            />

            {!isAdminPage && <Header />}

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
                        <Route path="/orders" element={<ProtectedRoute><UserOrdersPage /></ProtectedRoute>} />
                        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                        <Route path="/orders/:id/invoice" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />
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
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                        <Route path="/photo-frame" element={<PhotoFramePage />} />
                        <Route path="/compress" element={<CompressPage />} />
                        <Route path="/ai-image" element={<AiImagePage />} />
                        <Route path="/video-translate" element={<VideoTranslatePage />} />
                        {IS_GYM_COACH_ENABLED && <Route path="/gym" element={<GymCoachPage />} />}
                        {IS_GYM_COACH_ENABLED && <Route path="/gym/nam" element={<GymCoachPage genderRoute="male" />} />}
                        {IS_GYM_COACH_ENABLED && <Route path="/gym/nu" element={<GymCoachPage genderRoute="female" />} />}
                        {IS_ZIWEI_ENABLED && <Route path="/tu-vi" element={<ZiweiPage />} />}

                        {/* Multi-Language Course Routes */}
                        <Route path="/courses" element={<CoursesHubPage />} />
                        <Route path="/courses/hsk1" element={<Navigate to="/courses/hsk1/vocabulary" replace />} />
                        <Route path="/courses/hsk2" element={<Navigate to="/courses/hsk2/vocabulary" replace />} />
                        <Route path="/courses/toeichackers" element={<Navigate to="/courses/toeichackers/vocabulary" replace />} />
                        <Route path="/courses/toeic120" element={<Navigate to="/courses/toeic120/vocabulary" replace />} />
                        <Route path="/courses/engbk" element={<Navigate to="/courses/engbk/vocabulary" replace />} />
                        <Route path="/courses/engbk2" element={<Navigate to="/courses/engbk2/vocabulary" replace />} />
                        <Route path="/courses/eng1000" element={<Navigate to="/courses/eng1000/vocabulary" replace />} />
                        <Route path="/courses/enw" element={<Navigate to="/courses/enw/vocabulary" replace />} />
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
                            <Route path="users" element={<UsersPage />} />
                            <Route path="orders" element={<OrdersPage />} />
                            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                            <Route path="netflix-replacements" element={<NetflixReplacementTicketsPage />} />
                            <Route path="user-login-history/:userId" element={<UserLoginHistoryPage />} />
                            <Route path="otp-requests" element={<OtpRequestsPage />} />
                            <Route path="announcement" element={<AnnouncementPage />} />
                            <Route path="chat" element={<AdminChatPage />} />
                            <Route path="video-translate" element={<VideoTranslatePage />} />
                        </Route>
                        <Route path="*" element={
                            <section className="mx-auto max-w-3xl px-5 py-16 text-center text-brand-navy">
                                <h1 className="mb-4 text-2xl font-bold">Không tìm thấy trang</h1>
                                <Link to="/" className="cursor-pointer underline">Về trang chủ</Link>
                            </section>
                        } />
                    </Routes>
                </Suspense>
            </main>

            {!isAdminPage && <Footer />}
        </div>
    );
}
