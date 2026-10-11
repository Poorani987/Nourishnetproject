package org.nourishnet.service;

import org.nourishnet.dto.RouteDtos;
import org.nourishnet.entity.RoadEdge;
import org.nourishnet.entity.RoadNode;
import org.nourishnet.exception.ResourceNotFoundException;
import org.nourishnet.repository.RoadEdgeRepository;
import org.nourishnet.repository.RoadNodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class DijkstraService {

    private final RoadNodeRepository nodeRepository;
    private final RoadEdgeRepository edgeRepository;

    public DijkstraService(RoadNodeRepository nodeRepository, RoadEdgeRepository edgeRepository) {
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }

    public static class DirectedEdge {
        public final Long targetId;
        public final BigDecimal distance;
        public final String roadName;

        public DirectedEdge(Long targetId, BigDecimal distance, String roadName) {
            this.targetId = targetId;
            this.distance = distance;
            this.roadName = roadName;
        }
    }

    private static class PathNode implements Comparable<PathNode> {
        public final Long nodeId;
        public final BigDecimal dist;

        public PathNode(Long nodeId, BigDecimal dist) {
            this.nodeId = nodeId;
            this.dist = dist;
        }

        @Override
        public int compareTo(PathNode o) {
            return this.dist.compareTo(o.dist);
        }
    }

    @Transactional(readOnly = true)
    public RouteDtos.RouteResponse calculateShortestPath(Long sourceId, Long targetId) {
        RoadNode source = nodeRepository.findById(sourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Source road junction not found with ID: " + sourceId));
        RoadNode target = nodeRepository.findById(targetId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination road junction not found with ID: " + targetId));

        RouteDtos.RouteResponse response = new RouteDtos.RouteResponse();
        response.setSourceNodeId(sourceId);
        response.setTargetNodeId(targetId);
        response.setSourceName(source.getNodeName() + " (" + source.getAreaName() + ")");
        response.setTargetName(target.getNodeName() + " (" + target.getAreaName() + ")");

        if (sourceId.equals(targetId)) {
            response.setTotalDistanceKm(BigDecimal.ZERO);
            response.setOrderedNodeCodes(Collections.singletonList(source.getNodeCode()));
            response.setOrderedNodeNames(Collections.singletonList(source.getNodeName()));
            response.setSegments(Collections.emptyList());
            response.setReachable(true);
            return response;
        }

        // Build adjacency graph from DB edges
        List<RoadEdge> allEdges = edgeRepository.findAll();
        Map<Long, List<DirectedEdge>> graph = new HashMap<>();

        for (RoadEdge e : allEdges) {
            graph.computeIfAbsent(e.getSourceNode().getId(), k -> new ArrayList<>())
                    .add(new DirectedEdge(e.getTargetNode().getId(), e.getDistanceKm(), e.getRoadName()));

            if (Boolean.TRUE.equals(e.getIsBidirectional())) {
                graph.computeIfAbsent(e.getTargetNode().getId(), k -> new ArrayList<>())
                        .add(new DirectedEdge(e.getSourceNode().getId(), e.getDistanceKm(), e.getRoadName()));
            }
        }

        // Dijkstra's algorithm using priority queue
        Map<Long, BigDecimal> distances = new HashMap<>();
        Map<Long, Long> previousNodes = new HashMap<>();
        Map<Long, DirectedEdge> edgeTaken = new HashMap<>();
        PriorityQueue<PathNode> pq = new PriorityQueue<>();

        distances.put(sourceId, BigDecimal.ZERO);
        pq.add(new PathNode(sourceId, BigDecimal.ZERO));

        while (!pq.isEmpty()) {
            PathNode current = pq.poll();
            Long u = current.nodeId;

            if (u.equals(targetId)) {
                break;
            }

            if (current.dist.compareTo(distances.getOrDefault(u, BigDecimal.valueOf(Double.MAX_VALUE))) > 0) {
                continue;
            }

            List<DirectedEdge> neighbors = graph.getOrDefault(u, Collections.emptyList());
            for (DirectedEdge edge : neighbors) {
                BigDecimal newDist = distances.get(u).add(edge.distance);
                BigDecimal existingDist = distances.getOrDefault(edge.targetId, BigDecimal.valueOf(Double.MAX_VALUE));

                if (newDist.compareTo(existingDist) < 0) {
                    distances.put(edge.targetId, newDist);
                    previousNodes.put(edge.targetId, u);
                    edgeTaken.put(edge.targetId, edge);
                    pq.add(new PathNode(edge.targetId, newDist));
                }
            }
        }

        if (!distances.containsKey(targetId)) {
            response.setReachable(false);
            response.setTotalDistanceKm(BigDecimal.ZERO);
            response.setOrderedNodeCodes(Collections.emptyList());
            response.setOrderedNodeNames(Collections.emptyList());
            response.setSegments(Collections.emptyList());
            return response;
        }

        // Reconstruct path
        LinkedList<Long> pathNodeIds = new LinkedList<>();
        Long curr = targetId;
        while (curr != null) {
            pathNodeIds.addFirst(curr);
            curr = previousNodes.get(curr);
        }

        Map<Long, RoadNode> nodeLookup = new HashMap<>();
        for (RoadNode n : nodeRepository.findAllById(pathNodeIds)) {
            nodeLookup.put(n.getId(), n);
        }

        List<String> orderedCodes = new ArrayList<>();
        List<String> orderedNames = new ArrayList<>();
        List<RouteDtos.RouteSegment> segments = new ArrayList<>();

        for (int i = 0; i < pathNodeIds.size(); i++) {
            Long nid = pathNodeIds.get(i);
            RoadNode node = nodeLookup.get(nid);
            if (node != null) {
                orderedCodes.add(node.getNodeCode());
                orderedNames.add(node.getNodeName());
            }

            if (i > 0) {
                Long prevId = pathNodeIds.get(i - 1);
                RoadNode prevNode = nodeLookup.get(prevId);
                DirectedEdge edge = edgeTaken.get(nid);
                if (prevNode != null && node != null && edge != null) {
                    segments.add(new RouteDtos.RouteSegment(
                            prevNode.getNodeCode(),
                            prevNode.getNodeName(),
                            node.getNodeCode(),
                            node.getNodeName(),
                            edge.roadName,
                            edge.distance
                    ));
                }
            }
        }

        response.setReachable(true);
        response.setTotalDistanceKm(distances.get(targetId).setScale(2, RoundingMode.HALF_UP));
        response.setOrderedNodeCodes(orderedCodes);
        response.setOrderedNodeNames(orderedNames);
        response.setSegments(segments);
        return response;
    }

    @Transactional(readOnly = true)
    public List<RoadNode> getAllNodes() {
        return nodeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<RoadEdge> getAllEdges() {
        return edgeRepository.findAll();
    }
}
