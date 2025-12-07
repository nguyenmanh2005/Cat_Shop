# 🔧 Hướng Dẫn Thêm Environment Variables

Hướng dẫn chi tiết cách thêm Environment Variables trên Railway, Render, và các platform khác.

---

## 🚂 Railway

### Cách 1: Qua Web Dashboard (Khuyến nghị)

#### Bước 1: Vào Settings

1. Đăng nhập Railway: https://railway.app/
2. Chọn **Project** của bạn
3. Chọn **Service** (backend hoặc frontend)
4. Click tab **Variables** (hoặc **Settings** → **Variables**)

#### Bước 2: Thêm Variables

1. Click nút **"New Variable"** hoặc **"Add Variable"**
2. Nhập:
   - **Name**: Tên biến (ví dụ: `FRONTEND_URL`)
   - **Value**: Giá trị (ví dụ: `https://catshop.duckdns.org`)
3. Click **"Add"** hoặc **"Save"**

#### Bước 3: Lưu Ý

- ✅ Variables sẽ tự động apply khi deploy
- ✅ Có thể thêm nhiều variables cùng lúc
- ✅ Có thể edit hoặc delete variables bất cứ lúc nào

### Cách 2: Qua Railway CLI

```bash
# Cài Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Thêm variable
railway variables set FRONTEND_URL=https://catshop.duckdns.org

# Xem tất cả variables
railway variables

# Xóa variable
railway variables unset FRONTEND_URL
```

### Cách 3: Qua File `railway.json` (Nâng cao)

Tạo file `railway.json` trong root project:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "java -jar app.jar",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Variables vẫn phải thêm qua dashboard hoặc CLI.

---

## 🎨 Render

### Cách 1: Qua Web Dashboard

#### Bước 1: Vào Environment

1. Đăng nhập Render: https://render.com/
2. Chọn **Service** của bạn
3. Click tab **Environment** (ở menu bên trái)

#### Bước 2: Thêm Variables

1. Scroll xuống phần **"Environment Variables"**
2. Click **"Add Environment Variable"**
3. Nhập:
   - **Key**: Tên biến (ví dụ: `FRONTEND_URL`)
   - **Value**: Giá trị (ví dụ: `https://catshop.duckdns.org`)
4. Click **"Save Changes"**

#### Bước 3: Deploy

- Render sẽ tự động redeploy khi bạn save variables
- Hoặc click **"Manual Deploy"** nếu cần

### Cách 2: Qua Render CLI

```bash
# Cài Render CLI
npm i -g render-cli

# Login
render login

# Thêm variable
render env:set FRONTEND_URL=https://catshop.duckdns.org

# Xem variables
render env:list

# Xóa variable
render env:unset FRONTEND_URL
```

---

## 🐳 Docker Compose (Local)

### Cách 1: File `.env`

Tạo file `.env` trong root project:

```env
# Database
DB_PASSWORD=your_secure_password_here

# Frontend
FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8080/api

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_site_key
CAPTCHA_SECRET=your_secret_key

# Email
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password

# SMS
SMS_ESMS_API_KEY=your_api_key
SMS_ESMS_SECRET_KEY=your_secret_key
```

Docker Compose sẽ tự động đọc file `.env`.

### Cách 2: Trong `docker-compose.yml`

```yaml
services:
  backend:
    environment:
      - FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}
      - SPRING_MAIL_USERNAME=${SPRING_MAIL_USERNAME}
      - SPRING_MAIL_PASSWORD=${SPRING_MAIL_PASSWORD}
```

---

## 📋 Danh Sách Environment Variables Cần Thêm

### Backend Variables

```env
# ===================== DATABASE =====================
SPRING_DATASOURCE_URL=${{Postgres.DATABASE_URL}}  # Railway tự động
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}   # Railway tự động
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}} # Railway tự động

# ===================== REDIS =====================
SPRING_DATA_REDIS_HOST=${{Redis.REDIS_HOST}}      # Railway tự động
SPRING_DATA_REDIS_PORT=${{Redis.REDIS_PORT}}      # Railway tự động
SPRING_DATA_REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}} # Railway tự động

# ===================== SPRING PROFILE =====================
SPRING_PROFILES_ACTIVE=prod

# ===================== FRONTEND URL =====================
FRONTEND_URL=https://catshop.duckdns.org

# ===================== EMAIL (Gmail SMTP) =====================
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password  # Gmail App Password

# ===================== GOOGLE reCAPTCHA =====================
CAPTCHA_SECRET=6LdS8B0sAAAAAOuNIjKpr4qWxvrBrD9tiXeopBZG
CAPTCHA_ENABLED=true

# ===================== SMS (ESMS) =====================
SMS_ENABLED=true
SMS_PROVIDER=esms
SMS_ESMS_API_KEY=2984573A04CE2FCD77298DAA314C22
SMS_ESMS_SECRET_KEY=5C0E9567B31A5282AA7898AB7A6B88
SMS_ESMS_BRAND_NAME=CAT_SHOP
```

### Frontend Variables (Build-time)

