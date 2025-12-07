# ⚡ Hướng Dẫn Deploy Nhanh

## 🚀 Deploy Trên VPS (5 phút)

### Bước 1: Chuẩn Bị VPS

```bash
# Kết nối SSH
ssh root@YOUR_VPS_IP

# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin -y
```

### Bước 2: Clone Code

```bash
cd /opt
git clone https://github.com/YOUR_USERNAME/Cat_Shop-femfa.git
cd Cat_Shop-femfa
```

### Bước 3: Tạo File .env

```bash
nano .env
```

Paste nội dung:

```env
DB_PASSWORD=your_strong_password_here
FRONTEND_URL=https://yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_RECAPTCHA_SITE_KEY=your_site_key
CAPTCHA_SECRET=your_secret_key
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password
SMS_ESMS_API_KEY=your_api_key
SMS_ESMS_SECRET_KEY=your_secret_key
```

### Bước 4: Deploy

```bash
# Chạy script deploy
chmod +x deploy.sh
./deploy.sh

# Hoặc manual
docker compose up -d --build
```

### Bước 5: Kiểm Tra

```bash
# Xem logs
docker compose logs -f

# Kiểm tra services
docker compose ps
```

---

## ☁️ Deploy Trên Railway (Dễ nhất)

1. Đăng ký: https://railway.app/
2. New Project → Deploy from GitHub
3. Chọn repository
4. Railway tự động detect Docker
5. Add PostgreSQL service
6. Add Redis service
7. Thêm Environment Variables
8. Deploy!

---

## 📝 Checklist

- [ ] Đã tạo file `.env` với passwords mạnh
- [ ] Đã cập nhật `FRONTEND_URL` và `VITE_API_BASE_URL`
- [ ] Đã cấu hình reCAPTCHA keys
- [ ] Đã cấu hình ESMS keys
- [ ] Đã cấu hình email SMTP
- [ ] Đã mở firewall ports (80, 443, 8080)
- [ ] Đã trỏ domain về VPS (nếu có)
- [ ] Đã cài SSL (Let's Encrypt)

---

## 🔧 Commands Hữu Ích

```bash
# Xem logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart service
docker compose restart backend

# Stop tất cả
docker compose down

# Backup database
docker compose exec postgres pg_dump -U postgres catshop > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres catshop < backup.sql
```

---

Xem hướng dẫn chi tiết trong `DEPLOY_GUIDE.md`!

