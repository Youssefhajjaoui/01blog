package com.example.gateway.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Gateway routing configuration with Redis rate limiting
 */
@Configuration
public class GatewayConfig {

    @Value("${backend.url}")
    private String backendUrl;

    // ===== Rate limit properties (from application.properties) =====
    @Value("${ratelimit.auth.replenishRate:5}")
    private int authReplenishRate;
    @Value("${ratelimit.auth.burstCapacity:10}")
    private int authBurstCapacity;

    @Value("${ratelimit.api.replenishRate:50}")
    private int apiReplenishRate;
    @Value("${ratelimit.api.burstCapacity:100}")
    private int apiBurstCapacity;

    @Value("${ratelimit.public.replenishRate:20}")
    private int publicReplenishRate;
    @Value("${ratelimit.public.burstCapacity:40}")
    private int publicBurstCapacity;

    @Value("${ratelimit.default.replenishRate:100}")
    private int defaultReplenishRate;
    @Value("${ratelimit.default.burstCapacity:150}")
    private int defaultBurstCapacity;

    // ===== Rate limiter beans =====
    @Bean
    @Qualifier("authRateLimiter")
    public RedisRateLimiter authRateLimiter() {
        return new RedisRateLimiter(authReplenishRate, authBurstCapacity);
    }

    @Bean
    @Qualifier("apiRateLimiter")
    public RedisRateLimiter apiRateLimiter() {
        return new RedisRateLimiter(apiReplenishRate, apiBurstCapacity);
    }

    @Bean
    @Qualifier("publicRateLimiter")
    public RedisRateLimiter publicRateLimiter() {
        return new RedisRateLimiter(publicReplenishRate, publicBurstCapacity);
    }

    @Bean
    @Qualifier("defaultRateLimiter")
    @Primary
    public RedisRateLimiter defaultRateLimiter() {
        return new RedisRateLimiter(defaultReplenishRate, defaultBurstCapacity);
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder,
            @Qualifier("authRateLimiter") RedisRateLimiter authLimiter,
            @Qualifier("apiRateLimiter") RedisRateLimiter apiLimiter,
            @Qualifier("publicRateLimiter") RedisRateLimiter publicLimiter,
            @Qualifier("defaultRateLimiter") RedisRateLimiter defaultLimiter,
            UserKeyResolver userKeyResolver) {
        return builder.routes()
                // 1) Authentication endpoints - stricter limits (per user/IP)
                .route("auth_route", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(authLimiter);
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))

                // 2) Public endpoints (e.g., posts listing) - IP-based limits
                .route("public_posts_route", r -> r
                        .path("/api/posts/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(publicLimiter);
                                    // For public routes, use IP-based key (via userKeyResolver fallback)
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))

                // 3) API endpoints - per-user limits
                .route("api_route", r -> r
                        .path("/api/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(apiLimiter);
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))

                // 4) Default catch-all - apply default limits
                .route("default_route", r -> r
                        .path("/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(defaultLimiter);
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))
                .build();
    }

    /**
     * CORS configuration for the gateway
     */
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.addAllowedOriginPattern("*");
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        corsConfig.addAllowedHeader("*");
        corsConfig.setAllowCredentials(true);
        corsConfig.setExposedHeaders(Arrays.asList("Set-Cookie", "Authorization", "Access-Control-Allow-Origin"));
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return new CorsWebFilter(source);
    }
}
