package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.models.Post;
import com.example.demo.models.Report;
import com.example.demo.models.User;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    // Find all Reports by Order
    List<Report> findAllByOrderByCreatedAtAsc();

    // find Reports by users
    List<Report> findByCreator(User creater);
    
    // Find reports by reporter
    List<Report> findByReporter(User reporter);
}
