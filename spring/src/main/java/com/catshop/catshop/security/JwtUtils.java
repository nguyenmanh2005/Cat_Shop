package com.catshop.catshop.security;

import com.catshop.catshop.exception.JwtValidationException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // ✅ key ≥ 32 ký tự (nên để trong application.properties)
    private final String jwtSecret = "mySuperUltraMegaSecretKey1234567890SuperLongSecretKey!!!";

    // Access Token: 15 phút, Refresh Token: 7 ngày
    private final long accessTokenExpirationMs = 15 * 60 * 1000; // 15 phút
    private final long refreshTokenExpirationMs = 7 * 24 * 60 * 60 * 1000; // 7 ngày

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // ----------------------------------------------------
    // 🔹 Trích xuất toàn bộ Claims
    // ----------------------------------------------------
    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ----------------------------------------------------
    // 🔹 Sinh Access Token (ngắn hạn)
    // ----------------------------------------------------
    public String generateAccessToken(String email, String roleName) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", roleName)
                .setIssuer("CatShop Admin")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ----------------------------------------------------
    // 🔹 Sinh Refresh Token (dài hạn)
    // ----------------------------------------------------
    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuer("CatShop Admin")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ----------------------------------------------------
    // 🔹 Lấy thông tin cơ bản
    // ----------------------------------------------------
    public String getEmailFromToken(String token) {
        Claims claims = getAllClaims(token);
        return claims.getSubject();
    }

    public String extractRole(String token) {
        Claims claims = getAllClaims(token);
        // kế thừa từ Map<String,Object>
//       Claims là một Map (bản đồ key–value).
//       Mỗi key là tên claim, mỗi value là dữ liệu của claim.
        Object roleObject = claims.get("role");  // lấy ra đối tượng role
        if (roleObject != null) {
            return roleObject.toString(); // chuyển sang String an toàn
        }
        return null; // nếu không có thì trả về null
    }


    // Lấy ngày hết hạn token
    public Date getExpirationDate(String token) {
        Claims claims = getAllClaims(token);
        return claims.getExpiration();
    }

    // ----------------------------------------------------
    // 🔹 Validate token
    // ----------------------------------------------------
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
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


    // ----------------------------------------------------
    // 🔹 Check hết hạn mà không ném lỗi (dùng trong /refresh)
    // ----------------------------------------------------
    public boolean isTokenExpired(String token) {
        try {
            Date expirationDate = getExpirationDate(token);
            return expirationDate.before(new Date());
        } catch (JwtException e) {
            return true; // token sai => coi như hết hạn
        }
    }

    // ----------------------------------------------------
    // 🔹 Lấy thời gian còn lại của token (ms)
    // ----------------------------------------------------
    public long getRemainingTime(String token) {
        long now = System.currentTimeMillis();
        Date expirationDate = getExpirationDate(token);
        long exp = expirationDate.getTime();
        return Math.max(exp - now, 0);
    }
}
