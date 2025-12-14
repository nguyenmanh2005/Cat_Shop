# 📤 Script Export Database PostgreSQL (PowerShell)
# Sử dụng: .\scripts\export-database.ps1

param(
    [string]$DB_HOST = "localhost",
    [int]$DB_PORT = 5432,
    [string]$DB_NAME = "catshop",
    [string]$DB_USER = "postgres",
    [string]$DB_PASSWORD = "1234"
)

Write-Host "📤 Bắt đầu export database..." -ForegroundColor Green

# Tạo thư mục backup nếu chưa có
$BACKUP_DIR = ".\backups"
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

# Tên file backup với timestamp
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = Join-Path $BACKUP_DIR "catshop_backup_${TIMESTAMP}.dump"
$BACKUP_SQL  = Join-Path $BACKUP_DIR "catshop_backup_${TIMESTAMP}.sql"

Write-Host "📋 Thông tin database:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST"
Write-Host "  Port: $DB_PORT"
Write-Host "  Database: $DB_NAME"
Write-Host "  User: $DB_USER"
Write-Host ""

# Set environment variable for password
$env:PGPASSWORD = $DB_PASSWORD

# Export dạng dump
Write-Host "📦 Exporting database (dump format)..." -ForegroundColor Green
& pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F c -f $BACKUP_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Export dump file thành công: $BACKUP_FILE" -ForegroundColor Green
} else {
    Write-Host "❌ Export dump file thất bại" -ForegroundColor Red
    exit 1
}

# Export dạng SQL
Write-Host "📦 Exporting database (SQL format)..." -ForegroundColor Green
& pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $BACKUP_SQL

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Export SQL file thành công: $BACKUP_SQL" -ForegroundColor Green
} else {
    Write-Host "❌ Export SQL file thất bại" -ForegroundColor Red
    exit 1
}

# Hiển thị kích thước file
$DUMP_SIZE = (Get-Item $BACKUP_FILE).Length / 1MB
$SQL_SIZE = (Get-Item $BACKUP_SQL).Length / 1MB

Write-Host ""
Write-Host "✅ Export hoàn tất!" -ForegroundColor Green
Write-Host ("  📦 Dump file: {0} ({1} MB)" -f $BACKUP_FILE, [math]::Round($DUMP_SIZE, 2))
Write-Host ("  📄 SQL file: {0} ({1} MB)" -f $BACKUP_SQL,  [math]::Round($SQL_SIZE, 2))
Write-Host ""
Write-Host "💡 Để import database:" -ForegroundColor Yellow
Write-Host "  .\scripts\import-database.ps1 $BACKUP_FILE"
Write-Host ""

