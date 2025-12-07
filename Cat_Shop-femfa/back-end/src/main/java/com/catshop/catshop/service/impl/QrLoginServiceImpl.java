package com.catshop.catshop.service.impl;

import com.catshop.catshop.dto.request.QrLoginRequest;
import com.catshop.catshop.dto.response.QrLoginResponse;
import com.catshop.catshop.dto.response.QrLoginStatusResponse;
import com.catshop.catshop.dto.response.TokenResponse;
import com.catshop.catshop.entity.User;
import com.catshop.catshop.exception.BadRequestException;
import com.catshop.catshop.exception.ResourceNotFoundException;
import com.catshop.catshop.repository.UserRepository;
import com.catshop.catshop.security.JwtUtils;
import com.catshop.catshop.service.QrLoginService;
import com.catshop.catshop.util.QrCodeGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class QrLoginServiceImpl implements QrLoginService {

    private static final String QR_STATUS_PREFIX = "qr:status:";
    private static final long QR_SESSION_EXPIRY_MINUTES = 5; // QR code hết hạn sau 5 phút
    private static final SecureRandom RANDOM = new SecureRandom();

    private final QrCodeGenerator qrCodeGenerator;
    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final ObjectMapper objectMapper;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public QrLoginResponse generateQrCode() {
        log.info("📱 [QR-LOGIN] Starting QR code generation. Frontend URL: {}", frontendUrl);
        
        // Tạo session ID ngẫu nhiên
        String sessionId = generateSessionId();
        log.debug("📱 [QR-LOGIN] Generated session ID: {}", sessionId);
        
        // Tạo QR code data (chứa session ID)
        String qrData = createQrData(sessionId);
        log.debug("📱 [QR-LOGIN] QR data created: {}", qrData);
        
        try {
            // Generate QR code image (Base64)
            log.debug("📱 [QR-LOGIN] Generating QR code image...");
            String qrCodeBase64 = qrCodeGenerator.generateBase64QrCode(qrData, 300, 300);
            log.debug("📱 [QR-LOGIN] QR code image generated (length: {})", qrCodeBase64 != null ? qrCodeBase64.length() : 0);
            
            // Lưu session vào Redis với status PENDING
            log.debug("📱 [QR-LOGIN] Saving session to Redis...");
            saveSessionStatus(sessionId, "PENDING", null);
            log.debug("📱 [QR-LOGIN] Session saved to Redis successfully");
            
            log.info("✅ QR code generated successfully. Session ID: {}", sessionId);
            
            return QrLoginResponse.builder()
                    .sessionId(sessionId)
                    .qrCodeBase64(qrCodeBase64)
                    .expiresIn(QR_SESSION_EXPIRY_MINUTES * 60)
                    .message("QR code đã được tạo. Vui lòng quét bằng ứng dụng di động.")
                    .build();
                    
        } catch (Exception e) {
            log.error("❌ Failed to generate QR code: {}", e.getMessage(), e);
            log.error("❌ Exception type: {}", e.getClass().getName());
            log.error("❌ Stack trace: ", e);
            throw new BadRequestException("Không thể tạo QR code: " + e.getMessage());
        }
    }

    @Override
    public boolean confirmQrLogin(QrLoginRequest request) {
        String sessionId = request.getSessionId();
        String email = request.getEmail();
        String password = request.getPassword();
        String deviceId = request.getDeviceId();

        log.info("📱 [QR-LOGIN] Confirm request received. Session: {}, Email: {}", sessionId, email);

        // Kiểm tra session có tồn tại và chưa hết hạn
        String currentStatus = getSessionStatus(sessionId);
        if (currentStatus == null) {
            log.error("❌ [QR-LOGIN] Session not found or expired: {}", sessionId);
            throw new BadRequestException("QR code đã hết hạn hoặc không hợp lệ");
        }

        if (!"PENDING".equals(currentStatus)) {
            log.error("❌ [QR-LOGIN] Session already processed. Status: {}", currentStatus);
            throw new BadRequestException("QR code đã được sử dụng");
        }

        // Validate credentials
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại"));

        processQrApproval(sessionId, user, password);

        log.info("✅ [QR-LOGIN] Login confirmed successfully (password). Session: {}, Email: {}", sessionId, email);

        return true;
    }

    @Override
    public void confirmQrLoginWithAccessToken(String sessionId, String accessToken) {
        log.info("📱 [QR-LOGIN] Confirm with access token. Session: {}", sessionId);

        String currentStatus = getSessionStatus(sessionId);
        if (currentStatus == null) {
            log.error("❌ [QR-LOGIN] Session not found or expired: {}", sessionId);
            throw new BadRequestException("QR code đã hết hạn hoặc không hợp lệ");
        }

        if (!"PENDING".equals(currentStatus)) {
            log.error("❌ [QR-LOGIN] Session already processed. Status: {}", currentStatus);
            throw new BadRequestException("QR code đã được sử dụng");
        }

        // Validate access token và lấy email từ token
        if (accessToken == null || accessToken.isBlank()) {
            throw new BadRequestException("Access token không hợp lệ");
        }

        // Ném lỗi rõ nếu token không hợp lệ / hết hạn
        if (!jwtUtils.validateToken(accessToken)) {
            throw new BadRequestException("Phiên đăng nhập trên điện thoại không hợp lệ hoặc đã hết hạn");
        }

        String email = jwtUtils.getEmailFromToken(accessToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));

        processQrApproval(sessionId, user, null);

        log.info("✅ [QR-LOGIN] Login confirmed successfully (access token). Session: {}, Email: {}", sessionId, email);
    }

    @Override
    public QrLoginStatusResponse checkStatus(String sessionId) {
        log.info("🔍 [QR-LOGIN] Checking status for session: {}", sessionId);

        String status = getSessionStatus(sessionId);
        
        if (status == null) {
            return QrLoginStatusResponse.builder()
                    .status("EXPIRED")
                    .message("QR code đã hết hạn")
                    .build();
        }

        if ("PENDING".equals(status)) {
            return QrLoginStatusResponse.builder()
                    .status("PENDING")
                    .message("Đang chờ xác nhận từ ứng dụng di động")
                    .build();
        }

        if ("REJECTED".equals(status)) {
            return QrLoginStatusResponse.builder()
                    .status("REJECTED")
                    .message("Đăng nhập bị từ chối")
                    .build();
        }

        if ("APPROVED".equals(status)) {
            // Lấy tokens từ Redis
            TokenResponse tokens = getSessionTokens(sessionId);
            if (tokens != null) {
                // Xóa session sau khi đã lấy tokens
                deleteSession(sessionId);
                
                return QrLoginStatusResponse.builder()
                        .status("APPROVED")
                        .tokens(tokens)
                        .message("Đăng nhập thành công")
                        .build();
            }
        }

        return QrLoginStatusResponse.builder()
                .status("EXPIRED")
                .message("QR code đã hết hạn")
                .build();
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private String generateSessionId() {
        // Sử dụng UUID để tạo session ID an toàn hơn, tránh bị đoán
        return "qr_" + java.util.UUID.randomUUID().toString().replace("-", "");
    }

    private String createQrData(String sessionId) {
        // QR code sẽ chứa URL để mở trang mobile login
        // Format: http://localhost:5173/qr-login?sessionId=xxx
        try {
            String qrUrl = frontendUrl + "/qr-login?sessionId=" + sessionId;
            
            // Tạo JSON với cả URL và sessionId để linh hoạt
            QrData qrData = new QrData(sessionId, System.currentTimeMillis(), qrUrl);
            return objectMapper.writeValueAsString(qrData);
        } catch (JsonProcessingException e) {
            // Fallback: chỉ dùng URL trực tiếp
            return frontendUrl + "/qr-login?sessionId=" + sessionId;
        }
    }

    private void saveSessionStatus(String sessionId, String status, TokenResponse tokens) {
        try {
            String key = QR_STATUS_PREFIX + sessionId;
            if (tokens != null) {
                // Lưu tokens dưới dạng JSON
                try {
                    String tokensJson = objectMapper.writeValueAsString(tokens);
                    redisTemplate.opsForValue().set(key, status + ":" + tokensJson, 
                            QR_SESSION_EXPIRY_MINUTES, TimeUnit.MINUTES);
                } catch (JsonProcessingException e) {
                    log.error("❌ Failed to serialize tokens: {}", e.getMessage());
                    redisTemplate.opsForValue().set(key, status, 
                            QR_SESSION_EXPIRY_MINUTES, TimeUnit.MINUTES);
                }
            } else {
                redisTemplate.opsForValue().set(key, status, 
                        QR_SESSION_EXPIRY_MINUTES, TimeUnit.MINUTES);
            }
        } catch (DataAccessException e) {
            log.error("❌ Failed to save session status to Redis: {}", e.getMessage());
            log.error("❌ Redis connection error. Check REDIS_HOST, REDIS_PORT, REDIS_PASSWORD");
            log.error("❌ Exception type: {}", e.getClass().getName());
            log.error("❌ Stack trace: ", e);
            // Fallback: lưu vào in-memory (nếu cần)
            throw new BadRequestException("Không thể lưu session. Redis connection failed: " + e.getMessage());
        }
    }

    private String getSessionStatus(String sessionId) {
        try {
            String key = QR_STATUS_PREFIX + sessionId;
            String value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                return null;
            }
            // Nếu có tokens, value sẽ là "APPROVED:{tokensJson}"
            if (value.contains(":")) {
                return value.split(":")[0];
            }
            return value;
        } catch (DataAccessException e) {
            log.error("❌ Failed to get session status from Redis: {}", e.getMessage());
            return null;
        }
    }

    private TokenResponse getSessionTokens(String sessionId) {
        try {
            String key = QR_STATUS_PREFIX + sessionId;
            String value = redisTemplate.opsForValue().get(key);
            if (value == null || !value.contains(":")) {
                return null;
            }
            
            // Parse tokens từ JSON
            String tokensJson = value.substring(value.indexOf(":") + 1);
            return objectMapper.readValue(tokensJson, TokenResponse.class);
        } catch (Exception e) {
            log.error("❌ Failed to get tokens from session: {}", e.getMessage());
            return null;
        }
    }

    private void deleteSession(String sessionId) {
        try {
            String key = QR_STATUS_PREFIX + sessionId;
            redisTemplate.delete(key);
        } catch (DataAccessException e) {
            log.warn("⚠️ Failed to delete session from Redis: {}", e.getMessage());
        }
    }

    /**
     * Xử lý chung khi chấp nhận đăng nhập QR cho một user (từ password hoặc access token)
     */
    private void processQrApproval(String sessionId, User user, String rawPasswordIfProvided) {
        String email = user.getEmail();

        // ⛔ Chặn Admin đăng nhập qua QR - QR login chỉ dành cho Customer
        if (user.getRole() != null && "Admin".equalsIgnoreCase(user.getRole().getRoleName())) {
            log.warn("⛔ [QR-LOGIN] Admin không được phép đăng nhập qua QR: {}", email);
            saveSessionStatus(sessionId, "REJECTED", null);
            throw new BadRequestException("Tài khoản Admin không được phép đăng nhập qua QR code. Vui lòng sử dụng email và mật khẩu.");
        }

        // Nếu có rawPassword, validate password (flow cũ)
        if (rawPasswordIfProvided != null) {
            boolean passwordMatches = passwordEncoder.matches(rawPasswordIfProvided, user.getPasswordHash());
            if (!passwordMatches) {
                log.error("❌ [QR-LOGIN] Invalid password for: {}", email);
                saveSessionStatus(sessionId, "REJECTED", null);
                throw new BadRequestException("Mật khẩu không chính xác");
            }
        }

        // Generate tokens
        String accessToken = jwtUtils.generateAccessToken(user.getEmail(), user.getRole().getRoleName());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        // Lưu refresh token vào Redis (nếu Redis available)
        try {
            redisTemplate.opsForValue().set("refresh:" + user.getEmail(), refreshToken, 7, TimeUnit.DAYS);
        } catch (DataAccessException e) {
            log.warn("⚠️ [QR-LOGIN] Cannot save refresh token to Redis: {}", e.getMessage());
        }

        // Lưu tokens vào session status
        TokenResponse tokens = new TokenResponse(accessToken, refreshToken, false);
        saveSessionStatus(sessionId, "APPROVED", tokens);
    }

    // Inner class cho QR data
    private static class QrData {
        private String sessionId;
        private long timestamp;
        private String url;

        public QrData(String sessionId, long timestamp, String url) {
            this.sessionId = sessionId;
            this.timestamp = timestamp;
            this.url = url;
        }

        public String getSessionId() {
            return sessionId;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public String getUrl() {
            return url;
        }
    }
}

