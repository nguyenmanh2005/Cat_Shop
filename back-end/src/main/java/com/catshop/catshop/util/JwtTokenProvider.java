package com.catshop.catshop.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-token-expiration}")
    private Long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshTokenExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Tạo access token
    public String generateAccessToken(Long userId, String email, Long roleId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("roleId", roleId);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId.toString())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    // Tạo refresh token
    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpiration);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId.toString())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    // Validate token
    public Boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    // Kiểm tra token đã hết hạn chưa
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Lấy expiration date từ token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Lấy user ID từ token
    public Long getUserIdFromToken(String token) {
        Claims claims = extractAllClaims(token);
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Number) {
            return ((Number) userIdObj).longValue();
        }
        return Long.parseLong(userIdObj.toString());
    }

    // Lấy email từ token
    public String getEmailFromToken(String token) {
        Claims claims = extractAllClaims(token);
        Object emailObj = claims.get("email");
        return emailObj != null ? emailObj.toString() : null;
    }

    // Lấy role ID từ token
    public Long getRoleIdFromToken(String token) {
        Claims claims = extractAllClaims(token);
        Object roleIdObj = claims.get("roleId");
        if (roleIdObj instanceof Number) {
            return ((Number) roleIdObj).longValue();
        }
        return roleIdObj != null ? Long.parseLong(roleIdObj.toString()) : null;
    }

    // Extract một claim cụ thể
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extract tất cả claims từ token
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
