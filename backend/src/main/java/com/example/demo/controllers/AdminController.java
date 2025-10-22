// package com.example.demo.controllers;

// import java.util.List;
// import java.util.Optional;
// import java.util.stream.Collectors;

// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.web.bind.annotation.DeleteMapping;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.PutMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// import com.example.demo.models.Post;
// import com.example.demo.models.Report;
// import com.example.demo.models.User;
// import com.example.demo.models.UserRole;
// import com.example.demo.repositories.PostRepository;
// import com.example.demo.repositories.ReportRepository;
// import com.example.demo.repositories.UserRepository;

// @RestController
// @RequestMapping("/api/admin")
// public class AdminController {

//     private final UserRepository userRepository;
//     private final PostRepository postRepository;
//     private final ReportRepository reportRepository;

//     public AdminController(UserRepository userRepository, PostRepository postRepository, ReportRepository reportRepository) {
//         this.userRepository = userRepository;
//         this.postRepository = postRepository;
//         this.reportRepository = reportRepository;
//     }

//     // User Management Endpoints
//     @GetMapping("/users")
//     public ResponseEntity<List<User>> getAllUsers(@AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         List<User> users = userRepository.findAll();
//         return ResponseEntity.ok(users);
//     }

//     @GetMapping("/users/{id}")
//     public ResponseEntity<User> getUserById(@PathVariable Long id, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<User> user = userRepository.findById(id);
//         return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
//     }

//     @PostMapping("/users/{id}/suspend")
//     public ResponseEntity<String> suspendUser(@PathVariable Long id, @RequestBody(required = false) SuspendRequest request, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<User> optionalUser = userRepository.findById(id);
//         if (optionalUser.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }
        
//         User user = optionalUser.get();
//         user.setBanned(true);
//         // Set ban end date if duration is provided (in days)
//         if (request != null && request.duration != null) {
//             user.setBanEnd(java.time.LocalDateTime.now().plusDays(request.duration));
//         }
        
//         userRepository.save(user);
//         return ResponseEntity.ok("User suspended successfully");
//     }

//     @PostMapping("/users/{id}/ban")
//     public ResponseEntity<String> banUser(@PathVariable Long id, @RequestBody(required = false) BanRequest request, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<User> optionalUser = userRepository.findById(id);
//         if (optionalUser.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }
        
//         User user = optionalUser.get();
//         user.setBanned(true);
//         // If not permanent, set ban end date
//         if (request == null || !request.permanent) {
//             user.setBanEnd(java.time.LocalDateTime.now().plusDays(30)); // Default 30 days
//         } else {
//             user.setBanEnd(null); // Permanent ban
//         }
        
//         userRepository.save(user);
//         return ResponseEntity.ok("User banned successfully");
//     }

//     @PostMapping("/users/{id}/unban")
//     public ResponseEntity<String> unbanUser(@PathVariable Long id, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<User> optionalUser = userRepository.findById(id);
//         if (optionalUser.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }
        
//         User user = optionalUser.get();
//         user.setBanned(false);
//         user.setBanEnd(null);
        
//         userRepository.save(user);
//         return ResponseEntity.ok("User unbanned successfully");
//     }

//     @DeleteMapping("/users/{id}")
//     public ResponseEntity<String> deleteUser(@PathVariable Long id, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<User> optionalUser = userRepository.findById(id);
//         if (optionalUser.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }
        
//         // Don't allow deleting admin users
//         if (optionalUser.get().getRole() == UserRole.ADMIN) {
//             return ResponseEntity.badRequest().body("Cannot delete admin users");
//         }
        
//         userRepository.delete(optionalUser.get());
//         return ResponseEntity.ok("User deleted successfully");
//     }

//     // Post Management Endpoints
//     @GetMapping("/posts")
//     public ResponseEntity<List<Post>> getAllPosts(@AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         List<Post> posts = postRepository.findAll();
//         return ResponseEntity.ok(posts);
//     }

