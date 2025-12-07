# 🔧 Fix Lỗi "Error creating build plan with Railpack"

Lỗi này xảy ra khi Railway không detect được Docker setup. Hướng dẫn fix:

---

## 🎯 Nguyên Nhân

Railway đang cố dùng **Railpack** (auto-detection) thay vì **Docker**. Cần cấu hình để Railway dùng Docker.

---

## ✅ Cách Fix 1: Tách Services Riêng (Khuyến Nghị)

Railway không hỗ trợ `docker-compose.yml` trực tiếp. Cần tách thành services riêng:

### Bước 1: Xóa Service Hiện Tại

1. Vào service "Cat_Shop"
2. Click **Settings** → **Delete Service**
3. Xác nhận xóa

### Bước 2: Deploy Backend Riêng

1. Click **"New"** → **"GitHub Repo"**
2. Chọn repository
3. Railway sẽ hỏi **"Configure Service"**
4. Chọn:
   - **Root Directory**: `back-end`
   - **Build Command**: (để trống - Docker sẽ tự build)
   - **Start Command**: (để trống - Docker sẽ tự start)
5. Railway sẽ detect `Dockerfile` trong `back-end/`
6. Deploy!

### Bước 3: Deploy Frontend Riêng

1. Click **"New"** → **"GitHub Repo"**
2. Chọn **CÙNG repository**
3. Railway sẽ hỏi **"Configure Service"**
4. Chọn:
   - **Root Directory**: `frontend`
   - **Build Command**: (để trống)
   - **Start Command**: (để trống)
5. Railway sẽ detect `Dockerfile` trong `frontend/`
6. Deploy!

### Bước 4: Add Database Services

1. Click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Click **"New"** → **"Database"** → **"Add Redis"**

---

## ✅ Cách Fix 2: Tạo railway.json

Tạo file `railway.json` trong root project để chỉ định dùng Docker:

### Bước 1: Tạo File railway.json

Tạo file `railway.json` trong root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "back-end/Dockerfile"
  },
  "deploy": {
    "startCommand": "java -jar app.jar",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Bước 2: Push Lên GitHub

```bash
git add railway.json
git commit -m "Add railway.json for Docker build"
git push
```

### Bước 3: Redeploy

1. Vào Railway dashboard
2. Click **"Redeploy"** hoặc đợi auto-deploy

---

## ✅ Cách Fix 3: Cấu Hình Trong Railway Dashboard

### Bước 1: Vào Service Settings

1. Click vào service "Cat_Shop"
2. Click tab **"Settings"**
3. Scroll xuống phần **"Build & Deploy"**

### Bước 2: Cấu Hình Build

1. **Root Directory**: `back-end` (cho backend) hoặc `frontend` (cho frontend)
2. **Build Command**: (để trống)
3. **Start Command**: (để trống)
4. **Dockerfile Path**: `back-end/Dockerfile` (cho backend) hoặc `frontend/Dockerfile` (cho frontend)

### Bước 3: Save & Redeploy

1. Click **"Save"**
2. Railway sẽ tự động redeploy

---

## 🎯 Cách Tốt Nhất: Tách Services

Vì project có nhiều services (backend, frontend, postgres, redis), nên **tách riêng**:

### Cấu Trúc Project Trên Railway:

```
Your Project
├── 📦 backend (GitHub Repo → Root: back-end)
├── 📦 frontend (GitHub Repo → Root: frontend)
├── 🗄️ postgres (Database → PostgreSQL)
└── 🔴 redis (Database → Redis)
```

### Hướng Dẫn Chi Tiết:

#### 1. Deploy Backend:

1. **New** → **GitHub Repo** → Chọn repo
2. **Configure Service**:
   - **Name**: `backend`
   - **Root Directory**: `back-end`
   - **Build Command**: (để trống)
   - **Start Command**: (để trống)
3. Railway sẽ detect `back-end/Dockerfile`
4. Deploy!

#### 2. Deploy Frontend:

1. **New** → **GitHub Repo** → Chọn **CÙNG repo**
2. **Configure Service**:
   - **Name**: `frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: (để trống)
   - **Start Command**: (để trống)
3. Railway sẽ detect `frontend/Dockerfile`
4. Deploy!

#### 3. Add PostgreSQL:

1. **New** → **Database** → **Add PostgreSQL**
2. Railway tự động tạo

#### 4. Add Redis:

1. **New** → **Database** → **Add Redis`
2. Railway tự động tạo

---

## 🔍 Kiểm Tra Logs

Sau khi fix, kiểm tra logs:

1. Click vào service
2. Click tab **"Deployments"**
3. Click vào deployment mới nhất
4. Xem logs để đảm bảo build thành công

---

## ⚠️ Lưu Ý Quan Trọng

1. **Railway KHÔNG hỗ trợ docker-compose.yml trực tiếp**
   - Phải tách thành services riêng
   - Hoặc dùng Railway's built-in databases

2. **Root Directory quan trọng**
   - Backend: `back-end`
   - Frontend: `frontend`

3. **Dockerfile phải ở đúng vị trí**
   - `back-end/Dockerfile` cho backend
   - `frontend/Dockerfile` cho frontend

4. **Environment Variables**
   - Mỗi service có variables riêng
   - Backend variables → Backend service
   - Frontend variables → Frontend service

---

## ✅ Checklist

- [ ] Đã xóa service cũ (nếu cần)
- [ ] Đã tạo backend service với Root Directory: `back-end`
- [ ] Đã tạo frontend service với Root Directory: `frontend`
- [ ] Đã add PostgreSQL
- [ ] Đã add Redis
- [ ] Đã thêm environment variables
- [ ] Đã kiểm tra logs không có lỗi

---

## 🆘 Vẫn Lỗi?

### Kiểm Tra:

1. **Dockerfile có đúng không?**
   ```bash
   # Kiểm tra back-end/Dockerfile tồn tại
   ls back-end/Dockerfile
   
   # Kiểm tra frontend/Dockerfile tồn tại
   ls frontend/Dockerfile
   ```

2. **Root Directory đúng chưa?**
   - Backend: `back-end` (có dấu gạch ngang)
   - Frontend: `frontend` (không có dấu gạch ngang)

3. **Xem logs chi tiết:**
   - Click "View logs" trong deployment
   - Tìm lỗi cụ thể

---

**Chúc bạn fix thành công! 🚀**

