package org.nourishnet.service;

import org.nourishnet.dto.AuthRequests;
import org.nourishnet.dto.AuthResponse;
import org.nourishnet.entity.*;
import org.nourishnet.exception.BadRequestException;
import org.nourishnet.exception.ConflictException;
import org.nourishnet.exception.ResourceNotFoundException;
import org.nourishnet.repository.*;
import org.nourishnet.security.JwtTokenProvider;
import org.nourishnet.security.UserDetailsImpl;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DonorProfileRepository donorProfileRepository;
    private final RecipientProfileRepository recipientProfileRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       DonorProfileRepository donorProfileRepository,
                       RecipientProfileRepository recipientProfileRepository,
                       VolunteerProfileRepository volunteerProfileRepository,
                       VehicleRepository vehicleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.donorProfileRepository = donorProfileRepository;
        this.recipientProfileRepository = recipientProfileRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.vehicleRepository = vehicleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.notificationService = notificationService;
    }

    @Transactional
    public AuthResponse register(AuthRequests.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email address is already registered: " + request.getEmail());
        }

        if (request.getRole() == null) {
            throw new BadRequestException("A valid role (DONOR, RECIPIENT, VEHICLE_VOLUNTEER) is required");
        }

        User user = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhoneNumber(),
                request.getRole(),
                request.getAddress(),
                request.getCity(),
                request.getState(),
                request.getPincode(),
                request.getLatitude(),
                request.getLongitude()
        );
        user = userRepository.save(user);

        Map<String, Object> profileDetails = new HashMap<>();

        switch (request.getRole()) {
            case DONOR:
                DonorProfile donor = new DonorProfile(
                        user,
                        request.getOrganizationName() != null ? request.getOrganizationName() : request.getFullName(),
                        request.getOrganizationType() != null ? request.getOrganizationType() : "RESTAURANT",
                        request.getFssaiLicense(),
                        request.getContactPerson() != null ? request.getContactPerson() : request.getFullName(),
                        request.getPickupInstructions(),
                        request.getOperatingHours()
                );
                donor = donorProfileRepository.save(donor);
                profileDetails.put("donorProfileId", donor.getId());
                profileDetails.put("organizationName", donor.getOrganizationName());
                break;

            case RECIPIENT:
                RecipientProfile recipient = new RecipientProfile(
                        user,
                        request.getOrganizationName() != null ? request.getOrganizationName() : request.getFullName(),
                        request.getOrganizationType() != null ? request.getOrganizationType() : "COMMUNITY_CENTER",
                        request.getContactPerson() != null ? request.getContactPerson() : request.getFullName(),
                        request.getBeneficiaryCount() != null ? request.getBeneficiaryCount() : 50,
                        request.getDietaryPreferences(),
                        request.getRequiredFoodCategories(),
                        request.getAllergenRestrictions(),
                        request.getDeliveryInstructions()
                );
                recipient = recipientProfileRepository.save(recipient);
                profileDetails.put("recipientProfileId", recipient.getId());
                profileDetails.put("organizationName", recipient.getOrganizationName());
                profileDetails.put("beneficiaryCount", recipient.getBeneficiaryCount());
                break;

            case VEHICLE_VOLUNTEER:
                if (request.getRegistrationNumber() != null && vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
                    throw new ConflictException("Vehicle registration number is already registered: " + request.getRegistrationNumber());
                }

                VolunteerProfile volunteer = new VolunteerProfile(
                        user,
                        true,
                        request.getServiceRadiusKm() != null ? request.getServiceRadiusKm() : new BigDecimal("15.00"),
                        request.getPreferredLocation() != null ? request.getPreferredLocation() : request.getCity()
                );
                volunteer = volunteerProfileRepository.save(volunteer);

                Vehicle vehicle = new Vehicle(
                        volunteer,
                        request.getVehicleType() != null ? request.getVehicleType() : "MOTORCYCLE",
                        request.getRegistrationNumber() != null ? request.getRegistrationNumber() : "TEMP-" + System.currentTimeMillis(),
                        request.getCapacityValue() != null ? request.getCapacityValue() : new BigDecimal("30.00"),
                        request.getCapacityUnit() != null ? request.getCapacityUnit() : "KG"
                );
                vehicle = vehicleRepository.save(vehicle);

                profileDetails.put("volunteerProfileId", volunteer.getId());
                profileDetails.put("vehicleType", vehicle.getVehicleType());
                profileDetails.put("registrationNumber", vehicle.getRegistrationNumber());
                profileDetails.put("capacityValue", vehicle.getCapacityValue());
                profileDetails.put("capacityUnit", vehicle.getCapacityUnit());
                profileDetails.put("serviceRadiusKm", volunteer.getServiceRadiusKm());
                break;
        }

        // Send welcome in-app notification
        notificationService.createNotification(
                user,
                "Welcome to NourishNet!",
                "Your account as " + user.getRole() + " has been successfully created. Thank you for contributing to zero food waste.",
                "WELCOME",
                "USER",
                user.getId()
        );

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String token = tokenProvider.generateToken(userDetails);

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getAddress(),
                user.getCity(),
                user.getState(),
                user.getPincode(),
                user.getLatitude(),
                user.getLongitude(),
                profileDetails
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequests.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        Map<String, Object> profileDetails = getProfileDetailsForUser(user);

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String token = tokenProvider.generateToken(userDetails);

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getAddress(),
                user.getCity(),
                user.getState(),
                user.getPincode(),
                user.getLatitude(),
                user.getLongitude(),
                profileDetails
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Map<String, Object> profileDetails = getProfileDetailsForUser(user);
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String token = tokenProvider.generateToken(userDetails);

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getAddress(),
                user.getCity(),
                user.getState(),
                user.getPincode(),
                user.getLatitude(),
                user.getLongitude(),
                profileDetails
        );
    }

    @Transactional
    public void changePassword(String email, AuthRequests.ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        notificationService.createNotification(
                user,
                "Password Changed",
                "Your account password was successfully updated.",
                "SECURITY_ALERT",
                "USER",
                user.getId()
        );
    }

    private Map<String, Object> getProfileDetailsForUser(User user) {
        Map<String, Object> profileDetails = new HashMap<>();
        switch (user.getRole()) {
            case DONOR:
                donorProfileRepository.findByUserId(user.getId()).ifPresent(dp -> {
                    profileDetails.put("donorProfileId", dp.getId());
                    profileDetails.put("organizationName", dp.getOrganizationName());
                    profileDetails.put("organizationType", dp.getOrganizationType());
                    profileDetails.put("fssaiLicense", dp.getFssaiLicense());
                    profileDetails.put("contactPerson", dp.getContactPerson());
                    profileDetails.put("operatingHours", dp.getOperatingHours());
                });
                break;
            case RECIPIENT:
                recipientProfileRepository.findByUserId(user.getId()).ifPresent(rp -> {
                    profileDetails.put("recipientProfileId", rp.getId());
                    profileDetails.put("organizationName", rp.getOrganizationName());
                    profileDetails.put("organizationType", rp.getOrganizationType());
                    profileDetails.put("contactPerson", rp.getContactPerson());
                    profileDetails.put("beneficiaryCount", rp.getBeneficiaryCount());
                    profileDetails.put("dietaryPreferences", rp.getDietaryPreferences());
                });
                break;
            case VEHICLE_VOLUNTEER:
                volunteerProfileRepository.findByUserId(user.getId()).ifPresent(vp -> {
                    profileDetails.put("volunteerProfileId", vp.getId());
                    profileDetails.put("isAvailable", vp.getIsAvailable());
                    profileDetails.put("serviceRadiusKm", vp.getServiceRadiusKm());
                    profileDetails.put("totalPoints", vp.getTotalPoints());
                    profileDetails.put("completedDeliveriesCount", vp.getCompletedDeliveriesCount());
                    vehicleRepository.findByVolunteerProfileId(vp.getId()).ifPresent(veh -> {
                        profileDetails.put("vehicleType", veh.getVehicleType());
                        profileDetails.put("registrationNumber", veh.getRegistrationNumber());
                        profileDetails.put("capacityValue", veh.getCapacityValue());
                        profileDetails.put("capacityUnit", veh.getCapacityUnit());
                    });
                });
                break;
        }
        return profileDetails;
    }
}
