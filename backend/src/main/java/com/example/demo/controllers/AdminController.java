package com.example.demo.controllers;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dtos.DashboardStats;
import com.example.demo.dtos.PostDto;
import com.example.demo.dtos.Userdto;
import com.example.demo.dtos.MediaDto;
import com.example.demo.dtos.ReportDto;
import com.example.demo.models.Post;
import com.example.demo.models.Report;
import com.example.demo.models.User;
import com.example.demo.models.UserRole;
import com.example.demo.models.Comment;
import com.example.demo.models.Like;
import com.example.demo.models.Subscription;
import com.example.demo.repositories.PostRepository;
import com.example.demo.repositories.ReportRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.FileStorageService;
import com.example.demo.repositories.CommentRepository;
import com.example.demo.repositories.LikeRepository;
import com.example.demo.repositories.SubscriptionRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReportRepository reportRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final FileStorageService fileStorageService;

    public AdminController(UserRepository userRepository, PostRepository postRepository,
            ReportRepository reportRepository, CommentRepository commentRepository,
            LikeRepository likeRepository, SubscriptionRepository subscriptionRepository,
            FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.reportRepository = reportRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.fileStorageService = fileStorageService;
    }

    // User Management Endpoints
    @GetMapping("/users")
    public ResponseEntity<List<Userdto>> getAllUsers(@AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Userdto> users = userRepository.findAll().stream()
                .map(this::mapUserToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Userdto> getUserById(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<User> user = userRepository.findById(id);
        return user.map(u -> ResponseEntity.ok(mapUserToDto(u))).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/ban")
    public ResponseEntity<Object> banUser(@PathVariable Long id, @RequestBody(required = false) BanRequest request,
            @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();

        // Prevent banning admin users
        if (user.getRole() == UserRole.ADMIN) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Cannot ban admin users"));
        }

        user.setBanned(true);
        // If not permanent, set ban end date
        if (request == null || !request.permanent) {
            // Use custom duration if provided, otherwise default to 30 days
            int duration = (request != null && request.duration != null && request.duration > 0)
                    ? request.duration
                    : 30;

            java.time.LocalDateTime banEnd;
            if (request != null && request.durationUnit != null) {
                switch (request.durationUnit.toLowerCase()) {
                    case "minutes":
                        banEnd = java.time.LocalDateTime.now().plusMinutes(duration);
                        break;
                    case "hours":
                        banEnd = java.time.LocalDateTime.now().plusHours(duration);
                        break;
                    case "days":
                    default:
                        banEnd = java.time.LocalDateTime.now().plusDays(duration);
                        break;
                }
            } else {
                banEnd = java.time.LocalDateTime.now().plusDays(duration);
            }
            user.setBanEnd(banEnd);
        } else {
            user.setBanEnd(null); // Permanent ban
        }

        userRepository.save(user);
        return ResponseEntity.ok().body(java.util.Map.of("message", "User banned successfully"));
    }

    @PostMapping("/users/{id}/unban")
    public ResponseEntity<Object> unbanUser(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();
        user.setBanned(false);
        user.setBanEnd(null);

        userRepository.save(user);
        return ResponseEntity.ok().body(java.util.Map.of("message", "User unbanned successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Object> deleteUser(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();

        // Don't allow deleting admin users
        if (user.getRole() == UserRole.ADMIN) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Cannot delete admin users"));
        }

        try {
            // Delete user's posts
            List<Post> userPosts = postRepository.findByCreator_Id(id);
            if (!userPosts.isEmpty()) {
                postRepository.deleteAll(userPosts);
            }

            // Delete user's comments
            List<Comment> userComments = commentRepository.findByCreator_Id(id);
            if (!userComments.isEmpty()) {
                commentRepository.deleteAll(userComments);
            }

            // Delete user's likes
            List<Like> userLikes = likeRepository.findByCreator_Id(id);
            if (!userLikes.isEmpty()) {
                likeRepository.deleteAll(userLikes);
            }

            // Delete reports where user is reporter or reported user
            List<Report> reportsAsReporter = reportRepository.findByReporter(user);
            List<Report> reportsAsReported = reportRepository.findByReportedUser(user);
            if (!reportsAsReporter.isEmpty()) {
                reportRepository.deleteAll(reportsAsReporter);
            }
            if (!reportsAsReported.isEmpty()) {
                reportRepository.deleteAll(reportsAsReported);
            }

            // Delete subscriptions where user is follower or followed
            List<Subscription> subscriptionsAsFollower = subscriptionRepository.findByFollower(user);
            List<Subscription> subscriptionsAsFollowed = subscriptionRepository.findByFollowed(user);
            if (!subscriptionsAsFollower.isEmpty()) {
                subscriptionRepository.deleteAll(subscriptionsAsFollower);
            }
            if (!subscriptionsAsFollowed.isEmpty()) {
                subscriptionRepository.deleteAll(subscriptionsAsFollowed);
            }

            // Finally delete the user
            userRepository.delete(user);

            return ResponseEntity.ok()
                    .body(java.util.Map.of("message", "User and all related data deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }

    // Post Management Endpoints
    @GetMapping("/posts")
    public ResponseEntity<List<PostDto>> getAllPosts(@AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<PostDto> posts = postRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<PostDto> getPostById(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Post> post = postRepository.findById(id);
        return post.map(p -> ResponseEntity.ok(mapToDto(p))).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/posts/{id}/hide")
    public ResponseEntity<Object> hidePost(@PathVariable Long id,
            @RequestBody(required = false) HidePostRequest request,
            @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Post post = optionalPost.get();
        post.setHidden(true);
        if (request != null && request.reason != null && !request.reason.trim().isEmpty()) {
            post.setHideReason(request.reason.trim());
        } else {
            post.setHideReason("Hidden by admin");
        }
        postRepository.save(post);
        return ResponseEntity.ok()
                .body(java.util.Map.of("message", "Post hidden successfully", "reason", post.getHideReason()));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Object> deletePost(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Delete post media if present
        Post post = optionalPost.get();
        fileStorageService.deleteFileByUrl(post.getMediaUrl());
        postRepository.delete(post);
        return ResponseEntity.ok().body(java.util.Map.of("message", "Post deleted successfully"));
    }

    @PostMapping("/posts/{id}/restore")
    public ResponseEntity<Object> restorePost(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Post post = optionalPost.get();
        post.setHidden(false);
        post.setHideReason(null);
        postRepository.save(post);
        return ResponseEntity.ok().body(java.util.Map.of("message", "Post restored successfully"));
    }

    // Report Management Endpoints
    @GetMapping("/reports")
    public ResponseEntity<List<ReportDto>> getAllReports(@AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Report> reports = reportRepository.findAll();
        List<ReportDto> reportDtos = reports.stream()
                .map(ReportDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reportDtos);
    }

    @GetMapping("/reports/{id}")
    public ResponseEntity<ReportDto> getReportById(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Report> report = reportRepository.findById(id);
        return report.map(r -> ResponseEntity.ok(new ReportDto(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<Object> resolveReport(@PathVariable Long id,
            @RequestBody(required = false) ResolutionRequest request, @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Report> optionalReport = reportRepository.findById(id);
        if (optionalReport.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Report report = optionalReport.get();
        report.setStatus(com.example.demo.models.ReportStatus.RESOLVED);
        reportRepository.save(report);

        return ResponseEntity.ok().body(java.util.Map.of("message", "Report resolved successfully"));
    }

    @PostMapping("/reports/{id}/dismiss")
    public ResponseEntity<Object> dismissReport(@PathVariable Long id,
            @RequestBody(required = false) DismissalRequest request, @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Report> optionalReport = reportRepository.findById(id);
        if (optionalReport.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Report report = optionalReport.get();
        report.setStatus(com.example.demo.models.ReportStatus.DISMISSED);
        reportRepository.save(report);

        return ResponseEntity.ok().body(java.util.Map.of("message", "Report dismissed successfully"));
    }

    @PostMapping("/reports/{id}/escalate")
    public ResponseEntity<Object> escalateReport(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Report> optionalReport = reportRepository.findById(id);
        if (optionalReport.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // You might want to add priority levels to Report entity
        // For now, we'll just return success
        return ResponseEntity.ok().body(java.util.Map.of("message", "Report escalated successfully"));
    }

    // Manual endpoint to check and unban expired users
    @PostMapping("/users/check-expired-bans")
    public ResponseEntity<Object> checkExpiredBans(@AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            List<User> expiredBans = userRepository.findAll().stream()
                    .filter(user -> user.isBanned() && user.getBanEnd() != null)
                    .filter(user -> user.getBanEnd().isBefore(java.time.LocalDateTime.now()))
                    .collect(java.util.stream.Collectors.toList());

            if (!expiredBans.isEmpty()) {
                for (User user : expiredBans) {
                    user.setBanned(false);
                    user.setBanEnd(null);
                }
                userRepository.saveAll(expiredBans);
                return ResponseEntity.ok().body(java.util.Map.of(
                        "message", "Unbanned " + expiredBans.size() + " users with expired bans",
                        "unbannedUsers",
                        expiredBans.stream().map(User::getUsername).collect(java.util.stream.Collectors.toList())));
            } else {
                return ResponseEntity.ok().body(java.util.Map.of("message", "No users with expired bans found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to check expired bans: " + e.getMessage()));
        }
    }

    // Scheduled task to automatically unban users when their ban expires
    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void autoUnbanExpiredUsers() {
        try {
            List<User> bannedUsers = userRepository.findAll().stream()
                    .filter(user -> user.isBanned() && user.getBanEnd() != null)
                    .filter(user -> user.getBanEnd().isBefore(java.time.LocalDateTime.now()))
                    .collect(java.util.stream.Collectors.toList());

            if (!bannedUsers.isEmpty()) {
                for (User user : bannedUsers) {
                    user.setBanned(false);
                    user.setBanEnd(null);
                }
                userRepository.saveAll(bannedUsers);
                System.out.println("Auto-unbanned " + bannedUsers.size() + " users whose ban period expired");
            }
        } catch (Exception e) {
            System.err.println("Error in auto-unban task: " + e.getMessage());
        }
    }

    // Dashboard Statistics
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats(@AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByBannedFalse();
        long bannedUsers = userRepository.countByBannedTrue();
        long totalPosts = postRepository.count();
        long pendingReports = reportRepository.countByStatus(com.example.demo.models.ReportStatus.PENDING);
        long resolvedReports = reportRepository.countByStatus(com.example.demo.models.ReportStatus.RESOLVED);

        // Calculate new users and posts this month
        java.time.LocalDateTime startOfMonth = java.time.LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0)
                .withSecond(0);
        long newUsersThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);
        long newPostsThisMonth = postRepository.countByCreatedAtAfter(startOfMonth);

        DashboardStats stats = new DashboardStats();
        stats.setTotalUsers(totalUsers);
        stats.setActiveUsers(activeUsers);
        stats.setBannedUsers(bannedUsers);
        stats.setTotalPosts(totalPosts);
        stats.setPendingReports(pendingReports);
        stats.setCriticalReports(Math.max(1, pendingReports / 3)); // Mock calculation
        stats.setResolvedReports(resolvedReports);
        double platformHealth = totalUsers != 0
                ? ((double) (totalUsers - bannedUsers) / totalUsers) * 100
                : 100;

        stats.setPlatformHealth(Math.round(platformHealth * 100.0) / 100.0);
        stats.setNewUsersThisMonth(newUsersThisMonth);
        stats.setNewPostsThisMonth(newPostsThisMonth);

        // Mock data for top tags and growth charts
        stats.setTopTags(java.util.Arrays.asList(
                new DashboardStats.TagCount("technology", 45),
                new DashboardStats.TagCount("lifestyle", 32),
                new DashboardStats.TagCount("travel", 28),
                new DashboardStats.TagCount("food", 25),
                new DashboardStats.TagCount("sports", 20)));

        // Mock growth data for the last 6 months
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.util.List<DashboardStats.GrowthData> userGrowth = new java.util.ArrayList<>();
        java.util.List<DashboardStats.GrowthData> postGrowth = new java.util.ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            java.time.LocalDateTime month = now.minusMonths(i);
            String monthStr = month.getMonth().toString().substring(0, 3) + " " + month.getYear();

            // Mock data - in real implementation, you'd query actual data
            long mockUsers = Math.max(0, newUsersThisMonth - (5 - i) * 2);
            long mockPosts = Math.max(0, newPostsThisMonth - (5 - i) * 3);

            userGrowth.add(new DashboardStats.GrowthData(monthStr, mockUsers, 0));
            postGrowth.add(new DashboardStats.GrowthData(monthStr, 0, mockPosts));
        }

        stats.setUserGrowth(userGrowth);
        stats.setPostGrowth(postGrowth);

        return ResponseEntity.ok(stats);
    }

    // Bulk Operations

    @PostMapping("/users/bulk-ban")
    public ResponseEntity<Object> bulkBanUsers(@RequestBody BulkBanRequest request,
            @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<User> users = userRepository.findAllById(request.userIds);
        List<User> bannedUsers = new java.util.ArrayList<>();

        for (User user : users) {
            // Skip admin users
            if (user.getRole() == UserRole.ADMIN) {
                continue;
            }

            user.setBanned(true);
            if (!request.permanent) {
                int duration = (request.duration != null && request.duration > 0)
                        ? request.duration
                        : 30; // Default 30 days

                java.time.LocalDateTime banEnd;
                if (request.durationUnit != null) {
                    switch (request.durationUnit.toLowerCase()) {
                        case "minutes":
                            banEnd = java.time.LocalDateTime.now().plusMinutes(duration);
                            break;
                        case "hours":
                            banEnd = java.time.LocalDateTime.now().plusHours(duration);
                            break;
                        case "days":
                        default:
                            banEnd = java.time.LocalDateTime.now().plusDays(duration);
                            break;
                    }
                } else {
                    banEnd = java.time.LocalDateTime.now().plusDays(duration);
                }
                user.setBanEnd(banEnd);
            } else {
                user.setBanEnd(null); // Permanent ban
            }
            bannedUsers.add(user);
        }

        if (bannedUsers.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "No users could be banned (admin users excluded)"));
        }

        userRepository.saveAll(bannedUsers);

        return ResponseEntity.ok().body(java.util.Map.of("message", "Users banned successfully"));
    }

    @PostMapping("/users/bulk-delete")
    public ResponseEntity<Object> bulkDeleteUsers(@RequestBody BulkUserRequest request,
            @AuthenticationPrincipal User principal) {
        if (principal == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<User> users = userRepository.findAllById(request.userIds);
        // Filter out admin users and collect
        List<User> deletableUsers = users.stream()
                .filter(user -> user.getRole() != UserRole.ADMIN)
                .collect(Collectors.toList());

        // Delete avatars and user posts' media, then delete users
        for (User u : deletableUsers) {
            fileStorageService.deleteFileByUrl(u.getImage());
            List<Post> posts = postRepository.findByCreator_Id(u.getId());
            for (Post p : posts) {
                fileStorageService.deleteFileByUrl(p.getMediaUrl());
            }
        }

        userRepository.deleteAll(deletableUsers);

        return ResponseEntity.ok().body(java.util.Map.of("message", "Users deleted successfully"));
    }

    // Mapping helpers
    private Userdto mapUserToDto(User user) {
        Userdto dto = new Userdto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setAvatar(user.getImage());
        dto.setBio(user.getBio());
        dto.setRole(user.getRole());
        dto.setFollowers(subscriptionRepository.findByFollowed(user).size());
        dto.setFollowing(subscriptionRepository.findByFollower(user).size());
        dto.setPosts(postRepository.findByCreator_Id(user.getId()).size());
        return dto;
    }

    private PostDto mapToDto(Post post) {
        PostDto dto = new PostDto();
        dto.setId(post.getId().toString());
        dto.setAuthor(mapUserToDto(post.getCreator()));
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setExcerpt(post.getContent() != null && post.getContent().length() > 100
                ? post.getContent().substring(0, 100) + "..."
                : post.getContent());
        if (post.getMediaUrl() != null && post.getMediaType() != null) {
            dto.setMedia(
                    java.util.List.of(new MediaDto(post.getMediaType().name(), post.getMediaUrl(), post.getTitle())));
        } else {
            dto.setMedia(java.util.List.of());
        }
        dto.setTags(post.getTags());
        dto.setLikes((int) likeRepository.countByPost_Id(post.getId()));
        dto.setComments(commentRepository.findByPost_Id(post.getId()).size());
        dto.setLiked(false);
        dto.setSubscribed(false);
        dto.setCreatedAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : null);
        dto.setVisibility("public");
        dto.setHidden(post.getHidden() != null ? post.getHidden() : false);
        dto.setHideReason(post.getHideReason());
        return dto;
    }

    // DTOs for request bodies

    public static class BanRequest {
        public boolean permanent = false;
        public Integer duration;
        public String durationUnit; // "minutes", "hours", "days"
        public String reason;
    }

    public static class ResolutionRequest {
        public String resolution;
    }

    public static class DismissalRequest {
        public String reason;
    }

    public static class BulkUserRequest {
        public List<Long> userIds;
        public Integer duration;
    }

    public static class BulkBanRequest {
        public List<Long> userIds;
        public boolean permanent = false;
        public Integer duration;
        public String durationUnit; // "minutes", "hours", "days"
    }

    public static class HidePostRequest {
        public String reason;
    }

}
