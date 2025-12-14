# 📥 Script Import Database PostgreSQL (PowerShell)
# Sử dụng: .\scripts\import-database.ps1 [backup_file]
# Ví dụ: .\scripts\import-database.ps1 backups\catshop_backup_20240101_120000.dump

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

# Kiểm tra file backup
if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ File backup không tồn tại: $BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "📥 Bắt đầu import database..." -ForegroundColor Blue

# Nhập thông tin database đích
Write-Host "📋 Nhập thông tin database đích:" -ForegroundColor Yellow
$DB_HOST = Read-Host "Host [localhost]"
if ([string]::IsNullOrWhiteSpace($DB_HOST)) { $DB_HOST = "localhost" }

$DB_PORT = Read-Host "Port [5432]"
if ([string]::IsNullOrWhiteSpace($DB_PORT)) { $DB_PORT = 5432 }

$DB_NAME = Read-Host "Database name [catshop]"
if ([string]::IsNullOrWhiteSpace($DB_NAME)) { $DB_NAME = "catshop" }

$DB_USER = Read-Host "Username [postgres]"
if ([string]::IsNullOrWhiteSpace($DB_USER)) { $DB_USER = "postgres" }

$DB_PASSWORD = Read-Host "Password" -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
)

# Xác nhận
Write-Host ""
Write-Host "⚠️  CẢNH BÁO: Thao tác này sẽ XÓA dữ liệu hiện tại trong database!" -ForegroundColor Yellow
$CONFIRM = Read-Host "Bạn có chắc chắn muốn tiếp tục? (yes/no)"

if ($CONFIRM -ne "yes") {
    Write-Host "❌ Đã hủy import" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📋 Thông tin import:" -ForegroundColor Green
Write-Host "  File: $BackupFile"
Write-Host "  Host: $DB_HOST"
Write-Host "  Port: $DB_PORT"
Write-Host "  Database: $DB_NAME"
Write-Host "  User: $DB_USER"
Write-Host ""

# Set environment variable for password
$env:PGPASSWORD = $DB_PASSWORD_PLAIN

# Kiểm tra file là dump hay SQL
if ($BackupFile -match '\.(dump|backup)$') {
    # Import dump file (binary)
    Write-Host "📦 Importing dump file..." -ForegroundColor Green
    & pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c -v $BackupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Import thành công!" -ForegroundColor Green
    } else {
        Write-Host "❌ Import thất bại" -ForegroundColor Red
        exit 1
    }
} elseif ($BackupFile -match '\.sql$') {
    # Import SQL file
    Write-Host "📦 Importing SQL file..." -ForegroundColor Green
    & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $BackupFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Import thành công!" -ForegroundColor Green
    } else {
        Write-Host "❌ Import thất bại" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ File không đúng định dạng. Chỉ chấp nhận .dump, .backup hoặc .sql" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Import hoàn tất!" -ForegroundColor Green
Write-Host "💡 Kiểm tra database:" -ForegroundColor Yellow
Write-Host "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
Write-Host ""

