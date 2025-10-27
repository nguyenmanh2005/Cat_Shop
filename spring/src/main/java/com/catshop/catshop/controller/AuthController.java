package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.OtpRequest;
import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.service.AuthService;
import com.catshop.catshop.service.OtpAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final OtpAuthService otpAuthService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@RequestBody LoginRequest loginRequest) {
        String message = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(message, "Đăng nhập bước 1 (OTP)"));
    }

    // ✅ Xác thực OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@Valid @RequestBody OtpRequest otpRequest) {
        String token = otpAuthService.verifyOtp(otpRequest);
        return ResponseEntity.ok(ApiResponse.success(token, "OTP verified, login success"));
    }

    // ✅ Đăng ký tài khoản
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody UserRequest request) {
        if (!authService.register(request)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(400,"Cannot create user"));
        }
        return ResponseEntity.ok(ApiResponse.success("User created successfully", "User created successfully"));
    }
}
