package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.UserRequest;
import com.catshop.catshop.dto.response.UserResponse;
import com.catshop.catshop.entity.Role;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.mapper.UserMapper;
import com.catshop.catshop.repository.RoleRepository;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    public Page<UserResponse> getAllUser(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        return userPage.map(userMapper::FromUserToUserResponse);
    }

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
    public UserResponse updateUserByUserId(Long userId, UserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản với Id là: " + userId));

        user.setUsername(request.getUsername());
        
        // Hash password trước khi lưu (chỉ hash nếu password được cung cấp)
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            String password = request.getPassword();
            // Kiểm tra xem password đã được hash chưa (BCrypt hash bắt đầu bằng $2a$ hoặc $2b$)
            if (!password.startsWith("$2a$") && !password.startsWith("$2b$")) {
                // Password chưa được hash - hash nó
                user.setPasswordHash(passwordEncoder.encode(password));
            }
            // Nếu password đã được hash (bắt đầu bằng $2a$ hoặc $2b$), giữ nguyên
            // (Trường hợp này hiếm khi xảy ra vì frontend không nên gửi hash)
        }
        // Nếu password null hoặc blank, giữ nguyên password hiện tại trong database
        
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
