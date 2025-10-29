package com.example.demo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Filter that validates requests come from trusted sources using CORS origin validation
 * Allows requests from:
 * 1. Allowed CORS origins (browser requests via gateway)
 * 2. Gateway service (server-to-server requests identified by X-Gateway-Request header)
 * 3. Internal/localhost requests (for development)
 */
@Component
public class GatewayAuthenticationFilter extends OncePerRequestFilter {
    
    @Value("${gateway.enabled:true}")
    private boolean gatewayEnabled;
    
    @Value("${cors.allowed.origins:http://localhost:4200,http://localhost:3000,http://localhost:8080}")
    private String allowedOrigins;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        // If gateway authentication is disabled, allow all requests
        if (!gatewayEnabled) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Allow requests from gateway service (identified by X-Gateway-Request header)
        String gatewayRequest = request.getHeader("X-Gateway-Request");
        if ("true".equals(gatewayRequest)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Check CORS origin header
        String origin = request.getHeader("Origin");
        if (origin != null) {
            List<String> allowedOriginsList = Arrays.asList(allowedOrigins.split(","));
            // Trim whitespace and check if origin matches
            boolean originAllowed = allowedOriginsList.stream()
                    .map(String::trim)
                    .anyMatch(allowed -> {
                        // Support pattern matching (e.g., http://localhost:*)
                        if (allowed.contains("*")) {
                            // Escape regex special characters, then replace * with .*
                            String escaped = allowed.replace("\\", "\\\\")  // Escape backslashes first
                                                    .replace(".", "\\.")
                                                    .replace("+", "\\+")
                                                    .replace("?", "\\?")
                                                    .replace("^", "\\^")
                                                    .replace("$", "\\$")
                                                    .replace("[", "\\[")
                                                    .replace("]", "\\]")
                                                    .replace("(", "\\(")
                                                    .replace(")", "\\)")
                                                    .replace("{", "\\{")
                                                    .replace("}", "\\}")
                                                    .replace("|", "\\|")
                                                    .replace("*", ".*");
                            return origin.matches(escaped);
                        }
                        return origin.equals(allowed);
                    });
            
            if (originAllowed) {
                filterChain.doFilter(request, response);
                return;
            }
        }
        
        // Allow localhost/internal network requests for development
        String remoteAddr = request.getRemoteAddr();
        String host = request.getHeader("Host");
        if (remoteAddr != null && (remoteAddr.startsWith("127.") || remoteAddr.startsWith("172.") || 
                                   remoteAddr.equals("localhost") || remoteAddr.equals("::1") ||
                                   (host != null && (host.contains("localhost") || host.contains("gateway") || host.contains("backend"))))) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Request did not come from an allowed source
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Forbidden\",\"message\":\"Direct access to backend is not allowed. Please use the API gateway.\"}");
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
        
        // Also allow auth endpoints to pass through (they're already protected by Spring Security permitAll)
        // This prevents double-filtering and potential issues
        if (path.startsWith("/api/auth/")) {
            return true;
        }
        
        return false;
    }
}

