package com.catshop.catshop.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(1)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    private static final String CONTENT_SECURITY_POLICY = String.join(" ",
            "default-src 'self';",
            "img-src 'self' data: blob:;",
            "script-src 'self';",
            "style-src 'self' 'unsafe-inline';",
            "font-src 'self' data:;",
            "connect-src 'self';",
            "frame-ancestors 'none';",
            "form-action 'self';",
            "base-uri 'self';"
    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("X-XSS-Protection", "1; mode=block");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
        response.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY);
        response.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

        filterChain.doFilter(request, response);
    }
}

