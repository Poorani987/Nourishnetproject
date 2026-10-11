package org.nourishnet.controller;

import jakarta.validation.Valid;
import org.nourishnet.dto.ImpactSummaryDto;
import org.nourishnet.dto.WasteDtos;
import org.nourishnet.service.ImpactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ImpactController {

    private final ImpactService impactService;

    public ImpactController(ImpactService impactService) {
        this.impactService = impactService;
    }

    @GetMapping("/impact/summary")
    public ResponseEntity<ImpactSummaryDto> getImpactSummary() {
        return ResponseEntity.ok(impactService.getImpactSummary());
    }

    @GetMapping("/waste/my")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<List<WasteDtos.WasteRecordResponse>> getMyWasteRecords(Authentication authentication) {
        return ResponseEntity.ok(impactService.getMyWasteRecords(authentication.getName()));
    }

    @PostMapping("/waste/record")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<WasteDtos.WasteRecordResponse> logWaste(
            @Valid @RequestBody WasteDtos.CreateWasteRecordRequest request,
            Authentication authentication) {
        WasteDtos.WasteRecordResponse response = impactService.logWaste(request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
