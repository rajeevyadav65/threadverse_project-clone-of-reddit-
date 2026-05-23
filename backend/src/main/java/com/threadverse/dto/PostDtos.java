package com.threadverse.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class PostDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank
        @Size(max = 300)
        private String title;

        private String content;
        private String imageUrl;
        private String linkUrl;

        @NotBlank
        private String communityName;

        private String type;
        private String flair;
        private boolean isNsfw;
        private boolean isSpoiler;
        private boolean isOC;
        private List<String> pollOptions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Response {
        private Long id;
        private String title;
        private String content;
        private String imageUrl;
        private String linkUrl;
        private String linkDomain;
        private String type;
        private String flair;
        private String authorUsername;
        private String authorAvatarUrl;
        private Long authorId;
        private String communityName;
        private String communityIcon;
        private String communityColor;
        private Integer voteCount;
        private Integer commentCount;
        private Long viewCount;
        private boolean isPinned;
        private boolean isNsfw;
        private boolean isSpoiler;
        private String userVote;
        private boolean saved;
        private String aiSummary;
        private String aiSentiment;
        private Double toxicityScore;
        private List<AwardSummary> awards;
        private List<PollOptionDto> pollOptions;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AwardSummary {
        private String type;
        private String icon;
        private Integer count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PollOptionDto {
        private Long id;
        private String text;
        private Integer votes;
        private boolean userVoted;
    }
}
