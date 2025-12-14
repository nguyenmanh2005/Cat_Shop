#!/bin/bash

# 📤 Script Export Database PostgreSQL
# Sử dụng: ./scripts/export-database.sh

set -e

# Màu sắc cho output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}📤 Bắt đầu export database...${NC}"

# Thông tin database (có thể override bằng environment variables)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-catshop}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-1234}

# Tạo thư mục backup nếu chưa có
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Tên file backup với timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/catshop_backup_${TIMESTAMP}.dump"
BACKUP_SQL="$BACKUP_DIR/catshop_backup_${TIMESTAMP}.sql"

echo -e "${YELLOW}📋 Thông tin database:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Export dạng dump (binary, nhỏ hơn, nhanh hơn)
echo -e "${GREEN}📦 Exporting database (dump format)...${NC}"
export PGPASSWORD="$DB_PASSWORD"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -F c -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Export dump file thành công: $BACKUP_FILE${NC}"
else
    echo -e "${RED}❌ Export dump file thất bại${NC}"
    exit 1
fi

# Export dạng SQL (dễ đọc, dễ chỉnh sửa)
echo -e "${GREEN}📦 Exporting database (SQL format)...${NC}"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_SQL"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Export SQL file thành công: $BACKUP_SQL${NC}"
else
    echo -e "${RED}❌ Export SQL file thất bại${NC}"
    exit 1
fi

# Hiển thị kích thước file
DUMP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
SQL_SIZE=$(du -h "$BACKUP_SQL" | cut -f1)

echo ""
echo -e "${GREEN}✅ Export hoàn tất!${NC}"
echo -e "  📦 Dump file: $BACKUP_FILE (${DUMP_SIZE})"
echo -e "  📄 SQL file: $BACKUP_SQL (${SQL_SIZE})"
echo ""
echo -e "${YELLOW}💡 Để import database:${NC}"
echo "  ./scripts/import-database.sh $BACKUP_FILE"
echo ""

