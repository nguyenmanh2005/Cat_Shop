package com.catshop.catshop.service;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Service xử lý bảo mật IP address
 * - Kiểm tra IP mới/lạ
 * - Gửi email cảnh báo khi có đăng nhập từ IP mới
 * - Quản lý danh sách IP đã biết
 */
public interface IpSecurityService {
    /**
     * Kiểm tra IP có phải là IP mới không
     * @param email Email của user
     * @param request HttpServletRequest để lấy IP
     * @return true nếu là IP mới, false nếu là IP đã biết
     */
    boolean isNewIp(String email, HttpServletRequest request);

    /**
     * Lưu IP vào danh sách IP đã biết
     * @param email Email của user
     * @param request HttpServletRequest để lấy IP và User-Agent
     */
    void saveKnownIp(String email, HttpServletRequest request);

    /**
     * Gửi email cảnh báo khi có đăng nhập từ IP mới
     * (chỉ cảnh báo, không kèm link đổi mật khẩu)
     * @param email Email của user
     * @param ipAddress IP address mới
     * @param userAgent User-Agent
     */
    void sendSecurityAlertEmail(String email, String ipAddress, String userAgent);
}

