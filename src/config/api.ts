// API Base URL configuration
// Production VPS HTTPS endpoint (Let's Encrypt SSL via sslip.io on 103.183.120.150)
const VPS_PROD_API_URL = 'https://103-183-120-150.sslip.io/api';

const rawEnvApiUrl = import.meta.env.VITE_API_BASE_URL;

// In production, automatically switch legacy Render URLs or missing env var to the dedicated VPS
const API_BASE_URL = import.meta.env.PROD
    ? (!rawEnvApiUrl || rawEnvApiUrl.includes('onrender.com') ? VPS_PROD_API_URL : rawEnvApiUrl)
    : (rawEnvApiUrl || 'http://localhost:5000/api');

// Log API URL in development
if (import.meta.env.DEV) {
    console.log('🔧 API Base URL:', API_BASE_URL);
}

export default API_BASE_URL;
