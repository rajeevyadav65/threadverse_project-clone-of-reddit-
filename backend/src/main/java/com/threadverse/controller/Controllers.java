package com.threadverse.controller;

import com.threadverse.dto.AiDtos;
import com.threadverse.dto.AiDtos.ChatRequest;
import com.threadverse.dto.AiDtos.ChatResponse;
import com.threadverse.dto.AiDtos.ContentModerationResponse;
import com.threadverse.dto.AiDtos.SummarizeRequest;
import com.threadverse.dto.AiDtos.SummarizeResponse;
import com.threadverse.dto.AuthDtos.AuthResponse;
import com.threadverse.dto.AuthDtos.LoginRequest;
import com.threadverse.dto.AuthDtos.RegisterRequest;
import com.threadverse.dto.AuthDtos.UserResponse;
import com.threadverse.dto.CommentDtos;
import com.threadverse.dto.CommunityDtos;
import com.threadverse.dto.PostDtos;
import com.threadverse.model.User;
import com.threadverse.repository.UserRepository;
import com.threadverse.service.AiService;
import com.threadverse.service.AuthService;
import com.threadverse.service.CommentService;
import com.threadverse.service.CommunityService;
import com.threadverse.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// ─── Auth Controller ──────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // JWT is stateless; client clears the token
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}

// ─── Post Controller ──────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<Page<?>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "hot") String sort) {
        return ResponseEntity.ok(postService.getFeed(page, size, sort));
    }

    @GetMapping("/trending")
    public ResponseEntity<?> getTrending() {
        return ResponseEntity.ok(postService.getTrending());
    }

    @PostMapping
    public ResponseEntity<PostDtos.Response> createPost(
            @Valid @RequestBody PostDtos.CreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(postService.createPost(req, user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPost(@PathVariable Long id) {
        return postService.getPost(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> vote(
            @PathVariable Long id,
            @RequestParam String type,           // UPVOTE or DOWNVOTE
            @AuthenticationPrincipal UserDetails user) {
        String result = postService.vote(id, user.getUsername(), type);
        return ResponseEntity.ok(Map.of("result", result));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> recordView(@PathVariable Long id) {
        postService.incrementView(id);
        return ResponseEntity.ok().build();
    }
}

// ─── Community Controller ─────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
class CommunityController {

    private final CommunityService communityService;

    @GetMapping
    public ResponseEntity<Page<CommunityDtos.Response>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q,
            @AuthenticationPrincipal UserDetails user) {
        String username = user != null ? user.getUsername() : null;
        Page<CommunityDtos.Response> response = (q != null && !q.isBlank())
            ? communityService.search(q, page, size, username)
            : communityService.getAll(page, size, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<CommunityDtos.Response> getByName(
            @PathVariable String name,
            @AuthenticationPrincipal UserDetails user) {
        String username = user != null ? user.getUsername() : null;
        return ResponseEntity.ok(communityService.getByName(name, username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityDtos.Response> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        String username = user != null ? user.getUsername() : null;
        return ResponseEntity.ok(communityService.getById(id, username));
    }

    @PostMapping
    public ResponseEntity<?> create(
            @Valid @RequestBody CommunityDtos.CreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(communityService.create(req, user.getUsername()));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinOrLeave(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        String result = communityService.joinOrLeave(id, user.getUsername());
        return ResponseEntity.ok(Map.of("result", result));
    }
}

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
class CommentController {

    private final CommentService commentService;

    @GetMapping("/post/{id}")
    public ResponseEntity<?> getByPost(@PathVariable Long id) {
        return ResponseEntity.ok(commentService.getByPost(id));
    }

    @PostMapping("/post/{id}")
    public ResponseEntity<CommentDtos.Response> create(
            @PathVariable Long id,
            @Valid @RequestBody CommentDtos.CreateRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(commentService.create(id, req, user.getUsername()));
    }
}

// ─── AI Controller ────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
class AiController {

    private final AiService aiService;

    /** Summarize arbitrary text (public — no auth needed) */
    @PostMapping("/summarize")
    public ResponseEntity<SummarizeResponse> summarize(@Valid @RequestBody SummarizeRequest req) {
        return ResponseEntity.ok(aiService.summarizePost("", req.getText()));
    }

    /** Moderate content for policy violations */
    @PostMapping("/moderate")
    public ResponseEntity<ContentModerationResponse> moderate(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(aiService.moderateContent(body.get("text")));
    }

    /** AI thread assistant chat */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(aiService.threadAssistant(req));
    }

    /** Analyze comment sentiment */
    @PostMapping("/sentiment")
    public ResponseEntity<Map<String, String>> sentiment(@RequestBody Map<String, String> body) {
        String result = aiService.analyzeCommentSentiment(body.get("text"));
        return ResponseEntity.ok(Map.of("sentiment", result));
    }
}

// ─── User Controller ──────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetails user) {
        User entity = userRepository.findByUsername(user.getUsername()).orElseThrow();
        return ResponseEntity.ok(authService.toUserResponse(entity));
    }
}
