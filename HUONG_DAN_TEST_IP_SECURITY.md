# 🔒 Hướng Dẫn Test Tính Năng IP Security - Cảnh Báo Đăng Nhập Từ IP Mới

## 🎯 Tổng Quan

Tính năng IP Security tự động phát hiện và cảnh báo khi có đăng nhập từ địa chỉ IP mới, tương tự như Google Security Alert. Khi phát hiện IP mới, hệ thống sẽ:

1. ✅ Gửi email cảnh báo đến user
2. ✅ Cung cấp link đổi mật khẩu ngay lập tức
3. ✅ Lưu trữ danh sách IP đã biết của user
4. ✅ Đăng xuất tất cả thiết bị sau khi đổi mật khẩu

## 📋 Bước 1: Kiểm Tra Database

### 1.1. Tự Động Tạo Bảng

Hệ thống sử dụng JPA với `ddl-auto=update`, nên bảng `user_known_ips` sẽ **tự động được tạo** khi khởi động backend lần đầu sau khi thêm entity.

### 1.2. Kiểm Tra Bảng Đã Tạo

Sau khi khởi động backend, kiểm tra trong PostgreSQL:

```sql
-- Kết nối đến database
\c catshop

-- Kiểm tra bảng đã tồn tại
\dt user_known_ips

-- Xem cấu trúc bảng
\d user_known_ips
```

**Cấu trúc bảng mong đợi:**
- `id` (BIGSERIAL PRIMARY KEY)
- `user_email` (VARCHAR(100))
- `ip_address` (VARCHAR(45))
- `user_agent` (VARCHAR(500))
- `first_seen` (TIMESTAMP)
- `last_seen` (TIMESTAMP)
- `login_count` (INTEGER)
- `location` (VARCHAR(100))

### 1.3. Nếu Bảng Chưa Tạo

Nếu bảng chưa được tạo tự động:

1. **Khởi động lại backend** - Hibernate sẽ tự động tạo bảng
2. **Hoặc tạo thủ công:**

```sql
CREATE TABLE user_known_ips (
    id BIGSERIAL PRIMARY KEY,
    user_email VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500),
    first_seen TIMESTAMP NOT NULL,
    last_seen TIMESTAMP NOT NULL,
    login_count INTEGER NOT NULL DEFAULT 1,
    location VARCHAR(100)
);

CREATE INDEX idx_user_email ON user_known_ips(user_email);
CREATE INDEX idx_ip_address ON user_known_ips(ip_address);
```

## 🚀 Bước 2: Khởi Động Hệ Thống

### 2.1. Khởi Động Backend

```bash
cd back-end
mvn spring-boot:run
```

**Kiểm tra log:**
- ✅ Không có lỗi khi khởi động
- ✅ Entity `UserKnownIp` được scan
- ✅ Service `IpSecurityService` được khởi tạo

### 2.2. Khởi Động Frontend

```bash
cd frontend
npm run dev
```

**Kiểm tra:**
- ✅ Frontend chạy tại `http://localhost:5173`
- ✅ Route `/reset-password` hoạt động

## 🧪 Bước 3: Test Flow Đăng Nhập Từ IP Mới

### 3.1. Test Case 1: Đăng Nhập Lần Đầu (IP Mới)

**Mục đích:** Kiểm tra hệ thống phát hiện IP mới và gửi email cảnh báo.

**Các bước:**

1. **Xóa dữ liệu IP đã biết (nếu có):**
   ```sql
   DELETE FROM user_known_ips WHERE user_email = 'your-email@example.com';
   ```

2. **Đăng nhập từ IP hiện tại:**
   - Mở trình duyệt
   - Truy cập: `http://localhost:5173/auth-flow/login`
   - Đăng nhập với email và password

3. **Kiểm tra log backend:**
   ```
   ⚠️ [IP-SECURITY] New IP detected for: your-email@example.com: 127.0.0.1
   ✅ [IP-SECURITY] Security alert email sent to: your-email@example.com
   ✅ [IP-SECURITY] Saved new known IP for: your-email@example.com: 127.0.0.1
   ```

4. **Kiểm tra email:**
   - Mở hộp thư email của bạn
   - Tìm email với subject: **"⚠️ Cảnh báo bảo mật: Đăng nhập từ địa chỉ IP mới"**
   - Email phải chứa:
     - ✅ Địa chỉ IP mới
     - ✅ Thời gian đăng nhập
     - ✅ Thông tin thiết bị
     - ✅ Link đổi mật khẩu (có token)

5. **Kiểm tra database:**
   ```sql
   SELECT * FROM user_known_ips WHERE user_email = 'your-email@example.com';
   ```
   - Phải có 1 record với IP vừa đăng nhập
   - `login_count` = 1
   - `first_seen` và `last_seen` = thời gian hiện tại

