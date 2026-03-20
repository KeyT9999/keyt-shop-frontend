const STORAGE_KEY = 'keyt-affiliate-referral';
const REFERRAL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface StoredReferral {
  code: string;
  expiresAt: number;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveAffiliateReferral(code: string) {
  if (!canUseStorage()) return;
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) return;

  const payload: StoredReferral = {
    code: normalized,
    expiresAt: Date.now() + REFERRAL_TTL_MS
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getStoredAffiliateReferral(): string | null {
  if (!canUseStorage()) return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredReferral;
    if (!parsed.code || !parsed.expiresAt || parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.code;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearStoredAffiliateReferral() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
