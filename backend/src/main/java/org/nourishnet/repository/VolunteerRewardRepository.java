package org.nourishnet.repository;

import org.nourishnet.entity.VolunteerReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VolunteerRewardRepository extends JpaRepository<VolunteerReward, Long> {
    List<VolunteerReward> findByVolunteerProfileIdOrderByAwardedAtDesc(Long volunteerProfileId);
}
