package com.example.demo.security;

import java.util.Date;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.demo.models.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private Long expiration;

    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return new SecretKeySpec(keyBytes, SignatureAlgorithm.HS256.getJcaName());
    }

    public String generateToken(User user) {
        String jti = java.util.UUID.randomUUID().toString();
        return Jwts.builder()
                .setSubject(user.getUsername())
                .setId(jti)  // Add unique token ID
                .claim("roles", user.getAuthorities())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    /**
     * Extract token ID (jti) from token
     */
    public String extractTokenId(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.getId();
        } catch (Exception e) {
            return null;
        }
    }

    public String extractUsername(String token) {
        try {
            return extractClaims(token).getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateToken(String token, User user) {
        try {
            final String username = extractUsername(token);
            return username != null &&
                    username.equals(user.getUsername()) &&
                    !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            Date expiration = extractClaims(token).getExpiration();
            return expiration.before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    public Claims extractClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            // Return the claims even if expired for blacklist purposes
            return e.getClaims();
        } catch (MalformedJwtException | SignatureException | UnsupportedJwtException
                | IllegalArgumentException e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
    
    /**
     * Extract expiration time from token
     */
    public long getExpirationTime(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.getExpiration().getTime();
        } catch (Exception e) {
            return System.currentTimeMillis() + expiration;
        }
    }
}
