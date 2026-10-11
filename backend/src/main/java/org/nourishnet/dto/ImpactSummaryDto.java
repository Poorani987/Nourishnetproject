package org.nourishnet.dto;

import java.math.BigDecimal;

public class ImpactSummaryDto {
    private BigDecimal totalPortionsDonated;
    private BigDecimal totalPortionsAllocated;
    private BigDecimal totalPortionsDelivered;
    private BigDecimal totalPortionsWasted;
    private BigDecimal estimatedWastePrevented;
    private long totalDonationsCount;
    private long completedDeliveriesCount;
    private long activeVolunteersCount;
    private long activeRecipientsCount;

    public ImpactSummaryDto() {}

    public BigDecimal getTotalPortionsDonated() { return totalPortionsDonated; }
    public void setTotalPortionsDonated(BigDecimal totalPortionsDonated) { this.totalPortionsDonated = totalPortionsDonated; }

    public BigDecimal getTotalPortionsAllocated() { return totalPortionsAllocated; }
    public void setTotalPortionsAllocated(BigDecimal totalPortionsAllocated) { this.totalPortionsAllocated = totalPortionsAllocated; }

    public BigDecimal getTotalPortionsDelivered() { return totalPortionsDelivered; }
    public void setTotalPortionsDelivered(BigDecimal totalPortionsDelivered) { this.totalPortionsDelivered = totalPortionsDelivered; }

    public BigDecimal getTotalPortionsWasted() { return totalPortionsWasted; }
    public void setTotalPortionsWasted(BigDecimal totalPortionsWasted) { this.totalPortionsWasted = totalPortionsWasted; }

    public BigDecimal getEstimatedWastePrevented() { return estimatedWastePrevented; }
    public void setEstimatedWastePrevented(BigDecimal estimatedWastePrevented) { this.estimatedWastePrevented = estimatedWastePrevented; }

    public long getTotalDonationsCount() { return totalDonationsCount; }
    public void setTotalDonationsCount(long totalDonationsCount) { this.totalDonationsCount = totalDonationsCount; }

    public long getCompletedDeliveriesCount() { return completedDeliveriesCount; }
    public void setCompletedDeliveriesCount(long completedDeliveriesCount) { this.completedDeliveriesCount = completedDeliveriesCount; }

    public long getActiveVolunteersCount() { return activeVolunteersCount; }
    public void setActiveVolunteersCount(long activeVolunteersCount) { this.activeVolunteersCount = activeVolunteersCount; }

    public long getActiveRecipientsCount() { return activeRecipientsCount; }
    public void setActiveRecipientsCount(long activeRecipientsCount) { this.activeRecipientsCount = activeRecipientsCount; }
}
