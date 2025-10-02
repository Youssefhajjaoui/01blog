package com.example.demo.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "posts")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Post {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "creator_id", nullable = false)
	private User creator;

	@Column(nullable = false)
	private String Title;

	@Column(nullable = false)
	private String content;

	@Column(name = "media_url")
	private String mediaUrl;

	@Enumerated(EnumType.STRING)
	@Column(name = "media_type")
	private MediaType mediaType;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	public Post() {}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getTitle(){return Title;}
	public void SetTitle(String title){this.Title = title;}
	public User getCreator() { return creator; }
	public void setCreator(User creator) { this.creator = creator; }
	public String getContent() { return content; }
	public void setContent(String content) { this.content = content; }
	public String getMediaUrl() { return mediaUrl; }
	public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
	public MediaType getMediaType() { return mediaType; }
	public void setMediaType(MediaType mediaType) { this.mediaType = mediaType; }
	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
