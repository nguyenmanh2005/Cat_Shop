package com.catshop.catshop.config;

import com.catshop.catshop.security.CustomOAuth2SuccessHandler;
import com.catshop.catshop.security.JwtAuthEntryPoint;
import com.catshop.catshop.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;
@Slf4j
@RequiredArgsConstructor
@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final CustomOAuth2SuccessHandler customOAuth2SuccessHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/oauth2/authorization/google")
                        .successHandler(customOAuth2SuccessHandler)
                        .failureHandler((request, response, exception) -> {
                            log.error("❌ OAuth2 login failed: {}", exception.getMessage(), exception);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"error\": \"" + exception.getMessage() + "\"}");
                        })
                )
                // CORS cho tất cả FE
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Tắt CSRF vì dùng JWT
                .csrf(csrf -> csrf.disable())

                // Exception handling 401 và 403
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            // Custom entry point: bỏ qua cho các endpoint auth
                            String uri = request.getRequestURI();
                            if (uri != null && (uri.contains("/api/auth/") || uri.contains("/auth/"))) {
                                // Cho phép request đi tiếp đến controller
                                // Không set response để request có thể đi tiếp
                                return;
                            }
                            // Gọi entry point mặc định cho các endpoint khác
                            jwtAuthEntryPoint.commence(request, response, authException);
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> { // 403 Forbidden
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"error\":\"Forbidden: Bạn không có quyền truy cập\"}");
                        })
                )

                // Quy định quyền truy cập
                .authorizeHttpRequests(auth -> auth
                        // ✅ Cho phép OPTIONS requests (CORS preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // ✅ Cho phép tất cả các endpoint auth và public (ưu tiên cao nhất)
                        .requestMatchers("/auth/**", "/api/auth/**", "/public/**", "/oauth2/**").permitAll()
                        // ✅ Cho phép GET categories cho customer (không cần auth)
                        .requestMatchers(HttpMethod.GET, "/api/categories/customer").permitAll()
                        // ✅ Admin endpoints
                        .requestMatchers(
                                "/api/users/**",
                                "/api/categories/admin/**",
                                "/api/admin/**",
                                "/api/products/admin/**",
                                "/api/reviews/admin/**",
                                "/api/shipments/admin/**",
                                "/api/payments/**",
                                "/api/order-details/**",
                                "/api/orders/admin/**",
                                "/api/admin/food-details/**",
                                "/api/admin/cleaning-details/**",
                                "/api/admin/cat-details/**",
                                "/api/admin/cage-details/**"
                        ).hasRole("ADMIN")
                        // ✅ PUT và DELETE yêu cầu ADMIN
                        .requestMatchers(HttpMethod.PUT, "/api/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
                        // ✅ Các request khác cần authentication
                        .anyRequest().authenticated()
                )

//                .authorizeHttpRequests(auth -> auth
//                        .anyRequest().permitAll()
//                )

                // Stateless session
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Thêm filter JWT (JwtAuthFilter đã tự động bỏ qua các endpoint /api/auth/)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS config mở cho tất cả FE
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Cho phép tất cả origins (bao gồm Railway domains)
        config.setAllowedOriginPatterns(List.of("*")); // Dùng setAllowedOriginPatterns thay vì setAllowedOrigins
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*")); // Expose tất cả headers
        config.setAllowCredentials(true); // Cho phép credentials
        config.setMaxAge(3600L); // Cache preflight requests
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // Thêm WebMvcConfigurer để handle CORS ở level Spring MVC
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        .allowedHeaders("*")
                        .exposedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
