export default function PurchaseGuidePage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
        Hướng dẫn mua hàng
      </h1>
      
      <div style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem', lineHeight: '1.6' }}>
        <p>Hướng dẫn chi tiết từng bước để mua và sử dụng dịch vụ tại Tiệm Tạp Hóa KeyT một cách dễ dàng và nhanh chóng.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            📱 Bước 1: Tìm kiếm sản phẩm
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Duyệt qua danh mục sản phẩm trên trang chủ hoặc sử dụng thanh tìm kiếm</li>
              <li>Click vào sản phẩm để xem chi tiết, giá cả và các gói dịch vụ khác nhau</li>
              <li>Đọc kỹ mô tả sản phẩm và các tính năng để chọn gói phù hợp</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
            🛒 Bước 2: Thêm vào giỏ hàng
          </h2>
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
              <li>Chọn gói dịch vụ và thời hạn mong muốn (nếu có nhiều lựa chọn)</li>
              <li>Nhấn nút "Thêm vào giỏ" hoặc "Mua ngay"</li>
              <li>Nếu sản phẩm yêu cầu thông tin bổ sung (email, tài khoản), bạn sẽ được yêu cầu nhập</li>
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
            <div>
              <strong style={{ color: '#1e40af' }}>Q: Làm sao để theo dõi đơn hàng?</strong>
              <p style={{ color: '#1e40af', margin: '0.5rem 0 0 0' }}>A: Đăng nhập vào tài khoản và vào mục "Đơn hàng của tôi" để xem trạng thái chi tiết.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
