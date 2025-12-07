# 🚂 Hướng Dẫn Railway - Từng Bước Chi Tiết

Hướng dẫn từng bước deploy Cat Shop trên Railway.

---

## 📍 Bước 1: Tạo Project Mới

### Từ Dashboard:

1. **Click nút "New"** (màu tím, có dấu +) ở góc trên bên phải
2. Chọn **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Chọn repository **"Cat_Shop-femfa"** (hoặc tên repo của bạn)
5. Railway sẽ tự động detect và bắt đầu deploy

**Hoặc:**

1. Click **"New"** → **"Empty Project"**
2. Sau đó add service từ GitHub

---

## 📍 Bước 2: Chọn Project Hiện Có (Nếu Muốn Dùng Lại)

Nếu bạn muốn dùng project hiện có:

1. **Click vào project** (ví dụ: "grand-youthfulness" hoặc "nurturing-sparkle")
2. Bạn sẽ thấy danh sách services
3. Click **"New"** → **"GitHub Repo"** để thêm service mới

---

## 📍 Bước 3: Railway Tự Động Detect

Sau khi chọn repo, Railway sẽ:

1. ✅ Tự động detect `docker-compose.yml`
2. ✅ Tự động detect Dockerfile
3. ✅ Bắt đầu build
4. ✅ Tạo services (backend, frontend, postgres, redis)

**Bạn chỉ cần đợi build xong!**

---

## 📍 Bước 4: Add Database (PostgreSQL)

Sau khi build xong:

1. Trong project, click **"New"** (màu tím)
2. Chọn **"Database"** → **"Add PostgreSQL"**
3. Railway tự động tạo PostgreSQL service
4. Railway tự động tạo connection string

**Lưu ý**: Railway tự động tạo variables:
- `${{Postgres.DATABASE_URL}}`
- `${{Postgres.PGUSER}}`
- `${{Postgres.PGPASSWORD}}`

---

## 📍 Bước 5: Add Redis

1. Click **"New"** (màu tím)
2. Chọn **"Database"** → **"Add Redis"**
3. Railway tự động tạo Redis service
4. Railway tự động tạo variables:
   - `${{Redis.REDIS_HOST}}`
   - `${{Redis.REDIS_PORT}}`

---

## 📍 Bước 6: Cấu Hình Environment Variables

### 6.1. Vào Backend Service

1. Click vào **Backend service** (thường tên là "backend" hoặc tên repo)
2. Click tab **"Variables"** (hoặc **Settings** → **Variables**)

### 6.2. Thêm Variables

Click **"New Variable"** và thêm từng variable:

**Variable 1:**
- Name: `SPRING_PROFILES_ACTIVE`
- Value: `prod`
- Click **"Add"**

**Variable 2:**
- Name: `SPRING_DATASOURCE_URL`
- Value: `${{Postgres.DATABASE_URL}}`
- Click **"Add"**

**Variable 3:**
- Name: `SPRING_DATASOURCE_USERNAME`
- Value: `${{Postgres.PGUSER}}`
- Click **"Add"**

**Variable 4:**
- Name: `SPRING_DATASOURCE_PASSWORD`
- Value: `${{Postgres.PGPASSWORD}}`
- Click **"Add"**

**Variable 5:**
- Name: `SPRING_DATA_REDIS_HOST`
- Value: `${{Redis.REDIS_HOST}}`
- Click **"Add"**

**Variable 6:**
- Name: `SPRING_DATA_REDIS_PORT`
- Value: `${{Redis.REDIS_PORT}}`
- Click **"Add"**

**Variable 7:**
- Name: `FRONTEND_URL`
- Value: `https://catshop.duckdns.org` (hoặc domain của bạn)
- Click **"Add"**

**Variable 8:**
- Name: `SPRING_MAIL_USERNAME`
- Value: `your_email@gmail.com`
- Click **"Add"**

**Variable 9:**
- Name: `SPRING_MAIL_PASSWORD`
- Value: `your_gmail_app_password`
- Click **"Add"**

**Variable 10:**
- Name: `CAPTCHA_SECRET`
- Value: `your_recaptcha_secret_key`
- Click **"Add"**

**Variable 11:**
- Name: `CAPTCHA_ENABLED`
- Value: `true`
- Click **"Add"**

