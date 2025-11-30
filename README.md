# Tiệm Tạp Hóa KeyT - Frontend

Frontend React này sử dụng Vite + TypeScript và là nơi hiển thị danh sách dịch vụ, giỏ hàng, checkout, và hỗ trợ đăng nhập bằng Google.

## Chạy dev server

```bash
cd keyt-shop-frontend
npm install
npm run dev
```

## Biến môi trường cần thiết

Tạo file `.env` (hoặc copy từ `.env.example`) và cấu hình:

```
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Client ID này lấy từ Google Cloud Console khi tạo OAuth web client. Nó được dùng bởi `@react-oauth/google` để render nút đăng nhập.

## Các tính năng chính

- React Router để điều hướng giữa trang danh sách / chi tiết / giỏ hàng / checkout / đăng nhập / đăng ký.  
- Cart state + persistence (localStorage).  
- Auth context lưu JWT trả về từ backend và gắn header `Authorization`.  
- Hỗ trợ đăng nhập bằng Google token rồi đổi thành JWT riêng.  
- Checkout gửi đơn hàng lên backend `/api/orders`.
