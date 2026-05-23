package com.threadverse.service;

import com.threadverse.dto.AiDtos.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
@Slf4j
public class AiService {

    private static final Pattern WORD_PATTERN = Pattern.compile("[A-Za-z][A-Za-z0-9'-]*");
    private static final Pattern SENTENCE_SPLIT_PATTERN = Pattern.compile("(?<=[.!?])\\s+");
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from", "has", "have", "how",
            "i", "if", "in", "into", "is", "it", "its", "me", "my", "not", "of", "on", "or", "our", "so",
            "that", "the", "their", "them", "there", "these", "they", "this", "to", "was", "we", "what",
            "when", "where", "which", "who", "why", "will", "with", "you", "your"
    );
    private static final Set<String> POSITIVE_WORDS = Set.of(
            "amazing", "awesome", "benefit", "best", "clear", "excellent", "good", "great", "helpful",
            "improve", "impressive", "interesting", "love", "positive", "smart", "solid", "strong", "useful"
    );
    private static final Set<String> NEGATIVE_WORDS = Set.of(
            "angry", "awful", "bad", "broken", "confusing", "concern", "critical", "fail", "failing",
            "hate", "issue", "negative", "poor", "problem", "risk", "slow", "terrible", "worse", "worst"
    );
    private static final Set<String> TOXIC_WORDS = Set.of(
            "hate", "idiot", "kill", "loser", "moron", "scam", "stupid", "trash"
    );

    private final ChatClient chatClient;

    @Value("${spring.ai.openai.chat.options.model:gpt-4o-mini}")
    private String model;

    @Value("${spring.ai.openai.chat.options.max-tokens:512}")
    private Integer maxTokens;

    public AiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public SummarizeResponse summarizePost(String title, String content) {
        String prompt = String.format("Analyze the following Reddit-style post and respond in JSON with these keys:\n" +
                "- summary (string, max 80 words, neutral tone)\n" +
                "- sentiment (string: POSITIVE | NEUTRAL | NEGATIVE)\n" +
                "- toxicityScore (number 0.0–1.0)\n" +
                "- keyTopics (array of 3-5 strings)\n" +
                "- readingTime (string like \"2 min read\")\n\n" +
                "Title: %s\n" +
                "Content: %s\n\n" +
                "Respond ONLY with valid JSON, no markdown.", title, (content != null ? content : ""));

        try {
            String raw = chat(prompt, "You are a content analysis assistant.");
            return parseJson(raw, SummarizeResponse.class);
        } catch (Exception e) {
            log.warn("AI summary failed: {}", e.getMessage());
            return buildLocalSummary(title, content);
        }
    }

    public ContentModerationResponse moderateContent(String text) {
        String prompt = String.format("Review the following user-generated content for policy violations\n" +
                "(hate speech, harassment, spam, explicit content, misinformation).\n" +
                "Respond in JSON with:\n" +
                "- flagged (boolean)\n" +
                "- reason (string or null)\n" +
                "- score (number 0.0–1.0, where 1.0 = definitely violates)\n\n" +
                "Content: %s\n\n" +
                "Respond ONLY with valid JSON.", text);

        try {
            String raw = chat(prompt, "You are a content moderation assistant.");
            return parseJson(raw, ContentModerationResponse.class);
        } catch (Exception e) {
            log.warn("AI moderation failed: {}", e.getMessage());
            return buildLocalModeration(text);
        }
    }

    public String analyzeCommentSentiment(String comment) {
        String prompt = String.format("Classify the sentiment of this comment as one word: POSITIVE, NEUTRAL, or NEGATIVE.\n" +
                "Comment: %s\n" +
                "Reply with only the word.", comment);
        try {
            return chat(prompt, "You are a sentiment classifier.").trim().toUpperCase();
        } catch (Exception e) {
            return detectSentiment(comment);
        }
    }

    public ChatResponse threadAssistant(ChatRequest request) {
        String systemPrompt = String.format("You are ThreadVerse AI, a helpful assistant embedded in a Reddit-style\n" +
                "social platform. You help users understand posts, write better comments,\n" +
                "and find relevant communities. Be concise, friendly, and informative.\n" +
                "%s", request.getContext() != null ? "Thread context: " + request.getContext() : "");

        try {
            org.springframework.ai.chat.model.ChatResponse aiResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(request.getMessage())
                    .options(OpenAiChatOptions.builder()
                            .withModel(model)
                            .withMaxTokens(maxTokens)
                            .withTemperature(0.5f)
                            .build())
                    .call()
                    .chatResponse();

            String reply = aiResponse.getResult().getOutput().getContent();
            int tokens = (aiResponse.getMetadata() != null && aiResponse.getMetadata().getUsage() != null)
                    ? aiResponse.getMetadata().getUsage().getTotalTokens().intValue()
                    : 0;

            return ChatResponse.builder().reply(reply).model(model).tokensUsed(tokens).build();
        } catch (Exception e) {
            log.error("AI chat failed: {}", e.getMessage());
            return ChatResponse.builder()
                    .reply(buildLocalAssistantReply(request))
                    .model("local-fallback")
                    .tokensUsed(0)
                    .build();
        }
    }

    public String generateCommunityDescription(String communityName, List<String> topics) {
        String prompt = String.format("Write a one-sentence community description (max 100 chars) for a Reddit-style\n" +
                "community named r/%s focused on: %s.\n" +
                "Respond with ONLY the description text.", communityName, String.join(", ", topics));
        try {
            return chat(prompt, "You are a creative copywriter.").trim();
        } catch (Exception e) {
            return buildLocalCommunityDescription(communityName, topics);
        }
    }

    @Async
    public CompletableFuture<SummarizeResponse> summarizeAsync(String title, String content) {
        return CompletableFuture.completedFuture(summarizePost(title, content));
    }

    @Async
    public CompletableFuture<ContentModerationResponse> moderateAsync(String text) {
        return CompletableFuture.completedFuture(moderateContent(text));
    }

    private String chat(String userMessage, String systemMessage) {
        return chatClient.prompt()
                .system(systemMessage)
                .user(userMessage)
                .options(OpenAiChatOptions.builder()
                        .withModel(model)
                        .withMaxTokens(maxTokens)
                        .withTemperature(0.3f)
                        .build())
                .call()
                .content();
    }

    private <T> T parseJson(String json, Class<T> type) {
        try {
            String clean = json.replace("```json", "")
                    .replace("```", "")
                    .trim();
            return new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(clean, type);
        } catch (Exception e) {
            log.warn("JSON parse error: {}", e.getMessage());
            throw new RuntimeException("Failed to parse AI response");
        }
    }

    private SummarizeResponse buildLocalSummary(String title, String content) {
        String combined = normalizeText(Stream.of(title, content)
                .filter(part -> part != null && !part.isBlank())
                .reduce((left, right) -> left + ". " + right)
                .orElse(""));
        int wordCount = countWords(combined);
        return SummarizeResponse.builder()
                .summary(buildSummaryText(combined, 80))
                .sentiment(detectSentiment(combined))
                .toxicityScore(estimateToxicity(combined))
                .keyTopics(extractTopics(combined, 5))
                .readingTime(Math.max(1, (int) Math.ceil(wordCount / 200.0)) + " min read")
                .build();
    }

    private ContentModerationResponse buildLocalModeration(String text) {
        String normalized = normalizeText(text).toLowerCase(Locale.ROOT);
        double toxicityScore = estimateToxicity(normalized);
        boolean spam = containsAny(normalized, "buy now", "click here", "free money", "guaranteed", "telegram", "whatsapp");
        boolean flagged = toxicityScore >= 0.34 || spam;
        String reason = null;

        if (spam) {
            reason = "Potential spam or promotional language.";
            toxicityScore = Math.max(toxicityScore, 0.65);
        } else if (toxicityScore >= 0.34) {
            reason = "Potential abusive or hostile language.";
        }

        return ContentModerationResponse.builder()
                .flagged(flagged)
                .reason(reason)
                .score(roundScore(toxicityScore))
                .build();
    }

    private String buildLocalAssistantReply(ChatRequest request) {
        String message = normalizeText(request.getMessage());
        String context = normalizeText(request.getContext());
        String lower = message.toLowerCase(Locale.ROOT);

        if (containsAny(lower, "summarize", "summary", "summrize", "tl;dr")) {
            if (!context.isBlank()) {
                return "Quick summary: " + buildSummaryText(context, 60);
            }
            if (countWords(message) > 12) {
                return "Quick summary: " + buildSummaryText(message, 50);
            }
            return "Paste the post title or body here and I will summarize it. On a post page, the AI Summary section under the post can also generate a quick summary.";
        }

        if (containsAny(lower, "comment", "reply", "respond")) {
            String focus = !context.isBlank() ? buildSummaryText(context, 28) : buildSummaryText(message, 28);
            return "You could reply with: \"Interesting point. The main takeaway seems to be " +
                    trimTrailingPeriod(focus).toLowerCase(Locale.ROOT) +
                    ". I would want to see a bit more detail on the tradeoffs before drawing a final conclusion.\"";
        }

        if (containsAny(lower, "community", "communities", "subreddit", "where should i post", "suggest")) {
            return buildCommunitySuggestions(message + " " + context);
        }

        if (containsAny(lower, "title", "headline")) {
            String source = !context.isBlank() ? context : message;
            List<String> topics = extractTopics(source, 3);
            if (!topics.isEmpty()) {
                return "Possible title: " + String.join(" / ", topics) + " - " + buildSummaryText(source, 14);
            }
            return "Paste the post body here and I will turn it into a tighter title.";
        }

        if (!context.isBlank()) {
            return "Quick take: " + buildSummaryText(context, 55);
        }

        return "I can still help locally. Paste a post title or body for a summary, ask for a comment draft, or describe the topic and I will suggest a community.";
    }

    private String buildCommunitySuggestions(String source) {
        String lower = normalizeText(source).toLowerCase(Locale.ROOT);
        List<String> suggestions = new ArrayList<>();

        if (containsAny(lower, "code", "programming", "backend", "frontend", "java", "react", "api", "bug", "typescript")) {
            suggestions.add("r/programming");
        }
        if (containsAny(lower, "ai", "technology", "software", "startup tech", "hardware", "product")) {
            suggestions.add("r/technology");
        }
        if (containsAny(lower, "science", "research", "biology", "physics", "chemistry", "study")) {
            suggestions.add("r/science");
        }
        if (containsAny(lower, "startup", "founder", "saas", "arr", "growth", "business")) {
            suggestions.add("r/startups");
        }
        if (containsAny(lower, "news", "politics", "economy", "world")) {
            suggestions.add("r/worldnews");
        }

        if (suggestions.isEmpty()) {
            suggestions.add("r/technology");
            suggestions.add("r/programming");
        }

        return "Best fit communities: " + String.join(", ", suggestions) +
                ". Share the post topic or draft and I can narrow that down further.";
    }

    private String buildLocalCommunityDescription(String communityName, List<String> topics) {
        if (topics == null || topics.isEmpty()) {
            return "A community for " + communityName + " discussions.";
        }
        return "A community for " + String.join(", ", topics) + " discussions.";
    }

    private String buildSummaryText(String text, int maxWords) {
        String normalized = normalizeText(text);
        if (normalized.isBlank()) {
            return "No content available to summarize.";
        }

        String[] sentences = SENTENCE_SPLIT_PATTERN.split(normalized);
        StringBuilder builder = new StringBuilder();
        int usedWords = 0;

        for (String sentence : sentences) {
            String cleanSentence = normalizeText(sentence);
            if (cleanSentence.isBlank()) {
                continue;
            }

            int sentenceWords = countWords(cleanSentence);
            if (usedWords > 0 && usedWords + sentenceWords > maxWords) {
                break;
            }

            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(cleanSentence);
            usedWords += sentenceWords;
        }

        String summary = builder.length() > 0 ? builder.toString() : truncateWords(normalized, maxWords);
        if (!summary.endsWith(".") && !summary.endsWith("!") && !summary.endsWith("?")) {
            summary = summary + ".";
        }
        return summary;
    }

    private String truncateWords(String text, int maxWords) {
        List<String> words = extractWords(text);
        if (words.isEmpty()) {
            return "No content available to summarize.";
        }

        int limit = Math.min(maxWords, words.size());
        return String.join(" ", words.subList(0, limit));
    }

    private List<String> extractTopics(String text, int limit) {
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (String word : extractWords(text)) {
            String normalized = word.toLowerCase(Locale.ROOT);
            if (normalized.length() < 4 || STOP_WORDS.contains(normalized)) {
                continue;
            }
            counts.merge(normalized, 1, Integer::sum);
        }

        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue(Comparator.reverseOrder())
                        .thenComparing(Map.Entry::getKey))
                .limit(limit)
                .map(entry -> capitalize(entry.getKey()))
                .toList();
    }

    private String detectSentiment(String text) {
        int positive = 0;
        int negative = 0;

        for (String word : extractWords(text)) {
            String normalized = word.toLowerCase(Locale.ROOT);
            if (POSITIVE_WORDS.contains(normalized)) {
                positive++;
            }
            if (NEGATIVE_WORDS.contains(normalized)) {
                negative++;
            }
        }

        if (positive >= negative + 2) {
            return "POSITIVE";
        }
        if (negative >= positive + 2) {
            return "NEGATIVE";
        }
        return "NEUTRAL";
    }

    private double estimateToxicity(String text) {
        List<String> words = extractWords(text);
        if (words.isEmpty()) {
            return 0.0;
        }

        long toxicHits = words.stream()
                .map(word -> word.toLowerCase(Locale.ROOT))
                .filter(TOXIC_WORDS::contains)
                .count();

        if (toxicHits == 0) {
            return 0.0;
        }

        return roundScore(Math.min(1.0, toxicHits / Math.max(3.0, words.size() / 8.0)));
    }

    private List<String> extractWords(String text) {
        List<String> words = new ArrayList<>();
        Matcher matcher = WORD_PATTERN.matcher(normalizeText(text));
        while (matcher.find()) {
            words.add(matcher.group());
        }
        return words;
    }

    private int countWords(String text) {
        return extractWords(text).size();
    }

    private String normalizeText(String text) {
        return text == null ? "" : text.replaceAll("\\s+", " ").trim();
    }

    private boolean containsAny(String text, String... terms) {
        for (String term : terms) {
            if (text.contains(term)) {
                return true;
            }
        }
        return false;
    }

    private double roundScore(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1);
    }

    private String trimTrailingPeriod(String value) {
        if (value == null) {
            return "";
        }
        return value.endsWith(".") ? value.substring(0, value.length() - 1) : value;
    }
}
