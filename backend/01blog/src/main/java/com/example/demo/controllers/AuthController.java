package com.example.demo.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.AuthResponseDto;
import com.example.demo.dtos.UserLoginDto;
import com.example.demo.dtos.UserRegistrationDto;
import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.security.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    public AuthController(UserRepository repo,
            PasswordEncoder encoder,
            JwtUtil jwtUtil,
            AuthenticationManager authManager) {
        this.userRepository = repo;
        this.passwordEncoder = encoder;
        this.jwtUtil = jwtUtil;
        this.authManager = authManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegistrationDto userDto, BindingResult result) {
        try {
            // Check for validation errors
            if (result.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                result.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
                return ResponseEntity.badRequest().body(errors);
            }

            // Check if username already exists
            if (userRepository.existsByUsername(userDto.getUsername())) {
                return ResponseEntity.badRequest()
                        .body(new AuthResponseDto("Username already exists"));
            }

            // Check if email already exists
            if (userRepository.existsByEmail(userDto.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(new AuthResponseDto("Email already exists"));
            }

            // Create new user
            User user = new User(
                    userDto.getUsername(),
                    userDto.getEmail(),
                    passwordEncoder.encode(userDto.getPassword()));

            userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponseDto("User registered successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDto("Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginDto loginDto, BindingResult result) {
        try {
            // Check for validation errors
            if (result.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                result.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
                return ResponseEntity.badRequest().body(errors);
            }

            // Authenticate user
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getUsername(),
                            loginDto.getPassword()));

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Get user information
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user is banned
            if (user.isCurrentlyBanned()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new AuthResponseDto("Account is banned"));
            }

            // Generate token
            String token = jwtUtil.generateToken(userDetails);

            return ResponseEntity.ok(new AuthResponseDto(token, user.getUsername(), user.getRole().toString()));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDto("Invalid username or password"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDto("Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        try {
            // In a real implementation, you might want to:
            // 1. Add the token to a blacklist
            // 2. Store blacklisted tokens in Redis with expiration
            // 3. Or use a stateful approach with sessions

            // For now, just return success - client should remove token
            return ResponseEntity.ok(new AuthResponseDto("Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponseDto("Logout failed: " + e.getMessage()));
        }
    }
}
