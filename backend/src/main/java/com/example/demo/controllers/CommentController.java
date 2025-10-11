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

import com.example.demo.models.Comment;
import com.example.demo.models.Post;
import com.example.demo.models.User;
import com.example.demo.repositories.CommentRepository;
import com.example.demo.repositories.PostRepository;
import com.example.demo.repositories.UserRepository;

@RestController
@RequestMapping("/comments")
public class CommentController {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentController(CommentRepository commentRepository,
            PostRepository postRepository,
            UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    // Create comment on a post
    @PostMapping("/post/{postId}")
    public ResponseEntity<Comment> createComment(@PathVariable Long postId,
            @RequestBody Comment comment,
            @AuthenticationPrincipal User principal) {
        if (principal == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Optional<Post> optPost = postRepository.findById(postId);
        if (optPost.isEmpty())
            return ResponseEntity.notFound().build();

        comment.setCreator(principal);
        comment.setPost(optPost.get());
        Comment saved = commentRepository.save(comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // List comments for a post
    @GetMapping("/post/{postId}")
    public List<Comment> getCommentsForPost(@PathVariable Long postId) {
        return commentRepository.findByPost_Id(postId);
    }

    // Update own comment
    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id,
            @RequestBody Comment details,
            @AuthenticationPrincipal User principal) {
        if (principal == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User currentUser = principal;

        Optional<Comment> optComment = commentRepository.findByIdAndCreator_Id(id, currentUser.getId());
        if (optComment.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        Comment comment = optComment.get();
        comment.setContent(details.getContent());
        Comment saved = commentRepository.save(comment);
        return ResponseEntity.ok(saved);
    }

    // Delete own comment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id,
            @AuthenticationPrincipal User principal) {
        if (principal == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User currentUser = principal;

        Optional<Comment> optComment = commentRepository.findByIdAndCreator_Id(id, currentUser.getId());
        if (optComment.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        commentRepository.delete(optComment.get());
        return ResponseEntity.noContent().build();
    }
}