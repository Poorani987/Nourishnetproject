package org.nourishnet.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "road_edges")
public class RoadEdge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_node_id", nullable = false)
    private RoadNode sourceNode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_node_id", nullable = false)
    private RoadNode targetNode;

    @Column(name = "road_name", nullable = false, length = 100)
    private String roadName;

    @Column(name = "distance_km", nullable = false, precision = 6, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "is_bidirectional", nullable = false)
    private Boolean isBidirectional = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public RoadEdge() {}

    public RoadEdge(RoadNode sourceNode, RoadNode targetNode, String roadName, BigDecimal distanceKm, Boolean isBidirectional) {
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;
        this.roadName = roadName;
        this.distanceKm = distanceKm;
        this.isBidirectional = isBidirectional != null ? isBidirectional : true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RoadNode getSourceNode() { return sourceNode; }
    public void setSourceNode(RoadNode sourceNode) { this.sourceNode = sourceNode; }

    public RoadNode getTargetNode() { return targetNode; }
    public void setTargetNode(RoadNode targetNode) { this.targetNode = targetNode; }

    public String getRoadName() { return roadName; }
    public void setRoadName(String roadName) { this.roadName = roadName; }

    public BigDecimal getDistanceKm() { return distanceKm; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }

    public Boolean getIsBidirectional() { return isBidirectional; }
    public void setIsBidirectional(Boolean isBidirectional) { this.isBidirectional = isBidirectional; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
