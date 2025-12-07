# Sửa Lỗi Deploy Frontend trên Railway

## Vấn Đề

Service "intelligent-transformation" đang báo lỗi "There was an error deploying from source".

## Cách Sửa

### Bước 1: Kiểm Tra Root Directory

1. **Click vào service "intelligent-transformation"**

2. **Click tab "Settings"**

3. **Tìm phần "Root Directory"**

4. **Kiểm tra giá trị:**
   - ✅ Phải là: `frontend` (chỉ 2 từ, không có `/`)
   - ❌ Sai: Để trống
   - ❌ Sai: `/frontend`
   - ❌ Sai: `./frontend`

5. **Nếu chưa đúng:**
   - Xóa giá trị cũ
   - Nhập: `frontend`
   - Click "Save"

---

### Bước 2: Xem Build Logs Chi Tiết

1. **Click tab "Deployments"**

2. **Click vào deployment mới nhất** (có thể có icon lỗi màu đỏ)

3. **Click "Build Logs"** hoặc "View Logs"

4. **Xem logs để tìm lỗi:**
   - Tìm dòng có "ERROR" hoặc "FAILED"
   - Copy lỗi đó

---

### Bước 3: Các Lỗi Thường Gặp và Cách Sửa

#### Lỗi 1: "Railpack could not determine how to build"

**Nguyên nhân:**
- Root Directory chưa đúng
- Dockerfile không tìm thấy

**Cách fix:**
1. Kiểm tra Root Directory = `frontend`
2. Kiểm tra có file `Dockerfile` trong thư mục `frontend` không
3. Redeploy service

#### Lỗi 2: "Cannot find module" hoặc "npm install failed"

**Nguyên nhân:**
- Thiếu dependencies
- Node version không đúng

**Cách fix:**
1. Kiểm tra `package.json` có đầy đủ dependencies
2. Kiểm tra Dockerfile dùng Node version đúng (20-alpine)
3. Xem build logs để tìm lỗi cụ thể

#### Lỗi 3: "Dockerfile not found"

**Nguyên nhân:**
- Root Directory sai
- Dockerfile không có trong thư mục frontend

**Cách fix:**
1. Kiểm tra Root Directory = `frontend`
2. Kiểm tra file `frontend/Dockerfile` có tồn tại không
3. Nếu không có, cần tạo Dockerfile

---

### Bước 4: Redeploy Service

Sau khi sửa Root Directory:

1. **Vào tab "Deployments"**

2. **Click nút "Redeploy"** hoặc **"Deploy"** (nếu có)

3. **Hoặc:**
   - Vào Settings
   - Tìm phần "Deployments"
   - Click "Redeploy"

4. **Đợi Railway build lại** (thường 3-5 phút)

---

### Bước 5: Kiểm Tra Environment Variables

Đảm bảo đã thêm:

1. **Vào tab "Variables"**

2. **Kiểm tra có biến:**
   - `VITE_API_BASE_URL` = `https://catshop-production.up.railway.app/api`

3. **Nếu chưa có:**
   - Click "New Variable"
   - Name: `VITE_API_BASE_URL`
   - Value: `https://catshop-production.up.railway.app/api`
   - Click "Add"

---

## Checklist

Trước khi redeploy, đảm bảo:

- [ ] Root Directory = `frontend` (không có `/`)
- [ ] File `frontend/Dockerfile` tồn tại
- [ ] Environment variable `VITE_API_BASE_URL` đã thêm
- [ ] Service đang connect đúng GitHub repo

---

## Nếu Vẫn Lỗi

1. **Copy toàn bộ build logs**
2. **Gửi cho tôi** để tôi xem lỗi cụ thể
3. **Hoặc mô tả lỗi** bạn thấy trong logs

---

## Tóm Tắt

1. ✅ Kiểm tra Root Directory = `frontend`
2. ✅ Xem build logs để tìm lỗi
3. ✅ Thêm environment variables
4. ✅ Redeploy service
5. ✅ Đợi deploy xong
6. ✅ Expose frontend

---

**Làm theo các bước trên và báo lại kết quả!**

