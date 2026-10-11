package org.nourishnet.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "volunteer_rewards")
public class VolunteerReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_profile_id", nullable = false)
    private VolunteerProfile volunteerProfile;

    @Column(name = "points_awarded", nullable = false)
    private Integer pointsAwarded = 50;

    @Column(name = "reason", nullable = false, length = 100)
    private String reason;

    @Column(name = "badge_name", length = 50)
    private String badgeName;

    @Column(name = "awarded_at", insertable = false, updatable = false)
    private LocalDateTime awardedAt;

    public VolunteerReward() {}

    public VolunteerReward(VolunteerProfile volunteerProfile, Integer pointsAwarded, String reason, String badgeName) {
        this.volunteerProfile = volunteerProfile;
        this.pointsAwarded = pointsAwarded;
        this.reason = reason;
        this.badgeName = badgeName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public VolunteerProfile getVolunteerProfile() { return volunteerProfile; }
    public void setVolunteerProfile(VolunteerProfile volunteerProfile) { this.volunteerProfile = volunteerProfile; }

    public Integer getPointsAwarded() { return pointsAwarded; }
    public void setPointsAwarded(Integer pointsAwarded) { this.pointsAwarded = pointsAwarded; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getBadgeName() { return badgeName; }
    public void setBadgeName(String badgeName) { this.badgeName = badgeName; }

    public LocalDateTime getAwardedAt() { return awardedAt; }
    public void setAwardedAt(LocalDateTime awardedAt) { this.awardedAt = awardedAt; }
}
