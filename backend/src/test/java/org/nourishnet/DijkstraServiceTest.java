package org.nourishnet;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.nourishnet.dto.RouteDtos;
import org.nourishnet.entity.RoadEdge;
import org.nourishnet.entity.RoadNode;
import org.nourishnet.exception.ResourceNotFoundException;
import org.nourishnet.repository.RoadEdgeRepository;
import org.nourishnet.repository.RoadNodeRepository;
import org.nourishnet.service.DijkstraService;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DijkstraServiceTest {

    @Mock
    private RoadNodeRepository nodeRepository;

    @Mock
    private RoadEdgeRepository edgeRepository;

    private DijkstraService dijkstraService;

    private RoadNode nodeA;
    private RoadNode nodeB;
    private RoadNode nodeC;
    private RoadNode nodeD;
    private RoadNode nodeIsolated;

    @BeforeEach
    void setUp() {
        dijkstraService = new DijkstraService(nodeRepository, edgeRepository);

        nodeA = new RoadNode("NODE_A", "Erode Junction", "Erode", new BigDecimal("11.34"), new BigDecimal("77.72"));
        nodeA.setId(1L);

        nodeB = new RoadNode("NODE_B", "Thindal", "Thindal", new BigDecimal("11.33"), new BigDecimal("77.68"));
        nodeB.setId(2L);

        nodeC = new RoadNode("NODE_C", "Chithode", "Chithode", new BigDecimal("11.41"), new BigDecimal("77.67"));
        nodeC.setId(3L);

        nodeD = new RoadNode("NODE_D", "Perundurai", "Perundurai", new BigDecimal("11.28"), new BigDecimal("77.58"));
        nodeD.setId(4L);

        nodeIsolated = new RoadNode("NODE_ISO", "Isolated Hills", "Outer", new BigDecimal("11.55"), new BigDecimal("77.85"));
        nodeIsolated.setId(99L);
    }

    @Test
    @DisplayName("Direct Route: Correct single edge distance calculated")
    void testDirectRoute() {
        RoadEdge edgeAB = new RoadEdge(nodeA, nodeB, "EVN Road", new BigDecimal("5.00"), true);
        edgeAB.setId(101L);

        when(nodeRepository.findById(1L)).thenReturn(Optional.of(nodeA));
        when(nodeRepository.findById(2L)).thenReturn(Optional.of(nodeB));
        when(edgeRepository.findAll()).thenReturn(List.of(edgeAB));
        when(nodeRepository.findAllById(Arrays.asList(1L, 2L))).thenReturn(Arrays.asList(nodeA, nodeB));

        RouteDtos.RouteResponse response = dijkstraService.calculateShortestPath(1L, 2L);

        assertTrue(response.isReachable());
        assertEquals(new BigDecimal("5.00"), response.getTotalDistanceKm());
        assertEquals(2, response.getOrderedNodeCodes().size());
        assertEquals("NODE_A", response.getOrderedNodeCodes().get(0));
        assertEquals("NODE_B", response.getOrderedNodeCodes().get(1));
    }

    @Test
    @DisplayName("Multi-Hop Route: Accumulates distance correctly across nodes")
    void testMultiHopRoute() {
        RoadEdge edgeAB = new RoadEdge(nodeA, nodeB, "EVN Road", new BigDecimal("5.00"), true);
        RoadEdge edgeBD = new RoadEdge(nodeB, nodeD, "Perundurai Highway", new BigDecimal("8.50"), true);

        when(nodeRepository.findById(1L)).thenReturn(Optional.of(nodeA));
        when(nodeRepository.findById(4L)).thenReturn(Optional.of(nodeD));
        when(edgeRepository.findAll()).thenReturn(Arrays.asList(edgeAB, edgeBD));
        when(nodeRepository.findAllById(Arrays.asList(1L, 2L, 4L))).thenReturn(Arrays.asList(nodeA, nodeB, nodeD));

        RouteDtos.RouteResponse response = dijkstraService.calculateShortestPath(1L, 4L);

        assertTrue(response.isReachable());
        assertEquals(new BigDecimal("13.50"), response.getTotalDistanceKm());
        assertEquals(3, response.getOrderedNodeCodes().size());
        assertEquals(List.of("NODE_A", "NODE_B", "NODE_D"), response.getOrderedNodeCodes());
    }

    @Test
    @DisplayName("Alternative Routes: Selects minimal road distance over longer alternative")
    void testAlternativeRoutesShortestSelection() {
        // Path 1: A -> B -> D: 5.00 + 8.50 = 13.50 km
        RoadEdge edgeAB = new RoadEdge(nodeA, nodeB, "Way 1-A", new BigDecimal("5.00"), true);
        RoadEdge edgeBD = new RoadEdge(nodeB, nodeD, "Way 1-B", new BigDecimal("8.50"), true);

        // Path 2: A -> C -> D: 4.00 + 7.00 = 11.00 km (Shorter!)
        RoadEdge edgeAC = new RoadEdge(nodeA, nodeC, "Way 2-A", new BigDecimal("4.00"), true);
        RoadEdge edgeCD = new RoadEdge(nodeC, nodeD, "Way 2-B", new BigDecimal("7.00"), true);

        when(nodeRepository.findById(1L)).thenReturn(Optional.of(nodeA));
        when(nodeRepository.findById(4L)).thenReturn(Optional.of(nodeD));
        when(edgeRepository.findAll()).thenReturn(Arrays.asList(edgeAB, edgeBD, edgeAC, edgeCD));
        when(nodeRepository.findAllById(Arrays.asList(1L, 3L, 4L))).thenReturn(Arrays.asList(nodeA, nodeC, nodeD));

        RouteDtos.RouteResponse response = dijkstraService.calculateShortestPath(1L, 4L);

        assertTrue(response.isReachable());
        assertEquals(new BigDecimal("11.00"), response.getTotalDistanceKm());
        assertEquals(List.of("NODE_A", "NODE_C", "NODE_D"), response.getOrderedNodeCodes());
    }

    @Test
    @DisplayName("Unreachable Destination: Detects disconnected component")
    void testUnreachableDestination() {
        RoadEdge edgeAB = new RoadEdge(nodeA, nodeB, "EVN Road", new BigDecimal("5.00"), true);

        when(nodeRepository.findById(1L)).thenReturn(Optional.of(nodeA));
        when(nodeRepository.findById(99L)).thenReturn(Optional.of(nodeIsolated));
        when(edgeRepository.findAll()).thenReturn(List.of(edgeAB));

        RouteDtos.RouteResponse response = dijkstraService.calculateShortestPath(1L, 99L);

        assertFalse(response.isReachable());
        assertEquals(BigDecimal.ZERO, response.getTotalDistanceKm());
        assertTrue(response.getOrderedNodeCodes().isEmpty());
    }

    @Test
    @DisplayName("Invalid Node ID: Throws ResourceNotFoundException")
    void testInvalidNodeThrowsException() {
        when(nodeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> dijkstraService.calculateShortestPath(999L, 1L));
    }
}
