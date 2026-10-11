package org.nourishnet.controller;

import org.nourishnet.dto.RouteDtos;
import org.nourishnet.entity.RoadEdge;
import org.nourishnet.entity.RoadNode;
import org.nourishnet.service.DijkstraService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final DijkstraService dijkstraService;

    public RouteController(DijkstraService dijkstraService) {
        this.dijkstraService = dijkstraService;
    }

    @GetMapping("/nodes")
    public ResponseEntity<List<RoadNode>> getNodes() {
        return ResponseEntity.ok(dijkstraService.getAllNodes());
    }

    @GetMapping("/edges")
    public ResponseEntity<List<RoadEdge>> getEdges() {
        return ResponseEntity.ok(dijkstraService.getAllEdges());
    }

    @GetMapping("/calculate")
    public ResponseEntity<RouteDtos.RouteResponse> calculateRoute(
            @RequestParam(value = "source", required = false) Long source,
            @RequestParam(value = "sourceNodeId", required = false) Long sourceNodeId,
            @RequestParam(value = "target", required = false) Long target,
            @RequestParam(value = "targetNodeId", required = false) Long targetNodeId,
            @RequestParam(value = "destination", required = false) Long destination) {
        Long finalSource = source != null ? source : sourceNodeId;
        Long finalTarget = target != null ? target : (destination != null ? destination : targetNodeId);
        if (finalSource == null || finalTarget == null) {
            throw new IllegalArgumentException("Both source and destination/target IDs are required.");
        }
        return ResponseEntity.ok(dijkstraService.calculateShortestPath(finalSource, finalTarget));
    }
}
