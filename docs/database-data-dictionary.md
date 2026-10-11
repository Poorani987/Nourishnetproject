# Database Data Dictionary: NourishNet

This document provides a detailed data dictionary for all **15 relational tables** within the `nourishnet` database schema.

---

## 1. `users`
**Purpose**: Stores authentication credentials, contact information, geographic coordinates, and system roles.
Exactly 3 roles are supported: `DONOR`, `RECIPIENT`, and `VEHICLE_VOLUNTEER`. (No Admin role).

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Auto-increment unique user identifier |
| `full_name` | VARCHAR(100) | - | NO | NO | User or representative full legal name |
| `email` | VARCHAR(120) | - | NO | YES | Login email address with format validation |
| `password_hash` | VARCHAR(255) | - | NO | NO | Secure BCrypt salted password hash |
| `phone_number` | VARCHAR(20) | - | NO | NO | Contact telephone / mobile number |
| `role` | ENUM | - | NO | NO | Allowed values: `'DONOR'`, `'RECIPIENT'`, `'VEHICLE_VOLUNTEER'` |
| `address` | VARCHAR(255) | - | NO | NO | Street address or facility location |
| `city` | VARCHAR(80) | - | NO | NO | Municipality / City (e.g., Erode, Perundurai) |
| `state` | VARCHAR(80) | - | NO | NO | State (e.g., Tamil Nadu) |
| `pincode` | VARCHAR(15) | - | NO | NO | Postal PIN code |
| `latitude` | DECIMAL(10, 7) | - | YES | NO | Geographic latitude for proximity matching |
| `longitude` | DECIMAL(10, 7) | - | YES | NO | Geographic longitude for proximity matching |
| `created_at` | TIMESTAMP | - | NO | NO | Record creation timestamp |
| `updated_at` | TIMESTAMP | - | NO | NO | Last record update timestamp |

---

## 2. `donor_profiles`
**Purpose**: Stores specialized organization profiles for food donors (Restaurants, Messes, Caterers, Hotels).

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Profile primary identifier |
| `user_id` | BIGINT | FK | NO | YES | References `users(id)` (1-to-1 extension) |
| `organization_name` | VARCHAR(150) | - | NO | NO | Commercial or institution donor entity name |
| `organization_type` | VARCHAR(80) | - | NO | NO | E.g., RESTAURANT, HOSTEL_MESS, HOTEL, CATERING |
| `fssai_license` | VARCHAR(50) | - | YES | NO | Food safety license registration code |
| `contact_person` | VARCHAR(100) | - | NO | NO | On-site manager / kitchen supervisor |
| `pickup_instructions` | TEXT | - | YES | NO | Guidance on dock, gate, or packing |
| `operating_hours` | VARCHAR(100) | - | YES | NO | Regular facility operating window |
| `created_at` | TIMESTAMP | - | NO | NO | Profile creation timestamp |
| `updated_at` | TIMESTAMP | - | NO | NO | Profile update timestamp |

---

## 3. `recipient_profiles`
**Purpose**: Stores institutional recipient profiles (Orphanages, Old Age Homes, Shelters, Community Kitchens).

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Profile primary identifier |
| `user_id` | BIGINT | FK | NO | YES | References `users(id)` (1-to-1 extension) |
| `organization_name` | VARCHAR(150) | - | NO | NO | Charitable trust / shelter legal name |
| `organization_type` | VARCHAR(80) | - | NO | NO | E.g., ORPHANAGE, OLD_AGE_HOME, SHELTER |
| `contact_person` | VARCHAR(100) | - | NO | NO | Shelter head or trustee contact |
| `beneficiary_count` | INT | - | NO | NO | Number of dependents served (min: 1) |
| `dietary_preferences` | VARCHAR(100) | - | YES | NO | Vegetarian, Non-Vegetarian, or Any |
| `required_food_categories` | VARCHAR(255) | - | YES | NO | Comma-separated preferred categories |
| `allergen_restrictions` | VARCHAR(255) | - | YES | NO | Sensitive allergen flags |
| `delivery_instructions` | TEXT | - | YES | NO | Gate instructions or receiving rules |
| `created_at` | TIMESTAMP | - | NO | NO | Profile creation timestamp |
| `updated_at` | TIMESTAMP | - | NO | NO | Profile update timestamp |

---

