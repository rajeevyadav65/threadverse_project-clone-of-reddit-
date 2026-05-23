package com.threadverse.repository;

import com.threadverse.model.Award;
import com.threadverse.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AwardRepository extends JpaRepository<Award, Long> {
    List<Award> findByPost(Post post);

    @Query("SELECT a.awardType as type, COUNT(a) as count FROM Award a WHERE a.post = :post GROUP BY a.awardType")
    List<Object[]> countByTypeForPost(@Param("post") Post post);
}
