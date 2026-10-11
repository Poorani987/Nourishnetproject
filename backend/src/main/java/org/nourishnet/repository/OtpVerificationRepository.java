package org.nourishnet.repository;

import org.nourishnet.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByDeliveryId(Long deliveryId);
    Optional<OtpVerification> findByDeliveryIdAndRecipientProfileId(Long deliveryId, Long recipientProfileId);
}
