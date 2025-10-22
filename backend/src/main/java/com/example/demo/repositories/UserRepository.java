package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.demo.models.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    long countByBannedFalse();
    long countByBannedTrue();
    
    // Search users by username (case insensitive)
    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) AND u.banned = false")
    List<User> searchByUsername(@Param("query") String query);
    
    // Search users by email (case insensitive)
    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) AND u.banned = false")
    List<User> searchByEmail(@Param("query") String query);
}
