import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import './i18n/i18n'; // Import i18n config
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

import { NotificationProvider } from './context/NotificationContext';
import NotificationContainer from './components/NotificationContainer';

import { AddToCartAnimationProvider } from './context/AddToCartAnimationContext';

import { GoogleOAuthProvider } from '@react-oauth/google';
import ErrorBoundary from './components/ErrorBoundary';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Log environment info (always log in production for debugging)
console.log('🔧 App Environment:', {
    mode: import.meta.env.MODE,
    isProduction: import.meta.env.PROD,
    apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api (default)',
    hasGoogleClientId: !!GOOGLE_CLIENT_ID,
    hasRootElement: !!document.getElementById('root'),
});

// Wrapper component để xử lý GoogleOAuthProvider một cách an toàn
function AppProviders({ children }: { children: ReactNode }) {
    const providers = (
        <AuthProvider>
            <NotificationProvider>
                <CartProvider>
                    <AddToCartAnimationProvider>
                        <WishlistProvider>
                            {children}
                        </WishlistProvider>
                    </AddToCartAnimationProvider>
                </CartProvider>
                <NotificationContainer />
            </NotificationProvider>
        </AuthProvider>
    );

    // Chỉ wrap với GoogleOAuthProvider nếu có clientId
    if (GOOGLE_CLIENT_ID) {
        return (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                {providers}
            </GoogleOAuthProvider>
        );
    }

    // Nếu không có clientId, vẫn render app bình thường (chỉ không có Google OAuth)
    return providers;
}

// Ensure root element exists before rendering
const rootElement = document.getElementById('root');
if (!rootElement) {
    console.error('❌ Root element not found! Cannot render app.');
    document.body.innerHTML = '<div style="padding: 2rem; text-align: center; font-family: sans-serif;"><h1>Lỗi: Không tìm thấy root element</h1><p>Vui lòng kiểm tra file index.html</p></div>';
} else {
    try {
        createRoot(rootElement).render(
            <StrictMode>
                <ErrorBoundary>
                    <BrowserRouter>
                        <AppProviders>
                            <App />
                        </AppProviders>
                    </BrowserRouter>
                </ErrorBoundary>
            </StrictMode>
        );
        console.log('✅ App rendered successfully');
    } catch (error) {
        console.error('❌ Error rendering app:', error);
        rootElement.innerHTML = `
            <div style="padding: 2rem; text-align: center; font-family: sans-serif;">
                <h1 style="color: #dc2626;">Lỗi khi render ứng dụng</h1>
                <p>Vui lòng mở Developer Tools (F12) để xem chi tiết lỗi.</p>
                <pre style="text-align: left; background: #f1f5f9; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
${error instanceof Error ? error.message : String(error)}
                </pre>
            </div>
        `;
    }
}
