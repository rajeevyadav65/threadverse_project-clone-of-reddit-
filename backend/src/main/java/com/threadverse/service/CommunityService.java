package com.threadverse.service;

import com.threadverse.dto.CommunityDtos;
import com.threadverse.dto.CommunityDtos.Response;
import com.threadverse.exception.AppException;
import com.threadverse.model.Community;
import com.threadverse.model.User;
import com.threadverse.repository.CommunityRepository;
import com.threadverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepo;
    private final UserRepository userRepo;

    @Transactional
    public Community create(CommunityDtos.CreateRequest req, String username) {
        if (communityRepo.existsByName(req.getName())) {
            throw new AppException("Community name taken", HttpStatus.CONFLICT);
        }

        User creator = userRepo.findByUsername(username).orElseThrow();
        Community community = Community.builder()
            .name(req.getName())
            .description(req.getDescription())
            .icon(req.getIcon())
            .themeColor(req.getThemeColor())
            .creator(creator)
            .rules(req.getRules() != null ? req.getRules() : List.of())
            .flairs(req.getFlairs() != null ? req.getFlairs() : List.of())
            .isNsfw(req.isNsfw())
            .isPrivate(req.isPrivate())
            .build();

        return communityRepo.save(community);
    }

    @Transactional
    public String joinOrLeave(Long communityId, String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        Community community = communityRepo.findById(communityId)
            .orElseThrow(() -> new AppException("Community not found", HttpStatus.NOT_FOUND));

        if (user.getJoinedCommunities().contains(community)) {
            user.getJoinedCommunities().remove(community);
            community.setMemberCount(Math.max(community.getMemberCount() - 1, 0));
            userRepo.save(user);
            communityRepo.save(community);
            return "left";
        }

        user.getJoinedCommunities().add(community);
        community.setMemberCount(community.getMemberCount() + 1);
        userRepo.save(user);
        communityRepo.save(community);
        return "joined";
    }

    @Transactional(readOnly = true)
    public Page<Response> getAll(int page, int size, String username) {
        return communityRepo.findAllByOrderByMemberCountDesc(PageRequest.of(page, size))
            .map(community -> toResponse(community, username));
    }

    @Transactional(readOnly = true)
    public Page<Response> search(String query, int page, int size, String username) {
        return communityRepo.search(query, PageRequest.of(page, size))
            .map(community -> toResponse(community, username));
    }

    @Transactional(readOnly = true)
    public Response getById(Long communityId, String username) {
        Community community = communityRepo.findById(communityId)
            .orElseThrow(() -> new AppException("Community not found", HttpStatus.NOT_FOUND));
        return toResponse(community, username);
    }

    @Transactional(readOnly = true)
    public Response getByName(String name, String username) {
        Community community = communityRepo.findByName(name)
            .orElseThrow(() -> new AppException("Community not found", HttpStatus.NOT_FOUND));
        return toResponse(community, username);
    }

    private Response toResponse(Community community, String username) {
        User user = username != null ? userRepo.findByUsername(username).orElse(null) : null;
        boolean joined = user != null && user.getJoinedCommunities().stream()
            .anyMatch(joinedCommunity -> joinedCommunity.getId().equals(community.getId()));

        return Response.builder()
            .id(community.getId())
            .name(community.getName())
            .description(community.getDescription())
            .icon(community.getIcon())
            .bannerUrl(community.getBannerUrl())
            .themeColor(community.getThemeColor())
            .memberCount(community.getMemberCount())
            .rules(community.getRules())
            .flairs(community.getFlairs())
            .isNsfw(community.isNsfw())
            .isPrivate(community.isPrivate())
            .joined(joined)
            .creatorUsername(community.getCreator() != null ? community.getCreator().getUsername() : null)
            .createdAt(community.getCreatedAt())
            .build();
    }
}
