package com.example.demo.controllers;

import java.util.List;
import java.util.Optional;

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
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.Post;
import com.example.demo.models.Report;
import com.example.demo.models.ReportStatus;
import com.example.demo.models.User;
import com.example.demo.models.UserRole;
import com.example.demo.repositories.PostRepository;
import com.example.demo.repositories.ReportRepository;
import com.example.demo.repositories.UserRepository;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public ReportController(ReportRepository reportRepository, PostRepository postRepository,
            UserRepository userRepository) {
        this.postRepository = postRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody Report report,
            @AuthenticationPrincipal User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User currentUser = principal;

        // Validate that the report has a reason
        if (report.getReason() == null || report.getReason().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Validate that either a user or post is being reported (but not both)
        if ((report.getReportedUser() == null && report.getReportedPost() == null) ||
                (report.getReportedUser() != null && report.getReportedPost() != null)) {
            return ResponseEntity.badRequest().build();
        }

        // If reporting a post, validate that the post exists
        if (report.getReportedPost() != null) {
            Optional<Post> optionalPost = postRepository.findById(report.getReportedPost().getId());
            if (optionalPost.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            report.setReportedPost(optionalPost.get());
        }

        // If reporting a user, validate that the user exists
        if (report.getReportedUser() != null) {
            Optional<User> optionalReportedUser = userRepository.findById(report.getReportedUser().getId());
            if (optionalReportedUser.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            report.setReportedUser(optionalReportedUser.get());
        }

        // Set the reporter to the current user
        report.setReporter(currentUser);

        // Save the report
        Report savedReport = reportRepository.save(report);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedReport);
    }

    @GetMapping
    public ResponseEntity<List<Report>> getAllReports(@AuthenticationPrincipal User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Optional<User> optionUser = userRepository.findByUsername(principal.getUsername());
        if (optionUser.isEmpty() || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<Report> result = reportRepository.findAll();
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Report> updateReport(@PathVariable Long id,
            @RequestBody ReportStatus status,
            @AuthenticationPrincipal User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User optionUser = principal;
        if (optionUser == null || principal.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Report> optionalReport = reportRepository.findById(id);
        if (optionalReport.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Report report = optionalReport.get();
        report.setStatus(status);
        Report updatedReport = reportRepository.save(report);

        return ResponseEntity.ok(updatedReport);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReport(@PathVariable Long id,
            @AuthenticationPrincipal User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User currentUser = principal;
        Optional<Report> optionalReport = reportRepository.findById(id);

        if (optionalReport.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Report report = optionalReport.get();

        // Check if user is the reporter or an admin
        if (!report.getReporter().getId().equals(currentUser.getId()) &&
                currentUser.getRole() != UserRole.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        reportRepository.delete(report);
        return ResponseEntity.ok("Report deleted successfully");
    }

    @GetMapping("/my-reports")
    public ResponseEntity<List<Report>> getMyReports(@AuthenticationPrincipal User principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User currentUser = principal;
        List<Report> myReports = reportRepository.findByReporter(currentUser);

        return ResponseEntity.ok(myReports);
    }
}
