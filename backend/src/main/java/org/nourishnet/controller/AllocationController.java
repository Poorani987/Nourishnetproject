package org.nourishnet.controller;

import jakarta.validation.Valid;
import org.nourishnet.dto.AllocationDtos;
import org.nourishnet.service.AllocationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allocations")
public class AllocationController {

    private final AllocationService allocationService;

    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @PostMapping("/request")
    @PreAuthorize("hasRole('RECIPIENT')")
    public ResponseEntity<AllocationDtos.AllocationResponse> requestAllocation(
            @Valid @RequestBody AllocationDtos.CreateAllocationRequest request,
            Authentication authentication) {
        AllocationDtos.AllocationResponse response = allocationService.requestAllocation(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('RECIPIENT')")
    public ResponseEntity<List<AllocationDtos.AllocationResponse>> getMyAllocations(Authentication authentication) {
        return ResponseEntity.ok(allocationService.getMyAllocations(authentication.getName()));
    }

    @GetMapping("/donor")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<List<AllocationDtos.AllocationResponse>> getDonorAllocations(Authentication authentication) {
        return ResponseEntity.ok(allocationService.getDonorAllocations(authentication.getName()));
    }
}
