package org.nourishnet.service;

import org.nourishnet.dto.DonationDtos;
import org.nourishnet.entity.*;
import org.nourishnet.exception.BadRequestException;
import org.nourishnet.exception.ForbiddenException;
import org.nourishnet.exception.ResourceNotFoundException;
import org.nourishnet.repository.DonorProfileRepository;
import org.nourishnet.repository.FoodDonationRepository;
import org.nourishnet.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DonationService {

    private final FoodDonationRepository donationRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public DonationService(FoodDonationRepository donationRepository,
                           DonorProfileRepository donorProfileRepository,
                           UserRepository userRepository,
                           NotificationService notificationService) {
        this.donationRepository = donationRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public DonationDtos.DonationResponse createDonation(DonationDtos.CreateDonationRequest request, String donorEmail) {
        User user = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        DonorProfile donor = donorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Only registered donors can list food donations"));

        if (request.getConsumeBefore().isBefore(request.getPreparationTime())) {
            throw new BadRequestException("Consume-before deadline must be after preparation time");
        }

        if (request.getConsumeBefore().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot list food that has already passed its consume-before deadline");
        }

        FoodDonation donation = new FoodDonation();
        donation.setDonorProfile(donor);
        donation.setFoodName(request.getFoodName());
        donation.setFoodCategory(request.getFoodCategory());
        donation.setFoodType(request.getFoodType());
        donation.setStateType(request.getStateType());
        donation.setTotalQuantity(request.getTotalQuantity());
        donation.setAllocatedQuantity(BigDecimal.ZERO);
        donation.setRemainingQuantity(request.getTotalQuantity());
        donation.setQuantityUnit(request.getQuantityUnit() != null ? request.getQuantityUnit() : "PORTIONS");
        donation.setPreparationTime(request.getPreparationTime());
        donation.setConsumeBefore(request.getConsumeBefore());
        donation.setStorageRequirements(request.getStorageRequirements());
        donation.setAllergenInformation(request.getAllergenInformation());
        donation.setPickupAddress(request.getPickupAddress());
        donation.setPickupLatitude(request.getPickupLatitude() != null ? request.getPickupLatitude() : user.getLatitude());
        donation.setPickupLongitude(request.getPickupLongitude() != null ? request.getPickupLongitude() : user.getLongitude());
        donation.setPickupWindowStart(request.getPickupWindowStart());
        donation.setPickupWindowEnd(request.getPickupWindowEnd());
        donation.setStatus(DonationStatus.AVAILABLE);

        donation = donationRepository.save(donation);

        notificationService.createNotification(
                user,
                "Food Donation Created",
                "Your donation '" + donation.getFoodName() + "' (" + donation.getTotalQuantity() + " " + donation.getQuantityUnit() + ") has been listed.",
                "DONATION_CREATED",
                "FOOD_DONATION",
                donation.getId()
        );

        return mapToResponse(donation);
    }

    @Transactional(readOnly = true)
    public List<DonationDtos.DonationResponse> getActiveAvailableDonations() {
        LocalDateTime now = LocalDateTime.now();
        List<FoodDonation> list = donationRepository.findActiveAvailable(now);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DonationDtos.DonationResponse getDonationById(Long id) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food donation not found with ID: " + id));
        return mapToResponse(donation);
    }

    @Transactional(readOnly = true)
    public List<DonationDtos.DonationResponse> getMyDonations(String donorEmail) {
        User user = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        DonorProfile donor = donorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Donor profile not found"));

        return donationRepository.findByDonorProfileIdOrderByCreatedAtDesc(donor.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public DonationDtos.DonationResponse updateDonation(Long id, DonationDtos.CreateDonationRequest request, String donorEmail) {
        User user = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        DonorProfile donor = donorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Donor profile not found"));

        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        if (!donation.getDonorProfile().getId().equals(donor.getId())) {
            throw new ForbiddenException("You cannot modify another donor's donation");
        }

        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new BadRequestException("Cannot edit donation with status " + donation.getStatus() + ". Allocations already exist.");
        }

        donation.setFoodName(request.getFoodName());
        donation.setFoodCategory(request.getFoodCategory());
        donation.setFoodType(request.getFoodType());
        donation.setStateType(request.getStateType());
        donation.setTotalQuantity(request.getTotalQuantity());
        donation.setRemainingQuantity(request.getTotalQuantity());
        donation.setPreparationTime(request.getPreparationTime());
        donation.setConsumeBefore(request.getConsumeBefore());
        donation.setStorageRequirements(request.getStorageRequirements());
        donation.setAllergenInformation(request.getAllergenInformation());
        donation.setPickupAddress(request.getPickupAddress());

        donation = donationRepository.save(donation);
        return mapToResponse(donation);
    }

    @Transactional
    public void cancelDonation(Long id, String donorEmail) {
        User user = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        DonorProfile donor = donorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Donor profile not found"));

        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        if (!donation.getDonorProfile().getId().equals(donor.getId())) {
            throw new ForbiddenException("You cannot cancel another donor's donation");
        }

        if (donation.getStatus() == DonationStatus.DELIVERED || donation.getStatus() == DonationStatus.PICKED_UP) {
            throw new BadRequestException("Cannot cancel donation that has already been picked up or delivered");
        }

        donation.setStatus(DonationStatus.CANCELLED);
        donationRepository.save(donation);

        notificationService.createNotification(
                user,
                "Donation Cancelled",
                "Your donation #" + id + " (" + donation.getFoodName() + ") has been cancelled.",
                "DONATION_CANCELLED",
                "FOOD_DONATION",
                donation.getId()
        );
    }

    public DonationDtos.DonationResponse mapToResponse(FoodDonation donation) {
        DonationDtos.DonationResponse resp = new DonationDtos.DonationResponse();
        resp.setId(donation.getId());
        resp.setDonorProfileId(donation.getDonorProfile().getId());
        resp.setDonorOrganizationName(donation.getDonorProfile().getOrganizationName());
        resp.setDonorContact(donation.getDonorProfile().getContactPerson());
        resp.setDonorPhone(donation.getDonorProfile().getUser().getPhoneNumber());
        resp.setFoodName(donation.getFoodName());
        resp.setFoodCategory(donation.getFoodCategory());
        resp.setFoodType(donation.getFoodType());
        resp.setStateType(donation.getStateType());
        resp.setTotalQuantity(donation.getTotalQuantity());
        resp.setAllocatedQuantity(donation.getAllocatedQuantity());
        resp.setRemainingQuantity(donation.getRemainingQuantity());
        resp.setQuantityUnit(donation.getQuantityUnit());
        resp.setPreparationTime(donation.getPreparationTime());
        resp.setConsumeBefore(donation.getConsumeBefore());

        LocalDateTime now = LocalDateTime.now();
        if (donation.getConsumeBefore().isAfter(now)) {
            resp.setMinutesRemaining(Duration.between(now, donation.getConsumeBefore()).toMinutes());
        } else {
            resp.setMinutesRemaining(0L);
        }

        resp.setStorageRequirements(donation.getStorageRequirements());
        resp.setAllergenInformation(donation.getAllergenInformation());
        resp.setPickupAddress(donation.getPickupAddress());
        resp.setPickupLatitude(donation.getPickupLatitude());
        resp.setPickupLongitude(donation.getPickupLongitude());
        resp.setPickupWindowStart(donation.getPickupWindowStart());
        resp.setPickupWindowEnd(donation.getPickupWindowEnd());
        resp.setStatus(donation.getStatus());
        resp.setCreatedAt(donation.getCreatedAt());
        return resp;
    }
}
