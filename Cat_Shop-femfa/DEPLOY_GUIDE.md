# 🚀 Hướng Dẫn Deploy Cat Shop Lên Production

Hướng dẫn chi tiết để deploy ứng dụng Cat Shop (Backend + Frontend + PostgreSQL + Redis) lên mạng.

## 📋 Mục Lục

1. [Chuẩn Bị](#chuẩn-bị)
2. [Các Platform Đề Xuất](#các-platform-đề-xuất)
3. [Deploy Trên VPS (DigitalOcean/AWS EC2)](#deploy-trên-vps)
4. [Deploy Trên Cloud Platform](#deploy-trên-cloud-platform)
5. [Cấu Hình Domain & SSL](#cấu-hình-domain--ssl)
6. [Environment Variables](#environment-variables)
7. [Kiểm Tra & Troubleshooting](#kiểm-tra--troubleshooting)

---

## 🎯 Chuẩn Bị

### Yêu Cầu Hệ Thống

- **VPS/Server**: Tối thiểu 2GB RAM, 2 CPU cores, 20GB SSD
- **Domain**: (Tùy chọn) Để truy cập qua domain thay vì IP
- **SSH Access**: Quyền truy cập vào server

### Công Cụ Cần Thiết

- Git
- Docker & Docker Compose
- SSH client

---

## 🌐 Các Platform Đề Xuất

### 1. **VPS (Virtual Private Server)**
- ✅ **DigitalOcean**: $6/tháng (1GB RAM) - $12/tháng (2GB RAM)
- ✅ **AWS EC2**: Pay-as-you-go, ~$10-15/tháng
- ✅ **Vultr**: $6/tháng (1GB RAM)
- ✅ **Linode**: $12/tháng (2GB RAM)
- ✅ **Hetzner**: €4.15/tháng (2GB RAM) - Rẻ nhất

### 2. **Cloud Platform (Managed Services)**
- ✅ **Railway**: Free tier, dễ deploy
- ✅ **Render**: Free tier cho PostgreSQL
- ✅ **Fly.io**: Free tier
- ✅ **Heroku**: Có phí, dễ sử dụng

### 3. **Database & Redis (Managed)**
- ✅ **Supabase**: PostgreSQL miễn phí
- ✅ **ElephantSQL**: PostgreSQL miễn phí (20MB)
- ✅ **Upstash**: Redis miễn phí
- ✅ **Redis Cloud**: Redis miễn phí (30MB)

---

## 🖥️ Deploy Trên VPS

### Bước 1: Chuẩn Bị VPS

#### 1.1. Tạo VPS trên DigitalOcean

1. Đăng ký tại: https://www.digitalocean.com/
2. Tạo Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic - $12/tháng (2GB RAM, 1 vCPU)
   - **Region**: Singapore (gần Việt Nam nhất)
   - **Authentication**: SSH keys (khuyến nghị) hoặc Password
3. Ghi lại **IP Address** của VPS

#### 1.2. Kết Nối SSH

```bash
# Windows (PowerShell/CMD)
ssh root@YOUR_VPS_IP

# Hoặc dùng PuTTY trên Windows
```

#### 1.3. Cài Đặt Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài Docker Compose
sudo apt install docker-compose-plugin -y

# Kiểm tra
docker --version
docker compose version

# Thêm user vào docker group (nếu không dùng root)
sudo usermod -aG docker $USER
```

### Bước 2: Clone Code Lên Server

```bash
# Cài Git
sudo apt install git -y

# Clone repository
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/Cat_Shop-femfa.git
cd Cat_Shop-femfa

# Hoặc upload code qua SCP/SFTP
```

### Bước 3: Tạo File Environment

```bash
# Tạo file .env
nano .env
```

Thêm nội dung sau:

```env
# Database
DB_PASSWORD=your_secure_password_here_change_this

# Redis (nếu có password)
REDIS_PASSWORD=

# Frontend URL (thay bằng domain của bạn)
FRONTEND_URL=https://yourdomain.com

# API URL cho frontend
VITE_API_BASE_URL=https://api.yourdomain.com/api

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

Lưu file: `Ctrl + O`, `Enter`, `Ctrl + X`

### Bước 4: Cấu Hình Backend

Tạo file `back-end/src/main/resources/application-prod.properties`:

```bash
nano back-end/src/main/resources/application-prod.properties
```

```properties
spring.application.name=catshop

# ===================== DATABASE (PostgreSQL) =====================
spring.datasource.url=jdbc:postgresql://postgres:5432/catshop
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# ===================== REDIS =====================
spring.data.redis.host=redis
spring.data.redis.port=6379
spring.data.redis.password=${REDIS_PASSWORD:}
spring.data.redis.timeout=60000

# ===================== EMAIL (GMAIL SMTP) =====================
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# ===================== FRONTEND URL =====================
frontend.url=${FRONTEND_URL}

# ===================== GOOGLE reCAPTCHA =====================
captcha.secret=your_recaptcha_secret_key
captcha.enabled=true

# ===================== SMS (ESMS) =====================
sms.enabled=true
sms.provider=esms
sms.esms.api-key=your_esms_api_key
sms.esms.secret-key=your_esms_secret_key
sms.esms.brand-name=CAT_SHOP

# ===================== LOGGING =====================
logging.level.root=INFO
logging.level.com.catshop=INFO
```

### Bước 5: Cập Nhật Docker Compose

Cập nhật `docker-compose.yml` để dùng profile production:

```yaml
backend:
  environment:
    SPRING_PROFILES_ACTIVE: prod
    # ... các biến khác
```

### Bước 6: Build & Deploy

```bash
# Build và chạy tất cả services
docker compose up -d --build

# Xem logs
docker compose logs -f

# Kiểm tra containers
docker compose ps
```

### Bước 7: Mở Firewall

```bash
# Mở port 80 (HTTP), 443 (HTTPS), 8080 (Backend - tạm thời)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw enable
```

---

## ☁️ Deploy Trên Cloud Platform

### Option 1: Railway (Dễ nhất)

1. Đăng ký: https://railway.app/
2. Tạo project mới
3. Deploy từ GitHub:
   - Connect GitHub repo
   - Railway tự động detect Docker
4. Thêm PostgreSQL:
   - Add PostgreSQL service
   - Railway tự tạo connection string
5. Thêm Redis:
   - Add Redis service
6. Cấu hình Environment Variables
7. Deploy!

### Option 2: Render

1. Đăng ký: https://render.com/
2. Tạo Web Service từ Docker
3. Thêm PostgreSQL Database
4. Thêm Redis (nếu cần)
5. Cấu hình Environment Variables
6. Deploy!

---

## 🔒 Cấu Hình Domain & SSL

### Bước 1: Trỏ Domain Về VPS

1. Vào DNS settings của domain provider
2. Thêm A record:
   - **Type**: A
   - **Name**: @ (hoặc www)
   - **Value**: IP của VPS
   - **TTL**: 3600

### Bước 2: Cài Nginx Reverse Proxy

```bash
# Cài Nginx
sudo apt install nginx -y

# Tạo config
sudo nano /etc/nginx/sites-available/catshop
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/catshop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Bước 3: Cài SSL với Let's Encrypt

```bash
# Cài Certbot
sudo apt install certbot python3-certbot-nginx -y

# Lấy SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## 🔐 Environment Variables

### Backend (.env trong docker-compose)

```env
# Database
DB_PASSWORD=strong_password_here

# Redis
REDIS_PASSWORD=

# Frontend
FRONTEND_URL=https://yourdomain.com

# Backend sẽ đọc từ application-prod.properties
```

### Frontend (build-time)

Tạo file `.env.production` trong `frontend/`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_RECAPTCHA_SITE_KEY=your_site_key
```

---

## ✅ Kiểm Tra & Troubleshooting

### Kiểm Tra Services

```bash
# Xem tất cả containers
docker compose ps

# Xem logs backend
docker compose logs backend -f

# Xem logs frontend
docker compose logs frontend -f

# Xem logs database
docker compose logs postgres -f

# Xem logs redis
docker compose logs redis -f
```

### Kiểm Tra Kết Nối

```bash
# Test database
docker compose exec backend psql -h postgres -U postgres -d catshop

# Test Redis
docker compose exec redis redis-cli ping

# Test backend API
curl http://localhost:8080/api/health
```

### Troubleshooting

#### Lỗi: Database connection failed
```bash
# Kiểm tra database đã chạy chưa
docker compose ps postgres

# Xem logs
docker compose logs postgres
```

#### Lỗi: Redis connection failed
```bash
# Kiểm tra Redis
docker compose exec redis redis-cli ping
```

#### Lỗi: Port đã được sử dụng
```bash
# Tìm process đang dùng port
sudo lsof -i :8080
sudo lsof -i :5432
sudo lsof -i :6379

# Kill process
sudo kill -9 PID
```

#### Lỗi: Out of memory
```bash
# Tăng swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Backup Database

```bash
# Backup
docker compose exec postgres pg_dump -U postgres catshop > backup_$(date +%Y%m%d).sql

# Restore
docker compose exec -T postgres psql -U postgres catshop < backup_20231207.sql
```

---

## 📝 Checklist Trước Khi Deploy

- [ ] Đã cập nhật tất cả passwords trong `.env`
- [ ] Đã cấu hình `application-prod.properties`
- [ ] Đã cập nhật `FRONTEND_URL` và `VITE_API_BASE_URL`
- [ ] Đã cấu hình reCAPTCHA keys
- [ ] Đã cấu hình ESMS keys
- [ ] Đã cấu hình email SMTP
- [ ] Đã mở firewall ports
- [ ] Đã trỏ domain về VPS
- [ ] Đã cài SSL certificate
- [ ] Đã test tất cả chức năng

---

## 🎉 Hoàn Thành!

Sau khi deploy xong, truy cập:
- **Frontend**: https://yourdomain.com
- **Backend API**: https://api.yourdomain.com/api

Chúc bạn deploy thành công! 🚀

