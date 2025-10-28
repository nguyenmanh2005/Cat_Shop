package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.UserResponse;
import com.catshop.catshop.entity.Role;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ConflictException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.UserMapper;
import com.catshop.catshop.repository.RoleRepository;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public User getUserEntityByEmail(String email) {
        User user =  userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("Không tài khoản với email: "+ email)
        );
        return user;
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BadRequestException(
                        "Không tìm thấy tài khoản với id là: " + id));
        return userMapper.FromUserToUserResponse(user);
    }

    @Override
    public List<UserResponse> getAllUser() {
        List<User> userList = userRepository.findAll();
        return userMapper.FromUserToUserResponse(userList);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        return userMapper.FromUserToUserResponse(
                userRepository.findByEmail(email)
                        .orElseThrow(() -> new BadRequestException(
                                "Không tìm thấy tài khoản với email là: " + email))
        );
    }

    @Override
    @Transactional
    public UserResponse insertUser(UserRequest userRequest) {
        if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            throw new ConflictException("Email đã tồn tại: " + userRequest.getEmail());
        }

        if (userRequest.getPhone() != null && userRepository.findByPhoneNumber(userRequest.getPhone()).isPresent()) {
            throw new ConflictException("Số điện thoại đã tồn tại: " + userRequest.getPhone());
        }

        Role role = roleRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Role với id: " + 1L));

        User user = userMapper.FromUserRequestToUser(userRequest);
        // Hash mật khẩu từ request
        user.setPasswordHash(passwordEncoder.encode(userRequest.getPassword()));
        user.setRole(role);

        User savedUser = userRepository.save(user);
        return userMapper.FromUserToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUserByUserId(Long userId, UserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản với Id là: " + userId));

        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        userRepository.save(user);
        return userMapper.FromUserToUserResponse(user);
    }

    @Override
    @Transactional
    public void deleteUserByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản với Id là: " + userId));

        userRepository.deleteById(userId);
    }
}
