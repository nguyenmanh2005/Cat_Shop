package com.catshop.catshop.service;

import com.catshop.catshop.entity.User;

import java.util.List;

public interface BackupCodeService {
    /**
     * Tạo danh sách backup codes cho user
     * @param user User cần tạo backup codes
     * @param count Số lượng codes cần tạo (thường là 10)
     * @return Danh sách backup codes dạng plain text (chỉ hiển thị 1 lần)
     */
    List<String> generateBackupCodes(User user, int count);

    /**
     * Xác thực backup code
     * @param user User đang đăng nhập
     * @param code Backup code từ user nhập
     * @return true nếu code hợp lệ và chưa dùng, false nếu không
     */
    boolean verifyBackupCode(User user, String code);

    /**
     * Tạo lại backup codes (xóa codes cũ và tạo mới)
     * @param user User cần tạo lại codes
     * @param count Số lượng codes mới
     * @return Danh sách backup codes mới
     */
    List<String> regenerateBackupCodes(User user, int count);

    /**
     * Đếm số backup codes còn lại (chưa dùng) của user
     * @param user User cần kiểm tra
     * @return Số lượng codes còn lại
     */
    long getRemainingBackupCodesCount(User user);

    /**
     * Lấy danh sách backup codes còn lại (chỉ để hiển thị số lượng, không hiển thị code)
     * @param user User cần kiểm tra
     * @return Số lượng codes còn lại
     */
    long getAvailableBackupCodesCount(User user);
}

