package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.RegisterRequest;
import com.catshop.catshop.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}

