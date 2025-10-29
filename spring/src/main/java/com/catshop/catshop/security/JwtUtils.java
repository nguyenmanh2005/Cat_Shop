package com.catshop.catshop.security;

import com.catshop.catshop.exception.JwtValidationException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // ✅ key phải ≥ 32 ký tự, nên để trong application.properties rồi @Value
    private final String jwtSecret = "mySuperUltraMegaSecretKey1234567890SuperLongSecretKey!!!";
    private final long jwtExpirationMs = 86400000; // 24h

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // 🔹 Tạo token
    public String generateToken(String email, String roleName) {
        return Jwts.builder()
                .setSubject(email) // -> subject: tùy bạn chọn (email, username,...)
                .claim("role", roleName) // -> claim tùy chỉnh (payload)
                .setIssuer("AdminCatShop")
                .setAudience("FE who using api")
                .setIssuedAt(new Date()) // -> iat: thời điểm tạo
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs)) // -> exp: thời điểm hết hạn
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // -> header + signature
                .compact(); // -> gộp 3 phần lại thành 1 chuỗi token
    }


    // 🔹 Lấy email từ token
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

//    public String extractRole(String token){
//        String email = Jwts.parserBuilder()
//                .setSigningKey(getSigningKey())
//                .build()
//                .parseClaimsJws(token)
//                .getBody()
//                .getSubject();
//
//    }

    // 🔹 Kiểm tra token hợp lệ
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token); // nếu token sai => ném exception luôn
            return true;
        } catch (ExpiredJwtException e) {
            throw new JwtValidationException("Token đã hết hạn, vui lòng đăng nhập lại!");
        } catch (UnsupportedJwtException e) {
            throw new JwtValidationException("Token không được hỗ trợ!");
        } catch (MalformedJwtException e) {
            throw new JwtValidationException("Token không đúng định dạng!");
        } catch (SignatureException e) {
            throw new JwtValidationException("Chữ ký token không hợp lệ!");
        } catch (IllegalArgumentException e) {
            throw new JwtValidationException("Token trống hoặc không hợp lệ!");
        }
    }

}

