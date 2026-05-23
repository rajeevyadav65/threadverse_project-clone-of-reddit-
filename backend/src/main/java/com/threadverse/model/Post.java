package com.threadverse.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts", indexes = {
    @Index(columnList = "community_id"),
    @Index(columnList = "author_id"),
    @Index(columnList = "createdAt")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String imageUrl;
    private String linkUrl;
    private String linkDomain;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PostType type = PostType.TEXT;

    private String flair;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @Builder.Default
    private Integer voteCount = 0;

    @Builder.Default
    private Integer commentCount = 0;

    @Builder.Default
    private Long viewCount = 0L;

    @Builder.Default
    private boolean isPinned = false;

    @Builder.Default
    private boolean isNsfw = false;

    @Builder.Default
    private boolean isSpoiler = false;

    @Builder.Default
    private boolean isOC = false;

    // ── AI-generated fields ───────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Column(columnDefinition = "TEXT")
    private String aiSentiment;      // POSITIVE / NEUTRAL / NEGATIVE

    @Builder.Default
    private Double toxicityScore = 0.0;

    @Builder.Default
    private boolean aiModerated = false;

    // ─────────────────────────────────────────────────────────
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Vote> votes = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Award> awards = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PollOption> pollOptions = new ArrayList<>();

    public enum PostType { TEXT, IMAGE, LINK, POLL }
}
