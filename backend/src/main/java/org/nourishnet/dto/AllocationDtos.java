package org.nourishnet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.nourishnet.entity.AllocationStatus;
import org.nourishnet.entity.TransportResponsibility;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AllocationDtos {

    public static class CreateAllocationRequest {
        @NotNull(message = "Donation ID is required")
        private Long donationId;

        @NotNull(message = "Requested quantity is required")
        @DecimalMin(value = "0.1", message = "Requested quantity must be positive")
        private BigDecimal requestedQuantity;

        private BigDecimal distanceKm;

        public Long getDonationId() { return donationId; }
        public void setDonationId(Long donationId) { this.donationId = donationId; }

        public BigDecimal getRequestedQuantity() { return requestedQuantity; }
        public void setRequestedQuantity(BigDecimal requestedQuantity) { this.requestedQuantity = requestedQuantity; }

        public BigDecimal getDistanceKm() { return distanceKm; }
        public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
    }

    public static class AllocationResponse {
        private Long id;
        private Long donationId;
        private String foodName;
        private String foodCategory;
        private String donorOrganizationName;
        private Long recipientProfileId;
        private String recipientOrganizationName;
        private BigDecimal requestedQuantity;
        private BigDecimal allocatedQuantity;
        private String quantityUnit;
        private BigDecimal distanceKm;
        private TransportResponsibility transportResponsibility;
        private AllocationStatus status;
        private Long deliveryId;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getDonationId() { return donationId; }
        public void setDonationId(Long donationId) { this.donationId = donationId; }

        public String getFoodName() { return foodName; }
        public void setFoodName(String foodName) { this.foodName = foodName; }

        public String getFoodCategory() { return foodCategory; }
        public void setFoodCategory(String foodCategory) { this.foodCategory = foodCategory; }

        public String getDonorOrganizationName() { return donorOrganizationName; }
        public void setDonorOrganizationName(String donorOrganizationName) { this.donorOrganizationName = donorOrganizationName; }

        public Long getRecipientProfileId() { return recipientProfileId; }
        public void setRecipientProfileId(Long recipientProfileId) { this.recipientProfileId = recipientProfileId; }

        public String getRecipientOrganizationName() { return recipientOrganizationName; }
        public void setRecipientOrganizationName(String recipientOrganizationName) { this.recipientOrganizationName = recipientOrganizationName; }

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

        public Long getDeliveryId() { return deliveryId; }
        public void setDeliveryId(Long deliveryId) { this.deliveryId = deliveryId; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
