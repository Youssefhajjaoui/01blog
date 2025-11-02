package com.example.demo.config;

import java.io.IOException;
import java.util.Optional;

import com.example.demo.models.*;
import com.example.demo.repositories.UserRepository;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.security.JwtUtil;
import com.example.demo.security.TokenBlacklistService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserRepository userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(JwtAuthFilter.class);

    public JwtAuthFilter(JwtUtil jwtUtil, UserRepository uds, TokenBlacklistService tokenBlacklistService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = uds;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Allow certain endpoints without authentication
        if (path.startsWith("/api/auth/") ||
                path.equals("/error")) {
            filterChain.doFilter(request, response);
            return;
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            // No cookies - let Spring Security decide if endpoint is permitAll
            filterChain.doFilter(request, response);
            return;
        }
        String token = null;
        for (Cookie cookie : cookies) {
            if ("jwt".equals(cookie.getName())) {
                token = cookie.getValue();
                break;
            }
        }

        if (token == null || token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check if token is blacklisted (invalidated by logout)
        if (tokenBlacklistService.isTokenBlacklisted(token)) {
            // Token was explicitly revoked - this is a hard rejection
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"error\":\"Unauthorized\",\"message\":\"Token has been revoked. Please log in again.\"}");
            return;
        }

        try {
            String username = jwtUtil.extractUsername(token);
            logger.debug("Extracted username from token: {}", username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Optional<User> optionalUser = userDetailsService.findByUsername(username);
                logger.debug("User found in database: {}", optionalUser.isPresent());

                if (optionalUser.isPresent()) {
                    User user = optionalUser.get();
                    boolean isValid = jwtUtil.validateToken(token, user);
                    logger.debug("Token validation result: {}", isValid);

                    if (isValid) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                user, null, user.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        logger.debug("Authentication set for user: {}", username);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("JWT filter error: ", e);
        }

        filterChain.doFilter(request, response);
    }
}
