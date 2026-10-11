package org.nourishnet.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recipient_profiles")
public class RecipientProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "organization_name", nullable = false, length = 150)
    private String organizationName;

    @Column(name = "organization_type", nullable = false, length = 80)
    private String organizationType;

    @Column(name = "contact_person", nullable = false, length = 100)
    private String contactPerson;

    @Column(name = "beneficiary_count", nullable = false)
    private Integer beneficiaryCount = 50;

    @Column(name = "dietary_preferences", length = 100)
    private String dietaryPreferences;

    @Column(name = "required_food_categories", length = 255)
    private String requiredFoodCategories;

    @Column(name = "allergen_restrictions", length = 255)
    private String allergenRestrictions;

    @Column(name = "delivery_instructions", columnDefinition = "TEXT")
    private String deliveryInstructions;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public RecipientProfile() {}

    public RecipientProfile(User user, String organizationName, String organizationType, String contactPerson,
                            Integer beneficiaryCount, String dietaryPreferences, String requiredFoodCategories,
                            String allergenRestrictions, String deliveryInstructions) {
        this.user = user;
        this.organizationName = organizationName;
        this.organizationType = organizationType;
        this.contactPerson = contactPerson;
        this.beneficiaryCount = beneficiaryCount;
        this.dietaryPreferences = dietaryPreferences;
        this.requiredFoodCategories = requiredFoodCategories;
        this.allergenRestrictions = allergenRestrictions;
        this.deliveryInstructions = deliveryInstructions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getOrganizationType() { return organizationType; }
    public void setOrganizationType(String organizationType) { this.organizationType = organizationType; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
