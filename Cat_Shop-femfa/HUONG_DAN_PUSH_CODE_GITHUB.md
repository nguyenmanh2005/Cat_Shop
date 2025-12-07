# Hướng Dẫn Push Code Lên GitHub - Từng Bước Chi Tiết

## Bước 1: Kiểm Tra Git Đã Cài Chưa

1. **Mở Terminal/Command Prompt:**
   - Windows: Nhấn `Win + R` → Gõ `cmd` → Enter
   - Hoặc mở PowerShell

2. **Kiểm tra Git:**
   ```bash
   git --version
   ```
   
   - Nếu thấy version (ví dụ: `git version 2.40.0`) → Git đã cài ✅
   - Nếu báo lỗi → Cần cài Git: https://git-scm.com/download/win

---

## Bước 2: Kiểm Tra Đã Kết Nối GitHub Chưa

1. **Kiểm tra Git config:**
   ```bash
   git config --global user.name
   git config --global user.email
   ```
   
   - Nếu thấy tên và email → Đã cấu hình ✅
   - Nếu không có → Cần cấu hình (xem Bước 3)

2. **Nếu chưa cấu hình, chạy:**
   ```bash
   git config --global user.name "Tên Của Bạn"
   git config --global user.email "email-cua-ban@gmail.com"
   ```
   
   **Ví dụ:**
   ```bash
   git config --global user.name "nguyenmanh2005"
   git config --global user.email "your-email@gmail.com"
   ```

---

## Bước 3: Vào Thư Mục Project

1. **Mở Terminal/Command Prompt**

2. **Di chuyển vào thư mục project:**
   ```bash
   cd "D:\2 Fix\Cat_Shop - Copy (2)\Cat_Shop-femfa"
   ```
   
   **Lưu ý:** Thay đường dẫn bằng đường dẫn thực tế của bạn

3. **Kiểm tra đã vào đúng thư mục:**
   ```bash
   dir
   ```
   
   - Phải thấy các thư mục: `back-end`, `frontend`, `README.md`, v.v.

---

## Bước 4: Kiểm Tra Git Status

1. **Chạy lệnh:**
   ```bash
   git status
   ```
   
   **Kết quả có thể:**
   - Nếu thấy "On branch main" → Đã có Git repo ✅
   - Nếu thấy "fatal: not a git repository" → Chưa có Git repo (xem Bước 5)

---

## Bước 5: Khởi Tạo Git Repo (Nếu Chưa Có)

**Chỉ làm nếu Bước 4 báo "not a git repository":**

1. **Khởi tạo Git:**
   ```bash
   git init
   ```

2. **Thêm remote repository:**
   ```bash
   git remote add origin https://github.com/nguyenmanh2005/Cat_Shop.git
   ```
   
   **Lưu ý:** Thay `nguyenmanh2005/Cat_Shop` bằng tên repo thực tế của bạn

---

## Bước 6: Kiểm Tra Remote Repository

1. **Kiểm tra remote đã đúng chưa:**
   ```bash
   git remote -v
   ```
   
   **Kết quả phải thấy:**
   ```
   origin  https://github.com/nguyenmanh2005/Cat_Shop.git (fetch)
   origin  https://github.com/nguyenmanh2005/Cat_Shop.git (push)
   ```

2. **Nếu chưa có hoặc sai:**
   ```bash
   git remote remove origin
   git remote add origin https://github.com/nguyenmanh2005/Cat_Shop.git
   ```

---

## Bước 7: Add Tất Cả Files

1. **Xem files sẽ được add:**
   ```bash
   git status
   ```
   
   - Sẽ thấy danh sách files chưa được track (màu đỏ)

2. **Add tất cả files:**
   ```bash
   git add .
   ```
   
   **Lưu ý:** Dấu chấm (`.`) có nghĩa là "tất cả files"

3. **Kiểm tra lại:**
   ```bash
   git status
   ```
   
   - Files sẽ chuyển sang màu xanh (staged)

---

## Bước 8: Commit Code

1. **Commit với message:**
   ```bash
   git commit -m "Add frontend and backend code"
   ```
   
   **Lưu ý:** Message có thể là bất kỳ gì, ví dụ:
   - `"Initial commit"`
   - `"Add all files"`
   - `"Update code"`

2. **Nếu lần đầu commit, có thể cần set default branch:**
   ```bash
   git branch -M main
   ```

---

## Bước 9: Push Code Lên GitHub

1. **Push code lên GitHub:**
   ```bash
   git push origin main
   ```
   
   **Lưu ý:** 
   - Lần đầu push, GitHub sẽ yêu cầu đăng nhập
   - Có thể cần nhập username và password (hoặc Personal Access Token)

2. **Nếu yêu cầu đăng nhập:**
   - **Username:** Tên GitHub của bạn (ví dụ: `nguyenmanh2005`)
   - **Password:** Không dùng password thường, phải dùng **Personal Access Token**
   
   **Cách lấy Personal Access Token:**
   1. Vào GitHub: https://github.com/settings/tokens
   2. Click "Generate new token" → "Generate new token (classic)"
   3. Đặt tên: `Railway Deploy`
   4. Chọn quyền: `repo` (full control)
   5. Click "Generate token"
   6. Copy token (chỉ hiện 1 lần, lưu lại)
   7. Dùng token này thay cho password khi push

---

## Bước 10: Kiểm Tra Code Đã Push Chưa

1. **Vào GitHub:**
   - Truy cập: https://github.com/nguyenmanh2005/Cat_Shop
   - (Thay bằng repo của bạn)

2. **Kiểm tra:**
   - Phải thấy thư mục `frontend`
   - Phải thấy thư mục `back-end`
   - Phải thấy các files khác

3. **Nếu thấy đầy đủ → Đã push thành công! ✅**

---

## Bước 11: Redeploy trên Railway

Sau khi code đã có trên GitHub:

1. **Vào Railway Dashboard**
2. **Vào service "intelligent-transformation"** (frontend)
3. **Click tab "Deployments"**
4. **Click "Redeploy"** hoặc **"Deploy the repo"**
5. **Đợi Railway build lại** (3-5 phút)

---

## Lỗi Thường Gặp và Cách Sửa

### Lỗi 1: "fatal: not a git repository"

**Cách fix:**
```bash
git init
git remote add origin https://github.com/nguyenmanh2005/Cat_Shop.git
```

### Lỗi 2: "remote origin already exists"

**Cách fix:**
```bash
git remote remove origin
git remote add origin https://github.com/nguyenmanh2005/Cat_Shop.git
```

### Lỗi 3: "Authentication failed" khi push

**Cách fix:**
- Dùng Personal Access Token thay vì password
- Xem Bước 9 để lấy token

### Lỗi 4: "Updates were rejected"

**Cách fix:**
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

---

## Tóm Tắt Các Lệnh

```bash
# 1. Vào thư mục project
cd "D:\2 Fix\Cat_Shop - Copy (2)\Cat_Shop-femfa"

# 2. Kiểm tra status
git status

# 3. Add files
git add .

# 4. Commit
git commit -m "Add frontend and backend code"

# 5. Push lên GitHub
git push origin main
```

---

## Checklist

- [ ] Git đã cài và cấu hình
- [ ] Đã vào đúng thư mục project
- [ ] Đã add files (`git add .`)
- [ ] Đã commit (`git commit -m "..."`)
- [ ] Đã push lên GitHub (`git push origin main`)
- [ ] Đã kiểm tra code trên GitHub
- [ ] Đã redeploy trên Railway

---

**Làm theo từng bước trên và báo lại nếu gặp lỗi!**

