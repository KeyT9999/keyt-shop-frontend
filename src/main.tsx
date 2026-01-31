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

createRoot(document.getElementById('root')!).render(
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
