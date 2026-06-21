export default function TermsOfServicePage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
        Điều khoản Dịch vụ
      </h1>
      
      <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '3rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0 }}><strong>Cập nhật lần cuối:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem', lineHeight: '1.6' }}>
        <p>Bằng việc sử dụng dịch vụ của Mindora AI, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            1. Chấp nhận điều khoản
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, color: '#475569', lineHeight: '1.8' }}>
              Khi truy cập và sử dụng website Mindora AI, bạn đồng ý tuân thủ các điều khoản này. Nếu không đồng ý, vui lòng không sử dụng dịch vụ của chúng tôi.
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            2. Đăng ký tài khoản
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Bạn phải cung cấp thông tin chính xác, đầy đủ khi đăng ký</li>
              <li>Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu</li>
              <li>Bạn phải thông báo ngay nếu phát hiện tài khoản bị xâm nhập</li>
              <li>Mỗi người chỉ được đăng ký một tài khoản</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            3. Đặt hàng và Thanh toán
          </h2>
          <div style={{ background: '#fff7ed', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fed7aa' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#78350f', lineHeight: '1.8' }}>
              <li>Giá cả có thể thay đổi mà không cần thông báo trước</li>
              <li>Đơn hàng chỉ được xác nhận sau khi thanh toán thành công</li>
              <li>Bạn chịu trách nhiệm kiểm tra thông tin đơn hàng trước khi thanh toán</li>
              <li>Chúng tôi có quyền từ chối đơn hàng nếu phát hiện gian lận</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            4. Sử dụng dịch vụ
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
              Bạn được phép:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8', marginBottom: '1rem' }}>
              <li>Sử dụng dịch vụ cho mục đích cá nhân hợp pháp</li>
              <li>Chia sẻ tài khoản với người thân trong gia đình (nếu được phép)</li>
            </ul>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
              Bạn KHÔNG được phép:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Chia sẻ, bán hoặc cho thuê tài khoản cho người khác</li>
              <li>Sử dụng dịch vụ cho mục đích thương mại không được phép</li>
              <li>Vi phạm bản quyền hoặc quyền sở hữu trí tuệ</li>
              <li>Thực hiện các hành vi gian lận, lừa đảo</li>
              <li>Can thiệp vào hệ thống hoặc dịch vụ của chúng tôi</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            5. Trách nhiệm và Giới hạn
          </h2>
          <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#991b1b', lineHeight: '1.8' }}>
              <li>Chúng tôi cố gắng đảm bảo dịch vụ hoạt động ổn định nhưng không đảm bảo 100% không có lỗi</li>
              <li>Chúng tôi không chịu trách nhiệm cho các thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ</li>
              <li>Chúng tôi không chịu trách nhiệm nếu dịch vụ bị gián đoạn do lỗi từ nhà cung cấp dịch vụ gốc</li>
              <li>Bạn chịu trách nhiệm sử dụng dịch vụ đúng mục đích và tuân thủ pháp luật</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            6. Hoàn tiền và Hủy đơn
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Hoàn tiền chỉ áp dụng trong các trường hợp được quy định tại chính sách hoàn tiền</li>
              <li>Đơn hàng có thể bị hủy nếu phát hiện gian lận hoặc vi phạm điều khoản</li>
              <li>Thời gian hoàn tiền: 5-10 ngày làm việc</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            7. Sở hữu Trí tuệ
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, color: '#475569', lineHeight: '1.8' }}>
              Tất cả nội dung trên website (logo, văn bản, hình ảnh) thuộc quyền sở hữu của Mindora AI hoặc được cấp phép sử dụng. Bạn không được sao chép, phân phối hoặc sử dụng cho mục đích thương mại mà không có sự đồng ý bằng văn bản.
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            8. Thay đổi và Chấm dứt
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Chúng tôi có quyền thay đổi điều khoản này bất cứ lúc nào</li>
              <li>Chúng tôi có quyền chấm dứt hoặc tạm ngưng dịch vụ với bất kỳ tài khoản nào vi phạm</li>
              <li>Bạn có quyền chấm dứt sử dụng dịch vụ bất cứ lúc nào</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            9. Luật áp dụng
          </h2>
          <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.8' }}>
              Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp sẽ được giải quyết thông qua thương lượng, nếu không thành công sẽ được đưa ra tòa án có thẩm quyền tại Việt Nam.
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            10. Liên hệ
          </h2>
          <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.8', marginBottom: '1rem' }}>
              Nếu bạn có câu hỏi về điều khoản dịch vụ, vui lòng liên hệ:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af', lineHeight: '1.8' }}>
              <li><strong>Email:</strong> trankimthang0207@gmail.com</li>
              <li><strong>Zalo:</strong> <a href="https://zalo.me/84868899104" style={{ color: '#2563eb', fontWeight: 600 }}>0868899104</a></li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
