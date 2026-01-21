import { useEffect } from 'react';

type SeoProps = {
    title?: string;
    description?: string;
    canonicalPath?: string;
    image?: string;
    type?: string;
    noIndex?: boolean;
};

const SITE_URL = 'https://taphoakeyt.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`;

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
    if (!content) return;
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
}

export default function Seo({
    title,
    description,
    canonicalPath,
    image,
    type = 'website',
    noIndex = false,
}: SeoProps) {
    useEffect(() => {
        const resolvedTitle = title || 'Tiệm Tạp Hóa KeyT | Dịch vụ premium chính hãng';
        const resolvedDesc =
            description ||
            'Mua Canva Pro, CapCut Pro, ChatGPT Plus, Microsoft 365/Office và nhiều tài khoản premium chính hãng, bảo hành, hỗ trợ nhanh.';
        const resolvedImage = image || DEFAULT_IMAGE;
        const canonicalUrl = `${SITE_URL}${canonicalPath || window.location.pathname}`;

        document.title = resolvedTitle;

        upsertMeta('name', 'description', resolvedDesc);
        upsertMeta('property', 'og:title', resolvedTitle);
        upsertMeta('property', 'og:description', resolvedDesc);
        upsertMeta('property', 'og:image', resolvedImage);
        upsertMeta('property', 'og:type', type);
        upsertMeta('property', 'og:url', canonicalUrl);

        upsertMeta('name', 'twitter:card', 'summary_large_image');
        upsertMeta('name', 'twitter:title', resolvedTitle);
        upsertMeta('name', 'twitter:description', resolvedDesc);
        upsertMeta('name', 'twitter:image', resolvedImage);

        const canonicalLink =
            document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ||
            document.head.appendChild(document.createElement('link'));
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', canonicalUrl);

        const robotsContent = noIndex ? 'noindex, nofollow' : 'index, follow';
        upsertMeta('name', 'robots', robotsContent);
    }, [title, description, canonicalPath, image, type, noIndex]);

    return null;
}
