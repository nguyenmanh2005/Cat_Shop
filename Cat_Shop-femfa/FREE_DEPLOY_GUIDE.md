# 🆓 Hướng Dẫn Deploy Miễn Phí Hoàn Toàn

Hướng dẫn deploy Cat Shop **100% miễn phí** - không tốn một xu nào! 💰

## 📋 Tổng Quan

| Dịch Vụ | Tùy Chọn Miễn Phí | Link |
|---------|------------------|------|
| **Hosting** | Railway, Render, Fly.io | ✅ Free tier |
| **Database** | Supabase, ElephantSQL | ✅ Free tier |
| **Redis** | Upstash, Redis Cloud | ✅ Free tier |
| **Domain** | Freenom, No-IP, DuckDNS | ✅ Free subdomain |
| **SSL** | Let's Encrypt | ✅ Hoàn toàn miễn phí |

---

## 🌐 1. Domain Miễn Phí

### Option 1: Freenom (Free .tk, .ml, .ga, .cf, .gq)

1. **Đăng ký**: https://www.freenom.com/
2. **Tìm domain**: Search domain bạn muốn (ví dụ: `catshop`)
3. **Chọn extension**: .tk, .ml, .ga, .cf, .gq (miễn phí)
4. **Đăng ký**: Tạo tài khoản và claim domain
5. **Quản lý DNS**: Vào "My Domains" → "Manage Domain" → "Management Tools" → "Nameservers"

⚠️ **Lưu ý**: Freenom đôi khi không ổn định, có thể bị suspend nếu không dùng.

### Option 2: No-IP (Free Subdomain)

1. **Đăng ký**: https://www.noip.com/
2. **Tạo hostname**: Chọn subdomain (ví dụ: `catshop.ddns.net`)
3. **Miễn phí**: Cần xác nhận mỗi 30 ngày
4. **Dynamic DNS**: Tự động update IP

✅ **Ưu điểm**: Ổn định hơn Freenom

### Option 3: DuckDNS (Free Subdomain)

1. **Đăng ký**: https://www.duckdns.org/
2. **Tạo subdomain**: `catshop.duckdns.org`
3. **Hoàn toàn miễn phí**: Không cần xác nhận
4. **API**: Dễ dàng update IP tự động

✅ **Khuyến nghị**: Dễ dùng nhất!

### Option 4: Cloudflare Tunnel (Free + Custom Domain)

1. **Đăng ký**: https://www.cloudflare.com/
2. **Thêm domain**: Mua domain rẻ (~$10/năm) hoặc dùng domain free
3. **Cloudflare Tunnel**: Tạo tunnel miễn phí
4. **Kết quả**: Domain đẹp + SSL tự động

✅ **Tốt nhất**: Nếu có domain (dù rẻ)

---

## 🚀 2. Hosting Miễn Phí

### Option 1: Railway (Khuyến nghị ⭐)

**Free Tier:**
- ✅ $5 credit/tháng (đủ cho app nhỏ)
- ✅ PostgreSQL miễn phí
- ✅ Redis miễn phí
- ✅ Auto-deploy từ GitHub
- ✅ SSL tự động

**Cách deploy:**

1. Đăng ký: https://railway.app/ (dùng GitHub)
2. New Project → Deploy from GitHub
3. Chọn repository `Cat_Shop-femfa`
4. Railway tự động detect Docker
5. Add PostgreSQL service
6. Add Redis service
7. Thêm Environment Variables
8. Deploy!

**Environment Variables cần set:**

