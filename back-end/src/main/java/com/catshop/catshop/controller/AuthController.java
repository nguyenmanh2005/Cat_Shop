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
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
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

        log.info("🔐 Login request received for email: {}", loginRequest.getEmail());
        String email = loginRequest.getEmail();
        String deviceId = loginRequest.getDeviceId();
        
        // Xử lý trường hợp deviceId null hoặc empty
        if (deviceId == null || deviceId.isBlank()) {
            log.warn("⚠️ DeviceId is null or empty for email: {}", email);
            throw new BadRequestException("Thiết bị ID không được để trống");
        }
        
        // 1️⃣ Kiểm tra email + password
        // Nếu email/password sai → throw exception ngay
        try {
            authService.validateCredentials(loginRequest);
            log.info("✅ Credentials validated for: {}", email);
        } catch (com.catshop.catshop.exception.ResourceNotFoundException e) {
            // Email không tồn tại
            log.error("❌ Email not found: {}", email);
            throw e; // Re-throw để GlobalExceptionHandler xử lý
        } catch (BadRequestException e) {
            // Mật khẩu sai
            log.error("❌ Invalid password for: {}", email);
            throw e; // Re-throw để GlobalExceptionHandler xử lý
        } catch (Exception e) {
            log.error("❌ Credential validation failed for {}: {}", email, e.getMessage(), e);
            throw new BadRequestException("Email hoặc mật khẩu không chính xác");
        }

        // 2️⃣ Sau khi email/password đúng → cấp token ngay và cho phép đăng nhập
        // Không kiểm tra device trust - OTP là phương thức đăng nhập riêng, không phải bước bắt buộc
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));

            // Kiểm tra device trust chỉ để log (không chặn đăng nhập)
            try {
                boolean trusted = deviceService.isTrusted(email, deviceId);
                log.info("🔍 Device trust check for {}: trusted={}", email, trusted);
                
                if (!trusted) {
                    log.info("⚠️ New device detected for: {} - Device will be marked as trusted after successful login", email);
                    // Đánh dấu thiết bị là trusted sau khi đăng nhập thành công
                    String ip = request.getRemoteAddr();
                    String agent = request.getHeader("User-Agent");
                    try {
                        deviceService.markTrusted(email, deviceId, ip, agent);
                    } catch (Exception e) {
                        log.warn("⚠️ Failed to mark device as trusted for {}: {}", email, e.getMessage());
                        // Không chặn đăng nhập nếu không thể mark device as trusted
                    }
                }
            } catch (Exception e) {
                log.warn("⚠️ Failed to check device trust for {}: {}", email, e.getMessage());
                // Không chặn đăng nhập nếu không thể check device trust
            }

            // Cấp token ngay sau khi credentials đúng
            String accessToken = authService.generateAccessTokenForUser(user);
            String refreshToken = authService.generateRefreshTokenForUser(user);
            
            // Lưu refresh token (có thể fail nếu Redis không chạy, nhưng không chặn đăng nhập)
            try {
                authService.saveRefreshToken(email, refreshToken);
            } catch (Exception e) {
                log.warn("⚠️ Failed to save refresh token for {}: {}. User can still login but may need to login again after token expires.", email, e.getMessage());
                // Không chặn đăng nhập nếu không thể lưu refresh token
            }

            TokenResponse tokens = new TokenResponse(accessToken, refreshToken, false);
            log.info("✅ Login successful for: {}", email);
            return ResponseEntity.ok(ApiResponse.success(tokens, "Đăng nhập thành công"));
        } catch (BadRequestException e) {
            log.error("❌ Bad request during login for {}: {}", email, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ Unexpected error during login for {}: {}", email, e.getMessage(), e);
            throw new BadRequestException("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
        }
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
        log.info("📝 Register request received for email: {}", request.getEmail());
        
        try {
            boolean created = authService.register(request);
            if (!created) {
                log.error("❌ Failed to create user for email: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(400, "Không thể tạo tài khoản"));
            }
            log.info("✅ User registered successfully: {}", request.getEmail());
            return ResponseEntity.ok(ApiResponse.success("Tạo tài khoản thành công", "User created successfully"));
        } catch (BadRequestException e) {
            // Email đã tồn tại, số điện thoại đã tồn tại, etc.
            log.error("❌ Registration failed for {}: {}", request.getEmail(), e.getMessage());
            throw e; // Re-throw để GlobalExceptionHandler xử lý
        } catch (Exception e) {
            log.error("❌ Unexpected error during registration for {}: {}", request.getEmail(), e.getMessage(), e);
            throw new BadRequestException("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.");
        }
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

    // ✅ Gửi OTP khi user click nút "Nhận OTP"
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email không được để trống");
        }
        
        try {
            authService.sendOtp(email);
            log.info("✅ OTP sent successfully to: {}", email);
            return ResponseEntity.ok(ApiResponse.success(
                    "Mã OTP đã được gửi đến email của bạn",
                    "OTP sent successfully"));
        } catch (Exception e) {
            log.error("❌ Failed to send OTP to {}: {}", email, e.getMessage(), e);
            throw new BadRequestException("Không thể gửi OTP. Vui lòng thử lại sau hoặc kiểm tra email của bạn.");
        }
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
