package org.nourishnet.repository;

import org.nourishnet.entity.DeliveryAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

    Optional<DeliveryAssignment> findByDeliveryId(Long deliveryId);

    List<DeliveryAssignment> findByVolunteerProfileIdOrderByAssignedAtDesc(Long volunteerProfileId);

    @Query("SELECT da FROM DeliveryAssignment da WHERE da.volunteerProfile.id = :volunteerProfileId AND da.delivery.status IN ('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT')")
    List<DeliveryAssignment> findActiveByVolunteerProfileId(@Param("volunteerProfileId") Long volunteerProfileId);

    boolean existsByDeliveryId(Long deliveryId);
}
