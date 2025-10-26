package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.models.Post;
import com.example.demo.models.Report;
import com.example.demo.models.ReportStatus;
import com.example.demo.models.User;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    // Find all Reports by Order
    List<Report> findAllByOrderByCreatedAtAsc();

    // find Reports by users
    List<Report> findByReporter(User reporter);
    
    // find Reports by reported user
    List<Report> findByReportedUser(User reportedUser);
    
    // find Reports by reported post
    List<Report> findByReportedPost(Post reportedPost);
    
    // Count reports by status
    long countByStatus(ReportStatus status);
}
