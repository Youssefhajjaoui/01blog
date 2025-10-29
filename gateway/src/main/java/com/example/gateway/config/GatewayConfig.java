package com.example.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Gateway routing configuration
 * Note: Rate limiting will be added in a future update
 */
@Configuration
public class GatewayConfig {

    @Value("${backend.url}")
    private String backendUrl;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        // Route configuration that preserves cookies and credentials
        return builder.routes()
                .route("forward_to_backend", r -> r
                        .path("/**")
                        // Preserve the original request including cookies
                        .filters(f -> f
                                .preserveHostHeader()  // Preserve host header
                        )
                        .uri(backendUrl))
                .build();
    }

    /**
     * CORS configuration for the gateway
     * Allows requests from frontend during development
     */
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // Allow all origins in development
        corsConfig.addAllowedOriginPattern("*");
        
        // Allow all methods
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Allow all headers
        corsConfig.addAllowedHeader("*");
        
        // Allow credentials (cookies)
        corsConfig.setAllowCredentials(true);
        
        // Expose headers that client can access
        corsConfig.setExposedHeaders(Arrays.asList("Set-Cookie", "Authorization", "Access-Control-Allow-Origin"));
        
        // Cache preflight requests for 1 hour
        corsConfig.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        
        return new CorsWebFilter(source);
    }
}
