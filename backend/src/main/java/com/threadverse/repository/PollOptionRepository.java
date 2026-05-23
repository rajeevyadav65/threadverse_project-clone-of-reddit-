package com.threadverse.repository;

import com.threadverse.model.PollOption;
import com.threadverse.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PollOptionRepository extends JpaRepository<PollOption, Long> {
    List<PollOption> findByPost(Post post);
}
