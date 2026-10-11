package org.nourishnet.controller;

import jakarta.validation.Valid;
import org.nourishnet.dto.OtpDtos;
import org.nourishnet.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @GetMapping("/{deliveryId}")
    @PreAuthorize("hasRole('RECIPIENT')")
    public ResponseEntity<OtpDtos.OtpResponse> getOtpForRecipient(
            @PathVariable Long deliveryId,
            Authentication authentication) {
        return ResponseEntity.ok(otpService.getOtpForRecipient(deliveryId, authentication.getName()));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('VEHICLE_VOLUNTEER')")
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @Valid @RequestBody OtpDtos.OtpVerifyRequest request,
            Authentication authentication) {
        boolean verified = otpService.verifyOtp(request.getDeliveryId(), request.getOtpCode(), authentication.getName());
        return ResponseEntity.ok(Map.of("verified", verified, "message", "Handover verified successfully. Delivery completed!"));
    }
}
