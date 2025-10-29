//package com.catshop.catshop.interceptor;
//
//import com.catshop.catshop.entity.User;
//import com.catshop.catshop.service.impl.UserServiceImpl;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Component;
//import org.springframework.web.servlet.HandlerInterceptor;
//
//@Slf4j
//@Component
//@RequiredArgsConstructor
//public class RoleInterceptor implements HandlerInterceptor {
//
//    private final UserServiceImpl userService;
//
//    @Override
//    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
//
//        // 1. Lấy email từ header (giả lập login)
//        String email = request.getHeader("X-USER-EMAIL");
//        if (email == null || email.isEmpty()) {
//            log.warn("Unauthorized access attempt: missing X-USER-EMAIL header, URI={}, Method={}",
//                    request.getRequestURI(), request.getMethod());
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            response.setContentType("application/json;charset=UTF-8");
//            response.getWriter().write("Unauthorized: Missing X-USER-EMAIL header!");
//            response.getWriter().flush();
//            return false;
//        }
//
//        // 2. Lấy user từ DB
//        User user = userService.getUserEntityByEmail(email);
//        if (user == null) {
//            log.warn("Unauthorized access attempt: user not found, email={}, URI={}, Method={}",
//                    email, request.getRequestURI(), request.getMethod());
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            response.setContentType("application/json;charset=UTF-8");
//            response.getWriter().write("Unauthorized: User not found!");
//            response.getWriter().flush();
//            return false;
//        }
//
//        // 3. Kiểm tra role: chỉ ADMIN mới được DELETE
//        String method = request.getMethod();
//        String uri = request.getRequestURI();
//        String roleName = user.getRole().getRoleName();
//
//        if (method.equalsIgnoreCase("DELETE") && !roleName.equalsIgnoreCase("Admin")) {
//            log.warn("Forbidden DELETE attempt: user={}, role={}, URI={}", email, roleName, uri);
//            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
//            response.setContentType("application/json;charset=UTF-8");
//            response.getWriter().write("Forbidden: Only Admin can delete users!");
//            response.getWriter().flush();
//            return false;
//        }
//
//        // 4. Log thông tin request hợp lệ
//        log.info("✅ Request allowed: user={}, role={}, method={}, URI={}", email, roleName, method, uri);
//
//        return true;
//    }
//}
