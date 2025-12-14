#!/bin/bash

# 📥 Script Import Database PostgreSQL
# Sử dụng: ./scripts/import-database.sh [backup_file]
# Ví dụ: ./scripts/import-database.sh backups/catshop_backup_20240101_120000.dump

set -e

# Màu sắc cho output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kiểm tra file backup
if [ -z "$1" ]; then
    echo -e "${RED}❌ Vui lòng chỉ định file backup${NC}"
    echo "Sử dụng: ./scripts/import-database.sh [backup_file]"
    echo "Ví dụ: ./scripts/import-database.sh backups/catshop_backup_20240101_120000.dump"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ File backup không tồn tại: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}📥 Bắt đầu import database...${NC}"

# Nhập thông tin database đích
echo -e "${YELLOW}📋 Nhập thông tin database đích:${NC}"
read -p "Host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Database name [catshop]: " DB_NAME
DB_NAME=${DB_NAME:-catshop}

read -p "Username [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Password: " DB_PASSWORD
echo ""

# Xác nhận
echo ""
echo -e "${YELLOW}⚠️  CẢNH BÁO: Thao tác này sẽ XÓA dữ liệu hiện tại trong database!${NC}"
read -p "Bạn có chắc chắn muốn tiếp tục? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}❌ Đã hủy import${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}📋 Thông tin import:${NC}"
echo "  File: $BACKUP_FILE"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Kiểm tra file là dump hay SQL
if [[ "$BACKUP_FILE" == *.dump ]] || [[ "$BACKUP_FILE" == *.backup ]]; then
    # Import dump file (binary)
    echo -e "${GREEN}📦 Importing dump file...${NC}"
    export PGPASSWORD="$DB_PASSWORD"
    pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c -v "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Import thành công!${NC}"
    else
        echo -e "${RED}❌ Import thất bại${NC}"
        exit 1
    fi
elif [[ "$BACKUP_FILE" == *.sql ]]; then
    # Import SQL file
    echo -e "${GREEN}📦 Importing SQL file...${NC}"
    export PGPASSWORD="$DB_PASSWORD"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Import thành công!${NC}"
    else
        echo -e "${RED}❌ Import thất bại${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ File không đúng định dạng. Chỉ chấp nhận .dump, .backup hoặc .sql${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Import hoàn tất!${NC}"
echo -e "${YELLOW}💡 Kiểm tra database:${NC}"
echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
echo ""

