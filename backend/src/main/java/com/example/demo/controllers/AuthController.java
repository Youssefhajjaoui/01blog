package com.example.demo.controllers;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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
import com.example.demo.services.FileStorageService;
import com.example.demo.security.JwtUtil;

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

    public AuthController(UserRepository repo,
            PasswordEncoder encoder,
            JwtUtil jwtUtil,
            AuthenticationManager authManager,
            ObjectMapper objectMapper,
            FileStorageService fileStorageService) {
        this.userRepository = repo;
        this.passwordEncoder = encoder;
        this.jwtUtil = jwtUtil;
        this.authManager = authManager;
        this.objectMapper = objectMapper;
        this.fileStorageService = fileStorageService;
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

            // ✅ Save avatar from base64 if provided
            String photoPath = null;
            if (userDto.getAvatar() != null && !userDto.getAvatar().isEmpty()) {
                try {
                    // Use FileStorageService to save the image
                    String avatarUrl = fileStorageService.saveBase64Image(userDto.getAvatar(), "avatar");
                    // Store the relative path for database (remove base URL)
                    photoPath = avatarUrl.replace(fileStorageService.getBaseUrl(), "");
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body(new AuthResponseDto("Invalid avatar data: " + e.getMessage()));
                }
            }

            // ✅ Create user with photo path and bio
            User user = new User(
                    userDto.getUsername(),
                    userDto.getEmail(),
                    passwordEncoder.encode(userDto.getPassword()),
                    photoPath,
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
        // authenticate user
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
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        try {
            // Clear the JWT cookie
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
    public ResponseEntity<User> getUserFromJwt(HttpServletRequest request) {
        System.out.println();
        System.out.println();
        System.out.println();
        System.out.println();
        System.out.println();
        System.out.println();
        System.out.println();
        System.out.println();
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
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(userOpt.get());
    }
}