package org.nourishnet.repository;

import org.nourishnet.entity.WasteRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface WasteRecordRepository extends JpaRepository<WasteRecord, Long> {

    @Query("SELECT wr FROM WasteRecord wr WHERE wr.donation.donorProfile.id = :donorProfileId ORDER BY wr.recordedAt DESC")
    List<WasteRecord> findByDonorProfileId(@Param("donorProfileId") Long donorProfileId);

    @Query("SELECT COALESCE(SUM(wr.quantity), 0) FROM WasteRecord wr")
    BigDecimal sumTotalWastedQuantity();
}
