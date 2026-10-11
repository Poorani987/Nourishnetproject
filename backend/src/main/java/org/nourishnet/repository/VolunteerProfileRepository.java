package org.nourishnet.repository;

import org.nourishnet.entity.User;
import org.nourishnet.entity.VolunteerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerProfileRepository extends JpaRepository<VolunteerProfile, Long> {
    Optional<VolunteerProfile> findByUser(User user);
    Optional<VolunteerProfile> findByUserId(Long userId);
    List<VolunteerProfile> findByIsAvailableTrue();
}
