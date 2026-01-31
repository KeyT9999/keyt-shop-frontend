# ✅ Checklist Sửa Màn Hình Trắng

## Bước 1: Redeploy (QUAN TRỌNG NHẤT!)

Sau khi thêm/sửa Environment Variables trên Vercel, **BẮT BUỘC phải redeploy**:

1. Vào Vercel Dashboard → Deployments
2. Tìm deployment mới nhất
3. Click **"..."** (3 chấm) → **"Redeploy"**
4. Chọn **"Use existing Build Cache"** (nếu có) → Click **"Redeploy"**

**Lưu ý:** Environment variables chỉ có hiệu lực sau khi redeploy!

## Bước 2: Kiểm tra Console trong Browser

1. Mở https://www.taphoakeyt.com
2. Nhấn **F12** → Tab **Console**
3. Tìm dòng: `🔧 App Environment:`
4. Kiểm tra:
   - ✅ `apiUrl` có đúng backend URL không?
   - ✅ `hasGoogleClientId` có `true` không?
   - ✅ `hasRootElement` có `true` không?

### Nếu thấy lỗi:
- **`⚠️ VITE_API_BASE_URL chưa được cấu hình!`** → Cần thêm env var và redeploy
- **`❌ Root element not found!`** → Có vấn đề với index.html
- **`❌ Error rendering app:`** → Có lỗi JavaScript, xem chi tiết bên dưới

## Bước 3: Kiểm tra Network Tab

1. F12 → Tab **Network**
2. Refresh trang (F5)
3. Xem có request đến `/api/products` không:
   - ✅ Có request → App đang chạy
   - ❌ Không có request → App không render được

### Kiểm tra API URL:
- Nếu thấy request đến `http://localhost:5000/api` → Env var chưa được áp dụng → **Redeploy!**
- Nếu thấy request đến `https://your-backend.onrender.com/api` → ✅ Đúng

## Bước 4: Kiểm tra Build Logs trên Vercel

1. Vào Vercel Dashboard → Deployments
2. Click vào deployment mới nhất
3. Xem **Build Logs**:
   - ✅ Build thành công?
   - ✅ Có warning nào không?
   - ✅ TypeScript compilation OK?

## Bước 5: Quick Test

Mở Console (F12) và chạy lệnh này:
```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'Có' : 'Không có');
```

**Kết quả mong đợi:**
- `API URL:` phải là `https://your-backend.onrender.com/api`
- `Google Client ID:` phải là `Có`

## 🔧 Common Issues

### Issue 1: Vẫn thấy localhost trong Console
**Nguyên nhân:** Chưa redeploy sau khi thêm env vars

**Giải pháp:** 
1. Redeploy lại project
2. Đợi build xong
3. Refresh browser (Ctrl+F5 để clear cache)

### Issue 2: Màn hình trắng, không có lỗi trong Console
**Nguyên nhân:** Có thể do:
- CSS không load được
- JavaScript bundle không load được
- Routing issue

**Giải pháp:**
1. Kiểm tra Network tab → Xem có file `.js` hoặc `.css` nào fail không
2. Kiểm tra Sources tab → Xem có file nào không load được không
3. Thử hard refresh: Ctrl+Shift+R hoặc Ctrl+F5

### Issue 3: ErrorBoundary hiển thị lỗi
**Giải pháp:**
1. Xem chi tiết lỗi trong ErrorBoundary
2. Mở Console để xem stack trace đầy đủ
3. Kiểm tra file và dòng code bị lỗi
4. Sửa lỗi và commit lại

## 📝 Checklist Nhanh

- [ ] Đã redeploy sau khi thêm/sửa env vars
- [ ] Đã kiểm tra Console → Thấy `🔧 App Environment:`
- [ ] API URL trong Console đúng (không phải localhost)
- [ ] Đã kiểm tra Network tab → Có request đến API
- [ ] Build trên Vercel thành công
- [ ] Đã thử hard refresh (Ctrl+F5)

## 🚀 Sau khi hoàn thành

Nếu vẫn còn vấn đề:
1. Copy toàn bộ output từ Console
2. Copy screenshot của Network tab
3. Gửi thông tin này để được hỗ trợ
