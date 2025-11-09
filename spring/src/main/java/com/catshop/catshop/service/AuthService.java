package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.OtpRequest;
import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.TokenResponse;
import com.catshop.catshop.entity.User;

import java.util.Map;

public interface AuthService {

    // Bước 1: login gửi OTP
    String login(LoginRequest loginRequest);

    // Bước 2: xác thực OTP → trả về token
    TokenResponse verifyOtp(OtpRequest request);

    // Đăng ký tài khoản
    boolean register(UserRequest request);

    // Làm mới access token bằng refresh token
    String refreshAccessToken(String refreshToken);

    // Đăng xuất (xóa refresh token)
    void logout(String email);

    String generateAccessTokenForUser(User user);
    String generateRefreshTokenForUser(User user);
    void saveRefreshToken(String email, String refreshToken);


}
