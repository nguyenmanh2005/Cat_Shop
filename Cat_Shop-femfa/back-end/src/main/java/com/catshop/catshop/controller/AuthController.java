package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.MfaVerifyRequest;
import com.catshop.catshop.dto.request.OtpRequest;
import com.catshop.catshop.dto.request.QrLoginRequest;
import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.QrLoginResponse;
import com.catshop.catshop.dto.response.QrLoginStatusResponse;
import com.catshop.catshop.dto.response.TokenResponse;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.AuthService;
import com.catshop.catshop.service.DeviceService;
import com.catshop.catshop.service.IpSecurityService;
import com.catshop.catshop.service.MfaService;
import com.catshop.catshop.service.QrLoginService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
    private final IpSecurityService ipSecurityService;
    private final QrLoginService qrLoginService;
    private final com.catshop.catshop.service.BackupCodeService backupCodeService;
    private final com.catshop.catshop.security.JwtUtils jwtUtils;
    private final com.catshop.catshop.service.CaptchaService captchaService;
    private final com.catshop.catshop.service.EmailService emailService;

    // ✅ Bước 1: Login (gửi OTP nếu thiết bị lạ)
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {

        log.info("🔐 Login request received for email: {}", loginRequest.getEmail());
        String email = loginRequest.getEmail();
        String deviceId = loginRequest.getDeviceId();
        String captchaToken = loginRequest.getCaptchaToken();

        // Kiểm tra captcha đăng nhập
        if (!captchaService.verify(captchaToken)) {
            throw new BadRequestException("Captcha không hợp lệ");
        }
        
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

                // Không cho login nếu email chưa được xác thực
                if (Boolean.FALSE.equals(user.getEmailVerified())) {
                    throw new BadRequestException("Email chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản.");
                }

            // 🔒 Kiểm tra IP address - gửi email cảnh báo nếu là IP mới
            try {
                boolean isNewIp = ipSecurityService.isNewIp(email, request);
                String ip = request.getRemoteAddr();
                String agent = request.getHeader("User-Agent");
                
                if (isNewIp) {
                    log.warn("⚠️ [IP-SECURITY] New IP detected for {}: {}", email, ip);
                    // Gửi email cảnh báo (không kèm link đổi mật khẩu)
                    ipSecurityService.sendSecurityAlertEmail(email, ip, agent);
                    log.info("✅ [IP-SECURITY] Security alert email sent to: {}", email);
                } else {
                    // IP đã biết, lưu lại để cập nhật thống kê
                    ipSecurityService.saveKnownIp(email, request);
                }
            } catch (Exception e) {
                log.warn("⚠️ [IP-SECURITY] Failed to check IP security for {}: {}", email, e.getMessage());
                // Không chặn đăng nhập nếu không thể check IP security
            }

            // Cập nhật lastLogin mỗi lần đăng nhập thành công (dù thiết bị đã trusted hay chưa)
            try {
                boolean trusted = deviceService.isTrusted(email, deviceId);
                log.info("🔍 Device trust check for {}: trusted={}", email, trusted);
                
                String ip = request.getRemoteAddr();
                String agent = request.getHeader("User-Agent");
                
                if (!trusted) {
                    log.info("⚠️ New device detected for: {} - Device will be marked as trusted after successful login", email);
                    // Đánh dấu thiết bị là trusted sau khi đăng nhập thành công
                    try {
                        deviceService.markTrusted(email, deviceId, ip, agent);
                    } catch (Exception e) {
                        log.warn("⚠️ Failed to mark device as trusted for {}: {}", email, e.getMessage());
                        // Không chặn đăng nhập nếu không thể mark device as trusted
                    }
                } else {
                    // Thiết bị đã trusted, chỉ cập nhật lastLogin
                    try {
                        deviceService.updateLastLogin(email, deviceId, ip, agent);
                        log.info("✅ Updated lastLogin for trusted device: {}", deviceId);
                    } catch (Exception e) {
                        log.warn("⚠️ Failed to update lastLogin for {}: {}", email, e.getMessage());
                        // Không chặn đăng nhập nếu không thể update lastLogin
                    }
                }
            } catch (Exception e) {
                log.warn("⚠️ Failed to check device trust for {}: {}", email, e.getMessage());
                // Không chặn đăng nhập nếu không thể check device trust
            }
            
            // Lưu IP đã biết sau khi đăng nhập thành công
            try {
                ipSecurityService.saveKnownIp(email, request);
            } catch (Exception e) {
                log.warn("⚠️ [IP-SECURITY] Failed to save known IP for {}: {}", email, e.getMessage());
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

        // ✅ Nếu OTP đúng → cập nhật lastLogin (thiết bị đã trusted hoặc mới)
        String ip = request.getRemoteAddr();
        String agent = request.getHeader("User-Agent");
        
        // Kiểm tra xem thiết bị đã trusted chưa
        boolean trusted = deviceService.isTrusted(email, deviceId);
        if (trusted) {
            // Thiết bị đã trusted, chỉ cập nhật lastLogin
            deviceService.updateLastLogin(email, deviceId, ip, agent);
        } else {
            // Thiết bị mới, markTrusted (sẽ tự động cập nhật lastLogin)
            deviceService.markTrusted(email, deviceId, ip, agent);
        }

        // ✅ OTP verification hoàn tất - OTP và MFA là 2 phương thức xác thực độc lập
        return ResponseEntity.ok(ApiResponse.success(tokenResponse,
                "OTP xác thực thành công. Thiết bị đã được đánh dấu là tin cậy."));
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<ApiResponse<TokenResponse>> verifyMfa(
            @RequestBody @Valid MfaVerifyRequest request,
            HttpServletRequest httpRequest) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy user với email: " + request.getEmail()));

        if (user.getMfaSecret() == null) {
            throw new BadRequestException("User chưa kích hoạt MFA");
        }

        String code = request.getCode();
        boolean ok = false;
        String verificationMethod = "";

        // Kiểm tra xem code có phải là backup code không (format: XXXX-XXXX)
        if (code != null && code.matches("^[A-Z0-9]{4}-[A-Z0-9]{4}$")) {
            // Thử verify bằng backup code
            ok = backupCodeService.verifyBackupCode(user, code);
            verificationMethod = "backup code";
        } else {
            // Thử verify bằng Google Authenticator code (6 số)
            try {
                int mfaCode = Integer.parseInt(code);
                ok = mfaService.verifyCode(user.getMfaSecret(), mfaCode);
                verificationMethod = "Google Authenticator";
            } catch (NumberFormatException e) {
                ok = false;
            }
        }

        if (!ok) {
            throw new BadRequestException("Mã xác thực không hợp lệ. Vui lòng kiểm tra lại mã Google Authenticator hoặc backup code.");
        }

        String accessToken = authService.generateAccessTokenForUser(user);
        String refreshToken = authService.generateRefreshTokenForUser(user);
        authService.saveRefreshToken(user.getEmail(), refreshToken);
        
        // ✅ Cập nhật lastLogin sau khi verify MFA thành công
        String deviceId = request.getDeviceId();
        if (deviceId != null && !deviceId.isBlank()) {
            try {
                String ip = httpRequest.getRemoteAddr();
                String agent = httpRequest.getHeader("User-Agent");
                boolean trusted = deviceService.isTrusted(user.getEmail(), deviceId);
                if (trusted) {
                    deviceService.updateLastLogin(user.getEmail(), deviceId, ip, agent);
                } else {
                    deviceService.markTrusted(user.getEmail(), deviceId, ip, agent);
                }
            } catch (Exception e) {
                log.warn("⚠️ Failed to update lastLogin for MFA login {}: {}", user.getEmail(), e.getMessage());
            }
        }

        TokenResponse tokenResponse = new TokenResponse(accessToken, refreshToken, false);
        String message = verificationMethod.equals("backup code") 
            ? "Đăng nhập thành công (Backup Code). Mã này đã được sử dụng và không thể dùng lại."
            : "Đăng nhập thành công (MFA)";
        
        return ResponseEntity.ok(ApiResponse.success(tokenResponse, message));
    }



    @PostMapping("/mfa/enable")
    public ResponseEntity<ApiResponse<Map<String, Object>>> enableMfa(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String secret = mfaService.generateSecret();
        user.setMfaSecret(secret);
        user.setMfaEnabled(true);
        userRepository.save(user);

        // Tạo QR code Base64 chuẩn, đảm bảo quét được
        String qrBase64 = mfaService.generateQrBase64(user.getEmail(), secret);

        // Tự động tạo backup codes khi bật MFA
        java.util.List<String> backupCodes = backupCodeService.generateBackupCodes(user, 10);

        Map<String, Object> response = new HashMap<>();
        response.put("secret", secret);
        response.put("qrBase64", qrBase64);
        response.put("backupCodes", backupCodes);
        response.put("backupCodesCount", backupCodes.size());

        return ResponseEntity.ok(ApiResponse.success(
                response,
                "MFA enabled. Scan QR code in Google Authenticator. Lưu backup codes ở nơi an toàn."
        ));
    }



    // ✅ Đăng ký tài khoản mới + Captcha + gửi email xác thực
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody UserRequest request) {
        log.info("📝 Register request received for email: {}", request.getEmail());
        
        try {
            // Kiểm tra captcha
            if (!captchaService.verify(request.getCaptchaToken())) {
                throw new BadRequestException("Captcha không hợp lệ");
            }

            boolean created = authService.register(request);
            if (!created) {
                log.error("❌ Failed to create user for email: {}", request.getEmail());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(400, "Không thể tạo tài khoản"));
            }
            log.info("✅ User registered successfully: {}", request.getEmail());

            // Gửi lại email xác thực (phòng trường hợp user chưa nhận được)
            try {
                authService.sendEmailVerification(request.getEmail());
            } catch (Exception e) {
                log.warn("⚠️ Không thể gửi email xác thực cho {}: {}", request.getEmail(), e.getMessage());
            }

            return ResponseEntity.ok(ApiResponse.success(
                    "Tạo tài khoản thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
                    "User created successfully"));
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

    // ✅ Xác thực email đăng ký
    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam("token") String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success(
                "Xác thực email thành công. Bạn có thể đăng nhập.",
                "Email verified successfully"));
    }

    // ✅ Gửi SMS OTP khi user click nút "Gửi mã OTP"
    @PostMapping("/send-sms-otp")
    public ResponseEntity<ApiResponse<String>> sendSmsOtp(@RequestBody Map<String, String> request) {
        log.info("═══════════════════════════════════════════════════════════");
        log.info("📱 [SEND-SMS-OTP] Request received: {}", request);
        String phoneNumber = request.get("phoneNumber");
        if (phoneNumber == null || phoneNumber.isBlank()) {
            log.error("❌ [SEND-SMS-OTP] Phone number is null or blank");
            throw new BadRequestException("Số điện thoại không được để trống");
        }
        
        log.info("📱 [SEND-SMS-OTP] Processing SMS OTP request for phone: {}", phoneNumber);
        
        try {
            // Trong dev mode, lấy OTP để trả về trong response
            String otp = authService.sendSmsOtp(phoneNumber);
            log.info("✅ [SEND-SMS-OTP] SMS OTP sent successfully to: {}", phoneNumber);
            log.info("═══════════════════════════════════════════════════════════");
            
            // Trong dev mode, trả về OTP trong message để dễ test
            String message = "Mã OTP đã được gửi đến số điện thoại của bạn. " +
                    "(DEV MODE - OTP: " + otp + " - Vui lòng kiểm tra console backend để lấy mã)";
            return ResponseEntity.ok(ApiResponse.success(
                    message,
                    "SMS OTP sent successfully"));
        } catch (Exception e) {
            log.error("❌ [SEND-SMS-OTP] Failed to send SMS OTP to {}: {}", phoneNumber, e.getMessage());
            log.error("❌ [SEND-SMS-OTP] Exception type: {}", e.getClass().getName());
            log.error("❌ [SEND-SMS-OTP] Full exception: ", e);
            log.info("═══════════════════════════════════════════════════════════");
            throw new BadRequestException("Không thể gửi mã OTP qua SMS: " + e.getMessage());
        }
    }

    // ✅ Xác thực SMS OTP
    @PostMapping("/verify-sms-otp")
    public ResponseEntity<ApiResponse<TokenResponse>> verifySmsOtp(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        
        log.info("📱 [VERIFY-SMS-OTP] Request received: {}", request);
        
        String email = request.get("email");
        String phoneNumber = request.get("phoneNumber");
        String otp = request.get("otp");
        String deviceId = request.get("deviceId");
        
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email không được để trống");
        }
        if (phoneNumber == null || phoneNumber.isBlank()) {
            throw new BadRequestException("Số điện thoại không được để trống");
        }
        if (otp == null || otp.isBlank()) {
            throw new BadRequestException("OTP không được để trống");
        }
        if (deviceId == null || deviceId.isBlank()) {
            throw new BadRequestException("Thiết bị ID không được để trống");
        }
        
        try {
            TokenResponse tokenResponse = authService.verifySmsOtp(email, phoneNumber, otp, deviceId);
            
            // Cập nhật lastLogin sau khi verify SMS OTP thành công
            try {
                String ip = httpRequest.getRemoteAddr();
                String agent = httpRequest.getHeader("User-Agent");
                boolean trusted = deviceService.isTrusted(email, deviceId);
                if (trusted) {
                    deviceService.updateLastLogin(email, deviceId, ip, agent);
                } else {
                    deviceService.markTrusted(email, deviceId, ip, agent);
                }
            } catch (Exception e) {
                log.warn("⚠️ Failed to update lastLogin for SMS OTP login {}: {}", email, e.getMessage());
            }
            
            log.info("✅ [VERIFY-SMS-OTP] SMS OTP verified successfully for: {}", email);
            return ResponseEntity.ok(ApiResponse.success(tokenResponse,
                    "Xác thực SMS OTP thành công. Thiết bị đã được đánh dấu là tin cậy."));
        } catch (BadRequestException | ResourceNotFoundException e) {
            log.error("❌ [VERIFY-SMS-OTP] Verification failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ [VERIFY-SMS-OTP] Unexpected error: {}", e.getMessage(), e);
            throw new BadRequestException("Lỗi khi xác thực SMS OTP: " + e.getMessage());
        }
    }

    // ✅ Gửi OTP khi user click nút "Nhận OTP"
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<String>> sendOtp(@RequestBody Map<String, String> request) {
        log.info("═══════════════════════════════════════════════════════════");
        log.info("📨 [SEND-OTP] Request received: {}", request);
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            log.error("❌ [SEND-OTP] Email is null or blank");
            throw new BadRequestException("Email không được để trống");
        }
        
        log.info("📧 [SEND-OTP] Processing OTP request for email: {}", email);
        
        try {
            authService.sendOtp(email);
            log.info("✅ [SEND-OTP] OTP sent successfully to: {}", email);
            log.info("═══════════════════════════════════════════════════════════");
            return ResponseEntity.ok(ApiResponse.success(
                    "Mã OTP đã được gửi đến email của bạn",
                    "OTP sent successfully"));
        } catch (com.catshop.catshop.exception.ResourceNotFoundException e) {
            log.error("❌ [SEND-OTP] Email not found: {}", email);
            log.error("❌ [SEND-OTP] Exception: {}", e.getMessage());
            log.info("═══════════════════════════════════════════════════════════");
            throw e; // Re-throw để GlobalExceptionHandler xử lý
        } catch (Exception e) {
            log.error("❌ [SEND-OTP] Failed to send OTP to {}: {}", email, e.getMessage());
            log.error("❌ [SEND-OTP] Exception type: {}", e.getClass().getName());
            log.error("❌ [SEND-OTP] Full exception: ", e);
            log.info("═══════════════════════════════════════════════════════════");
            // Không throw exception - vẫn trả về success để OTP có thể được log và test
            // OTP vẫn được tạo và lưu, chỉ là email không gửi được
            return ResponseEntity.ok(ApiResponse.success(
                    "Mã OTP đã được tạo. Vui lòng kiểm tra backend logs để lấy mã OTP (nếu email không gửi được).",
                    "OTP generated (check logs if email not sent)"));
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

    // ✅ TEST EMAIL - Endpoint để test gửi email trực tiếp
    @PostMapping("/test-email")
    public ResponseEntity<ApiResponse<String>> testEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            email = "cumanhpt@gmail.com"; // Default test email
        }
        
        log.info("═══════════════════════════════════════════════════════════");
        log.info("🧪 [TEST-EMAIL] Testing email sending to: {}", email);
        
        try {
            authService.sendOtp(email);
            log.info("✅ [TEST-EMAIL] Test email sent successfully!");
            log.info("═══════════════════════════════════════════════════════════");
            return ResponseEntity.ok(ApiResponse.success(
                    "Email test đã được gửi đến " + email + ". Vui lòng kiểm tra inbox và spam folder.",
                    "Test email sent successfully"));
        } catch (Exception e) {
            log.error("❌ [TEST-EMAIL] Failed to send test email: {}", e.getMessage(), e);
            log.info("═══════════════════════════════════════════════════════════");
            return ResponseEntity.status(500).body(ApiResponse.error(500, 
                    "Lỗi khi gửi email: " + e.getMessage()));
        }
    }

    // ==================== QR CODE LOGIN ====================

    /**
     * Tạo QR code cho đăng nhập
     * Frontend sẽ hiển thị QR code này và polling để check status
     */
    @PostMapping("/qr/generate")
    public ResponseEntity<ApiResponse<QrLoginResponse>> generateQrCode() {
        log.info("📱 [QR-LOGIN] Generate QR code request received");
        
        try {
            QrLoginResponse response = qrLoginService.generateQrCode();
            log.info("✅ [QR-LOGIN] QR code generated successfully. Session: {}", response.getSessionId());
            return ResponseEntity.ok(ApiResponse.success(response, "QR code đã được tạo thành công"));
        } catch (Exception e) {
            log.error("❌ [QR-LOGIN] Failed to generate QR code: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(ApiResponse.error(500, 
                    "Không thể tạo QR code: " + e.getMessage()));
        }
    }

    /**
     * Mobile app gọi endpoint này sau khi scan QR code
     * Gửi credentials để xác nhận đăng nhập
     */
    @PostMapping("/qr/confirm")
    public ResponseEntity<ApiResponse<String>> confirmQrLogin(@Valid @RequestBody QrLoginRequest request) {
        log.info("📱 [QR-LOGIN] Confirm request received. Session: {}, Email: {}", 
                request.getSessionId(), request.getEmail());
        
        try {
            boolean success = qrLoginService.confirmQrLogin(request);
            if (success) {
                log.info("✅ [QR-LOGIN] Login confirmed successfully");
                return ResponseEntity.ok(ApiResponse.success(
                        "Đăng nhập thành công. Vui lòng quay lại trình duyệt.",
                        "Login confirmed successfully"));
            } else {
                return ResponseEntity.status(400).body(ApiResponse.error(400, 
                        "Không thể xác nhận đăng nhập"));
            }
        } catch (BadRequestException | ResourceNotFoundException e) {
            log.error("❌ [QR-LOGIN] Confirm failed: {}", e.getMessage());
            throw e; // Re-throw để GlobalExceptionHandler xử lý
        } catch (Exception e) {
            log.error("❌ [QR-LOGIN] Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(ApiResponse.error(500, 
                    "Lỗi khi xác nhận đăng nhập: " + e.getMessage()));
        }
    }

    /**
     * Frontend polling endpoint này để check status của QR login
     * Khi status = APPROVED, sẽ trả về tokens
     */
    @GetMapping("/qr/status/{sessionId}")
    public ResponseEntity<ApiResponse<QrLoginStatusResponse>> checkQrStatus(
            @PathVariable String sessionId) {
        log.debug("🔍 [QR-LOGIN] Status check request. Session: {}", sessionId);
        
        try {
            QrLoginStatusResponse response = qrLoginService.checkStatus(sessionId);
            return ResponseEntity.ok(ApiResponse.success(response, "Status retrieved successfully"));
        } catch (Exception e) {
            log.error("❌ [QR-LOGIN] Failed to check status: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(ApiResponse.error(500, 
                    "Không thể kiểm tra trạng thái: " + e.getMessage()));
        }
    }

    // ✅ Quên mật khẩu: gửi OTP đặt lại mật khẩu về email
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email không được để trống");
        }

        authService.sendPasswordResetOtp(email);
        return ResponseEntity.ok(ApiResponse.success(
                "Nếu email tồn tại trong hệ thống, mã OTP đặt lại mật khẩu đã được gửi.",
                "Password reset OTP sent (if account exists)"));
    }

    // ✅ Đặt lại mật khẩu bằng OTP gửi qua email
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email không được để trống");
        }
        if (otp == null || otp.isBlank()) {
            throw new BadRequestException("OTP không được để trống");
        }

        authService.resetPassword(email, otp, newPassword);

        return ResponseEntity.ok(ApiResponse.success(
                "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại với mật khẩu mới.",
                "Password reset successfully"));
    }

}
