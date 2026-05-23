package com.threadverse.repository;

import com.threadverse.model.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findByName(String name);

    boolean existsByName(String name);

    Page<Community> findAllByOrderByMemberCountDesc(Pageable pageable);

    @Query("SELECT c FROM Community c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Community> search(@Param("q") String query, Pageable pageable);
}
