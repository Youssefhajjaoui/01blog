package com.example.demo.models;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import com.example.demo.dtos.PostDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "posts")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Post {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "creator_id", nullable = false)
	private User creator;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false)
	private String content;

	@ElementCollection
	@CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
	@Column(name = "tag")
	private List<String> tags;

	@Column(name = "media_url")
	private String mediaUrl;

	@Enumerated(EnumType.STRING)
	@Column(name = "media_type")
	private MediaType mediaType;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@Column(name = "hidden", nullable = false)
	private Boolean hidden = false;

	@Column(name = "hide_reason")
	private String hideReason;

	@OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
	private List<Like> likes;

	@OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
	private List<Comment> comments;

	@OneToMany(mappedBy = "reportedPost", cascade = CascadeType.ALL)
	private List<Report> reports;

	public Post() {
	}

	public Long getId() {
		return id;
	}

	public List<String> getTags() {
		return this.tags;
	}

	public void setTags(List<String> tags) {
		this.tags = tags;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public User getCreator() {
		return creator;
	}

	public void setCreator(User creator) {
		this.creator = creator;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getMediaUrl() {
		return mediaUrl;
	}

	public void setMediaUrl(String mediaUrl) {
		this.mediaUrl = mediaUrl;
	}

	public MediaType getMediaType() {
		return mediaType;
	}

	public void setMediaType(MediaType mediaType) {
		this.mediaType = mediaType;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public List<Like> getLikes() {
		return this.likes;
	}

	public List<Comment> getComments() {
		return this.comments;
	}

	public List<Report> getReports() {
		return this.reports;
	}

	public void setReports(List<Report> reports) {
		this.reports = reports;
	}

	public Boolean getHidden() {
		return hidden != null ? hidden : false;
	}

	public void setHidden(Boolean hidden) {
		this.hidden = hidden != null ? hidden : false;
	}

	public String getHideReason() {
		return hideReason;
	}

	public void setHideReason(String hideReason) {
		this.hideReason = hideReason;
	}
}
