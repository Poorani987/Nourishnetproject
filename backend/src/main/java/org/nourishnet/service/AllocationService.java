package org.nourishnet.service;

import org.nourishnet.dto.AllocationDtos;
import org.nourishnet.entity.*;
import org.nourishnet.exception.BadRequestException;
import org.nourishnet.exception.ConflictException;
import org.nourishnet.exception.ForbiddenException;
import org.nourishnet.exception.ResourceNotFoundException;
import org.nourishnet.repository.*;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AllocationService {

    private final FoodDonationRepository donationRepository;
    private final FoodAllocationRepository allocationRepository;
    private final RecipientProfileRepository recipientProfileRepository;
    private final DeliveryRepository deliveryRepository;
    private final UserRepository userRepository;
    private final OtpService otpService;
    private final NotificationService notificationService;

    public AllocationService(FoodDonationRepository donationRepository,
                             FoodAllocationRepository allocationRepository,
                             RecipientProfileRepository recipientProfileRepository,
                             DeliveryRepository deliveryRepository,
                             UserRepository userRepository,
                             OtpService otpService,
                             NotificationService notificationService) {
        this.donationRepository = donationRepository;
        this.allocationRepository = allocationRepository;
        this.recipientProfileRepository = recipientProfileRepository;
        this.deliveryRepository = deliveryRepository;
        this.userRepository = userRepository;
        this.otpService = otpService;
        this.notificationService = notificationService;
    }

    @Transactional
    public AllocationDtos.AllocationResponse requestAllocation(AllocationDtos.CreateAllocationRequest request, String recipientEmail) {
        User user = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RecipientProfile recipient = recipientProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Only registered recipients can request food allocations"));

        FoodDonation donation = donationRepository.findById(request.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Food donation not found with ID: " + request.getDonationId()));

        LocalDateTime now = LocalDateTime.now();
        if (donation.getConsumeBefore().isBefore(now)) {
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);
            throw new BadRequestException("This food donation has expired and cannot be claimed for consumption");
        }

        if (donation.getStatus() != DonationStatus.AVAILABLE && donation.getStatus() != DonationStatus.PARTIALLY_ALLOCATED) {
            throw new BadRequestException("Donation is not available for allocation. Current status: " + donation.getStatus());
        }

        BigDecimal requested = request.getRequestedQuantity();
        if (requested.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Requested quantity must be greater than zero");
        }

        if (requested.compareTo(donation.getRemainingQuantity()) > 0) {
            throw new BadRequestException("Requested quantity (" + requested + " " + donation.getQuantityUnit() +
                    ") exceeds remaining available quantity (" + donation.getRemainingQuantity() + " " + donation.getQuantityUnit() + ")");
        }

        BigDecimal distance = request.getDistanceKm() != null ? request.getDistanceKm() : new BigDecimal("5.00");
        TransportResponsibility transportPolicy = distance.compareTo(new BigDecimal("15.00")) <= 0
                ? TransportResponsibility.DONOR_OR_VOLUNTEER
                : TransportResponsibility.RECIPIENT_OR_VOLUNTEER;

        try {
            // Deduct portion quantity and update donation state
            BigDecimal newRemaining = donation.getRemainingQuantity().subtract(requested);
            BigDecimal newAllocated = donation.getAllocatedQuantity().add(requested);

            donation.setRemainingQuantity(newRemaining);
            donation.setAllocatedQuantity(newAllocated);

            if (newRemaining.compareTo(BigDecimal.ZERO) == 0) {
                donation.setStatus(DonationStatus.FULLY_ALLOCATED);
            } else {
                donation.setStatus(DonationStatus.PARTIALLY_ALLOCATED);
            }

            donation = donationRepository.save(donation);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ConflictException("Another recipient claimed portions concurrently. Please refresh to see the updated remaining quantity.");
        }

        // Create Food Allocation record
        FoodAllocation allocation = new FoodAllocation(
                donation,
                recipient,
                requested,
                requested,
                donation.getQuantityUnit(),
                distance,
                transportPolicy,
                AllocationStatus.CONFIRMED
        );
        allocation = allocationRepository.save(allocation);

        // Create corresponding Delivery dispatch record in PENDING state
        Delivery delivery = new Delivery(
                allocation,
                DeliveryStatus.PENDING,
                distance,
                transportPolicy,
                donation.getPickupAddress(),
                user.getAddress() + ", " + user.getCity(),
                donation.getConsumeBefore()
        );
        delivery = deliveryRepository.save(delivery);

        // Generate secure 6-digit random handover OTP for the recipient
        otpService.generateOtpForDelivery(delivery, recipient);

        // Notify Donor
        notificationService.createNotification(
                donation.getDonorProfile().getUser(),
                "New Food Allocation Claimed",
                recipient.getOrganizationName() + " has claimed " + requested + " " + donation.getQuantityUnit() +
                        " of '" + donation.getFoodName() + "'. Transport Policy: " + (distance.compareTo(new BigDecimal("15.00")) <= 0 ? "Under 15km (Donor/Volunteer)" : "Over 15km (Recipient/Volunteer)"),
                "ALLOCATION_CLAIMED",
                "FOOD_ALLOCATION",
                allocation.getId()
        );

        // Notify Recipient
        notificationService.createNotification(
                user,
                "Food Request Confirmed",
                "Your request for " + requested + " " + donation.getQuantityUnit() + " of '" +
                        donation.getFoodName() + "' is confirmed. Track your delivery and view your OTP in your dashboard.",
                "ALLOCATION_CONFIRMED",
                "FOOD_ALLOCATION",
                allocation.getId()
        );

        return mapToResponse(allocation, delivery.getId());
    }

    @Transactional(readOnly = true)
    public List<AllocationDtos.AllocationResponse> getMyAllocations(String recipientEmail) {
        User user = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        RecipientProfile recipient = recipientProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Recipient profile not found"));

        return allocationRepository.findByRecipientProfileIdOrderByCreatedAtDesc(recipient.getId())
                .stream()
                .map(alloc -> {
                    Long deliveryId = deliveryRepository.findByAllocationId(alloc.getId()).map(Delivery::getId).orElse(null);
                    return mapToResponse(alloc, deliveryId);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AllocationDtos.AllocationResponse> getDonorAllocations(String donorEmail) {
        User user = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return allocationRepository.findByDonorProfileId(user.getId())
                .stream()
                .map(alloc -> {
                    Long deliveryId = deliveryRepository.findByAllocationId(alloc.getId()).map(Delivery::getId).orElse(null);
                    return mapToResponse(alloc, deliveryId);
                })
                .collect(Collectors.toList());
    }

    private AllocationDtos.AllocationResponse mapToResponse(FoodAllocation allocation, Long deliveryId) {
        AllocationDtos.AllocationResponse resp = new AllocationDtos.AllocationResponse();
        resp.setId(allocation.getId());
        resp.setDonationId(allocation.getDonation().getId());
        resp.setFoodName(allocation.getDonation().getFoodName());
        resp.setFoodCategory(allocation.getDonation().getFoodCategory());
        resp.setDonorOrganizationName(allocation.getDonation().getDonorProfile().getOrganizationName());
        resp.setRecipientProfileId(allocation.getRecipientProfile().getId());
        resp.setRecipientOrganizationName(allocation.getRecipientProfile().getOrganizationName());
        resp.setRequestedQuantity(allocation.getRequestedQuantity());
        resp.setAllocatedQuantity(allocation.getAllocatedQuantity());
        resp.setQuantityUnit(allocation.getQuantityUnit());
        resp.setDistanceKm(allocation.getDistanceKm());
        resp.setTransportResponsibility(allocation.getTransportResponsibility());
        resp.setStatus(allocation.getStatus());
        resp.setDeliveryId(deliveryId);
        resp.setCreatedAt(allocation.getCreatedAt());
        return resp;
    }
}
