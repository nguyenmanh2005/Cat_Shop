-- Script SQL để sửa lỗi foreign key constraint NGAY LẬP TỨC
-- Chạy script này trong PostgreSQL trước khi khởi động Spring Boot

-- 1. Tắt foreign key constraint tạm thời
ALTER TABLE categories DROP CONSTRAINT IF EXISTS fk1b1u67jq7fr7983e61xkhhd8a;
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk98l10qwb1l2ywp1d24x1d3ef2;

-- 2. Lấy type_id hợp lệ đầu tiên (giả sử có ít nhất 1 ProductType)
-- Nếu không có ProductType nào, cần tạo trước
DO $$
DECLARE
    valid_type_id BIGINT;
BEGIN
    -- Lấy type_id hợp lệ đầu tiên
    SELECT type_id INTO valid_type_id FROM product_types LIMIT 1;
    
    IF valid_type_id IS NULL THEN
        RAISE NOTICE 'Không có ProductType nào trong database!';
        -- Tạo ProductType mặc định nếu chưa có
        INSERT INTO product_types (type_name) VALUES ('Default') RETURNING type_id INTO valid_type_id;
    END IF;
    
    -- Sửa categories có type_id không tồn tại
    UPDATE categories 
    SET type_id = valid_type_id 
    WHERE type_id NOT IN (SELECT type_id FROM product_types);
    
    -- Sửa products có type_id không tồn tại
    UPDATE products 
    SET type_id = valid_type_id 
    WHERE type_id NOT IN (SELECT type_id FROM product_types);
    
    -- Xóa các bản ghi không thể sửa được
    DELETE FROM categories WHERE type_id NOT IN (SELECT type_id FROM product_types);
    DELETE FROM products WHERE type_id NOT IN (SELECT type_id FROM product_types);
    
    RAISE NOTICE 'Đã sửa xong dữ liệu!';
END $$;

-- 3. Tạo lại foreign key constraint
ALTER TABLE categories 
ADD CONSTRAINT fk1b1u67jq7fr7983e61xkhhd8a 
FOREIGN KEY (type_id) REFERENCES product_types(type_id);

ALTER TABLE products 
ADD CONSTRAINT fk98l10qwb1l2ywp1d24x1d3ef2 
FOREIGN KEY (type_id) REFERENCES product_types(type_id);