### 3.2. Test Case 2: Đăng Nhập Từ IP Đã Biết

**Mục đích:** Kiểm tra hệ thống không gửi email khi IP đã biết.

**Các bước:**

1. **Đăng nhập lại từ cùng IP:**
   - Đăng xuất (nếu đang đăng nhập)
   - Đăng nhập lại với cùng email

2. **Kiểm tra log backend:**
   ```
   ✅ [IP-SECURITY] Updated known IP for: your-email@example.com: 127.0.0.1
   ```
   - ❌ **KHÔNG** có log "New IP detected"
   - ❌ **KHÔNG** có log "Security alert email sent"

3. **Kiểm tra email:**
   - ❌ **KHÔNG** nhận được email cảnh báo mới

4. **Kiểm tra database:**
   ```sql
   SELECT * FROM user_known_ips WHERE user_email = 'your-email@example.com';
   ```
   - `login_count` tăng lên (2, 3, ...)
   - `last_seen` được cập nhật

### 3.3. Test Case 3: Đăng Nhập Từ IP Khác (Mô Phỏng)

**Mục đích:** Kiểm tra hệ thống phát hiện IP mới từ địa chỉ khác.

**Các bước:**

1. **Mô phỏng IP khác bằng cách thay đổi IP trong database:**
   ```sql
   -- Xóa IP hiện tại
   DELETE FROM user_known_ips WHERE user_email = 'your-email@example.com' AND ip_address = '127.0.0.1';
   
   -- Hoặc thêm IP giả lập
   INSERT INTO user_known_ips (user_email, ip_address, user_agent, first_seen, last_seen, login_count)
   VALUES ('your-email@example.com', '192.168.1.100', 'Test Agent', NOW(), NOW(), 1);
   ```

2. **Đăng nhập lại:**
   - Đăng xuất
   - Đăng nhập lại

3. **Kiểm tra:**
   - ✅ Hệ thống phát hiện IP `127.0.0.1` là IP mới
   - ✅ Gửi email cảnh báo
   - ✅ Lưu IP mới vào database

### 3.4. Test Case 4: Đổi Mật Khẩu Từ Email Cảnh Báo

**Mục đích:** Kiểm tra flow đổi mật khẩu từ link trong email.

**Các bước:**

1. **Lấy token từ email:**
   - Mở email cảnh báo
   - Copy link đổi mật khẩu (VD: `http://localhost:5173/reset-password?token=eyJhbGc...`)

2. **Truy cập link:**
   - Mở link trong trình duyệt
   - Hoặc truy cập: `http://localhost:5173/reset-password?token=YOUR_TOKEN`

3. **Kiểm tra UI:**
   - ✅ Hiển thị form đổi mật khẩu
   - ✅ Có cảnh báo "⚠️ Cảnh báo bảo mật"
   - ✅ Có 2 trường: Mật khẩu mới và Xác nhận mật khẩu

4. **Đổi mật khẩu:**
   - Nhập mật khẩu mới (tối thiểu 6 ký tự)
   - Xác nhận mật khẩu
   - Click "Đổi mật khẩu ngay"

5. **Kiểm tra kết quả:**
   - ✅ Hiển thị thông báo thành công
   - ✅ Tự động chuyển đến trang đăng nhập sau 3 giây
   - ✅ Tất cả thiết bị đã được đăng xuất

6. **Kiểm tra log backend:**
   ```
   ✅ [SECURITY] Password reset successfully for: your-email@example.com
   ```

7. **Đăng nhập lại:**
   - Đăng nhập với mật khẩu mới
   - ✅ Đăng nhập thành công

### 3.5. Test Case 5: Token Hết Hạn

**Mục đích:** Kiểm tra xử lý khi token hết hạn.

**Các bước:**

1. **Tạo token cũ (hoặc đợi 24 giờ):**
   - Token có hiệu lực 24 giờ
   - Sau 24 giờ, token sẽ hết hạn

2. **Truy cập link với token hết hạn:**
   - Mở link: `http://localhost:5173/reset-password?token=EXPIRED_TOKEN`

3. **Kiểm tra:**
   - ✅ Hiển thị thông báo "Token không hợp lệ hoặc đã hết hạn"
   - ✅ Có nút "Quay lại đăng nhập"

### 3.6. Test Case 6: Token Không Hợp Lệ

**Mục đích:** Kiểm tra xử lý khi token không hợp lệ.

**Các bước:**

1. **Truy cập link với token sai:**
   - Mở: `http://localhost:5173/reset-password?token=INVALID_TOKEN`

