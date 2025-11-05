package com.example.demo.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

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
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class User implements UserDetails {
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
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String passwordHash;

	@Column
	private String image;

	@Column
	private LocalDate birthday;

	@Column
	private String bio;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private UserRole role = UserRole.USER;

	@Column(nullable = false)
	private boolean banned = false;

	@Column(name = "ban_end")
	private LocalDateTime banEnd;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	public User() {

	}

	public User(String username, String email, String password, String photo, String bio) {
		this.username = username;
		this.email = email;
		this.passwordHash = password;
		this.image = photo;
		this.bio = bio;
	}

	// Constructor for registration
	public User(String username, String email, String passwordHash) {
		this.username = username;
		this.email = email;
		this.passwordHash = passwordHash;
		this.createdAt = LocalDateTime.now();
	}

	// Getters and Setters
	public Long getId() {
		return id;
	}

	public void setBio(String bio) {
		this.bio = bio;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public LocalDate getBirthday() {
		return birthday;
	}

	public void setBirthday(LocalDate birthday) {
		this.birthday = birthday;
	}

	public UserRole getRole() {
		return role;
	}

	public void setRole(UserRole role) {
		this.role = role;
	}

	public boolean isBanned() {
		return banned;
	}

	public void setBanned(boolean banned) {
		this.banned = banned;
	}

	public LocalDateTime getBanEnd() {
		return banEnd;
	}

	public void setBanEnd(LocalDateTime banEnd) {
		this.banEnd = banEnd;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	// Check if user is currently banned
	public boolean isCurrentlyBanned() {
		return banned && (banEnd == null || banEnd.isAfter(LocalDateTime.now()));
	}

	@JsonIgnore
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + this.role.name()));
	}

	// UserDetails interface methods
	@Override
	@JsonIgnore
	public String getPassword() {
		return passwordHash;
	}

	@Override
	@JsonIgnore
	public boolean isAccountNonExpired() {
		return true; // Account never expires
	}

	@Override
	@JsonIgnore
	public boolean isAccountNonLocked() {
		return !isCurrentlyBanned(); // Account is locked if currently banned
	}

	@Override
	@JsonIgnore
	public boolean isCredentialsNonExpired() {
		return true; // Credentials never expire
	}

	@Override
	@JsonIgnore
	public boolean isEnabled() {
		return !isCurrentlyBanned(); // User is enabled if not currently banned
	}

	public String getBio() {
		return this.bio;
	}

}
