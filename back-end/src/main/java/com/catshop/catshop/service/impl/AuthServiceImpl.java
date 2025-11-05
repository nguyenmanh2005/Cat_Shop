package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.RegisterRequest;
import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.AuthResponse;
import com.catshop.catshop.dto.response.UserResponse;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ConflictException;
import com.catshop.catshop.exception.UnauthorizedException;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.AuthService;
import com.catshop.catshop.service.UserService;
import com.catshop.catshop.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email đã được sử dụng: " + request.getEmail());
        }

        // Kiểm tra phone đã tồn tại chưa (nếu có)
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            if (userRepository.findByPhoneNumber(request.getPhone()).isPresent()) {
                throw new ConflictException("Số điện thoại đã được sử dụng: " + request.getPhone());
            }
        }

        // Tạo UserRequest từ RegisterRequest
        UserRequest userRequest = UserRequest.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword())
                .phone(request.getPhone())
                .address(request.getAddress() != null ? request.getAddress() : "")
                .build();

        // Tạo user mới (UserService sẽ xử lý mã hóa password)
        UserResponse userResponse = userService.insertUser(userRequest);

        // Lấy user entity để tạo token
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Không thể tạo user"));

        // Tạo JWT tokens
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getUserId(),
                user.getEmail(),
                user.getRole().getRoleId()
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());

        // Tạo AuthResponse
        return AuthResponse.builder()
                .user(userResponse)
                .access_token(accessToken)
                .refresh_token(refreshToken)
                .expires_in(86400000L) // 24 giờ
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Tìm user theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không chính xác"));

        // Kiểm tra password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        }

        // Tạo JWT tokens
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getUserId(),
                user.getEmail(),
                user.getRole().getRoleId()
        );
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());

        // Map user entity sang UserResponse
        UserResponse userResponse = UserResponse.builder()
                .user_id(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role_id(user.getRole().getRoleId())
                .build();

        // Tạo AuthResponse
        return AuthResponse.builder()
                .user(userResponse)
                .access_token(accessToken)
                .refresh_token(refreshToken)
                .expires_in(86400000L) // 24 giờ
                .build();
    }
}

