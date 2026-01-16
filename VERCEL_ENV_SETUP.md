# 🔧 Hướng dẫn Cấu hình Environment Variables trên Vercel

## Bước 1: Lấy Backend URL từ Render

1. Vào Render Dashboard → Chọn service `keyt-shop-backend`
2. Copy URL của service (ví dụ: `https://keyt-shop-backend.onrender.com`)
3. Backend API URL sẽ là: `https://keyt-shop-backend.onrender.com/api`

## Bước 2: Thêm Environment Variable vào Vercel

### 2.1. Vào Vercel Dashboard

1. Truy cập https://vercel.com/dashboard
2. Đăng nhập vào tài khoản của bạn
3. Chọn project **taphoakeyt** (hoặc tên project của bạn)

### 2.2. Vào Settings

1. Click vào project name
2. Vào tab **"Settings"** (ở menu trên cùng)
3. Scroll xuống phần **"Environment Variables"**

### 2.3. Thêm biến môi trường

1. Click nút **"Add New"** hoặc **"Add"**
2. Điền thông tin:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.onrender.com/api`
     *(Thay `your-backend-url` bằng URL thật từ Render)*
   - **Environment**: Chọn tất cả:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development (nếu muốn test local với production API)

3. Click **"Save"**

### 2.4. Ví dụ cụ thể

Nếu backend URL của bạn là: `https://keyt-shop-backend.onrender.com`

Thì cấu hình như sau:
```
Key: VITE_API_BASE_URL
Value: https://keyt-shop-backend.onrender.com/api
Environment: Production, Preview, Development
```

## Bước 3: Redeploy Frontend

**QUAN TRỌNG:** Sau khi thêm environment variable, bạn PHẢI redeploy để áp dụng thay đổi.

### Cách 1: Redeploy từ Dashboard (Nhanh nhất)

1. Vào tab **"Deployments"**
2. Tìm deployment mới nhất
3. Click vào **"..."** (3 chấm) → Chọn **"Redeploy"**
4. Chọn **"Use existing Build Cache"** (nếu có) → Click **"Redeploy"**

### Cách 2: Push code mới (Nếu muốn)

```bash
cd keyt-shop-frontend
# Tạo một commit nhỏ để trigger redeploy
git commit --allow-empty -m "Trigger redeploy for env vars"
git push origin main
```

## Bước 4: Kiểm tra cấu hình

### 4.1. Kiểm tra trong Build Logs

1. Vào **Deployments** → Chọn deployment mới nhất
2. Click vào deployment → Xem **Build Logs**
3. Tìm dòng có chứa `VITE_API_BASE_URL` để xác nhận biến đã được load

### 4.2. Kiểm tra trong Browser

1. Mở website: https://taphoakeyt.vercel.app
2. Mở Developer Tools (F12)
3. Vào tab **Console**
4. Gõ lệnh sau để kiểm tra:
```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
```

**Kết quả mong đợi:**
- Nếu thấy: `https://your-backend-url.onrender.com/api` → ✅ Đã cấu hình đúng
- Nếu thấy: `undefined` hoặc `http://localhost:5000/api` → ❌ Chưa được cấu hình hoặc chưa redeploy

### 4.3. Kiểm tra Network Requests

1. Mở Developer Tools (F12) → Tab **Network**
2. Thử login hoặc load products
3. Xem các request đến API:
   - ✅ Nếu URL là `https://your-backend-url.onrender.com/api/...` → Đúng
   - ❌ Nếu URL là `http://localhost:5000/api/...` → Chưa được cấu hình

## Bước 5: Test Login

Sau khi redeploy xong:

1. Mở https://taphoakeyt.vercel.app
2. Thử login bằng username/password
3. Thử login bằng Google
4. Kiểm tra Console và Network tab xem có lỗi gì không

## 🔍 Troubleshooting

### Vấn đề: Vẫn thấy `localhost:5000` trong Network tab

**Nguyên nhân:**
- Chưa redeploy sau khi thêm env var
- Key name sai (phải là `VITE_API_BASE_URL` với prefix `VITE_`)
- Environment variable chưa được set cho environment đang chạy

**Giải pháp:**
1. Kiểm tra lại Key name: Phải là `VITE_API_BASE_URL` (không phải `API_BASE_URL`)
2. Đảm bảo đã chọn đúng Environment (Production, Preview)
3. Redeploy lại frontend

### Vấn đề: Build failed sau khi thêm env var

**Nguyên nhân:**
- Value có ký tự đặc biệt chưa được escape
- URL không hợp lệ

**Giải pháp:**
- Đảm bảo URL không có khoảng trắng thừa
- Format: `https://domain.com/api` (không có `/` ở cuối nếu không cần)

### Vấn đề: Preview deployments không dùng env var

**Giải pháp:**
- Đảm bảo đã chọn **Preview** environment khi thêm env var
- Hoặc set riêng cho Preview với giá trị khác nếu cần

## 📝 Checklist

- [ ] Đã lấy backend URL từ Render
- [ ] Đã thêm `VITE_API_BASE_URL` vào Vercel Environment Variables
- [ ] Đã chọn đúng Environment (Production, Preview)
- [ ] Đã click Save
- [ ] Đã redeploy frontend
- [ ] Đã kiểm tra trong browser console
- [ ] Đã test login thành công

## 🎯 Quick Reference

**Format Environment Variable:**
```
Key: VITE_API_BASE_URL
Value: https://your-backend-url.onrender.com/api
```

**Lưu ý:**
- Với Vite, tất cả env vars phải có prefix `VITE_` để được expose vào client
- Sau khi thêm, PHẢI redeploy để áp dụng
- Có thể set khác nhau cho Production và Preview nếu cần

---

**Sau khi hoàn thành, frontend sẽ tự động gọi API từ backend trên Render! 🚀**
