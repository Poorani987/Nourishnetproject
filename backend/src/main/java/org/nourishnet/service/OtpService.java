package org.nourishnet.service;

import org.nourishnet.dto.OtpDtos;
import org.nourishnet.entity.Delivery;
import org.nourishnet.entity.OtpVerification;
import org.nourishnet.entity.RecipientProfile;

public interface OtpService {
    OtpVerification generateOtpForDelivery(Delivery delivery, RecipientProfile recipient);
    OtpDtos.OtpResponse getOtpForRecipient(Long deliveryId, String recipientEmail);
    boolean verifyOtp(Long deliveryId, String submittedOtp, String volunteerEmail);
}
