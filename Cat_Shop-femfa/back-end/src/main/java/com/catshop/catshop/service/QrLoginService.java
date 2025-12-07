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
     * Xác nhận đăng nhập từ thiết bị đã đăng nhập sẵn (dùng access token)
     * @param sessionId Session ID từ QR code
     * @param accessToken Access token của user trên điện thoại
     */
    void confirmQrLoginWithAccessToken(String sessionId, String accessToken);

    /**
     * Kiểm tra trạng thái của QR login session
     * @param sessionId Session ID từ QR code
     * @return QrLoginStatusResponse với status và tokens (nếu đã approve)
     */
    QrLoginStatusResponse checkStatus(String sessionId);
}

