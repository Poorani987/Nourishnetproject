package org.nourishnet.repository;

import org.nourishnet.entity.Delivery;
import org.nourishnet.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByAllocationId(Long allocationId);

    List<Delivery> findByStatus(DeliveryStatus status);

    @Query("SELECT d FROM Delivery d WHERE d.status = 'PENDING' AND d.deliveryDeadline > :now ORDER BY d.deliveryDeadline ASC")
    List<FoodDeliveryAvailableProjection> findAvailableForVolunteers(@Param("now") LocalDateTime now);

    @Query("SELECT d FROM Delivery d WHERE d.allocation.recipientProfile.id = :recipientId ORDER BY d.createdAt DESC")
    List<Delivery> findByRecipientProfileId(@Param("recipientId") Long recipientId);

    @Query("SELECT d FROM Delivery d WHERE d.allocation.donation.donorProfile.id = :donorId ORDER BY d.createdAt DESC")
    List<Delivery> findByDonorProfileId(@Param("donorId") Long donorId);

    long countByStatus(DeliveryStatus status);

    // Interface projection for clean queries
    interface FoodDeliveryAvailableProjection {
        Long getId();
        DeliveryStatus getStatus();
    }
}
