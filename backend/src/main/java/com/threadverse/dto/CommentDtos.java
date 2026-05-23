package com.threadverse.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class CommentDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank
        private String content;

        private Long parentId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Response {
        private Long id;
        private String content;
        private Long authorId;
        private String authorUsername;
        private String authorAvatarUrl;
        private Integer voteCount;
        private String userVote;
        private boolean isDeleted;
        private String aiSentiment;
        private List<Response> replies;
        private LocalDateTime createdAt;
    }
}
