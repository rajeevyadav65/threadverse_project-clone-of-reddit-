package com.threadverse.repository;

import com.threadverse.model.Post;
import com.threadverse.model.User;
import com.threadverse.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    Optional<Vote> findByUserAndPost(User user, Post post);

    void deleteByUserAndPost(User user, Post post);
}
