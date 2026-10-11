package org.nourishnet.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "delivery_id", nullable = false, unique = true)
    private Delivery delivery;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipient_profile_id", nullable = false)
    private RecipientProfile recipientProfile;

    @Column(name = "otp_code_hash", nullable = false, length = 255)
    private String otpCodeHash;

    @Column(name = "plain_otp_for_recipient", nullable = false, length = 10)
    private String plainOtpForRecipient;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount = 0;

    @Column(name = "max_attempts", nullable = false)
    private Integer maxAttempts = 5;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public OtpVerification() {}

    public OtpVerification(Delivery delivery, RecipientProfile recipientProfile, String otpCodeHash,
                           String plainOtpForRecipient, LocalDateTime expiresAt) {
        this.delivery = delivery;
        this.recipientProfile = recipientProfile;
        this.otpCodeHash = otpCodeHash;
        this.plainOtpForRecipient = plainOtpForRecipient;
        this.expiresAt = expiresAt;
        this.isUsed = false;
        this.attemptCount = 0;
        this.maxAttempts = 5;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Delivery getDelivery() { return delivery; }
    public void setDelivery(Delivery delivery) { this.delivery = delivery; }

    public RecipientProfile getRecipientProfile() { return recipientProfile; }
    public void setRecipientProfile(RecipientProfile recipientProfile) { this.recipientProfile = recipientProfile; }

    public String getOtpCodeHash() { return otpCodeHash; }
    public void setOtpCodeHash(String otpCodeHash) { this.otpCodeHash = otpCodeHash; }

    public String getPlainOtpForRecipient() { return plainOtpForRecipient; }
    public void setPlainOtpForRecipient(String plainOtpForRecipient) { this.plainOtpForRecipient = plainOtpForRecipient; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public Boolean getIsUsed() { return isUsed; }
    public void setIsUsed(Boolean isUsed) { this.isUsed = isUsed; }

    public Integer getAttemptCount() { return attemptCount; }
    public void setAttemptCount(Integer attemptCount) { this.attemptCount = attemptCount; }

    public Integer getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(Integer maxAttempts) { this.maxAttempts = maxAttempts; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
