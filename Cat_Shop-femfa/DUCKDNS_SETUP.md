# 🦆 Hướng Dẫn Lấy Token DuckDNS

Hướng dẫn chi tiết cách đăng ký và lấy token từ DuckDNS để có domain miễn phí.

---

## 📝 Bước 1: Đăng Ký DuckDNS

### 1.1. Truy Cập Website

1. Vào: **https://www.duckdns.org/**
2. Click nút **"Sign in"** ở góc trên bên phải

### 1.2. Chọn Phương Thức Đăng Nhập

Bạn có thể đăng nhập bằng:
- ✅ **GitHub** (Khuyến nghị - dễ nhất)
- ✅ **Google**
- ✅ **Twitter**
- ✅ **Reddit**

**Khuyến nghị**: Dùng GitHub vì dễ nhất và không cần tạo tài khoản mới.

### 1.3. Xác Thực

1. Click **"Sign in with GitHub"** (hoặc Google/Twitter)
2. Authorize DuckDNS truy cập tài khoản của bạn
3. Bạn sẽ được chuyển về trang chủ DuckDNS

---

## 🔑 Bước 2: Lấy Token

### 2.1. Vào Trang Quản Lý

Sau khi đăng nhập, bạn sẽ thấy:
- **Domain** input box
- **Token** hiển thị ngay bên dưới

### 2.2. Token Ở Đâu?

Token sẽ hiển thị ở **2 chỗ**:

#### Chỗ 1: Trên trang chủ (sau khi đăng nhập)
```
┌─────────────────────────────────────┐
│  Domain: [catshop]                  │
│  Token: abc123def456ghi789jkl012    │  ← Đây là token
│  [Add Domain]                        │
└─────────────────────────────────────┘
```

#### Chỗ 2: Trong URL (khi update domain)
Khi bạn update domain, URL sẽ có dạng:
```
https://www.duckdns.org/update?domains=catshop&token=abc123def456ghi789jkl012&ip=
```

**Token** là phần sau `token=` trong URL.

### 2.3. Copy Token

1. **Cách 1**: Click vào token trên trang → Nó sẽ tự động copy
2. **Cách 2**: Select và copy token bằng tay
3. **Cách 3**: Lấy từ URL khi update domain

**Lưu ý**: Token có dạng: `abc123def456ghi789jkl012` (chuỗi ký tự ngẫu nhiên)

---

## 🌐 Bước 3: Tạo Domain

### 3.1. Tạo Subdomain

1. Trong ô **"Domain"**, nhập tên bạn muốn (ví dụ: `catshop`)
2. Click nút **"Add Domain"**
3. Domain của bạn sẽ là: `catshop.duckdns.org`

### 3.2. Update IP (Tự Động)

DuckDNS sẽ tự động detect IP của bạn và update.

Nếu muốn update thủ công:
```
https://www.duckdns.org/update?domains=catshop&token=YOUR_TOKEN&ip=
```

---

## 📸 Hình Ảnh Minh Họa

### Trang Chủ Sau Khi Đăng Nhập:

```
┌─────────────────────────────────────────────────────┐
│  DuckDNS                                            │
│  ────────────────────────────────────────────────  │
│                                                     │
│  Domain: [catshop        ] [Add Domain]            │
│                                                     │
│  Token: abc123def456ghi789jkl012                    │
│  (Click để copy)                                    │
│                                                     │
│  Your domains:                                      │
│  • catshop.duckdns.org                              │
│    IP: 123.456.789.012                             │
│    [Update] [Delete]                                │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Bước 4: Sử Dụng Token

### 4.1. Update IP Tự Động (Nếu Cần)

Nếu bạn có VPS và muốn tự động update IP:

```bash
# Tạo script update
nano /usr/local/bin/duckdns-update.sh
```

```bash
#!/bin/bash
DOMAIN="catshop"
TOKEN="abc123def456ghi789jkl012"
curl "https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&ip="
```

```bash
chmod +x /usr/local/bin/duckdns-update.sh

# Chạy mỗi 5 phút (cron job)
crontab -e
# Thêm dòng:
*/5 * * * * /usr/local/bin/duckdns-update.sh
```

### 4.2. Dùng Với Railway/Render

Khi deploy trên Railway hoặc Render, bạn **KHÔNG CẦN** token để update IP.

Chỉ cần:
1. Lấy domain: `catshop.duckdns.org`
2. Trỏ CNAME về Railway/Render
3. Done!

---

## ✅ Checklist

- [ ] Đã đăng ký DuckDNS
- [ ] Đã lấy token
- [ ] Đã tạo domain (ví dụ: `catshop.duckdns.org`)
- [ ] Đã lưu token ở nơi an toàn
- [ ] Đã test domain hoạt động

---

## 🆘 Troubleshooting

### Q: Không thấy token?
**A**: 
1. Đảm bảo đã đăng nhập
2. Refresh trang
3. Token hiển thị ngay dưới ô "Domain"

### Q: Token bị mất?
**A**: 
1. Đăng nhập lại
2. Token sẽ hiển thị lại
3. Token không thay đổi trừ khi bạn reset

### Q: Domain không hoạt động?
**A**: 
1. Kiểm tra domain đã được tạo chưa
2. Kiểm tra IP đã được update chưa
3. Đợi vài phút để DNS propagate

### Q: Cần reset token?
**A**: 
1. Vào Settings (nếu có)
2. Hoặc liên hệ support DuckDNS

---

## 📝 Lưu Ý Quan Trọng

1. **Token là bí mật**: Không chia sẻ token với ai
2. **Token không đổi**: Token của bạn sẽ giữ nguyên trừ khi reset
3. **Không cần token cho Railway**: Khi dùng Railway/Render, chỉ cần domain, không cần token để update IP
4. **Token chỉ cần khi**: Update IP thủ công hoặc dùng API

---

## 🎯 Tóm Tắt

1. **Đăng ký**: https://www.duckdns.org/ → Sign in với GitHub
2. **Lấy token**: Token hiển thị ngay trên trang chủ sau khi đăng nhập
3. **Tạo domain**: Nhập tên → Add Domain → Domain: `yourname.duckdns.org`
4. **Sử dụng**: Dùng domain để trỏ về Railway/Render

**Ví dụ token**: `abc123def456ghi789jkl012` (chuỗi ngẫu nhiên)

---

**Chúc bạn setup thành công! 🦆**

