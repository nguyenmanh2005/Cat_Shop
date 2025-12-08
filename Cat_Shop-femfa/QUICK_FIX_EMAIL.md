# 🚨 QUICK FIX: Thêm Resend API Key để gửi email

## ⚠️ Vấn đề hiện tại

Logs hiển thị:
```
⚠️ Resend API key chưa được cấu hình. Bỏ qua gửi email.
```

Email không được gửi vì **chưa có Resend API Key** trong Railway.

## ✅ Giải pháp nhanh (5 phút)

### Bước 1: Đăng ký Resend (2 phút)
1. Truy cập: **https://resend.com**
2. Click **"Sign Up"** (miễn phí)
3. Đăng ký bằng email của bạn
4. Verify email

### Bước 2: Lấy API Key (1 phút)
1. Vào: **https://resend.com/api-keys**
2. Click **"Create API Key"**
3. Đặt tên: `CatShop`
4. **Copy API Key** ngay (chỉ hiển thị 1 lần!)
   - Format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Bước 3: Thêm vào Railway (1 phút)
1. Vào Railway: **https://railway.app**
2. Chọn project **Cat_Shop**
3. Chọn service **Cat_Shop** (backend)
4. Vào tab **Variables**
5. Click **"+ New Variable"**
6. Thêm:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_xxxxxxxxxxxxx` (API key bạn vừa copy)
7. Click **"Add"**

### Bước 4: Redeploy (1 phút)
1. Railway sẽ tự động redeploy khi thêm variable
2. Hoặc vào tab **Deployments** → Click **"Redeploy"**
3. Đợi deploy xong (2-3 phút)

## ✅ Kiểm tra

Sau khi redeploy xong, thử gửi OTP lại. Logs sẽ hiển thị:
```
✅ [RESEND] Email sent successfully! ID: xxxxx
```

Thay vì:
```
⚠️ Resend API key chưa được cấu hình
```

## 📧 Kiểm tra email

1. Kiểm tra inbox của `cumanhpt@gmail.com`
2. Kiểm tra spam folder
3. Email sẽ có subject: **"Cham Pets - Mã OTP đăng nhập"**

## 🔍 Nếu vẫn không gửi được

1. **Kiểm tra API Key có đúng không:**
   - Railway → Variables → `RESEND_API_KEY`
   - Phải bắt đầu bằng `re_`

2. **Kiểm tra Resend Dashboard:**
   - Vào: https://resend.com/emails
   - Xem có email nào được gửi không
   - Xem status (sent/failed)

3. **Kiểm tra logs:**
   - Railway → Logs
   - Tìm `[RESEND]` để xem lỗi cụ thể

## 💡 Lưu ý

- **Free tier**: 3000 emails/tháng (đủ dùng cho test)
- **From email**: Mặc định dùng `onboarding@resend.dev` (không cần verify)
- **API Key**: Chỉ hiển thị 1 lần, nên lưu lại cẩn thận

