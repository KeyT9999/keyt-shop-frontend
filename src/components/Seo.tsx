import { useEffect } from 'react';

type SeoProps = {
    title?: string;
    description?: string;
    canonicalPath?: string;
    image?: string;
    type?: string;
    noIndex?: boolean;
};

const SITE_URL = 'https://www.taphoakeyt.com';
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
        const resolvedTitle = title || 'Tiệm Tạp Hoá KeyT | Công Cụ Hỗ Trợ Học Tập';
        const resolvedDesc =
            description ||
            'Tóm tắt video YouTube tức thì, kiểm tra độ chính xác thông tin bằng AI và nguồn đáng tin cậy. Trực quan hóa nội dung với photo-frame thông minh. Hỗ trợ 24/7 tức thì ✓';
        const resolvedImage = image || DEFAULT_IMAGE;
        const canonicalUrl = `${SITE_URL}${canonicalPath || window.location.pathname}`;

        document.title = resolvedTitle;

        upsertMeta('name', 'description', resolvedDesc);
        upsertMeta('property', 'og:title', resolvedTitle);
        upsertMeta('property', 'og:description', resolvedDesc);
        upsertMeta('property', 'og:image', resolvedImage);
        upsertMeta('property', 'og:type', type);
        upsertMeta('property', 'og:url', canonicalUrl);
        upsertMeta('property', 'og:site_name', 'Tiệm Tạp Hóa KeyT');
        upsertMeta('property', 'og:locale', 'vi_VN');

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
