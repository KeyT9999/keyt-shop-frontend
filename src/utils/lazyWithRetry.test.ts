import { describe, expect, it } from 'vitest';
import { isDynamicImportError } from './lazyWithRetry';

describe('isDynamicImportError', () => {
    it('detects Chrome/Edge dynamic import module fetch failure', () => {
        const err = new TypeError(
            'Failed to fetch dynamically imported module: https://www.taphoakeyt.com/assets/HomePage-HQ5DqPdH.js'
        );
        expect(isDynamicImportError(err)).toBe(true);
    });

    it('detects Firefox and Safari dynamic import failures', () => {
        expect(
            isDynamicImportError(new TypeError('error loading dynamically imported module'))
        ).toBe(true);
        expect(
            isDynamicImportError(new TypeError('Importing a module script failed.'))
        ).toBe(true);
    });

    it('detects Vite CSS preload errors', () => {
        expect(
            isDynamicImportError(new Error('Unable to preload CSS for /assets/HomePage-123.css'))
        ).toBe(true);
    });

    it('returns false for unrelated runtime errors', () => {
        expect(isDynamicImportError(new Error('Cannot read properties of undefined'))).toBe(false);
        expect(isDynamicImportError(null)).toBe(false);
    });
});
