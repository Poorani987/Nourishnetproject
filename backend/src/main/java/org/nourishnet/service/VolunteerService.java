package org.nourishnet.service;

import org.nourishnet.dto.DeliveryDtos;
import org.nourishnet.entity.*;
import org.nourishnet.exception.BadRequestException;
import org.nourishnet.exception.ConflictException;
import org.nourishnet.exception.ForbiddenException;
import org.nourishnet.exception.ResourceNotFoundException;
import org.nourishnet.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VolunteerService {

    private final DeliveryRepository deliveryRepository;
    private final DeliveryAssignmentRepository assignmentRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final VolunteerRewardRepository rewardRepository;
    private final NotificationService notificationService;

    public VolunteerService(DeliveryRepository deliveryRepository,
                            DeliveryAssignmentRepository assignmentRepository,
                            VolunteerProfileRepository volunteerProfileRepository,
                            VehicleRepository vehicleRepository,
                            UserRepository userRepository,
                            VolunteerRewardRepository rewardRepository,
                            NotificationService notificationService) {
        this.deliveryRepository = deliveryRepository;
        this.assignmentRepository = assignmentRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.rewardRepository = rewardRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<DeliveryDtos.DeliveryResponse> getAvailableDeliveries(String volunteerEmail) {
        User user = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        VolunteerProfile volunteer = volunteerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Volunteer profile not found"));

        if (!Boolean.TRUE.equals(volunteer.getIsAvailable())) {
            return List.of();
        }

        Vehicle vehicle = vehicleRepository.findByVolunteerProfileId(volunteer.getId()).orElse(null);

        LocalDateTime now = LocalDateTime.now();
        List<Delivery> pendingDeliveries = deliveryRepository.findByStatus(DeliveryStatus.PENDING);

        return pendingDeliveries.stream()
                .filter(d -> d.getDeliveryDeadline().isAfter(now))
                .filter(d -> d.getDistanceKm().compareTo(volunteer.getServiceRadiusKm()) <= 0)
                .filter(d -> {
                    if (vehicle == null) return true;
                    // Vehicle capacity check: portions or weight
                    return vehicle.getCapacityValue().compareTo(d.getAllocation().getAllocatedQuantity()) >= 0;
                })
                .map(d -> mapToResponse(d, null, null))
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryDtos.DeliveryResponse acceptDelivery(Long deliveryId, String volunteerEmail) {
        User user = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        VolunteerProfile volunteer = volunteerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Only registered volunteers can accept deliveries"));

        if (!Boolean.TRUE.equals(volunteer.getIsAvailable())) {
            throw new BadRequestException("You must toggle your availability to active before accepting deliveries");
        }

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with ID: " + deliveryId));

        if (delivery.getStatus() != DeliveryStatus.PENDING) {
            throw new ConflictException("Delivery is no longer available. Status is already " + delivery.getStatus());
        }

        if (assignmentRepository.existsByDeliveryId(deliveryId)) {
            throw new ConflictException("Another volunteer has already accepted this delivery");
        }

        Vehicle vehicle = vehicleRepository.findByVolunteerProfileId(volunteer.getId()).orElse(null);
        if (vehicle != null && vehicle.getCapacityValue().compareTo(delivery.getAllocation().getAllocatedQuantity()) < 0) {
            throw new BadRequestException("This load (" + delivery.getAllocation().getAllocatedQuantity() +
                    ") exceeds your registered vehicle capacity (" + vehicle.getCapacityValue() + " " + vehicle.getCapacityUnit() + ")");
        }

        // Lock & update delivery
        delivery.setStatus(DeliveryStatus.ASSIGNED);
        delivery = deliveryRepository.save(delivery);

        DeliveryAssignment assignment = new DeliveryAssignment(
                delivery,
                volunteer,
                "Accepted voluntarily via app by " + user.getFullName()
        );
        assignment = assignmentRepository.save(assignment);

        // Notify recipient & donor
        notificationService.createNotification(
                delivery.getAllocation().getRecipientProfile().getUser(),
                "Volunteer Assigned to Your Delivery",
                user.getFullName() + " has accepted to transport your food delivery #" + delivery.getId() +
                        ". Vehicle: " + (vehicle != null ? vehicle.getVehicleType() + " (" + vehicle.getRegistrationNumber() + ")" : "Registered vehicle"),
                "VOLUNTEER_ASSIGNED",
                "DELIVERY",
                delivery.getId()
        );

        notificationService.createNotification(
                delivery.getAllocation().getDonation().getDonorProfile().getUser(),
                "Volunteer En Route for Pickup",
                "Volunteer " + user.getFullName() + " has accepted delivery #" + delivery.getId() +
                        " for food item '" + delivery.getAllocation().getDonation().getFoodName() + "'.",
                "VOLUNTEER_ASSIGNED",
                "DELIVERY",
                delivery.getId()
        );

        return mapToResponse(delivery, assignment, vehicle);
    }

    @Transactional(readOnly = true)
    public List<DeliveryDtos.DeliveryResponse> getMyAssignments(String volunteerEmail) {
        User user = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        VolunteerProfile volunteer = volunteerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Volunteer profile not found"));
        Vehicle vehicle = vehicleRepository.findByVolunteerProfileId(volunteer.getId()).orElse(null);

        List<DeliveryAssignment> assignments = assignmentRepository.findByVolunteerProfileIdOrderByAssignedAtDesc(volunteer.getId());
        return assignments.stream()
                .map(a -> mapToResponse(a.getDelivery(), a, vehicle))
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryDtos.DeliveryResponse updateDeliveryStatus(Long deliveryId, DeliveryStatus newStatus, String notes, String volunteerEmail) {
        User user = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        VolunteerProfile volunteer = volunteerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Volunteer profile not found"));

        DeliveryAssignment assignment = assignmentRepository.findByDeliveryId(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found for delivery #" + deliveryId));

        if (!assignment.getVolunteerProfile().getId().equals(volunteer.getId())) {
            throw new ForbiddenException("You are not authorized to update this delivery assignment");
        }

        Delivery delivery = assignment.getDelivery();

        if (newStatus == DeliveryStatus.DELIVERED) {
            throw new BadRequestException("Completion of delivery requires recipient OTP handover verification via the OTP endpoint");
        }

        // Validate allowed state machine transitions
        if (newStatus == DeliveryStatus.PICKED_UP) {
            if (delivery.getStatus() != DeliveryStatus.ASSIGNED) {
                throw new BadRequestException("Cannot transition to PICKED_UP from " + delivery.getStatus());
            }
            assignment.setPickedUpAt(LocalDateTime.now());
            delivery.setStatus(DeliveryStatus.PICKED_UP);
            delivery.getAllocation().getDonation().setStatus(DonationStatus.PICKED_UP);

            notificationService.createNotification(
                    delivery.getAllocation().getRecipientProfile().getUser(),
                    "Food Picked Up",
                    "Volunteer " + user.getFullName() + " has picked up your food from the donor. Handover will occur soon.",
                    "FOOD_PICKED_UP",
                    "DELIVERY",
                    delivery.getId()
            );
        } else if (newStatus == DeliveryStatus.IN_TRANSIT) {
            if (delivery.getStatus() != DeliveryStatus.PICKED_UP && delivery.getStatus() != DeliveryStatus.ASSIGNED) {
                throw new BadRequestException("Cannot transition to IN_TRANSIT from " + delivery.getStatus());
            }
            delivery.setStatus(DeliveryStatus.IN_TRANSIT);

            notificationService.createNotification(
                    delivery.getAllocation().getRecipientProfile().getUser(),
                    "Delivery in Transit",
                    "Volunteer " + user.getFullName() + " is now in transit towards your location.",
                    "IN_TRANSIT",
                    "DELIVERY",
                    delivery.getId()
            );
        } else if (newStatus == DeliveryStatus.CANCELLED) {
            delivery.setStatus(DeliveryStatus.CANCELLED);
        } else {
            throw new BadRequestException("Unsupported status transition: " + newStatus);
        }

        if (notes != null && !notes.isBlank()) {
            assignment.setNotes(notes);
        }

        delivery = deliveryRepository.save(delivery);
        assignment = assignmentRepository.save(assignment);
        Vehicle vehicle = vehicleRepository.findByVolunteerProfileId(volunteer.getId()).orElse(null);

        return mapToResponse(delivery, assignment, vehicle);
    }

    @Transactional
    public boolean toggleAvailability(String volunteerEmail) {
        User user = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        VolunteerProfile volunteer = volunteerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Volunteer profile not found"));

        boolean newState = !Boolean.TRUE.equals(volunteer.getIsAvailable());
        volunteer.setIsAvailable(newState);
        volunteerProfileRepository.save(volunteer);
        return newState;
    }

    @Transactional(readOnly = true)
    public Vehicle getMyVehicle(String volunteerEmail) {
        User user = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        VolunteerProfile volunteer = volunteerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Volunteer profile not found"));
        return vehicleRepository.findByVolunteerProfileId(volunteer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No vehicle registered for this volunteer"));
    }

    @Transactional
    public Vehicle updateMyVehicle(Vehicle updated, String volunteerEmail) {
        User user = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        VolunteerProfile volunteer = volunteerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Volunteer profile not found"));
        Vehicle vehicle = vehicleRepository.findByVolunteerProfileId(volunteer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No vehicle registered for this volunteer"));

        vehicle.setVehicleType(updated.getVehicleType());
        vehicle.setCapacityValue(updated.getCapacityValue());
        vehicle.setCapacityUnit(updated.getCapacityUnit());
        vehicle.setIsActive(updated.getIsActive());

        return vehicleRepository.save(vehicle);
    }

    @Transactional(readOnly = true)
    public List<VolunteerReward> getMyRewards(String volunteerEmail) {
        User user = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        VolunteerProfile volunteer = volunteerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Volunteer profile not found"));
        return rewardRepository.findByVolunteerProfileIdOrderByAwardedAtDesc(volunteer.getId());
    }

    public DeliveryDtos.DeliveryResponse mapToResponse(Delivery delivery, DeliveryAssignment assignment, Vehicle vehicle) {
        DeliveryDtos.DeliveryResponse resp = new DeliveryDtos.DeliveryResponse();
        resp.setId(delivery.getId());
        resp.setAllocationId(delivery.getAllocation().getId());
        resp.setStatus(delivery.getStatus());
        resp.setDistanceKm(delivery.getDistanceKm());
        resp.setTransportResponsibility(delivery.getTransportResponsibility());
        resp.setPickupAddress(delivery.getPickupAddress());
        resp.setDeliveryAddress(delivery.getDeliveryAddress());
        resp.setDeliveryDeadline(delivery.getDeliveryDeadline());

        FoodDonation don = delivery.getAllocation().getDonation();
        resp.setFoodName(don.getFoodName());
        resp.setFoodCategory(don.getFoodCategory());
        resp.setAllocatedQuantity(delivery.getAllocation().getAllocatedQuantity());
        resp.setQuantityUnit(delivery.getAllocation().getQuantityUnit());
        resp.setDonorOrganizationName(don.getDonorProfile().getOrganizationName());
        resp.setDonorPhone(don.getDonorProfile().getUser().getPhoneNumber());

        RecipientProfile rec = delivery.getAllocation().getRecipientProfile();
        resp.setRecipientOrganizationName(rec.getOrganizationName());
        resp.setRecipientContactPerson(rec.getContactPerson());
        resp.setRecipientPhone(rec.getUser().getPhoneNumber());

        if (assignment != null) {
            resp.setAssignedVolunteerId(assignment.getVolunteerProfile().getId());
            resp.setAssignedVolunteerName(assignment.getVolunteerProfile().getUser().getFullName());
            resp.setVolunteerPhone(assignment.getVolunteerProfile().getUser().getPhoneNumber());
            resp.setAssignedAt(assignment.getAssignedAt());
            resp.setPickedUpAt(assignment.getPickedUpAt());
            resp.setDeliveredAt(assignment.getDeliveredAt());
            resp.setNotes(assignment.getNotes());
        }

        if (vehicle != null) {
            resp.setVehicleType(vehicle.getVehicleType());
            resp.setVehicleRegistration(vehicle.getRegistrationNumber());
        }

        return resp;
    }
}
