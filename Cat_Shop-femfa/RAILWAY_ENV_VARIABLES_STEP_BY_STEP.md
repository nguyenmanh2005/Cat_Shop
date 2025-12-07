# Hướng Dẫn Thêm Environment Variables trên Railway

## Bước 1: Lấy thông tin từ PostgreSQL Service

1. **Vào Railway Dashboard**
   - Truy cập: https://railway.app/dashboard
   - Đăng nhập vào tài khoản của bạn

2. **Click vào service "Postgres"** (service màu xanh lá)

3. **Click tab "Variables"** (ở trên cùng, bên cạnh "Settings")

4. **Tìm và copy các giá trị sau:**
   - `PGHOST` hoặc `POSTGRES_HOST` → Đây là hostname
   - `PGPORT` hoặc `POSTGRES_PORT` → Thường là `5432`
   - `PGUSER` hoặc `POSTGRES_USER` → Thường là `postgres`
   - `PGPASSWORD` hoặc `POSTGRES_PASSWORD` → Đây là password
   - `PGDATABASE` hoặc `POSTGRES_DB` → Tên database

   **HOẶC** vào tab **"Connect"** và copy connection string:
   ```
   postgresql://postgres:password@containers-us-west-2.railway.app:5432/railway
   ```

---

## Bước 2: Lấy thông tin từ Redis Service

1. **Click vào service "Redis"** (service màu đỏ)

2. **Click tab "Variables"**

3. **Tìm và copy các giá trị sau:**
   - `REDIS_HOST` → Hostname của Redis
   - `REDIS_PORT` → Thường là `6379`
   - `REDIS_PASSWORD` → Password (có thể để trống)

---

## Bước 3: Thêm Environment Variables cho Cat_Shop Service

1. **Click vào service "Cat_Shop"** (service backend của bạn)

2. **Click tab "Variables"** (ở trên cùng)

3. **Click nút "New Variable"** (màu xanh, góc trên bên phải)

4. **Thêm từng biến một:**

### Biến 1: DATABASE_URL

- **Name:** `DATABASE_URL`
- **Value:** 
  ```
  jdbc:postgresql://[PGHOST]:[PGPORT]/[PGDATABASE]
  ```
  
  **Ví dụ:**
  ```
  jdbc:postgresql://containers-us-west-2.railway.app:5432/railway
  ```
  
  **Cách lấy:**
  - Lấy từ PostgreSQL service → Variables → `PGHOST`, `PGPORT`, `PGDATABASE`
  - Hoặc từ connection string: `postgresql://user:pass@host:port/db` → Chuyển thành `jdbc:postgresql://host:port/db`

- **Click "Add"**

### Biến 2: DATABASE_USER

- **Name:** `DATABASE_USER`
- **Value:** Giá trị từ `PGUSER` hoặc `POSTGRES_USER` (thường là `postgres`)
- **Click "Add"**

### Biến 3: DATABASE_PASSWORD

- **Name:** `DATABASE_PASSWORD`
- **Value:** Giá trị từ `PGPASSWORD` hoặc `POSTGRES_PASSWORD`
- **Click "Add"**

### Biến 4: REDIS_HOST

- **Name:** `REDIS_HOST`
- **Value:** Giá trị từ Redis service → Variables → `REDIS_HOST`
- **Click "Add"**

### Biến 5: REDIS_PORT

- **Name:** `REDIS_PORT`
- **Value:** Giá trị từ Redis service → Variables → `REDIS_PORT` (thường là `6379`)
- **Click "Add"**

### Biến 6: REDIS_PASSWORD (nếu có)

- **Name:** `REDIS_PASSWORD`
- **Value:** Giá trị từ Redis service → Variables → `REDIS_PASSWORD` (có thể để trống)
- **Click "Add"**

---

## Bước 4: Cách Dễ Nhất - Dùng Railway Reference Variables

Railway có tính năng **"Reference Variable"** để tự động lấy giá trị từ service khác:

### Cho Database:

1. **Click "New Variable"**
2. **Name:** `DATABASE_URL`
3. **Value:** Click vào nút **"Reference Variable"** (hoặc icon link)
4. **Chọn:**
   - Service: `Postgres`
   - Variable: `DATABASE_URL` hoặc `POSTGRES_URL`