2. **Kiểm tra:**
   - ✅ Hiển thị thông báo lỗi
   - ✅ Không cho phép đổi mật khẩu

## 🔍 Bước 4: Kiểm Tra Log Backend

### 4.1. Log Khi Phát Hiện IP Mới

```
⚠️ [IP-SECURITY] New IP detected for: user@example.com: 192.168.1.100
✅ [IP-SECURITY] Security alert email sent to: user@example.com
✅ [IP-SECURITY] Saved new known IP for: user@example.com: 192.168.1.100
```

### 4.2. Log Khi IP Đã Biết

```
✅ [IP-SECURITY] Updated known IP for: user@example.com: 127.0.0.1
```

### 4.3. Log Khi Đổi Mật Khẩu

```
✅ [SECURITY] Password reset successfully for: user@example.com
```

## 📊 Bước 5: Kiểm Tra Database

### 5.1. Xem Tất Cả IP Đã Biết Của User

```sql
SELECT 
    id,
    user_email,
    ip_address,
    user_agent,
    first_seen,
    last_seen,
    login_count
FROM user_known_ips
WHERE user_email = 'your-email@example.com'
ORDER BY last_seen DESC;
```

### 5.2. Xem Thống Kê IP

```sql
-- Số lượng IP đã biết của mỗi user
SELECT 
    user_email,
    COUNT(*) as total_ips,
    SUM(login_count) as total_logins
FROM user_known_ips
GROUP BY user_email;
```

### 5.3. Xóa Dữ Liệu Test

```sql
-- Xóa tất cả IP của user (để test lại)
DELETE FROM user_known_ips WHERE user_email = 'your-email@example.com';
```

## 🐛 Xử Lý Lỗi Thường Gặp

### Lỗi 1: Bảng `user_known_ips` Chưa Tạo

**Triệu chứng:**
```
Table "user_known_ips" does not exist
```

**Giải pháp:**
1. Khởi động lại backend
2. Kiểm tra log xem có lỗi không
3. Nếu vẫn lỗi, tạo bảng thủ công (xem Bước 1.3)

### Lỗi 2: Email Không Được Gửi

**Triệu chứng:**
- Không nhận được email cảnh báo
- Log: `❌ Failed to send security alert email`

**Giải pháp:**
1. Kiểm tra cấu hình email trong `application.properties`
2. Kiểm tra `spring.mail.*` settings
3. Kiểm tra log backend để xem lỗi cụ thể

### Lỗi 3: Token Không Hợp Lệ

**Triệu chứng:**
- Frontend hiển thị "Token không hợp lệ"
- API trả về lỗi 400

**Giải pháp:**
1. Kiểm tra token có đúng format không
2. Kiểm tra token có hết hạn không (24 giờ)
3. Kiểm tra JWT secret key có đúng không

### Lỗi 4: IP Không Được Lấy Đúng

**Triệu chứng:**
- IP hiển thị là `127.0.0.1` hoặc `0:0:0:0:0:0:0:1` (localhost)
- IP không phải IP thật của client

**Giải pháp:**
- Đây là bình thường khi test local
- Khi deploy production, IP sẽ được lấy đúng từ `X-Forwarded-For` header

## ✅ Checklist Test

- [ ] Bảng `user_known_ips` đã được tạo
- [ ] Backend khởi động không lỗi
- [ ] Frontend route `/reset-password` hoạt động
- [ ] Đăng nhập lần đầu → Nhận email cảnh báo
- [ ] Email cảnh báo có đầy đủ thông tin
- [ ] Link đổi mật khẩu trong email hoạt động
- [ ] Đổi mật khẩu thành công
- [ ] Đăng nhập lại với mật khẩu mới thành công
- [ ] Đăng nhập từ IP đã biết → Không gửi email
- [ ] Token hết hạn → Hiển thị lỗi đúng
- [ ] Database lưu đúng thông tin IP

## 📝 Ghi Chú

1. **IP Localhost:** Khi test local, IP sẽ là `127.0.0.1` hoặc `0:0:0:0:0:0:0:1`. Đây là bình thường.

2. **Token Expiration:** Token reset password có hiệu lực 24 giờ. Sau đó sẽ hết hạn.

3. **Email Template:** Email cảnh báo sử dụng HTML template đẹp, có thể tùy chỉnh trong `IpSecurityServiceImpl.java`.

4. **Production:** Khi deploy production, đảm bảo:
   - Cấu hình email SMTP đúng
   - Frontend URL trong `application.properties` đúng
   - IP được lấy đúng từ proxy/load balancer

## 🎉 Hoàn Thành!

Sau khi test xong tất cả các case, tính năng IP Security đã sẵn sàng sử dụng!

---

**Chúc bạn test thành công! 🚀**

