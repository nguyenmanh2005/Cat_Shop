# Hướng Dẫn Deploy Frontend trên Railway

## Bước 1: Tạo Service Mới cho Frontend

1. **Vào Railway Dashboard**
   - Truy cập: https://railway.app/dashboard
   - Chọn project "caring-courage"

2. **Click nút "+ New"** (góc trên bên phải)
   - Hoặc click **"+ Create"** trong Architecture view

3. **Chọn "GitHub Repo"**
   - Railway sẽ hiển thị danh sách repositories

4. **Chọn repository "Cat_Shop"** (hoặc tên repo của bạn)

5. **Railway sẽ tự động tạo service mới**

---

## Bước 2: Cấu Hình Root Directory

1. **Click vào service mới vừa tạo** (có thể tên là "Cat_Shop" hoặc tên khác)

2. **Click tab "Settings"**

3. **Tìm phần "Root Directory"**

4. **Nhập:** `frontend`
   - Chỉ nhập `frontend`, không có `/` ở đầu

5. **Click "Save"** hoặc để Railway tự động save

---

## Bước 3: Lấy Backend URL

Trước khi cấu hình frontend, cần lấy URL của backend:

1. **Click vào service "Cat_Shop"** (backend)

2. **Click tab "Settings"**

3. **Tìm phần "Public Domain"** hoặc **"Networking"**

4. **Nếu chưa có domain:**
   - Click **"Generate Domain"** hoặc **"Expose"**
   - Railway sẽ tạo URL, ví dụ: `cat-shop-production.up.railway.app`

5. **Copy URL này** (sẽ dùng cho `VITE_API_BASE_URL`)

---

## Bước 4: Thêm Environment Variables cho Frontend

1. **Click vào service Frontend** (service mới tạo)

2. **Click tab "Variables"**

3. **Click "New Variable"**

4. **Thêm các biến sau:**

### Biến 1: VITE_API_BASE_URL

- **Name:** `VITE_API_BASE_URL`
- **Value:** 
  ```
  https://[backend-url].up.railway.app/api
  ```
  
  **Ví dụ:**
  ```
  https://cat-shop-production.up.railway.app/api
  ```
  
  **Lưu ý:**
  - Phải có `https://` ở đầu
  - Phải có `/api` ở cuối
  - Thay `[backend-url]` bằng URL thực tế của backend

- **Click "Add"**

### Biến 2: VITE_RECAPTCHA_SITE_KEY (nếu có)

- **Name:** `VITE_RECAPTCHA_SITE_KEY`
- **Value:** Site key của Google reCAPTCHA (nếu bạn đã cấu hình)
- **Click "Add"**

**Lưu ý:** Nếu chưa có reCAPTCHA, có thể bỏ qua biến này.

---

## Bước 5: Cấu Hình Build Settings (Nếu Cần)

1. **Vào service Frontend** → **"Settings"**

2. **Kiểm tra "Build Command":**
   - Railway sẽ tự động detect từ Dockerfile
   - Không cần thay đổi nếu dùng Dockerfile

3. **Kiểm tra "Start Command":**
   - Railway sẽ tự động detect từ Dockerfile
   - Không cần thay đổi nếu dùng Dockerfile

---

## Bước 6: Đợi Railway Deploy

1. **Railway sẽ tự động:**
   - Clone code từ GitHub
   - Build Docker image từ Dockerfile trong thư mục `frontend`
   - Deploy service

2. **Xem tiến trình:**
   - Vào tab "Deployments"
   - Xem build logs
   - Đợi đến khi thấy "Deployment successful"

3. **Thời gian:** Thường mất 3-5 phút

---

## Bước 7: Expose Frontend Service

1. **Vào service Frontend** → **"Settings"**

2. **Tìm phần "Networking"** hoặc **"Public Networking"**

3. **Click "Generate Domain"** hoặc **"Expose"**

4. **Railway sẽ tạo URL, ví dụ:**
   ```
   https://catshop-frontend.up.railway.app
   ```

5. **Copy URL này**

---

## Bước 8: Test Frontend

1. **Mở trình duyệt**

2. **Truy cập URL frontend:**
   ```
   https://[frontend-url].up.railway.app
   ```

3. **Kiểm tra:**
   - Website load được không
   - Có thể đăng nhập/đăng ký không
   - API calls có hoạt động không (kiểm tra Network tab trong DevTools)

---

## Bước 9: Cập Nhật Backend CORS (Nếu Cần)

