package com.catshop.catshop.controller;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.dto.response.JwtResponse;
import com.catshop.catshop.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService; // gọi service xử lý

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(new JwtResponse(token,"Bearer"),"Created Token"));
    }


    // Tạo user mới  checked
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody UserRequest request) {
        if (!authService.register(request)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.error(404, "Can not create user")
            );
        }
        return ResponseEntity.ok(ApiResponse.success("User created successfully", "User created successfully"));
    }
}

