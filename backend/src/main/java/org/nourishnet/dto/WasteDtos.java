package org.nourishnet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WasteDtos {

    public static class CreateWasteRecordRequest {
        @NotNull(message = "Donation ID is required")
        private Long donationId;

        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0.1", message = "Quantity must be positive")
        private BigDecimal quantity;

        @NotBlank(message = "Unit is required")
        private String quantityUnit = "PORTIONS";

        @NotBlank(message = "Waste reason is required")
        private String wasteReason;

        @NotBlank(message = "Disposal method is required")
        private String disposalMethod;

        private String notes;

        public Long getDonationId() { return donationId; }
        public void setDonationId(Long donationId) { this.donationId = donationId; }

        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

        public String getQuantityUnit() { return quantityUnit; }
        public void setQuantityUnit(String quantityUnit) { this.quantityUnit = quantityUnit; }

        public String getWasteReason() { return wasteReason; }
        public void setWasteReason(String wasteReason) { this.wasteReason = wasteReason; }

        public String getDisposalMethod() { return disposalMethod; }
        public void setDisposalMethod(String disposalMethod) { this.disposalMethod = disposalMethod; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class WasteRecordResponse {
        private Long id;
        private Long donationId;
        private String foodName;
        private String donorOrganizationName;
        private BigDecimal quantity;
        private String quantityUnit;
        private String wasteReason;
        private String disposalMethod;
        private String notes;
        private LocalDateTime recordedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getDonationId() { return donationId; }
        public void setDonationId(Long donationId) { this.donationId = donationId; }

        public String getFoodName() { return foodName; }
        public void setFoodName(String foodName) { this.foodName = foodName; }

        public String getDonorOrganizationName() { return donorOrganizationName; }
        public void setDonorOrganizationName(String donorOrganizationName) { this.donorOrganizationName = donorOrganizationName; }

        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

        public String getQuantityUnit() { return quantityUnit; }
        public void setQuantityUnit(String quantityUnit) { this.quantityUnit = quantityUnit; }

        public String getWasteReason() { return wasteReason; }
        public void setWasteReason(String wasteReason) { this.wasteReason = wasteReason; }

        public String getDisposalMethod() { return disposalMethod; }
        public void setDisposalMethod(String disposalMethod) { this.disposalMethod = disposalMethod; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public LocalDateTime getRecordedAt() { return recordedAt; }
        public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
    }
}
