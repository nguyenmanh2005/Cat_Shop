# Sửa Triệt Để CORS và Out of Memory

## Vấn Đề

1. **CORS Error**: `No 'Access-Control-Allow-Origin' header is present`
2. **502 Bad Gateway**: Backend đang crash
3. **Out of Memory**: Backend hết RAM

## Nguyên Nhân

- Backend đang crash do hết RAM → không trả về CORS headers
- JVM không có memory limits → dùng quá nhiều RAM

---

## Giải Pháp Đã Áp Dụng

### 1. Thêm JVM Memory Options

Đã thêm vào `Dockerfile`:
- `-Xmx512m`: Giới hạn heap memory tối đa 512MB
- `-Xms256m`: Heap memory ban đầu 256MB
- `-XX:+UseG1GC`: Dùng G1 garbage collector (tối ưu cho low memory)
- `-XX:MaxMetaspaceSize=128m`: Giới hạn metaspace
- `-XX:+ExitOnOutOfMemoryError`: Thoát ngay khi hết memory (để Railway restart)

### 2. Cải Thiện CorsFilter

- Thêm logging để debug
- Đảm bảo CORS headers luôn được set, kể cả khi có lỗi

---

## Các Bước Cần Làm

### Bước 1: Kiểm Tra REDIS_PASSWORD và FRONTEND_URL

**Vào service "Cat_Shop" → Variables:**

1. **REDIS_PASSWORD**:
   - Phải có giá trị: `zGFGarMNvDEZZWKdEochhpXxVdriBDtV`
   - Nếu rỗng → Thêm vào

2. **FRONTEND_URL**:
   - Phải là: `https://strong-ambition-production.up.railway.app`
   - **KHÔNG có `/` ở cuối**
   - Nếu có `/` → Xóa đi

---

### Bước 2: Tăng Memory Limit trên Railway (QUAN TRỌNG)

1. **Vào service "Cat_Shop"** → tab **"Settings"**
2. **Tìm phần "Resources"** hoặc **"Scaling"**
3. **Tăng Memory Limit:**
   - Tìm "Memory" hoặc "RAM"
   - Set = **512MB** hoặc **1GB** (nếu có)
   - Click "Save"

**Lưu ý:** Railway free tier có giới hạn memory. Nếu không có option này, có thể cần upgrade plan.

---

### Bước 3: Đợi Backend Redeploy

1. Railway sẽ tự động redeploy sau khi bạn push code
2. **Đợi 3-5 phút**
3. **Kiểm tra logs** xem backend đã start chưa

---

### Bước 4: Kiểm Tra Backend Logs

1. **Vào service "Cat_Shop"** → tab **"Logs"**
2. **Tìm các dòng:**
   - `Started CatShopApplication` → Backend đã start thành công
   - `OutOfMemoryError` → Vẫn còn lỗi memory
   - `Redis connection` → Kiểm tra Redis connection

---

## Nếu Vẫn Còn Lỗi Memory

### Option 1: Tối Ưu Code (Nếu có thể)

- Giảm số lượng data load cùng lúc
- Tối ưu database queries
- Giảm logging level trong production

### Option 2: Upgrade Railway Plan

- Railway free tier có giới hạn memory
- Có thể cần upgrade lên paid plan để có nhiều memory hơn

### Option 3: Giảm Memory Limit trong JVM

Nếu Railway chỉ cho phép ít memory, có thể giảm JVM memory:
- `-Xmx256m` (thay vì 512m)
- `-Xms128m` (thay vì 256m)

---

## Kiểm Tra Sau Khi Sửa

1. ✅ **REDIS_PASSWORD** đã được set
2. ✅ **FRONTEND_URL** đã đúng (không có `/` ở cuối)
3. ✅ **Memory limit** đã được tăng trên Railway
4. ✅ **Backend đã restart** và không còn crash
5. ✅ **Backend logs** không còn `OutOfMemoryError`
6. ✅ **CORS headers** đã được trả về

---

## Test

Sau khi sửa:

1. **Truy cập website:**
   ```
   https://strong-ambition-production.up.railway.app
   ```

2. **Kiểm tra Console (F12):**
   - Không còn CORS errors
   - API calls thành công

3. **Kiểm tra Network tab:**
   - Response headers có `Access-Control-Allow-Origin`
   - Status code = 200 (không còn 502)

---

## Tóm Tắt

1. ✅ Đã sửa code: JVM memory options + CORS filter
2. ⚠️ **Cần làm:** Kiểm tra REDIS_PASSWORD và FRONTEND_URL
3. ⚠️ **Cần làm:** Tăng memory limit trên Railway
4. ✅ Đợi backend redeploy
5. ✅ Test lại website

---

**Làm theo các bước trên và báo lại kết quả!**

