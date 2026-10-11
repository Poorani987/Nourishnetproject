package org.nourishnet.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_allocations")
public class FoodAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donation_id", nullable = false)
    private FoodDonation donation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipient_profile_id", nullable = false)
    private RecipientProfile recipientProfile;

    @Column(name = "requested_quantity", nullable = false, precision = 8, scale = 2)
    private BigDecimal requestedQuantity;

    @Column(name = "allocated_quantity", nullable = false, precision = 8, scale = 2)
    private BigDecimal allocatedQuantity;

    @Column(name = "quantity_unit", nullable = false, length = 20)
    private String quantityUnit = "PORTIONS";

    @Column(name = "distance_km", nullable = false, precision = 6, scale = 2)
    private BigDecimal distanceKm = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "transport_responsibility", nullable = false, length = 40)
    private TransportResponsibility transportResponsibility;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private AllocationStatus status = AllocationStatus.PENDING;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public FoodAllocation() {}

    public FoodAllocation(FoodDonation donation, RecipientProfile recipientProfile, BigDecimal requestedQuantity,
                          BigDecimal allocatedQuantity, String quantityUnit, BigDecimal distanceKm,
                          TransportResponsibility transportResponsibility, AllocationStatus status) {
        this.donation = donation;
        this.recipientProfile = recipientProfile;
        this.requestedQuantity = requestedQuantity;
        this.allocatedQuantity = allocatedQuantity;
        this.quantityUnit = quantityUnit;
        this.distanceKm = distanceKm;
        this.transportResponsibility = transportResponsibility;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public FoodDonation getDonation() { return donation; }
    public void setDonation(FoodDonation donation) { this.donation = donation; }

    public RecipientProfile getRecipientProfile() { return recipientProfile; }
    public void setRecipientProfile(RecipientProfile recipientProfile) { this.recipientProfile = recipientProfile; }

    public BigDecimal getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(BigDecimal requestedQuantity) { this.requestedQuantity = requestedQuantity; }

    public BigDecimal getAllocatedQuantity() { return allocatedQuantity; }
    public void setAllocatedQuantity(BigDecimal allocatedQuantity) { this.allocatedQuantity = allocatedQuantity; }

    public String getQuantityUnit() { return quantityUnit; }
    public void setQuantityUnit(String quantityUnit) { this.quantityUnit = quantityUnit; }

    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }

    public TransportResponsibility getTransportResponsibility() { return transportResponsibility; }
    public void setTransportResponsibility(TransportResponsibility transportResponsibility) { this.transportResponsibility = transportResponsibility; }

    public AllocationStatus getStatus() { return status; }
    public void setStatus(AllocationStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
