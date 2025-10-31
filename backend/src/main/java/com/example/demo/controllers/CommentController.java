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

import com.example.demo.dtos.CommentDto;
import com.example.demo.dtos.Userdto;
import com.example.demo.dtos.UpdateCommentRequest;
import com.example.demo.models.Comment;
import com.example.demo.models.Post;
import com.example.demo.models.User;
import com.example.demo.models.UserRole;
import com.example.demo.repositories.CommentRepository;
import com.example.demo.repositories.PostRepository;
import com.example.demo.repositories.UserRepository;

@RestController
@RequestMapping("/api/comments")
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
    public ResponseEntity<CommentDto> createComment(@PathVariable Long postId,
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

        // Convert to DTO
        CommentDto commentDto = convertToDTO(saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(commentDto);
    }

    // List comments for a post
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDto>> getCommentsForPost(@PathVariable Long postId) {
        List<Comment> comments = commentRepository.findByPost_Id(postId);

        List<CommentDto> commentDtos = comments.stream()
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(commentDtos);
    }

    // Update own comment
    @PutMapping("/{id}")
    public ResponseEntity<CommentDto> updateComment(@PathVariable Long id,
            @RequestBody UpdateCommentRequest updateRequest,
            @AuthenticationPrincipal User principal) {
        if (principal == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User currentUser = principal;

        Optional<Comment> optComment = commentRepository.findByIdAndCreator_Id(id, currentUser.getId());
        if (optComment.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        Comment comment = optComment.get();
        comment.setContent(updateRequest.getContent());
        Comment saved = commentRepository.save(comment);

        // Convert to DTO
        CommentDto commentDto = convertToDTO(saved);

        System.out.println("CommentController: Returning CommentDto: " + commentDto);
        System.out.println("CommentController: CommentDto ID: " + commentDto.getId());
        System.out.println("CommentController: CommentDto Content: " + commentDto.getContent());

        return ResponseEntity.ok(commentDto);
    }

    // Delete own comment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id,
            @AuthenticationPrincipal User principal) {
        if (principal == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User currentUser = principal;

        Optional<Comment> optComment = commentRepository.findById(id);

        if (optComment.isEmpty() || (!optComment.get().getCreator().equals(currentUser)
                && !currentUser.getRole().equals(UserRole.ADMIN)))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        commentRepository.delete(optComment.get());
        return ResponseEntity.noContent().build();
    }

    // Helper method to convert Comment entity to CommentDto
    private CommentDto convertToDTO(Comment comment) {
        Userdto authorDto = new Userdto();
        authorDto.setId(comment.getCreator().getId());
        authorDto.setUsername(comment.getCreator().getUsername());
        authorDto.setAvatar(comment.getCreator().getImage());

        return new CommentDto(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                authorDto);
    }
}