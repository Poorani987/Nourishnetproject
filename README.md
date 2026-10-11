# NourishNet: Smart Food Redistribution and Waste Management System

A production-grade, full-stack web application designed for academic evaluation (2nd-Year B.E. Computer Science and Engineering) to eliminate localized food waste and streamline surplus food redistribution across communities, shelters, and orphanages.

---

## 1. Problem Statement
Every day, substantial quantities of wholesome, edible cooked and packaged food from hotels, wedding halls, restaurants, college messes, and supermarkets are discarded. Concurrently, nearby charitable shelters, orphanages, and community centers face persistent shortages. The absence of a transparent, real-time coordination platform with algorithmic routing, food safety expiry controls, and handover verification leads to unnecessary spoilage.

## 2. Project Objectives
1. **Zero Food Spoilage**: Rapid redistribution of surplus food before safety deadlines expire.
2. **Deterministic Role Segregation**: Provide dedicated interfaces for Donors, Recipients, and Unpaid Vehicle Volunteers without an administrative bottleneck or paid transport marketplace.
3. **15-Kilometre Policy Enforcement**: Dynamically categorize delivery logistics based on road distance.
4. **Algorithmic Route Optimization**: Calculate shortest road paths using a native Java Dijkstra graph algorithm over the Erode regional road network.
5. **Secure Handover Verification**: Implement a time-limited 6-digit OTP verification protocol between recipient and driver.
6. **Relational Data Integrity**: Guarantee atomic multi-step portion allocations, preventing race conditions and over-allocation.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom palette (Cream `#FBF7EE`, Forest Green `#14532D`, Primary Green `#217A43`, Soft Green `#DDF0DA`, Orange Accent `#F58220`)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **HTTP Client**: Axios with JWT interceptors

### Backend
- **Platform**: Java 21 LTS / Spring Boot 3.3.4
- **Security**: Spring Security 6 with JJWT (`io.jsonwebtoken:0.12.5`) and BCrypt password hashing
- **Persistence**: Spring Data JPA & Hibernate with schema validation (`ddl-auto=validate`)
- **Algorithms**: Native Dijkstra Shortest Path algorithm implemented in Java (`DijkstraService`)
- **Validation**: Jakarta Validation (`jakarta.validation-api`)
- **Build Tool**: Apache Maven

### Database
- **Database Engine**: MySQL 8.0+ (InnoDB)
- **Tooling**: MySQL Workbench for manual schema generation, inspection, and queries
- **Connector**: MySQL Connector/J

### Testing
- **Backend**: JUnit 5, Spring Boot Test, Mockito (19 automated unit & service tests passing)

---

## 4. User Roles (Exactly Three — Strictly No Admin)

The system is designed with **autonomous peer coordination** and has **no Admin role, no admin dashboard, and no paid driver marketplace**:

1. **DONOR**:
   - Hotels, restaurants, college messes, wedding halls, and institutions.
   - List surplus food with preparation time, consume-before deadline, food category, dietary classification (Veg/Non-Veg, Cooked/Packaged), and storage requirements.
   - Track portions claimed, view active pickups, log waste events, and inspect food waste diversion metrics.

2. **RECIPIENT**:
   - Orphanages, old-age homes, charitable shelters, and community welfare organizations.
   - Browse real-time surplus listings with dietary filters.
   - Request partial portions (e.g., claiming 30 portions out of 100 available).
   - Track delivery status and view their unique **6-digit Handover Verification OTP**.

3. **VEHICLE_VOLUNTEER**:
   - Civic volunteers offering personal vehicles (Bicycle, Motorcycle, Auto, Car, Van, Mini Truck) on an unpaid, voluntary basis.
   - Manage vehicle capacity and toggle on-duty availability.
   - Browse eligible deliveries within their service radius, accept runs atomically, follow Dijkstra routes, and submit recipient OTPs to seal handovers.

---

## 5. System Architecture & Transport Rules

```
+-------------------------------------------------------------+
|                React 18 + Vite Frontend                     |
|  [Donor Dashboard]  [Recipient Dashboard]  [Volunteer Hub]   |
+------------------------------+------------------------------+
                               | REST API (HTTP / JSON + JWT)
                               v
+-------------------------------------------------------------+
|              Java Spring Boot 3.3.4 Backend                 |
|  - Security & BCrypt Filters       - Allocation Locking      |
|  - Dijkstra Shortest Path Engine   - OTP Handover Manager   |
|  - 15 km Transport Policy Engine   - Impact & Waste Logger  |
+------------------------------+------------------------------+
                               | Spring Data JPA / Hibernate
                               v
+-------------------------------------------------------------+
|                     MySQL 8.0 Database                      |
|                (Managed via MySQL Workbench)                |
+-------------------------------------------------------------+
```