## 4. `volunteer_profiles`
**Purpose**: Stores availability, service coverage, and gamification points for unpaid vehicle volunteers.

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Profile primary identifier |
| `user_id` | BIGINT | FK | NO | YES | References `users(id)` (1-to-1 extension) |
| `is_available` | BOOLEAN | - | NO | NO | Toggle indicating if volunteer is ready for duty |
| `service_radius_km` | DECIMAL(5, 2) | - | NO | NO | Maximum operating service radius in kilometres |
| `preferred_location` | VARCHAR(100) | - | YES | NO | Area name or sector preferred for pickups |
| `total_points` | INT | - | NO | NO | Cumulative reward points earned |
| `completed_deliveries_count` | INT | - | NO | NO | Total verified deliveries completed |
| `created_at` | TIMESTAMP | - | NO | NO | Profile creation timestamp |
| `updated_at` | TIMESTAMP | - | NO | NO | Profile update timestamp |

---

## 5. `vehicles`
**Purpose**: Details of personal vehicles voluntarily offered by volunteers (No paid fleets, no salaries).

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Vehicle record primary identifier |
| `volunteer_profile_id` | BIGINT | FK | NO | YES | References `volunteer_profiles(id)` (1-to-1) |
| `vehicle_type` | VARCHAR(50) | - | NO | NO | E.g., BICYCLE, MOTORCYCLE, AUTO_RICKSHAW, CAR, VAN, MINI_TRUCK |
| `registration_number` | VARCHAR(50) | - | NO | YES | State vehicle registration plate (e.g., TN33 AB 1204) |
| `capacity_value` | DECIMAL(8, 2) | - | NO | NO | Maximum payload volume or weight |
| `capacity_unit` | VARCHAR(20) | - | NO | NO | Unit of measure (default: 'KG') |
| `is_active` | BOOLEAN | - | NO | NO | Active vehicle status flag |
| `created_at` | TIMESTAMP | - | NO | NO | Registration timestamp |
| `updated_at` | TIMESTAMP | - | NO | NO | Last update timestamp |

---

## 6. `food_donations`
**Purpose**: Manages surplus food listings, portion balances, preparation/expiry timestamps, and safety metadata.

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Primary identifier of food donation |
| `donor_profile_id` | BIGINT | FK | NO | NO | References `donor_profiles(id)` |
| `food_name` | VARCHAR(150) | - | NO | NO | Description of the food offering |
| `food_category` | VARCHAR(50) | - | NO | NO | E.g., RICE_AND_MEALS, BREAD_AND_BAKERY, DAIRY, etc. |
| `food_type` | ENUM | - | NO | NO | Allowed: `'VEGETARIAN'`, `'NON_VEGETARIAN'` |
| `state_type` | ENUM | - | NO | NO | Allowed: `'COOKED'`, `'PACKAGED'` |
| `total_quantity` | DECIMAL(8, 2) | - | NO | NO | Total initial portions or units listed |
| `allocated_quantity` | DECIMAL(8, 2) | - | NO | NO | Portions claimed by recipients so far |
| `remaining_quantity` | DECIMAL(8, 2) | - | NO | NO | Portions currently available for claim |
| `quantity_unit` | VARCHAR(20) | - | NO | NO | E.g., 'PORTIONS', 'KG', 'PACKETS' |
| `preparation_time` | DATETIME | - | NO | NO | Exact preparation / cooking date-time |
| `consume_before` | DATETIME | - | NO | NO | Safe consumption deadline |
| `storage_requirements` | VARCHAR(100) | - | YES | NO | E.g., KEEP_WARM, REFRIGERATED, COOL_AND_DRY |
| `allergen_information` | VARCHAR(255) | - | YES | NO | Allergen notices (e.g., Dairy, Nuts, Gluten) |
| `pickup_address` | VARCHAR(255) | - | NO | NO | Physical location for food pickup |
| `pickup_latitude` | DECIMAL(10, 7) | - | YES | NO | Latitude coordinate |
| `pickup_longitude` | DECIMAL(10, 7) | - | YES | NO | Longitude coordinate |
| `pickup_window_start` | DATETIME | - | YES | NO | Opening of pickup window |
| `pickup_window_end` | DATETIME | - | YES | NO | Closing of pickup window |
| `status` | ENUM | - | NO | NO | `'AVAILABLE'`, `'PARTIALLY_ALLOCATED'`, `'FULLY_ALLOCATED'`, `'PICKED_UP'`, `'DELIVERED'`, `'EXPIRED'`, `'CANCELLED'` |
| `version` | BIGINT | - | NO | NO | Version number for JPA optimistic locking |
| `created_at` | TIMESTAMP | - | NO | NO | Donation creation timestamp |
| `updated_at` | TIMESTAMP | - | NO | NO | Donation update timestamp |

