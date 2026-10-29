
# BhuSetu Demo Runbook

## Demo Goal

Show one complete journey:

```text
Project Officer -> GIS -> LAO review -> AI prediction -> Nodal monitoring -> Super Admin closure
```

Recommended duration: 7-10 minutes.

## Before Demo

### Start Backend

Open PowerShell Terminal 1 from the project root:
1. cd D:\coding_zone\BhuSetu\t-hacks-9.0\t-hacks-90-geometrix-sentinel\backend
2. python -m pip install virtualenv
3. virtualenv .venv
4. .\.venv\Scripts\Activate.ps1
5. pip install -r requirements.txt
6. python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
7. localhost:8000/api/health
```powershell
.\.venv\Scripts\Activate.ps1
Push-Location backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Pop-Location
```

Check the backend:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
```

Expected result:

```json
{"status":"ok"}
```

### Start Frontend

Open PowerShell Terminal 2:

```powershell
Push-Location frontend
npm run dev
Pop-Location
```

Open `http://localhost:3000`.

### Reset Old Demo State

Before a fresh demo, press `F12`, open **Application -> Local Storage**, select `http://localhost:3000`, clear stored data, and refresh. This prevents old submissions or duplicate activity from affecting the presentation.

## Recommended Demo Project

Use one project consistently:

```text
Project: Delhi-Meerut Highway Expansion
Project ID: BH-2026-001 or BH-2026-DEMO
Type: Highway
Location: Ghaziabad / Modinagar
Risk: High
```

Highway projects are useful because they demonstrate a linear GIS route.

## Step 1: Project Officer Creates a Project

Open `http://localhost:3000/roles/project-officer/create-project`.

Use these values if the form is blank:

```text
Project ID: BH-2026-DEMO
Project Name: Delhi-Meerut Highway Expansion
Project Type: Highway
Department: NHAI
State: Delhi
District: Delhi
Tehsil: New Delhi
Villages: Baprola, Najafgarh
Required Land Area: 125
Unit: Hectare
```

Go to the GIS step, keep **Linear Project** selected, draw a route with three or four points, and finish by double-clicking the last point. Confirm route length and coordinates, then submit.

Say:

> The Project Officer creates the baseline project and draws its planning geometry. The geometry is converted to GeoJSON, and the system calculates the project center and route length.

## Step 2: Show Project Details

Open `http://localhost:3000/roles/project-officer/my-project`, open the same project, and show the project ID, location, land requirement, status, and GIS location.

Say:

> All roles use the same project record, but each role receives only the actions relevant to its responsibility.

## Step 3: LAO Reviews Acquisition Data

Open `http://localhost:3000/roles/LandAcqOfficer/assigned-projects` and open the same project.

On **Overview**, show the interactive GIS map, project marker, route, and parcel overlays. On **Parcels**, click **Verify** for one parcel and optionally add a parcel. On **Acquisition**, update:

```text
Ownership: Ownership records under review
Compensation: Award assessment in progress
Legal / Disputes: No dispute recorded
Approvals: District approval in review
```

Click **Submit Data**.

Say:

> The LAO records acquisition facts and parcel verification status. The LAO does not modify official cadastral boundaries.

## Step 4: Explain Prediction

Open `http://localhost:3000/roles/nodal-officer/projects`, open the same project, and show the AI risk section.

Say:

> The prediction engine evaluates project, location, GIS availability, parcel, ownership, compensation, legal, R&R, approval, and document features. It returns delay probability, risk category, factors, explanations, recommendations, and risk history.

Example:

```text
Ownership incomplete -> complete title and mutation verification
Compensation pending -> follow up on award and payment records
Approval pending -> escalate to the responsible authority
```

> The AI is an early-warning tool. It does not make legal, compensation, or government approval decisions.

## Step 5: Nodal Officer Monitoring

Show project overview, GIS, acquisition summary, AI risk, interventions, and decision history. Record one intervention:

```text
Decision: Intervention Required
Priority: High
Responsible Officer: Amit Sharma
Status: In Progress
Remarks: Complete ownership verification and follow up on district approval.
```

