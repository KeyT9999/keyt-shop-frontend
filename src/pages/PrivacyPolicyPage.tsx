export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
        Chính sách Bảo mật
      </h1>
      
      <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '3rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: 0 }}><strong>Cập nhật lần cuối:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem', lineHeight: '1.6' }}>
        <p>Tiệm Tạp Hóa KeyT cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            1. Thông tin chúng tôi thu thập
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
              Thông tin cá nhân:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8', marginBottom: '1rem' }}>
              <li>Tên, email, số điện thoại khi đăng ký tài khoản</li>
              <li>Địa chỉ giao hàng khi đặt hàng</li>
              <li>Thông tin thanh toán (được xử lý bởi đối tác thanh toán bảo mật)</li>
            </ul>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>
              Thông tin tự động:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Địa chỉ IP, loại trình duyệt, thiết bị truy cập</li>
              <li>Lịch sử truy cập và tương tác trên website</li>
              <li>Cookies và công nghệ theo dõi tương tự</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            2. Mục đích sử dụng thông tin
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Xử lý đơn hàng và giao dịch</li>
              <li>Cung cấp dịch vụ và hỗ trợ khách hàng</li>
              <li>Gửi thông báo về đơn hàng, dịch vụ và cập nhật</li>
              <li>Cải thiện trải nghiệm người dùng và phát triển dịch vụ</li>
              <li>Phòng chống gian lận và đảm bảo an ninh</li>
              <li>Tuân thủ các yêu cầu pháp lý</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            3. Bảo vệ thông tin
          </h2>
          <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#166534', lineHeight: '1.8' }}>
              <li>Sử dụng mã hóa SSL/TLS cho tất cả giao dịch</li>
              <li>Lưu trữ dữ liệu trên hệ thống máy chủ bảo mật</li>
              <li>Giới hạn quyền truy cập thông tin chỉ cho nhân viên cần thiết</li>
              <li>Thường xuyên kiểm tra và cập nhật biện pháp bảo mật</li>
              <li>Không chia sẻ thông tin với bên thứ ba trừ khi có sự đồng ý hoặc yêu cầu pháp lý</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            4. Chia sẻ thông tin
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, color: '#475569', lineHeight: '1.8', marginBottom: '1rem' }}>
              Chúng tôi <strong>KHÔNG</strong> bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba, ngoại trừ:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Đối tác thanh toán (PayOS) để xử lý giao dịch</li>
              <li>Nhà cung cấp dịch vụ hỗ trợ hoạt động website (theo hợp đồng bảo mật)</li>
              <li>Khi có yêu cầu từ cơ quan pháp luật có thẩm quyền</li>
              <li>Khi cần thiết để bảo vệ quyền lợi và an toàn của chúng tôi và người dùng</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            5. Quyền của bạn
          </h2>
          <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.8', marginBottom: '1rem' }}>
              Bạn có quyền:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af', lineHeight: '1.8' }}>
              <li>Truy cập và xem thông tin cá nhân của mình</li>
              <li>Yêu cầu chỉnh sửa hoặc xóa thông tin không chính xác</li>
              <li>Yêu cầu ngừng nhận email marketing</li>
              <li>Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
              <li>Từ chối cookies (có thể ảnh hưởng đến trải nghiệm)</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            6. Cookies
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <p style={{ margin: 0, color: '#475569', lineHeight: '1.8', marginBottom: '1rem' }}>
              Chúng tôi sử dụng cookies để:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Ghi nhớ đăng nhập và tùy chọn của bạn</li>
              <li>Phân tích lưu lượng truy cập và cải thiện dịch vụ</li>
              <li>Cá nhân hóa trải nghiệm người dùng</li>
            </ul>
            <p style={{ margin: '1rem 0 0 0', color: '#475569', lineHeight: '1.8' }}>
              Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng đến chức năng của website.
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            7. Thay đổi chính sách
          </h2>
          <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
            <p style={{ margin: 0, color: '#991b1b', lineHeight: '1.8' }}>
              Chúng tôi có thể cập nhật chính sách này theo thời gian. Mọi thay đổi sẽ được thông báo trên trang này với ngày cập nhật mới nhất. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là chấp nhận chính sách mới.
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            8. Liên hệ
          </h2>
          <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <p style={{ margin: 0, color: '#1e40af', lineHeight: '1.8', marginBottom: '1rem' }}>
              Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:
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
