# 🔧 Fix Lỗi Build Triệt Để - CaptchaService Not Found

## 🎯 Nguyên Nhân

Lỗi `cannot find symbol: class CaptchaService` xảy ra vì Railway không tìm thấy file `CaptchaService.java` khi build.

**Nguyên nhân chính**: Root Directory trên Railway không đúng với cấu trúc repo trên GitHub.

---

## ✅ Cách Fix (Từng Bước)

### Bước 1: Kiểm Tra Cấu Trúc Repo Trên GitHub

1. Vào: **https://github.com/nguyenmanh2005/Cat_Shop**
2. Xem cấu trúc thư mục:
   - Nếu thấy `back-end/` ở **root** của repo → Root Directory: `back-end`
   - Nếu thấy `Cat_Shop-femfa/back-end/` → Root Directory: `Cat_Shop-femfa/back-end`

### Bước 2: Sửa Root Directory Trên Railway

1. Vào **Railway Dashboard**
2. Click vào **service** (Cat_Shop)
3. Click tab **"Settings"** (hoặc **"Source"**)
4. Scroll xuống phần **"Root Directory"**
5. **XÓA** giá trị hiện tại (nếu có `Cat_Shop-femfa/back-end`)
6. Nhập: `back-end` (chỉ có 2 từ này, không có dấu `/` ở đầu)
7. Click **"Save"** hoặc **"Update"**

### Bước 3: Đợi Railway Redeploy

Railway sẽ tự động redeploy sau khi bạn save.

### Bước 4: Kiểm Tra Logs

1. Vào tab **"Deployments"**
2. Click vào deployment mới nhất
3. Xem logs:
   - Nếu thấy `CaptchaService.java not found!` → Root Directory vẫn sai
   - Nếu build thành công → Done! ✅

---

## 🔍 Nếu Vẫn Lỗi

### Option 1: Xóa Root Directory Hoàn Toàn

1. Vào Settings → Source
2. **XÓA** hết Root Directory (để trống)
3. Railway sẽ tự động detect Dockerfile
4. Save và đợi redeploy

### Option 2: Tạo Service Mới

1. **Xóa** service hiện tại
2. Tạo service mới:
   - **New** → **GitHub Repo**
   - Chọn repo
   - **Root Directory**: `back-end` (hoặc để trống)
   - Deploy

### Option 3: Kiểm Tra Trên GitHub

1. Vào: https://github.com/nguyenmanh2005/Cat_Shop/tree/main
2. Kiểm tra có thư mục `back-end/` không
3. Vào `back-end/src/main/java/com/catshop/catshop/service/`
4. Kiểm tra có file `CaptchaService.java` không

Nếu **KHÔNG CÓ** → File chưa được push. Cần:
```bash
git add back-end/src/main/java/com/catshop/catshop/service/CaptchaService.java
git commit -m "Add CaptchaService"
git push
```

---

## 📝 Checklist

- [ ] Đã kiểm tra cấu trúc repo trên GitHub
- [ ] Đã set Root Directory = `back-end` (không có `/` ở đầu)
- [ ] Đã save settings trên Railway
- [ ] Đã đợi Railway redeploy
- [ ] Đã kiểm tra logs không còn lỗi `CaptchaService not found`
- [ ] Build thành công ✅

---

## 🆘 Vẫn Không Được?

**Gửi cho tôi:**
1. Screenshot phần "Root Directory" trên Railway
2. Screenshot cấu trúc thư mục trên GitHub
3. Logs từ Railway deployment

Tôi sẽ giúp bạn fix tiếp!

