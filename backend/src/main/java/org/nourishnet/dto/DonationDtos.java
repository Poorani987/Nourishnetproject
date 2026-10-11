package org.nourishnet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.nourishnet.entity.DonationStatus;
import org.nourishnet.entity.FoodType;
import org.nourishnet.entity.StateType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DonationDtos {

    public static class CreateDonationRequest {
        @NotBlank(message = "Food name is required")
        private String foodName;

        @NotBlank(message = "Food category is required")
        private String foodCategory;

        @NotNull(message = "Food type (Vegetarian/Non-Vegetarian) is required")
        private FoodType foodType;

        @NotNull(message = "State type (Cooked/Packaged) is required")
        private StateType stateType;

        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0.1", message = "Quantity must be greater than 0")
        private BigDecimal totalQuantity;

        @NotBlank(message = "Quantity unit is required")
        private String quantityUnit = "PORTIONS";

        @NotNull(message = "Preparation time is required")
        private LocalDateTime preparationTime;

        @NotNull(message = "Consume-before deadline is required")
        private LocalDateTime consumeBefore;

        private String storageRequirements;
        private String allergenInformation;

        @NotBlank(message = "Pickup address is required")
        private String pickupAddress;

        private BigDecimal pickupLatitude;
        private BigDecimal pickupLongitude;
        private LocalDateTime pickupWindowStart;
        private LocalDateTime pickupWindowEnd;

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
    }

    public static class DonationResponse {
        private Long id;
        private Long donorProfileId;
        private String donorOrganizationName;
        private String donorContact;
        private String donorPhone;
        private String foodName;
        private String foodCategory;
        private FoodType foodType;
        private StateType stateType;
        private BigDecimal totalQuantity;
        private BigDecimal allocatedQuantity;
        private BigDecimal remainingQuantity;
        private String quantityUnit;
        private LocalDateTime preparationTime;
        private LocalDateTime consumeBefore;
        private Long minutesRemaining;
        private String storageRequirements;
        private String allergenInformation;
        private String pickupAddress;
        private BigDecimal pickupLatitude;
        private BigDecimal pickupLongitude;
        private LocalDateTime pickupWindowStart;
        private LocalDateTime pickupWindowEnd;
        private DonationStatus status;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getDonorProfileId() { return donorProfileId; }
        public void setDonorProfileId(Long donorProfileId) { this.donorProfileId = donorProfileId; }

        public String getDonorOrganizationName() { return donorOrganizationName; }
        public void setDonorOrganizationName(String donorOrganizationName) { this.donorOrganizationName = donorOrganizationName; }

        public String getDonorContact() { return donorContact; }
        public void setDonorContact(String donorContact) { this.donorContact = donorContact; }

        public String getDonorPhone() { return donorPhone; }
        public void setDonorPhone(String donorPhone) { this.donorPhone = donorPhone; }

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

        public Long getMinutesRemaining() { return minutesRemaining; }
        public void setMinutesRemaining(Long minutesRemaining) { this.minutesRemaining = minutesRemaining; }

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

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
