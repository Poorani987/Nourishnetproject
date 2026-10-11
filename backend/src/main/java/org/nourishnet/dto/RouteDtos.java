package org.nourishnet.dto;

import java.math.BigDecimal;
import java.util.List;

public class RouteDtos {

    public static class RouteSegment {
        private String fromNodeCode;
        private String fromNodeName;
        private String toNodeCode;
        private String toNodeName;
        private String roadName;
        private BigDecimal distanceKm;

        public RouteSegment() {}

        public RouteSegment(String fromNodeCode, String fromNodeName, String toNodeCode, String toNodeName,
                            String roadName, BigDecimal distanceKm) {
            this.fromNodeCode = fromNodeCode;
            this.fromNodeName = fromNodeName;
            this.toNodeCode = toNodeCode;
            this.toNodeName = toNodeName;
            this.roadName = roadName;
            this.distanceKm = distanceKm;
        }

        public String getFromNodeCode() { return fromNodeCode; }
        public void setFromNodeCode(String fromNodeCode) { this.fromNodeCode = fromNodeCode; }

        public String getFromNodeName() { return fromNodeName; }
        public void setFromNodeName(String fromNodeName) { this.fromNodeName = fromNodeName; }

        public String getToNodeCode() { return toNodeCode; }
        public void setToNodeCode(String toNodeCode) { this.toNodeCode = toNodeCode; }

        public String getToNodeName() { return toNodeName; }
        public void setToNodeName(String toNodeName) { this.toNodeName = toNodeName; }

        public String getRoadName() { return roadName; }
        public void setRoadName(String roadName) { this.roadName = roadName; }

        public BigDecimal getDistanceKm() { return distanceKm; }
        public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
    }

    public static class RouteResponse {
        private Long sourceNodeId;
        private Long targetNodeId;
        private String sourceName;
        private String targetName;
        private BigDecimal totalDistanceKm;
        private List<String> orderedNodeCodes;
        private List<String> orderedNodeNames;
        private List<RouteSegment> segments;
        private boolean reachable;
        private String disclaimer = "Illustrative sample road network — not live navigation.";

        public Long getSourceNodeId() { return sourceNodeId; }
        public void setSourceNodeId(Long sourceNodeId) { this.sourceNodeId = sourceNodeId; }

        public Long getTargetNodeId() { return targetNodeId; }
        public void setTargetNodeId(Long targetNodeId) { this.targetNodeId = targetNodeId; }

        public String getSourceName() { return sourceName; }
        public void setSourceName(String sourceName) { this.sourceName = sourceName; }

        public String getTargetName() { return targetName; }
        public void setTargetName(String targetName) { this.targetName = targetName; }

        public BigDecimal getTotalDistanceKm() { return totalDistanceKm; }
        public void setTotalDistanceKm(BigDecimal totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

        public List<String> getOrderedNodeCodes() { return orderedNodeCodes; }
        public void setOrderedNodeCodes(List<String> orderedNodeCodes) { this.orderedNodeCodes = orderedNodeCodes; }

        public List<String> getOrderedNodeNames() { return orderedNodeNames; }
        public void setOrderedNodeNames(List<String> orderedNodeNames) { this.orderedNodeNames = orderedNodeNames; }

        public List<RouteSegment> getSegments() { return segments; }
        public void setSegments(List<RouteSegment> segments) { this.segments = segments; }

        public boolean isReachable() { return reachable; }
        public void setReachable(boolean reachable) { this.reachable = reachable; }

        public String getDisclaimer() { return disclaimer; }
        public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    }
}
