package com.example.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Global filter that adds gateway identification header to all backend requests
 * This allows the backend to identify requests coming from the gateway
 * Uses CORS-based validation instead of secret keys
 */
@Component
public class GatewayAuthenticationFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest originalRequest = exchange.getRequest();
        
        // Add header to identify this request comes from gateway
        ServerHttpRequest request = originalRequest.mutate()
                .header("X-Gateway-Request", "true")
                // Preserve the Origin header if it exists (for CORS validation)
                .build();
        
        return chain.filter(exchange.mutate().request(request).build());
    }
    
    @Override
    public int getOrder() {
        return -100; // Run early in the filter chain
    }
}

