# Database Design Document: NourishNet

## 1. System Overview
**NourishNet** is an academic full-stack platform designed to eliminate edible food waste by connecting food donors (Restaurants, Messes, Caterers), recipients (Shelters, Orphanages, Community Centers), and volunteer vehicle owners.

To ensure academic rigour, the database layer is modeled in **MySQL 8.0+** using the **InnoDB storage engine**, with full ACID compliance, foreign key integrity, check constraints, composite performance indexes, and optimistic locking.

---

## 2. Key Architectural Decisions

### 2.1 Exactly Three User Roles (Strictly No Admin)
The system operates autonomously with three user roles:
- `DONOR`
- `RECIPIENT`
- `VEHICLE_VOLUNTEER`

No administrative credentials or admin-managed fleets are introduced. Business rules, allocation calculations, expiry tracking, and status transitions are governed entirely by database constraints and backend business logic.

### 2.2 Relational Normalization (3NF)
- **Identity & Profiles**: A central `users` table holds authentication and geographic location. Role-specific attributes reside in `donor_profiles`, `recipient_profiles`, and `volunteer_profiles` linked via 1-to-1 foreign keys with `ON DELETE CASCADE`.
- **Vehicles**: Vehicles are recorded separately in `vehicles` and uniquely owned by a `volunteer_profile`.
- **Lifecycle Pipeline**:
  - `food_donations`: The supply of surplus food.
  - `food_allocations`: Recipient demands claiming portions.
  - `deliveries`: Physical transport jobs generated upon allocation.
  - `delivery_assignments`: Voluntary claim by a driver.
  - `otp_verifications`: Handover token security.

### 2.3 The 15-Kilometre Transport Policy
The application enforces a regional transport policy:
- **<= 15 km**: Transport responsibility belongs to `DONOR_OR_VOLUNTEER`. Donors can deliver directly or an available local volunteer steps in.
- **> 15 km**: Transport responsibility belongs to `RECIPIENT_OR_VOLUNTEER`. The recipient coordinates pickup or requests a long-distance volunteer.

This policy is represented in both `food_allocations` and `deliveries` tables via the `transport_responsibility` column.

### 2.4 Optimistic Concurrency Control for Partial Allocations
When multiple recipients view an active donation (e.g., 100 portions) and concurrently attempt to claim portions (e.g. 60 and 50), the system must prevent over-allocation.
- `food_donations` contains a `version` BIGINT column.
- Spring Data JPA leverages `@Version` alongside transactional checks:
  ```sql
  UPDATE food_donations 
  SET remaining_quantity = remaining_quantity - :requested,
      allocated_quantity = allocated_quantity + :requested,
      version = version + 1
  WHERE id = :id AND version = :version AND remaining_quantity >= :requested;
  ```
- If two recipients submit simultaneously, the second transaction detects a version conflict, rolls back safely, and informs the user with an accurate updated portion balance.

### 2.5 Dijkstra Road Graph Representation
Rather than relying on mocked external navigation APIs, NourishNet implements Dijkstra's shortest path algorithm inside the Spring Boot backend:
- `road_nodes`: Vertices representing regional junctions (Erode, Perundurai, Chithode, Bhavani, Gobichettipalayam).
- `road_edges`: Directed/bidirectional weighted edges storing distance in kilometres.

---

## 3. Relationship Map

```
users (1) <--- (1) donor_profiles (1) <--- (N) food_donations (1) <--- (N) food_allocations
users (1) <--- (1) recipient_profiles (1) <-------------------------- (N) food_allocations
users (1) <--- (1) volunteer_profiles (1) <--- (1) vehicles
volunteer_profiles (1) <--- (N) delivery_assignments
food_allocations (1) <--- (1) deliveries (1) <--- (1) delivery_assignments
deliveries (1) <--- (1) otp_verifications
road_nodes (1) <--- (N) road_edges (Source & Target)
users (1) <--- (N) notifications
food_donations (1) <--- (N) waste_records
volunteer_profiles (1) <--- (N) volunteer_rewards
```

---

## 4. Integrity Constraints Summary
1. **Email Uniqueness & Format**: Unique index + regex check constraint in `users`.
2. **Vehicle Uniqueness**: Unique constraint on vehicle registration number.
3. **Quantity Integrity**: Check constraint enforcing `total_quantity > 0`, `remaining_quantity >= 0`, and `allocated_quantity >= 0`.
4. **Time Consistency**: Check constraint enforcing `consume_before > preparation_time`.
5. **Distance Positivity**: Check constraints ensuring edge and delivery distances are strictly non-negative.
