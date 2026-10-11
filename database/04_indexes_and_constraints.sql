-- ============================================================================
-- NourishNet: Smart Food Redistribution and Waste Management System
-- Performance Indexes and Supplementary Constraints
-- File: 04_indexes_and_constraints.sql
-- ============================================================================

USE nourishnet;

-- ----------------------------------------------------------------------------
-- Performance Indexes for High-Frequency Queries
-- ----------------------------------------------------------------------------

-- Optimizes food discovery and expiry checks:
CREATE INDEX idx_food_donations_status_consume 
    ON food_donations (status, consume_before);

CREATE INDEX idx_food_donations_category 
    ON food_donations (food_category);

CREATE INDEX idx_food_donations_donor 
    ON food_donations (donor_profile_id);

-- Optimizes recipient allocation lookups:
CREATE INDEX idx_food_allocations_recipient 
    ON food_allocations (recipient_profile_id, status);

CREATE INDEX idx_food_allocations_donation 
    ON food_allocations (donation_id);

-- Optimizes delivery matching and lifecycle queries:
CREATE INDEX idx_deliveries_status_deadline 
    ON deliveries (status, delivery_deadline);

-- Optimizes volunteer assignment lookups:
CREATE INDEX idx_delivery_assignments_volunteer 
    ON delivery_assignments (volunteer_profile_id);

-- Optimizes unread notification queries and badge counts:
CREATE INDEX idx_notifications_user_unread 
    ON notifications (user_id, is_read);

-- Optimizes road graph lookups for Dijkstra algorithm:
CREATE INDEX idx_road_edges_source_target 
    ON road_edges (source_node_id, target_node_id);

-- Optimizes volunteer availability and proximity queries:
CREATE INDEX idx_volunteer_available_radius 
    ON volunteer_profiles (is_available, service_radius_km);

-- Optimizes waste auditing:
CREATE INDEX idx_waste_records_donation 
    ON waste_records (donation_id);

-- ----------------------------------------------------------------------------
-- Verification Query
-- ----------------------------------------------------------------------------
SELECT 
    TABLE_NAME, 
    INDEX_NAME, 
    COLUMN_NAME, 
    NON_UNIQUE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'nourishnet'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
