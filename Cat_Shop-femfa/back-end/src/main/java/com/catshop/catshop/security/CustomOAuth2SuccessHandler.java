package com.catshop.catshop.security;

import com.catshop.catshop.entity.Role;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.repository.RoleRepository;
import com.catshop.catshop.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;
    private final StringRedisTemplate redisTemplate;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = (String) oAuth2User.getAttributes().get("email");
            String name = (String) oAuth2User.getAttributes().get("name");

            if (email == null || email.isEmpty()) {
                throw new BadRequestException("Không thể xác định email từ tài khoản Google.");
            }

            log.info("✅ OAuth2 login success for: {}", email);

            // Kiểm tra user
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                log.info("🆕 Người dùng mới, tạo tài khoản...");
                // Tìm role mặc định: ưu tiên tìm "Customer" (role mặc định), nếu không có thì tìm theo ID = 1
                Role defaultRole = roleRepository.findByRoleName("Customer")
                        .orElseGet(() -> roleRepository.findById(1L)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                        "Không tìm thấy role mặc định 'Customer' hoặc role ID = 1. Vui lòng đảm bảo role đã được tạo.")));

                // Tạo user mới từ Google OAuth
                // Set passwordHash là chuỗi rỗng hoặc một giá trị đặc biệt để đánh dấu là OAuth user
                // (không thể null vì database có constraint NOT NULL)
                User newUser = User.builder()
                        .email(email)
                        .username(name != null ? name : email.split("@")[0]) // Nếu không có name, dùng phần trước @ của email
                        .passwordHash("") // Set chuỗi rỗng thay vì null để tránh lỗi constraint
                        .role(defaultRole)
                        .mfaEnabled(false)
                        .build();

                userRepository.save(newUser);
                log.info("✅ Đã tạo user mới từ Google OAuth: {} với role: {}", email, defaultRole.getRoleName());
                return newUser;
            });

            // Sinh JWT token
            String accessToken = jwtUtils.generateAccessToken(user.getEmail(), user.getRole().getRoleName());
            String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

            // Lưu refresh token vào Redis (7 ngày)
            redisTemplate.opsForValue().set("refresh:" + user.getEmail(), refreshToken, 7, TimeUnit.DAYS);

            // Redirect về FE (đọc từ application.properties, mặc định là http://localhost:5173)
            String redirectUrl = frontendUrl + "/oauth2/success"
                    + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                    + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);
            
            log.info("🌐 Redirecting to FE: {}", redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            log.error("❌ OAuth2 Login Error: {}", e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\": \"Đăng nhập Google thất bại: " + e.getMessage() + "\"}");
        }
    }
}
