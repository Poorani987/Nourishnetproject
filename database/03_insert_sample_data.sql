-- ============================================================================
-- NourishNet: Smart Food Redistribution and Waste Management System
-- Comprehensive Sample Data Script
-- File: 03_insert_sample_data.sql
-- ============================================================================
-- Geographic Scope: Erode, Perundurai, Bhavani, Chithode, Gobichettipalayam
-- Demo Accounts Password for ALL users: password123
-- BCrypt Hash: $2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m
-- ============================================================================

USE nourishnet_demo;

SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data idempotently
DELETE FROM volunteer_rewards;
DELETE FROM waste_records;
DELETE FROM notifications;
DELETE FROM otp_verifications;
DELETE FROM delivery_assignments;
DELETE FROM deliveries;
DELETE FROM food_allocations;
DELETE FROM food_donations;
DELETE FROM vehicles;
DELETE FROM volunteer_profiles;
DELETE FROM recipient_profiles;
DELETE FROM donor_profiles;
DELETE FROM road_edges;
DELETE FROM road_nodes;
DELETE FROM users;

-- Reset Auto-increments
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE donor_profiles AUTO_INCREMENT = 1;
ALTER TABLE recipient_profiles AUTO_INCREMENT = 1;
ALTER TABLE volunteer_profiles AUTO_INCREMENT = 1;
ALTER TABLE vehicles AUTO_INCREMENT = 1;
ALTER TABLE food_donations AUTO_INCREMENT = 1;
ALTER TABLE food_allocations AUTO_INCREMENT = 1;
ALTER TABLE deliveries AUTO_INCREMENT = 1;
ALTER TABLE delivery_assignments AUTO_INCREMENT = 1;
ALTER TABLE road_nodes AUTO_INCREMENT = 1;
ALTER TABLE road_edges AUTO_INCREMENT = 1;
ALTER TABLE otp_verifications AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;
ALTER TABLE waste_records AUTO_INCREMENT = 1;
ALTER TABLE volunteer_rewards AUTO_INCREMENT = 1;

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- 10 Donors (IDs 1-10), 7 Recipients (IDs 11-17), 8 Volunteers (IDs 18-25)
-- NO ADMIN ACCOUNTS
-- ----------------------------------------------------------------------------

-- Donors (1 to 10)
INSERT INTO users (id, full_name, email, password_hash, phone_number, role, address, city, state, pincode, latitude, longitude) VALUES
(1, 'Murugan Palanisamy', 'donor.annapoorna@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842100001', 'DONOR', '45 Brough Road', 'Erode', 'Tamil Nadu', '638001', 11.3425, 77.7285),
(2, 'K. S. Shanmugam', 'donor.saravana@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842100002', 'DONOR', '120 NH544 Highway Bypass', 'Perundurai', 'Tamil Nadu', '638052', 11.2780, 77.5850),
(3, 'Dr. Arumugam Mess Mgr', 'donor.greenvalley@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842100003', 'DONOR', 'Campus Road, Thindal', 'Erode', 'Tamil Nadu', '638012', 11.3280, 77.6780),
(4, 'S. Selvaraj Caterer', 'donor.konguarts@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842100004', 'DONOR', 'Nanjanapuram Institutional Area', 'Erode', 'Tamil Nadu', '638107', 11.3120, 77.6650),
(5, 'G. Soundararajan', 'donor.krishnabakery@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842100005', 'DONOR', '18 West Ratha Street', 'Bhavani', 'Tamil Nadu', '638301', 11.4480, 77.6830),
(6, 'R. Venkatesh GM', 'donor.royalpalace@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842100006', 'DONOR', '88 Salem-Coimbatore NH, Chithode', 'Chithode', 'Tamil Nadu', '638102', 11.4110, 77.6690),
(7, 'M. Thangavel Manager', 'donor.cauverydiner@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842100007', 'DONOR', '210 Cauvery River Bridge Rd', 'Bhavani', 'Tamil Nadu', '638301', 11.4420, 77.6910),
(8, 'K. Nallathambi Master', 'donor.bhavanicaterers@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842100008', 'DONOR', '34 North Car Street', 'Bhavani', 'Tamil Nadu', '638301', 11.4505, 77.6815),
(9, 'S. Manikandan Owner', 'donor.sakthisweets@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842100009', 'DONOR', '56 Cutchery Street', 'Gobichettipalayam', 'Tamil Nadu', '638452', 11.4540, 77.4360),
(10, 'P. Velusamy Coordinator', 'donor.farmercoop@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842100010', 'DONOR', '12 Agricultural Market Rd', 'Gobichettipalayam', 'Tamil Nadu', '638452', 11.4580, 77.4420);

-- Recipients (11 to 17)
INSERT INTO users (id, full_name, email, password_hash, phone_number, role, address, city, state, pincode, latitude, longitude) VALUES
(11, 'Sister Rosy Mary', 'recipient.anbu@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842200011', 'RECIPIENT', '14 Veerappanchatram Main', 'Erode', 'Tamil Nadu', '638004', 11.3550, 77.7120),
(12, 'Rev. Fr. Joseph Paul', 'recipient.motherteresa@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842200012', 'RECIPIENT', '88 Vijayamangalam Road', 'Perundurai', 'Tamil Nadu', '638052', 11.2720, 77.5780),
(13, 'S. Vijayaraghavan', 'recipient.hope@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842200013', 'RECIPIENT', '5 Railway Colony Cross', 'Erode', 'Tamil Nadu', '638002', 11.3390, 77.7170),
(14, 'Mrs. Kalpana Devi', 'recipient.shanti@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842200014', 'RECIPIENT', '22 Kumalan Kuttai Layout', 'Chithode', 'Tamil Nadu', '638102', 11.4080, 77.6750),
(15, 'G. Subramaniam Trustee', 'recipient.karunai@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842200015', 'RECIPIENT', '9 Old Bus Stand Lane', 'Bhavani', 'Tamil Nadu', '638301', 11.4470, 77.6850),
(16, 'Dr. Nancy Varghese', 'recipient.grace@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842200016', 'RECIPIENT', '41 Modachur Road', 'Gobichettipalayam', 'Tamil Nadu', '638452', 11.4600, 77.4320),
(17, 'K. Dharmaraj Secretary', 'recipient.vidiyal@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842200017', 'RECIPIENT', '105 Chennimalai Road', 'Perundurai', 'Tamil Nadu', '638052', 11.2650, 77.5920);

