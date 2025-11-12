-- Script để sửa lỗi foreign key constraint
-- Xóa hoặc cập nhật các bản ghi có type_id=5 không tồn tại

-- 1. Kiểm tra xem có ProductType id=5 không
SELECT * FROM product_types WHERE type_id = 5;

-- 2. Nếu không có, xóa các categories có type_id=5
DELETE FROM categories WHERE type_id = 5 AND type_id NOT IN (SELECT type_id FROM product_types);

-- 3. Xóa các products có type_id=5
DELETE FROM products WHERE type_id = 5 AND type_id NOT IN (SELECT type_id FROM product_types);

-- 4. Hoặc cập nhật type_id=5 thành type_id hợp lệ (ví dụ: 1, 2, 3, 4)
-- Lấy type_id hợp lệ đầu tiên
UPDATE categories 
SET type_id = (SELECT MIN(type_id) FROM product_types)
WHERE type_id = 5 AND type_id NOT IN (SELECT type_id FROM product_types);

UPDATE products 
SET type_id = (SELECT MIN(type_id) FROM product_types)
WHERE type_id = 5 AND type_id NOT IN (SELECT type_id FROM product_types);

