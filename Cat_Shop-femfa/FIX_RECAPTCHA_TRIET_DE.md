# Sửa Triệt Để reCAPTCHA - Cho Phép Vào Khi Không Có Key

## Vấn Đề

reCAPTCHA báo lỗi "Loại khóa không hợp lệ" → Không thể đăng nhập/đăng ký.

## Giải Pháp

Đã sửa code để:
1. ✅ **Frontend:** Không hiển thị captcha nếu không có `VITE_RECAPTCHA_SITE_KEY`
2. ✅ **Frontend:** Không yêu cầu captcha token nếu không có site key
3. ✅ **Backend:** Đã có `captcha.enabled=false` để tắt captcha

---

## Cách Hoạt Động

### Nếu CÓ `VITE_RECAPTCHA_SITE_KEY`:
- Frontend hiển thị captcha widget
- Yêu cầu user xác thực captcha
- Gửi captcha token lên backend

### Nếu KHÔNG CÓ `VITE_RECAPTCHA_SITE_KEY`:
- Frontend **KHÔNG** hiển thị captcha widget
- **KHÔNG** yêu cầu captcha token
- User có thể đăng nhập/đăng ký bình thường

---

## Cách Tắt reCAPTCHA (Để Vào Được Ngay)

### Cách 1: Xóa `VITE_RECAPTCHA_SITE_KEY` (Khuyến Nghị)

1. **Vào service "strong-ambition" (Frontend)** → tab **"Variables"**
2. **Tìm biến `VITE_RECAPTCHA_SITE_KEY`**
3. **Xóa biến này** (hoặc để rỗng)
4. **Save**
5. **Đợi Frontend redeploy** (2-3 phút)

---

### Cách 2: Để `VITE_RECAPTCHA_SITE_KEY` Rỗng

1. **Vào service "strong-ambition" (Frontend)** → tab **"Variables"**
2. **Tìm biến `VITE_RECAPTCHA_SITE_KEY`**
3. **Sửa giá trị thành rỗng:** `""` (không có gì)
4. **Save**
5. **Đợi Frontend redeploy** (2-3 phút)

---

## Nếu Muốn Bật Lại reCAPTCHA (Sau Khi Sửa Domain)

### Bước 1: Sửa Domain Trong Google reCAPTCHA Admin

1. **Vào:** https://www.google.com/recaptcha/admin
2. **Click vào site** bạn đã tạo
3. **Click "Edit"**
4. **Thêm domain:**
   - `*.railway.app` (cho tất cả Railway domains)
   - Hoặc domain cụ thể: `strong-ambition-production.up.railway.app`
5. **Save**

---

### Bước 2: Set Lại `VITE_RECAPTCHA_SITE_KEY`

1. **Vào service "strong-ambition" (Frontend)** → tab **"Variables"**
2. **Tìm biến `VITE_RECAPTCHA_SITE_KEY`**
3. **Set lại giá trị:** `6LdhOiQsAAAAAAeZHd1SUVmX7zEdi9sovfkrZLJp` (hoặc site key của bạn)
4. **Save**
5. **Đợi Frontend redeploy** (2-3 phút)

---

## Kiểm Tra Sau Khi Sửa

1. ✅ **Frontend đã redeploy**
2. ✅ **Truy cập website:** `https://strong-ambition-production.up.railway.app`
3. ✅ **Vào trang đăng nhập**
4. ✅ **Không còn hiển thị captcha widget** (nếu đã xóa key)
5. ✅ **Có thể đăng nhập/đăng ký bình thường**

---

## Tóm Tắt

1. ✅ **Đã sửa code** để không yêu cầu captcha khi không có key (đã push)
2. ⚠️ **Cần làm:** Xóa hoặc để rỗng `VITE_RECAPTCHA_SITE_KEY` trong Frontend Variables
3. ✅ **Đợi Frontend redeploy**
4. ✅ **Test lại website**

---

**Làm theo các bước trên và bạn sẽ vào được ngay!**

