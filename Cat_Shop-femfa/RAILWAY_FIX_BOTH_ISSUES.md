# Sửa 2 Vấn Đề: Frontend và Backend

## Vấn Đề 1: Frontend - "Could not find root directory: frontend"

### Nguyên Nhân
Railway không tìm thấy thư mục `frontend` trong repo GitHub.

### Cách Sửa

#### Bước 1: Kiểm Tra Repo GitHub

1. **Vào GitHub:** https://github.com/nguyenmanh2005/Cat_Shop
2. **Kiểm tra có thư mục `frontend` không:**
   - Nếu KHÔNG có → Cần push code lên GitHub
   - Nếu CÓ → Tiếp tục bước 2

#### Bước 2: Push Code Lên GitHub (Nếu Chưa)

```bash
# Kiểm tra git status
git status

# Add tất cả files
git add .

# Commit
git commit -m "Add frontend directory"

# Push lên GitHub
git push origin main
```

#### Bước 3: Kiểm Tra Root Directory trên Railway

1. **Vào service "intelligent-transformation"** → **Settings**
2. **Kiểm tra Root Directory:**
   - Phải là: `frontend` (chỉ 2 từ, không có `/`)
   - KHÔNG có khoảng trắng ở đầu/cuối
3. **Nếu sai → Sửa lại:**
   - Xóa giá trị cũ
   - Nhập: `frontend`
   - Save

#### Bước 4: Redeploy Frontend

1. **Vào tab "Deployments"**
2. **Click "Redeploy"** hoặc **"Deploy the repo"**
3. **Đợi Railway build lại**

---

## Vấn Đề 2: Backend - "Connect timed out" (Database Connection Failed)

### Nguyên Nhân
Backend không kết nối được với PostgreSQL. Có thể do:
- `DATABASE_URL` sai format
- Cần dùng private networking thay vì public URL

### Cách Sửa

#### Bước 1: Kiểm Tra PostgreSQL Service

1. **Vào service "Postgres"** → **Variables**
2. **Tìm các biến:**
   - `PGHOST` hoặc `POSTGRES_HOST`
   - `PGPORT` hoặc `POSTGRES_PORT` (thường là `5432`)
   - `PGUSER` hoặc `POSTGRES_USER` (thường là `postgres`)
   - `PGPASSWORD` hoặc `POSTGRES_PASSWORD`
   - `PGDATABASE` hoặc `POSTGRES_DB`

3. **Copy các giá trị này**

#### Bước 2: Sửa DATABASE_URL trong Backend

**Cách 1: Dùng Private Networking (Khuyến Nghị)**

Railway có private networking giữa các services. Dùng internal hostname:

1. **Vào service "Postgres"** → **Settings** → **Networking**
2. **Tìm phần "Private Networking"**
3. **Copy internal hostname**, ví dụ: `postgres.railway.internal`
4. **Vào service "Cat_Shop"** → **Variables**
5. **Cập nhật `DATABASE_URL`:**
   ```
   jdbc:postgresql://postgres.railway.internal:5432/railway
   ```
   - Thay `postgres.railway.internal` bằng internal hostname thực tế
   - Thay `5432` bằng port thực tế
   - Thay `railway` bằng database name thực tế

**Cách 2: Dùng Public URL (Nếu Private Không Work)**

1. **Vào service "Postgres"** → **Settings** → **Networking**
2. **Tìm public URL** (nếu có)
3. **Cập nhật `DATABASE_URL`:**
   ```
   jdbc:postgresql://[public-host]:[port]/[database]
   ```

#### Bước 3: Kiểm Tra Tất Cả Variables

Đảm bảo có đầy đủ:

1. **DATABASE_URL:**
   ```
   jdbc:postgresql://postgres.railway.internal:5432/railway
   ```
   (Dùng private networking)

2. **DATABASE_USER:**
   ```
   postgres
   ```
   (Hoặc giá trị từ PostgreSQL service)

3. **DATABASE_PASSWORD:**
   ```
   [password-từ-postgres-service]
   ```

4. **REDIS_HOST:**
   ```
   redis.railway.internal
   ```
   (Dùng private networking)

5. **REDIS_PORT:**
   ```
   6379
   ```

6. **REDIS_PASSWORD:**
   ```
   [password-nếu-có]
   ```
   (Có thể để trống)

#### Bước 4: Restart Backend

1. **Vào service "Cat_Shop"** → **Settings**
2. **Tìm phần "Restart"** hoặc **"Redeploy"**
3. **Click "Restart"**
4. **Đợi service restart** (1-2 phút)

---

## Tóm Tắt Nhanh

### Frontend:
1. ✅ Kiểm tra thư mục `frontend` có trong GitHub repo không
2. ✅ Nếu chưa → Push code lên GitHub
3. ✅ Kiểm tra Root Directory = `frontend`
4. ✅ Redeploy frontend

### Backend:
1. ✅ Lấy internal hostname từ PostgreSQL service
2. ✅ Cập nhật `DATABASE_URL` = `jdbc:postgresql://postgres.railway.internal:5432/railway`
3. ✅ Cập nhật `REDIS_HOST` = `redis.railway.internal`
4. ✅ Restart backend

---

## Lưu Ý Quan Trọng

### Private Networking trên Railway:

- **Format:** `[service-name].railway.internal`
- **Ví dụ:**
  - PostgreSQL: `postgres.railway.internal`
  - Redis: `redis.railway.internal`
- **Lợi ích:**
  - Nhanh hơn (internal network)
  - An toàn hơn (không expose ra ngoài)
  - Không cần public URL

### DATABASE_URL Format:

- ✅ **Đúng:** `jdbc:postgresql://postgres.railway.internal:5432/railway`
- ❌ **Sai:** `postgresql://postgres.railway.internal:5432/railway` (thiếu `jdbc:`)
- ❌ **Sai:** `jdbc:postgresql://localhost:5432/railway` (dùng localhost)

---

## Checklist

### Frontend:
- [ ] Thư mục `frontend` có trong GitHub repo
- [ ] Root Directory = `frontend`
- [ ] `VITE_API_BASE_URL` đã thêm
- [ ] Đã redeploy

### Backend:
- [ ] `DATABASE_URL` dùng private networking
- [ ] `DATABASE_USER` đúng
- [ ] `DATABASE_PASSWORD` đúng
- [ ] `REDIS_HOST` dùng private networking
- [ ] `REDIS_PORT` đúng
- [ ] Đã restart backend

---

**Làm theo các bước trên và báo lại kết quả!**

