package com.catshop.catshop.security;

import com.catshop.catshop.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();
        
        // ✅ QUAN TRỌNG: Bỏ qua hoàn toàn cho các endpoint auth (login, register, etc.)
        // Vì các endpoint này được permitAll trong SecurityConfig và không cần authentication
        // Nếu có AuthenticationException cho các endpoint này, có nghĩa là có vấn đề với cấu hình
        // Nhưng chúng ta vẫn cần cho phép request đi tiếp đến controller
        if (uri != null && (uri.contains("/api/auth/") || uri.contains("/auth/"))) {
            log.debug("🔓 Bỏ qua JwtAuthEntryPoint cho endpoint auth: {} {} - Cho phép request đi tiếp", method, uri);
            // Set response 200 OK để cho phép request đi tiếp đến controller
            // Nếu không set response, Spring Security có thể vẫn trả về 401
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json;charset=UTF-8");
            // Không write body, để request có thể đi tiếp đến controller
            return;
        }

        // Chỉ xử lý lỗi 401 cho các endpoint khác (cần authentication)
        log.warn("⚠️ Unauthorized access attempt: {} {} - Exception: {}", method, uri, authException.getMessage());
        
        ApiResponse<?> error = ApiResponse.error(401, "Unauthorized: Token không hợp lệ hoặc đã hết hạn!");

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(error));
    }
}
