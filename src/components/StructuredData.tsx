import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://www.taphoakeyt.com';
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
                name: 'Công cụ hỗ trợ học tập',
                item: `${SITE_URL}/products`,
            });
        }

        if (location.pathname.startsWith('/products/')) {
            baseBreadcrumb.push(
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Công cụ hỗ trợ học tập',
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

        if (location.pathname === '/compress') {
            baseBreadcrumb.push({
                '@type': 'ListItem',
                position: 2,
                name: 'Nén Ảnh Online',
                item: `${SITE_URL}/compress`,
            });
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

        if (location.pathname === '/privacy-policy') {
            baseBreadcrumb.push({
                '@type': 'ListItem',
                position: 2,
                name: 'Chính sách bảo mật',
                item: `${SITE_URL}/privacy-policy`,
            });
        }

        if (location.pathname === '/terms-of-service') {
            baseBreadcrumb.push({
                '@type': 'ListItem',
                position: 2,
                name: 'Điều khoản dịch vụ',
                item: `${SITE_URL}/terms-of-service`,
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

        // WebApplication schema for /compress
        const compressAppSchema = location.pathname === '/compress' ? {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'KeyT Compress - Nén Ảnh Online',
            url: `${SITE_URL}/compress`,
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Web Browser',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'VND',
            },
            featureList: 'Nén ảnh WebP, AVIF, JPEG, PNG, GIF. Batch 10 ảnh. Không cần đăng ký. Giảm dung lượng tới 90%.',
            description: 'Công cụ nén ảnh online miễn phí, hỗ trợ WebP, AVIF, JPEG, PNG, GIF. Giảm dung lượng ảnh nhanh chóng mà vẫn giữ chất lượng cao.',
        } : null;

        // FAQ schema for /compress
        const compressFaqSchema = location.pathname === '/compress' ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: 'Nén ảnh có giảm chất lượng không?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Công cụ sử dụng thuật toán nén thông minh (lossy), giảm dung lượng 70-90% trong khi mắt thường gần như không nhận ra sự khác biệt. Bạn có thể điều chỉnh chất lượng từ 1-100 để kiểm soát.' },
                },
                {
                    '@type': 'Question',
                    name: 'Ảnh có bị lưu trên server không?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Không. Ảnh được xử lý hoàn toàn trong bộ nhớ tạm và trả về ngay cho bạn. Không có ảnh nào được lưu trữ trên server sau khi xử lý xong.' },
                },
                {
                    '@type': 'Question',
                    name: 'Nên dùng WebP hay JPEG?',
                    acceptedAnswer: { '@type': 'Answer', text: 'WebP nhẹ hơn JPEG 25-35% ở cùng chất lượng và được hỗ trợ bởi mọi trình duyệt hiện đại. Nếu website bạn cần tương thích IE cũ, dùng JPEG. Nếu không, WebP là lựa chọn tốt nhất.' },
                },
                {
                    '@type': 'Question',
                    name: 'Có giới hạn bao nhiêu ảnh?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Bạn có thể nén tối đa 10 ảnh cùng lúc, mỗi ảnh tối đa 10MB. Không giới hạn số lần sử dụng, hoàn toàn miễn phí.' },
                },
                {
                    '@type': 'Question',
                    name: 'Có cần đăng ký tài khoản không?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Không cần đăng ký, không cần đăng nhập. Bạn chỉ cần kéo thả ảnh vào và bắt đầu nén ngay lập tức.' },
                },
                {
                    '@type': 'Question',
                    name: 'Nén ảnh cho Shopee/Lazada có phù hợp không?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Hoàn toàn phù hợp. Các sàn thương mại điện tử thường yêu cầu ảnh dưới 2MB. Công cụ này giúp bạn giảm dung lượng ảnh sản phẩm mà vẫn giữ chất lượng sắc nét.' },
                },
                {
                    '@type': 'Question',
                    name: 'Ảnh GIF động có hỗ trợ không?',
                    acceptedAnswer: { '@type': 'Answer', text: 'Có, công cụ hỗ trợ nén ảnh GIF động (animated GIF), giữ nguyên animation và giảm dung lượng đáng kể.' },
                },
            ],
        } : null;

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
                'https://www.taphoakeyt.com',
                'https://zalo.me/84868899104',
            ],
        };

        return [organizationSchema, breadcrumbSchema, compressAppSchema, compressFaqSchema].filter(Boolean) as Record<string, unknown>[];
    }, [location.pathname]);

    return (
        <>
            {schemas.map((schema, idx) => (
                <ScriptTag key={idx} data={schema} />
            ))}
        </>
    );
}
