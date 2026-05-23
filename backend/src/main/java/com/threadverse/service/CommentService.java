package com.threadverse.service;

import com.threadverse.dto.CommentDtos;
import com.threadverse.exception.AppException;
import com.threadverse.model.Comment;
import com.threadverse.model.Post;
import com.threadverse.model.User;
import com.threadverse.repository.CommentRepository;
import com.threadverse.repository.PostRepository;
import com.threadverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final AiService aiService;

    @Transactional(readOnly = true)
    public List<CommentDtos.Response> getByPost(Long postId) {
        Post post = postRepo.findById(postId)
            .orElseThrow(() -> new AppException("Post not found", HttpStatus.NOT_FOUND));

        return commentRepo.findByPostAndParentIsNullOrderByVoteCountDesc(post).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public CommentDtos.Response create(Long postId, CommentDtos.CreateRequest req, String username) {
        Post post = postRepo.findById(postId)
            .orElseThrow(() -> new AppException("Post not found", HttpStatus.NOT_FOUND));
        User author = userRepo.findByUsername(username)
            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        Comment parent = req.getParentId() == null ? null : commentRepo.findById(req.getParentId())
            .orElseThrow(() -> new AppException("Parent comment not found", HttpStatus.NOT_FOUND));

        Comment comment = Comment.builder()
            .content(req.getContent())
            .author(author)
            .post(post)
            .parent(parent)
            .aiSentiment(aiService.analyzeCommentSentiment(req.getContent()))
            .build();

        Comment saved = commentRepo.save(comment);
        post.setCommentCount(post.getCommentCount() + 1);
        postRepo.save(post);
        return toResponse(saved);
    }

    private CommentDtos.Response toResponse(Comment comment) {
        return CommentDtos.Response.builder()
            .id(comment.getId())
            .content(comment.getContent())
            .authorId(comment.getAuthor() != null ? comment.getAuthor().getId() : null)
            .authorUsername(comment.getAuthor() != null ? comment.getAuthor().getUsername() : null)
            .authorAvatarUrl(comment.getAuthor() != null ? comment.getAuthor().getAvatarUrl() : null)
            .voteCount(comment.getVoteCount())
            .userVote(null)
            .isDeleted(comment.isDeleted())
            .aiSentiment(comment.getAiSentiment())
            .replies(comment.getReplies().stream().map(this::toResponse).toList())
            .createdAt(comment.getCreatedAt())
            .build();
    }
}
