package com.example.demo.controllers;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dtos.AuthResponseDto;
import com.example.demo.dtos.UserLoginDto;
import com.example.demo.dtos.Userdto;
import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.repositories.PostRepository;
import com.example.demo.repositories.SubscriptionRepository;
import com.example.demo.services.FileStorageService;
import com.example.demo.security.JwtUtil;
import com.example.demo.security.TokenBlacklistService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final ObjectMapper objectMapper;
    private final FileStorageService fileStorageService;
    private final PostRepository postRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthController(UserRepository repo,
            PasswordEncoder encoder,
            JwtUtil jwtUtil,
            AuthenticationManager authManager,
            ObjectMapper objectMapper,
            FileStorageService fileStorageService,
            PostRepository postRepository,
            SubscriptionRepository subscriptionRepository,
            TokenBlacklistService tokenBlacklistService) {
        this.userRepository = repo;
        this.passwordEncoder = encoder;
        this.jwtUtil = jwtUtil;
        this.authManager = authManager;
        this.objectMapper = objectMapper;
        this.fileStorageService = fileStorageService;
        this.postRepository = postRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @PostMapping(value = "/register")
    public ResponseEntity<?> register(@RequestBody @Valid Userdto userDto, BindingResult result) {

        try {
            if (result.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                result.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
                return ResponseEntity.badRequest().body(errors);
            }

            if (userRepository.existsByUsername(userDto.getUsername())) {
                return ResponseEntity.badRequest().body(new AuthResponseDto("Username already exists"));
            }

            if (userRepository.existsByEmail(userDto.getEmail())) {
                return ResponseEntity.badRequest().body(new AuthResponseDto("Email already exists"));
            }

            // ✅ Save avatar if provided (supports: full URL, data URL, raw base64)
            String photoUrl = null;
            if (userDto.getAvatar() != null && !userDto.getAvatar().isEmpty()) {
                try {
                    String avatar = userDto.getAvatar().trim();

                    // If it's already a URL, store as-is
                    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
                        photoUrl = avatar;
                    } else {
                        String contentType = "image/jpeg"; // default
                        String filename = "avatar.jpg";
                        String base64Payload = avatar;

                        // data URL format: data:image/png;base64,<payload>
                        if (avatar.startsWith("data:")) {
                            int commaIndex = avatar.indexOf(',');
                            if (commaIndex > 0) {
                                String header = avatar.substring(0, commaIndex); // e.g. data:image/png;base64
                                base64Payload = avatar.substring(commaIndex + 1);

                                // Extract content type
                                int colonIdx = header.indexOf(':');
                                int semiIdx = header.indexOf(';');
                                if (colonIdx >= 0 && semiIdx > colonIdx) {
                                    contentType = header.substring(colonIdx + 1, semiIdx);
                                }

                                // Filename extension from contentType
                                String ext = ".jpg";
                                if (contentType.contains("png")) ext = ".png";
                                else if (contentType.contains("jpeg")) ext = ".jpg";
                                else if (contentType.contains("jpg")) ext = ".jpg";
                                else if (contentType.contains("webp")) ext = ".webp";
                                else if (contentType.contains("gif")) ext = ".gif";
                                filename = "avatar" + ext;
                            }
                        }

                        byte[] bytes;
                        try {
                            bytes = java.util.Base64.getDecoder().decode(base64Payload);
                        } catch (IllegalArgumentException ex) {
                            // Try URL-safe decoder as fallback
                            bytes = java.util.Base64.getUrlDecoder().decode(base64Payload);
                        }

                        photoUrl = fileStorageService.uploadBytes(bytes, contentType, filename, "uploads");
                    }
                } catch (Exception e) {
                    return ResponseEntity.badRequest()
                            .body(new AuthResponseDto("Invalid avatar data: " + e.getMessage()));
                }
            }

            // ✅ Create user with photo path and bio
            User user = new User(
                    userDto.getUsername(),
                    userDto.getEmail(),
                    passwordEncoder.encode(userDto.getPassword()),
                    photoUrl,
                    userDto.getBio());

            userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponseDto("User registered successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDto("Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginDto loginDto,
            BindingResult result,
            HttpServletResponse response) {
        try {
            // authenticate user - wrap in try-catch to handle authentication exceptions
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword()));
            User user = (User) authentication.getPrincipal();

            // generate JWT
            String token = jwtUtil.generateToken(user);

            // Create HttpOnly cookie
            ResponseCookie cookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true)
                    .secure(false) // Set to true in production with HTTPS
                    .path("/")
                    .maxAge(15 * 60) // 15 minutes
                    .sameSite("Lax")
                    .build();

            response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok(Map.of("message", "Logged in successfully"));
        } catch (BadCredentialsException e) {
            // Return proper error response directly (don't throw, Spring Security might
            // intercept it)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDto("Invalid username or password"));
        } catch (AuthenticationException e) {
            // Handle other authentication exceptions
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDto("Authentication failed: " + e.getMessage()));
        } catch (RuntimeException e) {
            // Handle runtime exceptions (like banned users)
            if (e.getMessage() != null && e.getMessage().contains("banned")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new AuthResponseDto("Account is banned"));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDto("Authentication failed: " + e.getMessage()));
        } catch (Exception e) {
            // Handle any other exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDto("Login failed: " + e.getMessage()));
        }
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Extract token from request to blacklist it
            String token = null;
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("jwt".equals(cookie.getName())) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }

            // Blacklist the token so it cannot be used anymore
            if (token != null && !token.isEmpty()) {
                tokenBlacklistService.blacklistToken(token);
            }

            // Clear the JWT cookie on client side
            ResponseCookie cookie = ResponseCookie.from("jwt", "")
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(0) // Expire immediately
                    .build();

            response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok(new AuthResponseDto("Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDto("Logout failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Userdto> getUserFromJwt(HttpServletRequest request) {
        // Get cookies from request
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Find the "jwt" cookie
        String token = null;
        for (Cookie cookie : cookies) {
            if ("jwt".equals(cookie.getName())) {
                token = cookie.getValue();
                break;
            }
        }
        System.out.println(token);
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Extract username from token
        String username = jwtUtil.extractUsername(token);
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Find user in repository
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty() || (userOpt.get().getBanEnd() != null
                && userOpt.get().getBanEnd().isAfter(java.time.LocalDateTime.now()))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userOpt.get();

        Userdto res = new Userdto(user.getUsername(), user.getEmail(), user.getPasswordHash(), user.getImage(),
                user.getBio());
        res.setId(user.getId());
        res.setRole(user.getRole());

        res.setFollowers(subscriptionRepository.findByFollowed(user).size());
        res.setFollowing(subscriptionRepository.findByFollower(user).size());
        res.setPosts(postRepository.findByCreator(user).size());
        return ResponseEntity.ok(res);
    }
}