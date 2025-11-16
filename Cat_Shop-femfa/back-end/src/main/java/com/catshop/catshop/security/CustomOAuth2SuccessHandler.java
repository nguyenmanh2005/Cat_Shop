package com.catshop.catshop.security;

import com.catshop.catshop.entity.Role;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.repository.RoleRepository;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.service.DeviceService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
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
    private final DeviceService deviceService;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    @Value("${oauth2.redirect.path:/account}")
    private String oauth2RedirectPath;

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

            // Lấy deviceId từ query parameter hoặc state (OAuth state có thể chứa deviceId)
            String deviceId = request.getParameter("deviceId");
            if (deviceId == null || deviceId.isBlank()) {
                // Thử lấy từ state parameter (OAuth state)
                String state = request.getParameter("state");
                if (state != null && state.contains("deviceId=")) {
                    String[] parts = state.split("deviceId=");
                    if (parts.length > 1) {
                        deviceId = parts[1].split("&")[0];
                    }
                }
            }
            
            // Nếu vẫn không có deviceId, tạo một deviceId tạm từ IP và User-Agent
            if (deviceId == null || deviceId.isBlank()) {
                String ip = request.getRemoteAddr();
                String userAgent = request.getHeader("User-Agent");
                deviceId = "oauth_" + ip.replace(".", "_") + "_" + 
                          (userAgent != null ? userAgent.hashCode() : "unknown");
                log.info("⚠️ No deviceId provided, generated temporary deviceId: {}", deviceId);
            }

            // Sinh JWT token
            String accessToken = jwtUtils.generateAccessToken(user.getEmail(), user.getRole().getRoleName());
            String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

            // Lưu refresh token vào Redis (7 ngày) - có thể fail nếu Redis không chạy
            try {
                redisTemplate.opsForValue().set("refresh:" + user.getEmail(), refreshToken, 7, TimeUnit.DAYS);
                log.info("✅ Refresh token saved to Redis for: {}", user.getEmail());
            } catch (DataAccessException e) {
                log.warn("⚠️ Failed to save refresh token to Redis (Redis may not be running): {}", e.getMessage());
                log.warn("⚠️ User can still login but may need to login again after token expires");
                // Không throw exception - user vẫn có thể đăng nhập
            } catch (Exception e) {
                log.warn("⚠️ Unexpected error saving refresh token: {}", e.getMessage());
            }

            // Đánh dấu thiết bị là trusted sau khi OAuth thành công
            try {
                String ip = request.getRemoteAddr();
                String userAgent = request.getHeader("User-Agent");
                deviceService.markTrusted(user.getEmail(), deviceId, ip, userAgent);
                log.info("✅ Device marked as trusted for OAuth login: {}", user.getEmail());
            } catch (Exception e) {
                log.warn("⚠️ Failed to mark device as trusted for OAuth login: {}. Continuing...", e.getMessage());
                // Không chặn đăng nhập nếu không thể mark device
            }

            // Redirect về trang tài khoản sau khi đăng nhập Google OAuth thành công
            // Có thể cấu hình trong application.properties: oauth2.redirect.path=/account
            String redirectUrl = frontendUrl + oauth2RedirectPath
                    + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                    + "&refreshToken=" + URLEncoder.encode(refreshToken, StandardCharsets.UTF_8)
                    + "&deviceId=" + URLEncoder.encode(deviceId, StandardCharsets.UTF_8)
                    + "&loginMethod=google"; // Đánh dấu là đăng nhập bằng Google
            
            log.info("🌐 Redirecting to account page: {}", redirectUrl);
            response.sendRedirect(redirectUrl);

        } catch (BadRequestException | ResourceNotFoundException e) {
            log.error("❌ OAuth2 Login Error: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json;charset=UTF-8");
            try {
                String errorJson = "{\"error\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}";
                response.getWriter().write(errorJson);
            } catch (IOException ioException) {
                log.error("❌ Failed to write error response: {}", ioException.getMessage());
            }
        } catch (Exception e) {
            log.error("❌ OAuth2 Login Error: {}", e.getMessage(), e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json;charset=UTF-8");
            try {
                String errorJson = "{\"error\": \"Đăng nhập Google thất bại. Vui lòng thử lại sau.\"}";
                response.getWriter().write(errorJson);
            } catch (IOException ioException) {
                log.error("❌ Failed to write error response: {}", ioException.getMessage());
            }
        }
    }
}
