-- ============================================================================
-- NourishNet: Smart Food Redistribution and Waste Management System
-- Database Verification Queries for Review and Mentor Demonstration
-- File: 05_verification_queries.sql
-- ============================================================================

USE nourishnet;

-- ----------------------------------------------------------------------------
-- 1. Schema Overview: List all 15 relational tables in nourishnet
-- ----------------------------------------------------------------------------
SELECT 
    TABLE_NAME, 
    TABLE_ROWS, 
    DATA_LENGTH, 
    AUTO_INCREMENT, 
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'nourishnet'
ORDER BY TABLE_NAME;

-- ----------------------------------------------------------------------------
-- 2. User Overview: All users with their roles (Exactly 3 roles, NO ADMIN)
-- ----------------------------------------------------------------------------
SELECT 
    id, full_name, email, role, city, phone_number, created_at
FROM users
ORDER BY role, id;

-- ----------------------------------------------------------------------------
-- 3. Donors List: Organizations donating surplus food
-- ----------------------------------------------------------------------------
SELECT 
    dp.id AS donor_id,
    u.full_name,
    dp.organization_name,
    dp.organization_type,
    dp.fssai_license,
    u.city,
    u.phone_number
FROM donor_profiles dp
JOIN users u ON dp.user_id = u.id
ORDER BY dp.id;

-- ----------------------------------------------------------------------------
-- 4. Recipients List: Shelters, Orphanages, and Care Homes
-- ----------------------------------------------------------------------------
SELECT 
    rp.id AS recipient_id,
    u.full_name AS contact_person,
    rp.organization_name,
    rp.organization_type,
    rp.beneficiary_count,
    rp.dietary_preferences,
    u.city
FROM recipient_profiles rp
JOIN users u ON rp.user_id = u.id
ORDER BY rp.id;

-- ----------------------------------------------------------------------------
-- 5. Volunteers & Vehicles: Personal vehicles registered by volunteers
-- ----------------------------------------------------------------------------
SELECT 
    vp.id AS volunteer_id,
    u.full_name AS volunteer_name,
    v.vehicle_type,
    v.registration_number,
    v.capacity_value,
    v.capacity_unit,
    vp.service_radius_km,
    vp.is_available,
    vp.total_points
FROM volunteer_profiles vp
JOIN users u ON vp.user_id = u.id
JOIN vehicles v ON v.volunteer_profile_id = vp.id
ORDER BY vp.id;

-- ----------------------------------------------------------------------------
-- 6. Available Food Donations (Ready for recipients to claim)
-- ----------------------------------------------------------------------------
SELECT 
    fd.id,
    fd.food_name,
    fd.food_category,
    dp.organization_name AS donor,
    fd.remaining_quantity,
    fd.quantity_unit,
    fd.consume_before,
    TIMESTAMPDIFF(MINUTE, NOW(), fd.consume_before) AS minutes_remaining,
    fd.storage_requirements,
    fd.status
FROM food_donations fd
JOIN donor_profiles dp ON fd.donor_profile_id = dp.id
WHERE fd.status IN ('AVAILABLE', 'PARTIALLY_ALLOCATED')
  AND fd.consume_before > NOW()
ORDER BY fd.consume_before ASC;

-- ----------------------------------------------------------------------------
-- 7. Partially Allocated Food Donations (Remaining quantity calculation)
-- ----------------------------------------------------------------------------
SELECT 
    fd.id,
    fd.food_name,
    dp.organization_name,
    fd.total_quantity,
    fd.allocated_quantity,
    fd.remaining_quantity,
    fd.status
FROM food_donations fd
JOIN donor_profiles dp ON fd.donor_profile_id = dp.id
WHERE fd.status = 'PARTIALLY_ALLOCATED';

-- ----------------------------------------------------------------------------
-- 8. Allocations by Recipient with 15km Transport Responsibility
-- ----------------------------------------------------------------------------
SELECT 
    fa.id AS allocation_id,
    rp.organization_name AS recipient,
    fd.food_name,
    dp.organization_name AS donor,
    fa.allocated_quantity,
    fa.distance_km,
    fa.transport_responsibility,
    fa.status AS allocation_status
FROM food_allocations fa
JOIN recipient_profiles rp ON fa.recipient_profile_id = rp.id
JOIN food_donations fd ON fa.donation_id = fd.id
JOIN donor_profiles dp ON fd.donor_profile_id = dp.id
ORDER BY fa.id;