```env
DB_PASSWORD=auto_generated_by_railway
SPRING_DATASOURCE_URL=${{Postgres.DATABASE_URL}}
SPRING_DATA_REDIS_HOST=${{Redis.REDIS_HOST}}
SPRING_DATA_REDIS_PORT=${{Redis.REDIS_PORT}}
FRONTEND_URL=https://your-app.railway.app
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

### Option 2: Render

**Free Tier:**
- ✅ 750 giờ/tháng
- ✅ PostgreSQL miễn phí (90 ngày)
- ✅ SSL tự động
- ✅ Auto-deploy từ GitHub

**Cách deploy:**

1. Đăng ký: https://render.com/
2. New → Web Service (từ Docker)
3. Connect GitHub repo
4. Add PostgreSQL Database
5. Thêm Environment Variables
6. Deploy!

### Option 3: Fly.io

**Free Tier:**
- ✅ 3 VMs miễn phí
- ✅ 160GB outbound data
- ✅ PostgreSQL (có phí nhỏ)
- ✅ Redis (có phí nhỏ)

**Cách deploy:**

1. Đăng ký: https://fly.io/
2. Cài flyctl: `curl -L https://fly.io/install.sh | sh`
3. Login: `fly auth login`
4. Deploy: `fly launch`
5. Add PostgreSQL: `fly postgres create`
6. Add Redis: `fly redis create`

---

## 🗄️ 3. Database Miễn Phí

### Option 1: Supabase (Khuyến nghị ⭐)

**Free Tier:**
- ✅ 500MB database
- ✅ 2GB bandwidth
- ✅ PostgreSQL 15
- ✅ REST API tự động
- ✅ Real-time subscriptions

**Cách setup:**

1. Đăng ký: https://supabase.com/
2. New Project
3. Lấy connection string:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
   ```
4. Cập nhật `SPRING_DATASOURCE_URL` trong Railway/Render

### Option 2: ElephantSQL

**Free Tier:**
- ✅ 20MB database
- ✅ PostgreSQL 15
- ✅ Đủ cho app nhỏ

**Cách setup:**

1. Đăng ký: https://www.elephantsql.com/
2. Create Instance → Tiny Turtle (Free)
3. Lấy connection string
4. Cập nhật trong environment variables

### Option 3: Railway PostgreSQL (Tích hợp sẵn)

- ✅ Tự động tạo khi add PostgreSQL service
- ✅ Không cần setup riêng
- ✅ Connection string tự động

---

## 🔴 4. Redis Miễn Phí

### Option 1: Upstash (Khuyến nghị ⭐)

**Free Tier:**
- ✅ 10,000 commands/ngày
- ✅ 256MB storage
- ✅ Global replication
- ✅ REST API

**Cách setup:**

1. Đăng ký: https://upstash.com/
2. Create Database → Free tier
3. Lấy Redis URL:
   ```
   redis://default:[PASSWORD]@[HOST]:6379
   ```
4. Cập nhật trong environment variables

### Option 2: Redis Cloud

**Free Tier:**
- ✅ 30MB storage
- ✅ 30 connections
- ✅ Đủ cho app nhỏ

**Cách setup:**

1. Đăng ký: https://redis.com/try-free/
2. Create Database → Free tier
3. Lấy connection string
4. Cập nhật trong environment variables

### Option 3: Railway Redis (Tích hợp sẵn)

- ✅ Tự động tạo khi add Redis service
- ✅ Không cần setup riêng

---

## 🔒 5. SSL Miễn Phí

Tất cả các platform trên đều tự động cung cấp SSL miễn phí:
- ✅ Railway: SSL tự động
- ✅ Render: SSL tự động
- ✅ Fly.io: SSL tự động
- ✅ Cloudflare: SSL tự động

**Không cần cài đặt gì thêm!**

---

## 📝 Hướng Dẫn Deploy Hoàn Chỉnh (100% Free)

### Bước 1: Chuẩn Bị Domain Free

```bash
# Option A: DuckDNS (Khuyến nghị)
1. Đăng ký: https://www.duckdns.org/
2. Tạo subdomain: catshop.duckdns.org
3. Lấy token

