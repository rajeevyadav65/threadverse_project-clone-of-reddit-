package com.threadverse.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AiDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummarizeRequest {
        @NotBlank
        private String text;

        @Builder.Default
        private int maxWords = 80;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummarizeResponse {
        private String summary;
        private String sentiment;
        private Double toxicityScore;
        private List<String> keyTopics;
        private String readingTime;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ContentModerationResponse {
        private boolean flagged;
        private String reason;
        private Double score;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatRequest {
        @NotBlank
        private String message;

        private String context;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatResponse {
        private String reply;
        private String model;
        private Integer tokensUsed;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrendingTagsResponse {
        private List<TagStat> tags;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TagStat {
        private String tag;
        private Long count;
        private Double trendScore;
    }
}
