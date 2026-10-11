package org.nourishnet.repository;

import org.nourishnet.entity.DonorProfile;
import org.nourishnet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DonorProfileRepository extends JpaRepository<DonorProfile, Long> {
    Optional<DonorProfile> findByUser(User user);
    Optional<DonorProfile> findByUserId(Long userId);
}
