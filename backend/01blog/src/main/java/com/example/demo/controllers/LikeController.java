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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.models.Like;
import com.example.demo.models.Post;
import com.example.demo.models.User;
import com.example.demo.repositories.LikeRepository;
import com.example.demo.repositories.PostRepository;
import com.example.demo.repositories.UserRepository;

@RestController
@RequestMapping("/likes")
public class LikeController {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public LikeController(LikeRepository likeRepository,
            PostRepository postRepository,
            UserRepository userRepository) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    // Like a post
    @PostMapping("/post/{postId}")
    public ResponseEntity<Like> likePost(@PathVariable Long postId,
            @AuthenticationPrincipal User principal) {
        if (principal == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Post> optPost = postRepository.findById(postId);
        if (optPost.isEmpty())
            return ResponseEntity.notFound().build();

        User currentUser = principal;

        // Check if already liked
        Optional<Like> existingLike = likeRepository.findByCreator_IdAndPost_Id(currentUser.getId(), postId);
        if (existingLike.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // Already liked
        }

        Like like = new Like();
        like.setCreator(currentUser);
        like.setPost(optPost.get());
        Like saved = likeRepository.save(like);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Unlike a post
    @DeleteMapping("/post/{postId}")
    public ResponseEntity<Void> unlikePost(@PathVariable Long postId,
            @AuthenticationPrincipal User principal) {
        if (principal == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = principal;

        Optional<Like> existingLike = likeRepository.findByCreator_IdAndPost_Id(currentUser.getId(), postId);
        if (existingLike.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // Not liked
        }

        likeRepository.delete(existingLike.get());
        return ResponseEntity.noContent().build();
    }

    // Get likes for a post
    @GetMapping("/post/{postId}")
    public List<Like> getLikesForPost(@PathVariable Long postId) {
        return likeRepository.findByPost_Id(postId);
    }

    // Get like count for a post
    @GetMapping("/post/{postId}/count")
    public ResponseEntity<Long> getLikeCountForPost(@PathVariable Long postId) {
        long count = likeRepository.countByPost_Id(postId);
        return ResponseEntity.ok(count);
    }

    // Check if current user liked a post
    @GetMapping("/post/{postId}/liked")
    public ResponseEntity<Boolean> hasUserLikedPost(@PathVariable Long postId,
            @AuthenticationPrincipal User principal) {
        if (principal == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        User currentUser = principal;
        boolean liked = likeRepository.findByCreator_IdAndPost_Id(currentUser.getId(), postId).isPresent();
        return ResponseEntity.ok(liked);
    }
}
