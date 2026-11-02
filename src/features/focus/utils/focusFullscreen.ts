interface VendorFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
}

interface VendorFullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
}

export function isPageFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as VendorFullscreenDocument;
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
}

export async function requestPageFullscreen(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  if (isPageFullscreen()) return true;

  const root = document.documentElement as VendorFullscreenElement;
  try {
    if (typeof root.requestFullscreen === 'function') {
      await root.requestFullscreen();
      return true;
    }
    if (typeof root.webkitRequestFullscreen === 'function') {
      await root.webkitRequestFullscreen();
      return true;
    }
  } catch (err) {
    console.warn('⚠️ Browser prevented automatic fullscreen:', err);
  }
  return false;
}

export async function exitPageFullscreen(): Promise<void> {
  if (typeof document === 'undefined' || !isPageFullscreen()) return;
  const doc = document as VendorFullscreenDocument;
  try {
    if (typeof doc.exitFullscreen === 'function') {
      await doc.exitFullscreen();
    } else if (typeof doc.webkitExitFullscreen === 'function') {
      await doc.webkitExitFullscreen();
    }
  } catch (err) {
    console.warn('⚠️ Failed to exit fullscreen:', err);
  }
}

export async function togglePageFullscreen(): Promise<boolean> {
  if (isPageFullscreen()) {
    await exitPageFullscreen();
    return false;
  }
  return requestPageFullscreen();
}
