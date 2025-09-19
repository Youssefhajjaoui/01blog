package com.example.demo.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "users")
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "Username is required")
	@Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
	@Column(nullable = false, unique = true, length = 150)
	private String username;

	@NotBlank(message = "Email is required")
	@Email(message = "Email should be valid")
	@Column(nullable = false, unique = true, length = 255)
	private String email;

	@NotBlank(message = "Password hash is required")
	@Column(name = "password_hash", nullable = false)
	private String passwordHash;

	@Column
	private String image;

	@Column
	private LocalDate birthday;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private UserRole role = UserRole.USER;

	@Column(nullable = false)
	private boolean banned = false;

	@Column(name = "ban_end")
	private LocalDateTime banEnd;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	public User() {}

	// Constructor for registration
	public User(String username, String email, String passwordHash) {
		this.username = username;
		this.email = email;
		this.passwordHash = passwordHash;
		this.createdAt = LocalDateTime.now();
	}

	// Getters and Setters
	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	
	public String getUsername() { return username; }
	public void setUsername(String username) { this.username = username; }
	
	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }
	
	public String getPasswordHash() { return passwordHash; }
	public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
	
	public String getImage() { return image; }
	public void setImage(String image) { this.image = image; }
	
	public LocalDate getBirthday() { return birthday; }
	public void setBirthday(LocalDate birthday) { this.birthday = birthday; }
	
	public UserRole getRole() { return role; }
	public void setRole(UserRole role) { this.role = role; }
	
	public boolean isBanned() { return banned; }
	public void setBanned(boolean banned) { this.banned = banned; }
	
	public LocalDateTime getBanEnd() { return banEnd; }
	public void setBanEnd(LocalDateTime banEnd) { this.banEnd = banEnd; }
	
	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	// Check if user is currently banned
	public boolean isCurrentlyBanned() {
		return banned && (banEnd == null || banEnd.isAfter(LocalDateTime.now()));
	}
}
