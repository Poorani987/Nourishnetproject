-- ============================================================================
-- NourishNet: Smart Food Redistribution and Waste Management System
-- Table Creation Script (InnoDB Relational Schema)
-- File: 02_create_tables.sql
-- ============================================================================

USE nourishnet_demo;

-- Disable foreign key checks during creation
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- Table 1: users
-- Core authentication and identity table.
-- Exactly 3 roles supported: DONOR, RECIPIENT, VEHICLE_VOLUNTEER.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role ENUM('DONOR', 'RECIPIENT', 'VEHICLE_VOLUNTEER') NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(80) NOT NULL,
    state VARCHAR(80) NOT NULL,
    pincode VARCHAR(15) NOT NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_email CHECK (email LIKE '%_@__%.__%')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 2: donor_profiles
-- Role-specific attributes for donors (Restaurants, Messes, Caterers, etc.).
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS donor_profiles;
CREATE TABLE donor_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    organization_name VARCHAR(150) NOT NULL,
    organization_type VARCHAR(80) NOT NULL,
    fssai_license VARCHAR(50) NULL,
    contact_person VARCHAR(100) NOT NULL,
    pickup_instructions TEXT NULL,
    operating_hours VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_donor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 3: recipient_profiles
-- Role-specific attributes for food recipients (Orphanages, Shelters, etc.).
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS recipient_profiles;
CREATE TABLE recipient_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    organization_name VARCHAR(150) NOT NULL,
    organization_type VARCHAR(80) NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    beneficiary_count INT NOT NULL DEFAULT 50,
    dietary_preferences VARCHAR(100) NULL,
    required_food_categories VARCHAR(255) NULL,
    allergen_restrictions VARCHAR(255) NULL,
    delivery_instructions TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_recipient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_beneficiary_count CHECK (beneficiary_count >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 4: volunteer_profiles
-- Role-specific attributes for unpaid vehicle volunteers.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS volunteer_profiles;
CREATE TABLE volunteer_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    service_radius_km DECIMAL(5, 2) NOT NULL DEFAULT 15.00,
    preferred_location VARCHAR(100) NULL,
    total_points INT NOT NULL DEFAULT 0,
    completed_deliveries_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_volunteer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_service_radius CHECK (service_radius_km > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 5: vehicles
-- Dedicated vehicle details managed voluntarily by the volunteer.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS vehicles;
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    volunteer_profile_id BIGINT NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    capacity_value DECIMAL(8, 2) NOT NULL,
    capacity_unit VARCHAR(20) NOT NULL DEFAULT 'KG',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_volunteer FOREIGN KEY (volunteer_profile_id) REFERENCES volunteer_profiles(id) ON DELETE CASCADE,
    CONSTRAINT chk_vehicle_capacity CHECK (capacity_value > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 6: food_donations
-- Food listings posted by donors with safe storage, preparation & expiry.
-- Includes version column for optimistic concurrency control.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS food_donations;
CREATE TABLE food_donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_profile_id BIGINT NOT NULL,
    food_name VARCHAR(150) NOT NULL,
    food_category VARCHAR(50) NOT NULL,
    food_type ENUM('VEGETARIAN', 'NON_VEGETARIAN') NOT NULL,
    state_type ENUM('COOKED', 'PACKAGED') NOT NULL,
    total_quantity DECIMAL(8, 2) NOT NULL,
    allocated_quantity DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    remaining_quantity DECIMAL(8, 2) NOT NULL,
    quantity_unit VARCHAR(20) NOT NULL DEFAULT 'PORTIONS',
    preparation_time DATETIME NOT NULL,
    consume_before DATETIME NOT NULL,
    storage_requirements VARCHAR(100) NULL,
    allergen_information VARCHAR(255) NULL,
    pickup_address VARCHAR(255) NOT NULL,
    pickup_latitude DECIMAL(10, 7) NULL,
    pickup_longitude DECIMAL(10, 7) NULL,
    pickup_window_start DATETIME NULL,
    pickup_window_end DATETIME NULL,
    status ENUM('AVAILABLE', 'PARTIALLY_ALLOCATED', 'FULLY_ALLOCATED', 'PICKED_UP', 'DELIVERED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'AVAILABLE',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_donation_donor FOREIGN KEY (donor_profile_id) REFERENCES donor_profiles(id) ON DELETE RESTRICT,
    CONSTRAINT chk_donation_qty CHECK (total_quantity > 0 AND remaining_quantity >= 0 AND allocated_quantity >= 0),
    CONSTRAINT chk_donation_times CHECK (consume_before > preparation_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 7: food_allocations
-- Request and allocation records created when recipients request quantities.
-- Supports partial allocation with atomic updates.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS food_allocations;
CREATE TABLE food_allocations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_id BIGINT NOT NULL,
    recipient_profile_id BIGINT NOT NULL,
    requested_quantity DECIMAL(8, 2) NOT NULL,
    allocated_quantity DECIMAL(8, 2) NOT NULL,
    quantity_unit VARCHAR(20) NOT NULL,
    distance_km DECIMAL(6, 2) NOT NULL DEFAULT 0.00,
    transport_responsibility ENUM('DONOR_OR_VOLUNTEER', 'RECIPIENT_OR_VOLUNTEER') NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_alloc_donation FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE RESTRICT,
    CONSTRAINT fk_alloc_recipient FOREIGN KEY (recipient_profile_id) REFERENCES recipient_profiles(id) ON DELETE RESTRICT,
    CONSTRAINT chk_alloc_qty CHECK (allocated_quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 8: deliveries
-- Delivery dispatch tracking corresponding to confirmed food allocations.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS deliveries;
CREATE TABLE deliveries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    allocation_id BIGINT NOT NULL UNIQUE,
    status ENUM('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    distance_km DECIMAL(6, 2) NOT NULL,
    transport_responsibility ENUM('DONOR_OR_VOLUNTEER', 'RECIPIENT_OR_VOLUNTEER') NOT NULL,
    pickup_address VARCHAR(255) NOT NULL,
    delivery_address VARCHAR(255) NOT NULL,
    delivery_deadline DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_delivery_allocation FOREIGN KEY (allocation_id) REFERENCES food_allocations(id) ON DELETE RESTRICT,
    CONSTRAINT chk_delivery_dist CHECK (distance_km >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 9: delivery_assignments
-- Volunteer assignment record linking an eligible delivery to a volunteer.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS delivery_assignments;
CREATE TABLE delivery_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    delivery_id BIGINT NOT NULL UNIQUE,
    volunteer_profile_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picked_up_at DATETIME NULL,
    delivered_at DATETIME NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assign_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE RESTRICT,
    CONSTRAINT fk_assign_volunteer FOREIGN KEY (volunteer_profile_id) REFERENCES volunteer_profiles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 10: road_nodes
-- Geographic road network junctions / nodes for Dijkstra shortest path calculation.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS road_nodes;
CREATE TABLE road_nodes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    node_code VARCHAR(30) NOT NULL UNIQUE,
    node_name VARCHAR(100) NOT NULL,
    area_name VARCHAR(80) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 11: road_edges
-- Directed / bidirectional road connections with measured road distances in km.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS road_edges;
CREATE TABLE road_edges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_node_id BIGINT NOT NULL,
    target_node_id BIGINT NOT NULL,
    road_name VARCHAR(100) NOT NULL,
    distance_km DECIMAL(6, 2) NOT NULL,
    is_bidirectional BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_edge_source FOREIGN KEY (source_node_id) REFERENCES road_nodes(id) ON DELETE CASCADE,
    CONSTRAINT fk_edge_target FOREIGN KEY (target_node_id) REFERENCES road_nodes(id) ON DELETE CASCADE,
    CONSTRAINT chk_edge_dist CHECK (distance_km > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 12: otp_verifications
-- Secure random OTP verification generated for food handover.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS otp_verifications;
CREATE TABLE otp_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    delivery_id BIGINT NOT NULL UNIQUE,
    recipient_profile_id BIGINT NOT NULL,
    otp_code_hash VARCHAR(255) NOT NULL,
    plain_otp_for_recipient VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_count INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    verified_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_otp_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
    CONSTRAINT fk_otp_recipient FOREIGN KEY (recipient_profile_id) REFERENCES recipient_profiles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 13: notifications
-- In-app relational notifications for all 3 user roles.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    related_entity_type VARCHAR(50) NULL,
    related_entity_id BIGINT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 14: waste_records
-- Food waste tracking for expired or spoiled donations with disposal methods.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS waste_records;
CREATE TABLE waste_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_id BIGINT NOT NULL,
    quantity DECIMAL(8, 2) NOT NULL,
    quantity_unit VARCHAR(20) NOT NULL,
    waste_reason VARCHAR(100) NOT NULL,
    disposal_method VARCHAR(100) NOT NULL,
    notes TEXT NULL,
    recorded_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_waste_donation FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE RESTRICT,
    CONSTRAINT chk_waste_qty CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 15: volunteer_rewards
-- Points, milestones, and honor badges earned by volunteers upon verified deliveries.
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS volunteer_rewards;
CREATE TABLE volunteer_rewards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    volunteer_profile_id BIGINT NOT NULL,
    points_awarded INT NOT NULL DEFAULT 50,
    reason VARCHAR(100) NOT NULL,
    badge_name VARCHAR(50) NULL,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reward_volunteer FOREIGN KEY (volunteer_profile_id) REFERENCES volunteer_profiles(id) ON DELETE CASCADE,
    CONSTRAINT chk_reward_pts CHECK (points_awarded >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verification of table creation
SHOW TABLES;
