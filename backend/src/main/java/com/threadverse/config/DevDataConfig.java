package com.threadverse.config;

import com.threadverse.model.Award;
import com.threadverse.model.Comment;
import com.threadverse.model.Community;
import com.threadverse.model.Notification;
import com.threadverse.model.PollOption;
import com.threadverse.model.Post;
import com.threadverse.model.User;
import com.threadverse.repository.AwardRepository;
import com.threadverse.repository.CommentRepository;
import com.threadverse.repository.CommunityRepository;
import com.threadverse.repository.NotificationRepository;
import com.threadverse.repository.PollOptionRepository;
import com.threadverse.repository.PostRepository;
import com.threadverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class DevDataConfig {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedDevData(
            UserRepository userRepository,
            CommunityRepository communityRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            AwardRepository awardRepository,
            PollOptionRepository pollOptionRepository,
            NotificationRepository notificationRepository) {
        return args -> {
            if (postRepository.count() > 0) {
                return;
            }

            User admin = userRepository.save(User.builder()
                .username("admin")
                .email("admin@threadverse.local")
                .password(passwordEncoder.encode("password123"))
                .role(User.Role.ADMIN)
                .postKarma(15000)
                .commentKarma(3200)
                .bio("Platform admin for local demo")
                .avatarUrl(null)
                .build());

            User techGuru = userRepository.save(User.builder()
                .username("techguru")
                .email("techguru@threadverse.local")
                .password(passwordEncoder.encode("password123"))
                .postKarma(8400)
                .commentKarma(1200)
                .bio("Technology and infrastructure")
                .build());

            User scienceNerd = userRepository.save(User.builder()
                .username("sciencenerd")
                .email("science@threadverse.local")
                .password(passwordEncoder.encode("password123"))
                .postKarma(22100)
                .commentKarma(4500)
                .bio("Research, biology, and data")
                .build());

            User devMaster = userRepository.save(User.builder()
                .username("devmaster99")
                .email("devmaster@threadverse.local")
                .password(passwordEncoder.encode("password123"))
                .postKarma(5600)
                .commentKarma(890)
                .bio("Full-stack builder")
                .build());

            User founder = userRepository.save(User.builder()
                .username("founder_vibes")
                .email("founder@threadverse.local")
                .password(passwordEncoder.encode("password123"))
                .role(User.Role.MODERATOR)
                .postKarma(31000)
                .commentKarma(7200)
                .bio("SaaS and startup stories")
                .build());

            Community technology = communityRepository.save(Community.builder()
                .name("technology")
                .description("The intersection of technology, innovation and culture.")
                .icon("💻")
                .themeColor("#5865F2")
                .creator(admin)
                .memberCount(14200000)
                .rules(List.of("Be respectful", "No spam", "Accurate titles"))
                .flairs(List.of("Discussion", "News", "Question", "Tutorial", "Project"))
                .build());

            Community science = communityRepository.save(Community.builder()
                .name("science")
                .description("Science, research, and fascinating discoveries.")
                .icon("🔬")
                .themeColor("#2D9CDB")
                .creator(admin)
                .memberCount(28500000)
                .rules(List.of("Peer-reviewed sources", "No pseudoscience"))
                .flairs(List.of("Biology", "Physics", "Chemistry", "Space"))
                .build());

            Community programming = communityRepository.save(Community.builder()
                .name("programming")
                .description("Computer programming discussions.")
                .icon("⌨️")
                .themeColor("#27AE60")
                .creator(admin)
                .memberCount(5800000)
                .rules(List.of("Programming only", "No low-effort spam"))
                .flairs(List.of("Question", "Project", "Article"))
                .build());

            Community worldNews = communityRepository.save(Community.builder()
                .name("worldnews")
                .description("Major news from around the world.")
                .icon("🌍")
                .themeColor("#E74C3C")
                .creator(admin)
                .memberCount(31200000)
                .rules(List.of("Reputable sources only", "No editorializing"))
                .flairs(List.of("Breaking", "Politics", "Economy"))
                .build());

            Community startups = communityRepository.save(Community.builder()
                .name("startups")
                .description("Community for startup founders.")
                .icon("🚀")
                .themeColor("#1ABC9C")
                .creator(founder)
                .memberCount(1200000)
                .rules(List.of("No undisclosed promotion", "Keep advice concrete"))
                .flairs(List.of("Advice", "Story", "Resources"))
                .build());

            techGuru.getJoinedCommunities().addAll(List.of(technology, programming));
            scienceNerd.getJoinedCommunities().add(science);
            devMaster.getJoinedCommunities().addAll(List.of(technology, programming));
            founder.getJoinedCommunities().add(startups);
            userRepository.saveAll(List.of(techGuru, scienceNerd, devMaster, founder));

            Post quantum = postRepository.save(Post.builder()
                .title("The Future of Quantum Computing: What 2025 Means for Encryption")
                .content("Recent breakthroughs in quantum computing have sent shockwaves through the cryptography community. IBM and Google have both announced major milestones that could make current RSA encryption obsolete within a decade.")
                .type(Post.PostType.TEXT)
                .flair("Discussion")
                .author(techGuru)
                .community(technology)
                .voteCount(45821)
                .viewCount(234500L)
                .aiSummary("Quantum computing progress is accelerating pressure on current encryption standards.")
                .aiSentiment("NEUTRAL")
                .toxicityScore(0.02)
                .build());

            Post deepSea = postRepository.save(Post.builder()
                .title("Scientists Discover New Deep-Sea Creature That Produces Its Own Light")
                .content("A research team identified a bioluminescent species in the Pacific Ocean with a previously unknown chemical pathway.")
                .type(Post.PostType.IMAGE)
                .imageUrl("https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80")
                .flair("Biology")
                .author(scienceNerd)
                .community(science)
                .voteCount(89230)
                .viewCount(891000L)
                .aiSentiment("POSITIVE")
                .build());

            Post poll = postRepository.save(Post.builder()
                .title("[POLL] Preferred backend language for 2025?")
                .content("Vote and share your reasoning.")
                .type(Post.PostType.POLL)
                .flair("Question")
                .author(devMaster)
                .community(programming)
                .voteCount(12400)
                .viewCount(45200L)
                .build());

            pollOptionRepository.saveAll(List.of(
                PollOption.builder().post(poll).text("Java / Spring Boot").votes(3240).build(),
                PollOption.builder().post(poll).text("Go").votes(2810).build(),
                PollOption.builder().post(poll).text("Python / FastAPI").votes(4120).build(),
                PollOption.builder().post(poll).text("Node.js / TypeScript").votes(1850).build(),
                PollOption.builder().post(poll).text("Rust").votes(380).build()
            ));

            Post breach = postRepository.save(Post.builder()
                .title("Major breach: 3 billion records exposed in largest data leak of 2025")
                .content("A massive cybersecurity incident has compromised personal data from over 3 billion users across multiple platforms.")
                .type(Post.PostType.TEXT)
                .flair("Breaking")
                .author(admin)
                .community(worldNews)
                .voteCount(132000)
                .viewCount(2100000L)
                .isPinned(true)
                .aiSentiment("NEGATIVE")
                .toxicityScore(0.05)
                .build());

            Post codeReviewer = postRepository.save(Post.builder()
                .title("I built an AI code reviewer that saved my team 40% review time")
                .content("After months of development we are sharing the internal tool and the architecture decisions behind it.")
                .type(Post.PostType.LINK)
                .linkUrl("https://github.com")
                .linkDomain("github.com")
                .flair("Project")
                .author(devMaster)
                .community(programming)
                .voteCount(28900)
                .viewCount(178000L)
                .aiSentiment("POSITIVE")
                .build());

            Post arr = postRepository.save(Post.builder()
                .title("We reached $1M ARR in 14 months with zero marketing budget - AMA!")
                .content("Exactly 14 months ago we launched our B2B SaaS with no budget. Today we crossed $1M ARR and I am answering everything.")
                .type(Post.PostType.TEXT)
                .flair("Story")
                .author(founder)
                .community(startups)
                .voteCount(54200)
                .viewCount(412000L)
                .isPinned(true)
                .aiSummary("A founder shares the tactics and lessons behind hitting $1M ARR without a marketing budget.")
                .aiSentiment("POSITIVE")
                .toxicityScore(0.0)
                .build());

            commentRepository.saveAll(List.of(
                Comment.builder()
                    .content("The migration path for legacy infrastructure is still the hardest part.")
                    .author(devMaster)
                    .post(quantum)
                    .voteCount(1234)
                    .aiSentiment("NEUTRAL")
                    .build(),
                Comment.builder()
                    .content("Financial institutions are already planning for post-quantum rollouts.")
                    .author(scienceNerd)
                    .post(quantum)
                    .voteCount(1876)
                    .aiSentiment("POSITIVE")
                    .build(),
                Comment.builder()
                    .content("Would love to see how the reviewer handles architecture drift, not just syntax.")
                    .author(techGuru)
                    .post(codeReviewer)
                    .voteCount(522)
                    .aiSentiment("NEUTRAL")
                    .build()
            ));

            quantum.setCommentCount((int) commentRepository.countByPost(quantum));
            codeReviewer.setCommentCount((int) commentRepository.countByPost(codeReviewer));
            postRepository.saveAll(List.of(quantum, codeReviewer));

            awardRepository.saveAll(List.of(
                Award.builder().post(quantum).giver(admin).awardType("PLATINUM").build(),
                Award.builder().post(quantum).giver(scienceNerd).awardType("GOLD").build(),
                Award.builder().post(quantum).giver(founder).awardType("GOLD").build(),
                Award.builder().post(arr).giver(admin).awardType("ROCKET").build(),
                Award.builder().post(arr).giver(devMaster).awardType("PLATINUM").build()
            ));

            notificationRepository.save(Notification.builder()
                .recipient(devMaster)
                .type("COMMENT")
                .message("New feedback on your AI code reviewer post")
                .link("/posts/" + codeReviewer.getId())
                .build());
        };
    }
}
