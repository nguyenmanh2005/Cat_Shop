package com.catshop.catshop.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.io.IOException;

@Slf4j
// Tạm thời tắt CorsFilter để tránh xung đột với SecurityConfig CORS
// @Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        // Always set CORS headers first, even if there's an error
        String origin = request.getHeader("Origin");
        log.debug("CORS Filter - Request from Origin: {}, Method: {}", origin, request.getMethod());
        
        // Khi allowCredentials = true, không thể dùng "*", phải set origin cụ thể
        if (origin != null && !origin.isEmpty()) {
            response.setHeader("Access-Control-Allow-Origin", origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
        } else {
            // Nếu không có origin, không set credentials để có thể dùng "*"
            response.setHeader("Access-Control-Allow-Origin", "*");
            // Không set Access-Control-Allow-Credentials khi dùng "*"
        }

        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Expose-Headers", "*");
        response.setHeader("Access-Control-Max-Age", "3600");

        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            log.debug("CORS Filter - Handling OPTIONS preflight request");
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // Wrap response to ensure CORS headers are always set, even on errors
        try {
            chain.doFilter(req, res);
        } catch (Exception e) {
            log.error("CORS Filter - Error in filter chain, but CORS headers already set: {}", e.getMessage());
            // CORS headers are already set, so browser will receive them even if there's an error
            throw e;
        }
    }

    @Override
    public void init(FilterConfig filterConfig) {
        // No initialization needed
    }

    @Override
    public void destroy() {
        // No cleanup needed
    }
}