-- Vehicle Volunteers (18 to 25)
INSERT INTO users (id, full_name, email, password_hash, phone_number, role, address, city, state, pincode, latitude, longitude) VALUES
(18, 'Ramesh Kumar', 'volunteer.ramesh@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842300018', 'VEHICLE_VOLUNTEER', '12 Sampath Nagar', 'Erode', 'Tamil Nadu', '638011', 11.3350, 77.7210),
(19, 'Priya Sundaram', 'volunteer.priya@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842300019', 'VEHICLE_VOLUNTEER', '44 Maruthi Nagar, Thindal', 'Erode', 'Tamil Nadu', '638012', 11.3250, 77.6820),
(20, 'Karthik Raja', 'volunteer.karthik@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842300020', 'VEHICLE_VOLUNTEER', '18 Gandhi Nagar', 'Perundurai', 'Tamil Nadu', '638052', 11.2760, 77.5870),
(21, 'Vigneshwaran S', 'volunteer.vignesh@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842300021', 'VEHICLE_VOLUNTEER', '75 Ring Road Bypass', 'Chithode', 'Tamil Nadu', '638102', 11.4150, 77.6620),
(22, 'Deepa Subramaniam', 'volunteer.deepa@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842300022', 'VEHICLE_VOLUNTEER', '29 Cauvery Nagar', 'Bhavani', 'Tamil Nadu', '638301', 11.4440, 77.6890),
(23, 'Anand Balakrishnan', 'volunteer.anand@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842300023', 'VEHICLE_VOLUNTEER', '102 Industrial Estate', 'Perundurai', 'Tamil Nadu', '638052', 11.2710, 77.5800),
(24, 'Senthil Nathan', 'volunteer.senthil@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842300024', 'VEHICLE_VOLUNTEER', '5 Bazaar Street', 'Gobichettipalayam', 'Tamil Nadu', '638452', 11.4520, 77.4380),
(25, 'Divya Chandran', 'volunteer.divya@nourishnet.org', '$2a$10$g4v4UIL6Tfzxx4SJTY4Jz.Q3bE7aIPvwp7dQ3tqsXYqFXYa4I3h4m', '9842300025', 'VEHICLE_VOLUNTEER', '14 Sakthi Nagar', 'Gobichettipalayam', 'Tamil Nadu', '638452', 11.4560, 77.4410);

-- ----------------------------------------------------------------------------
-- 2. DONOR PROFILES (10 records)
-- ----------------------------------------------------------------------------
INSERT INTO donor_profiles (id, user_id, organization_name, organization_type, fssai_license, contact_person, pickup_instructions, operating_hours) VALUES
(1, 1, 'Annapoorna Bhavan Hotel', 'RESTAURANT', 'FSSAI-12420001000111', 'Murugan P (Proprietor)', 'Rear service gate entrance. Hot pack storage container ready.', '07:00 AM - 10:30 PM'),
(2, 2, 'Hotel Saravana Heritage', 'HOTEL', 'FSSAI-12420001000222', 'Shanmugam K (Chef)', 'Direct access via kitchen dock facing Highway NH544.', '06:30 AM - 11:00 PM'),
(3, 3, 'Green Valley College Mess', 'HOSTEL_MESS', 'FSSAI-12420001000333', 'Dr. Arumugam (Mess Warden)', 'South Gate 2, Central Kitchen Pantry. Security will assist.', '06:00 AM - 09:30 PM'),
(4, 4, 'Kongu Arts Cafeteria', 'COLLEGE_CANTEEN', 'FSSAI-12420001000444', 'Selvaraj (Catering Incharge)', 'Main cafeteria ramp behind auditorium.', '08:00 AM - 06:00 PM'),
(5, 5, 'Sri Krishna Bakery & Confections', 'BAKERY', 'FSSAI-12420001000555', 'Soundararajan G', 'Store front pickup during evening hours.', '08:30 AM - 10:00 PM'),
(6, 6, 'Royal Palace Banquet & Events', 'EVENT_HALL', 'FSSAI-12420001000666', 'Venkatesh R (GM)', 'Banquet loading bay at the rear. High volume handling.', '24 Hours On Events'),
(7, 7, 'Cauvery Highway Diner', 'RESTAURANT', 'FSSAI-12420001000777', 'Thangavel M', 'Main lobby side entrance. Food boxed in insulated crates.', '07:00 AM - 11:30 PM'),
(8, 8, 'Bhavani Community Hall Caterers', 'CATERING', 'FSSAI-12420001000888', 'Nallathambi K', 'Hall catering kitchen near North Car Street temple tower.', '06:00 AM - 10:00 PM'),
(9, 9, 'Sakthi Sweets & Savouries', 'SWEET_SHOP', 'FSSAI-12420001000999', 'Manikandan S', 'Direct shop counter pickup.', '09:00 AM - 09:30 PM'),
(10, 10, 'Farmer Fresh Harvest Mess', 'COMMUNITY_KITCHEN', 'FSSAI-12420001001000', 'Velusamy P', 'Wholesale market yard shed 4.', '05:30 AM - 07:00 PM');

