package com.catshop.catshop.config;

import com.catshop.catshop.repository.ProductTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final ProductTypeRepository productTypeRepository;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            log.info("🔧 Đang kiểm tra và sửa lỗi foreign key constraints...");
            
            // Lấy type_id hợp lệ đầu tiên
            Long validTypeId = productTypeRepository.findAll().stream()
                    .map(pt -> pt.getTypeId())
                    .findFirst()
                    .orElse(null);

            if (validTypeId == null) {
                log.warn("⚠️ Không tìm thấy ProductType nào trong database!");
                return;
            }

            // Sửa categories có type_id không tồn tại
            String fixCategoriesSql = """
                UPDATE categories 
                SET type_id = ? 
                WHERE type_id NOT IN (SELECT type_id FROM product_types)
                """;
            int categoriesFixed = jdbcTemplate.update(fixCategoriesSql, validTypeId);
            if (categoriesFixed > 0) {
                log.info("✅ Đã sửa {} categories có type_id không hợp lệ", categoriesFixed);
            }

            // Sửa products có type_id không tồn tại
            String fixProductsSql = """
                UPDATE products 
                SET type_id = ? 
                WHERE type_id NOT IN (SELECT type_id FROM product_types)
                """;
            int productsFixed = jdbcTemplate.update(fixProductsSql, validTypeId);
            if (productsFixed > 0) {
                log.info("✅ Đã sửa {} products có type_id không hợp lệ", productsFixed);
            }

            // Xóa các categories và products không thể sửa được (nếu vẫn còn lỗi)
            String deleteInvalidCategoriesSql = """
                DELETE FROM categories 
                WHERE type_id NOT IN (SELECT type_id FROM product_types)
                """;
            int deletedCategories = jdbcTemplate.update(deleteInvalidCategoriesSql);
            if (deletedCategories > 0) {
                log.warn("⚠️ Đã xóa {} categories không thể sửa được", deletedCategories);
            }

            String deleteInvalidProductsSql = """
                DELETE FROM products 
                WHERE type_id NOT IN (SELECT type_id FROM product_types)
                """;
            int deletedProducts = jdbcTemplate.update(deleteInvalidProductsSql);
            if (deletedProducts > 0) {
                log.warn("⚠️ Đã xóa {} products không thể sửa được", deletedProducts);
            }

            log.info("✅ Hoàn tất kiểm tra và sửa lỗi foreign key constraints");
        } catch (Exception e) {
            log.error("❌ Lỗi khi sửa database: {}", e.getMessage(), e);
            // Không throw exception để app vẫn có thể khởi động
        }
    }
}