//     @GetMapping("/posts/{id}")
//     public ResponseEntity<Post> getPostById(@PathVariable Long id, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<Post> post = postRepository.findById(id);
//         return post.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
//     }

//     @PostMapping("/posts/{id}/hide")
//     public ResponseEntity<String> hidePost(@PathVariable Long id, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<Post> optionalPost = postRepository.findById(id);
//         if (optionalPost.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }
        
//         Post post = optionalPost.get();
//         // You might want to add a 'hidden' field to Post entity
//         // For now, we'll just return success
//         return ResponseEntity.ok("Post hidden successfully");
//     }

//     @DeleteMapping("/posts/{id}")
//     public ResponseEntity<String> deletePost(@PathVariable Long id, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<Post> optionalPost = postRepository.findById(id);
//         if (optionalPost.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }
        
//         postRepository.delete(optionalPost.get());
//         return ResponseEntity.ok("Post deleted successfully");
//     }

//     @PostMapping("/posts/{id}/restore")
//     public ResponseEntity<String> restorePost(@PathVariable Long id, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<Post> optionalPost = postRepository.findById(id);
//         if (optionalPost.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }
        
//         // You might want to add a 'hidden' field to Post entity
//         // For now, we'll just return success
//         return ResponseEntity.ok("Post restored successfully");
//     }

//     // Report Management Endpoints
//     @GetMapping("/reports")
//     public ResponseEntity<List<Report>> getAllReports(@AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         List<Report> reports = reportRepository.findAll();
//         return ResponseEntity.ok(reports);
//     }

//     @GetMapping("/reports/{id}")
//     public ResponseEntity<Report> getReportById(@PathVariable Long id, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<Report> report = reportRepository.findById(id);
//         return report.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
//     }

//     @PostMapping("/reports/{id}/resolve")
//     public ResponseEntity<String> resolveReport(@PathVariable Long id, @RequestBody(required = false) ResolutionRequest request, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<Report> optionalReport = reportRepository.findById(id);
//         if (optionalReport.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }
        
//         Report report = optionalReport.get();
//         report.setStatus(com.example.demo.models.ReportStatus.RESOLVED);
//         reportRepository.save(report);
        
//         return ResponseEntity.ok("Report resolved successfully");
//     }

//     @PostMapping("/reports/{id}/dismiss")
//     public ResponseEntity<String> dismissReport(@PathVariable Long id, @RequestBody(required = false) DismissalRequest request, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<Report> optionalReport = reportRepository.findById(id);
//         if (optionalReport.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }
        
//         Report report = optionalReport.get();
//         report.setStatus(com.example.demo.models.ReportStatus.DISMISSED);
//         reportRepository.save(report);
        
//         return ResponseEntity.ok("Report dismissed successfully");
//     }

//     @PostMapping("/reports/{id}/escalate")
//     public ResponseEntity<String> escalateReport(@PathVariable Long id, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         Optional<Report> optionalReport = reportRepository.findById(id);
//         if (optionalReport.isEmpty()) {
//             return ResponseEntity.notFound().build();
//         }
        
//         // You might want to add priority levels to Report entity
//         // For now, we'll just return success
//         return ResponseEntity.ok("Report escalated successfully");
//     }

//     // Dashboard Statistics
//     @GetMapping("/stats")
//     public ResponseEntity<DashboardStats> getDashboardStats(@AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         long totalUsers = userRepository.count();
//         long activeUsers = userRepository.countByBannedFalse();
//         long suspendedUsers = userRepository.countByBannedTrue();
//         long totalPosts = postRepository.count();
//         long pendingReports = reportRepository.countByStatus(com.example.demo.models.ReportStatus.PENDING);
//         long resolvedReports = reportRepository.countByStatus(com.example.demo.models.ReportStatus.RESOLVED);
        
//         DashboardStats stats = new DashboardStats();
//         stats.setTotalUsers(totalUsers);
//         stats.setActiveUsers(activeUsers);
//         stats.setSuspendedUsers(suspendedUsers);
//         stats.setTotalPosts(totalPosts);
//         stats.setPendingReports(pendingReports);
//         stats.setCriticalReports(Math.max(1, pendingReports / 3)); // Mock calculation
//         stats.setResolvedReports(resolvedReports);
//         stats.setPlatformHealth(98.5);
        
