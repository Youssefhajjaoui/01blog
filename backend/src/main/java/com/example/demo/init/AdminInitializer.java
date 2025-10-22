package com.example.demo.init;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.core.env.Environment;

import com.example.demo.models.User;
import com.example.demo.models.UserRole;
import com.example.demo.repositories.UserRepository;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final Environment env;

    @Value("${ADMIN_USERNAME:admin}")
    private String adminUsername;

    @Value("${ADMIN_PASSWORD:admin}")
    private String adminPassword;

    @Value("${ADMIN_EMAIL:admin@example.com}")
    private String adminEmail;

    @Value("${ADMIN_AVATR:/uploads/admin.png}")
    private String adminavatar;

    @Value("${ADMIN_BIO:Nothing}")
    private String adminbio;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder, Environment env) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.env = env;
    }

    @Override
    public void run(String... args) {
        System.out.println("Env ADMIN_USERNAME = " + env.getProperty("ADMIN_USERNAME"));
        System.out.println("Env ADMIN_PASSWORD = " + env.getProperty("ADMIN_PASSWORD"));
        if (!userRepository.existsByUsername(adminUsername)) {
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole(UserRole.ADMIN);
            admin.setImage(adminavatar);
            admin.setBio(adminbio);
            userRepository.save(admin);
            System.out.println("✅ Admin user created: " + adminUsername);
        } else {
            System.out.println("ℹ️ Admin user already exists: " + adminUsername);
        }
    }
}
