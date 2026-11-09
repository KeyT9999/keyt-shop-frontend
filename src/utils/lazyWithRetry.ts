import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const RELOAD_STORAGE_KEY = 'keyt_chunk_reload_ts';
const RELOAD_COOLDOWN_MS = 10_000;

const DYNAMIC_IMPORT_ERROR_PATTERNS = [
    'failed to fetch dynamically imported module',
    'error loading dynamically imported module',
    'importing a module script failed',
    'unable to preload css',
    'failed to load module script',
    'chunkloaderror',
    'loading chunk',
];

/**
 * Checks whether an unknown error was caused by a stale/missing dynamic import chunk
 * (typically after a new frontend deployment on Vercel replaces old hashed assets).
 */
export function isDynamicImportError(error: unknown): boolean {
    const message =
        error instanceof Error
            ? `${error.name}: ${error.message}`
            : typeof error === 'string'
              ? error
              : '';
    const normalized = message.toLowerCase();
    return DYNAMIC_IMPORT_ERROR_PATTERNS.some((pattern) => normalized.includes(pattern));
}

/**
 * Triggers a one-time page reload when a stale chunk error is detected, guarded by
 * a 10-second sessionStorage cooldown so offline/network failures never loop infinitely.
 */
export function tryReloadOnDynamicImportError(source: string, error: unknown): boolean {
    if (typeof window === 'undefined') return false;

    try {
        const now = Date.now();
        const lastReloadRaw = window.sessionStorage.getItem(RELOAD_STORAGE_KEY);
        const lastReloadTs = lastReloadRaw ? Number(lastReloadRaw) : 0;

        if (!Number.isNaN(lastReloadTs) && now - lastReloadTs < RELOAD_COOLDOWN_MS) {
            console.warn('[ChunkRecovery] Skipping auto-reload (cooldown active):', {
                source,
                msSinceLastReload: now - lastReloadTs,
            });
            return false;
        }

        window.sessionStorage.setItem(RELOAD_STORAGE_KEY, String(now));
        console.warn('[ChunkRecovery] Stale build chunk detected. Reloading latest deployment...', {
            source,
            targetHref: window.location.href,
            error: error instanceof Error ? error.message : String(error),
        });
        window.location.reload();
        return true;
    } catch {
        // Fallback if sessionStorage is blocked (e.g. strict privacy mode)
        window.location.reload();
        return true;
    }
}

/**
 * Registers Vite's global `vite:preloadError` listener so failed dependency chunk preloads
 * (such as shared icon chunks after a new deploy) recover automatically without crashing.
 */
export function setupVitePreloadErrorHandler(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('vite:preloadError', (event) => {
        const reloaded = tryReloadOnDynamicImportError('vite:preloadError', event.payload);
        if (reloaded) {
            event.preventDefault();
        }
    });
}

/**
 * Drop-in replacement for `React.lazy` that catches stale deployment chunk errors
 * during client-side route transitions and seamlessly reloads the target URL.
 *
 * Trade-off: While `window.location.reload()` is in flight, returns a pending Promise
 * so `<Suspense>` keeps showing the loading state instead of flashing `ErrorBoundary`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
    importer: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
    return lazy(async () => {
        try {
            return await importer();
        } catch (error) {
            if (isDynamicImportError(error)) {
                const reloaded = tryReloadOnDynamicImportError('lazyWithRetry', error);
                if (reloaded) {
                    return new Promise<{ default: T }>(() => {
                        // Keep Suspense fallback visible while browser reloads the page
                    });
                }
            }
            throw error;
        }
    });
}
