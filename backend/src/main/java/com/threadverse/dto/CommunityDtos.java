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

public class CommunityDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank
        @Size(min = 3, max = 50)
        private String name;

        @Size(max = 500)
        private String description;

        private String icon;
        private String themeColor;
        private List<String> rules;
        private List<String> flairs;
        private boolean isNsfw;
        private boolean isPrivate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private String icon;
        private String bannerUrl;
        private String themeColor;
        private Integer memberCount;
        private List<String> rules;
        private List<String> flairs;
        private boolean isNsfw;
        private boolean isPrivate;
        private boolean joined;
        private String creatorUsername;
        private LocalDateTime createdAt;
    }
}
