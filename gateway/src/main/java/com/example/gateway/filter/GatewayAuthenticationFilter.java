package com.example.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Global filter that adds gateway identification header to all backend requests
 * This allows the backend to identify requests coming from the gateway
 * Adds an HMAC signature to prevent header spoofing
 */
@Component
public class GatewayAuthenticationFilter implements GlobalFilter, Ordered {
    
    @Value("${gateway.shared.secret:change-me}")
    private String sharedSecret;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest originalRequest = exchange.getRequest();
        long timestampMs = System.currentTimeMillis();
        String method = originalRequest.getMethod() != null ? originalRequest.getMethod().name() : "UNKNOWN";
        String path = originalRequest.getURI().getRawPath();
        String payload = method + "\n" + path + "\n" + timestampMs;
        String signature = sign(payload, sharedSecret);
        
        // Overwrite any incoming headers and add signed identification headers
        ServerHttpRequest request = originalRequest.mutate()
                .header("X-Gateway-Request", "true")
                .header("X-Gateway-Timestamp", String.valueOf(timestampMs))
                .header("X-Gateway-Signature", signature)
                // Preserve the Origin header if it exists (for CORS validation)
                .build();
        
        return chain.filter(exchange.mutate().request(request).build());
    }
    
    @Override
    public int getOrder() {
        return -100; // Run early in the filter chain
    }

    private String sign(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(rawHmac.length * 2);
            for (byte b : rawHmac) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }
}

