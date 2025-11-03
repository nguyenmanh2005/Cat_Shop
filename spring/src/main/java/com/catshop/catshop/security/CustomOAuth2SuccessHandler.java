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
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        try {
            // ✅ Lấy thông tin từ Google OAuth2
            DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();
            String email = (String) oAuth2User.getAttributes().get("email");
            String name = (String) oAuth2User.getAttributes().get("name");

            if (email == null || email.isEmpty()) {
                throw new BadRequestException("Không thể xác định email từ tài khoản Google.");
            }

            log.info("✅ OAuth2 login success for: {}", email);

            // ✅ Kiểm tra user tồn tại
            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;

            if (userOpt.isEmpty()) {
                log.info("🆕 Người dùng mới, tạo tài khoản...");

                // 🔹 Tìm role mặc định (ROLE_USER)
                Role defaultRole = roleRepository.findAll().stream()
                        .filter(r -> r.getRoleName().equalsIgnoreCase("USER"))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy role mặc định: USER"));

                // 🔹 Tạo mới user
                user = User.builder()
                        .email(email)
                        .username(name)
                        .role(defaultRole)
                        .passwordHash(null)
                        .build();

                userRepository.save(user);
                log.info("✅ Đã tạo mới user OAuth2: {}", email);
            } else {
                user = userOpt.get();
                log.info("🔁 Người dùng đã tồn tại, đăng nhập lại: {}", email);
            }

            // ✅ Sinh token
            String accessToken = jwtUtils.generateAccessToken(user.getEmail(), user.getRole().getRoleName());
            String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

            // ✅ Redirect về FE (có thể đổi localhost:3000 tùy bạn)
            String redirectUrl = "http://localhost:3000/oauth2/success"
                    + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                    + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);

            response.sendRedirect(redirectUrl);

        } catch (BadRequestException | ResourceNotFoundException e) {
            log.error("❌ OAuth2 Error: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            log.error("❌ Lỗi không xác định khi xử lý OAuth2 login: {}", e.getMessage());
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Lỗi hệ thống khi đăng nhập bằng Google");
        }
    }
}