### 15-Kilometre Transport Policy
- **Distance &le; 15 km**: Local volunteer run or donor drop-off. Prioritized for quick dispatch.
- **Distance &gt; 15 km**: Extended route requiring recipient self-pickup or specialized multi-hop volunteer coordination.
- *Notice*: The system clearly identifies illustrative road graph distances and never fabricates GPS live tracking.

---

## 6. Database Architecture & SQL Scripts

The relational database `nourishnet` is designed to be executed manually in **MySQL Workbench** before running the Spring Boot backend.

### Table Inventory (15 InnoDB Tables)
1. `users`: Core authentication, BCrypt hash, and role enum (`DONOR`, `RECIPIENT`, `VEHICLE_VOLUNTEER`).
2. `donor_profiles`: Organization name, contact, pickup address, coordinates.
3. `recipient_profiles`: Shelter name, dietary needs, allergen restrictions, daily portion demand.
4. `volunteer_profiles`: Unpaid volunteer details, availability status, service radius.
5. `vehicles`: Vehicle type, registration number, payload capacity, and units.
6. `food_donations`: Surplus food items, total quantity, remaining quantity, expiry deadlines, and status.
7. `food_allocations`: Portion reservation claims by recipients with atomic concurrency safety.
8. `deliveries`: Transport lifecycle records with distance calculation.
9. `delivery_assignments`: Junction linking deliveries to accepted volunteers.
10. `road_nodes`: Regional junction nodes (Erode, Perundurai, Bhavani, Chithode, Gobichettipalayam).
11. `road_edges`: Weighted road connections with distance in kilometers.
12. `otp_verifications`: Short-lived, secure 6-digit handover OTPs with attempt throttling.
13. `notifications`: In-app notification queue.
14. `waste_records`: Audit log of spoiled or unclaimed food and recovery methods.
15. `volunteer_rewards`: Gamified volunteer impact points and community badges.

### Documentation References
- [docs/database-design.md](docs/database-design.md): Deep-dive into schema normalization and design decisions.
- [docs/ER_DIAGRAM.md](docs/ER_DIAGRAM.md) & [docs/er-diagram.mmd](docs/er-diagram.mmd): Visual Mermaid ER Diagram.
- [docs/database-data-dictionary.md](docs/database-data-dictionary.md): Comprehensive data dictionary for all 15 tables.
- [docs/architecture.md](docs/architecture.md): System architecture, concurrency, and security overview.
- [docs/api-documentation.md](docs/api-documentation.md): Complete REST API endpoint reference.

---

## 7. Step-by-Step Setup Guide

### Prerequisites
- **Java Development Kit (JDK)**: Java 21 or higher installed (`java -version`).
- **Apache Maven**: Maven 3.8+ installed (`mvn -version`).
- **Node.js & npm**: Node.js 18+ installed (`node -v`).
- **MySQL Server**: MySQL 8.0+ installed and running on port `3306`.
- **MySQL Workbench**: Installed for executing database setup scripts.

---

### Step 1: Execute SQL Scripts in MySQL Workbench

Open **MySQL Workbench**, connect to your local MySQL Server (`localhost:3306`), and execute the scripts located in `database/` in the exact numerical order:

1. **`database/01_create_database.sql`**: Creates the `nourishnet` database with `utf8mb4` character set.
2. **`database/02_create_tables.sql`**: Generates all 15 normalized tables, foreign keys, and check constraints.
3. **`database/03_insert_sample_data.sql`**: Populates realistic demonstration data (10 Donors, 7 Recipients, 8 Volunteers, 8 Vehicles, 22 Food Donations, 12 Deliveries, Road Network Graph, OTPs, Notifications).
4. **`database/04_indexes_and_constraints.sql`**: Creates performance composite indexes for high-frequency queries.
5. **`database/05_verification_queries.sql`**: 14 demonstration queries for your project mentor review.

> [!NOTE]
> All sample user accounts in `03_insert_sample_data.sql` use the default password: **`password123`**.

---

### Step 2: Configure Backend Environment Variables

In **Windows PowerShell**, configure your MySQL credentials without modifying code:

```powershell
# Set your MySQL root password
$env:DB_URL="jdbc:mysql://localhost:3306/nourishnet"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_actual_mysql_password"
```

Verify that the variables are registered:
```powershell
Get-ChildItem env:DB_*
```

---

### Step 3: Run Backend Tests and Start Spring Boot

In your project root:

```powershell
# Navigate to the backend directory
cd backend

# Execute unit and service tests
mvn test

# Start the Spring Boot application
mvn spring-boot:run
```

The backend server starts on **`http://localhost:8081`** (Vite automatically proxies `/api` from `5173`).

---

### Step 4: Start Frontend Development Server

