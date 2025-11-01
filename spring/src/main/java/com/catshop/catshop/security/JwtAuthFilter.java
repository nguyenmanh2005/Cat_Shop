package com.catshop.catshop.security;

import com.catshop.catshop.dto.response.ApiResponse;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.JwtValidationException;
import com.catshop.catshop.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;


import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
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

                Optional<User> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();

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
                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    // ✅ Kiểm tra quyền hạn truy cập (chặn DELETE / PUT nếu không phải ADMIN)
                    String method = request.getMethod();
                    String uri = request.getRequestURI();
                    String role = user.getRole().getRoleName();

                    if ((method.equalsIgnoreCase("DELETE") || method.equalsIgnoreCase("PUT"))
                            && !role.equalsIgnoreCase("ADMIN")
                            && uri.startsWith("/api/admin")) {

                        log.warn("🚫 Forbidden: User '{}' (Role={}) tried to {} {}",
                                email, role, method, uri);

                        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                        response.setContentType("application/json;charset=UTF-8");
                        response.getWriter().write(objectMapper.writeValueAsString(
                                ApiResponse.error(403, "Forbidden: Only Admin can modify or delete data!")
                        ));
                        return;
                    }

                    log.info("✅ Authenticated user: {}, role={}, method={}, uri={}",
                            email, role, method, uri);
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