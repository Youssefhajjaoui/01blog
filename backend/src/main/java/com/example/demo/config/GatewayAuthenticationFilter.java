package com.example.demo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Strict filter that only allows requests coming through the API gateway.
 * Identifies gateway traffic via signed headers added by the gateway.
 */
@Component
public class GatewayAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(GatewayAuthenticationFilter.class);

    @Value("${gateway.enabled:true}")
    private boolean gatewayEnabled;

    @Value("${gateway.shared.secret:change-me}")
    private String sharedSecret;

    @Value("${gateway.allowed.skew.ms:60000}")
    private long allowedSkewMs;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // If gateway enforcement is disabled, allow all requests (useful for local dev)
        if (!gatewayEnabled) {
            if (log.isDebugEnabled()) {
                log.debug("Gateway filter DISABLED - allowing request {} {}", request.getMethod(), request.getRequestURI());
            }
            filterChain.doFilter(request, response);
            return;
        }

        // Validate HMAC signature from gateway
        String tsHeader = request.getHeader("X-Gateway-Timestamp");
        String sigHeader = request.getHeader("X-Gateway-Signature");
        String gwHeader = request.getHeader("X-Gateway-Request");

        if ("true".equals(gwHeader) && tsHeader != null && sigHeader != null) {
            try {
                long ts = Long.parseLong(tsHeader);
                long now = System.currentTimeMillis();
                if (Math.abs(now - ts) <= allowedSkewMs) {
                    String payload = request.getMethod() + "\n" + request.getRequestURI() + "\n" + ts;
                    String expected = sign(payload, sharedSecret);
                    if (!expected.isEmpty() && constantTimeEquals(expected, sigHeader)) {
                        if (log.isDebugEnabled()) {
                            log.debug("Gateway signature VALID - allowing request {} {}", request.getMethod(), request.getRequestURI());
                        }
                        filterChain.doFilter(request, response);
                        return;
                    }
                    if (log.isWarnEnabled()) {
                        log.warn("Gateway signature INVALID for {} {}: expected={}, provided={}", request.getMethod(), request.getRequestURI(), expected, sigHeader);
                    }
                }
                else if (log.isWarnEnabled()) {
                    log.warn("Gateway timestamp outside allowed skew for {} {}: ts={}, now={}, skew={}ms", request.getMethod(), request.getRequestURI(), ts, now, allowedSkewMs);
                }
            } catch (Exception ignored) {
                if (log.isWarnEnabled()) {
                    log.warn("Gateway signature parse/validation error for {} {}", request.getMethod(), request.getRequestURI());
                }
            }
        }

        // Request did not come from an allowed source
        if (log.isInfoEnabled()) {
            log.info("Blocking direct backend access for {} {} from {} - missing/invalid gateway headers", request.getMethod(), request.getRequestURI(), request.getRemoteAddr());
        }
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"error\":\"Forbidden\",\"message\":\"Direct access to backend is not allowed. Please use the API gateway.\"}");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // Don't filter actuator endpoints for health checks
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path.startsWith("/actuator/")) {
            return true;
        }

        // Allow OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        return false;
    }

    private String sign(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(raw.length * 2);
            for (byte b : raw) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
