# Entity Relationship (ER) Diagram: NourishNet

This document outlines the complete relational model for **NourishNet**. It visualizes entity cardinalities, foreign key references, and operational workflows.

## Visual ER Diagram (Mermaid)

```mermaid
erDiagram
    users ||--o| donor_profiles : "1-to-1 extension"
    users ||--o| recipient_profiles : "1-to-1 extension"
    users ||--o| volunteer_profiles : "1-to-1 extension"
    users ||--o{ notifications : "receives"

    volunteer_profiles ||--|| vehicles : "owns/operates"
    volunteer_profiles ||--o{ delivery_assignments : "accepts"
    volunteer_profiles ||--o{ volunteer_rewards : "earns"

    donor_profiles ||--o{ food_donations : "posts"
    food_donations ||--o{ food_allocations : "allocated_to"
    food_donations ||--o{ waste_records : "logs_waste"

    recipient_profiles ||--o{ food_allocations : "requests"
    recipient_profiles ||--o{ otp_verifications : "holds_otp"

    food_allocations ||--|| deliveries : "initiates"
    deliveries ||--o| delivery_assignments : "assigned_to"
    deliveries ||--|| otp_verifications : "verified_by"

    road_nodes ||--o{ road_edges : "source_node"
    road_nodes ||--o{ road_edges : "target_node"

    users {
        bigint id PK
        string full_name
        string email UK
        string password_hash
        string phone_number
        enum role "DONOR, RECIPIENT, VEHICLE_VOLUNTEER"
        string address
        string city
        string state
        string pincode
        decimal latitude
        decimal longitude
        timestamp created_at
        timestamp updated_at
    }

    donor_profiles {
        bigint id PK
        bigint user_id FK,UK
        string organization_name
        string organization_type
        string fssai_license
        string contact_person
        text pickup_instructions
        string operating_hours
        timestamp created_at
        timestamp updated_at
    }

    recipient_profiles {
        bigint id PK
        bigint user_id FK,UK
        string organization_name
        string organization_type
        string contact_person
        int beneficiary_count
        string dietary_preferences
        string required_food_categories
        string allergen_restrictions
        text delivery_instructions
        timestamp created_at
        timestamp updated_at
    }

    volunteer_profiles {
        bigint id PK
        bigint user_id FK,UK
        boolean is_available
        decimal service_radius_km
        string preferred_location
        int total_points
        int completed_deliveries_count
        timestamp created_at
        timestamp updated_at
    }

    vehicles {
        bigint id PK
        bigint volunteer_profile_id FK,UK
        string vehicle_type
        string registration_number UK
        decimal capacity_value
        string capacity_unit
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    food_donations {
        bigint id PK
        bigint donor_profile_id FK
        string food_name
        string food_category
        enum food_type "VEGETARIAN, NON_VEGETARIAN"
        enum state_type "COOKED, PACKAGED"
        decimal total_quantity
        decimal allocated_quantity
        decimal remaining_quantity
        string quantity_unit
        datetime preparation_time
        datetime consume_before
        string storage_requirements
        string allergen_information
        string pickup_address
        decimal pickup_latitude
        decimal pickup_longitude
        datetime pickup_window_start
        datetime pickup_window_end
        enum status "AVAILABLE, PARTIALLY_ALLOCATED, FULLY_ALLOCATED, PICKED_UP, DELIVERED, EXPIRED, CANCELLED"
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    food_allocations {
        bigint id PK
        bigint donation_id FK
        bigint recipient_profile_id FK
        decimal requested_quantity
        decimal allocated_quantity
        string quantity_unit
        decimal distance_km
        enum transport_responsibility "DONOR_OR_VOLUNTEER, RECIPIENT_OR_VOLUNTEER"
        enum status "PENDING, CONFIRMED, DELIVERED, CANCELLED"
        timestamp created_at
        timestamp updated_at
    }

    deliveries {
        bigint id PK
        bigint allocation_id FK,UK
        enum status "PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED"
        decimal distance_km
        enum transport_responsibility "DONOR_OR_VOLUNTEER, RECIPIENT_OR_VOLUNTEER"
        string pickup_address
        string delivery_address
        datetime delivery_deadline
        timestamp created_at
        timestamp updated_at
    }

    delivery_assignments {
        bigint id PK
        bigint delivery_id FK,UK
        bigint volunteer_profile_id FK
        timestamp assigned_at
        datetime picked_up_at
        datetime delivered_at
        text notes
        timestamp created_at
        timestamp updated_at
    }

    road_nodes {
        bigint id PK
        string node_code UK
        string node_name
        string area_name
        decimal latitude
        decimal longitude
        timestamp created_at
    }

    road_edges {
        bigint id PK
        bigint source_node_id FK
        bigint target_node_id FK
        string road_name
        decimal distance_km
        boolean is_bidirectional
        timestamp created_at
    }

    otp_verifications {
        bigint id PK
        bigint delivery_id FK,UK
        bigint recipient_profile_id FK
        string otp_code_hash
        string plain_otp_for_recipient
        datetime expires_at
        boolean is_used
        int attempt_count
        int max_attempts
        datetime verified_at
        timestamp created_at
    }

    notifications {
        bigint id PK
        bigint user_id FK
        string title
        text message
        string notification_type
        string related_entity_type
        bigint related_entity_id
        boolean is_read
        timestamp created_at
    }

    waste_records {
        bigint id PK
        bigint donation_id FK
        decimal quantity
        string quantity_unit
        string waste_reason
        string disposal_method
        text notes
        datetime recorded_at
        timestamp created_at
    }

    volunteer_rewards {
        bigint id PK
        bigint volunteer_profile_id FK
        int points_awarded
        string reason
        string badge_name
        timestamp awarded_at
    }
```

---

## Instructions to Render and Export

1. **In Markdown Preview / VS Code**: Ensure Mermaid preview plugin is enabled or view directly in GitHub / IDE markdown viewer.
2. **Online Mermaid Live Editor**:
   - Copy the mermaid block above or content of [er-diagram.mmd](file:///c:/Users/Poorani%20R/OneDrive/Documents/NourishNetSmartFoodDistribution/docs/er-diagram.mmd).
   - Paste into https://mermaid.live to generate PNG, SVG, or PDF exports for your project report.
3. **In MySQL Workbench**:
   - You can also generate a physical model directly from the database by selecting **Database -> Reverse Engineer...**, selecting `nourishnet`, and exporting the EER Diagram as an image!
