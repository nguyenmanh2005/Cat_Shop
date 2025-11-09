package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.OtpRequest;
import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.TokenResponse;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.AuthService;
import com.catshop.catshop.service.MfaService;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final MfaService mfaService;

    // ✅ Bước 1: Login (gửi OTP)
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@Valid @RequestBody LoginRequest loginRequest) {
        String message = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(message, "Đăng nhập bước 1 (OTP)"));
    }

    // ✅ Bước 2: Xác thực OTP -> trả về Access & Refresh Token
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<TokenResponse>> verifyOtp(@Valid @RequestBody OtpRequest otpRequest) {
        TokenResponse tokenResponse = authService.verifyOtp(otpRequest);

        if (tokenResponse.isMfaRequired()) {
            // Trả status 206 (Partial Content) hoặc 200 kèm flag; mình dùng 200 nhưng kèm message rõ
            return ResponseEntity.ok(ApiResponse.success(tokenResponse, "OTP hợp lệ. Vui lòng nhập mã Google Authenticator (MFA)"));
        }

        return ResponseEntity.ok(ApiResponse.success(tokenResponse, "OTP xác thực thành công, đăng nhập thành công"));
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<ApiResponse<TokenResponse>> verifyMfa(@RequestParam String email,
                                                                @RequestParam int code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        if (user.getMfaSecret() == null) {
            throw new BadRequestException("User chưa kích hoạt MFA");
        }

        boolean ok = mfaService.verifyCode(user.getMfaSecret(), code);

        if (!ok) {
            throw new BadRequestException("Mã MFA không hợp lệ");
        }

        // MFA đúng -> cấp token
        String accessToken = authService.generateAccessTokenForUser(user); // chúng ta sẽ thêm method helper vào AuthService
        String refreshToken = authService.generateRefreshTokenForUser(user);
        authService.saveRefreshToken(user.getEmail(), refreshToken);

        // Lưu refresh token vào Redis (7 ngày)
        // nếu bạn muốn reuse logic từ AuthServiceImpl, dễ nhất là add 2 method generate+save tokens vào AuthService/impl

        TokenResponse tokenResponse = new TokenResponse(accessToken, refreshToken, false);
        return ResponseEntity.ok(ApiResponse.success(tokenResponse, "Đăng nhập thành công (MFA)"));
    }

    @PostMapping("/mfa/enable")
    public ResponseEntity<ApiResponse<Map<String, String>>> enableMfa(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String secret = mfaService.generateSecret();
        user.setMfaSecret(secret);
        user.setMfaEnabled(true);
        userRepository.save(user);

        // Tạo QR code Base64 chuẩn, đảm bảo quét được
        String qrBase64 = mfaService.generateQrBase64(user.getEmail(), secret);

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("secret", secret, "qrBase64", qrBase64),
                "MFA enabled. Scan QR code in Google Authenticator"
        ));
    }



    // ✅ Đăng ký tài khoản mới
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody UserRequest request) {
        boolean created = authService.register(request);
        if (!created) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400, "Không thể tạo tài khoản"));
        }
        return ResponseEntity.ok(ApiResponse.success("Tạo tài khoản thành công", "User created successfully"));
    }

    // ✅ Làm mới Access Token bằng Refresh Token (qua Header)
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refreshToken(
            @RequestHeader("Authorization") String bearerToken) {

        // Header có dạng: "Bearer <refresh_token>"
        String refreshToken = bearerToken.replace("Bearer ", "").trim();

        String newAccessToken = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(newAccessToken, "Access token refreshed successfully"));
    }

    // ✅ Logout: xóa refresh token trong Redis
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@RequestHeader("Authorization") String bearerToken) {
        // Bearer token có dạng: "Bearer user@example.com"
        String email = bearerToken.replace("Bearer ", "").trim();
        authService.logout(email);
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", "Logged out successfully"));
    }




}