-- ----------------------------------------------------------------------------
-- 3. RECIPIENT PROFILES (7 records)
-- ----------------------------------------------------------------------------
INSERT INTO recipient_profiles (id, user_id, organization_name, organization_type, contact_person, beneficiary_count, dietary_preferences, required_food_categories, allergen_restrictions, delivery_instructions) VALUES
(1, 11, 'Anbu Karangal Children Orphanage', 'ORPHANAGE', 'Sister Rosy Mary', 65, 'ANY', 'RICE_AND_MEALS,BREAD_AND_BAKERY,FRUITS_AND_VEGETABLES', 'No extreme spicy items', 'Main office bell at gate. Available until 9:00 PM.'),
(2, 12, 'Mother Teresa Senior Care Home', 'OLD_AGE_HOME', 'Rev. Fr. Joseph Paul', 45, 'VEGETARIAN', 'RICE_AND_MEALS,DAIRY,BREAD_AND_BAKERY', 'Low spice, soft textured cooked meals', 'Front porch ground floor reception. Resident nurses available 24/7.'),
(3, 13, 'Hope Foundation Shelter', 'SHELTER', 'S. Vijayaraghavan', 85, 'ANY', 'RICE_AND_MEALS,PACKAGED_FOOD,SNACKS', 'None', 'Community hall dining area next to station road.'),
(4, 14, 'Shanti Special Needs Home', 'SPECIAL_NEEDS_HOME', 'Mrs. Kalpana Devi', 40, 'VEGETARIAN', 'RICE_AND_MEALS,FRUITS_AND_VEGETABLES,DAIRY', 'Peanut free', 'Entrance near child therapy wing.'),
(5, 15, 'Karunai Welfare Trust', 'COMMUNITY_CENTER', 'G. Subramaniam', 70, 'ANY', 'RICE_AND_MEALS,BREAD_AND_BAKERY', 'None', 'Trust dispensary office counter.'),
(6, 16, 'Grace Elder Care Home', 'OLD_AGE_HOME', 'Dr. Nancy Varghese', 38, 'VEGETARIAN', 'RICE_AND_MEALS,DAIRY,FRUITS_AND_VEGETABLES', 'Diabetic friendly preferred', 'Elder care block entrance ramp.'),
(7, 17, 'Vidiyal Rural Support Mission', 'CHARITY', 'K. Dharmaraj', 55, 'ANY', 'RICE_AND_MEALS,PACKAGED_FOOD', 'None', 'Community pantry shed.');

-- ----------------------------------------------------------------------------
-- 4. VOLUNTEER PROFILES (8 records)
-- Unpaid volunteers with dedicated vehicles and service radius
-- ----------------------------------------------------------------------------
INSERT INTO volunteer_profiles (id, user_id, is_available, service_radius_km, preferred_location, total_points, completed_deliveries_count) VALUES
(1, 18, TRUE, 12.00, 'Erode Town & Thindal', 320, 6),
(2, 19, TRUE, 25.00, 'Erode - Perundurai Corridor', 480, 8),
(3, 20, TRUE, 15.00, 'Perundurai & SIPCOT', 210, 4),
(4, 21, TRUE, 30.00, 'Chithode - Bhavani - Erode Bypass', 650, 11),
(5, 22, TRUE, 10.00, 'Bhavani & Komarapalayam Border', 150, 3),
(6, 23, TRUE, 35.00, 'Perundurai - Erode - Gobi Region', 820, 14),
(7, 24, TRUE, 8.00, 'Gobichettipalayam Town', 190, 4),
(8, 25, TRUE, 20.00, 'Gobichettipalayam & Bhavani Route', 290, 5);

-- ----------------------------------------------------------------------------
-- 5. VEHICLES (8 records)
-- Dedicated personal vehicles voluntarily operated by volunteers
-- ----------------------------------------------------------------------------
INSERT INTO vehicles (id, volunteer_profile_id, vehicle_type, registration_number, capacity_value, capacity_unit, is_active) VALUES
(1, 1, 'MOTORCYCLE', 'TN33 AB 1204', 25.00, 'KG', TRUE),
(2, 2, 'CAR', 'TN33 BK 5521', 120.00, 'KG', TRUE),
(3, 3, 'AUTO_RICKSHAW', 'TN33 CD 8943', 90.00, 'KG', TRUE),
(4, 4, 'VAN', 'TN33 EF 3412', 400.00, 'KG', TRUE),
(5, 5, 'MOTORCYCLE', 'TN33 GH 7719', 30.00, 'KG', TRUE),
(6, 6, 'MINI_TRUCK', 'TN33 JK 9081', 800.00, 'KG', TRUE),
(7, 7, 'BICYCLE', 'TN33 CY 0012', 15.00, 'KG', TRUE),
(8, 8, 'CAR', 'TN33 LM 4432', 150.00, 'KG', TRUE);

-- ----------------------------------------------------------------------------
-- 6. ROAD NETWORK (NODES & EDGES) FOR DIJKSTRA ALGORITHM
-- Illustrative sample road graph for Erode region
-- ----------------------------------------------------------------------------
INSERT INTO road_nodes (id, node_code, node_name, area_name, latitude, longitude) VALUES
(1, 'NODE_ERODE_JN', 'Erode Railway Junction', 'Erode Central', 11.3392, 77.7172),
(2, 'NODE_ERODE_BS', 'Erode Central Bus Stand', 'Erode Central', 11.3410, 77.7280),
(3, 'NODE_THINDAL', 'Thindal Murugan Temple Jn', 'Thindal', 11.3280, 77.6780),
(4, 'NODE_NASIYANUR', 'Nasiyanur Ring Junction', 'Nasiyanur', 11.3520, 77.6320),
(5, 'NODE_CHITHODE', 'Chithode NH544 Junction', 'Chithode', 11.4110, 77.6690),
(6, 'NODE_BHAVANI', 'Bhavani Old Bus Stand', 'Bhavani', 11.4480, 77.6830),
(7, 'NODE_PERUNDURAI_TOWN', 'Perundurai New Bus Stand', 'Perundurai', 11.2790, 77.5890),
(8, 'NODE_PERUNDURAI_SIPCOT', 'Perundurai SIPCOT Phase II', 'Perundurai', 11.2750, 77.5850),
(9, 'NODE_KAVINDAPADI', 'Kavindapadi Sugar Mill Road', 'Kavindapadi', 11.4310, 77.5520),
(10, 'NODE_GOBI_BS', 'Gobichettipalayam Bus Stand', 'Gobichettipalayam', 11.4540, 77.4360),
(11, 'NODE_ISOLATED_TEST', 'Isolated Research Depot (Unreachable)', 'Outer Boundary', 11.5500, 77.8500);

