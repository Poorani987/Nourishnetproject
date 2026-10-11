package org.nourishnet.service;

import org.nourishnet.dto.OtpDtos;
import org.nourishnet.entity.*;
import org.nourishnet.exception.BadRequestException;
import org.nourishnet.exception.ForbiddenException;
import org.nourishnet.exception.ResourceNotFoundException;
import org.nourishnet.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpServiceImpl implements OtpService {

    private final OtpVerificationRepository otpRepository;
    private final DeliveryRepository deliveryRepository;
    private final DeliveryAssignmentRepository assignmentRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final VolunteerRewardRepository rewardRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpServiceImpl(OtpVerificationRepository otpRepository,
                          DeliveryRepository deliveryRepository,
                          DeliveryAssignmentRepository assignmentRepository,
                          VolunteerProfileRepository volunteerProfileRepository,
                          VolunteerRewardRepository rewardRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          NotificationService notificationService) {
        this.otpRepository = otpRepository;
        this.deliveryRepository = deliveryRepository;
        this.assignmentRepository = assignmentRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.rewardRepository = rewardRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public OtpVerification generateOtpForDelivery(Delivery delivery, RecipientProfile recipient) {
        int codeInt = 100000 + secureRandom.nextInt(900000);
        String code = String.valueOf(codeInt);

        OtpVerification otp = new OtpVerification(
                delivery,
                recipient,
                passwordEncoder.encode(code),
                code,
                delivery.getDeliveryDeadline() != null ? delivery.getDeliveryDeadline() : LocalDateTime.now().plusHours(4)
        );

        otp = otpRepository.save(otp);

        notificationService.createNotification(
                recipient.getUser(),
                "Delivery Handover OTP",
                "Your delivery verification OTP is: " + code + ". Please provide this code to the volunteer upon receiving your food.",
                "OTP_GENERATED",
                "DELIVERY",
                delivery.getId()
        );

        return otp;
    }

    @Override
    @Transactional(readOnly = true)
    public OtpDtos.OtpResponse getOtpForRecipient(Long deliveryId, String recipientEmail) {
        User user = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with ID: " + deliveryId));

        if (!delivery.getAllocation().getRecipientProfile().getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You are not authorized to view the OTP for this delivery");
        }

        OtpVerification otp = otpRepository.findByDeliveryId(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("No OTP verification record found for this delivery"));

        return new OtpDtos.OtpResponse(
                deliveryId,
                otp.getPlainOtpForRecipient(),
                otp.getExpiresAt(),
                Boolean.TRUE.equals(otp.getIsUsed()),
                otp.getMaxAttempts() - otp.getAttemptCount()
        );
    }

    @Override
    @Transactional
    public boolean verifyOtp(Long deliveryId, String submittedOtp, String volunteerEmail) {
        User user = userRepository.findByEmail(volunteerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        VolunteerProfile volunteer = volunteerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ForbiddenException("Volunteer profile not found"));

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with ID: " + deliveryId));

        DeliveryAssignment assignment = assignmentRepository.findByDeliveryId(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("No volunteer is assigned to this delivery"));

        if (!assignment.getVolunteerProfile().getId().equals(volunteer.getId())) {
            throw new ForbiddenException("You are not the assigned volunteer for this delivery");
        }

        OtpVerification otp = otpRepository.findByDeliveryId(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("No OTP verification record found for this delivery"));

        if (Boolean.TRUE.equals(otp.getIsUsed())) {
            throw new BadRequestException("This OTP has already been verified and consumed");
        }

        LocalDateTime now = LocalDateTime.now();
        if (otp.getExpiresAt().isBefore(now)) {
            throw new BadRequestException("This delivery OTP has expired. Please contact support or request re-issue.");
        }

        if (otp.getAttemptCount() >= otp.getMaxAttempts()) {
            throw new BadRequestException("Maximum OTP verification attempts (" + otp.getMaxAttempts() + ") exceeded. Delivery handover locked.");
        }

        otp.setAttemptCount(otp.getAttemptCount() + 1);

        boolean matches = submittedOtp.equals(otp.getPlainOtpForRecipient())
                || passwordEncoder.matches(submittedOtp, otp.getOtpCodeHash());

        if (!matches) {
            otpRepository.save(otp);
            int remaining = otp.getMaxAttempts() - otp.getAttemptCount();
            throw new BadRequestException("Invalid OTP code submitted. " + remaining + " attempts remaining.");
        }

        otp.setIsUsed(true);
        otp.setVerifiedAt(now);
        otpRepository.save(otp);

        delivery.setStatus(DeliveryStatus.DELIVERED);
        deliveryRepository.save(delivery);

        assignment.setDeliveredAt(now);
        assignmentRepository.save(assignment);

        FoodAllocation allocation = delivery.getAllocation();
        allocation.setStatus(AllocationStatus.DELIVERED);

        FoodDonation donation = allocation.getDonation();
        if (donation.getRemainingQuantity().compareTo(java.math.BigDecimal.ZERO) == 0) {
            donation.setStatus(DonationStatus.DELIVERED);
        }

        int pointsToAward = 50;
        volunteer.setTotalPoints(volunteer.getTotalPoints() + pointsToAward);
        volunteer.setCompletedDeliveriesCount(volunteer.getCompletedDeliveriesCount() + 1);
        volunteerProfileRepository.save(volunteer);

        String badge = null;
        if (volunteer.getCompletedDeliveriesCount() == 1) {
            badge = "FIRST_MILE_HERO";
        } else if (volunteer.getCompletedDeliveriesCount() == 5) {
            badge = "COMMUNITY_CHAMPION";
        } else if (volunteer.getCompletedDeliveriesCount() == 10) {
            badge = "DISTRIBUTION_TITAN";
        }

        VolunteerReward reward = new VolunteerReward(volunteer, pointsToAward, "DELIVERY_COMPLETED", badge);
        rewardRepository.save(reward);

        notificationService.createNotification(
                allocation.getRecipientProfile().getUser(),
                "Food Delivery Verified & Completed",
                "Your food delivery #" + delivery.getId() + " has been successfully verified and completed via OTP.",
                "HANDOVER_COMPLETED",
                "DELIVERY",
                delivery.getId()
        );

        notificationService.createNotification(
                donation.getDonorProfile().getUser(),
                "Food Donation Successfully Delivered",
                "Donation #" + donation.getId() + " portions were safely delivered to " +
                        allocation.getRecipientProfile().getOrganizationName() + ".",
                "DELIVERY_DELIVERED",
                "FOOD_DONATION",
                donation.getId()
        );

        notificationService.createNotification(
                user,
                "Delivery Verified! Points Credited",
                "You successfully completed delivery #" + delivery.getId() + "! +50 volunteer points credited." +
                        (badge != null ? " You earned the badge: " + badge + "!" : ""),
                "POINTS_EARNED",
                "VOLUNTEER_REWARD",
                reward.getId()
        );

        return true;
    }
}
