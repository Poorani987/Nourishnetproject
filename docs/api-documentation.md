# REST API Documentation: NourishNet

All endpoints are hosted under `/api`. Protected routes require the `Authorization: Bearer <token>` header.

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user as DONOR, RECIPIENT, or VEHICLE_VOLUNTEER |
| `POST` | `/api/auth/login` | Public | Authenticate user, returns JWT and user profile |
| `GET` | `/api/auth/me` | Authenticated | Get currently authenticated user details & role profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user contact info or role profile attributes |
| `PUT` | `/api/auth/change-password` | Authenticated | Change user password with current password verification |

---

## 2. Food Donations (`/api/donations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/donations/available` | Public / Auth | List available & partially allocated donations with filters |
| `GET` | `/api/donations/{id}` | Public / Auth | View single donation details and pickup windows |
| `GET` | `/api/donations/my` | DONOR | List all donations created by the authenticated donor |
| `POST` | `/api/donations` | DONOR | Create a new food donation listing |
| `PUT` | `/api/donations/{id}` | DONOR | Update an eligible unallocated donation |
| `POST` | `/api/donations/{id}/cancel` | DONOR | Cancel eligible donation |

---

## 3. Allocations & Requests (`/api/allocations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/allocations/request` | RECIPIENT | Request partial or full portions with concurrency checks |
| `GET` | `/api/allocations/my` | RECIPIENT | List all allocations requested by authenticated recipient |
| `GET` | `/api/allocations/donor` | DONOR | List allocations corresponding to donor's food |
| `POST` | `/api/allocations/{id}/cancel` | RECIPIENT | Cancel pending allocation before dispatch |

---

## 4. Volunteer & Deliveries (`/api/deliveries` & `/api/volunteers`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/deliveries/available` | VOLUNTEER | List unassigned deliveries within volunteer radius & capacity |
| `GET` | `/api/deliveries/my` | VOLUNTEER | List assignments currently accepted by volunteer |
| `POST` | `/api/deliveries/{id}/accept` | VOLUNTEER | Atomically claim delivery assignment |
| `PUT` | `/api/deliveries/{id}/status` | VOLUNTEER | Update status (PICKED_UP, IN_TRANSIT) |
| `GET` | `/api/volunteers/me/vehicle` | VOLUNTEER | View registered personal vehicle |
| `PUT` | `/api/volunteers/me/vehicle` | VOLUNTEER | Update vehicle specifications or capacity |
| `PUT` | `/api/volunteers/me/availability` | VOLUNTEER | Toggle volunteer availability status |

---

## 5. Route Optimization (`/api/routes`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/routes/nodes` | Public / Auth | List all road network nodes |
| `GET` | `/api/routes/edges` | Public / Auth | List all road network connections |
| `GET` | `/api/routes/calculate` | Public / Auth | Run Dijkstra algorithm between source and target node |

---

## 6. OTP Handover Verification (`/api/otp`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/otp/{deliveryId}` | RECIPIENT | Retrieve secure 6-digit OTP code for own delivery |
| `POST` | `/api/otp/verify` | VOLUNTEER | Verify OTP code upon arrival to confirm handover |

---

## 7. Notifications (`/api/notifications`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Authenticated | List in-app notifications for authenticated user |
| `GET` | `/api/notifications/unread-count` | Authenticated | Count of unread notifications |
| `PUT` | `/api/notifications/{id}/read` | Authenticated | Mark individual notification as read |
| `PUT` | `/api/notifications/read-all` | Authenticated | Mark all notifications as read |

---

## 8. Waste & Impact Analytics (`/api/impact` & `/api/waste`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/impact/summary` | Public / Auth | Aggregate platform impact metrics calculated from DB |
| `GET` | `/api/waste/my` | DONOR | View waste logs relating to donor's food |
| `POST` | `/api/waste/record` | DONOR | Log food expiration or spoiled event |
| `GET` | `/api/volunteers/me/rewards` | VOLUNTEER | View points balance and honor badges |
