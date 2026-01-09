import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">KeyT Store</div>
          <p className="footer__tagline">Kho dịch vụ số đa dạng, giá tốt mỗi ngày.</p>
        </div>

        <div className="footer__links">
          <div>
            <h4>Thông tin</h4>
            <a href="#">Giới thiệu</a>
            <a href="#">Liên hệ</a>
            <a href="#">Đánh giá</a>
            <a href="#">Tuyển dụng</a>
          </div>
          <div>
            <h4>Hỗ trợ</h4>
            <a href="#">Bảo hành & hoàn tiền</a>
            <a href="#">Hướng dẫn mua hàng</a>
            <a href="#">Bài viết & tin tức</a>
            <a href="#">FAQ</a>
          </div>
          <div>
            <h4>Sản phẩm nổi bật</h4>
            <a href="#">Mua Spotify Premium</a>
            <a href="#">Mua tài khoản Netflix</a>
            <a href="#">Mua Canva Pro</a>
            <a href="#">Mua Adobe</a>
            <a href="#">Mua YouTube Premium</a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} KeyT Store. All rights reserved.</span>
        <a href="https://keytstore.example" className="footer__link">keytstore.example</a>
      </div>
    </footer>
  );
}
