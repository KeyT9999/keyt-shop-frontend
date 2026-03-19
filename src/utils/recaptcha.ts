import { RECAPTCHA_SITE_KEY } from '../config/recaptcha';

type Grecaptcha = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    __recaptchaV3ScriptPromise?: Promise<void>;
  }
}

function loadRecaptchaScript() {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (!RECAPTCHA_SITE_KEY) {
    return Promise.reject(new Error('VITE_RECAPTCHA_SITE_KEY chưa được cấu hình.'));
  }

  if (window.__recaptchaV3ScriptPromise) {
    return window.__recaptchaV3ScriptPromise;
  }

  window.__recaptchaV3ScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-recaptcha-v3="true"]');

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA v3')), {
        once: true
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(RECAPTCHA_SITE_KEY)}`;
    script.async = true;
    script.defer = true;
    script.dataset.recaptchaV3 = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA v3'));
    document.head.appendChild(script);
  });

  return window.__recaptchaV3ScriptPromise;
}

export async function executeRecaptcha(action: string) {
  if (!RECAPTCHA_SITE_KEY) {
    throw new Error('reCAPTCHA chưa được cấu hình.');
  }

  await loadRecaptchaScript();

  if (!window.grecaptcha) {
    throw new Error('reCAPTCHA chưa sẵn sàng.');
  }

  return new Promise<string>((resolve, reject) => {
    window.grecaptcha?.ready(async () => {
      try {
        const token = await window.grecaptcha?.execute(RECAPTCHA_SITE_KEY, { action });
        if (!token) {
          reject(new Error('Không lấy được token reCAPTCHA.'));
          return;
        }

        resolve(token);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Không thể thực thi reCAPTCHA.'));
      }
    });
  });
}
