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
    @Value("${ratelimit.auth.replenishRate:30}")
    private int authReplenishRate;
    @Value("${ratelimit.auth.burstCapacity:60}")
    private int authBurstCapacity;

    @Value("${ratelimit.api.replenishRate:500}")
    private int apiReplenishRate;
    @Value("${ratelimit.api.burstCapacity:1000}")
    private int apiBurstCapacity;

    @Value("${ratelimit.public.replenishRate:300}")
    private int publicReplenishRate;
    @Value("${ratelimit.public.burstCapacity:600}")
    private int publicBurstCapacity;

    @Value("${ratelimit.default.replenishRate:1000}")
    private int defaultReplenishRate;
    @Value("${ratelimit.default.burstCapacity:2000}")
    private int defaultBurstCapacity;

    @Value("${ratelimit.posts.replenishRate:500}")
    private int postsReplenishRate;
    @Value("${ratelimit.posts.burstCapacity:1000}")
    private int postsBurstCapacity;

    @Value("${ratelimit.comments.replenishRate:100}")
    private int commentsReplenishRate;
    @Value("${ratelimit.comments.burstCapacity:200}")
    private int commentsBurstCapacity;

    @Value("${ratelimit.likes.replenishRate:100}")
    private int likesReplenishRate;
    @Value("${ratelimit.likes.burstCapacity:200}")
    private int likesBurstCapacity;

    @Value("${ratelimit.subscriptions.replenishRate:50}")
    private int subscriptionsReplenishRate;
    @Value("${ratelimit.subscriptions.burstCapacity:100}")
    private int subscriptionsBurstCapacity;

    @Value("${ratelimit.files.replenishRate:20}")
    private int filesReplenishRate;
    @Value("${ratelimit.files.burstCapacity:40}")
    private int filesBurstCapacity;

    @Value("${ratelimit.admin.replenishRate:100}")
    private int adminReplenishRate;
    @Value("${ratelimit.admin.burstCapacity:200}")
    private int adminBurstCapacity;

    @Value("${ratelimit.sse.replenishRate:1000}")
    private int sseReplenishRate;
    @Value("${ratelimit.sse.burstCapacity:2000}")
    private int sseBurstCapacity;

    @Value("${ratelimit.suggestions.replenishRate:200}")
    private int suggestionsReplenishRate;
    @Value("${ratelimit.suggestions.burstCapacity:400}")
    private int suggestionsBurstCapacity;

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
    @Qualifier("postsRateLimiter")
    public RedisRateLimiter postsRateLimiter() {
        return new RedisRateLimiter(postsReplenishRate, postsBurstCapacity);
    }

    @Bean
    @Qualifier("commentsRateLimiter")
    public RedisRateLimiter commentsRateLimiter() {
        return new RedisRateLimiter(commentsReplenishRate, commentsBurstCapacity);
    }

    @Bean
    @Qualifier("likesRateLimiter")
    public RedisRateLimiter likesRateLimiter() {
        return new RedisRateLimiter(likesReplenishRate, likesBurstCapacity);
    }

    @Bean
    @Qualifier("subscriptionsRateLimiter")
    public RedisRateLimiter subscriptionsRateLimiter() {
        return new RedisRateLimiter(subscriptionsReplenishRate, subscriptionsBurstCapacity);
    }

    @Bean
    @Qualifier("filesRateLimiter")
    public RedisRateLimiter filesRateLimiter() {
        return new RedisRateLimiter(filesReplenishRate, filesBurstCapacity);
    }

    @Bean
    @Qualifier("adminRateLimiter")
    public RedisRateLimiter adminRateLimiter() {
        return new RedisRateLimiter(adminReplenishRate, adminBurstCapacity);
    }

    @Bean
    @Qualifier("sseRateLimiter")
    public RedisRateLimiter sseRateLimiter() {
        return new RedisRateLimiter(sseReplenishRate, sseBurstCapacity);
    }

    @Bean
    @Qualifier("suggestionsRateLimiter")
    public RedisRateLimiter suggestionsRateLimiter() {
        return new RedisRateLimiter(suggestionsReplenishRate, suggestionsBurstCapacity);
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder,
            @Qualifier("authRateLimiter") RedisRateLimiter authLimiter,
            @Qualifier("apiRateLimiter") RedisRateLimiter apiLimiter,
            @Qualifier("publicRateLimiter") RedisRateLimiter publicLimiter,
            @Qualifier("defaultRateLimiter") RedisRateLimiter defaultLimiter,
            @Qualifier("postsRateLimiter") RedisRateLimiter postsLimiter,
            @Qualifier("commentsRateLimiter") RedisRateLimiter commentsLimiter,
            @Qualifier("likesRateLimiter") RedisRateLimiter likesLimiter,
            @Qualifier("subscriptionsRateLimiter") RedisRateLimiter subscriptionsLimiter,
            @Qualifier("filesRateLimiter") RedisRateLimiter filesLimiter,
            @Qualifier("adminRateLimiter") RedisRateLimiter adminLimiter,
            @Qualifier("sseRateLimiter") RedisRateLimiter sseLimiter,
            @Qualifier("suggestionsRateLimiter") RedisRateLimiter suggestionsLimiter,
            UserKeyResolver userKeyResolver) {
        return builder.routes()
                // 1) SSE notifications - very high limits (keep-alive connections)
                .route("sse_route", r -> r
                        .path("/api/sse/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(sseLimiter);
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))

                // 2) Admin endpoints - moderate limits (rare operations)
                .route("admin_route", r -> r
                        .path("/api/admin/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(adminLimiter);
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))

                // 3) Posts endpoints - high limits (read and write)
                .route("posts_route", r -> r
                        .path("/api/posts/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(postsLimiter);
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))

                // 4) Comments endpoints - moderate limits
                .route("comments_route", r -> r
                        .path("/api/comments/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(commentsLimiter);
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))

                // 5) Likes endpoints - moderate limits
                .route("likes_route", r -> r
                        .path("/api/likes/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(likesLimiter);
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))

                // 6) Subscription endpoints - moderate limits
                .route("subscriptions_route", r -> r
                        .path("/api/subscriptions/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(subscriptionsLimiter);
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))

                // 7) File upload endpoints - lower limits (resource intensive)
                .route("files_route", r -> r
                        .path("/api/files/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(filesLimiter);
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))

                // 8) Suggestions endpoints - high limits (autocomplete)
                .route("suggestions_route", r -> r
                        .path("/api/suggestions/**")
                        .filters(f -> f
                                .preserveHostHeader()
                                .requestRateLimiter(c -> {
                                    c.setRateLimiter(suggestionsLimiter);
                                    c.setKeyResolver(userKeyResolver);
                                    c.setDenyEmptyKey(true);
                                }))
                        .uri(backendUrl))

                // 9) Authentication endpoints - moderate limits (login, register, logout)
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

                // 10) General API endpoints - high limits for everything else
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

                // 11) Default catch-all - apply default limits
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
