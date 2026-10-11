package org.nourishnet.repository;

import org.nourishnet.entity.DonationStatus;
import org.nourishnet.entity.FoodDonation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FoodDonationRepository extends JpaRepository<FoodDonation, Long> {

    List<FoodDonation> findByDonorProfileIdOrderByCreatedAtDesc(Long donorProfileId);

    @Query("SELECT fd FROM FoodDonation fd WHERE fd.status IN ('AVAILABLE', 'PARTIALLY_ALLOCATED') " +
           "AND fd.consumeBefore > :now AND fd.remainingQuantity > 0 " +
           "ORDER BY fd.consumeBefore ASC")
    List<FoodDonation> findActiveAvailable(@Param("now") LocalDateTime now);

    @Query("SELECT fd FROM FoodDonation fd WHERE fd.status IN :statuses ORDER BY fd.createdAt DESC")
    List<FoodDonation> findByStatusIn(@Param("statuses") List<DonationStatus> statuses);

    @Query("SELECT COALESCE(SUM(fd.totalQuantity), 0) FROM FoodDonation fd")
    BigDecimal sumTotalQuantityDonated();

    @Query("SELECT COALESCE(SUM(fd.remainingQuantity), 0) FROM FoodDonation fd WHERE fd.status IN ('AVAILABLE', 'PARTIALLY_ALLOCATED') AND fd.consumeBefore > :now")
    BigDecimal sumAvailableQuantity(@Param("now") LocalDateTime now);

    @Query("SELECT COALESCE(SUM(fd.allocatedQuantity), 0) FROM FoodDonation fd WHERE fd.status != 'CANCELLED'")
    BigDecimal sumAllocatedQuantity();

    long countByStatus(DonationStatus status);
}
