package org.nourishnet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.nourishnet.dto.DeliveryDtos;
import org.nourishnet.entity.*;
import org.nourishnet.exception.BadRequestException;
import org.nourishnet.exception.ConflictException;
import org.nourishnet.repository.*;
import org.nourishnet.service.NotificationService;
import org.nourishnet.service.VolunteerService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VolunteerServiceTest {

    @Mock private DeliveryRepository deliveryRepository;
    @Mock private DeliveryAssignmentRepository assignmentRepository;
    @Mock private VolunteerProfileRepository volunteerProfileRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private UserRepository userRepository;
    @Mock private VolunteerRewardRepository rewardRepository;
    @Mock private NotificationService notificationService;

    private VolunteerService volunteerService;

    private User volunteerUser;
    private VolunteerProfile volunteerProfile;
    private Vehicle vehicle;
    private Delivery delivery;
    private FoodAllocation allocation;
    private FoodDonation donation;
    private DonorProfile donorProfile;
    private RecipientProfile recipientProfile;

    @BeforeEach
    void setUp() {
        volunteerService = new VolunteerService(
                deliveryRepository, assignmentRepository, volunteerProfileRepository,
                vehicleRepository, userRepository, rewardRepository, notificationService
        );

        volunteerUser = new User("Ramesh Kumar", "volunteer@nourishnet.org", "hash", "9842100000",
                Role.VEHICLE_VOLUNTEER, "Street 1", "Erode", "Tamil Nadu", "638001", null, null);
        volunteerUser.setId(18L);

        volunteerProfile = new VolunteerProfile(volunteerUser, true, new BigDecimal("15.00"), "Erode");
        volunteerProfile.setId(1L);

        vehicle = new Vehicle(volunteerProfile, "MOTORCYCLE", "TN33 AB 1204", new BigDecimal("30.00"), "KG");
        vehicle.setId(1L);

        donorProfile = new DonorProfile(new User(), "Donor Org", "RESTAURANT", null, "Contact", null, null);
        recipientProfile = new RecipientProfile(new User(), "Recipient Org", "ORPHANAGE", "Contact", 50, null, null, null, null);

        donation = new FoodDonation();
        donation.setId(1L);
        donation.setDonorProfile(donorProfile);
        donation.setFoodName("Vegetable Meals");

        allocation = new FoodAllocation(donation, recipientProfile, new BigDecimal("20.00"), new BigDecimal("20.00"),
                "KG", new BigDecimal("5.00"), TransportResponsibility.DONOR_OR_VOLUNTEER, AllocationStatus.CONFIRMED);
        allocation.setId(1L);

        delivery = new Delivery(allocation, DeliveryStatus.PENDING, new BigDecimal("5.00"),
                TransportResponsibility.DONOR_OR_VOLUNTEER, "Pickup", "Delivery", LocalDateTime.now().plusHours(3));
        delivery.setId(10L);
    }

    @Test
    @DisplayName("Valid Volunteer Acceptance: Volunteer claims eligible pending delivery")
    void testAcceptDeliverySuccess() {
        when(userRepository.findByEmail("volunteer@nourishnet.org")).thenReturn(Optional.of(volunteerUser));
        when(volunteerProfileRepository.findByUserId(18L)).thenReturn(Optional.of(volunteerProfile));
        when(deliveryRepository.findById(10L)).thenReturn(Optional.of(delivery));
        when(assignmentRepository.existsByDeliveryId(10L)).thenReturn(false);
        when(vehicleRepository.findByVolunteerProfileId(1L)).thenReturn(Optional.of(vehicle));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(i -> i.getArgument(0));
        when(assignmentRepository.save(any(DeliveryAssignment.class))).thenAnswer(i -> i.getArgument(0));

        DeliveryDtos.DeliveryResponse response = volunteerService.acceptDelivery(10L, "volunteer@nourishnet.org");

        assertNotNull(response);
        assertEquals(DeliveryStatus.ASSIGNED, delivery.getStatus());
        verify(assignmentRepository, times(1)).save(any(DeliveryAssignment.class));
    }

    @Test
    @DisplayName("Capacity Restriction: Rejects acceptance if food load exceeds vehicle capacity")
    void testCapacityRestrictionRejection() {
        // Vehicle capacity is 30.00 KG, but allocation is 50.00 KG!
        allocation.setAllocatedQuantity(new BigDecimal("50.00"));

        when(userRepository.findByEmail("volunteer@nourishnet.org")).thenReturn(Optional.of(volunteerUser));
        when(volunteerProfileRepository.findByUserId(18L)).thenReturn(Optional.of(volunteerProfile));
        when(deliveryRepository.findById(10L)).thenReturn(Optional.of(delivery));
        when(assignmentRepository.existsByDeliveryId(10L)).thenReturn(false);
        when(vehicleRepository.findByVolunteerProfileId(1L)).thenReturn(Optional.of(vehicle));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                volunteerService.acceptDelivery(10L, "volunteer@nourishnet.org"));

        assertTrue(ex.getMessage().contains("exceeds your registered vehicle capacity"));
    }

    @Test
    @DisplayName("Availability Restriction: Rejects acceptance when volunteer is unavailable")
    void testUnavailableVolunteerRejection() {
        volunteerProfile.setIsAvailable(false);

        when(userRepository.findByEmail("volunteer@nourishnet.org")).thenReturn(Optional.of(volunteerUser));
        when(volunteerProfileRepository.findByUserId(18L)).thenReturn(Optional.of(volunteerProfile));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                volunteerService.acceptDelivery(10L, "volunteer@nourishnet.org"));

        assertTrue(ex.getMessage().contains("availability to active"));
    }

    @Test
    @DisplayName("Duplicate Acceptance Prevention: Rejects acceptance if delivery already assigned")
    void testDuplicateAcceptanceRejection() {
        delivery.setStatus(DeliveryStatus.ASSIGNED);

        when(userRepository.findByEmail("volunteer@nourishnet.org")).thenReturn(Optional.of(volunteerUser));
        when(volunteerProfileRepository.findByUserId(18L)).thenReturn(Optional.of(volunteerProfile));
        when(deliveryRepository.findById(10L)).thenReturn(Optional.of(delivery));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                volunteerService.acceptDelivery(10L, "volunteer@nourishnet.org"));

        assertTrue(ex.getMessage().contains("no longer available"));
    }
}
