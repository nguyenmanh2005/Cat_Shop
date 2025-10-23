package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.LoginRequest;
import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.UserResponse;
import com.catshop.catshop.entity.Role;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.UserMapper;
import com.catshop.catshop.repository.RoleRepository;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.security.JwtUtils;
import com.catshop.catshop.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public String login(LoginRequest loginRequest) {
        User user  = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(
                () -> new ResourceNotFoundException("Email: " + loginRequest.getEmail() + " không tồn tại")
        );
        if (!passwordEncoder.matches(loginRequest.getPassword(),user.getPasswordHash())){
            throw  new BadRequestException("Mật khẩu không đúng");
        }
        return jwtUtils.generateToken(user.getEmail(),user.getRole().getRoleName());
    }


    @Override
    @Transactional
    public boolean register(UserRequest userRequest) {
        if (userRepository.findByEmail(userRequest.getEmail()).isPresent()) {
            throw new ResourceNotFoundException("Email đã tồn tại: " + userRequest.getEmail());
        }

        if (userRepository.findByPhoneNumber(userRequest.getPhone()).isPresent()) {
            throw new ResourceNotFoundException("Số điện thoại đã tồn tại: " + userRequest.getPhone());
        }

        Role role = roleRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Role với id: " + 1L));

        User user = userMapper.FromUserRequestToUser(userRequest);
        user.setRole(role);
        user.setPasswordHash(passwordEncoder.encode(userRequest.getPassword()));
        User savedUser = userRepository.save(user);
        return true;
    }
}
