package com.example.demo.controllers;

import com.example.demo.models.Post;
import com.example.demo.models.User;
import com.example.demo.repositories.PostRepository;
import com.example.demo.repositories.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostController(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    // ----------------- CREATE -----------------
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post,
            @AuthenticationPrincipal User currentUser) {
        post.setCreator(currentUser); // Set the logged-in user as creator
        Post saved = postRepository.save(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ----------------- READ -----------------
    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        return postRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<Post> getPostsByUser(@PathVariable Long userId) {
        return postRepository.findByCreator_Id(userId);
    }

    // ----------------- UPDATE -----------------
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id,
            @RequestBody Post postDetails,
            @AuthenticationPrincipal User currentUser) {
        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isEmpty())
            return ResponseEntity.notFound().build();

        Post post = optionalPost.get();

        // Only the creator can update
        if (!post.getCreator().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        post.setContent(postDetails.getContent());
        post.setMediaUrl(postDetails.getMediaUrl());
        post.setMediaType(postDetails.getMediaType());
        post.setUpdatedAt(java.time.LocalDateTime.now());

        Post updated = postRepository.save(post);
        return ResponseEntity.ok(updated);
    }

    // ----------------- DELETE -----------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isEmpty())
            return ResponseEntity.notFound().build();

        Post post = optionalPost.get();

        // Only creator can delete
        if (!post.getCreator().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        postRepository.delete(post);
        return ResponseEntity.noContent().build();
    }
}
