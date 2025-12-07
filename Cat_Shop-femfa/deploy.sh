#!/bin/bash

# 🚀 Script Deploy Cat Shop
# Sử dụng: ./deploy.sh

set -e

echo "🚀 Bắt đầu deploy Cat Shop..."

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt. Vui lòng cài Docker trước."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose chưa được cài đặt. Vui lòng cài Docker Compose trước."
    exit 1
fi

# Kiểm tra file .env
if [ ! -f .env ]; then
    echo "⚠️  File .env chưa tồn tại. Tạo file .env mới..."
    cat > .env << EOF
# Database
DB_PASSWORD=$(openssl rand -base64 32)

# Redis
REDIS_PASSWORD=

# Frontend URL
FRONTEND_URL=http://localhost:5173

# API URL
VITE_API_BASE_URL=http://localhost:8080/api

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=
EOF
    echo "✅ Đã tạo file .env. Vui lòng cập nhật các giá trị cần thiết."
    echo "📝 Mở file .env và cập nhật: FRONTEND_URL, VITE_API_BASE_URL, VITE_RECAPTCHA_SITE_KEY"
    read -p "Nhấn Enter sau khi đã cập nhật .env..."
fi

# Build và deploy
echo "🔨 Đang build Docker images..."
docker compose build

echo "🛑 Dừng các containers cũ (nếu có)..."
docker compose down

echo "🚀 Khởi động các services..."
docker compose up -d

echo "⏳ Đợi các services khởi động..."
sleep 10

# Kiểm tra health
echo "🏥 Kiểm tra health của các services..."
docker compose ps

echo ""
echo "✅ Deploy hoàn tất!"
echo ""
echo "📊 Xem logs:"
echo "   docker compose logs -f"
echo ""
echo "🔍 Kiểm tra services:"
echo "   docker compose ps"
echo ""
echo "🌐 Truy cập:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8080/api"
echo ""

