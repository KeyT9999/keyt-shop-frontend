// API Base URL configuration
// In production, this will be set via VITE_API_BASE_URL environment variable
// In development, it defaults to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Warning in production if API URL is not configured
if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
    console.error(
        '⚠️ VITE_API_BASE_URL chưa được cấu hình! ' +
        'App sẽ không thể kết nối đến backend. ' +
        'Vui lòng thêm VITE_API_BASE_URL vào Vercel Environment Variables.'
    );
}

// Log API URL in development
if (import.meta.env.DEV) {
    console.log('🔧 API Base URL:', API_BASE_URL);
}

export default API_BASE_URL;