-- Road connections (Edges) with distances in km
INSERT INTO road_edges (id, source_node_id, target_node_id, road_name, distance_km, is_bidirectional) VALUES
(1, 1, 2, 'EVN Road', 1.80, TRUE),
(2, 2, 3, 'Perundurai Road (Town Section)', 5.20, TRUE),
(3, 3, 4, 'SH96 Perundurai Highway', 5.80, TRUE),
(4, 4, 7, 'NH544 Expressway Southern Wing', 8.50, TRUE),
(5, 7, 8, 'SIPCOT Industrial Main Road', 2.10, TRUE),
(6, 2, 5, 'Erode-Bhavani Road via BP Agraharam', 8.40, TRUE),
(7, 5, 6, 'NH544 Bhavani River Bridge Link', 5.10, TRUE),
(8, 5, 4, 'Chithode-Nasiyanur Bypass Link', 7.30, TRUE),
(9, 5, 9, 'Chithode-Kavindapadi State Highway', 12.50, TRUE),
(10, 6, 9, 'Bhavani-Kavindapadi Road', 14.10, TRUE),
(11, 9, 10, 'Kavindapadi-Gobi State Highway', 13.80, TRUE),
(12, 7, 10, 'Perundurai-Gobi Direct SH', 23.40, TRUE),
(13, 1, 3, 'Brough Road - Thindal Direct', 4.90, TRUE),
(14, 4, 9, 'Nasiyanur-Kavindapadi Rural Road', 11.20, TRUE);

