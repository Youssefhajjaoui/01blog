package com.example.demo.dtos;

import java.util.List;

public class PostDto {
    private String id;
    private Userdto author;
    private String title;
    private String content;
    private String excerpt;
    private List<MediaDto> media;
    private List<String> tags;
    private int likes;
    private int comments;
    private boolean isLiked;
    private boolean isSubscribed;
    private String createdAt;
    private String visibility;

    // Getters
    public String getId() {
        return this.id;
    }

    public Userdto getAuthor() {
        return this.author;
    }

    public String getTitle() {
        return this.title;
    }

    public String getContent() {
        return this.content;
    }

    public String getExcerpt() {
        return this.excerpt;
    }

    public List<MediaDto> getMedia() {
        return this.media;
    }

    public List<String> getTags() {
        return this.tags;
    }

    public int getLikes() {
        return this.likes;
    }

    public int getComments() {
        return this.comments;
    }

    public boolean isLiked() {
        return this.isLiked;
    }

    public boolean isSubscribed() {
        return this.isSubscribed;
    }

    public String getCreatedAt() {
        return this.createdAt;
    }

    public String getVisibility() {
        return this.visibility;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setAuthor(Userdto author) {
        this.author = author;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setExcerpt(String excerpt) {
        this.excerpt = excerpt;
    }

    public void setMedia(List<MediaDto> media) {
        this.media = media;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public void setComments(int comments) {
        this.comments = comments;
    }

    public void setLiked(boolean isLiked) {
        this.isLiked = isLiked;
    }

    public void setSubscribed(boolean isSubscribed) {
        this.isSubscribed = isSubscribed;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }
}
