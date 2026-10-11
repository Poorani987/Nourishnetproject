package org.nourishnet.repository;

import org.nourishnet.entity.AllocationStatus;
import org.nourishnet.entity.FoodAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FoodAllocationRepository extends JpaRepository<FoodAllocation, Long> {

    List<FoodAllocation> findByRecipientProfileIdOrderByCreatedAtDesc(Long recipientProfileId);

    List<FoodAllocation> findByDonationIdOrderByCreatedAtDesc(Long donationId);

    @Query("SELECT fa FROM FoodAllocation fa WHERE fa.donation.donorProfile.id = :donorId ORDER BY fa.createdAt DESC")
    List<FoodAllocation> findByDonorProfileId(@Param("donorId") Long donorId);

    @Query("SELECT COALESCE(SUM(fa.allocatedQuantity), 0) FROM FoodAllocation fa WHERE fa.status = 'DELIVERED'")
    BigDecimal sumDeliveredQuantity();

    long countByStatus(AllocationStatus status);
}
