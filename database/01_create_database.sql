-- ============================================================================
-- NourishNet: Smart Food Redistribution and Waste Management System
-- Database Creation Script
-- File: 01_create_database.sql
-- ============================================================================

-- Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS nourishnet
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Switch to the nourishnet database
USE nourishnet;

-- Verification query
SELECT 
    SCHEMA_NAME AS 'Database Name',
    DEFAULT_CHARACTER_SET_NAME AS 'Charset',
    DEFAULT_COLLATION_NAME AS 'Collation'
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'nourishnet';