**Variable 12:**
- Name: `SMS_ENABLED`
- Value: `true`
- Click **"Add"`

**Variable 13:**
- Name: `SMS_PROVIDER`
- Value: `esms`
- Click **"Add"`

**Variable 14:**
- Name: `SMS_ESMS_API_KEY`
- Value: `2984573A04CE2FCD77298DAA314C22`
- Click **"Add"**

**Variable 15:**
- Name: `SMS_ESMS_SECRET_KEY`
- Value: `5C0E9567B31A5282AA7898AB7A6B88`
- Click **"Add"**

**Variable 16:**
- Name: `SMS_ESMS_BRAND_NAME`
- Value: `CAT_SHOP`
- Click **"Add"**

---

## 📍 Bước 7: Cấu Hình Frontend Variables

1. Click vào **Frontend service**
2. Click tab **"Variables"**
3. Thêm variables:

**Variable 1:**
- Name: `VITE_API_BASE_URL`
- Value: `https://your-backend.railway.app/api` (thay bằng URL backend của bạn)
- Click **"Add"**

**Variable 2:**
- Name: `VITE_RECAPTCHA_SITE_KEY`
- Value: `your_recaptcha_site_key`
- Click **"Add"**

**Lưu ý**: Frontend cần rebuild sau khi thêm variables!

---

## 📍 Bước 8: Custom Domain (Tùy Chọn)

### 8.1. Vào Service Settings

1. Click vào **Backend service**
2. Click tab **"Settings"** (hoặc **Networking**)
3. Scroll xuống phần **"Custom Domain"**

### 8.2. Add Domain

1. Click **"Add Domain"**
2. Nhập domain: `api.catshop.duckdns.org` (hoặc domain của bạn)
3. Railway hiển thị **CNAME record**
4. Copy CNAME record

### 8.3. Update DNS

1. Vào DuckDNS: https://www.duckdns.org/
2. Chọn domain của bạn
3. Update với CNAME từ Railway
4. Save

---

## 📍 Bước 9: Kiểm Tra Deploy

### 9.1. Xem Logs

1. Click vào service
2. Click tab **"Deployments"**
3. Click vào deployment mới nhất
4. Xem logs để kiểm tra

### 9.2. Test API

1. Railway tự động tạo URL: `https://your-app.railway.app`
2. Test: `curl https://your-backend.railway.app/api/health`
3. Hoặc mở browser: `https://your-backend.railway.app/api/health`

---

## 📍 Bước 10: Xem Tất Cả Services

Trong project dashboard, bạn sẽ thấy:

```
┌─────────────────────────────────────┐
│  Your Project                       │
├─────────────────────────────────────┤
│  📦 backend                         │
│     Status: Running                 │
│     URL: https://backend.railway...│
│                                     │
│  📦 frontend                        │
│     Status: Running                 │
│     URL: https://frontend.railway..│
│                                     │
│  🗄️  postgres                       │
│     Status: Running                 │
│                                     │
│  🔴 redis                           │
│     Status: Running                 │
└─────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] Đã tạo project mới hoặc chọn project hiện có
- [ ] Đã deploy từ GitHub
- [ ] Đã add PostgreSQL
- [ ] Đã add Redis
- [ ] Đã thêm tất cả backend variables
- [ ] Đã thêm frontend variables
- [ ] Đã test API hoạt động
- [ ] Đã test Frontend hoạt động

---

## 🆘 Troubleshooting

### Q: Không thấy nút "New"?
**A**: Đảm bảo bạn đã chọn project (click vào project trước)

### Q: Railway không detect Docker?
**A**: 
1. Kiểm tra có file `docker-compose.yml` trong root
2. Hoặc có `Dockerfile` trong `back-end/` và `frontend/`
3. Push code lên GitHub

### Q: Build failed?
**A**: 
1. Xem logs trong tab "Deployments"
2. Kiểm tra Dockerfile có đúng không
3. Kiểm tra environment variables đã đủ chưa

### Q: Database connection failed?
**A**: 
1. Kiểm tra đã add PostgreSQL service chưa
2. Kiểm tra `SPRING_DATASOURCE_URL` đã set chưa
3. Kiểm tra format: `${{Postgres.DATABASE_URL}}`

---

**Chúc bạn deploy thành công! 🚀**

