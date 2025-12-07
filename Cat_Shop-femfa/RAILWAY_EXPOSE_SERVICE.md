# Hướng Dẫn Expose Service và Truy Cập Website

## Bước 1: Expose Backend Service (Cat_Shop)

1. **Vào Railway Dashboard**
   - Truy cập: https://railway.app/dashboard
   - Chọn project "caring-courage"

2. **Click vào service "Cat_Shop"** (backend)

3. **Click tab "Settings"** (ở trên cùng)

4. **Tìm phần "Networking"** hoặc **"Public Networking"**

5. **Click nút "Generate Domain"** hoặc **"Expose"**
   - Railway sẽ tự động tạo một public URL cho bạn
   - Ví dụ: `cat-shop-production.up.railway.app`

6. **Copy URL này** (sẽ dùng để test API)

---

## Bước 2: Expose Frontend Service (nếu có)

Nếu bạn đã deploy frontend service:

1. **Click vào service Frontend** (nếu có)

2. **Click tab "Settings"**

3. **Click "Generate Domain"** hoặc **"Expose"**

4. **Copy URL này** (sẽ dùng để truy cập website)

---

## Bước 3: Cập Nhật Environment Variables

Sau khi có public URL, cần cập nhật một số biến môi trường:

### Cho Backend (Cat_Shop):

1. **Vào service "Cat_Shop"** → **"Variables"**

2. **Thêm hoặc cập nhật:**

   - **FRONTEND_URL** (nếu có frontend):
     ```
     https://[frontend-domain].up.railway.app
     ```
     Ví dụ: `https://catshop-frontend.up.railway.app`

   - **CORS_ORIGINS** (nếu cần):
     ```
     https://[frontend-domain].up.railway.app,http://localhost:5173
     ```

### Cho Frontend (nếu có):

1. **Vào service Frontend** → **"Variables"**

2. **Thêm:**

   - **VITE_API_BASE_URL**:
     ```
     https://[backend-domain].up.railway.app/api
     ```
     Ví dụ: `https://cat-shop-production.up.railway.app/api`

---

## Bước 4: Test Backend API

### Cách 1: Test qua Browser

1. **Mở trình duyệt**

2. **Truy cập:**
   ```
   https://[backend-url].up.railway.app/api/health
   ```
   
   Ví dụ:
   ```
   https://cat-shop-production.up.railway.app/api/health
   ```

3. **Nếu thấy response JSON** → Backend đã chạy thành công!

### Cách 2: Test qua Postman

1. **Mở Postman**

2. **Tạo request mới:**
   - Method: `GET`
   - URL: `https://[backend-url].up.railway.app/api/health`

3. **Click "Send"**

4. **Kiểm tra response:**
   - Status: `200 OK`
   - Body: JSON response

### Cách 3: Test qua cURL (Terminal)

```bash
curl https://[backend-url].up.railway.app/api/health
```

---

## Bước 5: Test Frontend (nếu có)

1. **Mở trình duyệt**

2. **Truy cập URL frontend:**
   ```
   https://[frontend-url].up.railway.app
   ```

3. **Kiểm tra:**
   - Website load được không
   - Có thể đăng nhập/đăng ký không
   - API calls có hoạt động không

---

## Bước 6: Kiểm Tra Logs

Nếu có lỗi khi test:

1. **Vào service "Cat_Shop"** → **"Logs"**

2. **Xem logs real-time:**
   - Tìm lỗi connection database
   - Tìm lỗi CORS
   - Tìm lỗi API

3. **Nếu thấy lỗi:**
   - Copy log và gửi cho tôi
   - Hoặc fix theo hướng dẫn trong logs

---

## Các Endpoint Test Cơ Bản

### 1. Health Check
```
GET https://[backend-url]/api/health
```

### 2. Test Database Connection
```
GET https://[backend-url]/api/test/db
```
(Nếu có endpoint này)

### 3. Test Redis Connection
```
GET https://[backend-url]/api/test/redis
```
(Nếu có endpoint này)

---

## Lưu Ý Quan Trọng

1. **HTTPS:**
   - Railway tự động cung cấp HTTPS
   - URL sẽ có format: `https://[service-name].up.railway.app`

2. **CORS:**
   - Nếu frontend và backend ở domain khác nhau
   - Cần cấu hình CORS trong backend
   - Thêm `FRONTEND_URL` vào `CORS_ORIGINS`

3. **Environment Variables:**
   - Sau khi expose service, Railway sẽ tự động thêm biến `RAILWAY_PUBLIC_DOMAIN`
   - Có thể dùng biến này trong code

4. **Custom Domain:**
   - Railway cho phép thêm custom domain
   - Vào Settings → Domains → Add Custom Domain

---

## Troubleshooting

### Lỗi: "Service not found" hoặc "404"

**Nguyên nhân:**
- Service chưa được expose
- URL sai

**Cách fix:**
1. Kiểm tra service đã expose chưa
2. Copy lại URL chính xác từ Railway
3. Đảm bảo có `https://` ở đầu URL

### Lỗi: "Connection refused" hoặc "Cannot connect"

**Nguyên nhân:**
- Service đang deploy hoặc restart
- Database/Redis chưa kết nối được

**Cách fix:**
1. Kiểm tra service status phải là "Online"
2. Kiểm tra logs xem có lỗi gì
3. Kiểm tra environment variables đã đúng chưa

### Lỗi: "CORS policy"

**Nguyên nhân:**
- Frontend và backend ở domain khác nhau
- Chưa cấu hình CORS

**Cách fix:**
1. Thêm `FRONTEND_URL` vào backend environment variables
2. Cấu hình CORS trong backend code
3. Thêm domain frontend vào `CORS_ORIGINS`

---

## Tóm Tắt Nhanh

1. **Expose Backend:**
   - Cat_Shop → Settings → Generate Domain
   - Copy URL: `https://[url].up.railway.app`

2. **Test Backend:**
   - Truy cập: `https://[url].up.railway.app/api/health`
   - Nếu thấy JSON response → OK!

3. **Expose Frontend (nếu có):**
   - Frontend → Settings → Generate Domain
   - Copy URL

4. **Cập nhật Variables:**
   - Backend: Thêm `FRONTEND_URL`
   - Frontend: Thêm `VITE_API_BASE_URL`

5. **Test Website:**
   - Truy cập URL frontend
   - Test các chức năng

---

**Chúc bạn test thành công! 🚀**

