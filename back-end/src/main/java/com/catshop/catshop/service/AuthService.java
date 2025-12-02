package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.OtpRequest;
import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.TokenResponse;
import com.catshop.catshop.entity.User;

public interface AuthService {

    // Bước 1: login gửi OTP
//    String login(LoginRequest loginRequest);
    void validateCredentials(LoginRequest loginRequest);
    void sendOtp(String email);

    // SMS OTP methods
    String sendSmsOtp(String phoneNumber); // Trả về OTP để hiển thị trong dev mode
    TokenResponse verifySmsOtp(String email, String phoneNumber, String otp, String deviceId);

    // Bước 2: xác thực OTP → trả về token
    TokenResponse verifyOtp(OtpRequest request);

    // Đăng ký tài khoản
    boolean register(UserRequest request);

    // Xác thực email đăng ký
    void sendEmailVerification(String email);
    void verifyEmail(String token);

    // Làm mới access token bằng refresh token
    String refreshAccessToken(String refreshToken);

    // Đăng xuất (xóa refresh token)
    void logout(String email);

    String generateAccessTokenForUser(User user);
    String generateRefreshTokenForUser(User user);
    void saveRefreshToken(String email, String refreshToken);

    // Quên mật khẩu - gửi OTP và đặt lại mật khẩu bằng OTP
    void sendPasswordResetOtp(String email);
    void resetPassword(String email, String otp, String newPassword);
}