Nếu frontend và backend ở domain khác nhau, cần cấu hình CORS:

1. **Vào service Backend (Cat_Shop)** → **"Variables"**

2. **Thêm hoặc cập nhật:**

   - **FRONTEND_URL:**
     ```
     https://[frontend-url].up.railway.app
     ```

   - **CORS_ORIGINS** (nếu có):
     ```
     https://[frontend-url].up.railway.app,http://localhost:5173
     ```

3. **Railway sẽ tự động redeploy backend**

---

## Tóm Tắt Các Bước

1. ✅ **Tạo service mới** → Chọn GitHub Repo
2. ✅ **Set Root Directory** = `frontend`
3. ✅ **Lấy Backend URL** từ service Cat_Shop
4. ✅ **Thêm Variables:**
   - `VITE_API_BASE_URL=https://[backend-url]/api`
   - `VITE_RECAPTCHA_SITE_KEY=[key]` (nếu có)
5. ✅ **Đợi Railway deploy**
6. ✅ **Expose Frontend** → Generate Domain
7. ✅ **Test website**
8. ✅ **Cập nhật Backend CORS** (nếu cần)

---

## Lưu Ý Quan Trọng

### 1. Root Directory Phải Đúng

- ✅ Đúng: `frontend`
- ❌ Sai: `/frontend` (có `/` ở đầu)
- ❌ Sai: `./frontend`
- ❌ Sai: `frontend/`

### 2. VITE_API_BASE_URL Format

- ✅ Đúng: `https://cat-shop-production.up.railway.app/api`
- ❌ Sai: `https://cat-shop-production.up.railway.app` (thiếu `/api`)
- ❌ Sai: `http://cat-shop-production.up.railway.app/api` (thiếu `s` trong `https`)

### 3. Build Time vs Runtime Variables

- `VITE_*` variables phải được set **TRƯỚC KHI BUILD**
- Railway sẽ tự động inject vào Dockerfile build stage
- Nếu thay đổi `VITE_*` variables, cần **redeploy** để rebuild

---

## Troubleshooting

### Lỗi: "Railpack could not determine how to build"

**Nguyên nhân:**
- Root Directory chưa đúng
- Dockerfile không tìm thấy

**Cách fix:**
1. Kiểm tra Root Directory = `frontend`
2. Kiểm tra có file `Dockerfile` trong thư mục `frontend`
3. Redeploy service

### Lỗi: "Cannot find module" hoặc build failed

**Nguyên nhân:**
- Thiếu dependencies
- Node version không đúng

**Cách fix:**
1. Kiểm tra `package.json` có đầy đủ dependencies
2. Kiểm tra Dockerfile dùng Node version đúng (20-alpine)
3. Xem build logs để tìm lỗi cụ thể

### Lỗi: "API calls failed" hoặc CORS error

**Nguyên nhân:**
- `VITE_API_BASE_URL` sai
- Backend chưa cấu hình CORS

**Cách fix:**
1. Kiểm tra `VITE_API_BASE_URL` có đúng format không
2. Kiểm tra backend có expose domain chưa
3. Thêm `FRONTEND_URL` vào backend variables
4. Redeploy cả frontend và backend

### Lỗi: "404 Not Found" khi truy cập routes

**Nguyên nhân:**
- Nginx chưa cấu hình đúng cho SPA routing

**Cách fix:**
1. Kiểm tra file `nginx.conf` trong thư mục `frontend`
2. Đảm bảo có cấu hình:
   ```nginx
   try_files $uri $uri/ /index.html;
   ```

---

## Kiểm Tra Nhanh

Sau khi deploy, kiểm tra:

1. ✅ **Frontend service status** = "Online"
2. ✅ **Frontend có public domain** chưa
3. ✅ **Environment variables** đã thêm đầy đủ
4. ✅ **Backend URL** đã expose chưa
5. ✅ **Website load được** không
6. ✅ **API calls hoạt động** không (kiểm tra Network tab)

---

## Ví Dụ Cụ Thể

### Nếu Backend URL là:
```
https://cat-shop-production.up.railway.app
```

### Thì Frontend Variables:
```
VITE_API_BASE_URL=https://cat-shop-production.up.railway.app/api
```

### Và Backend Variables (để CORS):
```
FRONTEND_URL=https://catshop-frontend.up.railway.app
```

---

**Chúc bạn deploy frontend thành công! 🚀**

