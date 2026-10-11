package org.nourishnet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class OtpDtos {

    public static class OtpVerifyRequest {
        @NotNull(message = "Delivery ID is required")
        private Long deliveryId;

        @NotBlank(message = "OTP code is required")
        @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
        private String otpCode;

        public Long getDeliveryId() { return deliveryId; }
        public void setDeliveryId(Long deliveryId) { this.deliveryId = deliveryId; }

        public String getOtpCode() { return otpCode; }
        public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
    }

    public static class OtpResponse {
        private Long deliveryId;
        private String plainOtp;
        private LocalDateTime expiresAt;
        private boolean isUsed;
        private int remainingAttempts;

        public OtpResponse() {}

        public OtpResponse(Long deliveryId, String plainOtp, LocalDateTime expiresAt, boolean isUsed, int remainingAttempts) {
            this.deliveryId = deliveryId;
            this.plainOtp = plainOtp;
            this.expiresAt = expiresAt;
            this.isUsed = isUsed;
            this.remainingAttempts = remainingAttempts;
        }

        public Long getDeliveryId() { return deliveryId; }
        public void setDeliveryId(Long deliveryId) { this.deliveryId = deliveryId; }

        public String getPlainOtp() { return plainOtp; }
        public void setPlainOtp(String plainOtp) { this.plainOtp = plainOtp; }

        public LocalDateTime getExpiresAt() { return expiresAt; }
        public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

        public boolean isUsed() { return isUsed; }
        public void setUsed(boolean used) { isUsed = used; }

        public int getRemainingAttempts() { return remainingAttempts; }
        public void setRemainingAttempts(int remainingAttempts) { this.remainingAttempts = remainingAttempts; }
    }
}
