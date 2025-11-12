package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.MfaVerifyRequest;
import com.catshop.catshop.dto.request.OtpRequest;
import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.TokenResponse;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.AuthService;
import com.catshop.catshop.service.DeviceService;
import com.catshop.catshop.service.MfaService;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import jakarta.servlet.http.HttpServletRequest;
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
    private final DeviceService deviceService;

    // ✅ Bước 1: Login (gửi OTP nếu thiết bị lạ)
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {

        String email = loginRequest.getEmail();
        String deviceId = loginRequest.getDeviceId();
        String ip = request.getRemoteAddr();
        String agent = request.getHeader("User-Agent");

        // 1️⃣ Kiểm tra email + password
        authService.validateCredentials(loginRequest);

        // 2️⃣ Kiểm tra thiết bị tin cậy
        boolean trusted = deviceService.isTrusted(email, deviceId);

        if (!trusted) {
            // 3️⃣ Gửi OTP vì thiết bị mới
            authService.sendOtp(email);
            return ResponseEntity.ok(ApiResponse.success(
                    "",
                    "Thiết bị mới phát hiện. Mã OTP đã được gửi đến email của bạn."));
        }

        // 4️⃣ Thiết bị đã tin cậy → cấp token luôn
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));

        String accessToken = authService.generateAccessTokenForUser(user);
        String refreshToken = authService.generateRefreshTokenForUser(user);
        authService.saveRefreshToken(email, refreshToken);

        TokenResponse tokens = new TokenResponse(accessToken, refreshToken, false);
        return ResponseEntity.ok(ApiResponse.success(tokens, "Đăng nhập thành công (thiết bị quen thuộc)"));
    }


    // ✅ Bước 2: Xác thực OTP -> trả về Access & Refresh Token
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<TokenResponse>> verifyOtp(
            @Valid @RequestBody OtpRequest otpRequest,
            HttpServletRequest request) {

        String email = otpRequest.getEmail();
        String deviceId = otpRequest.getDeviceId();

        if (deviceId == null || deviceId.isBlank()) {
            throw new BadRequestException("Thiết bị ID không được để trống");
        }

        // ✅ Kiểm tra + xác thực OTP
        TokenResponse tokenResponse = authService.verifyOtp(otpRequest);

        // ✅ Nếu OTP đúng → đánh dấu thiết bị là trusted
        String ip = request.getRemoteAddr();
        String agent = request.getHeader("User-Agent");

        deviceService.markTrusted(email, deviceId, ip, agent);

        // ✅ Nếu user bật MFA → yêu cầu thêm bước 2FA
        if (tokenResponse.isMfaRequired()) {
            return ResponseEntity.ok(ApiResponse.success(tokenResponse,
                    "OTP hợp lệ. Vui lòng nhập mã Google Authenticator (MFA)"));
        }

        // ✅ Hoàn tất login
        return ResponseEntity.ok(ApiResponse.success(tokenResponse,
                "OTP xác thực thành công. Thiết bị đã được đánh dấu là tin cậy."));
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<ApiResponse<TokenResponse>> verifyMfa(
            @RequestBody @Valid MfaVerifyRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy user với email: " + request.getEmail()));

        if (user.getMfaSecret() == null) {
            throw new BadRequestException("User chưa kích hoạt MFA");
        }

        boolean ok = mfaService.verifyCode(user.getMfaSecret(), request.getCode());

        if (!ok) {
            throw new BadRequestException("Mã MFA không hợp lệ");
        }

        String accessToken = authService.generateAccessTokenForUser(user);
        String refreshToken = authService.generateRefreshTokenForUser(user);
        authService.saveRefreshToken(user.getEmail(), refreshToken);

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
