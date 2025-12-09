# Hướng dẫn Verify Domain trên Resend để gửi email đến TẤT CẢ địa chỉ

## ⚠️ QUAN TRỌNG
- **Không verify domain**: Chỉ có thể gửi email đến chính email đã đăng ký Resend
- **Đã verify domain**: Có thể gửi email đến **BẤT KỲ** địa chỉ nào

## Bước 1: Chuẩn bị Domain

Bạn cần có một domain (ví dụ: `yourdomain.com`, `catshop.com`, `mystore.vn`, etc.)

**Nếu chưa có domain:**
- Mua domain tại: Namecheap, GoDaddy, Cloudflare, Freenom (miễn phí), etc.
- Giá khoảng $10-15/năm hoặc miễn phí (Freenom)

## Bước 2: Thêm Domain vào Resend

1. Đăng nhập vào Resend Dashboard: https://resend.com/domains
2. Click nút **"Add Domain"** (màu đen, góc trên bên phải)
3. Nhập domain của bạn (ví dụ: `catshop.com`)
   - **KHÔNG** nhập `www.catshop.com` hoặc `http://catshop.com`
   - Chỉ nhập: `catshop.com`
4. Click **"Add"**

## Bước 3: Thêm DNS Records

Resend sẽ hiển thị các DNS records cần thêm. Có 3 loại:

### 3.1. SPF Record (Bắt buộc)
- **Type**: `TXT`
- **Name/Host**: `@` hoặc để trống (root domain)
- **Value**: `v=spf1 include:_spf.resend.com ~all`
- **TTL**: `3600` (hoặc mặc định)

### 3.2. DKIM Record (Bắt buộc)
- **Type**: `TXT`
- **Name/Host**: `resend._domainkey` (Resend sẽ cung cấp đầy đủ)
- **Value**: Resend sẽ cung cấp một chuỗi dài (ví dụ: `p=MIGfMA0GCSqGSIb3...`)
- **TTL**: `3600` (hoặc mặc định)

### 3.3. DMARC Record (Khuyến nghị - Optional)
- **Type**: `TXT`
- **Name/Host**: `_dmarc`
- **Value**: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
- **TTL**: `3600` (hoặc mặc định)

## Bước 4: Thêm DNS Records vào Domain Provider

### Nếu dùng Cloudflare:
1. Vào Cloudflare Dashboard → Chọn domain
2. Vào tab **DNS** → **Records**
3. Click **"Add record"**
4. Thêm từng record theo hướng dẫn ở Bước 3
5. Click **"Save"**

### Nếu dùng GoDaddy:
1. Vào GoDaddy Dashboard → **My Products**
2. Click **DNS** bên cạnh domain
3. Scroll xuống **Records**
4. Click **"Add"** để thêm từng record
5. Click **"Save"**

### Nếu dùng Namecheap:
1. Vào Namecheap Dashboard → **Domain List**
2. Click **"Manage"** bên cạnh domain
3. Vào tab **Advanced DNS**
4. Click **"Add New Record"**
5. Thêm từng record
6. Click **"Save"**

### Nếu dùng Freenom (miễn phí):
1. Vào Freenom Dashboard → **My Domains**
2. Click **"Manage Domain"**
3. Vào tab **Manage Freenom DNS**
4. Thêm từng record
5. Click **"Save"**

## Bước 5: Đợi Verify

1. Quay lại Resend Dashboard → **Domains**
2. Bạn sẽ thấy domain với status: **"Pending"** (đang chờ verify)
3. Resend sẽ tự động kiểm tra DNS records
4. **Thời gian verify**: Thường 5-30 phút, có thể lên đến 24 giờ
5. Khi verify thành công, status sẽ đổi thành **"Verified"** ✅

**Lưu ý:**
- Nếu sau 30 phút vẫn chưa verify, kiểm tra lại DNS records có đúng không
- Đảm bảo không có typo trong DNS records
- Một số DNS provider cần thời gian propagate (có thể mất vài giờ)

## Bước 6: Cấu hình trên Railway

Sau khi domain đã verify thành công:

1. Vào Railway Dashboard → Service backend
2. Tab **Variables**
3. Cập nhật biến `RESEND_FROM_EMAIL`:
   ```
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```
   (Thay `yourdomain.com` bằng domain bạn đã verify)

4. Railway sẽ tự động redeploy
5. Đợi 1-2 phút

## Bước 7: Test

1. Thử đăng ký với email bất kỳ (không phải email đã đăng ký Resend)
2. Kiểm tra email inbox
3. Nếu thành công → Domain đã verify đúng! ✅

## Troubleshooting

### Domain không verify sau 30 phút
- **Kiểm tra DNS records**: Đảm bảo đã thêm đúng tất cả records
- **Kiểm tra typo**: Copy-paste từ Resend để tránh lỗi chính tả
- **Đợi DNS propagate**: Một số provider cần thời gian (có thể đến 24h)
- **Kiểm tra DNS lookup**: Dùng tool như https://mxtoolbox.com/ để kiểm tra DNS records

### Vẫn bị lỗi 403 sau khi verify
- **Kiểm tra `RESEND_FROM_EMAIL`**: Phải dùng email từ domain đã verify
- **Format email**: Phải là `something@yourdomain.com` (không phải `something@otherdomain.com`)
- **Redeploy Railway**: Sau khi cập nhật `RESEND_FROM_EMAIL`, đảm bảo Railway đã redeploy

### Không có domain
- **Mua domain**: Namecheap, GoDaddy (~$10-15/năm)
- **Domain miễn phí**: Freenom (.tk, .ml, .ga, .cf)
- **Subdomain**: Nếu có domain chính, có thể dùng subdomain (ví dụ: `mail.catshop.com`)

## Tài liệu tham khảo
- Resend Domains: https://resend.com/domains
- Resend DNS Setup: https://resend.com/docs/dashboard/domains/introduction
- MXToolbox DNS Checker: https://mxtoolbox.com/

