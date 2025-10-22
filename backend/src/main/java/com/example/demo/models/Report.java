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

@Entity
@Table(name = "reports")
public class Report {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reporter_id", nullable = false)
	private User reporter;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reported_user_id")
	private User reportedUser;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reported_post_id")
	private Post reportedPost;

	@Column(nullable = false)
	private String reason;

	@Column(length = 1000)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ReportStatus status = ReportStatus.PENDING;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	public Report() {}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public User getReporter() { return reporter; }
	public void setReporter(User reporter) { this.reporter = reporter; }
	public User getReportedUser() { return reportedUser; }
	public void setReportedUser(User reportedUser) { this.reportedUser = reportedUser; }
	public Post getReportedPost() { return reportedPost; }
	public void setReportedPost(Post reportedPost) { this.reportedPost = reportedPost; }
	public String getReason() { return reason; }
	public void setReason(String reason) { this.reason = reason; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public ReportStatus getStatus() { return status; }
	public void setStatus(ReportStatus status) { this.status = status; }
	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 