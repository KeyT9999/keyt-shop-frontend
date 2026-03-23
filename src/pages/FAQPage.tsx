export default function FAQPage() {
  const faqs = [
    {
      category: 'Đặt hàng & Thanh toán',
      questions: [
        {
          q: 'Làm thế nào để đặt hàng?',
          a: 'Bạn chỉ cần chọn sản phẩm, thêm vào giỏ hàng, điền thông tin và thanh toán. Xem chi tiết tại trang "Hướng dẫn mua hàng".'
        },
        {
          q: 'Các phương thức thanh toán nào được chấp nhận?',
          a: 'Chúng tôi chấp nhận thanh toán qua Momo, ZaloPay, thẻ Visa/Mastercard và QR Code.'
        },
        {
          q: 'Thanh toán có an toàn không?',
          a: 'Hoàn toàn an toàn. Chúng tôi sử dụng hệ thống thanh toán PayOS được mã hóa SSL/TLS, đảm bảo thông tin thanh toán được bảo mật tuyệt đối.'
        },
        {
          q: 'Tôi có thể hủy đơn hàng sau khi thanh toán không?',
          a: 'Có thể hủy trong vòng 24 giờ nếu chưa nhận được dịch vụ. Liên hệ hỗ trợ qua Zalo để được hỗ trợ.'
        }
      ]
    },
    {
      category: 'Dịch vụ & Sản phẩm',
      questions: [
        {
          q: 'Mất bao lâu để nhận được dịch vụ sau khi thanh toán?',
          a: 'Thường trong vòng 24 giờ. Một số dịch vụ tự động như <a href="/summarizer" style="color:#0ea5e9;text-decoration:underline;">YouTube Summarizer</a> sẽ được mở quyền ngay sau khi thanh toán thành công.'
        },
        {
          q: 'Dịch vụ có bảo hành không?',
          a: 'Có, tất cả dịch vụ được bảo hành trong suốt thời gian sử dụng gói đã mua. Xem chi tiết tại trang <a href="/warranty-refund" style="color:#0ea5e9;text-decoration:underline;">Bảo hành & Hoàn tiền</a>.'
        },
        {
          q: 'Tôi có thể gia hạn dịch vụ không?',
          a: 'Có, bạn có thể đặt mua lại gói, ví dụ như <a href="/evidence" style="color:#0ea5e9;text-decoration:underline;">Evidence Checker</a>, trước khi hết hạn để gia hạn liên tục.'
        },
        {
          q: 'Dịch vụ có thể sử dụng trên nhiều thiết bị không?',
          a: 'Tùy thuộc vào từng dịch vụ, chẳng hạn như <a href="/summarizer" style="color:#0ea5e9;text-decoration:underline;">YouTube Summarizer</a>. Vui lòng xem chi tiết trong mô tả sản phẩm để biết thêm.'
        }
      ]
    },
    {
      category: 'Tài khoản & Bảo mật',
      questions: [
        {
          q: 'Làm sao để đăng ký tài khoản?',
          a: 'Nhấn vào nút "Đăng ký" ở góc trên bên phải, điền thông tin và xác nhận email.'
        },
        {
          q: 'Tôi quên mật khẩu, làm sao để lấy lại?',
          a: 'Nhấn vào "Quên mật khẩu" ở trang đăng nhập, nhập email và làm theo hướng dẫn.'
        },
        {
          q: 'Thông tin cá nhân của tôi có được bảo mật không?',
          a: 'Hoàn toàn. Chúng tôi tuân thủ nghiêm ngặt chính sách bảo mật và không chia sẻ thông tin cho bên thứ ba. Xem chi tiết tại "Chính sách bảo mật".'
        },
        {
          q: 'Làm sao để thay đổi thông tin tài khoản?',
          a: 'Đăng nhập và vào mục "Hồ sơ" để cập nhật thông tin cá nhân.'
        }
      ]
    },
    {
      category: 'Hỗ trợ & Liên hệ',
      questions: [
        {
          q: 'Làm sao để liên hệ hỗ trợ?',
          a: 'Bạn có thể liên hệ qua Zalo: 0868899104 hoặc email: trankimthang0207@gmail.com. Chúng tôi hỗ trợ 24/7.'
        },
        {
          q: 'Thời gian phản hồi hỗ trợ là bao lâu?',
          a: 'Chúng tôi cam kết phản hồi trong vòng 24 giờ và giải quyết vấn đề trong 48 giờ.'
        },
        {
          q: 'Tôi có thể yêu cầu hoàn tiền không?',
          a: 'Có, trong một số trường hợp nhất định. Xem chi tiết điều kiện và quy trình tại trang "Bảo hành & Hoàn tiền".'
        },
        {
          q: 'Làm sao để khiếu nại về dịch vụ?',
          a: 'Vui lòng liên hệ trực tiếp qua Zalo hoặc email với mã đơn hàng và mô tả chi tiết vấn đề.'
        }
      ]
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.flatMap(category =>
      category.questions.map(q => ({
        '@type': 'Question',
        name: q.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.a,
        },
      }))
    ),
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
        Câu hỏi thường gặp (FAQ)
      </h1>

      <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem', lineHeight: '1.6' }}>
        <p>Tìm câu trả lời cho các câu hỏi phổ biến về dịch vụ, thanh toán và hỗ trợ tại Tiệm Tạp Hóa KeyT.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {faqs.map((category, catIdx) => (
          <section key={catIdx}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '2px solid #e5e7eb' }}>
              {category.category}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {category.questions.map((faq, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f97316', marginBottom: '0.75rem' }}>
                    ❓ {faq.q}
                  </h3>
                  <p style={{ margin: 0, color: '#475569', lineHeight: '1.8' }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div style={{ marginTop: '3rem', background: '#eff6ff', padding: '2rem', borderRadius: '12px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e40af', marginBottom: '1rem' }}>
          Không tìm thấy câu trả lời?
        </h3>
        <p style={{ color: '#1e40af', marginBottom: '1.5rem', lineHeight: '1.8' }}>
          Liên hệ với chúng tôi để được hỗ trợ trực tiếp
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://zalo.me/84868899104" style={{ padding: '0.75rem 1.5rem', background: '#f97316', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Zalo: 0868899104
          </a>
          <a href="mailto:trankimthang0207@gmail.com" style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Email hỗ trợ
          </a>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </div>
  );
}
