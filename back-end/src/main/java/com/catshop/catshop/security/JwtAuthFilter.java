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
import org.springframework.lang.NonNull;
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

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String method = request.getMethod();

        // ✅ BỎ QUA HOÀN TOÀN CHO MFA & AUTH (không kiểm tra token)
        if (uri.startsWith("/auth") || uri.startsWith("/api/auth")) {
            log.debug("🔓 Bỏ qua JWT filter cho: {} {} - Cho phép request đi tiếp mà không cần token", method, uri);
            filterChain.doFilter(request, response);
            return;
        }

        // ✅ Bỏ qua các endpoint public khác (categories cho customer, v.v.)
        if (uri.startsWith("/api/categories/customer") || uri.startsWith("/public/")) {
            log.debug("🔓 Bỏ qua JWT filter cho public endpoint: {} {}", method, uri);
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        // ✅ Không có token → cho request đi tiếp (route nào cần token thì SecurityConfig sẽ chặn sau)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("🔓 Không có token trong request: {} {} - Cho phép đi tiếp, SecurityConfig sẽ quyết định", method, uri);
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtUtils.validateToken(token)) {
                throw new JwtValidationException("Token không hợp lệ hoặc đã hết hạn!");
            }

            String email = jwtUtils.getEmailFromToken(token);
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                throw new JwtValidationException("Không tìm thấy người dùng với email: " + email);
            }

            User user = userOpt.get();

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

            log.info("✅ Authenticated user: {}, role={}, method={}, uri={}",
                    email, user.getRole().getRoleName(), request.getMethod(), request.getRequestURI());

        } catch (JwtValidationException e) {
            log.warn("❌ JWT Error: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                    new ObjectMapper().writeValueAsString(ApiResponse.error(401, e.getMessage()))
            );
            return;
        }

        filterChain.doFilter(request, response);
    }
}
