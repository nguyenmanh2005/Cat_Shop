# ⚡ Deploy Miễn Phí - Hướng Dẫn Nhanh 10 Phút

## 🎯 Mục Tiêu: Deploy 100% Free

- ✅ Domain: `catshop.duckdns.org` (Free)
- ✅ Hosting: Railway (Free $5/tháng)
- ✅ Database: Railway PostgreSQL (Free)
- ✅ Redis: Railway Redis (Free)
- ✅ SSL: Tự động (Free)

**Tổng chi phí: $0/năm** 💰

---

## 🚀 Bước 1: Đăng Ký Domain Free (2 phút)

### DuckDNS (Khuyến nghị)

1. Vào: https://www.duckdns.org/
2. Sign in with GitHub/Google
3. Tạo subdomain: `catshop` → `catshop.duckdns.org`
4. Lấy token (sẽ dùng sau)

✅ **Xong!** Domain: `catshop.duckdns.org`

---

## 🚀 Bước 2: Deploy Trên Railway (5 phút)

### 2.1. Đăng Ký Railway

1. Vào: https://railway.app/
2. Sign in with GitHub
3. Xác thực email

### 2.2. Deploy Backend

1. **New Project** → **Deploy from GitHub**
2. Chọn repository `Cat_Shop-femfa`
3. Railway tự động detect Docker
4. Chờ build xong

### 2.3. Add Database

1. **Add Service** → **Database** → **PostgreSQL**
2. Railway tự tạo database
3. Lấy connection string từ Variables

### 2.4. Add Redis

1. **Add Service** → **Database** → **Redis**
2. Railway tự tạo Redis

### 2.5. Cấu Hình Environment Variables

Vào **Settings** → **Variables**, thêm:

```env
# Database (Railway tự động)
SPRING_DATASOURCE_URL=${{Postgres.DATABASE_URL}}
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}

# Redis (Railway tự động)
SPRING_DATA_REDIS_HOST=${{Redis.REDIS_HOST}}
SPRING_DATA_REDIS_PORT=${{Redis.REDIS_PORT}}

# URLs
FRONTEND_URL=https://catshop.duckdns.org
VITE_API_BASE_URL=https://your-backend.railway.app/api

# reCAPTCHA (lấy từ Google)
VITE_RECAPTCHA_SITE_KEY=your_site_key
CAPTCHA_SECRET=your_secret_key

# Email (Gmail App Password)
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password

# SMS (ESMS)
SMS_ESMS_API_KEY=your_api_key
SMS_ESMS_SECRET_KEY=your_secret_key

# Profile
SPRING_PROFILES_ACTIVE=prod
```

### 2.6. Custom Domain

1. Vào **Settings** → **Networking**
2. **Add Domain** → Nhập `catshop.duckdns.org`
3. Railway hiển thị CNAME record
4. Copy CNAME

### 2.7. Cập Nhật DNS

1. Vào DuckDNS: https://www.duckdns.org/
2. Chọn domain `catshop`
3. Update với CNAME từ Railway
4. Save

---

## 🚀 Bước 3: Deploy Frontend (3 phút)

### Option A: Cùng Railway (Khuyến nghị)

1. Trong cùng project Railway
2. **Add Service** → **GitHub Repo** → Chọn lại repo
3. Railway detect frontend folder
4. Set **Root Directory**: `frontend`
5. Set **Build Command**: `npm run build`
6. Set **Start Command**: `npm run preview` (hoặc dùng nginx)
7. Thêm Environment Variables:
   ```env
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   VITE_RECAPTCHA_SITE_KEY=your_site_key
   ```
8. Deploy!

### Option B: Render (Nếu Railway hết free tier)

1. Đăng ký: https://render.com/
2. **New** → **Static Site**
3. Connect GitHub
4. Set:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Add Environment Variables
6. Deploy!

---

## ✅ Kiểm Tra

```bash
# Test Backend
curl https://your-backend.railway.app/api/health

# Test Frontend
# Mở browser: https://catshop.duckdns.org
```

---

## 📝 Checklist

- [ ] Đã đăng ký DuckDNS domain
- [ ] Đã deploy backend trên Railway
- [ ] Đã add PostgreSQL
- [ ] Đã add Redis
- [ ] Đã cấu hình Environment Variables
- [ ] Đã trỏ domain về Railway
- [ ] Đã test API
- [ ] Đã test Frontend

---

## 🎉 Hoàn Thành!

**Truy cập:**
- Frontend: https://catshop.duckdns.org
- Backend API: https://your-backend.railway.app/api

**Chi phí: $0/năm** 🎊

---

## 💡 Tips

1. **Monitor Usage**: Vào Railway dashboard để xem usage
2. **Pause Services**: Tắt services khi không dùng để tiết kiệm
3. **Backup**: Railway tự động backup database
4. **Logs**: Xem logs trong Railway dashboard

---

## 🆘 Troubleshooting

### Lỗi: Out of credits
→ Chuyển sang Render hoặc Fly.io

### Lỗi: Database connection failed
→ Kiểm tra `SPRING_DATASOURCE_URL` trong Variables

### Lỗi: Domain not working
→ Kiểm tra CNAME record trong DuckDNS

---

Xem hướng dẫn chi tiết trong `FREE_DEPLOY_GUIDE.md`!