```env
# ===================== API URL =====================
VITE_API_BASE_URL=https://your-backend.railway.app/api

# ===================== reCAPTCHA =====================
VITE_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

---

## 🎯 Hướng Dẫn Từng Bước (Railway)

### Bước 1: Vào Service Settings

```
Railway Dashboard
  └─ Your Project
      └─ Backend Service
          └─ [Click] Variables Tab
```

### Bước 2: Thêm Variables

1. **Click "New Variable"**
2. **Nhập từng variable**:

   **Variable 1:**
   - Name: `SPRING_PROFILES_ACTIVE`
   - Value: `prod`
   - Click "Add"

   **Variable 2:**
   - Name: `FRONTEND_URL`
   - Value: `https://catshop.duckdns.org`
   - Click "Add"

   **Variable 3:**
   - Name: `SPRING_MAIL_USERNAME`
   - Value: `your_email@gmail.com`
   - Click "Add"

   ... (tiếp tục với các variables khác)

### Bước 3: Sử Dụng Railway Variables

Railway có các **built-in variables** tự động:

```env
# Database (tự động khi add PostgreSQL)
${{Postgres.DATABASE_URL}}
${{Postgres.PGUSER}}
${{Postgres.PGPASSWORD}}

# Redis (tự động khi add Redis)
${{Redis.REDIS_HOST}}
${{Redis.REDIS_PORT}}
${{Redis.REDIS_PASSWORD}}
```

**Cách dùng:**
- Trong Railway dashboard, khi thêm variable, dùng format: `${{ServiceName.VARIABLE}}`
- Railway sẽ tự động thay thế bằng giá trị thật

### Bước 4: Verify

1. Xem lại tất cả variables đã thêm
2. Click **"Deploy"** hoặc đợi auto-deploy
3. Xem logs để kiểm tra variables đã được load chưa

---

## 🔍 Kiểm Tra Variables

### Railway

```bash
# Xem variables qua CLI
railway variables

# Hoặc xem trong dashboard
# Settings → Variables
```

### Render

```bash
# Xem variables qua CLI
render env:list

# Hoặc xem trong dashboard
# Service → Environment
```

### Docker Compose

```bash
# Xem variables
docker compose config

# Test với một service
docker compose run backend env
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Security

- ❌ **KHÔNG** commit file `.env` lên Git
- ✅ Thêm `.env` vào `.gitignore`
- ✅ Dùng secrets management của platform
- ✅ Rotate passwords định kỳ

### 2. Build-time vs Runtime

**Frontend (Vite):**
- Variables phải bắt đầu bằng `VITE_`
- Variables được embed vào code khi build
- Cần rebuild khi thay đổi

**Backend (Spring Boot):**
- Variables được đọc khi runtime
- Không cần rebuild khi thay đổi
- Chỉ cần restart

### 3. Railway Built-in Variables

Railway tự động tạo variables khi bạn add services:
- `${{Postgres.DATABASE_URL}}` - Connection string đầy đủ
- `${{Postgres.PGUSER}}` - Username
- `${{Postgres.PGPASSWORD}}` - Password
- `${{Redis.REDIS_HOST}}` - Redis host
- `${{Redis.REDIS_PORT}}` - Redis port

**Không cần tạo thủ công!**

---

## 📸 Hình Ảnh Minh Họa

### Railway Dashboard:

```
┌─────────────────────────────────────────┐
│  Railway - Backend Service              │
├─────────────────────────────────────────┤
│  [Overview] [Variables] [Settings]     │
│                                         │
│  Environment Variables                  │
│  ────────────────────────────────────   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Name: SPRING_PROFILES_ACTIVE    │   │
│  │ Value: prod                     │   │
│  │ [Edit] [Delete]                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Name: FRONTEND_URL              │   │
│  │ Value: https://catshop...       │   │
│  │ [Edit] [Delete]                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [+ New Variable]                      │
└─────────────────────────────────────────┘
```

---

## 🎯 Quick Reference

### Railway

| Action | Cách Làm |
|--------|----------|
| Thêm variable | Dashboard → Service → Variables → New Variable |
| Edit variable | Click vào variable → Edit → Save |
| Delete variable | Click vào variable → Delete |
| Xem variables | Dashboard → Service → Variables |
| Dùng built-in | `${{ServiceName.VARIABLE}}` |

### Render

| Action | Cách Làm |
|--------|----------|
| Thêm variable | Dashboard → Service → Environment → Add Variable |
| Edit variable | Click vào variable → Edit → Save |
| Delete variable | Click vào variable → Delete |
| Xem variables | Dashboard → Service → Environment |

### Docker Compose

| Action | Cách Làm |
|--------|----------|
| Thêm variable | Tạo file `.env` trong root |
| Xem variables | `docker compose config` |
| Test variables | `docker compose run service env` |

---

## ✅ Checklist

- [ ] Đã thêm tất cả backend variables
- [ ] Đã thêm tất cả frontend variables (build-time)
- [ ] Đã verify variables đã được load
- [ ] Đã test ứng dụng hoạt động
- [ ] Đã kiểm tra logs không có lỗi

---

**Chúc bạn setup thành công! 🚀**

