package com.threadverse.repository;

import com.threadverse.model.Comment;
import com.threadverse.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostAndParentIsNullOrderByVoteCountDesc(Post post);

    List<Comment> findByPostAndParentIsNull(Post post);

    long countByPost(Post post);
}
