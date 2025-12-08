# 🔑 Hướng dẫn thêm Resend API Key vào Railway

## ❌ Vấn đề hiện tại

Logs hiển thị:
```
⚠️ Resend API key chưa được cấu hình. Bỏ qua gửi email.
```

Email không được gửi vì chưa có Resend API Key.

## ✅ Giải pháp: Thêm Resend API Key vào Railway

### Bước 1: Đăng ký Resend (nếu chưa có)
1. Truy cập: https://resend.com
2. Đăng ký tài khoản miễn phí (3000 emails/tháng)
3. Verify email của bạn

### Bước 2: Lấy API Key
1. Vào Resend Dashboard: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Đặt tên: `CatShop Production`
4. **Copy API Key** (chỉ hiển thị 1 lần, lưu lại cẩn thận!)

### Bước 3: Thêm vào Railway Environment Variables

1. Vào Railway Dashboard: https://railway.app
2. Chọn project **Cat_Shop**
3. Chọn service **Cat_Shop** (backend service)
4. Vào tab **Variables**
5. Click **"+ New Variable"**
6. Thêm biến:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_xxxxxxxxxxxxx` (API key bạn vừa copy)
7. Click **"Add"**

### Bước 4: (Optional) Thêm From Email
Nếu muốn dùng email custom:
- **Key**: `RESEND_FROM_EMAIL`
- **Value**: `noreply@yourdomain.com` (phải verify domain trước)

Hoặc để mặc định: `onboarding@resend.dev` (không cần verify)

### Bước 5: Redeploy
1. Railway sẽ tự động redeploy khi thêm variable
2. Hoặc click **"Redeploy"** trong Deployments tab

## ✅ Kiểm tra

Sau khi redeploy, thử gửi OTP lại. Logs sẽ hiển thị:
```
✅ [RESEND] Email sent successfully! ID: xxxxx
```

Thay vì:
```
⚠️ Resend API key chưa được cấu hình
```

## 🔍 Debug

Nếu vẫn không gửi được:
1. Kiểm tra `RESEND_API_KEY` có đúng không trong Railway Variables
2. Kiểm tra API key có còn active không trong Resend Dashboard
3. Kiểm tra logs để xem lỗi cụ thể

## 📝 Lưu ý

- **Free tier**: 3000 emails/tháng
- **API Key**: Chỉ hiển thị 1 lần khi tạo, nên lưu lại
- **From email**: Có thể dùng `onboarding@resend.dev` để test ngay

