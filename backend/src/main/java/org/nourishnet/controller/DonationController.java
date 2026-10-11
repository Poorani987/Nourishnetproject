package org.nourishnet.controller;

import jakarta.validation.Valid;
import org.nourishnet.dto.DonationDtos;
import org.nourishnet.service.DonationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @GetMapping("/available")
    public ResponseEntity<List<DonationDtos.DonationResponse>> getAvailableDonations() {
        return ResponseEntity.ok(donationService.getActiveAvailableDonations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationDtos.DonationResponse> getDonationById(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.getDonationById(id));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<List<DonationDtos.DonationResponse>> getMyDonations(Authentication authentication) {
        return ResponseEntity.ok(donationService.getMyDonations(authentication.getName()));
    }

    @PostMapping
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<DonationDtos.DonationResponse> createDonation(
            @Valid @RequestBody DonationDtos.CreateDonationRequest request,
            Authentication authentication) {
        DonationDtos.DonationResponse response = donationService.createDonation(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<DonationDtos.DonationResponse> updateDonation(
            @PathVariable Long id,
            @Valid @RequestBody DonationDtos.CreateDonationRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(donationService.updateDonation(id, request, authentication.getName()));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<Void> cancelDonation(@PathVariable Long id, Authentication authentication) {
        donationService.cancelDonation(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
