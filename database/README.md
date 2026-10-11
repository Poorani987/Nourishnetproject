# MySQL Database Execution Guide: NourishNet

This guide walks you through executing the database scripts manually in **MySQL Workbench**. Follow these steps in order to set up the `nourishnet` relational database.

---

## Script Execution Order

Execute the SQL files located in `database/` strictly in this sequential order:

1. **`01_create_database.sql`** — Creates the `nourishnet` database with `utf8mb4` character set.
2. **`02_create_tables.sql`** — Generates all 15 relational tables with primary keys, foreign keys, and constraints.
3. **`03_insert_sample_data.sql`** — Seeds fictional sample records (10 donors, 7 recipients, 8 volunteers, 8 vehicles, 22 donations, 12 deliveries, Dijkstra road graph, OTPs, notifications, waste logs, rewards).
4. **`04_indexes_and_constraints.sql`** — Adds performance indexes for fast search, expiry checks, and route lookups.
5. **`05_verification_queries.sql`** — Review and test queries for your mentor presentation.

---

## Step-by-Step Instructions

### Step 1: Install MySQL Server and MySQL Workbench
If not already installed, download and install:
- **MySQL Community Server 8.0+**: https://dev.mysql.com/downloads/mysql/
- **MySQL Workbench 8.0+**: https://dev.mysql.com/downloads/workbench/
- During setup, set your `root` password (remember this password for Step 11).

### Step 2: Connect to Local MySQL Server
1. Launch **MySQL Workbench**.
2. Under **MySQL Connections**, click on **Local instance 3306** (or your local connection).
3. Enter your MySQL password when prompted and click **OK**.

### Step 3: Open and Execute `01_create_database.sql`
1. In the top menu, go to **File** -> **Open SQL Script...** (or press `Ctrl + Shift + O`).
2. Navigate to `database/01_create_database.sql` in this project.
3. Click the **Execute (Lightning icon)** or press `Ctrl + Shift + Enter`.
4. In the **Output** panel at the bottom, ensure the query executed with a green checkmark.

### Step 4: Verify Database Creation
1. In the left sidebar, look at the **Schemas** panel.
2. Right-click in the empty space of the Schemas panel and select **Refresh All**.
3. You should see `nourishnet` listed in the Schemas.

### Step 5: Open and Execute `02_create_tables.sql`
1. Go to **File** -> **Open SQL Script...** and select `database/02_create_tables.sql`.
2. Click the **Lightning icon** to execute the script.
3. Verify that all 15 `CREATE TABLE` statements completed successfully.

### Step 6: Verify Table Creation
1. In the **Schemas** panel, expand `nourishnet` -> **Tables**.
2. Confirm the presence of all 15 tables:
   - `users`
   - `donor_profiles`
   - `recipient_profiles`
   - `volunteer_profiles`
   - `vehicles`
   - `food_donations`
   - `food_allocations`
   - `deliveries`
   - `delivery_assignments`
   - `road_nodes`
   - `road_edges`
   - `otp_verifications`
   - `notifications`
   - `waste_records`
   - `volunteer_rewards`

### Step 7: Open and Execute `03_insert_sample_data.sql`
1. Go to **File** -> **Open SQL Script...** and select `database/03_insert_sample_data.sql`.
2. Click the **Lightning icon** to execute.
3. The bottom output panel will display the row counts for each table.

### Step 8: Open and Execute `04_indexes_and_constraints.sql`
1. Go to **File** -> **Open SQL Script...** and select `database/04_indexes_and_constraints.sql`.
2. Click the **Lightning icon** to apply the composite performance indexes.

### Step 9: Refresh and Inspect
1. In the **Schemas** panel, right-click on `nourishnet` and select **Refresh All**.
2. Hover over any table (e.g., `food_donations`) and click the small table icon to inspect rows.

### Step 10: Run Verification Queries (`05_verification_queries.sql`)
1. Open `database/05_verification_queries.sql`.
2. Highlight any query (e.g., Query 6 for available food, or Query 10 for impact metrics) and press `Ctrl + Enter` to view results.
3. Use these queries during your project mentor evaluation!

### Step 10B: Role Migration (If Upgrading an Older Database: `06_migrate_roles_to_vehicle_volunteer.sql`)
If your local database was created from an older schema containing legacy roles (`VOLUNTEER` or `ADMIN`), execute `database/06_migrate_roles_to_vehicle_volunteer.sql`. It safely migrates all `VOLUNTEER` records to `VEHICLE_VOLUNTEER` and updates the ENUM column definition without dropping tables or losing user data.

### Step 11: Configure the Spring Boot Connection
The backend uses environment variables with safe localhost defaults:
- `DB_URL` default: `jdbc:mysql://localhost:3306/nourishnet`
- `DB_USERNAME` default: `root`
- `DB_PASSWORD`: Set in your Windows PowerShell environment or in `backend/src/main/resources/application.properties`.

In Windows PowerShell:
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/nourishnet"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password_here"
```

### Step 12: Start the Backend
Navigate to `backend/` and run:
```powershell
mvn spring-boot:run
```
Spring Boot will start on `http://localhost:8080` with Hibernate schema validation confirming your MySQL database tables.

### Step 13: Start the Frontend
In another terminal, navigate to `frontend/` and run:
```powershell
npm run dev
```
Open `http://localhost:5173` in your browser. All cards, statistics, and forms will now query your live MySQL database!
