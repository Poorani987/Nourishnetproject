package org.nourishnet.controller;

import jakarta.validation.Valid;
import org.nourishnet.dto.DeliveryDtos;
import org.nourishnet.entity.Vehicle;
import org.nourishnet.entity.VolunteerReward;
import org.nourishnet.service.VolunteerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/volunteers")
public class VolunteerController {

    private final VolunteerService volunteerService;

    public VolunteerController(VolunteerService volunteerService) {
        this.volunteerService = volunteerService;
    }

    @GetMapping("/deliveries/available")
    @PreAuthorize("hasRole('VEHICLE_VOLUNTEER')")
    public ResponseEntity<List<DeliveryDtos.DeliveryResponse>> getAvailableDeliveries(Authentication authentication) {
        return ResponseEntity.ok(volunteerService.getAvailableDeliveries(authentication.getName()));
    }

    @PostMapping("/deliveries/{id}/accept")
    @PreAuthorize("hasRole('VEHICLE_VOLUNTEER')")
    public ResponseEntity<DeliveryDtos.DeliveryResponse> acceptDelivery(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(volunteerService.acceptDelivery(id, authentication.getName()));
    }

    @GetMapping("/deliveries/my")
    @PreAuthorize("hasRole('VEHICLE_VOLUNTEER')")
    public ResponseEntity<List<DeliveryDtos.DeliveryResponse>> getMyAssignments(Authentication authentication) {
        return ResponseEntity.ok(volunteerService.getMyAssignments(authentication.getName()));
    }

    @PutMapping("/deliveries/{id}/status")
    @PreAuthorize("hasRole('VEHICLE_VOLUNTEER')")
    public ResponseEntity<DeliveryDtos.DeliveryResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryDtos.DeliveryStatusUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(volunteerService.updateDeliveryStatus(id, request.getStatus(), request.getNotes(), authentication.getName()));
    }

    @PutMapping("/availability")
    @PreAuthorize("hasRole('VEHICLE_VOLUNTEER')")
    public ResponseEntity<Map<String, Boolean>> toggleAvailability(Authentication authentication) {
        boolean newState = volunteerService.toggleAvailability(authentication.getName());
        return ResponseEntity.ok(Map.of("isAvailable", newState));
    }

    @GetMapping("/vehicle")
    @PreAuthorize("hasRole('VEHICLE_VOLUNTEER')")
    public ResponseEntity<Vehicle> getVehicle(Authentication authentication) {
        return ResponseEntity.ok(volunteerService.getMyVehicle(authentication.getName()));
    }

    @PutMapping("/vehicle")
    @PreAuthorize("hasRole('VEHICLE_VOLUNTEER')")
    public ResponseEntity<Vehicle> updateVehicle(@RequestBody Vehicle vehicle, Authentication authentication) {
        return ResponseEntity.ok(volunteerService.updateMyVehicle(vehicle, authentication.getName()));
    }

    @GetMapping("/rewards")
    @PreAuthorize("hasRole('VEHICLE_VOLUNTEER')")
    public ResponseEntity<List<VolunteerReward>> getRewards(Authentication authentication) {
        return ResponseEntity.ok(volunteerService.getMyRewards(authentication.getName()));
    }
}