In a second PowerShell terminal:

```powershell
# Navigate to the frontend directory
cd frontend

# Install dependencies (use npm.cmd on Windows)
npm.cmd install

# Start Vite development server
npm.cmd run dev
```

The frontend application opens on **`http://localhost:5173`**.

---

## 8. Sample Demonstration Accounts

You can test any role immediately using these pre-seeded accounts:

| Role | Email | Password | Organization / Notes |
| :--- | :--- | :--- | :--- |
| **DONOR** | `erode.kitchen@example.com` | `password123` | Annapoorna Community Kitchen (Erode) |
| **DONOR** | `hotel.saravana@example.com` | `password123` | Hotel Saravana Grand (Perundurai) |
| **DONOR** | `kongu.catering@example.com` | `password123` | Kongu Royal Caterers (Bhavani) |
| **RECIPIENT** | `erode.children@example.com` | `password123` | Karunai Illam Children Home (Erode) |
| **RECIPIENT** | `perundurai.peace@example.com` | `password123` | Shanthi Old Age Home (Perundurai) |
| **RECIPIENT** | `bhavani.shelter@example.com` | `password123` | Jeeva Jyothi Shelter (Bhavani) |
| **VOLUNTEER** | `karthik.drive@example.com` | `password123` | Karthik S. (Motorcycle, 35 Portions) |
| **VOLUNTEER** | `saravanan.van@example.com` | `password123` | Saravanan M. (Omni Van, 150 Portions) |
| **VOLUNTEER** | `praveen.auto@example.com` | `password123` | Praveen Kumar (Auto, 80 Portions) |

---

## 9. Academic Demonstration Workflow (For Mentor Review)

1. **Surplus Listing (Donor)**:
   - Log in as `erode.kitchen@example.com`.
   - Post a surplus batch of 60 portions of *Vegetable Biryani & Dal*.
   - Notice the status becomes `AVAILABLE` and appears on the public food directory.
2. **Partial Allocation (Recipient)**:
   - Log in as `erode.children@example.com`.
   - Claim 25 portions (leaving 35 portions remaining).
   - The listing updates to `PARTIALLY_ALLOCATED`.
   - A pending delivery record is created, and the recipient is issued a secret **6-Digit Handover OTP**.
3. **Dispatch & Route Optimization (Volunteer)**:
   - Log in as `karthik.drive@example.com`.
   - View the available delivery run. Notice the 15 km policy badge.
   - Click **Accept Delivery Run** to atomically bind the dispatch.
   - Advance status to `PICKED_UP` and `IN_TRANSIT`.
   - Open **Dijkstra Route Map** to calculate the optimal road distance between the hubs.
4. **Secure OTP Handover**:
   - As the recipient, open the delivery card to read the OTP (e.g., `482910`).
   - As the volunteer, click **Verify Handover OTP**, enter the 6 digits, and submit.
   - The delivery updates to `DELIVERED`, portions are marked received, and volunteer impact points are awarded.
5. **Waste Tracking & Metrics**:
   - View the Donor's **Waste Records** to observe diverted versus composted food metrics.

---

## 10. Verification Queries for Project Review

Run these queries in **MySQL Workbench** (`database/05_verification_queries.sql`):
```sql
-- 1. Check all registered users by role
SELECT role, COUNT(*) AS count FROM users GROUP BY role;

-- 2. Inspect active food inventory and remaining portions
SELECT id, food_name, remaining_quantity, total_quantity, donation_status, consume_before FROM food_donations;

-- 3. Verify OTP verification logs
SELECT id, delivery_id, is_used, attempt_count, expires_at FROM otp_verifications;

-- 4. Calculate total community impact
SELECT 
    (SELECT COALESCE(SUM(total_quantity), 0) FROM food_donations) AS total_donated_portions,
    (SELECT COALESCE(SUM(allocated_quantity), 0) FROM food_allocations WHERE allocation_status = 'DELIVERED') AS total_delivered_portions;
```

---

## 11. Troubleshooting Guide

- **`Communications link failure` on startup**:
  - Ensure MySQL Server is active on port 3306 (`net start MySQL80`).
  - Verify `$env:DB_PASSWORD` matches your local MySQL root password.
- **`SchemaManagementException: Schema-validation: missing table [nourishnet.users]`**:
  - Run `01_create_database.sql` and `02_create_tables.sql` in MySQL Workbench first. Spring Boot validates the existing schema.
- **PowerShell script execution disabled**:
  - Run commands with `.cmd` extension (e.g., `npm.cmd install`, `npm.cmd run dev`).

---

## 12. License & Academic Attribution
Developed for 2nd-Year B.E. Computer Science and Engineering Academic Evaluation. Independent implementation built strictly from scratch according to relational software engineering standards.