-- ----------------------------------------------------------------------------
-- 7. FOOD DONATIONS (22 records)
-- Demonstrating varied statuses, categories, preparation times, and deadlines
-- ----------------------------------------------------------------------------
INSERT INTO food_donations (id, donor_profile_id, food_name, food_category, food_type, state_type, total_quantity, allocated_quantity, remaining_quantity, quantity_unit, preparation_time, consume_before, storage_requirements, allergen_information, pickup_address, pickup_latitude, pickup_longitude, pickup_window_start, pickup_window_end, status, version) VALUES
-- Active Available / Partially Allocated donations:
(1, 1, 'South Indian Sambar Rice & Poriyal', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 100.00, 50.00, 50.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'KEEP_WARM', 'Contains mustard, asafoetida', '45 Brough Road, Erode', 11.3425, 77.7285, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'PARTIALLY_ALLOCATED', 1),
(2, 2, 'Vegetable Biryani & Onion Raitha', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 80.00, 0.00, 80.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 5 HOUR), 'KEEP_WARM', 'Contains dairy (raitha)', '120 NH544 Bypass, Perundurai', 11.2780, 77.5850, NOW(), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'AVAILABLE', 0),
(3, 3, 'Steamed Idli with Coconut Chutney & Sambar', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 150.00, 150.00, 0.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'ROOM_TEMPERATURE', 'Contains coconut', 'Green Valley Campus Mess, Thindal, Erode', 11.3280, 77.6780, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 1 HOUR), 'FULLY_ALLOCATED', 2),
(4, 4, 'Chappathi with Mixed Veg Kurma', 'BREAD_AND_BAKERY', 'VEGETARIAN', 'COOKED', 90.00, 40.00, 50.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 6 HOUR), 'ROOM_TEMPERATURE', 'Contains wheat gluten', 'Nanjanapuram Campus, Erode', 11.3120, 77.6650, NOW(), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'PARTIALLY_ALLOCATED', 1),
(5, 5, 'Freshly Baked Whole Wheat Loaves & Buns', 'BREAD_AND_BAKERY', 'VEGETARIAN', 'PACKAGED', 60.00, 0.00, 60.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_ADD(NOW(), INTERVAL 36 HOUR), 'COOL_AND_DRY', 'Gluten', '18 West Ratha St, Bhavani', 11.4480, 77.6830, NOW(), DATE_ADD(NOW(), INTERVAL 8 HOUR), 'AVAILABLE', 0),
(6, 6, 'Marriage Feast Curd Rice & Lemon Sevai', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 200.00, 120.00, 80.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'COOL_AND_DRY', 'Dairy in curd rice', '88 Salem-Coimbatore NH, Chithode', 11.4110, 77.6690, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'PARTIALLY_ALLOCATED', 1),
(7, 7, 'Steamed White Rice & Paruppu Curry', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 70.00, 0.00, 70.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 5 HOUR), 'KEEP_WARM', 'None', '210 Cauvery Bridge Rd, Bhavani', 11.4420, 77.6910, NOW(), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'AVAILABLE', 0),
(8, 8, 'Vegetable Pulao & Brinjal Gravy', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 110.00, 60.00, 50.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'KEEP_WARM', 'None', '34 North Car St, Bhavani', 11.4505, 77.6815, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'PARTIALLY_ALLOCATED', 1),
(9, 9, 'Nutritious Mysore Pak & Laddu Boxed Sweets', 'SNACKS', 'VEGETARIAN', 'PACKAGED', 50.00, 0.00, 50.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_ADD(NOW(), INTERVAL 72 HOUR), 'ROOM_TEMPERATURE', 'Nuts, Ghee', '56 Cutchery St, Gobichettipalayam', 11.4540, 77.4360, NOW(), DATE_ADD(NOW(), INTERVAL 12 HOUR), 'AVAILABLE', 0),
(10, 10, 'Fresh Farm Bananas & Papayas Crates', 'FRUITS_AND_VEGETABLES', 'VEGETARIAN', 'PACKAGED', 80.00, 0.00, 80.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_ADD(NOW(), INTERVAL 48 HOUR), 'COOL_AND_DRY', 'None', '12 Agri Market Rd, Gobichettipalayam', 11.4580, 77.4420, NOW(), DATE_ADD(NOW(), INTERVAL 10 HOUR), 'AVAILABLE', 0),
(11, 1, 'Vegetable Hakka Noodles with Sauce', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 45.00, 45.00, 0.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_ADD(NOW(), INTERVAL 1 HOUR), 'ROOM_TEMPERATURE', 'Soy, Wheat', '45 Brough Road, Erode', 11.3425, 77.7285, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), 'PICKED_UP', 1),
(12, 2, 'Koozh and Keerai Poriyal Traditional Meal', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 75.00, 75.00, 0.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), 'ROOM_TEMPERATURE', 'None', '120 NH544 Bypass, Perundurai', 11.2780, 77.5850, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 'DELIVERED', 1),
(13, 3, 'Curd Vada & Vegetable Upma', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 65.00, 65.00, 0.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 'ROOM_TEMPERATURE', 'Dairy, Mustard', 'Thindal Campus Mess, Erode', 11.3280, 77.6780, DATE_SUB(NOW(), INTERVAL 7 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), 'DELIVERED', 1),
(14, 4, 'Bisibelebath with Appalam', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 85.00, 85.00, 0.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), 'KEEP_WARM', 'Asafoetida', 'Nanjanapuram Campus, Erode', 11.3120, 77.6650, DATE_SUB(NOW(), INTERVAL 9 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR), 'DELIVERED', 1),
(15, 6, 'Paneer Butter Masala & Ghee Rice', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 120.00, 120.00, 0.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR), 'KEEP_WARM', 'Dairy, Cashew', '88 Salem-Coimbatore NH, Chithode', 11.4110, 77.6690, DATE_SUB(NOW(), INTERVAL 11 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR), 'DELIVERED', 1),
(16, 7, 'South Indian Meals with More Kuzhambu', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 60.00, 60.00, 0.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 14 HOUR), DATE_SUB(NOW(), INTERVAL 7 HOUR), 'KEEP_WARM', 'Dairy, Mustard', '210 Cauvery Bridge Rd, Bhavani', 11.4420, 77.6910, DATE_SUB(NOW(), INTERVAL 13 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR), 'DELIVERED', 1),
-- Expired donations (cannot be claimed by recipients):
(17, 8, 'Morning Tomato Rice & Potato Fry', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 50.00, 0.00, 50.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 18 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR), 'ROOM_TEMPERATURE', 'None', '34 North Car St, Bhavani', 11.4505, 77.6815, DATE_SUB(NOW(), INTERVAL 16 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR), 'EXPIRED', 0),
(18, 9, 'Milk Sweets Packets (Passed Shelf-life)', 'DAIRY', 'VEGETARIAN', 'COOKED', 30.00, 0.00, 30.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 30 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), 'REFRIGERATED', 'Dairy', '56 Cutchery St, Gobichettipalayam', 11.4540, 77.4360, DATE_SUB(NOW(), INTERVAL 28 HOUR), DATE_SUB(NOW(), INTERVAL 12 HOUR), 'EXPIRED', 0),
-- Cancelled donation:
(19, 5, 'Spicy Masala Bread Rolls (Damaged Package)', 'SNACKS', 'VEGETARIAN', 'COOKED', 40.00, 0.00, 40.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 20 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR), 'COOL_AND_DRY', 'Gluten', '18 West Ratha St, Bhavani', 11.4480, 77.6830, DATE_SUB(NOW(), INTERVAL 19 HOUR), DATE_SUB(NOW(), INTERVAL 12 HOUR), 'CANCELLED', 0),
-- Additional active donations:
(20, 10, 'Packaged Organic Millet Cookies', 'SNACKS', 'VEGETARIAN', 'PACKAGED', 100.00, 0.00, 100.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_ADD(NOW(), INTERVAL 120 HOUR), 'ROOM_TEMPERATURE', 'None', '12 Agri Market Rd, Gobichettipalayam', 11.4580, 77.4420, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), 'AVAILABLE', 0),
(21, 1, 'Vegetable Pulao & Mint Raita', 'RICE_AND_MEALS', 'VEGETARIAN', 'COOKED', 70.00, 0.00, 70.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'KEEP_WARM', 'Dairy in raita', '45 Brough Road, Erode', 11.3425, 77.7285, NOW(), DATE_ADD(NOW(), INTERVAL 2 HOUR), 'AVAILABLE', 0),
(22, 2, 'Assorted Fresh Breads & Sandwich Slices', 'BREAD_AND_BAKERY', 'VEGETARIAN', 'PACKAGED', 50.00, 0.00, 50.00, 'PORTIONS', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 24 HOUR), 'COOL_AND_DRY', 'Gluten', '120 NH544 Bypass, Perundurai', 11.2780, 77.5850, NOW(), DATE_ADD(NOW(), INTERVAL 6 HOUR), 'AVAILABLE', 0);