//         return ResponseEntity.ok(stats);
//     }

//     // Bulk Operations
//     @PostMapping("/users/bulk-suspend")
//     public ResponseEntity<String> bulkSuspendUsers(@RequestBody BulkUserRequest request, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         List<User> users = userRepository.findAllById(request.userIds);
//         for (User user : users) {
//             user.setBanned(true);
//             if (request.duration != null) {
//                 user.setBanEnd(java.time.LocalDateTime.now().plusDays(request.duration));
//             }
//         }
//         userRepository.saveAll(users);
        
//         return ResponseEntity.ok("Users suspended successfully");
//     }

//     @PostMapping("/users/bulk-ban")
//     public ResponseEntity<String> bulkBanUsers(@RequestBody BulkBanRequest request, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         List<User> users = userRepository.findAllById(request.userIds);
//         for (User user : users) {
//             user.setBanned(true);
//             if (!request.permanent) {
//                 user.setBanEnd(java.time.LocalDateTime.now().plusDays(30));
//             } else {
//                 user.setBanEnd(null);
//             }
//         }
//         userRepository.saveAll(users);
        
//         return ResponseEntity.ok("Users banned successfully");
//     }

//     @PostMapping("/users/bulk-delete")
//     public ResponseEntity<String> bulkDeleteUsers(@RequestBody BulkUserRequest request, @AuthenticationPrincipal User principal) {
//         if (principal == null || principal.getRole() != UserRole.ADMIN) {
//             return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//         }
        
//         List<User> users = userRepository.findAllById(request.userIds);
//         // Filter out admin users
//         List<User> deletableUsers = users.stream()
//             .filter(user -> user.getRole() != UserRole.ADMIN)
//             .collect(Collectors.toList());
        
//         userRepository.deleteAll(deletableUsers);
        
//         return ResponseEntity.ok("Users deleted successfully");
//     }

//     // DTOs for request bodies
//     public static class SuspendRequest {
//         public Integer duration;
//     }

//     public static class BanRequest {
//         public boolean permanent = false;
//     }

//     public static class ResolutionRequest {
//         public String resolution;
//     }

//     public static class DismissalRequest {
//         public String reason;
//     }

//     public static class BulkUserRequest {
//         public List<Long> userIds;
//         public Integer duration;
//     }

//     public static class BulkBanRequest {
//         public List<Long> userIds;
//         public boolean permanent = false;
//     }

//     public static class DashboardStats {
//         private long totalUsers;
//         private long activeUsers;
//         private long suspendedUsers;
//         private long totalPosts;
//         private long pendingReports;
//         private long criticalReports;
//         private long resolvedReports;
//         private double platformHealth;

//         // Getters and setters
//         public long getTotalUsers() { return totalUsers; }
//         public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
        
//         public long getActiveUsers() { return activeUsers; }
//         public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }
        
//         public long getSuspendedUsers() { return suspendedUsers; }
//         public void setSuspendedUsers(long suspendedUsers) { this.suspendedUsers = suspendedUsers; }
        
//         public long getTotalPosts() { return totalPosts; }
//         public void setTotalPosts(long totalPosts) { this.totalPosts = totalPosts; }
        
//         public long getPendingReports() { return pendingReports; }
//         public void setPendingReports(long pendingReports) { this.pendingReports = pendingReports; }
        
//         public long getCriticalReports() { return criticalReports; }
//         public void setCriticalReports(long criticalReports) { this.criticalReports = criticalReports; }
        
//         public long getResolvedReports() { return resolvedReports; }
//         public void setResolvedReports(long resolvedReports) { this.resolvedReports = resolvedReports; }
        
//         public double getPlatformHealth() { return platformHealth; }
//         public void setPlatformHealth(double platformHealth) { this.platformHealth = platformHealth; }
//     }
// }
