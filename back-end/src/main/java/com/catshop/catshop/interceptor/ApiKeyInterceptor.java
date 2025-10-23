package com.catshop.catshop.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class ApiKeyInterceptor implements HandlerInterceptor {

    private static final String API_KEY = "secret123";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        String apiKey = request.getHeader("X-API-KEY");

        if (apiKey == null || !apiKey.equals(API_KEY)) {
            log.warn("Unauthorized API request: missing/invalid API key, method={}, URI={}",
                    request.getMethod(), request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.getWriter().write("Unauthorized: Missing or invalid API Key!");
            return false;
        }

        log.info("✅ API Request Allowed: method={}, URI={}", request.getMethod(), request.getRequestURI());
        return true;
    }
}
