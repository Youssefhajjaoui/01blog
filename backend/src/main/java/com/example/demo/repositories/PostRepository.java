package com.example.demo.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.models.Post;
import com.example.demo.models.User;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Custom query methods (auto-implemented by Spring Data JPA):
    List<Post> findAllByOrderByCreatedAtDesc();

    // Find all posts by a given creator
    List<Post> findByCreator(User creator);

    // Find all posts by creator id (if you only have the id)
    List<Post> findByCreator_Id(Long creatorId);

    // Ownership-scoped fetch by post id and creator id
    Optional<Post> findByIdAndCreator_Id(Long id, Long creatorId);

    // Find posts containing text in content
    List<Post> findByContentContaining(String keyword);

    // (Optional) Order posts by creation date
    List<Post> findByCreatorOrderByCreatedAtDesc(User creator);

    // Count posts created after a specific date
    long countByCreatedAtAfter(LocalDateTime date);
}
