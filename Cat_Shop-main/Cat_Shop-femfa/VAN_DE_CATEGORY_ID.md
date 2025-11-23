# VẤN ĐỀ: Category ID không được trả về từ Backend

## 🔴 Vấn đề

1. **Backend CategoryResponse không có `categoryId`**:
   - DTO chỉ có: `categoryName`, `description`, `typeId`
   - Không có `categoryId` hoặc `typeName`

2. **Frontend không lấy được ID thực**:
   - Đang dùng ID tạm thời (1000000+) cho categories
   - Không thể edit/delete vì không có ID hợp lệ
   - Product stats = 0 vì không match được với ID thực

3. **TypeName hiển thị "Không xác định"**:
   - Backend không trả về `typeName`, chỉ có `typeId`
   - Frontend đã có mapping tạm thời từ `typeId` -> `typeName`

## 🔍 Nguyên nhân

Backend `CategoryResponse.java`:
```java
public class CategoryResponse {
    private String categoryName;
    private String description;
    private Long typeId;
    // ❌ Không có categoryId
    // ❌ Không có typeName
}
```

## ✅ Giải pháp đã áp dụng

### 1. Lấy categoryId từ Products
- Tạo mapping: `categoryName + typeId` -> `categoryId` từ products
- Enrich categories với ID từ mapping này
- Dùng ID này để count products và update/delete

### 2. Map typeId -> typeName
- Dùng hardcode mapping tạm thời:
  - `1` -> "Cat" -> "Mèo cảnh"
  - `2` -> "Food" -> "Thức ăn"
  - `3` -> "Cage" -> "Lồng chuồng"
  - `4` -> "Cleaning" -> "Vệ sinh"

### 3. Logging để debug
- Thêm console.log để xem response thực tế từ backend
- Log mapping và ID để debug

## ⚠️ Hạn chế

1. **Categories không có products sẽ không có ID**:
   - Nếu category mới chưa có product nào, sẽ không lấy được ID từ mapping
   - Cần reload trang sau khi tạo category mới để lấy ID từ backend

2. **Phụ thuộc vào products**:
   - Nếu products cũng không có categoryId, mapping sẽ không hoạt động
   - Cần đảm bảo products có categoryId hợp lệ

## 🎯 Giải pháp tốt nhất (cần sửa backend)

**Nhưng user đã yêu cầu không sửa backend**, vậy nên:

1. ✅ **Đã làm**: Lấy ID từ products mapping
2. ✅ **Đã làm**: Map typeId -> typeName
3. ⚠️ **Cần làm**: Kiểm tra console.log để xem backend có trả về ID không (có thể Jackson serialize từ entity)

## 📝 Kiểm tra

Sau khi reload trang, kiểm tra console để xem:
- `Categories response from API:` - Response thực tế từ backend
- `Category ID mapping từ products:` - Mapping đã tạo
- `Edit category - ID check:` - ID khi edit

Nếu backend vẫn không trả về ID, cần:
1. Sửa backend để thêm `categoryId` vào `CategoryResponse` (nhưng user nói không sửa)
2. Hoặc tạo API endpoint riêng để query categoryId từ categoryName + typeId
3. Hoặc dùng cách khác để lưu mapping (localStorage, cache, ...)

