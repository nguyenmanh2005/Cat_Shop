package com.catshop.catshop.security;

import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.exception.JwtValidationException;
import com.catshop.catshop.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper; // ✅ inject từ JacksonConfig

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (jwtUtils.validateToken(token)) {
                String email = jwtUtils.getEmailFromToken(token);

                var userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    var user = userOpt.get();

                    //✅ Tạo object Authentication chứa thông tin user
                    //(UsernamePasswordAuthenticationToken là 1 implement của Authentication)
                    //
                    //✅ Gắn thông tin request (IP, session, user-agent)
                    //
                    //✅ Đưa toàn bộ thông tin này vào SecurityContextHolder
                    //
                    //→ Bây giờ Spring Security hiểu rõ user đang login là ai
                    //→ Cho phép đi qua các API yêu cầu authenticated()
                    //→ Đồng thời bạn có thể lấy user trong Controller như sau:

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, null);

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

        } catch (JwtValidationException e) {
            logger.warn("Token không hợp lệ hoặc đã hết hạn!");

            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            // ✅ Dùng objectMapper có sẵn (đã được cấu hình format thời gian)
            ApiResponse<?> error = ApiResponse.error(401, e.getMessage());
            String json = objectMapper.writeValueAsString(error);
            response.getWriter().write(json);
            return;
        }

        filterChain.doFilter(request, response);
    }
}