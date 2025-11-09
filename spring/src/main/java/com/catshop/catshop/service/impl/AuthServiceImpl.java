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
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.TimeUnit;

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
    public String login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Email " + loginRequest.getEmail() + " không tồn tại"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu không chính xác");
        }

        // ✅ Sinh OTP và gửi email
        String otp = otpService.generateOtp(user.getEmail());
        emailService.sendOtpEmail(user.getEmail(), otp);

        return "Mã OTP đã được gửi đến email của bạn. Vui lòng nhập OTP để hoàn tất đăng nhập.";
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

        // Xóa OTP sau khi xác thực (để an toàn)
        redisTemplate.delete("otp:" + user.getEmail());

        // Nếu user bật MFA -> trả về thông báo cần MFA, không cấp JWT
        if (Boolean.TRUE.equals(user.getMfaEnabled())) {
            // Trả về mfaRequired = true để FE biết tiếp tục yêu cầu Google Authenticator
            return new TokenResponse(null, null, true);
        }

        // Nếu không bật MFA -> cấp token như bình thường
        String accessToken = jwtUtils.generateAccessToken(user.getEmail(), user.getRole().getRoleName());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        // Lưu refresh token vào Redis (7 ngày)
        redisTemplate.opsForValue().set("refresh:" + user.getEmail(), refreshToken, 7, TimeUnit.DAYS);

        return new TokenResponse(accessToken, refreshToken, false);
    }

    // ------------------------- REFRESH TOKEN -------------------------
    @Override
    public String refreshAccessToken(String refreshToken) {
        String email = jwtUtils.getEmailFromToken(refreshToken);
        if (email == null) {
            throw new BadRequestException("Refresh token không hợp lệ");
        }

        // ✅ Kiểm tra refresh token trong Redis
        String savedToken = redisTemplate.opsForValue().get("refresh:" + email);
        if (savedToken == null || !savedToken.equals(refreshToken)) {
            throw new BadRequestException("Refresh token đã hết hạn hoặc không tồn tại");
        }

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
        redisTemplate.opsForValue().set("refresh:" + email, refreshToken, 7, TimeUnit.DAYS);
    }


    // ------------------------- LOGOUT -------------------------
    @Override
    public void logout(String email) {
        redisTemplate.delete("refresh:" + email);
        redisTemplate.delete("otp:" + email);
    }

    // ------------------------- REGISTER -------------------------
    @Override
    public boolean register(UserRequest userRequest) {
        if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            throw new BadRequestException("Email đã tồn tại");
        }

        if (userRepository.findByPhoneNumber(userRequest.getPhone()).isPresent()) {
            throw new BadRequestException("Số điện thoại đã tồn tại");
        }

        Role role = roleRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Role ID: 1"));

        User user = userMapper.FromUserRequestToUser(userRequest);
        user.setRole(role);
        user.setPasswordHash(passwordEncoder.encode(userRequest.getPassword()));

        userRepository.save(user);
        return true;
    }
}
