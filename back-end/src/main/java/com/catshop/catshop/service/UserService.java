package com.catshop.catshop.service;

import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.UserResponse;
import com.catshop.catshop.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {

    User getUserEntityByEmail(String email);

    UserResponse getUserById(Long id);

    List<UserResponse> getAllUser();

    UserResponse getUserByEmail(String email);

    UserResponse insertUser(UserRequest userRequest);

    UserResponse updateUserByUserId(Long userId, UserRequest request);

    void deleteUserByUserId(Long userId);
}

