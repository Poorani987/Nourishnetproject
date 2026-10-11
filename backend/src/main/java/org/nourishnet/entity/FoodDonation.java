package org.nourishnet.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_donations")
public class FoodDonation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donor_profile_id", nullable = false)
    private DonorProfile donorProfile;

    @Column(name = "food_name", nullable = false, length = 150)
    private String foodName;

    @Column(name = "food_category", nullable = false, length = 50)
    private String foodCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "food_type", nullable = false, length = 30)
    private FoodType foodType;

    @Enumerated(EnumType.STRING)
    @Column(name = "state_type", nullable = false, length = 30)
    private StateType stateType;

    @Column(name = "total_quantity", nullable = false, precision = 8, scale = 2)
    private BigDecimal totalQuantity;

    @Column(name = "allocated_quantity", nullable = false, precision = 8, scale = 2)
    private BigDecimal allocatedQuantity = BigDecimal.ZERO;

    @Column(name = "remaining_quantity", nullable = false, precision = 8, scale = 2)
    private BigDecimal remainingQuantity;

    @Column(name = "quantity_unit", nullable = false, length = 20)
    private String quantityUnit = "PORTIONS";

    @Column(name = "preparation_time", nullable = false)
    private LocalDateTime preparationTime;

    @Column(name = "consume_before", nullable = false)
    private LocalDateTime consumeBefore;

    @Column(name = "storage_requirements", length = 100)
    private String storageRequirements;

    @Column(name = "allergen_information", length = 255)
    private String allergenInformation;

    @Column(name = "pickup_address", nullable = false, length = 255)
    private String pickupAddress;

    @Column(name = "pickup_latitude", precision = 10, scale = 7)
    private BigDecimal pickupLatitude;

    @Column(name = "pickup_longitude", precision = 10, scale = 7)
    private BigDecimal pickupLongitude;

    @Column(name = "pickup_window_start")
    private LocalDateTime pickupWindowStart;

    @Column(name = "pickup_window_end")
    private LocalDateTime pickupWindowEnd;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private DonationStatus status = DonationStatus.AVAILABLE;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public FoodDonation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DonorProfile getDonorProfile() { return donorProfile; }
    public void setDonorProfile(DonorProfile donorProfile) { this.donorProfile = donorProfile; }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }

    public String getFoodCategory() { return foodCategory; }
    public void setFoodCategory(String foodCategory) { this.foodCategory = foodCategory; }

    public FoodType getFoodType() { return foodType; }
    public void setFoodType(FoodType foodType) { this.foodType = foodType; }

    public StateType getStateType() { return stateType; }
    public void setStateType(StateType stateType) { this.stateType = stateType; }

    public BigDecimal getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(BigDecimal totalQuantity) { this.totalQuantity = totalQuantity; }

    public BigDecimal getAllocatedQuantity() { return allocatedQuantity; }
    public void setAllocatedQuantity(BigDecimal allocatedQuantity) { this.allocatedQuantity = allocatedQuantity; }

    public BigDecimal getRemainingQuantity() { return remainingQuantity; }
    public void setRemainingQuantity(BigDecimal remainingQuantity) { this.remainingQuantity = remainingQuantity; }

    public String getQuantityUnit() { return quantityUnit; }
    public void setQuantityUnit(String quantityUnit) { this.quantityUnit = quantityUnit; }

    public LocalDateTime getPreparationTime() { return preparationTime; }
    public void setPreparationTime(LocalDateTime preparationTime) { this.preparationTime = preparationTime; }

    public LocalDateTime getConsumeBefore() { return consumeBefore; }
    public void setConsumeBefore(LocalDateTime consumeBefore) { this.consumeBefore = consumeBefore; }

    public String getStorageRequirements() { return storageRequirements; }
    public void setStorageRequirements(String storageRequirements) { this.storageRequirements = storageRequirements; }

    public String getAllergenInformation() { return allergenInformation; }
    public void setAllergenInformation(String allergenInformation) { this.allergenInformation = allergenInformation; }

    public String getPickupAddress() { return pickupAddress; }
    public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

    public BigDecimal getPickupLatitude() { return pickupLatitude; }
    public void setPickupLatitude(BigDecimal pickupLatitude) { this.pickupLatitude = pickupLatitude; }

    public BigDecimal getPickupLongitude() { return pickupLongitude; }
    public void setPickupLongitude(BigDecimal pickupLongitude) { this.pickupLongitude = pickupLongitude; }

    public LocalDateTime getPickupWindowStart() { return pickupWindowStart; }
    public void setPickupWindowStart(LocalDateTime pickupWindowStart) { this.pickupWindowStart = pickupWindowStart; }

    public LocalDateTime getPickupWindowEnd() { return pickupWindowEnd; }
    public void setPickupWindowEnd(LocalDateTime pickupWindowEnd) { this.pickupWindowEnd = pickupWindowEnd; }

    public DonationStatus getStatus() { return status; }
    public void setStatus(DonationStatus status) { this.status = status; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
