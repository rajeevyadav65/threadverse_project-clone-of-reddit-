package com.threadverse.repository;

import com.threadverse.model.Community;
import com.threadverse.model.Post;
import com.threadverse.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByCommunity(Community community, Pageable pageable);

    Page<Post> findByAuthor(User author, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Post> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.community = :community ORDER BY p.voteCount DESC")
    Page<Post> findTopByCommunity(@Param("community") Community community, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.createdAt >= :since ORDER BY p.voteCount DESC")
    List<Post> findTrending(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.aiSummary IS NULL AND p.type = 'TEXT' AND LENGTH(p.content) > 200")
    List<Post> findPostsNeedingAiSummary(Pageable pageable);
}
