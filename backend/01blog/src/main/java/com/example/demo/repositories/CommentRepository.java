package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.models.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPost_Id(Long postId);

    List<Comment> findByCreator_Id(Long creatorId);

    Optional<Comment> findByIdAndCreator_Id(Long id, Long creatorId);

    void deleteByIdAndCreator_Id(Long id, Long creatorId);
} 