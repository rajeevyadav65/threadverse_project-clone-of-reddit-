package com.threadverse.service;

import com.threadverse.dto.PostDtos;
import com.threadverse.exception.AppException;
import com.threadverse.model.Community;
import com.threadverse.model.Post;
import com.threadverse.model.User;
import com.threadverse.model.Vote;
import com.threadverse.repository.AwardRepository;
import com.threadverse.repository.CommentRepository;
import com.threadverse.repository.CommunityRepository;
import com.threadverse.repository.PollOptionRepository;
import com.threadverse.repository.PostRepository;
import com.threadverse.repository.UserRepository;
import com.threadverse.repository.VoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {

    private final PostRepository postRepo;
    private final CommunityRepository communityRepo;
    private final UserRepository userRepo;
    private final VoteRepository voteRepo;
    private final CommentRepository commentRepo;
    private final AwardRepository awardRepo;
    private final PollOptionRepository pollOptionRepo;
    private final AiService aiService;

    @Transactional
    public PostDtos.Response createPost(PostDtos.CreateRequest req, String username) {
        User author = userRepo.findByUsername(username).orElseThrow();
        Community community = communityRepo.findByName(req.getCommunityName())
            .orElseThrow(() -> new AppException("Community not found", HttpStatus.NOT_FOUND));

        Post post = Post.builder()
            .title(req.getTitle())
            .content(req.getContent())
            .imageUrl(req.getImageUrl())
            .linkUrl(req.getLinkUrl())
            .type(Post.PostType.valueOf(req.getType() != null ? req.getType() : "TEXT"))
            .flair(req.getFlair())
            .author(author)
            .community(community)
            .isNsfw(req.isNsfw())
            .isSpoiler(req.isSpoiler())
            .isOC(req.isOC())
            .build();

        postRepo.save(post);

        if (post.getType() == Post.PostType.POLL && req.getPollOptions() != null) {
            req.getPollOptions().stream()
                .filter(option -> option != null && !option.isBlank())
                .map(option -> com.threadverse.model.PollOption.builder().post(post).text(option.trim()).build())
                .forEach(pollOptionRepo::save);
        }

        if (post.getContent() != null && post.getContent().length() > 50) {
            aiService.summarizeAsync(post.getTitle(), post.getContent())
                .thenAccept(summary -> {
                    post.setAiSummary(summary.getSummary());
                    post.setAiSentiment(summary.getSentiment());
                    post.setToxicityScore(summary.getToxicityScore());
                    postRepo.save(post);
                });
        }

        return toResponse(post, author);
    }

    @Transactional
    public String vote(Long postId, String username, String voteType) {
        User user = userRepo.findByUsername(username).orElseThrow();
        Post post = postRepo.findById(postId)
            .orElseThrow(() -> new AppException("Post not found", HttpStatus.NOT_FOUND));

        Optional<Vote> existing = voteRepo.findByUserAndPost(user, post);
        Vote.VoteType newType = Vote.VoteType.valueOf(voteType.toUpperCase());

        if (existing.isPresent()) {
            Vote vote = existing.get();
            if (vote.getType() == newType) {
                voteRepo.delete(vote);
                post.setVoteCount(post.getVoteCount() + (newType == Vote.VoteType.UPVOTE ? -1 : 1));
                postRepo.save(post);
                return "removed";
            }

            vote.setType(newType);
            voteRepo.save(vote);
            post.setVoteCount(post.getVoteCount() + (newType == Vote.VoteType.UPVOTE ? 2 : -2));
            postRepo.save(post);
            return "changed";
        }

        Vote vote = Vote.builder()
            .user(user)
            .post(post)
            .type(newType)
            .build();
        voteRepo.save(vote);
        post.setVoteCount(post.getVoteCount() + (newType == Vote.VoteType.UPVOTE ? 1 : -1));
        postRepo.save(post);
        return "voted";
    }

    @Transactional(readOnly = true)
    public Page<PostDtos.Response> getFeed(int page, int size, String sort) {
        Sort order = switch (sort) {
            case "top" -> Sort.by(Sort.Direction.DESC, "voteCount");
            case "new" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "voteCount");
        };

        Page<Post> posts = postRepo.findAll(PageRequest.of(page, size, order));
        List<PostDtos.Response> content = posts.getContent().stream()
            .map(post -> toResponse(post, null))
            .toList();

        return new PageImpl<>(content, posts.getPageable(), posts.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<PostDtos.Response> getTrending() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return postRepo.findTrending(since, PageRequest.of(0, 10)).stream()
            .map(post -> toResponse(post, null))
            .toList();
    }

    @Transactional
    public void incrementView(Long postId) {
        postRepo.findById(postId).ifPresent(post -> {
            post.setViewCount(post.getViewCount() + 1);
            postRepo.save(post);
        });
    }

    @Transactional(readOnly = true)
    public Optional<PostDtos.Response> getPost(Long postId) {
        return postRepo.findById(postId).map(post -> toResponse(post, null));
    }

    private PostDtos.Response toResponse(Post post, User currentUser) {
        return PostDtos.Response.builder()
            .id(post.getId())
            .title(post.getTitle())
            .content(post.getContent())
            .imageUrl(post.getImageUrl())
            .linkUrl(post.getLinkUrl())
            .linkDomain(post.getLinkDomain())
            .type(post.getType().name())
            .flair(post.getFlair())
            .authorId(post.getAuthor() != null ? post.getAuthor().getId() : null)
            .authorUsername(post.getAuthor() != null ? post.getAuthor().getUsername() : null)
            .authorAvatarUrl(post.getAuthor() != null ? post.getAuthor().getAvatarUrl() : null)
            .communityName(post.getCommunity() != null ? post.getCommunity().getName() : null)
            .communityIcon(post.getCommunity() != null ? post.getCommunity().getIcon() : null)
            .communityColor(post.getCommunity() != null ? post.getCommunity().getThemeColor() : null)
            .voteCount(post.getVoteCount())
            .commentCount(commentRepo.countByPost(post) > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) commentRepo.countByPost(post))
            .viewCount(post.getViewCount())
            .isPinned(post.isPinned())
            .isNsfw(post.isNsfw())
            .isSpoiler(post.isSpoiler())
            .userVote(resolveUserVote(post, currentUser))
            .saved(false)
            .aiSummary(post.getAiSummary())
            .aiSentiment(post.getAiSentiment())
            .toxicityScore(post.getToxicityScore())
            .awards(awardRepo.countByTypeForPost(post).stream()
                .map(row -> PostDtos.AwardSummary.builder()
                    .type(String.valueOf(row[0]))
                    .icon(awardIcon(String.valueOf(row[0])))
                    .count(((Long) row[1]).intValue())
                    .build())
                .toList())
            .pollOptions(pollOptionRepo.findByPost(post).stream()
                .map(option -> PostDtos.PollOptionDto.builder()
                    .id(option.getId())
                    .text(option.getText())
                    .votes(option.getVotes())
                    .userVoted(false)
                    .build())
                .toList())
            .createdAt(post.getCreatedAt())
            .build();
    }

    private String resolveUserVote(Post post, User currentUser) {
        if (currentUser == null) {
            return null;
        }

        return voteRepo.findByUserAndPost(currentUser, post)
            .map(vote -> vote.getType().name())
            .orElse(null);
    }

    private String awardIcon(String awardType) {
        return switch (awardType) {
            case "SILVER" -> "S";
            case "GOLD" -> "G";
            case "PLATINUM" -> "P";
            case "HELPFUL" -> "H";
            case "WHOLESOME" -> "W";
            case "ROCKET" -> "R";
            default -> "*";
        };
    }
}
