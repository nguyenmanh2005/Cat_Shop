package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.OtpRequest;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OtpAuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final OtpService otpService;
    private final JwtUtils jwtUtils;

    public String requestOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại trong hệ thống"));

        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);

        return "✅ OTP đã được gửi đến email: " + email;
    }

    public String verifyOtp(OtpRequest request) {
        boolean valid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!valid) {
            throw new BadRequestException("OTP không hợp lệ");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        // ✅ Trả token nếu xác thực thành công
        return jwtUtils.generateToken(user.getEmail(), user.getRole().getRoleName());
    }
}
