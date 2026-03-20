const guideVideos = [
  {
    title: 'Hướng dẫn login trên Laptop',
    description: 'Dành cho trình duyệt PC/Laptop khi mở link đăng nhập Netflix.',
    embedUrl: 'https://www.youtube.com/embed/BzCXdjTzVPE?rel=0',
    watchUrl: 'https://www.youtube.com/watch?v=BzCXdjTzVPE'
  },
  {
    title: 'Hướng dẫn login trên Điện thoại',
    description: 'Xem nhanh cách login trên điện thoại bằng link mobile / cookie.',
    embedUrl: 'https://www.youtube.com/embed/BkLlz3ZFtQc?rel=0',
    watchUrl: 'https://youtube.com/shorts/BkLlz3ZFtQc'
  }
];

interface NetflixLoginGuideProps {
  title?: string;
  description?: string;
}

export default function NetflixLoginGuide({
  title = 'Hướng dẫn login Netflix',
  description = 'Xem nhanh video trước khi đăng nhập để tránh thao tác sai trên laptop hoặc điện thoại.'
}: NetflixLoginGuideProps) {
  return (
    <section
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        padding: '1.25rem'
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '999px',
            padding: '0.35rem 0.75rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '0.75rem'
          }}
        >
          Netflix Guide
        </div>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>{title}</h2>
        <p style={{ margin: '0.5rem 0 0', color: '#475569', lineHeight: 1.6 }}>{description}</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}
      >
        {guideVideos.map((video) => (
          <article
            key={video.embedUrl}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#f8fafc'
            }}
          >
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#0f172a' }}>
              <iframe
                src={video.embedUrl}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>

            <div style={{ padding: '1rem' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>{video.title}</h3>
              <p style={{ margin: '0.5rem 0 0.85rem', color: '#475569', lineHeight: 1.5, fontSize: '0.92rem' }}>
                {video.description}
              </p>
              <a
                href={video.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#dc2626',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
              >
                Mở video trực tiếp
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
