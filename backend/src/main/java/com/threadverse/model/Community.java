package com.threadverse.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "communities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, length = 50)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon;
    private String bannerUrl;
    private String themeColor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    @Builder.Default
    @Column(name = "member_count")
    private Integer memberCount = 0;

    @ElementCollection
    @CollectionTable(name = "community_rules", joinColumns = @JoinColumn(name = "community_id"))
    @Column(name = "rule")
    @Builder.Default
    private List<String> rules = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "community_flairs", joinColumns = @JoinColumn(name = "community_id"))
    @Column(name = "flair")
    @Builder.Default
    private List<String> flairs = new ArrayList<>();

    @Builder.Default
    private boolean isNsfw = false;

    @Builder.Default
    private boolean isPrivate = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Post> posts = new ArrayList<>();
}
