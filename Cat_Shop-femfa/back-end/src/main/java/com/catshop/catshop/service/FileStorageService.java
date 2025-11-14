package com.catshop.catshop.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;

@Slf4j
@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String saveFile(MultipartFile file, String product_Name) throws IOException {
        if (file == null || file.isEmpty()) return null;

        String contentType = file.getContentType();

        if(!contentType.startsWith("image/")){
            throw new BadRequestException("Chỉ cho phép upload hình ảnh!");
        }
        // Lấy đường dẫn tuyệt đối đến thư mục upload
        Path folderPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        // Kiểm tra nếu thư mục chưa tồn tại thì tạo mới
        if (!Files.exists(folderPath)) {
            Files.createDirectories(folderPath);
        }

        // Đặt tên file: thêm timestamp để tránh trùng tên file
        String fileName = System.currentTimeMillis() + "_" + product_Name;

        // Xác định đường dẫn cuối cùng của file cần lưu ( đường dẫn tuyệt đối ở class Paths , cụ thể phương thức get -> có thể chuyển thành tương đối và tuyệt đối , trong bài này chuyển thành tuyệt đối + filename )
        Path targetPath = folderPath.resolve(fileName);

        // InputStream là một file, nhưng được Spring Boot giữ ở dạng nhị phân (binary data).
        InputStream multipartFile = file.getInputStream();
        // Ghi file từ input stream vào thư mục (ghi đè nếu trùng tên)
        // Sử dụng lớp tiện ích ( chứa các static methods ) để thao tác với file dựa vào đường dẫn
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Trả về đường dẫn file đã lưu (để controller trả về client)
        return targetPath.toString();
    }

    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Không thể xóa file: " + filePath);
        }
    }

}
