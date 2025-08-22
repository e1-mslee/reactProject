package com.e1.backend.util;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;


@Component
public class JwtUtil {

    private final String secretKey;
    private final Long expiration;
    private final Long refreshExp;

    public JwtUtil(@Value("${access-secret}")String secret,
                   @Value("${access-token-exp}")Long expiration,
                   @Value("${refresh-token-exp}")Long refreshExp) {
        this.secretKey = secret;
        this.expiration = expiration;
        this.refreshExp = refreshExp;
    }

    public Key getSecretKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String getUserId(String token) {
        return Jwts.parserBuilder().setSigningKey(getSecretKey()).build().parseClaimsJws(token).getBody().get("userName", String.class);
    }

    public String getRole(String token) {
        return Jwts.parserBuilder().setSigningKey(getSecretKey()).build().parseClaimsJws(token).getBody().get("role", String.class);
    }

    public Boolean isExpired(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(getSecretKey()).build().parseClaimsJws(token).getBody().getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    public String createAccessToken(String userId, String role) {
        return Jwts.builder()
                .claim("userName", userId)
                .claim("role", role)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSecretKey())
                .compact();
    }

    public String createRefreshToken(String userId, String role) {
        return Jwts.builder()
                .claim("userName", userId)  // 추가
                .claim("role", role)      // 선택
                .setExpiration(new Date(System.currentTimeMillis() + refreshExp))
                .signWith(getSecretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validate(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSecretKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
}
