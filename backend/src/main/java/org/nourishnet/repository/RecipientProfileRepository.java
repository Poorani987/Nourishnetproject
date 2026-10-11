package org.nourishnet.repository;

import org.nourishnet.entity.RecipientProfile;
import org.nourishnet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecipientProfileRepository extends JpaRepository<RecipientProfile, Long> {
    Optional<RecipientProfile> findByUser(User user);
    Optional<RecipientProfile> findByUserId(Long userId);
}