-- ----------------------------------------------------------------------------
-- 8. FOOD ALLOCATIONS (12 records)
-- Reflecting the 15km transport policy:
-- <= 15 km: DONOR_OR_VOLUNTEER
-- > 15 km: RECIPIENT_OR_VOLUNTEER
-- ----------------------------------------------------------------------------
INSERT INTO food_allocations (id, donation_id, recipient_profile_id, requested_quantity, allocated_quantity, quantity_unit, distance_km, transport_responsibility, status) VALUES
-- Allocation 1: Donation 1 (100 total, 50 requested by Anbu Karangal, distance 3.8 km <= 15km)
(1, 1, 1, 50.00, 50.00, 'PORTIONS', 3.80, 'DONOR_OR_VOLUNTEER', 'CONFIRMED'),
-- Allocation 2: Donation 3 (150 total, 80 by Hope Foundation, distance 4.9 km <= 15km)
(2, 3, 3, 80.00, 80.00, 'PORTIONS', 4.90, 'DONOR_OR_VOLUNTEER', 'CONFIRMED'),
-- Allocation 3: Donation 3 (70 portions remaining claimed by Anbu Karangal, distance 5.5 km <= 15km)
(3, 3, 1, 70.00, 70.00, 'PORTIONS', 5.50, 'DONOR_OR_VOLUNTEER', 'CONFIRMED'),
-- Allocation 4: Donation 4 (90 total, 40 claimed by Vidiyal Mission, distance 18.2 km > 15km)
(4, 4, 7, 40.00, 40.00, 'PORTIONS', 18.20, 'RECIPIENT_OR_VOLUNTEER', 'CONFIRMED'),
-- Allocation 5: Donation 6 (200 total, 120 claimed by Karunai Trust, distance 6.2 km <= 15km)
(5, 6, 5, 120.00, 120.00, 'PORTIONS', 6.20, 'DONOR_OR_VOLUNTEER', 'CONFIRMED'),
-- Allocation 6: Donation 8 (110 total, 60 claimed by Shanti Special Needs, distance 7.8 km <= 15km)
(6, 8, 4, 60.00, 60.00, 'PORTIONS', 7.80, 'DONOR_OR_VOLUNTEER', 'CONFIRMED'),
-- Allocation 7: Donation 11 (45 claimed by Hope Foundation, distance 3.5 km <= 15km)
(7, 11, 3, 45.00, 45.00, 'PORTIONS', 3.50, 'DONOR_OR_VOLUNTEER', 'CONFIRMED'),
-- Allocation 8: Donation 12 (75 claimed by Mother Teresa Home, distance 4.2 km <= 15km)
(8, 12, 2, 75.00, 75.00, 'PORTIONS', 4.20, 'DONOR_OR_VOLUNTEER', 'DELIVERED'),
-- Allocation 9: Donation 13 (65 claimed by Anbu Karangal, distance 5.8 km <= 15km)
(9, 13, 1, 65.00, 65.00, 'PORTIONS', 5.80, 'DONOR_OR_VOLUNTEER', 'DELIVERED'),
-- Allocation 10: Donation 14 (85 claimed by Vidiyal Mission, distance 16.5 km > 15km)
(10, 14, 7, 85.00, 85.00, 'PORTIONS', 16.50, 'RECIPIENT_OR_VOLUNTEER', 'DELIVERED'),
-- Allocation 11: Donation 15 (120 claimed by Grace Elder Care, distance 26.0 km > 15km)
(11, 15, 6, 120.00, 120.00, 'PORTIONS', 26.00, 'RECIPIENT_OR_VOLUNTEER', 'DELIVERED'),
-- Allocation 12: Donation 16 (60 claimed by Karunai Trust, distance 2.5 km <= 15km)
(12, 16, 5, 60.00, 60.00, 'PORTIONS', 2.50, 'DONOR_OR_VOLUNTEER', 'DELIVERED');

