# Architecture Document: NourishNet

## 1. System Overview
NourishNet is a full-stack, three-tier web application built with a decoupled architecture:
1. **Presentation Layer**: Single Page Application (SPA) using React 18, TypeScript, Tailwind CSS, Vite, and Lucide React icons.
2. **Application / Business Layer**: Java 21/25 with Spring Boot 3.3+, Spring Web REST API, Spring Security, BCrypt, and Hibernate/JPA.
3. **Data Layer**: MySQL 8.0+ relational database managed via MySQL Workbench.

```
+-------------------------------------------------------------+
|                     Client Browser                          |
|         React 18 + TypeScript + Tailwind CSS (Vite)          |
+-------------------------------------------------------------+
                               |
                               | HTTPS / JSON REST API
                               v
+-------------------------------------------------------------+
|                   Spring Boot Backend                       |
|   Security (JWT) | Controllers | Services | Repositories    |
|   - Dijkstra Routing Engine                                 |
|   - Concurrency-safe Partial Allocation Service             |
|   - Delivery State Machine & Handover Verification          |
+-------------------------------------------------------------+
                               |
                               | JDBC / Hibernate (ddl-auto: validate)
                               v
+-------------------------------------------------------------+
|                      MySQL 8.0+                             |
|          15 Relational InnoDB Tables + Constraints          |
+-------------------------------------------------------------+
```

---

## 2. Security Architecture
- **Stateless Authentication**: Uses standard JSON Web Tokens (JWT) issued upon successful authentication with BCrypt password verification.
- **Role-Based Access Control (RBAC)**: Exactly three roles (`DONOR`, `RECIPIENT`, `VEHICLE_VOLUNTEER`). Enforced via `@PreAuthorize("hasRole('...')")` and URL matchers in `SecurityFilterChain`.
- **Ownership Verification**: Donors can only modify their own donations. Recipients can only view their own OTPs and allocations. Volunteers can only update deliveries explicitly assigned to them.
- **Handover Security**: OTP is a 6-digit random number generated at delivery creation. The recipient retrieves it securely; the volunteer inputs it upon physical arrival. 5 failed attempts locks verification.

---

## 3. Dijkstra Shortest-Path Engine
A core feature of the backend is the implementation of **Dijkstra's Shortest Path Algorithm** on the road network:
- Nodes (`road_nodes`) and edges (`road_edges`) are loaded into an in-memory weighted adjacency list or queried on demand.
- Given `sourceNodeId` and `targetNodeId`, Dijkstra computes:
  - The ordered sequence of vertices: `[Node A -> Node B -> Node C]`.
  - The total accumulated distance in kilometres.
  - Intermediate route segments with road names and segment distances.
- Detects unreachable nodes or invalid IDs with clear 404/400 errors.

---

## 4. Delivery State Machine
The delivery lifecycle strictly transitions as follows:
```
           [PENDING]
               |  (Volunteer accepts eligible delivery)
               v
          [ASSIGNED]
               |  (Volunteer reaches donor, confirms pickup)
               v
          [PICKED_UP]
               |  (Volunteer starts journey)
               v
         [IN_TRANSIT]
               |  (Recipient shares OTP, Volunteer enters OTP, Verified)
               v
          [DELIVERED]
```
Cancelled deliveries move to `CANCELLED`, freeing up or recording waste as appropriate.

---

## 5. Technology Matrix

| Layer | Component | Version / Tech |
|---|---|---|
| Frontend | UI Library | React 18 with TypeScript |
| Frontend | Build Tool | Vite 6 |
| Frontend | Styling | Tailwind CSS 3.4 (Curated Palette: #FBF7EE, #14532D, #217A43, #F58220) |
| Frontend | Icons | Lucide React |
| Frontend | Routing | React Router DOM v6 |
| Backend | Language | Java 21 / 25 |
| Backend | Framework | Spring Boot 3.3.4 |
| Backend | ORM | Spring Data JPA / Hibernate |
| Backend | Security | Spring Security 6 + JJWT 0.12.5 |
| Backend | Build Tool | Apache Maven 3.9.9 |
| Database | Engine | MySQL Server 8.0+ (InnoDB) |
| Database | Tool | MySQL Workbench |
