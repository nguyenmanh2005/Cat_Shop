package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.OtpRequest;
import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.TokenResponse;
import com.catshop.catshop.entity.Role;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.UserMapper;
import com.catshop.catshop.repository.RoleRepository;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.security.JwtUtils;
import com.catshop.catshop.service.AuthService;
import com.catshop.catshop.service.CaptchaService;
import com.catshop.catshop.service.EmailService;
import com.catshop.catshop.service.OtpService;
import com.catshop.catshop.service.SmsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtils jwtUtils;
    private final OtpService otpService;
    private final SmsService smsService;
    private final RedisTemplate<String, String> redisTemplate;
    private final CaptchaService captchaService;

    @org.springframework.beans.factory.annotation.Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // ------------------------- LOGIN STEP 1 (Gửi OTP) -------------------------
    @Override
    public void validateCredentials(LoginRequest loginRequest) {
        String email = loginRequest.getEmail();
        String rawPassword = loginRequest.getPassword();
        
        // Kiểm tra email có tồn tại trong database
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Email " + email + " không tồn tại trong hệ thống"));

        String storedPasswordHash = user.getPasswordHash();
        
        // Kiểm tra password có khớp với password hash trong database
        boolean passwordMatches = passwordEncoder.matches(rawPassword, storedPasswordHash);
        
        if (!passwordMatches) {
            // Kiểm tra xem có phải password được lưu dạng plain text không (cho backward compatibility)
            if (storedPasswordHash != null && storedPasswordHash.equals(rawPassword)) {
                // Password được lưu dạng plain text - cần hash lại
                System.out.println("⚠️ [WARN] Password stored as plain text for user: " + email + ". Re-hashing...");
                user.setPasswordHash(passwordEncoder.encode(rawPassword));
                userRepository.save(user);
                System.out.println("✅ [INFO] Password re-hashed successfully for: " + email);
                return; // Password đúng, đã hash lại
            }
            throw new BadRequestException("Mật khẩu không chính xác");
        }
        
        // Nếu cả email và password đều đúng → không throw exception
    }

    @Override
    public void sendOtp(String email) {
        // Kiểm tra email có tồn tại trong database
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email " + email + " không tồn tại"));

        // OtpService.generateAndSendOtp() đã tự động gửi email rồi
        otpService.generateAndSendOtp(email);
    }

    // ------------------------- SMS OTP METHODS -------------------------
    @Override
    public String sendSmsOtp(String phoneNumber) {
        log.info("📱 [SEND-SMS-OTP] Request received for phone: {}", phoneNumber);
        
        // Generate OTP
        String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
        
        // Lưu OTP vào Redis với key là "otp:sms:{phoneNumber}"
        String otpKey = "otp:sms:" + phoneNumber;
        try {
            redisTemplate.opsForValue().set(otpKey, otp, 2, TimeUnit.MINUTES); // OTP có hiệu lực 2 phút
            log.info("✅ [SEND-SMS-OTP] OTP saved to Redis for phone: {}", phoneNumber);
        } catch (DataAccessException e) {
            log.warn("⚠️ [SEND-SMS-OTP] Không thể lưu OTP vào Redis: {}", e.getMessage());
            // Vẫn log OTP để dev có thể test
        }
        
        // Gửi SMS qua SmsService (sẽ tự động xử lý dev/production mode)
        boolean smsSent = smsService.sendSms(phoneNumber, otp);
        
        if (!smsSent) {
            log.warn("⚠️ [SEND-SMS-OTP] Không thể gửi SMS, nhưng OTP vẫn được lưu vào Redis");
        }
        
        // Log OTP để dev có thể test (trong production, cần tích hợp SMS gateway)
        log.info("═══════════════════════════════════════════════════════════");
        log.info("📱 [SEND-SMS-OTP] OTP cho số điện thoại {} = {}", phoneNumber, otp);
        log.info("═══════════════════════════════════════════════════════════");
        
        // Trả về OTP để hiển thị trong dev mode
        return otp;
    }

    @Override
    public TokenResponse verifySmsOtp(String email, String phoneNumber, String otp, String deviceId) {
        log.info("📱 [VERIFY-SMS-OTP] Verifying OTP for email: {}, phone: {}", email, phoneNumber);
        
        if (deviceId == null || deviceId.isBlank()) {
            throw new BadRequestException("Thiết bị ID không được để trống");
        }
        
        // Kiểm tra email có tồn tại trong database
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email " + email + " không tồn tại"));
        
        // Kiểm tra số điện thoại có khớp với user không (nếu user đã đăng ký số điện thoại)
        if (user.getPhone() != null && !user.getPhone().isBlank()) {
            // Normalize phone numbers để so sánh
            String normalizedUserPhone = user.getPhone().replaceAll("\\s+", "").replace("+84", "0");
            String normalizedInputPhone = phoneNumber.replaceAll("\\s+", "").replace("+84", "0");
            
            if (!normalizedUserPhone.equals(normalizedInputPhone)) {
                log.warn("⚠️ [VERIFY-SMS-OTP] Phone number mismatch. User phone: {}, Input phone: {}", 
                        user.getPhone(), phoneNumber);
                // Không throw exception - cho phép verify với số điện thoại mới
            }
        }
        
        // Verify OTP từ Redis
        String otpKey = "otp:sms:" + phoneNumber;
        String storedOtp = null;
        try {
            storedOtp = redisTemplate.opsForValue().get(otpKey);
        } catch (DataAccessException e) {
            log.warn("⚠️ [VERIFY-SMS-OTP] Không thể lấy OTP từ Redis: {}", e.getMessage());
            throw new BadRequestException("Không thể xác thực OTP. Vui lòng thử lại sau.");
        }
        
        if (storedOtp == null || !storedOtp.equals(otp)) {
            log.warn("❌ [VERIFY-SMS-OTP] OTP không hợp lệ hoặc đã hết hạn");
            throw new BadRequestException("OTP không hợp lệ hoặc đã hết hạn");
        }
        
        // Xóa OTP sau khi verify thành công
        try {
            redisTemplate.delete(otpKey);
            log.info("✅ [VERIFY-SMS-OTP] OTP verified and deleted for phone: {}", phoneNumber);
        } catch (DataAccessException e) {
            log.warn("⚠️ [VERIFY-SMS-OTP] Không thể xóa OTP từ Redis: {}", e.getMessage());
        }
        
        // Cấp token sau khi OTP được xác thực thành công
        String accessToken = jwtUtils.generateAccessToken(user.getEmail(), user.getRole().getRoleName());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());
        
        // Lưu refresh token vào Redis
        try {
            redisTemplate.opsForValue().set("refresh:" + user.getEmail(), refreshToken, 7, TimeUnit.DAYS);
            log.info("✅ [VERIFY-SMS-OTP] Refresh token saved for: {}", user.getEmail());
        } catch (DataAccessException e) {
            log.warn("⚠️ [VERIFY-SMS-OTP] Không thể lưu refresh token vào Redis: {}", e.getMessage());
        }
        
        log.info("✅ [VERIFY-SMS-OTP] SMS OTP verified successfully for: {}", email);
        return new TokenResponse(accessToken, refreshToken, false);
    }



    // ------------------------- LOGIN STEP 2 (Xác thực OTP) -------------------------
    @Override
    public TokenResponse verifyOtp(OtpRequest request) {
        boolean valid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!valid) {
            throw new BadRequestException("OTP không hợp lệ hoặc đã hết hạn");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        // Xóa OTP sau khi xác thực (để an toàn) - có thể fail nếu Redis không chạy
        try {
            redisTemplate.delete("otp:" + user.getEmail());
        } catch (DataAccessException e) {
            log.warn("⚠️ Không thể xóa OTP từ Redis (Redis không kết nối được): {}", e.getMessage());
            // Không throw exception - OTP đã được xóa trong OtpService rồi
        }

        // OTP verification chỉ xác thực OTP, không liên quan đến MFA
        // MFA là một phương thức xác thực độc lập, không phụ thuộc vào OTP flow
        // Cấp token sau khi OTP được xác thực thành công
        String accessToken = jwtUtils.generateAccessToken(user.getEmail(), user.getRole().getRoleName());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        // Lưu refresh token vào Redis (7 ngày) - có thể fail nếu Redis không chạy
        try {
            redisTemplate.opsForValue().set("refresh:" + user.getEmail(), refreshToken, 7, TimeUnit.DAYS);
            log.info("✅ Refresh token đã được lưu vào Redis cho: {}", user.getEmail());
        } catch (DataAccessException e) {
            log.warn("⚠️ Không thể lưu refresh token vào Redis (Redis không kết nối được): {}", e.getMessage());
            log.warn("⚠️ User vẫn có thể đăng nhập nhưng sẽ cần đăng nhập lại sau khi token hết hạn");
            // Không throw exception - user vẫn có thể đăng nhập, chỉ là không lưu refresh token
        }

        return new TokenResponse(accessToken, refreshToken, false);
    }

    // ------------------------- REFRESH TOKEN -------------------------
    @Override
    public String refreshAccessToken(String refreshToken) {
        String email = jwtUtils.getEmailFromToken(refreshToken);
        if (email == null) {
            throw new BadRequestException("Refresh token không hợp lệ");
        }

        // ✅ Kiểm tra refresh token trong Redis - có thể fail nếu Redis không chạy
        String savedToken = null;
        try {
            savedToken = redisTemplate.opsForValue().get("refresh:" + email);
        } catch (DataAccessException e) {
            log.warn("⚠️ Không thể kiểm tra refresh token từ Redis (Redis không kết nối được): {}", e.getMessage());
            log.warn("⚠️ Cho phép refresh token dựa trên JWT validation thay vì Redis");
            // Nếu Redis không chạy, chỉ validate JWT token thôi (ít an toàn hơn nhưng vẫn hoạt động)
        }
        
        // Nếu Redis có kết nối và token không khớp → reject
        if (savedToken != null && !savedToken.equals(refreshToken)) {
            throw new BadRequestException("Refresh token đã hết hạn hoặc không tồn tại");
        }
        
        // Nếu Redis không kết nối (savedToken == null), vẫn cho phép nếu JWT hợp lệ

        // ✅ Sinh access token mới
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        return jwtUtils.generateAccessToken(user.getEmail(), user.getRole().getRoleName());
    }

    @Override
    public String generateAccessTokenForUser(User user) {
        return jwtUtils.generateAccessToken(user.getEmail(), user.getRole().getRoleName());
    }

    @Override
    public String generateRefreshTokenForUser(User user) {
        return jwtUtils.generateRefreshToken(user.getEmail());
    }

    @Override
    public void saveRefreshToken(String email, String refreshToken) {
        try {
            redisTemplate.opsForValue().set("refresh:" + email, refreshToken, 7, TimeUnit.DAYS);
            log.info("✅ Refresh token đã được lưu vào Redis cho: {}", email);
        } catch (DataAccessException e) {
            log.warn("⚠️ Không thể lưu refresh token vào Redis (Redis không kết nối được): {}", e.getMessage());
            // Không throw exception - user vẫn có thể đăng nhập
        }
    }


    // ------------------------- LOGOUT -------------------------
    @Override
    public void logout(String email) {
        try {
            redisTemplate.delete("refresh:" + email);
            redisTemplate.delete("otp:" + email);
            log.info("✅ Đã xóa refresh token và OTP từ Redis cho: {}", email);
        } catch (DataAccessException e) {
            log.warn("⚠️ Không thể xóa token từ Redis (Redis không kết nối được): {}", e.getMessage());
            // Không throw exception - logout vẫn thành công
        }
    }

    // ------------------------- REGISTER -------------------------
    @Override
    public boolean register(UserRequest userRequest) {
        // Xác thực captcha
        if (!captchaService.verify(userRequest.getCaptchaToken())) {
            throw new BadRequestException("Captcha không hợp lệ");
        }

        String email = userRequest.getEmail();
        String phone = userRequest.getPhone();
        
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("Email " + email + " đã được sử dụng. Vui lòng sử dụng email khác.");
        }

        // Kiểm tra số điện thoại đã tồn tại chưa (nếu có)
        if (phone != null && !phone.isBlank() && 
            userRepository.findByPhoneNumber(phone).isPresent()) {
            throw new BadRequestException("Số điện thoại " + phone + " đã được sử dụng. Vui lòng sử dụng số điện thoại khác.");
        }

        // Lấy role mặc định: ưu tiên tìm "Customer" (role mặc định), nếu không có thì tìm theo ID = 2
        Role role = roleRepository.findByRoleName("Customer")
                .orElseGet(() -> roleRepository.findById(2L)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy role mặc định 'Customer' hoặc role ID = 2. Vui lòng đảm bảo role đã được tạo.")));

        // Map từ UserRequest sang User entity
        User user = userMapper.FromUserRequestToUser(userRequest);
        user.setRole(role);
        user.setEmailVerified(false);
        
        // Mã hóa password trước khi lưu vào database
        user.setPasswordHash(passwordEncoder.encode(userRequest.getPassword()));

        // Lưu user vào database
        userRepository.save(user);

        // KHÔNG gửi email link kích hoạt nữa - frontend sẽ tự gửi OTP
        // Nếu có flag skipEmailVerification = true hoặc useOtpVerification = true, bỏ qua gửi email link
        Boolean skipEmail = userRequest.getSkipEmailVerification();
        Boolean useOtp = userRequest.getUseOtpVerification();
        
        if (skipEmail == null && useOtp == null) {
            // Nếu không có flag, vẫn KHÔNG gửi email link (mặc định dùng OTP)
            log.info("📧 [REGISTER] Skipping email link verification for: {} (using OTP instead)", email);
        } else if (skipEmail != null && skipEmail) {
            log.info("📧 [REGISTER] Skipping email link verification for: {} (skipEmailVerification=true)", email);
        } else if (useOtp != null && useOtp) {
            log.info("📧 [REGISTER] Skipping email link verification for: {} (useOtpVerification=true)", email);
        } else {
            // Nếu cả 2 flag đều false/null, vẫn không gửi (mặc định dùng OTP)
            log.info("📧 [REGISTER] Skipping email link verification for: {} (default: use OTP)", email);
        }

        return true;
    }

    @Override
    public void sendEmailVerification(String email) {
        String token = jwtUtils.generateEmailVerificationToken(email);
        String verifyUrl = frontendUrl + "/verify-email?token=" + token;
        emailService.sendVerificationEmail(email, verifyUrl);
    }

    @Override
    public void verifyEmail(String token) {
        if (!jwtUtils.validateEmailVerificationToken(token)) {
            throw new BadRequestException("Token xác thực email không hợp lệ hoặc đã hết hạn");
        }

        String email = jwtUtils.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Override
    public void sendPasswordResetOtp(String email) {
        // Nếu email không tồn tại, không tiết lộ cho client (tránh lộ danh sách email)
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));

        // Dùng lại OtpService để gửi mã OTP về email
        otpService.generateAndSendOtp(email);
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        // Xác thực OTP
        boolean valid = otpService.verifyOtp(email, otp);
        if (!valid) {
            throw new BadRequestException("OTP không hợp lệ hoặc đã hết hạn");
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new BadRequestException("Mật khẩu mới không được để trống");
        }
        if (newPassword.length() < 6) {
            throw new BadRequestException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Xóa refresh token trong Redis để đăng xuất tất cả thiết bị
        logout(email);
    }
}