Click **Record decision**.

Say:

> The Nodal Officer coordinates monitoring and intervention. The Nodal Officer does not edit the AI score.

## Step 6: Recommend Closure

On the Nodal project page, click **Recommend Closure**.

Expected result:

```text
Closure Recommended / Pending Final Verification
```

Show the activity timeline and say:

> Closure recommendation is not final closure. It hands the project from operational monitoring to Super Admin verification.

## Step 7: Super Admin Final Review

Open `http://localhost:3000/roles/super-admin/projects`, filter for **Closure Recommended / Pending Final Verification**, and open the project.

Show:

- Project overview and officers.
- Location and GIS visualization.
- Parcel verification summary.
- Ownership, compensation, legal, R&R, approvals, documents, and possession.
- AI probability, category, factors, recommendations, and history.
- Nodal interventions.
- Activity and audit timeline.

Say:

> Super Admin has read-only administrative review responsibility. Super Admin does not verify parcels, edit AI scores, or enter legal or compensation data.

## Step 8A: Verify and Close

In **Final Verification**, click **Verify Project**.

Expected result:

```text
Status: Verified
Workflow status: Verified
Project: Closed
```

Show **Project Verified and Closed**, the timestamp, and the audit timeline.

Say:

> Verification is the final administrative action. It closes the workflow but does not modify AI analysis or official acquisition records.

## Step 8B: Send Back for Correction

Use this as an optional second scenario:

1. Open another closure-recommended project.
2. Click **Back to Correction**.
3. Enter `Complete ownership document verification and update the pending approval evidence.`
4. Click **Send Back**.

Expected result:

```text
Status: Sent Back for Correction
Nodal review: Required again
Correction reason: Visible in the project folder
```

Say:

> A mandatory reason creates accountability and gives the Nodal Officer a clear next action.

## Judge Narration

> BhuSetu connects project geography with land-acquisition administration. The Project Officer draws the route or boundary, and the system stores it as GeoJSON. The LAO records parcel, ownership, compensation, legal, R&R, approval, and document information. AI predicts delay risk and explains the causes. The Nodal Officer monitors and recommends closure. The Super Admin performs final administrative review and either verifies the project, making it Verified and Closed, or sends it back with a correction reason.

## Important Judge Answers

### GIS accuracy

> The demo uses Leaflet and OpenStreetMap for visualization and stores project geometry as GeoJSON. Candidate parcel overlays are planning shapes in the demo. Official cadastral boundaries must come from authorized government GIS or land-record systems.

### AI model

> The backend loads the configured XGBoost model and feature metadata. If the model is unavailable, an explainable rule-based fallback is used. The response identifies the prediction source and returns factors and recommendations.

### Data storage

> The backend stores projects, geometry, acquisition data, assessments, risk history, and interventions in the database. SQLite is the default development database. The frontend has localStorage fallback state for demo continuity, while production should use the backend as the authoritative source.

### Security

> The prototype separates role screens and responsibilities. Production deployment must add server-side authentication, RBAC, jurisdiction checks, MFA, HTTPS, encrypted secrets, immutable audit logs, backups, and monitoring.

### Production readiness

> The next production steps are official cadastral integration, PostgreSQL/PostGIS, server-side authorization, historical model validation, automated tests, model monitoring, and production notification and backup services.

## Troubleshooting

Backend check:

```powershell
Invoke-RestMethod http://localhost:8000/api/health
```

Frontend restart:

```powershell
Push-Location frontend
npm install
npm run dev
Pop-Location
```

If old or duplicate activity appears, clear Local Storage for `http://localhost:3000` and refresh.

If the map is blank, confirm internet access for OpenStreetMap tiles and confirm that the project has geometry or coordinates.

## Do Not Do During Demo

- Do not click submission buttons repeatedly.
- Do not claim demo parcel overlays are official cadastral boundaries.
- Do not claim AI makes legal or compensation decisions.
- Do not manually change the AI score.
- Do not start the optional MongoDB utility unless its environment variables are configured.
 