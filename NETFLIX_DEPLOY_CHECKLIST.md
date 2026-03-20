# Netflix Tiệm Bánh — checklist triển khai

Tài liệu vận hành (code admin + `/netflix` đã có trong repo). Làm lần lượt trước khi go-live.

## 1. Build và deploy frontend

- Chạy `npm run build` trong `keyt-shop-frontend` (CI/local phải pass).
- Đẩy `dist/` hoặc pipeline tương đương lên hosting.
- Sau deploy, mở **Admin → Products**: phải thấy khối **Netflix Tiệm Bánh** trong form sản phẩm và badge **NETFLIX** trên danh sách (nếu đã bật cờ).

## 2. Gắn cờ sản phẩm Netflix (MongoDB)

**Cách khuyến nghị:** Admin → Products → sửa **một** gói Netflix nội bộ → bật **Netflix Tiệm Bánh** → Lưu.  
Bật Netflix sẽ tắt **Account có sẵn** (và ngược lại) trong form.

**Cách CLI (tùy chọn):** từ `keyt-shop-backend` với `.env` có `MONGODB_URL`:

```bash
node scripts/set-product-netflix-flag.js <PRODUCT_MONGO_ID>
```

Script sẽ set `isTiemBanhNetflix: true` cho đúng một document (và in tên sản phẩm).

## 3. Biến môi trường frontend

| Biến | Bắt buộc | Ghi chú |
|------|-----------|---------|
| `VITE_API_BASE_URL` | Có | Phải trỏ **đúng** API backend chứa DB đã gắn cờ (trỏ nhầm → `/netflix` báo không tìm thấy gói). |
| `VITE_NETFLIX_PRODUCT_ID` | Không | Nếu set = `_id` MongoDB, `/netflix` luôn dùng SKU đó; nếu không, trang tự tìm sản phẩm `isTiemBanhNetflix` hoặc tên chứa `Netflix`. |

Xem [`keyt-shop-frontend/.env.example`](.env.example).

## 4. Smoke test sau deploy

1. `GET {VITE_API_BASE_URL}/products` — trong mảng JSON có ít nhất một phần tử `"isTiemBanhNetflix": true` (hoặc đã set `VITE_NETFLIX_PRODUCT_ID` trỏ đúng `_id`).
2. Mở `/netflix` trên domain đã deploy — thấy giá và nút **Mua ngay** / **Thêm vào giỏ**.

## 5. Backend sau thanh toán (get-cookie)

Lỗi **“không tìm thấy gói”** ở `/netflix` khác với lỗi **sau PayOS** (slot `failed`, không có cookie):

- Cần `TIEM_BANH_X_API_KEY` (và tùy chọn `TIEM_BANH_API_BASE`) trên server backend — key lấy từ **portal CTV Tiệm Bánh**, chỉ lưu trong `.env` backend, **không** đưa lên frontend.
- Mỗi lần `GET .../get-cookie` trừ **1 quota**; **rate limit 10 req/phút** (backend đã throttle). Response gồm `logId`, `cookie`, `pcLoginLink`, `mobileLoginLink`, `tokenExpires`, `timeRemaining`, `quota`, ...
- Cần cấu hình PayOS (`PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, URL return/cancel).

Chi tiết API đối tác & mapping trong code: [`keyt-shop-backend/TIEM_BANH_CTV.md`](../keyt-shop-backend/TIEM_BANH_CTV.md).

Thêm: [`keyt-shop-backend/SETUP_COMPLETE.md`](../keyt-shop-backend/SETUP_COMPLETE.md), [`keyt-shop-backend/.env.example`](../keyt-shop-backend/.env.example).

## Phân biệt nhanh

| Triệu chứng | Hướng xử lý |
|-------------|-------------|
| `/netflix` không có nút mua | Chưa deploy bản mới, chưa cờ `isTiemBanhNetflix`, sai `VITE_API_BASE_URL`, hoặc DB trống. |
| Thanh toán xong không có cookie | Backend: Tiệm Bánh API key, PayOS webhook, log `netflix-order-provision` / `tiembanh.service`. |
