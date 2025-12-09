# Hướng dẫn cấu hình Email OTP trên Railway

## Vấn đề
Railway chặn kết nối SMTP (port 465 và 587), nên không thể gửi email qua Gmail SMTP. Cần sử dụng **Resend API** để gửi email.

## Giải pháp: Sử dụng Resend API

### Bước 1: Đăng ký tài khoản Resend
1. Truy cập: https://resend.com/signup
2. Đăng ký tài khoản miễn phí (có 3,000 emails/tháng)
3. Xác thực email

### Bước 2: Tạo API Key
1. Đăng nhập vào Resend Dashboard: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Đặt tên cho API key (ví dụ: "CatShop Production")
4. Copy API key (bắt đầu bằng `re_`)

### Bước 3: Cấu hình trên Railway
1. Vào Railway Dashboard: https://railway.app/
2. Chọn service **catshop** (backend)
3. Vào tab **Variables**
4. Click **"New Variable"**
5. Thêm các biến sau:

   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
   (Thay `re_xxxxxxxxxxxxx` bằng API key bạn đã copy)

   **Optional:** Thêm biến để set email gửi đi:
   ```
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```
   (Hoặc verify domain và dùng email của bạn)

6. Click **"Add"** để lưu
7. Railway sẽ tự động redeploy service

### Bước 4: Verify Domain (Optional - Khuyến nghị)
Nếu muốn dùng email của domain riêng (ví dụ: `noreply@yourdomain.com`):

1. Vào Resend Dashboard → **Domains**
2. Click **"Add Domain"**
3. Thêm domain của bạn
4. Thêm DNS records vào domain provider (theo hướng dẫn của Resend)
5. Đợi verify (thường mất vài phút)
6. Sau khi verify, cập nhật biến trên Railway:
   ```
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

### Bước 5: Kiểm tra
1. Đợi Railway redeploy xong (thường 1-2 phút)
2. Thử đăng ký/đăng nhập và yêu cầu OTP
3. Kiểm tra email inbox (có thể trong spam)
4. Kiểm tra logs trên Railway để xem có lỗi không

## Troubleshooting

### Lỗi: "Resend API key chưa được cấu hình"
- **Nguyên nhân:** Biến `RESEND_API_KEY` chưa được thêm vào Railway
- **Giải pháp:** Làm theo Bước 3 ở trên

### Lỗi: "Invalid API key"
- **Nguyên nhân:** API key không đúng hoặc đã bị xóa
- **Giải pháp:** 
  1. Tạo API key mới tại https://resend.com/api-keys
  2. Cập nhật biến `RESEND_API_KEY` trên Railway
  3. Redeploy service

### Email không đến
- **Nguyên nhân:** Email có thể bị spam filter chặn
- **Giải pháp:**
  1. Kiểm tra thư mục Spam/Junk
  2. Verify domain để tăng độ tin cậy (Bước 4)
  3. Kiểm tra logs trên Railway để xem có lỗi không

### Email đến nhưng bị reject
- **Nguyên nhân:** Domain chưa được verify
- **Giải pháp:** Verify domain theo Bước 4, hoặc dùng `onboarding@resend.dev` để test

## Tài liệu tham khảo
- Resend Documentation: https://resend.com/docs
- Resend API Keys: https://resend.com/api-keys
- Railway Environment Variables: https://docs.railway.app/develop/variables

## Lưu ý
- Resend miễn phí 3,000 emails/tháng
- Sau khi hết free tier, cần upgrade plan
- Có thể dùng SendGrid, Mailgun, hoặc AWS SES thay thế nếu cần

