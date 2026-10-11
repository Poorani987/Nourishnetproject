package org.nourishnet.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "volunteer_profiles")
public class VolunteerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    @Column(name = "service_radius_km", nullable = false, precision = 5, scale = 2)
    private BigDecimal serviceRadiusKm = new BigDecimal("15.00");

    @Column(name = "preferred_location", length = 100)
    private String preferredLocation;

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints = 0;

    @Column(name = "completed_deliveries_count", nullable = false)
    private Integer completedDeliveriesCount = 0;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public VolunteerProfile() {}

    public VolunteerProfile(User user, Boolean isAvailable, BigDecimal serviceRadiusKm, String preferredLocation) {
        this.user = user;
        this.isAvailable = isAvailable;
        this.serviceRadiusKm = serviceRadiusKm;
        this.preferredLocation = preferredLocation;
        this.totalPoints = 0;
        this.completedDeliveriesCount = 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public BigDecimal getServiceRadiusKm() { return serviceRadiusKm; }
    public void setServiceRadiusKm(BigDecimal serviceRadiusKm) { this.serviceRadiusKm = serviceRadiusKm; }

    public String getPreferredLocation() { return preferredLocation; }
    public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }

    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }

    public Integer getCompletedDeliveriesCount() { return completedDeliveriesCount; }
    public void setCompletedDeliveriesCount(Integer completedDeliveriesCount) { this.completedDeliveriesCount = completedDeliveriesCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