---

## 7. `food_allocations`
**Purpose**: Links recipient portion requests to food donations. Enforces the 15km transport rule.

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Allocation unique identifier |
| `donation_id` | BIGINT | FK | NO | NO | References `food_donations(id)` |
| `recipient_profile_id` | BIGINT | FK | NO | NO | References `recipient_profiles(id)` |
| `requested_quantity` | DECIMAL(8, 2) | - | NO | NO | Quantity requested by recipient |
| `allocated_quantity` | DECIMAL(8, 2) | - | NO | NO | Quantity officially allocated |
| `quantity_unit` | VARCHAR(20) | - | NO | NO | Units (e.g., 'PORTIONS') |
| `distance_km` | DECIMAL(6, 2) | - | NO | NO | Calculated route distance in km |
| `transport_responsibility` | ENUM | - | NO | NO | `'DONOR_OR_VOLUNTEER'` (if <=15km) or `'RECIPIENT_OR_VOLUNTEER'` (if >15km) |
| `status` | ENUM | - | NO | NO | `'PENDING'`, `'CONFIRMED'`, `'DELIVERED'`, `'CANCELLED'` |
| `created_at` | TIMESTAMP | - | NO | NO | Creation timestamp |
| `updated_at` | TIMESTAMP | - | NO | NO | Last status update timestamp |

---

## 8. `deliveries`
**Purpose**: Tracks physical dispatch lifecycle for food allocations.

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Delivery tracking identifier |
| `allocation_id` | BIGINT | FK | NO | YES | References `food_allocations(id)` (1-to-1) |
| `status` | ENUM | - | NO | NO | `'PENDING'`, `'ASSIGNED'`, `'PICKED_UP'`, `'IN_TRANSIT'`, `'DELIVERED'`, `'CANCELLED'` |
| `distance_km` | DECIMAL(6, 2) | - | NO | NO | Route travel distance |
| `transport_responsibility` | ENUM | - | NO | NO | Transport responsibility policy label |
| `pickup_address` | VARCHAR(255) | - | NO | NO | Source address |
| `delivery_address` | VARCHAR(255) | - | NO | NO | Destination address |
| `delivery_deadline` | DATETIME | - | NO | NO | Cutoff timestamp ensuring food safety |
| `created_at` | TIMESTAMP | - | NO | NO | Record creation timestamp |
| `updated_at` | TIMESTAMP | - | NO | NO | Last status update timestamp |

---

## 9. `delivery_assignments`
**Purpose**: Links an assigned volunteer to an active delivery.

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Assignment identifier |
| `delivery_id` | BIGINT | FK | NO | YES | References `deliveries(id)` (1-to-1) |
| `volunteer_profile_id` | BIGINT | FK | NO | NO | References `volunteer_profiles(id)` |
| `assigned_at` | TIMESTAMP | - | NO | NO | Volunteer acceptance timestamp |
| `picked_up_at` | DATETIME | - | YES | NO | Verified pickup departure timestamp |
| `delivered_at` | DATETIME | - | YES | NO | Verified OTP handover completion timestamp |
| `notes` | TEXT | - | YES | NO | Driver notes or special observations |
| `created_at` | TIMESTAMP | - | NO | NO | Creation timestamp |
| `updated_at` | TIMESTAMP | - | NO | NO | Modification timestamp |

---

## 10. `road_nodes`
**Purpose**: Graph vertices representing geographical junctions and hubs for Dijkstra's shortest path algorithm.

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Node identifier |
| `node_code` | VARCHAR(30) | - | NO | YES | Unique alphanumeric mnemonic code (e.g. NODE_ERODE_BS) |
| `node_name` | VARCHAR(100) | - | NO | NO | Human readable landmark name |
| `area_name` | VARCHAR(80) | - | NO | NO | Town or neighborhood name |
| `latitude` | DECIMAL(10, 7) | - | NO | NO | Geographical latitude coordinate |
| `longitude` | DECIMAL(10, 7) | - | NO | NO | Geographical longitude coordinate |
| `created_at` | TIMESTAMP | - | NO | NO | Record creation timestamp |

---

