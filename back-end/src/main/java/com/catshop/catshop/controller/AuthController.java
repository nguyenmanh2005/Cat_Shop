package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.LoginResponse;
import com.catshop.catshop.dto.response.UserResponse;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody UserRequest request) {
        UserResponse userResponse = userService.insertUser(request);
        return ResponseEntity.ok(ApiResponse.success(userResponse, "Đăng ký thành công!"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        // Lấy user từ email
        User user = userService.getUserEntityByEmail(request.getEmail());
        
        // Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu không đúng");
        }
        
        // Tạo response
        LoginResponse response = LoginResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .roleId(user.getRole().getRoleId())
                .roleName(user.getRole().getRoleName())
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(response, "Đăng nhập thành công!"));
    }
}


