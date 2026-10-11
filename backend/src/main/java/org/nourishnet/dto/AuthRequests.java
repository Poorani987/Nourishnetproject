package org.nourishnet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.nourishnet.entity.Role;

import java.math.BigDecimal;

public class AuthRequests {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @NotBlank(message = "Phone number is required")
        private String phoneNumber;

        @NotNull(message = "Role is required")
        private Role role;

        @NotBlank(message = "Address is required")
        private String address;

        @NotBlank(message = "City is required")
        private String city;

        @NotBlank(message = "State is required")
        private String state;

        @NotBlank(message = "PIN code is required")
        private String pincode;

        private BigDecimal latitude;
        private BigDecimal longitude;

        // Role-Specific: Donor
        private String organizationName;
        private String organizationType;
        private String fssaiLicense;
        private String contactPerson;
        private String pickupInstructions;
        private String operatingHours;

        // Role-Specific: Recipient
        private Integer beneficiaryCount;
        private String dietaryPreferences;
        private String requiredFoodCategories;
        private String allergenRestrictions;
        private String deliveryInstructions;

        // Role-Specific: Vehicle Volunteer
        private String vehicleType;
        private String registrationNumber;
        private BigDecimal capacityValue;
        private String capacityUnit;
        private BigDecimal serviceRadiusKm;
        private String preferredLocation;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getPincode() { return pincode; }
        public void setPincode(String pincode) { this.pincode = pincode; }

        public BigDecimal getLatitude() { return latitude; }
        public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

        public BigDecimal getLongitude() { return longitude; }
        public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

        public String getOrganizationName() { return organizationName; }
        public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

        public String getOrganizationType() { return organizationType; }
        public void setOrganizationType(String organizationType) { this.organizationType = organizationType; }

        public String getFssaiLicense() { return fssaiLicense; }
        public void setFssaiLicense(String fssaiLicense) { this.fssaiLicense = fssaiLicense; }

        public String getContactPerson() { return contactPerson; }
        public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

        public String getPickupInstructions() { return pickupInstructions; }
        public void setPickupInstructions(String pickupInstructions) { this.pickupInstructions = pickupInstructions; }

        public String getOperatingHours() { return operatingHours; }
        public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }

        public Integer getBeneficiaryCount() { return beneficiaryCount; }
        public void setBeneficiaryCount(Integer beneficiaryCount) { this.beneficiaryCount = beneficiaryCount; }

        public String getDietaryPreferences() { return dietaryPreferences; }
        public void setDietaryPreferences(String dietaryPreferences) { this.dietaryPreferences = dietaryPreferences; }

        public String getRequiredFoodCategories() { return requiredFoodCategories; }
        public void setRequiredFoodCategories(String requiredFoodCategories) { this.requiredFoodCategories = requiredFoodCategories; }

        public String getAllergenRestrictions() { return allergenRestrictions; }
        public void setAllergenRestrictions(String allergenRestrictions) { this.allergenRestrictions = allergenRestrictions; }

        public String getDeliveryInstructions() { return deliveryInstructions; }
        public void setDeliveryInstructions(String deliveryInstructions) { this.deliveryInstructions = deliveryInstructions; }

        public String getVehicleType() { return vehicleType; }
        public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

        public String getRegistrationNumber() { return registrationNumber; }
        public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

        public BigDecimal getCapacityValue() { return capacityValue; }
        public void setCapacityValue(BigDecimal capacityValue) { this.capacityValue = capacityValue; }

        public String getCapacityUnit() { return capacityUnit; }
        public void setCapacityUnit(String capacityUnit) { this.capacityUnit = capacityUnit; }

        public BigDecimal getServiceRadiusKm() { return serviceRadiusKm; }
        public void setServiceRadiusKm(BigDecimal serviceRadiusKm) { this.serviceRadiusKm = serviceRadiusKm; }

        public String getPreferredLocation() { return preferredLocation; }
        public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }
    }

    public static class ChangePasswordRequest {
        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 6, message = "New password must be at least 6 characters")
        private String newPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
