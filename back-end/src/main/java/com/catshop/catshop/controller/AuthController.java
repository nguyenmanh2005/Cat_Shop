package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.RegisterRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.AuthResponse;
import com.catshop.catshop.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success(authResponse, "Đăng ký thành công")
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.status(HttpStatus.OK).body(
                ApiResponse.success(authResponse, "Đăng nhập thành công")
        );
    }
}