5. **Click "Add"**

**Lặp lại cho:**
- `DATABASE_USER` → Reference từ `Postgres` → `PGUSER`
- `DATABASE_PASSWORD` → Reference từ `Postgres` → `PGPASSWORD`

### Cho Redis:

1. **Click "New Variable"**
2. **Name:** `REDIS_HOST`
3. **Value:** Click **"Reference Variable"**
4. **Chọn:**
   - Service: `Redis`
   - Variable: `REDIS_HOST`
5. **Click "Add"**

**Lặp lại cho:**
- `REDIS_PORT` → Reference từ `Redis` → `REDIS_PORT`
- `REDIS_PASSWORD` → Reference từ `Redis` → `REDIS_PASSWORD` (nếu có)

---

## Bước 5: Kiểm tra và Redeploy

1. **Kiểm tra lại tất cả variables đã thêm:**
   - `DATABASE_URL`
   - `DATABASE_USER`
   - `DATABASE_PASSWORD`
   - `REDIS_HOST`
   - `REDIS_PORT`
   - `REDIS_PASSWORD` (nếu cần)

2. **Railway sẽ tự động redeploy** sau khi bạn thêm variables

3. **Đợi vài phút** và kiểm tra logs:
   - Vào service "Cat_Shop"
   - Tab "Deployments"
   - Xem deployment mới nhất
   - Tab "Logs" để xem có lỗi gì không

---

## Ví dụ Cụ Thể

### Nếu PostgreSQL Variables là:
```
PGHOST=containers-us-west-2.railway.app
PGPORT=5432
PGUSER=postgres
PGPASSWORD=abc123xyz
PGDATABASE=railway
```

### Thì thêm vào Cat_Shop:
```
DATABASE_URL=jdbc:postgresql://containers-us-west-2.railway.app:5432/railway
DATABASE_USER=postgres
DATABASE_PASSWORD=abc123xyz
```

### Nếu Redis Variables là:
```
REDIS_HOST=containers-us-west-2.railway.app
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Thì thêm vào Cat_Shop:
```
REDIS_HOST=containers-us-west-2.railway.app
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## Lưu Ý Quan Trọng

1. **DATABASE_URL phải có format:**
   ```
   jdbc:postgresql://host:port/database
   ```
   - KHÔNG có `postgresql://` ở đầu
   - Phải có `jdbc:postgresql://`

2. **Nếu dùng Reference Variables:**
   - Railway tự động cập nhật khi PostgreSQL/Redis thay đổi
   - Không cần copy/paste thủ công

3. **Sau khi thêm variables:**
   - Railway tự động redeploy
   - Đợi 2-3 phút để deploy xong
   - Kiểm tra logs để xem có lỗi không

---

## Nếu Vẫn Lỗi

Nếu sau khi thêm variables mà vẫn lỗi kết nối database:

1. **Kiểm tra lại format DATABASE_URL:**
   - Đúng: `jdbc:postgresql://host:port/db`
   - Sai: `postgresql://host:port/db` (thiếu `jdbc:`)

2. **Kiểm tra PostgreSQL service đang chạy:**
   - Vào service "Postgres"
   - Xem status phải là "Active"

3. **Kiểm tra logs chi tiết:**
   - Vào service "Cat_Shop" → "Logs"
   - Tìm dòng có lỗi connection
   - Copy lỗi và gửi cho tôi

---

## Tóm Tắt Nhanh

1. Vào **Postgres** → **Variables** → Copy `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
2. Vào **Redis** → **Variables** → Copy `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
3. Vào **Cat_Shop** → **Variables** → **New Variable**
4. Thêm:
   - `DATABASE_URL=jdbc:postgresql://[PGHOST]:[PGPORT]/[PGDATABASE]`
   - `DATABASE_USER=[PGUSER]`
   - `DATABASE_PASSWORD=[PGPASSWORD]`
   - `REDIS_HOST=[REDIS_HOST]`
   - `REDIS_PORT=[REDIS_PORT]`
   - `REDIS_PASSWORD=[REDIS_PASSWORD]`
5. Đợi Railway redeploy
6. Kiểm tra logs

---

**Chúc bạn thành công! 🚀**

