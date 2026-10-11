package org.nourishnet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.nourishnet.entity.*;
import org.nourishnet.exception.BadRequestException;
import org.nourishnet.repository.*;
import org.nourishnet.service.NotificationService;
import org.nourishnet.service.OtpService;
import org.nourishnet.service.OtpServiceImpl;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock private OtpVerificationRepository otpRepository;
    @Mock private DeliveryRepository deliveryRepository;
    @Mock private DeliveryAssignmentRepository assignmentRepository;
    @Mock private VolunteerProfileRepository volunteerProfileRepository;
    @Mock private VolunteerRewardRepository rewardRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private NotificationService notificationService;

    private OtpService otpService;

    private User volunteerUser;
    private VolunteerProfile volunteerProfile;
    private User recipientUser;
    private RecipientProfile recipientProfile;
    private User donorUser;
    private DonorProfile donorProfile;
    private FoodDonation donation;
    private FoodAllocation allocation;
    private Delivery delivery;
    private DeliveryAssignment assignment;
    private OtpVerification otpVerification;

    @BeforeEach
    void setUp() {
        otpService = new OtpServiceImpl(
                otpRepository, deliveryRepository, assignmentRepository,
                volunteerProfileRepository, rewardRepository, userRepository,
                passwordEncoder, notificationService
        );

        volunteerUser = new User("Ramesh Kumar", "volunteer@nourishnet.org", "hash", "9842100000",
                Role.VEHICLE_VOLUNTEER, "Street 1", "Erode", "Tamil Nadu", "638001", null, null);
        volunteerUser.setId(18L);

        volunteerProfile = new VolunteerProfile(volunteerUser, true, new BigDecimal("15.00"), "Erode");
        volunteerProfile.setId(1L);

        donorUser = new User("Murugan P", "donor@nourishnet.org", "hash", "9842100001",
                Role.DONOR, "Brough Rd", "Erode", "Tamil Nadu", "638001", null, null);
        donorUser.setId(1L);
        donorProfile = new DonorProfile(donorUser, "Annapoorna", "RESTAURANT", "FSSAI-123", "Murugan", null, null);
        donorProfile.setId(1L);

        recipientUser = new User("Sister Rosy", "recipient@nourishnet.org", "hash", "9842200001",
                Role.RECIPIENT, "Main Rd", "Erode", "Tamil Nadu", "638004", null, null);
        recipientUser.setId(11L);
        recipientProfile = new RecipientProfile(recipientUser, "Anbu Karangal", "ORPHANAGE", "Sister Rosy", 60, "ANY", null, null, null);
        recipientProfile.setId(1L);

        donation = new FoodDonation();
        donation.setId(1L);
        donation.setDonorProfile(donorProfile);
        donation.setFoodName("Sambar Rice");
        donation.setRemainingQuantity(BigDecimal.ZERO);
        donation.setStatus(DonationStatus.AVAILABLE);

        allocation = new FoodAllocation(donation, recipientProfile, new BigDecimal("50.00"), new BigDecimal("50.00"), "PORTIONS",
                new BigDecimal("4.00"), TransportResponsibility.DONOR_OR_VOLUNTEER, AllocationStatus.CONFIRMED);
        allocation.setId(1L);

        delivery = new Delivery(allocation, DeliveryStatus.IN_TRANSIT, new BigDecimal("4.00"),
                TransportResponsibility.DONOR_OR_VOLUNTEER, "Pickup", "Delivery", LocalDateTime.now().plusHours(3));
        delivery.setId(10L);

        assignment = new DeliveryAssignment(delivery, volunteerProfile, "Notes");
        assignment.setId(100L);

        otpVerification = new OtpVerification(delivery, recipientProfile, "hash123", "482910", LocalDateTime.now().plusHours(2));
        otpVerification.setId(200L);
    }

    @Test
    @DisplayName("Valid OTP Verification: Completes handover and awards 50 points")
    void testValidOtpVerification() {
        when(userRepository.findByEmail("volunteer@nourishnet.org")).thenReturn(Optional.of(volunteerUser));
        when(volunteerProfileRepository.findByUserId(18L)).thenReturn(Optional.of(volunteerProfile));
        when(deliveryRepository.findById(10L)).thenReturn(Optional.of(delivery));
        when(assignmentRepository.findByDeliveryId(10L)).thenReturn(Optional.of(assignment));
        when(otpRepository.findByDeliveryId(10L)).thenReturn(Optional.of(otpVerification));

        boolean result = otpService.verifyOtp(10L, "482910", "volunteer@nourishnet.org");

        assertTrue(result);
        assertTrue(otpVerification.getIsUsed());
        assertEquals(DeliveryStatus.DELIVERED, delivery.getStatus());
        assertEquals(AllocationStatus.DELIVERED, allocation.getStatus());
        assertEquals(50, volunteerProfile.getTotalPoints());
        assertEquals(1, volunteerProfile.getCompletedDeliveriesCount());
        verify(rewardRepository, times(1)).save(any(VolunteerReward.class));
    }

    @Test
    @DisplayName("Invalid OTP: Increments attempt count and throws BadRequestException")
    void testInvalidOtpRejection() {
        when(userRepository.findByEmail("volunteer@nourishnet.org")).thenReturn(Optional.of(volunteerUser));
        when(volunteerProfileRepository.findByUserId(18L)).thenReturn(Optional.of(volunteerProfile));
        when(deliveryRepository.findById(10L)).thenReturn(Optional.of(delivery));
        when(assignmentRepository.findByDeliveryId(10L)).thenReturn(Optional.of(assignment));
        when(otpRepository.findByDeliveryId(10L)).thenReturn(Optional.of(otpVerification));
        when(passwordEncoder.matches("000000", "hash123")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                otpService.verifyOtp(10L, "000000", "volunteer@nourishnet.org"));

        assertTrue(ex.getMessage().contains("Invalid OTP"));
        assertEquals(1, otpVerification.getAttemptCount());
        assertFalse(otpVerification.getIsUsed());
    }

    @Test
    @DisplayName("Expired OTP: Rejects handover attempt")
    void testExpiredOtpRejection() {
        otpVerification.setExpiresAt(LocalDateTime.now().minusMinutes(5));

        when(userRepository.findByEmail("volunteer@nourishnet.org")).thenReturn(Optional.of(volunteerUser));
        when(volunteerProfileRepository.findByUserId(18L)).thenReturn(Optional.of(volunteerProfile));
        when(deliveryRepository.findById(10L)).thenReturn(Optional.of(delivery));
        when(assignmentRepository.findByDeliveryId(10L)).thenReturn(Optional.of(assignment));
        when(otpRepository.findByDeliveryId(10L)).thenReturn(Optional.of(otpVerification));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                otpService.verifyOtp(10L, "482910", "volunteer@nourishnet.org"));

        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    @DisplayName("Repeated OTP Use: Rejects attempt when isUsed is already true")
    void testAlreadyUsedOtpRejection() {
        otpVerification.setIsUsed(true);

        when(userRepository.findByEmail("volunteer@nourishnet.org")).thenReturn(Optional.of(volunteerUser));
        when(volunteerProfileRepository.findByUserId(18L)).thenReturn(Optional.of(volunteerProfile));
        when(deliveryRepository.findById(10L)).thenReturn(Optional.of(delivery));
        when(assignmentRepository.findByDeliveryId(10L)).thenReturn(Optional.of(assignment));
        when(otpRepository.findByDeliveryId(10L)).thenReturn(Optional.of(otpVerification));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                otpService.verifyOtp(10L, "482910", "volunteer@nourishnet.org"));

        assertTrue(ex.getMessage().contains("already been verified"));
    }
}