## 11. `road_edges`
**Purpose**: Graph edges storing road connections and distances in kilometres for Dijkstra calculations.

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Edge identifier |
| `source_node_id` | BIGINT | FK | NO | NO | References origin `road_nodes(id)` |
| `target_node_id` | BIGINT | FK | NO | NO | References destination `road_nodes(id)` |
| `road_name` | VARCHAR(100) | - | NO | NO | Highway or street name (e.g. NH544 Expressway) |
| `distance_km` | DECIMAL(6, 2) | - | NO | NO | Road connection distance in kilometres |
| `is_bidirectional` | BOOLEAN | - | NO | NO | Whether edge can be traversed in both directions |
| `created_at` | TIMESTAMP | - | NO | NO | Record creation timestamp |

---

## 12. `otp_verifications`
**Purpose**: Manages 6-digit cryptographic handover tokens to ensure recipient physically receives the meal.

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Token verification identifier |
| `delivery_id` | BIGINT | FK | NO | YES | References `deliveries(id)` (1-to-1) |
| `recipient_profile_id` | BIGINT | FK | NO | NO | References authorized `recipient_profiles(id)` |
| `otp_code_hash` | VARCHAR(255) | - | NO | NO | Cryptographic hash for verification |
| `plain_otp_for_recipient`| VARCHAR(10) | - | NO | NO | Authorized viewable OTP for recipient only |
| `expires_at` | DATETIME | - | NO | NO | Handover token expiration timestamp |
| `is_used` | BOOLEAN | - | NO | NO | Flag indicating if OTP was verified |
| `attempt_count` | INT | - | NO | NO | Invalid attempt counter (Rate limiting) |
| `max_attempts` | INT | - | NO | NO | Threshold of allowed attempts (default: 5) |
| `verified_at` | DATETIME | - | YES | NO | Handover verification timestamp |
| `created_at` | TIMESTAMP | - | NO | NO | Generation timestamp |

---

## 13. `notifications`
**Purpose**: In-app database notifications for real-time alerts across all roles.

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Notification identifier |
| `user_id` | BIGINT | FK | NO | NO | References target `users(id)` |
| `title` | VARCHAR(150) | - | NO | NO | Alert title |
| `message` | TEXT | - | NO | NO | Descriptive notification content |
| `notification_type` | VARCHAR(50) | - | NO | NO | E.g. ALLOCATION_REQUEST, OTP_GENERATED, EXPIRY_ALERT |
| `related_entity_type` | VARCHAR(50) | - | YES | NO | Name of related entity (e.g. DELIVERY) |
| `related_entity_id` | BIGINT | - | YES | NO | ID of related entity |
| `is_read` | BOOLEAN | - | NO | NO | Read/unread flag |
| `created_at` | TIMESTAMP | - | NO | NO | Alert timestamp |

---

## 14. `waste_records`
**Purpose**: Logs expired or cancelled food with quantities and sustainable disposal methods (Composting, Biogas).

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Waste log identifier |
| `donation_id` | BIGINT | FK | NO | NO | References origin `food_donations(id)` |
| `quantity` | DECIMAL(8, 2) | - | NO | NO | Quantity spoiled or disposed |
| `quantity_unit` | VARCHAR(20) | - | NO | NO | Measurement unit (e.g. 'PORTIONS') |
| `waste_reason` | VARCHAR(100) | - | NO | NO | E.g. EXPIRED_WITHOUT_ALLOCATION, EXPIRED_BEFORE_DELIVERY |
| `disposal_method` | VARCHAR(100) | - | NO | NO | E.g. COMPOSTING, BIOGAS_GENERATION, MUNICIPAL |
| `notes` | TEXT | - | YES | NO | Incident details |
| `recorded_at` | DATETIME | - | NO | NO | Waste occurrence timestamp |
| `created_at` | TIMESTAMP | - | NO | NO | Entry creation timestamp |

---

## 15. `volunteer_rewards`
**Purpose**: Gamification tracking points and honor badges for completed deliveries.

| Column Name | Data Type | Key | Nullable | Unique | Description |
|---|---|---|---|---|---|
| `id` | BIGINT | PK | NO | YES | Reward identifier |
| `volunteer_profile_id` | BIGINT | FK | NO | NO | References `volunteer_profiles(id)` |
| `points_awarded` | INT | - | NO | NO | Points credited for action |
| `reason` | VARCHAR(100) | - | NO | NO | E.g. DELIVERY_COMPLETED, SPEEDY_HANDOVER |
| `badge_name` | VARCHAR(50) | - | YES | NO | E.g. FIRST_MILE_HERO, DISTRIBUTION_TITAN |
| `awarded_at` | TIMESTAMP | - | NO | NO | Credited timestamp |
