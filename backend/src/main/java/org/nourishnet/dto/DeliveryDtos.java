package org.nourishnet.dto;

import jakarta.validation.constraints.NotNull;
import org.nourishnet.entity.DeliveryStatus;
import org.nourishnet.entity.TransportResponsibility;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DeliveryDtos {

    public static class DeliveryStatusUpdateRequest {
        @NotNull(message = "New status is required")
        private DeliveryStatus status;
        private String notes;

        public DeliveryStatus getStatus() { return status; }
        public void setStatus(DeliveryStatus status) { this.status = status; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class DeliveryResponse {
        private Long id;
        private Long allocationId;
        private DeliveryStatus status;
        private BigDecimal distanceKm;
        private TransportResponsibility transportResponsibility;
        private String pickupAddress;
        private String deliveryAddress;
        private LocalDateTime deliveryDeadline;

        private String foodName;
        private String foodCategory;
        private BigDecimal allocatedQuantity;
        private String quantityUnit;
        private String donorOrganizationName;
        private String donorPhone;
        private String recipientOrganizationName;
        private String recipientContactPerson;
        private String recipientPhone;

        private Long assignedVolunteerId;
        private String assignedVolunteerName;
        private String volunteerPhone;
        private String vehicleType;
        private String vehicleRegistration;

        private LocalDateTime assignedAt;
        private LocalDateTime pickedUpAt;
        private LocalDateTime deliveredAt;
        private String notes;

        // Secure field populated strictly for authorized recipient
        private String plainOtpForRecipient;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getAllocationId() { return allocationId; }
        public void setAllocationId(Long allocationId) { this.allocationId = allocationId; }

        public DeliveryStatus getStatus() { return status; }
        public void setStatus(DeliveryStatus status) { this.status = status; }

        public BigDecimal getDistanceKm() { return distanceKm; }
        public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }

        public TransportResponsibility getTransportResponsibility() { return transportResponsibility; }
        public void setTransportResponsibility(TransportResponsibility transportResponsibility) { this.transportResponsibility = transportResponsibility; }

        public String getPickupAddress() { return pickupAddress; }
        public void setPickupAddress(String pickupAddress) { this.pickupAddress = pickupAddress; }

        public String getDeliveryAddress() { return deliveryAddress; }
        public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

        public LocalDateTime getDeliveryDeadline() { return deliveryDeadline; }
        public void setDeliveryDeadline(LocalDateTime deliveryDeadline) { this.deliveryDeadline = deliveryDeadline; }

        public String getFoodName() { return foodName; }
        public void setFoodName(String foodName) { this.foodName = foodName; }

        public String getFoodCategory() { return foodCategory; }
        public void setFoodCategory(String foodCategory) { this.foodCategory = foodCategory; }

        public BigDecimal getAllocatedQuantity() { return allocatedQuantity; }
        public void setAllocatedQuantity(BigDecimal allocatedQuantity) { this.allocatedQuantity = allocatedQuantity; }

        public String getQuantityUnit() { return quantityUnit; }
        public void setQuantityUnit(String quantityUnit) { this.quantityUnit = quantityUnit; }

        public String getDonorOrganizationName() { return donorOrganizationName; }
        public void setDonorOrganizationName(String donorOrganizationName) { this.donorOrganizationName = donorOrganizationName; }

        public String getDonorPhone() { return donorPhone; }
        public void setDonorPhone(String donorPhone) { this.donorPhone = donorPhone; }

        public String getRecipientOrganizationName() { return recipientOrganizationName; }
        public void setRecipientOrganizationName(String recipientOrganizationName) { this.recipientOrganizationName = recipientOrganizationName; }

        public String getRecipientContactPerson() { return recipientContactPerson; }
        public void setRecipientContactPerson(String recipientContactPerson) { this.recipientContactPerson = recipientContactPerson; }

        public String getRecipientPhone() { return recipientPhone; }
        public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }

        public Long getAssignedVolunteerId() { return assignedVolunteerId; }
        public void setAssignedVolunteerId(Long assignedVolunteerId) { this.assignedVolunteerId = assignedVolunteerId; }

        public String getAssignedVolunteerName() { return assignedVolunteerName; }
        public void setAssignedVolunteerName(String assignedVolunteerName) { this.assignedVolunteerName = assignedVolunteerName; }

        public String getVolunteerPhone() { return volunteerPhone; }
        public void setVolunteerPhone(String volunteerPhone) { this.volunteerPhone = volunteerPhone; }

        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

        public String getVehicleRegistration() { return vehicleRegistration; }
        public void setVehicleRegistration(String vehicleRegistration) { this.vehicleRegistration = vehicleRegistration; }

        public LocalDateTime getAssignedAt() { return assignedAt; }
        public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

        public LocalDateTime getPickedUpAt() { return pickedUpAt; }
        public void setPickedUpAt(LocalDateTime pickedUpAt) { this.pickedUpAt = pickedUpAt; }

        public LocalDateTime getDeliveredAt() { return deliveredAt; }
        public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public String getPlainOtpForRecipient() { return plainOtpForRecipient; }
        public void setPlainOtpForRecipient(String plainOtpForRecipient) { this.plainOtpForRecipient = plainOtpForRecipient; }
    }
}
