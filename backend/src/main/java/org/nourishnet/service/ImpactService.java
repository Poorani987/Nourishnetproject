package org.nourishnet.service;

import org.nourishnet.dto.ImpactSummaryDto;
import org.nourishnet.dto.WasteDtos;
import org.nourishnet.entity.*;
import org.nourishnet.exception.ForbiddenException;
import org.nourishnet.exception.ResourceNotFoundException;
import org.nourishnet.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ImpactService {

    private final FoodDonationRepository donationRepository;
    private final FoodAllocationRepository allocationRepository;
    private final DeliveryRepository deliveryRepository;
    private final WasteRecordRepository wasteRecordRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final RecipientProfileRepository recipientProfileRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final UserRepository userRepository;

    public ImpactService(FoodDonationRepository donationRepository,
                         FoodAllocationRepository allocationRepository,
                         DeliveryRepository deliveryRepository,
                         WasteRecordRepository wasteRecordRepository,
                         VolunteerProfileRepository volunteerProfileRepository,
                         RecipientProfileRepository recipientProfileRepository,
                         DonorProfileRepository donorProfileRepository,
                         UserRepository userRepository) {
        this.donationRepository = donationRepository;
        this.allocationRepository = allocationRepository;
        this.deliveryRepository = deliveryRepository;
        this.wasteRecordRepository = wasteRecordRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.recipientProfileRepository = recipientProfileRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public ImpactSummaryDto getImpactSummary() {
        ImpactSummaryDto dto = new ImpactSummaryDto();

        BigDecimal donated = donationRepository.sumTotalQuantityDonated();
        BigDecimal allocated = donationRepository.sumAllocatedQuantity();
        BigDecimal delivered = allocationRepository.sumDeliveredQuantity();
        BigDecimal wasted = wasteRecordRepository.sumTotalWastedQuantity();

        dto.setTotalPortionsDonated(donated != null ? donated : BigDecimal.ZERO);
        dto.setTotalPortionsAllocated(allocated != null ? allocated : BigDecimal.ZERO);
        dto.setTotalPortionsDelivered(delivered != null ? delivered : BigDecimal.ZERO);
        dto.setTotalPortionsWasted(wasted != null ? wasted : BigDecimal.ZERO);

        // Waste prevented is the direct verified delivered quantity
        dto.setEstimatedWastePrevented(delivered != null ? delivered : BigDecimal.ZERO);

        dto.setTotalDonationsCount(donationRepository.count());
        dto.setCompletedDeliveriesCount(deliveryRepository.countByStatus(DeliveryStatus.DELIVERED));
        dto.setActiveVolunteersCount(volunteerProfileRepository.count());
        dto.setActiveRecipientsCount(recipientProfileRepository.count());

        return dto;
    }

    @Transactional
    public WasteDtos.WasteRecordResponse logWaste(WasteDtos.CreateWasteRecordRequest request, String donorEmail) {
        User user = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        DonorProfile donor = donorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Donor profile not found"));

        FoodDonation donation = donationRepository.findById(request.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        if (!donation.getDonorProfile().getId().equals(donor.getId())) {
            throw new ForbiddenException("You cannot log waste for another donor's food donation");
        }

        WasteRecord wr = new WasteRecord(
                donation,
                request.getQuantity(),
                request.getQuantityUnit(),
                request.getWasteReason(),
                request.getDisposalMethod(),
                request.getNotes(),
                LocalDateTime.now()
        );
        wr = wasteRecordRepository.save(wr);

        return mapToWasteResponse(wr);
    }

    @Transactional(readOnly = true)
    public List<WasteDtos.WasteRecordResponse> getMyWasteRecords(String donorEmail) {
        User user = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        DonorProfile donor = donorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Donor profile not found"));

        return wasteRecordRepository.findByDonorProfileId(donor.getId())
                .stream().map(this::mapToWasteResponse).collect(Collectors.toList());
    }

    private WasteDtos.WasteRecordResponse mapToWasteResponse(WasteRecord wr) {
        WasteDtos.WasteRecordResponse resp = new WasteDtos.WasteRecordResponse();
        resp.setId(wr.getId());
        resp.setDonationId(wr.getDonation().getId());
        resp.setFoodName(wr.getDonation().getFoodName());
        resp.setDonorOrganizationName(wr.getDonation().getDonorProfile().getOrganizationName());
        resp.setQuantity(wr.getQuantity());
        resp.setQuantityUnit(wr.getQuantityUnit());
        resp.setWasteReason(wr.getWasteReason());
        resp.setDisposalMethod(wr.getDisposalMethod());
        resp.setNotes(wr.getNotes());
        resp.setRecordedAt(wr.getRecordedAt());
        return resp;
    }
}
