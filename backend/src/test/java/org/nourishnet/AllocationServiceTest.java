package org.nourishnet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.nourishnet.dto.AllocationDtos;
import org.nourishnet.entity.*;
import org.nourishnet.exception.BadRequestException;
import org.nourishnet.repository.*;
import org.nourishnet.service.AllocationService;
import org.nourishnet.service.NotificationService;
import org.nourishnet.service.OtpService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AllocationServiceTest {

    @Mock private FoodDonationRepository donationRepository;
    @Mock private FoodAllocationRepository allocationRepository;
    @Mock private RecipientProfileRepository recipientProfileRepository;
    @Mock private DeliveryRepository deliveryRepository;
    @Mock private UserRepository userRepository;
    @Mock private OtpService otpService;
    @Mock private NotificationService notificationService;

    private AllocationService allocationService;

    private User recipientUser;
    private RecipientProfile recipientProfile;
    private User donorUser;
    private DonorProfile donorProfile;
    private FoodDonation donation;

    @BeforeEach
    void setUp() {
        allocationService = new AllocationService(
                donationRepository, allocationRepository, recipientProfileRepository,
                deliveryRepository, userRepository, otpService, notificationService
        );

        recipientUser = new User("Sister Rosy", "recipient@nourishnet.org", "hash", "9842200001",
                Role.RECIPIENT, "Main Rd", "Erode", "Tamil Nadu", "638004", null, null);
        recipientUser.setId(11L);
        recipientProfile = new RecipientProfile(recipientUser, "Anbu Karangal", "ORPHANAGE", "Sister Rosy", 60, "ANY", null, null, null);
        recipientProfile.setId(1L);

        donorUser = new User("Murugan P", "donor@nourishnet.org", "hash", "9842100001",
                Role.DONOR, "Brough Rd", "Erode", "Tamil Nadu", "638001", null, null);
        donorUser.setId(1L);
        donorProfile = new DonorProfile(donorUser, "Annapoorna", "RESTAURANT", "FSSAI-123", "Murugan", null, null);
        donorProfile.setId(1L);

        donation = new FoodDonation();
        donation.setId(1L);
        donation.setDonorProfile(donorProfile);
        donation.setFoodName("Sambar Rice & Poriyal");
        donation.setTotalQuantity(new BigDecimal("100.00"));
        donation.setAllocatedQuantity(BigDecimal.ZERO);
        donation.setRemainingQuantity(new BigDecimal("100.00"));
        donation.setQuantityUnit("PORTIONS");
        donation.setPreparationTime(LocalDateTime.now().minusHours(2));
        donation.setConsumeBefore(LocalDateTime.now().plusHours(4));
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setPickupAddress("45 Brough Rd");
    }

    @Test
    @DisplayName("Partial Allocation: Requests 40 portions out of 100, leaving 60")
    void testPartialAllocation() {
        AllocationDtos.CreateAllocationRequest request = new AllocationDtos.CreateAllocationRequest();
        request.setDonationId(1L);
        request.setRequestedQuantity(new BigDecimal("40.00"));
        request.setDistanceKm(new BigDecimal("8.50")); // <= 15km

        when(userRepository.findByEmail("recipient@nourishnet.org")).thenReturn(Optional.of(recipientUser));
        when(recipientProfileRepository.findByUserId(11L)).thenReturn(Optional.of(recipientProfile));
        when(donationRepository.findById(1L)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any(FoodDonation.class))).thenAnswer(i -> i.getArgument(0));
        when(allocationRepository.save(any(FoodAllocation.class))).thenAnswer(i -> {
            FoodAllocation a = i.getArgument(0);
            a.setId(50L);
            return a;
        });
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(i -> {
            Delivery d = i.getArgument(0);
            d.setId(60L);
            return d;
        });

        AllocationDtos.AllocationResponse response = allocationService.requestAllocation(request, "recipient@nourishnet.org");

        assertNotNull(response);
        assertEquals(new BigDecimal("40.00"), response.getAllocatedQuantity());
        assertEquals(new BigDecimal("60.00"), donation.getRemainingQuantity());
        assertEquals(new BigDecimal("40.00"), donation.getAllocatedQuantity());
        assertEquals(DonationStatus.PARTIALLY_ALLOCATED, donation.getStatus());
        assertEquals(TransportResponsibility.DONOR_OR_VOLUNTEER, response.getTransportResponsibility());
    }

    @Test
    @DisplayName("Full Allocation: Requests remaining portions, marks FULLY_ALLOCATED")
    void testFullAllocation() {
        AllocationDtos.CreateAllocationRequest request = new AllocationDtos.CreateAllocationRequest();
        request.setDonationId(1L);
        request.setRequestedQuantity(new BigDecimal("100.00"));
        request.setDistanceKm(new BigDecimal("22.00")); // > 15km

        when(userRepository.findByEmail("recipient@nourishnet.org")).thenReturn(Optional.of(recipientUser));
        when(recipientProfileRepository.findByUserId(11L)).thenReturn(Optional.of(recipientProfile));
        when(donationRepository.findById(1L)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any(FoodDonation.class))).thenAnswer(i -> i.getArgument(0));
        when(allocationRepository.save(any(FoodAllocation.class))).thenAnswer(i -> {
            FoodAllocation a = i.getArgument(0);
            a.setId(51L);
            return a;
        });
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(i -> {
            Delivery d = i.getArgument(0);
            d.setId(61L);
            return d;
        });

        AllocationDtos.AllocationResponse response = allocationService.requestAllocation(request, "recipient@nourishnet.org");

        assertEquals(new BigDecimal("0.00"), donation.getRemainingQuantity());
        assertEquals(DonationStatus.FULLY_ALLOCATED, donation.getStatus());
        assertEquals(TransportResponsibility.RECIPIENT_OR_VOLUNTEER, response.getTransportResponsibility());
    }

    @Test
    @DisplayName("Over-Allocation Prevention: Rejects request exceeding remaining balance")
    void testOverAllocationRejection() {
        AllocationDtos.CreateAllocationRequest request = new AllocationDtos.CreateAllocationRequest();
        request.setDonationId(1L);
        request.setRequestedQuantity(new BigDecimal("120.00")); // only 100 available!

        when(userRepository.findByEmail("recipient@nourishnet.org")).thenReturn(Optional.of(recipientUser));
        when(recipientProfileRepository.findByUserId(11L)).thenReturn(Optional.of(recipientProfile));
        when(donationRepository.findById(1L)).thenReturn(Optional.of(donation));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                allocationService.requestAllocation(request, "recipient@nourishnet.org"));

        assertTrue(ex.getMessage().contains("exceeds remaining available quantity"));
    }

    @Test
    @DisplayName("Expired Food Rejection: Rejects claims when consume-before deadline is in the past")
    void testExpiredFoodRejection() {
        donation.setConsumeBefore(LocalDateTime.now().minusMinutes(10));

        AllocationDtos.CreateAllocationRequest request = new AllocationDtos.CreateAllocationRequest();
        request.setDonationId(1L);
        request.setRequestedQuantity(new BigDecimal("10.00"));

        when(userRepository.findByEmail("recipient@nourishnet.org")).thenReturn(Optional.of(recipientUser));
        when(recipientProfileRepository.findByUserId(11L)).thenReturn(Optional.of(recipientProfile));
        when(donationRepository.findById(1L)).thenReturn(Optional.of(donation));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                allocationService.requestAllocation(request, "recipient@nourishnet.org"));

        assertTrue(ex.getMessage().contains("expired"));
        assertEquals(DonationStatus.EXPIRED, donation.getStatus());
    }
}
