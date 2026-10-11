-- ============================================================================
-- NourishNet: Smart Food Redistribution and Waste Management System
-- Database Migration Script: Normalize Roles to VEHICLE_VOLUNTEER
-- File: 06_migrate_roles_to_vehicle_volunteer.sql
-- ============================================================================
-- Purpose:
-- Safely migrates existing MySQL databases containing legacy 'VOLUNTEER' or 'ADMIN'
-- entries to the required three-role specification:
--   1. DONOR
--   2. RECIPIENT
--   3. VEHICLE_VOLUNTEER
--
-- This script does NOT drop tables or delete user data.
-- ============================================================================

USE nourishnet;

-- Step 1: Temporarily expand ENUM column definition to accept both legacy and new values
ALTER TABLE users 
    MODIFY COLUMN role VARCHAR(50) NOT NULL;

-- Step 2: Safely migrate legacy 'VOLUNTEER' values to 'VEHICLE_VOLUNTEER'
UPDATE users 
SET role = 'VEHICLE_VOLUNTEER' 
WHERE role = 'VOLUNTEER';

-- Step 3: Remove or reassign any invalid 'ADMIN' accounts if they exist
UPDATE users 
SET role = 'VEHICLE_VOLUNTEER' 
WHERE role = 'ADMIN';

-- Step 4: Lock down the column definition strictly to the three approved roles
ALTER TABLE users 
    MODIFY COLUMN role ENUM('DONOR', 'RECIPIENT', 'VEHICLE_VOLUNTEER') NOT NULL;

-- Step 5: Verification - Count users per role
SELECT role, COUNT(*) AS total_users 
FROM users 
GROUP BY role;
