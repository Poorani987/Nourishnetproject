package org.nourishnet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.nourishnet.dto.AuthRequests;
import org.nourishnet.dto.AuthResponse;
import org.nourishnet.entity.*;
import org.nourishnet.exception.ConflictException;
import org.nourishnet.repository.*;
import org.nourishnet.security.JwtTokenProvider;
import org.nourishnet.service.AuthService;
import org.nourishnet.service.NotificationService;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.nourishnet.model.UserRole;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private DonorProfileRepository donorProfileRepository;
    @Mock private RecipientProfileRepository recipientProfileRepository;
    @Mock private VolunteerProfileRepository volunteerProfileRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    private JwtTokenProvider tokenProvider;
    @Mock private NotificationService notificationService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970", 86400000L);
        authService = new AuthService(
                userRepository, donorProfileRepository, recipientProfileRepository,
                volunteerProfileRepository, vehicleRepository, passwordEncoder,
                tokenProvider, notificationService
        );
    }

    @Test
    @DisplayName("Successful Registration: Registers DONOR and generates token")
    void testSuccessfulDonorRegistration() {
        AuthRequests.RegisterRequest request = new AuthRequests.RegisterRequest();
        request.setFullName("Murugan P");
        request.setEmail("donor.test@nourishnet.org");
        request.setPassword("password123");
        request.setPhoneNumber("9842100001");
        request.setRole(Role.DONOR);
        request.setAddress("45 Brough Rd");
        request.setCity("Erode");
        request.setState("Tamil Nadu");
        request.setPincode("638001");
        request.setOrganizationName("Annapoorna Bhavan");
        request.setOrganizationType("RESTAURANT");

        when(userRepository.existsByEmail("donor.test@nourishnet.org")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(donorProfileRepository.save(any(DonorProfile.class))).thenAnswer(i -> {
            DonorProfile dp = i.getArgument(0);
            dp.setId(10L);
            return dp;
        });

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("donor.test@nourishnet.org", response.getEmail());
        assertEquals(Role.DONOR, response.getRole());
        assertEquals(1L, response.getId());
        verify(userRepository, times(1)).save(any(User.class));
        verify(donorProfileRepository, times(1)).save(any(DonorProfile.class));
    }

    @Test
    @DisplayName("Successful Registration: Registers RECIPIENT and generates token")
    void testSuccessfulRecipientRegistration() {
        AuthRequests.RegisterRequest request = new AuthRequests.RegisterRequest();
        request.setFullName("Anbu Illam");
        request.setEmail("recipient.test@nourishnet.org");
        request.setPassword("password123");
        request.setPhoneNumber("9842100002");
        request.setRole(Role.RECIPIENT);
        request.setAddress("12 Perundurai Rd");
        request.setCity("Erode");
        request.setState("Tamil Nadu");
        request.setPincode("638004");
        request.setOrganizationName("Karunai Orphanage");
        request.setOrganizationType("ORPHANAGE");

        when(userRepository.existsByEmail("recipient.test@nourishnet.org")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(2L);
            return u;
        });
        when(recipientProfileRepository.save(any(RecipientProfile.class))).thenAnswer(i -> {
            RecipientProfile rp = i.getArgument(0);
            rp.setId(20L);
            return rp;
        });

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("recipient.test@nourishnet.org", response.getEmail());
        assertEquals(Role.RECIPIENT, response.getRole());
        assertEquals(2L, response.getId());
        verify(recipientProfileRepository, times(1)).save(any(RecipientProfile.class));
    }

    @Test
    @DisplayName("Successful Registration: Registers VEHICLE_VOLUNTEER with Vehicle details")
    void testSuccessfulVehicleVolunteerRegistration() {
        AuthRequests.RegisterRequest request = new AuthRequests.RegisterRequest();
        request.setFullName("Karthik S");
        request.setEmail("volunteer.test@nourishnet.org");
        request.setPassword("password123");
        request.setPhoneNumber("9842100003");
        request.setRole(Role.VEHICLE_VOLUNTEER);
        request.setAddress("78 Gandhipuram");
        request.setCity("Erode");
        request.setState("Tamil Nadu");
        request.setPincode("638002");
        request.setVehicleType("MOTORCYCLE");
        request.setRegistrationNumber("TN 33 AB 1234");
        request.setCapacityValue(new BigDecimal("35.00"));
        request.setCapacityUnit("PORTIONS");
        request.setServiceRadiusKm(new BigDecimal("15.00"));

        when(userRepository.existsByEmail("volunteer.test@nourishnet.org")).thenReturn(false);
        when(vehicleRepository.existsByRegistrationNumber("TN 33 AB 1234")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(3L);
            return u;
        });
        when(volunteerProfileRepository.save(any(VolunteerProfile.class))).thenAnswer(i -> {
            VolunteerProfile vp = i.getArgument(0);
            vp.setId(30L);
            return vp;
        });
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(i -> {
            Vehicle v = i.getArgument(0);
            v.setId(50L);
            return v;
        });

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("volunteer.test@nourishnet.org", response.getEmail());
        assertEquals(Role.VEHICLE_VOLUNTEER, response.getRole());
        assertEquals(3L, response.getId());
        verify(volunteerProfileRepository, times(1)).save(any(VolunteerProfile.class));
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    @DisplayName("Duplicate Email Rejection: Throws ConflictException")
    void testDuplicateEmailRejection() {
        AuthRequests.RegisterRequest request = new AuthRequests.RegisterRequest();
        request.setEmail("duplicate@nourishnet.org");
        request.setPassword("password123");
        request.setRole(Role.DONOR);

        when(userRepository.existsByEmail("duplicate@nourishnet.org")).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () ->
                authService.register(request));

        assertTrue(ex.getMessage().contains("already registered"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Role Enum Tests: Validates exactly three roles and rejects ADMIN")
    void testRoleEnumValidation() {
        // Test Role enum values
        assertEquals(3, Role.values().length);
        assertEquals(Role.DONOR, Role.fromString("DONOR"));
        assertEquals(Role.RECIPIENT, Role.fromString("RECIPIENT"));
        assertEquals(Role.VEHICLE_VOLUNTEER, Role.fromString("VEHICLE_VOLUNTEER"));
        // Test legacy volunteer normalization
        assertEquals(Role.VEHICLE_VOLUNTEER, Role.fromString("VOLUNTEER"));

        // Reject ADMIN
        IllegalArgumentException adminEx = assertThrows(IllegalArgumentException.class, () ->
                Role.fromString("ADMIN"));
        assertTrue(adminEx.getMessage().contains("Accepted values are: [DONOR, RECIPIENT, VEHICLE_VOLUNTEER]"));

        // Reject invalid role
        assertThrows(IllegalArgumentException.class, () -> Role.fromString("SUPERUSER"));

        // Test com.nourishnet.model.UserRole
        assertEquals(3, UserRole.values().length);
        assertEquals(UserRole.DONOR, UserRole.fromString("DONOR"));
        assertEquals(UserRole.RECIPIENT, UserRole.fromString("RECIPIENT"));
        assertEquals(UserRole.VEHICLE_VOLUNTEER, UserRole.fromString("VEHICLE_VOLUNTEER"));
        assertEquals(UserRole.VEHICLE_VOLUNTEER, UserRole.fromString("VOLUNTEER"));
        assertThrows(IllegalArgumentException.class, () -> UserRole.fromString("ADMIN"));
    }
}
