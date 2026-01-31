# 🔍 Debug Màn Hình Trắng trên Production

## Bước 1: Kiểm tra Console trong Browser

1. Mở website: https://www.taphoakeyt.com
2. Nhấn `F12` hoặc `Ctrl+Shift+I` để mở Developer Tools
3. Vào tab **Console**
4. Xem có lỗi nào không (màu đỏ)

### Các lỗi thường gặp:

#### ❌ Lỗi 1: `VITE_API_BASE_URL chưa được cấu hình!`
**Nguyên nhân:** Environment variable chưa được set trên Vercel

**Giải pháp:**
1. Vào Vercel Dashboard → Project Settings → Environment Variables
2. Thêm:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend-url.onrender.com/api`
   - Environment: Production, Preview
3. **Redeploy** project

#### ❌ Lỗi 2: `CORS policy` hoặc `Network Error`
**Nguyên nhân:** 
- API URL sai hoặc backend không cho phép CORS từ domain này
- Backend chưa chạy

**Giải pháp:**
- Kiểm tra backend URL có đúng không
- Kiểm tra backend có đang chạy không
- Kiểm tra CORS settings trên backend

#### ❌ Lỗi 3: `Cannot read property 'X' of undefined`
**Nguyên nhân:** Code có lỗi runtime

**Giải pháp:**
- Xem chi tiết lỗi trong Console
- Kiểm tra file và dòng code bị lỗi
- ErrorBoundary sẽ hiển thị lỗi này

## Bước 2: Kiểm tra Network Tab

1. Mở Developer Tools → Tab **Network**
2. Refresh trang (F5)
3. Xem các request:
   - ✅ Nếu thấy request đến `/api/products` → App đang chạy
   - ❌ Nếu không thấy request nào → App không render được

### Kiểm tra API URL:
- Xem request đến API có URL đúng không
- Nếu thấy `http://localhost:5000/api` → Environment variable chưa được set

## Bước 3: Kiểm tra Environment Variables trên Vercel

1. Vào Vercel Dashboard
2. Chọn project
3. Settings → Environment Variables
4. Kiểm tra có các biến sau:
   - ✅ `VITE_API_BASE_URL` (bắt buộc)
   - ✅ `VITE_GOOGLE_CLIENT_ID` (tùy chọn)

### Format đúng:
```
VITE_API_BASE_URL=https://your-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Lưu ý:** 
- Phải có prefix `VITE_` để Vite expose vào client
- Sau khi thêm/sửa, PHẢI redeploy

## Bước 4: Kiểm tra Build Logs

1. Vào Vercel Dashboard
2. Deployments → Chọn deployment mới nhất
3. Xem Build Logs

### Kiểm tra:
- ✅ Build thành công không?
- ✅ Có warning về missing env vars không?
- ✅ TypeScript compilation có lỗi không?

## Bước 5: Kiểm tra ErrorBoundary

Nếu có lỗi JavaScript, ErrorBoundary sẽ hiển thị:
- Thông báo lỗi
- Chi tiết lỗi (trong development mode)
- Nút "Tải lại trang"

## Bước 6: Quick Fix Checklist

- [ ] Đã kiểm tra Console trong browser
- [ ] Đã kiểm tra Network tab
- [ ] Đã thêm `VITE_API_BASE_URL` vào Vercel
- [ ] Đã redeploy sau khi thêm env vars
- [ ] Đã kiểm tra backend có đang chạy không
- [ ] Đã kiểm tra CORS settings trên backend

## Bước 7: Test Local với Production API

Để test xem có phải do env vars không:

1. Tạo file `.env.local` trong `keyt-shop-frontend`:
```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

2. Chạy:
```bash
npm run dev
```

3. Nếu local chạy được → Vấn đề là env vars trên Vercel
4. Nếu local cũng lỗi → Vấn đề là code hoặc backend

## 🔧 Common Issues & Solutions

### Issue 1: Màn hình trắng, không có lỗi trong Console
**Nguyên nhân:** App không render được do lỗi trong quá trình mount

**Giải pháp:**
- Kiểm tra ErrorBoundary có hoạt động không
- Kiểm tra `main.tsx` có lỗi không
- Kiểm tra các Provider có lỗi không

### Issue 2: Màn hình trắng, có lỗi CORS
**Nguyên nhân:** Backend không cho phép CORS từ domain này

**Giải pháp:**
- Thêm domain vào CORS whitelist trên backend
- Kiểm tra backend có đang chạy không

### Issue 3: Màn hình trắng, API calls fail
**Nguyên nhân:** API URL sai hoặc backend không response

**Giải pháp:**
- Kiểm tra `VITE_API_BASE_URL` có đúng không
- Test API URL trực tiếp trong browser
- Kiểm tra backend logs

## 📞 Cần hỗ trợ?

Nếu vẫn không giải quyết được:
1. Copy toàn bộ lỗi trong Console
2. Copy screenshot của Network tab
3. Kiểm tra Vercel build logs
4. Gửi thông tin này để được hỗ trợ
