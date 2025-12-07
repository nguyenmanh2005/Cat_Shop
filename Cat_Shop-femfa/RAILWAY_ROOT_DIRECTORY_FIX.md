# 🔧 Fix Lỗi "Railpack could not determine how to build"

Lỗi này xảy ra vì Railway không tìm thấy code ở đúng vị trí. Cần set **Root Directory** đúng.

---

## 🎯 Nguyên Nhân

Railway đang scan root directory nhưng:
- Code nằm trong subdirectory `Cat_Shop-femfa/`
- Hoặc Root Directory chưa được set đúng

---

## ✅ Cách Fix: Set Root Directory

### Bước 1: Vào Service Settings

1. Click vào service vừa tạo
2. Click tab **"Settings"**
3. Scroll xuống phần **"Build & Deploy"**

### Bước 2: Set Root Directory

Tìm phần **"Root Directory"** và set:

#### Cho Backend Service:
```
back-end
```

**Hoặc nếu repo có subdirectory:**
```
Cat_Shop-femfa/back-end
```

#### Cho Frontend Service:
```
frontend
```

**Hoặc nếu repo có subdirectory:**
```
Cat_Shop-femfa/frontend
```

### Bước 3: Set Dockerfile Path

Trong phần **"Dockerfile Path"**:

#### Cho Backend:
```
back-end/Dockerfile
```

**Hoặc:**
```
Cat_Shop-femfa/back-end/Dockerfile
```

#### Cho Frontend:
```
frontend/Dockerfile
```

**Hoặc:**
```
Cat_Shop-femfa/frontend/Dockerfile
```

### Bước 4: Save & Redeploy

1. Click **"Save"** hoặc **"Update"**
2. Railway sẽ tự động redeploy
3. Hoặc click **"Redeploy"** trong tab "Deployments"

---

## 🎯 Cách Tốt Nhất: Tạo Service Mới Với Root Directory Đúng

### Bước 1: Xóa Service Cũ (Nếu Cần)

1. Vào service
2. Settings → Delete Service

### Bước 2: Tạo Service Mới

1. Click **"New"** → **"GitHub Repo"**
2. Chọn repository **"nguyenmanh2005/Cat_Shop"**
3. Railway sẽ hỏi **"Configure Service"**

### Bước 3: Cấu Hình Backend

Trong màn hình "Configure Service":

1. **Service Name**: `backend`
2. **Root Directory**: 
   ```
   back-end
   ```
   (Nếu repo có subdirectory thì: `Cat_Shop-femfa/back-end`)
3. **Build Command**: (để trống)
4. **Start Command**: (để trống)
5. Click **"Deploy"**

### Bước 4: Cấu Hình Frontend

1. Click **"New"** → **"GitHub Repo"**
2. Chọn **CÙNG repository**
3. **Service Name**: `frontend`
4. **Root Directory**: 
   ```
   frontend
   ```
   (Nếu repo có subdirectory thì: `Cat_Shop-femfa/frontend`)
5. **Build Command**: (để trống)
6. **Start Command**: (để trống)
7. Click **"Deploy"**

---

## 🔍 Kiểm Tra Cấu Trúc Repo

Để biết chính xác Root Directory, kiểm tra cấu trúc repo:

### Nếu repo có cấu trúc:
```
Cat_Shop/
├── back-end/
│   └── Dockerfile
├── frontend/
│   └── Dockerfile
└── docker-compose.yml
```

→ Root Directory: `back-end` hoặc `frontend`

### Nếu repo có subdirectory:
```
Cat_Shop-femfa/
└── Cat_Shop-femfa/
    ├── back-end/
    │   └── Dockerfile
    ├── frontend/
    │   └── Dockerfile
    └── docker-compose.yml
```

→ Root Directory: `Cat_Shop-femfa/back-end` hoặc `Cat_Shop-femfa/frontend`

---

## 📝 Cách Xác Định Root Directory

1. Vào GitHub repo của bạn
2. Xem cấu trúc thư mục
3. Tìm thư mục chứa `Dockerfile`:
   - Backend: `back-end/Dockerfile`
   - Frontend: `frontend/Dockerfile`
4. Root Directory = đường dẫn từ root repo đến thư mục đó

**Ví dụ:**
- Nếu `Dockerfile` ở: `back-end/Dockerfile`
- → Root Directory: `back-end`

- Nếu `Dockerfile` ở: `Cat_Shop-femfa/back-end/Dockerfile`
- → Root Directory: `Cat_Shop-femfa/back-end`

---

## ✅ Checklist

- [ ] Đã xác định đúng cấu trúc repo
- [ ] Đã set Root Directory đúng cho backend
- [ ] Đã set Root Directory đúng cho frontend
- [ ] Đã set Dockerfile Path (nếu cần)
- [ ] Đã save settings
- [ ] Đã redeploy
- [ ] Đã kiểm tra logs không còn lỗi

---

## 🆘 Vẫn Lỗi?

### Kiểm Tra:

1. **Dockerfile có tồn tại không?**
   - Vào GitHub repo
   - Kiểm tra `back-end/Dockerfile` có không
   - Kiểm tra `frontend/Dockerfile` có không

2. **Root Directory đúng chưa?**
   - Phải match với cấu trúc thư mục trên GitHub
   - Không có dấu `/` ở đầu
   - Đúng case-sensitive (back-end không phải Back-End)

3. **Xem logs chi tiết:**
   - Click "View logs" trong deployment
   - Tìm lỗi cụ thể về path

---

**Chúc bạn fix thành công! 🚀**

