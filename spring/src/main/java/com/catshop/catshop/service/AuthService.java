package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.UserRequest;

public interface AuthService {
    String login(LoginRequest loginRequest);
    boolean register(UserRequest request);
}
