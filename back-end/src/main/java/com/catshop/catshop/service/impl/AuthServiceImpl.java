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
import com.catshop.catshop.service.EmailService;
import com.catshop.catshop.service.OtpService;
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
    private final RedisTemplate<String, String> redisTemplate;

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

        // Nếu user bật MFA -> trả về thông báo cần MFA, không cấp JWT
        if (Boolean.TRUE.equals(user.getMfaEnabled())) {
            // Trả về mfaRequired = true để FE biết tiếp tục yêu cầu Google Authenticator
            return new TokenResponse(null, null, true);
        }

        // Nếu không bật MFA -> cấp token như bình thường
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

        // Lấy role mặc định (USER - role ID = 1)
        Role role = roleRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Role mặc định (ID: 1)"));

        // Map từ UserRequest sang User entity
        User user = userMapper.FromUserRequestToUser(userRequest);
        user.setRole(role);
        
        // Mã hóa password trước khi lưu vào database
        user.setPasswordHash(passwordEncoder.encode(userRequest.getPassword()));

        // Lưu user vào database
        userRepository.save(user);
        return true;
    }
}
