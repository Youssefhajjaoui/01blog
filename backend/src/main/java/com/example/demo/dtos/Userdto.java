package com.example.demo.dtos;

import com.example.demo.models.UserRole;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class Userdto {

    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    private String avatar;
    private UserRole role;

    @NotBlank(message = "Password is required")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private int following;
    private int followers;
    private int posts;

    private String bio;

    public Userdto() {
    }

    public Userdto(String username, String email, String password, String photo, String bio) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.bio = bio;
        this.avatar = photo;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public int getFollowers() {
        return this.followers;
    }

    public int getFollowing() {
        return this.following;
    }

    public int getPosts() {
        return this.posts;
    }

    public void setFollowers(int followers) {
        this.followers = followers;
    }

    public void setFollowing(int following) {
        this.following = following;
    }

    public void setPosts(int posts) {
        this.posts = posts;
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

    public String getAvatar() {
        return this.avatar;
    }

    public UserRole getRole() {
        return this.role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
