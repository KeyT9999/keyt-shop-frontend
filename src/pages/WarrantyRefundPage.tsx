export default function WarrantyRefundPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
        Bảo hành & Hoàn tiền
      </h1>
      
      <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem', lineHeight: '1.6' }}>
        <p>Chúng tôi cam kết đảm bảo quyền lợi của khách hàng với chính sách bảo hành và hoàn tiền minh bạch, công bằng.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            🔒 Chính sách Bảo hành
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li><strong>Thời gian bảo hành:</strong> Tất cả dịch vụ được bảo hành trong suốt thời gian sử dụng gói đã mua.</li>
              <li><strong>Phạm vi bảo hành:</strong> Chúng tôi đảm bảo dịch vụ hoạt động ổn định, không bị gián đoạn do lỗi từ phía chúng tôi.</li>
              <li><strong>Xử lý sự cố:</strong> Nếu gặp vấn đề, vui lòng liên hệ ngay qua Zalo: <a href="https://zalo.me/84868899104" style={{ color: '#f97316', fontWeight: 600 }}>0868899104</a> để được hỗ trợ nhanh chóng.</li>
              <li><strong>Thời gian phản hồi:</strong> Chúng tôi cam kết phản hồi trong vòng 24 giờ và giải quyết trong 48 giờ.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            💰 Chính sách Hoàn tiền
          </h2>
          <div style={{ background: '#fff7ed', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fed7aa' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f97316', marginBottom: '0.75rem' }}>
              Điều kiện được hoàn tiền:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f', lineHeight: '1.8', marginBottom: '1.5rem' }}>
              <li>Dịch vụ không hoạt động do lỗi từ phía chúng tôi và không thể khắc phục trong 7 ngày.</li>
              <li>Gói dịch vụ bị hủy trước khi sử dụng (chưa kích hoạt).</li>
              <li>Không nhận được tài khoản/dịch vụ sau 24 giờ kể từ khi thanh toán thành công.</li>
            </ul>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f97316', marginBottom: '0.75rem' }}>
              Quy trình hoàn tiền:
            </h3>
            <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f', lineHeight: '1.8' }}>
              <li>Liên hệ hỗ trợ qua Zalo: <a href="https://zalo.me/84868899104" style={{ color: '#ea580c', fontWeight: 600 }}>0868899104</a></li>
              <li>Gửi mã đơn hàng và lý do yêu cầu hoàn tiền</li>
              <li>Chúng tôi sẽ xác minh và xử lý trong vòng 3-5 ngày làm việc</li>
              <li>Tiền sẽ được hoàn về tài khoản thanh toán ban đầu</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            ⚠️ Lưu ý quan trọng
          </h2>
          <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#991b1b', lineHeight: '1.8' }}>
              <li>Không hoàn tiền cho các trường hợp: Đã sử dụng dịch vụ quá 7 ngày, vi phạm điều khoản sử dụng, hoặc do lỗi từ phía khách hàng.</li>
              <li>Hoàn tiền một phần nếu dịch vụ đã được sử dụng một phần thời gian.</li>
              <li>Thời gian hoàn tiền có thể mất 5-10 ngày làm việc tùy thuộc vào ngân hàng.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            📞 Liên hệ hỗ trợ
          </h2>
          <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.8' }}>
              Nếu bạn có bất kỳ thắc mắc nào về chính sách bảo hành và hoàn tiền, vui lòng liên hệ với chúng tôi:
            </p>
            <ul style={{ margin: '1rem 0 0 0', paddingLeft: '1.5rem', color: '#1e40af', lineHeight: '1.8' }}>
              <li><strong>Zalo:</strong> <a href="https://zalo.me/84868899104" style={{ color: '#2563eb', fontWeight: 600 }}>0868899104</a></li>
              <li><strong>Email:</strong> trankimthang0207@gmail.com</li>
              <li><strong>Thời gian hỗ trợ:</strong> 24/7</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
