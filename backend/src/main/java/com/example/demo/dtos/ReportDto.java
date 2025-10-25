package com.example.demo.dtos;

import com.example.demo.models.Report;
import com.example.demo.models.ReportStatus;
import com.example.demo.models.User;
import com.example.demo.models.Post;

public class ReportDto {
    private Long id;
    private String reason;
    private String description;
    private String status;
    private SimpleUserDto reporter;
    private SimpleUserDto reportedUser;
    private SimplePostDto reportedPost;
    private String createdAt;

    // Nested DTO for User to avoid circular references
    public static class SimpleUserDto {
        private Long id;
        private String username;
        private String email;
        private String avatar;
        private String role;
        private Boolean banned;
        private String createdAt;
        private Integer followers;
        private Integer following;
        private Integer posts;

        public SimpleUserDto() {}

        public SimpleUserDto(User user) {
            if (user != null) {
                this.id = user.getId();
                this.username = user.getUsername();
                this.email = user.getEmail();
                this.avatar = user.getImage();
                this.role = user.getRole() != null ? user.getRole().name() : "USER";
                this.banned = user.isBanned();
                this.createdAt = user.getCreatedAt() != null ? user.getCreatedAt().toString() : null;
                this.followers = 0; // Default values
                this.following = 0;
                this.posts = 0;
            }
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public Boolean getBanned() { return banned; }
        public void setBanned(Boolean banned) { this.banned = banned; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public Integer getFollowers() { return followers; }
        public void setFollowers(Integer followers) { this.followers = followers; }
        public Integer getFollowing() { return following; }
        public void setFollowing(Integer following) { this.following = following; }
        public Integer getPosts() { return posts; }
        public void setPosts(Integer posts) { this.posts = posts; }
    }

    // Nested DTO for Post to avoid circular references
    public static class SimplePostDto {
        private Long id;
        private String title;
        private String content;
        private SimpleUserDto author;
        private String createdAt;
        private java.util.List<String> tags;

        public SimplePostDto() {}

        public SimplePostDto(Post post) {
            if (post != null) {
                this.id = post.getId();
                this.title = post.getTitle();
                this.content = post.getContent();
                this.author = new SimpleUserDto(post.getCreator());
                this.createdAt = post.getCreatedAt() != null ? post.getCreatedAt().toString() : null;
                this.tags = post.getTags() != null ? post.getTags() : new java.util.ArrayList<>();
            }
        }

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public SimpleUserDto getAuthor() { return author; }
        public void setAuthor(SimpleUserDto author) { this.author = author; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public java.util.List<String> getTags() { return tags; }
        public void setTags(java.util.List<String> tags) { this.tags = tags; }
    }

    // Constructors
    public ReportDto() {}

    public ReportDto(Report report) {
        if (report != null) {
            this.id = report.getId();
            this.reason = report.getReason();
            this.description = report.getDescription();
            this.status = report.getStatus() != null ? report.getStatus().name() : "PENDING";
            this.reporter = new SimpleUserDto(report.getReporter());
            this.reportedUser = report.getReportedUser() != null ? new SimpleUserDto(report.getReportedUser()) : null;
            this.reportedPost = report.getReportedPost() != null ? new SimplePostDto(report.getReportedPost()) : null;
            this.createdAt = report.getCreatedAt() != null ? report.getCreatedAt().toString() : null;
        }
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public SimpleUserDto getReporter() {
        return reporter;
    }

    public void setReporter(SimpleUserDto reporter) {
        this.reporter = reporter;
    }

    public SimpleUserDto getReportedUser() {
        return reportedUser;
    }

    public void setReportedUser(SimpleUserDto reportedUser) {
        this.reportedUser = reportedUser;
    }

    public SimplePostDto getReportedPost() {
        return reportedPost;
    }

    public void setReportedPost(SimplePostDto reportedPost) {
        this.reportedPost = reportedPost;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}

