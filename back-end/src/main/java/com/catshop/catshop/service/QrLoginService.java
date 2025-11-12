package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.QrLoginRequest;
import com.catshop.catshop.dto.response.QrLoginResponse;
import com.catshop.catshop.dto.response.QrLoginStatusResponse;
import com.catshop.catshop.dto.response.TokenResponse;

public interface QrLoginService {
    /**
     * Tạo QR code cho đăng nhập
     * @return QrLoginResponse chứa QR code base64 và session ID
     */
    QrLoginResponse generateQrCode();

    /**
     * Xác nhận đăng nhập từ mobile app sau khi scan QR code
     * @param request Chứa sessionId, email, password, deviceId
     * @return true nếu thành công
     */
    boolean confirmQrLogin(QrLoginRequest request);

    /**
     * Xác nhận đăng nhập bằng token (nếu user đã đăng nhập trên mobile)
     * @param sessionId Session ID từ QR code
     * @param accessToken Access token từ mobile (nếu user đã đăng nhập)
     * @param deviceId Device ID
     * @return true nếu thành công
     */
    boolean confirmQrLoginWithToken(String sessionId, String accessToken, String deviceId);

    /**
     * Kiểm tra trạng thái của QR login session
     * @param sessionId Session ID từ QR code
     * @return QrLoginStatusResponse với status và tokens (nếu đã approve)
     */
    QrLoginStatusResponse checkStatus(String sessionId);
}

