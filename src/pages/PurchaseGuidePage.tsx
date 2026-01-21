export default function PurchaseGuidePage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
        Hướng dẫn mua hàng
      </h1>
      
      <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem', lineHeight: '1.6' }}>
        <p>
          Tiệm Tạp Hóa KeyT chuyên cung cấp dịch vụ premium chính hãng: Canva Pro, CapCut Pro, ChatGPT Plus,
          Microsoft 365/Office, cùng nhiều tài khoản phần mềm/streaming khác. Dưới đây là hướng dẫn từng bước để
          mua và kích hoạt nhanh chóng, phù hợp cho cá nhân lẫn team.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Nếu cần tư vấn gói đúng nhu cầu (thiết kế, dựng video, AI, office), hãy nhắn ngay{' '}
          <a href="https://zalo.me/84868899104" style={{ color: '#f97316', fontWeight: 600 }}>Zalo 0868 899 104</a>{' '}
          hoặc xem danh mục tại{' '}
          <a href="/" style={{ color: '#0ea5e9', fontWeight: 600 }}>trang chủ KeyT</a>.
        </p>
        <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#0f172a' }}>
          <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Đường dẫn nhanh:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.7' }}>
            <li><a href="/products" style={{ color: '#0ea5e9', fontWeight: 600 }}>Xem tất cả dịch vụ premium (Canva, CapCut, ChatGPT, Office...)</a></li>
            <li><a href="/warranty-refund" style={{ color: '#0ea5e9', fontWeight: 600 }}>Chính sách bảo hành & hoàn tiền</a></li>
            <li><a href="/faq" style={{ color: '#0ea5e9', fontWeight: 600 }}>Trung tâm Câu hỏi thường gặp (FAQ)</a></li>
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            📱 Bước 1: Chọn dịch vụ premium
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Duyệt danh mục dịch vụ: Canva Pro, CapCut Pro, ChatGPT Plus, Microsoft 365/Office, streaming.</li>
              <li>Nhấn vào dịch vụ để xem chi tiết gói (cá nhân/team), thời hạn, chính sách bảo hành.</li>
              <li>Ưu tiên gói đúng nhu cầu: thiết kế (Canva), dựng video (CapCut), AI (ChatGPT), văn phòng (Office).</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            🛒 Bước 2: Thêm vào giỏ hàng
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Chọn gói dịch vụ và thời hạn mong muốn (1/3/12 tháng hoặc theo năm).</li>
              <li>Nhấn "Thêm vào giỏ" hoặc "Mua ngay" để đi thẳng tới thanh toán.</li>
              <li>Nếu dịch vụ cần email đăng nhập (Canva/CapCut/Office), nhập đúng email bạn muốn được cấp quyền.</li>
              <li>Xem lại giỏ hàng tại <a href="/cart" style={{ color: '#0ea5e9', fontWeight: 600 }}>trang giỏ hàng</a> trước khi thanh toán.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            💳 Bước 3: Thanh toán
          </h2>
          <div style={{ background: '#fff7ed', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fed7aa' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f97316', marginBottom: '0.75rem' }}>
              Các phương thức thanh toán:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              <li><strong>Ví điện tử:</strong> Momo, ZaloPay</li>
              <li><strong>Thẻ ngân hàng:</strong> Visa, Mastercard</li>
              <li><strong>QR Code:</strong> Quét mã QR để thanh toán nhanh</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f97316', marginBottom: '0.75rem' }}>
              Quy trình thanh toán:
            </h3>
            <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f', lineHeight: '1.8' }}>
              <li>Đăng nhập hoặc đăng ký tài khoản (nếu chưa có)</li>
              <li>Điền thông tin giao hàng và thanh toán</li>
              <li>Chọn phương thức thanh toán và hoàn tất giao dịch</li>
              <li>Bạn sẽ nhận được email xác nhận đơn hàng</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            ✅ Bước 4: Nhận dịch vụ
          </h2>
          <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#166534', lineHeight: '1.8' }}>
              <li>Sau khi thanh toán thành công, đơn hàng sẽ được xử lý trong vòng 24 giờ</li>
              <li>Bạn sẽ nhận được thông tin tài khoản/dịch vụ qua email hoặc trong mục "Đơn hàng của tôi"</li>
              <li>Đối với dịch vụ tự động, bạn sẽ nhận ngay sau khi thanh toán</li>
              <li>Đối với dịch vụ cần setup, admin sẽ liên hệ và hỗ trợ bạn kích hoạt</li>
              <li>Tham khảo chính sách bảo hành tại <a href="/warranty-refund" style={{ color: '#0ea5e9', fontWeight: 600 }}>Bảo hành & hoàn tiền</a>.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            🎯 Bước 5: Sử dụng dịch vụ
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Làm theo hướng dẫn trong email hoặc trang chi tiết đơn hàng</li>
              <li>Nếu gặp khó khăn, liên hệ hỗ trợ qua Zalo: <a href="https://zalo.me/84868899104" style={{ color: '#f97316', fontWeight: 600 }}>0868899104</a></li>
              <li>Kiểm tra email thường xuyên để nhận thông báo về dịch vụ</li>
              <li>Xem thêm câu trả lời nhanh tại <a href="/faq" style={{ color: '#0ea5e9', fontWeight: 600 }}>trang FAQ</a>.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            ❓ Câu hỏi thường gặp
          </h2>
          <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#1e40af' }}>Q: Mất bao lâu để nhận được dịch vụ?</strong>
              <p style={{ color: '#1e40af', margin: '0.5rem 0 0 0' }}>A: Thường trong vòng 24 giờ sau khi thanh toán thành công. Một số dịch vụ tự động sẽ được gửi ngay lập tức.</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#1e40af' }}>Q: Tôi có thể mua nhiều gói cùng lúc không?</strong>
              <p style={{ color: '#1e40af', margin: '0.5rem 0 0 0' }}>A: Có, bạn có thể thêm nhiều sản phẩm vào giỏ hàng và thanh toán cùng lúc.</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#1e40af' }}>Q: Canva Pro/CapCut Pro được cấp như thế nào?</strong>
              <p style={{ color: '#1e40af', margin: '0.5rem 0 0 0' }}>A: Bạn gửi email cần cấp quyền. KeyT sẽ thêm bạn vào team premium hoặc cấp tài khoản sẵn, tùy gói bạn chọn.</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#1e40af' }}>Q: ChatGPT Plus có bảo hành không?</strong>
              <p style={{ color: '#1e40af', margin: '0.5rem 0 0 0' }}>A: Có. Trong thời hạn gói, nếu gặp lỗi truy cập, hãy liên hệ Zalo để được kiểm tra và cấp lại.</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#1e40af' }}>Q: Tôi cần xuất hóa đơn hay chứng từ?</strong>
              <p style={{ color: '#1e40af', margin: '0.5rem 0 0 0' }}>A: Liên hệ Zalo/Email hỗ trợ, cung cấp thông tin doanh nghiệp để được hỗ trợ xuất chứng từ phù hợp.</p>
            </div>
            <div>
              <strong style={{ color: '#1e40af' }}>Q: Làm sao để theo dõi đơn hàng?</strong>
              <p style={{ color: '#1e40af', margin: '0.5rem 0 0 0' }}>A: Đăng nhập vào tài khoản và vào mục "Đơn hàng của tôi" để xem trạng thái chi tiết.</p>
            </div>
          </div>
        </section>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Mất bao lâu để nhận được dịch vụ?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Thường trong vòng 24 giờ sau khi thanh toán. Một số dịch vụ tự động sẽ được gửi ngay.'
                }
              },
              {
                '@type': 'Question',
                name: 'Tôi có thể mua nhiều gói cùng lúc không?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Có, bạn có thể thêm nhiều sản phẩm vào giỏ và thanh toán một lần.'
                }
              },
              {
                '@type': 'Question',
                name: 'Canva Pro/CapCut Pro được cấp như thế nào?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Bạn cung cấp email để được thêm vào team premium hoặc nhận tài khoản sẵn, tùy gói.'
                }
              },
              {
                '@type': 'Question',
                name: 'ChatGPT Plus có bảo hành không?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Có bảo hành trong thời hạn gói; khi gặp lỗi truy cập hãy liên hệ để kiểm tra và cấp lại.'
                }
              },
              {
                '@type': 'Question',
                name: 'Tôi cần xuất hóa đơn hay chứng từ?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Liên hệ hỗ trợ và cung cấp thông tin doanh nghiệp để được xuất chứng từ phù hợp.'
                }
              },
              {
                '@type': 'Question',
                name: 'Làm sao để theo dõi đơn hàng?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Đăng nhập và vào mục Đơn hàng của tôi để xem trạng thái chi tiết.'
                }
              }
            ]
          })
        }}
      />
    </div>
  );
}
