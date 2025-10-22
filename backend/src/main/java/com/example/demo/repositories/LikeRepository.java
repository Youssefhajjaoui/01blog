package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.models.Like;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    List<Like> findByPost_Id(Long postId);

    List<Like> findByCreator_Id(Long creatorId);

    Optional<Like> findByCreator_IdAndPost_Id(Long creatorId, Long postId);

    void deleteByCreator_IdAndPost_Id(Long creatorId, Long postId);

    long countByPost_Id(Long postId);
}
