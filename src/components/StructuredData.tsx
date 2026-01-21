import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://taphoakeyt.vercel.app';
const LOGO_URL = `${SITE_URL}/logo.png`;

function ScriptTag({ data }: { data: Record<string, unknown> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

export default function StructuredData() {
    const location = useLocation();

    const schemas = useMemo(() => {
        const baseBreadcrumb = [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Trang chủ',
                item: SITE_URL,
            },
        ];

        if (location.pathname === '/products') {
            baseBreadcrumb.push({
                '@type': 'ListItem',
                position: 2,
                name: 'Dịch vụ premium',
                item: `${SITE_URL}/products`,
            });
        }

        if (location.pathname.startsWith('/products/')) {
            baseBreadcrumb.push(
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Dịch vụ premium',
                    item: `${SITE_URL}/products`,
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: 'Chi tiết dịch vụ',
                    item: `${SITE_URL}${location.pathname}`,
                }
            );
        }

        if (location.pathname === '/purchase-guide') {
            baseBreadcrumb.push({
                '@type': 'ListItem',
                position: 2,
                name: 'Hướng dẫn mua hàng',
                item: `${SITE_URL}/purchase-guide`,
            });
        }

        if (location.pathname === '/faq') {
            baseBreadcrumb.push({
                '@type': 'ListItem',
                position: 2,
                name: 'Câu hỏi thường gặp',
                item: `${SITE_URL}/faq`,
            });
        }

        if (location.pathname === '/warranty-refund') {
            baseBreadcrumb.push({
                '@type': 'ListItem',
                position: 2,
                name: 'Bảo hành & hoàn tiền',
                item: `${SITE_URL}/warranty-refund`,
            });
        }

        const breadcrumbSchema =
            baseBreadcrumb.length > 1
                ? {
                      '@context': 'https://schema.org',
                      '@type': 'BreadcrumbList',
                      itemListElement: baseBreadcrumb,
                  }
                : null;

        const organizationSchema = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Tiệm Tạp Hóa KeyT',
            url: SITE_URL,
            logo: LOGO_URL,
            contactPoint: [
                {
                    '@type': 'ContactPoint',
                    contactType: 'customer service',
                    telephone: '+84868899104',
                    areaServed: 'VN',
                    availableLanguage: ['Vietnamese', 'English'],
                },
            ],
            sameAs: [
                'https://taphoakeyt.vercel.app',
                'https://zalo.me/84868899104',
            ],
        };

        return [organizationSchema, breadcrumbSchema].filter(Boolean) as Record<string, unknown>[];
    }, [location.pathname]);

    return (
        <>
            {schemas.map((schema, idx) => (
                <ScriptTag key={idx} data={schema} />
            ))}
        </>
    );
}