# Option B: No-IP
1. Đăng ký: https://www.noip.com/
2. Tạo hostname: catshop.ddns.net
```

### Bước 2: Deploy Trên Railway

1. **Đăng ký Railway**: https://railway.app/
   - Dùng GitHub account
   - Xác thực email

2. **Tạo Project**:
   - New Project → Deploy from GitHub
   - Chọn repository `Cat_Shop-femfa`
   - Railway tự động detect `docker-compose.yml`

3. **Add PostgreSQL**:
   - Add Service → Database → PostgreSQL
   - Railway tự tạo database

4. **Add Redis**:
   - Add Service → Database → Redis
   - Railway tự tạo Redis

5. **Cấu Hình Environment Variables**:

Vào Settings → Variables, thêm:

```env
# Database (Railway tự động tạo)
SPRING_DATASOURCE_URL=${{Postgres.DATABASE_URL}}
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}

# Redis (Railway tự động tạo)
SPRING_DATA_REDIS_HOST=${{Redis.REDIS_HOST}}
SPRING_DATA_REDIS_PORT=${{Redis.REDIS_PORT}}
SPRING_DATA_REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}

# Frontend URL (thay bằng domain của bạn)
FRONTEND_URL=https://catshop.duckdns.org
VITE_API_BASE_URL=https://catshop-backend.railway.app/api

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_site_key
CAPTCHA_SECRET=your_secret_key

# Email
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password

# SMS
SMS_ESMS_API_KEY=your_api_key
SMS_ESMS_SECRET_KEY=your_secret_key

# Spring Profile
SPRING_PROFILES_ACTIVE=prod
```

6. **Deploy**:
   - Railway tự động deploy khi push code
   - Hoặc click "Deploy" trong dashboard

7. **Lấy URL**:
   - Railway tự động tạo URL: `https://your-app.railway.app`
   - Có thể custom domain trong Settings

### Bước 3: Trỏ Domain Về Railway

**Nếu dùng DuckDNS:**

1. Vào Settings của service trên Railway
2. Add Custom Domain: `catshop.duckdns.org`
3. Railway sẽ hiển thị CNAME record
4. Vào DuckDNS → Update DNS với CNAME

**Nếu dùng No-IP:**

1. Tương tự như DuckDNS
2. Vào No-IP → DNS Settings
3. Thêm CNAME record

### Bước 4: Kiểm Tra

```bash
# Test API
curl https://your-backend.railway.app/api/health

# Test Frontend
# Mở browser: https://catshop.duckdns.org
```

---

## 💡 Tips Tiết Kiệm

### 1. Tối Ưu Railway Free Tier

- ✅ Dùng PostgreSQL và Redis của Railway (tích hợp sẵn)
- ✅ Tắt services khi không dùng (Railway pause)
- ✅ Monitor usage trong dashboard

### 2. Tối Ưu Database

- ✅ Dùng connection pooling
- ✅ Index database đúng cách
- ✅ Cleanup old data định kỳ

### 3. Tối Ưu Redis

- ✅ Set TTL cho keys
- ✅ Dùng Redis chỉ cho cache quan trọng
- ✅ Monitor memory usage

---

## 🎯 Kết Luận

**Với setup này, bạn có:**
- ✅ Domain miễn phí (DuckDNS/No-IP)
- ✅ Hosting miễn phí (Railway)
- ✅ Database miễn phí (Railway PostgreSQL)
- ✅ Redis miễn phí (Railway Redis)
- ✅ SSL miễn phí (Railway tự động)
- ✅ **Tổng chi phí: $0/năm** 🎉

**Lưu ý:**
- Railway free tier có giới hạn, nhưng đủ cho app nhỏ
- Nếu vượt quá, có thể chuyển sang Render hoặc Fly.io
- Database và Redis free tier đủ cho development và app nhỏ

---

## 📚 Tài Liệu Tham Khảo

- Railway Docs: https://docs.railway.app/
- DuckDNS: https://www.duckdns.org/
- Supabase: https://supabase.com/docs
- Upstash: https://docs.upstash.com/

**Chúc bạn deploy thành công với $0! 🚀**