-- ----------------------------------------------------------------------------
-- 9. DELIVERIES (12 records)
-- Varied statuses: PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED
-- ----------------------------------------------------------------------------
INSERT INTO deliveries (id, allocation_id, status, distance_km, transport_responsibility, pickup_address, delivery_address, delivery_deadline) VALUES
(1, 1, 'ASSIGNED', 3.80, 'DONOR_OR_VOLUNTEER', '45 Brough Road, Erode', '14 Veerappanchatram Main, Erode', DATE_ADD(NOW(), INTERVAL 3 HOUR)),
(2, 2, 'PENDING', 4.90, 'DONOR_OR_VOLUNTEER', 'Green Valley Campus Mess, Thindal, Erode', '5 Railway Colony Cross, Erode', DATE_ADD(NOW(), INTERVAL 2 HOUR)),
(3, 3, 'ASSIGNED', 5.50, 'DONOR_OR_VOLUNTEER', 'Green Valley Campus Mess, Thindal, Erode', '14 Veerappanchatram Main, Erode', DATE_ADD(NOW(), INTERVAL 2 HOUR)),
(4, 4, 'PENDING', 18.20, 'RECIPIENT_OR_VOLUNTEER', 'Nanjanapuram Campus, Erode', '105 Chennimalai Road, Perundurai', DATE_ADD(NOW(), INTERVAL 4 HOUR)),
(5, 5, 'IN_TRANSIT', 6.20, 'DONOR_OR_VOLUNTEER', '88 Salem-Coimbatore NH, Chithode', '9 Old Bus Stand Lane, Bhavani', DATE_ADD(NOW(), INTERVAL 2 HOUR)),
(6, 6, 'PICKED_UP', 7.80, 'DONOR_OR_VOLUNTEER', '34 North Car St, Bhavani', '22 Kumalan Kuttai Layout, Chithode', DATE_ADD(NOW(), INTERVAL 3 HOUR)),
(7, 7, 'IN_TRANSIT', 3.50, 'DONOR_OR_VOLUNTEER', '45 Brough Road, Erode', '5 Railway Colony Cross, Erode', DATE_ADD(NOW(), INTERVAL 1 HOUR)),
(8, 8, 'DELIVERED', 4.20, 'DONOR_OR_VOLUNTEER', '120 NH544 Bypass, Perundurai', '88 Vijayamangalam Road, Perundurai', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(9, 9, 'DELIVERED', 5.80, 'DONOR_OR_VOLUNTEER', 'Thindal Campus Mess, Erode', '14 Veerappanchatram Main, Erode', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(10, 10, 'DELIVERED', 16.50, 'RECIPIENT_OR_VOLUNTEER', 'Nanjanapuram Campus, Erode', '105 Chennimalai Road, Perundurai', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(11, 11, 'DELIVERED', 26.00, 'RECIPIENT_OR_VOLUNTEER', '88 Salem-Coimbatore NH, Chithode', '41 Modachur Road, Gobichettipalayam', DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(12, 12, 'DELIVERED', 2.50, 'DONOR_OR_VOLUNTEER', '210 Cauvery Bridge Rd, Bhavani', '9 Old Bus Stand Lane, Bhavani', DATE_SUB(NOW(), INTERVAL 9 HOUR));

-- ----------------------------------------------------------------------------
-- 10. DELIVERY ASSIGNMENTS (linking volunteers to deliveries)
-- ----------------------------------------------------------------------------
INSERT INTO delivery_assignments (id, delivery_id, volunteer_profile_id, assigned_at, picked_up_at, delivered_at, notes) VALUES
-- Delivery 1 assigned to Volunteer 1 (Ramesh Kumar - Bike)
(1, 1, 1, DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, NULL, 'Volunteer Ramesh accepted delivery via app. Expected pickup in 30 mins.'),
-- Delivery 3 assigned to Volunteer 2 (Priya Sundaram - Car)
(2, 3, 2, DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL, NULL, 'Volunteer Priya accepted. High portion count fits vehicle capacity.'),
-- Delivery 5 assigned to Volunteer 4 (Vigneshwaran - Van)
(3, 5, 4, DATE_SUB(NOW(), INTERVAL 50 MINUTE), DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL, 'Pickup confirmed from Chithode banquet. En route to Bhavani.'),
-- Delivery 6 assigned to Volunteer 5 (Deepa - Motorcycle)
(4, 6, 5, DATE_SUB(NOW(), INTERVAL 40 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE), NULL, 'Picked up from caterer. Moving safely.'),
-- Delivery 7 assigned to Volunteer 1 (Ramesh Kumar - Bike)
(5, 7, 1, DATE_SUB(NOW(), INTERVAL 35 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE), NULL, 'Picked up from Brough Rd. Heading to Railway colony.'),
-- Past completed deliveries:
(6, 8, 3, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 'Delivered on time. Handover OTP verified.'),
(7, 9, 1, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), 'Handover complete to orphanage warden.'),
(8, 10, 2, DATE_SUB(NOW(), INTERVAL 7 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR), 'Inter-city transport completed safely.'),
(9, 11, 6, DATE_SUB(NOW(), INTERVAL 9 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR), DATE_SUB(NOW(), INTERVAL 7 HOUR), 'Heavy banquet load carried by mini truck to Gobi elder care.'),
(10, 12, 5, DATE_SUB(NOW(), INTERVAL 11 HOUR), DATE_SUB(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 9 HOUR), 'Local Bhavani handover verified.');

-- ----------------------------------------------------------------------------
-- 11. OTP VERIFICATIONS
-- Secure handover tokens generated for recipients
-- ----------------------------------------------------------------------------
INSERT INTO otp_verifications (id, delivery_id, recipient_profile_id, otp_code_hash, plain_otp_for_recipient, expires_at, is_used, attempt_count, max_attempts, verified_at) VALUES
-- Active Delivery 1: Recipient 1 (Anbu Karangal) has OTP '482910'
(1, 1, 1, '$2a$10$wE9K6j2fO1E5N0bM91t.UeRjUoY9vU27/zRkXo0p2l0q0Z9h5n8qG', '482910', DATE_ADD(NOW(), INTERVAL 3 HOUR), FALSE, 0, 5, NULL),
-- Active Delivery 3: Recipient 1 has OTP '918234'
(2, 3, 1, '$2a$10$wE9K6j2fO1E5N0bM91t.UeRjUoY9vU27/zRkXo0p2l0q0Z9h5n8qG', '918234', DATE_ADD(NOW(), INTERVAL 2 HOUR), FALSE, 0, 5, NULL),
-- Active Delivery 5: Recipient 5 (Karunai Trust) has OTP '629184'
(3, 5, 5, '$2a$10$wE9K6j2fO1E5N0bM91t.UeRjUoY9vU27/zRkXo0p2l0q0Z9h5n8qG', '629184', DATE_ADD(NOW(), INTERVAL 2 HOUR), FALSE, 0, 5, NULL),
-- Active Delivery 6: Recipient 4 (Shanti Home) has OTP '730195'
(4, 6, 4, '$2a$10$wE9K6j2fO1E5N0bM91t.UeRjUoY9vU27/zRkXo0p2l0q0Z9h5n8qG', '730195', DATE_ADD(NOW(), INTERVAL 3 HOUR), FALSE, 0, 5, NULL),
-- Active Delivery 7: Recipient 3 (Hope Shelter) has OTP '841029'
(5, 7, 3, '$2a$10$wE9K6j2fO1E5N0bM91t.UeRjUoY9vU27/zRkXo0p2l0q0Z9h5n8qG', '841029', DATE_ADD(NOW(), INTERVAL 1 HOUR), FALSE, 0, 5, NULL),
-- Past completed verifications:
(6, 8, 2, '$2a$10$wE9K6j2fO1E5N0bM91t.UeRjUoY9vU27/zRkXo0p2l0q0Z9h5n8qG', '391048', DATE_SUB(NOW(), INTERVAL 2 HOUR), TRUE, 1, 5, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(7, 9, 1, '$2a$10$wE9K6j2fO1E5N0bM91t.UeRjUoY9vU27/zRkXo0p2l0q0Z9h5n8qG', '512934', DATE_SUB(NOW(), INTERVAL 3 HOUR), TRUE, 1, 5, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(8, 10, 7, '$2a$10$wE9K6j2fO1E5N0bM91t.UeRjUoY9vU27/zRkXo0p2l0q0Z9h5n8qG', '204918', DATE_SUB(NOW(), INTERVAL 5 HOUR), TRUE, 1, 5, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(9, 11, 6, '$2a$10$wE9K6j2fO1E5N0bM91t.UeRjUoY9vU27/zRkXo0p2l0q0Z9h5n8qG', '693012', DATE_SUB(NOW(), INTERVAL 7 HOUR), TRUE, 1, 5, DATE_SUB(NOW(), INTERVAL 7 HOUR)),
(10, 12, 5, '$2a$10$wE9K6j2fO1E5N0bM91t.UeRjUoY9vU27/zRkXo0p2l0q0Z9h5n8qG', '182049', DATE_SUB(NOW(), INTERVAL 9 HOUR), TRUE, 1, 5, DATE_SUB(NOW(), INTERVAL 9 HOUR));

-- ----------------------------------------------------------------------------
-- 12. IN-APP NOTIFICATIONS
-- ----------------------------------------------------------------------------
INSERT INTO notifications (id, user_id, title, message, notification_type, related_entity_type, related_entity_id, is_read) VALUES
-- For Donor 1:
(1, 1, 'Allocation Requested', 'Recipient Anbu Karangal requested 50 portions of Sambar Rice.', 'ALLOCATION_REQUEST', 'FOOD_ALLOCATION', 1, FALSE),
(2, 1, 'Volunteer Assigned', 'Volunteer Ramesh Kumar has accepted the delivery assignment for Sambar Rice.', 'DELIVERY_ASSIGNED', 'DELIVERY', 1, FALSE),
-- For Recipient 1 (Anbu Karangal):
(3, 11, 'Food Allocated Successfully', '50 portions of Sambar Rice allocated from Annapoorna Bhavan.', 'ALLOCATION_CONFIRMED', 'FOOD_ALLOCATION', 1, TRUE),
(4, 11, 'Delivery Handover OTP Generated', 'Your delivery OTP is 482910. Share this code with the volunteer driver upon receiving food.', 'OTP_GENERATED', 'DELIVERY', 1, FALSE),
-- For Volunteer 1 (Ramesh Kumar):
(5, 18, 'Delivery Accepted', 'You have accepted delivery #1 (3.8 km) from Annapoorna Bhavan to Anbu Karangal.', 'DELIVERY_ACCEPTED', 'DELIVERY', 1, TRUE),
(6, 18, 'Points Credited', 'You earned 50 volunteer points for successfully delivering donation #9.', 'REWARD_EARNED', 'VOLUNTEER_REWARD', 1, TRUE),
-- For Donor 8 (Waste alert):
(7, 8, 'Food Expiry Alert', 'Donation #17 (Tomato Rice) has passed its consumption deadline without allocation.', 'EXPIRY_ALERT', 'FOOD_DONATION', 17, FALSE),
-- For Recipient 3 (Hope Shelter):
(8, 13, 'Handover OTP Available', 'Delivery #7 OTP is 841029. Food is currently in transit with volunteer Ramesh Kumar.', 'OTP_GENERATED', 'DELIVERY', 7, FALSE);

-- ----------------------------------------------------------------------------
-- 13. WASTE RECORDS
-- Recorded expired or spoiled food with responsible disposal methods
-- ----------------------------------------------------------------------------
INSERT INTO waste_records (id, donation_id, quantity, quantity_unit, waste_reason, disposal_method, notes, recorded_at) VALUES
(1, 17, 50.00, 'PORTIONS', 'EXPIRED_WITHOUT_ALLOCATION', 'COMPOSTING', 'Tomato rice prepared for cancelled evening gathering. Transferred to municipal organic composting plant.', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(2, 18, 30.00, 'PORTIONS', 'EXPIRED_BEFORE_DELIVERY', 'BIOGAS_GENERATION', 'Perishable milk sweets exceeded 24hr shelf life. Diverted to dairy farm anaerobic biogas digester.', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(3, 19, 40.00, 'PORTIONS', 'DONOR_CANCELLED_SPOILED', 'COMPOSTING', 'Packaging seal damaged during loading causing exposure. Safely composted.', DATE_SUB(NOW(), INTERVAL 8 HOUR));

-- ----------------------------------------------------------------------------
-- 14. VOLUNTEER REWARDS
-- Points and honor badges for completed deliveries
-- ----------------------------------------------------------------------------
INSERT INTO volunteer_rewards (id, volunteer_profile_id, points_awarded, reason, badge_name, awarded_at) VALUES
(1, 1, 50, 'DELIVERY_COMPLETED', 'FIRST_MILE_HERO', DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 1, 50, 'DELIVERY_COMPLETED', 'SPEEDY_HANDOVER', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 2, 75, 'DELIVERY_COMPLETED', 'CORRIDOR_CHAMPION', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(4, 3, 50, 'DELIVERY_COMPLETED', 'COMMUNITY_DRIVER', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(5, 4, 100, 'HIGH_QUANTITY_TRANSPORT', 'HEAVY_LIFTER', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 5, 50, 'DELIVERY_COMPLETED', 'LOCAL_GUARDIAN', DATE_SUB(NOW(), INTERVAL 9 HOUR)),
(7, 6, 120, 'HIGH_QUANTITY_TRANSPORT', 'DISTRIBUTION_TITAN', DATE_SUB(NOW(), INTERVAL 7 HOUR));

SET FOREIGN_KEY_CHECKS = 1;

-- Verification counts
SELECT 'users' AS tbl, COUNT(*) AS total_rows FROM users UNION ALL
SELECT 'donor_profiles', COUNT(*) FROM donor_profiles UNION ALL
SELECT 'recipient_profiles', COUNT(*) FROM recipient_profiles UNION ALL
SELECT 'volunteer_profiles', COUNT(*) FROM volunteer_profiles UNION ALL
SELECT 'vehicles', COUNT(*) FROM vehicles UNION ALL
SELECT 'food_donations', COUNT(*) FROM food_donations UNION ALL
SELECT 'food_allocations', COUNT(*) FROM food_allocations UNION ALL
SELECT 'deliveries', COUNT(*) FROM deliveries UNION ALL
SELECT 'delivery_assignments', COUNT(*) FROM delivery_assignments UNION ALL
SELECT 'road_nodes', COUNT(*) FROM road_nodes UNION ALL
SELECT 'road_edges', COUNT(*) FROM road_edges UNION ALL
SELECT 'otp_verifications', COUNT(*) FROM otp_verifications UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications UNION ALL
SELECT 'waste_records', COUNT(*) FROM waste_records UNION ALL
SELECT 'volunteer_rewards', COUNT(*) FROM volunteer_rewards;
