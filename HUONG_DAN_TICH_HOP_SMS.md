# 📱 Hướng Dẫn Tích Hợp SMS Gateway - Gửi SMS OTP Thật

## 🎯 Tổng Quan

Hệ thống hiện tại đã được tích hợp sẵn SMS Service với hỗ trợ nhiều SMS gateway:
- **ESMS** (Việt Nam) - ✅ Đã implement
- **Twilio** (Quốc tế) - ⚠️ Chưa implement
- **AWS SNS** (Quốc tế) - ⚠️ Chưa implement
- **SMS Brandname** (Việt Nam) - ⚠️ Chưa implement

## 🏷️ Brandname là gì? (Tóm tắt nhanh)

**Brandname** là tên thương hiệu hiển thị khi người nhận nhận được SMS (VD: "CAT_SHOP").

**Có cần Brandname không?**
- ✅ **Không bắt buộc**: Bạn có thể gửi SMS OTP mà không cần Brandname
- ✅ **Nên có**: Brandname giúp SMS trông chuyên nghiệp và đáng tin cậy hơn
- ⏱️ **Thời gian duyệt**: 3-5 ngày làm việc sau khi nộp hồ sơ

**Nếu chưa có Brandname:**
- Vẫn có thể gửi SMS OTP bình thường
- Chỉ cần để trống `sms.esms.brand-name` trong cấu hình
- Xem chi tiết ở [Bước 1.2: Đăng ký Brandname](#12-đăng-ký-brandname-tên-thương-hiệu)

## 📋 Bước 1: Đăng Ký Tài Khoản ESMS

### 1.1. Truy cập website ESMS
- Website: https://esms.vn/
- Đăng ký tài khoản tại: https://esms.vn/Register

### 1.2. Đăng ký Brandname (Tên thương hiệu)

**Brandname là gì?**
- Brandname là tên thương hiệu hiển thị khi người nhận nhận được SMS (VD: "CAT_SHOP", "CHAM_PETS")
- Có 2 loại Brandname:
  - **Brandname CSKH** (Chăm sóc khách hàng): Dùng cho OTP, thông báo, xác thực
  - **Brandname Quảng cáo**: Dùng cho marketing, khuyến mãi

**Các bước đăng ký Brandname:**

1. **Đăng nhập vào tài khoản ESMS**
   - Truy cập: https://account.esms.vn/
   - Đăng nhập bằng email và mật khẩu

2. **Tạo Brandname mới**
   - Vào menu **"Quản lý"** → **"Brandname"** hoặc **"Đăng ký Brandname"**
   - Click **"Đăng ký Brandname mới"** hoặc **"Tạo Brandname"**
   - Chọn loại Brandname:
     - **CSKH** (Chăm sóc khách hàng) - Khuyến nghị cho OTP
     - **Quảng cáo** - Cho marketing

3. **Điền thông tin Brandname**
   - **Tên Brandname**: Nhập tên thương hiệu (VD: `CAT_SHOP`, `CHAM_PETS`)
     - Chỉ được dùng chữ in hoa, số và dấu gạch dưới
     - Không có khoảng trắng, không có ký tự đặc biệt
     - Tối đa 11 ký tự
   - **Mô tả**: Mô tả về mục đích sử dụng Brandname
   - **Loại hình doanh nghiệp**: Chọn loại hình (Công ty, Cá nhân, v.v.)

4. **Upload hồ sơ pháp lý** (Bắt buộc)
   - **Giấy phép kinh doanh** hoặc **Giấy chứng nhận đăng ký doanh nghiệp**
   - **CMND/CCCD** của người đại diện
   - **Giấy ủy quyền** (nếu có)
   - **Mẫu nội dung SMS** dự kiến sử dụng

5. **Gửi hồ sơ và chờ duyệt**
   - Kiểm tra lại thông tin
   - Click **"Gửi yêu cầu"** hoặc **"Xác nhận"**
   - ESMS sẽ duyệt hồ sơ trong **3-5 ngày làm việc**
   - Bạn sẽ nhận được email thông báo khi Brandname được duyệt

**Lưu ý quan trọng:**
- ⚠️ Brandname phải được duyệt mới có thể sử dụng
- ⚠️ Trong thời gian chờ duyệt, bạn có thể gửi SMS không có Brandname (SmsType = 8)
- ⚠️ Brandname CSKH thường được duyệt nhanh hơn Brandname Quảng cáo
- ⚠️ Nếu Brandname bị từ chối, kiểm tra email để biết lý do và sửa lại hồ sơ

**Tham khảo thêm:**
- Hướng dẫn chi tiết: https://esms.vn/huong-dan/huong-dan-su-dung/huong-dan-thu-tuc-ho-so-khai-bao-brandname
- Hotline hỗ trợ: 0901.888.484
- Email: support@esms.vn

### 1.3. Lấy thông tin API
Sau khi đăng ký và đăng nhập:
1. Vào **"Quản lý"** → **"API"** hoặc **"Tích hợp"**
2. Lấy các thông tin sau:
   - **API Key** (ApiKey)
   - **Secret Key** (SecretKey)
   - **Brandname** (nếu đã được duyệt) - Tên thương hiệu hiển thị khi gửi SMS

### 1.4. Nạp tiền vào tài khoản
- ESMS tính phí theo số tin nhắn gửi đi
- Giá tham khảo: ~200-500 VNĐ/tin nhắn (tùy gói)
- Nạp tiền qua: **"Quản lý"** → **"Nạp tiền"**

## ⚙️ Bước 2: Cấu Hình Backend

### 2.1. Mở file `application.properties`

File location: `back-end/src/main/resources/application.properties`

### 2.2. Cập nhật cấu hình SMS

Tìm đến phần **SMS CONFIGURATION** và cập nhật như sau:

```properties
# ===================== SMS CONFIGURATION =====================
# Bật gửi SMS thật (true = gửi SMS thật, false = chỉ log OTP)
sms.enabled=true

# SMS Provider: esms (đã implement)
sms.provider=esms

# ESMS Configuration
sms.esms.api-key=YOUR_API_KEY_HERE
sms.esms.secret-key=YOUR_SECRET_KEY_HERE
sms.esms.brand-name=CAT_SHOP
```

**Lưu ý:**
- Thay `YOUR_API_KEY_HERE` bằng API Key từ ESMS
- Thay `YOUR_SECRET_KEY_HERE` bằng Secret Key từ ESMS
- Thay `CAT_SHOP` bằng Brandname của bạn (nếu đã được duyệt)
- **Nếu chưa có Brandname hoặc Brandname chưa được duyệt:** Để trống `sms.esms.brand-name` hoặc không khai báo dòng này. Hệ thống sẽ tự động gửi SMS không có Brandname (SmsType = 8)

### 2.3. Ví dụ cấu hình đầy đủ

```properties
# ===================== SMS CONFIGURATION =====================
sms.enabled=true
sms.provider=esms

# ESMS Configuration
sms.esms.api-key=ABC123XYZ789
sms.esms.secret-key=SECRET_KEY_123456
sms.esms.brand-name=CAT_SHOP
```

## 🚀 Bước 3: Khởi Động Lại Backend

Sau khi cập nhật cấu hình:

1. **Dừng backend** (nếu đang chạy)
2. **Khởi động lại backend**
3. Kiểm tra log để đảm bảo không có lỗi

## ✅ Bước 4: Kiểm Tra

### 4.1. Test gửi SMS OTP

1. Đăng nhập vào ứng dụng
2. Vào trang **Security** → **Đăng ký số điện thoại**
3. Nhập số điện thoại của bạn (VD: 0912345678)
4. Click **"Gửi mã OTP"**
5. Kiểm tra điện thoại có nhận được SMS không

### 4.2. Kiểm tra log backend

Nếu gửi thành công, bạn sẽ thấy log:
```
✅ [SMS-SERVICE] SMS đã được gửi thành công qua ESMS đến: 0912345678
📱 [SMS-SERVICE] SMSID: 123456789
```

Nếu có lỗi, bạn sẽ thấy:
```
❌ [SMS-SERVICE] ESMS trả về lỗi. CodeResult: XXX, ErrorMessage: ...
```

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi 1: "ESMS API Key hoặc Secret Key chưa được cấu hình"
**Nguyên nhân:** Chưa cập nhật API Key/Secret Key trong `application.properties`

**Giải pháp:**
- Kiểm tra lại file `application.properties`
- Đảm bảo `sms.esms.api-key` và `sms.esms.secret-key` đã được điền đúng
- Khởi động lại backend

### Lỗi 2: "CodeResult: 101" hoặc "CodeResult: 102"
**Nguyên nhân:** API Key hoặc Secret Key không đúng

**Giải pháp:**
- Kiểm tra lại API Key và Secret Key trên trang ESMS
- Đảm bảo copy đúng, không có khoảng trắng thừa
- Khởi động lại backend

### Lỗi 3: "CodeResult: 103"
**Nguyên nhân:** Tài khoản ESMS không đủ tiền

**Giải pháp:**
- Nạp tiền vào tài khoản ESMS
- Kiểm tra số dư tài khoản

### Lỗi 4: "CodeResult: 104"
**Nguyên nhân:** Brandname chưa được duyệt hoặc không hợp lệ

**Giải pháp:**
- Kiểm tra trạng thái Brandname trên trang ESMS (Quản lý → Brandname)
- Nếu Brandname chưa được duyệt:
  - Để trống `sms.esms.brand-name` trong `application.properties` để gửi SMS không có Brandname
  - Hoặc chờ ESMS duyệt Brandname (3-5 ngày làm việc)
- Nếu Brandname đã được duyệt nhưng vẫn lỗi:
  - Kiểm tra tên Brandname có đúng không (phải viết hoa, không có khoảng trắng)
  - Kiểm tra loại Brandname (CSKH hay Quảng cáo) có phù hợp với mục đích sử dụng không
  - Liên hệ ESMS để được hỗ trợ: 0901.888.484 hoặc support@esms.vn

### Lỗi 5: SMS không đến điện thoại
**Nguyên nhân có thể:**
- Số điện thoại không đúng format
- Mạng di động chặn SMS
- Tài khoản ESMS bị khóa

**Giải pháp:**
- Kiểm tra format số điện thoại (phải là 10 số, bắt đầu bằng 0)
- Thử số điện thoại khác
- Kiểm tra log backend để xem có lỗi gì không
- Liên hệ ESMS để kiểm tra tài khoản

## 📊 Mã Lỗi ESMS Tham Khảo

| CodeResult | Ý nghĩa |
|------------|---------|
| 100 | Thành công |
| 101 | API Key không đúng |
| 102 | Secret Key không đúng |
| 103 | Tài khoản không đủ tiền |
| 104 | Brandname không hợp lệ |
| 105 | Số điện thoại không đúng format |
| 106 | Nội dung SMS không hợp lệ |

## 🔐 Bảo Mật

### ⚠️ QUAN TRỌNG: Không commit API Key vào Git

1. **Tạo file `.env` hoặc sử dụng environment variables:**
   ```properties
   # Thêm vào .gitignore
   application-local.properties
   ```

2. **Tạo file `application-local.properties`:**
   ```properties
   sms.esms.api-key=YOUR_ACTUAL_API_KEY
   sms.esms.secret-key=YOUR_ACTUAL_SECRET_KEY
   sms.esms.brand-name=YOUR_BRAND_NAME
   ```

3. **Sử dụng trong `application.properties`:**
   ```properties
   spring.config.import=optional:file:./application-local.properties
   ```

## 💰 Chi Phí

- **ESMS:** ~200-500 VNĐ/tin nhắn (tùy gói)
- **Tính phí:** Chỉ tính khi SMS được gửi thành công
- **Không tính phí:** Khi SMS gửi thất bại hoặc trong DEV MODE

## 🔄 Chuyển Đổi Giữa DEV MODE và PRODUCTION MODE

### DEV MODE (Chỉ log OTP, không gửi SMS thật):
```properties
sms.enabled=false
sms.provider=none
```

### PRODUCTION MODE (Gửi SMS thật):
```properties
sms.enabled=true
sms.provider=esms
sms.esms.api-key=YOUR_API_KEY
sms.esms.secret-key=YOUR_SECRET_KEY
sms.esms.brand-name=YOUR_BRAND_NAME
```

## 📞 Hỗ Trợ

- **ESMS Support:** https://esms.vn/Contact
- **Email:** support@esms.vn
- **Hotline:** (Kiểm tra trên website ESMS)

## 📝 Ghi Chú

- OTP có hiệu lực trong **2 phút**
- Format số điện thoại: `0912345678` hoặc `+84912345678`
- Nội dung SMS: "Ma OTP cua ban la: {OTP}. Co hieu luc trong 2 phut. - Cat Shop"
- SMS sẽ được gửi ngay sau khi user click "Gửi mã OTP"

---

**Chúc bạn tích hợp thành công! 🎉**
