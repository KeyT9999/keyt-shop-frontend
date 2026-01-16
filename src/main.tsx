import { StrictMode } from 'react';
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

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <AuthProvider>
                    <NotificationProvider>
                        <CartProvider>
                            <AddToCartAnimationProvider>
                                <WishlistProvider>
                                    <App />
                                </WishlistProvider>
                            </AddToCartAnimationProvider>
                        </CartProvider>
                        <NotificationContainer />
                    </NotificationProvider>
                </AuthProvider>
            </GoogleOAuthProvider>
        </BrowserRouter>
    </StrictMode>
);