-- ----------------------------------------------------------------------------
-- 9. Active Deliveries and Assigned Volunteer Drivers
-- ----------------------------------------------------------------------------
SELECT 
    d.id AS delivery_id,
    d.status AS delivery_status,
    d.distance_km,
    d.transport_responsibility,
    u_vol.full_name AS assigned_volunteer,
    veh.vehicle_type,
    veh.registration_number,
    rp.organization_name AS recipient,
    d.delivery_deadline
FROM deliveries d
JOIN food_allocations fa ON d.allocation_id = fa.id
JOIN recipient_profiles rp ON fa.recipient_profile_id = rp.id
LEFT JOIN delivery_assignments da ON da.delivery_id = d.id
LEFT JOIN volunteer_profiles vp ON da.volunteer_profile_id = vp.id
LEFT JOIN users u_vol ON vp.user_id = u_vol.id
LEFT JOIN vehicles veh ON veh.volunteer_profile_id = vp.id
ORDER BY d.id;

-- ----------------------------------------------------------------------------
-- 10. Impact Metrics from Stored Relational Data
-- ----------------------------------------------------------------------------
SELECT 
    (SELECT COALESCE(SUM(total_quantity), 0) FROM food_donations) AS total_portions_donated,
    (SELECT COALESCE(SUM(allocated_quantity), 0) FROM food_allocations WHERE status != 'CANCELLED') AS total_portions_allocated,
    (SELECT COALESCE(SUM(allocated_quantity), 0) FROM food_allocations WHERE status = 'DELIVERED') AS total_portions_delivered,
    (SELECT COALESCE(SUM(quantity), 0) FROM waste_records) AS total_portions_wasted,
    (SELECT COUNT(*) FROM deliveries WHERE status = 'DELIVERED') AS completed_deliveries_count;

-- ----------------------------------------------------------------------------
-- 11. Expired or Unclaimed Food Auditing
-- ----------------------------------------------------------------------------
SELECT 
    fd.id,
    fd.food_name,
    dp.organization_name,
    fd.total_quantity,
    fd.remaining_quantity,
    fd.consume_before,
    fd.status,
    wr.waste_reason,
    wr.disposal_method
FROM food_donations fd
JOIN donor_profiles dp ON fd.donor_profile_id = dp.id
LEFT JOIN waste_records wr ON wr.donation_id = fd.id
WHERE fd.status = 'EXPIRED' OR wr.id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 12. Volunteer Performance & Reward Leaderboard
-- ----------------------------------------------------------------------------
SELECT 
    vp.id AS volunteer_id,
    u.full_name AS volunteer_name,
    u.phone_number,
    v.vehicle_type,
    vp.completed_deliveries_count,
    vp.total_points,
    COUNT(vr.id) AS badges_earned
FROM volunteer_profiles vp
JOIN users u ON vp.user_id = u.id
JOIN vehicles v ON v.volunteer_profile_id = vp.id
LEFT JOIN volunteer_rewards vr ON vr.volunteer_profile_id = vp.id
GROUP BY vp.id, u.full_name, u.phone_number, v.vehicle_type, vp.completed_deliveries_count, vp.total_points
ORDER BY vp.total_points DESC;

-- ----------------------------------------------------------------------------
-- 13. Road Network Nodes and Connections for Dijkstra Verification
-- ----------------------------------------------------------------------------
SELECT 
    re.id,
    re.road_name,
    n1.node_name AS source_junction,
    n2.node_name AS target_junction,
    re.distance_km,
    re.is_bidirectional
FROM road_edges re
JOIN road_nodes n1 ON re.source_node_id = n1.id
JOIN road_nodes n2 ON re.target_node_id = n2.id
ORDER BY re.distance_km ASC;

-- ----------------------------------------------------------------------------
-- 14. Unread Notifications Count per User
-- ----------------------------------------------------------------------------
SELECT 
    u.id AS user_id,
    u.full_name,
    u.role,
    COUNT(n.id) AS unread_notifications
FROM users u
LEFT JOIN notifications n ON n.user_id = u.id AND n.is_read = FALSE
GROUP BY u.id, u.full_name, u.role
HAVING unread_notifications > 0
ORDER BY unread_notifications DESC;
