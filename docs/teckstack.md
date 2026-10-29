# BhuSetu Technology Stack

## 1. Overall Architecture

```text
Next.js + React frontend
		  |
		  | REST / JSON API
		  v
FastAPI backend
		  |
		  +-- SQLAlchemy database layer
		  +-- XGBoost prediction service
		  +-- GeoJSON project geometry
		  +-- Risk history and workflow APIs
```

The system is divided into a frontend, backend, machine-learning layer, and data layer. This separation makes the interface easier to change without rewriting prediction logic or database code.

## 2. Frontend Stack

### React

**Used for:** Interactive role-based screens and reusable UI components.

**Why chosen:** The application has many interactive workflows: project forms, maps, filters, modals, parcel verification, interventions, and Super Admin review. React handles these stateful interfaces well through components and hooks.

### Next.js 16

**Used for:** Frontend application framework and routing.

**Why chosen:** Next.js provides file-based routes, dynamic project pages, optimized production builds, and a clear structure for multiple role workspaces.

Important routes include:

```text
/roles/project-officer
/roles/LandAcqOfficer
/roles/nodal-officer
/roles/super-admin
```

### JavaScript / JSX

**Used for:** Frontend application code.

**Why chosen:** JSX keeps UI structure close to its behavior, which is useful for rapidly building and demonstrating a workflow-heavy prototype.

### Tailwind CSS

**Used for:** Layout, responsive design, spacing, colors, typography, states, and transitions.

**Why chosen:** Tailwind makes it fast to keep all role dashboards visually consistent while supporting responsive desktop and mobile layouts.

### CSS Modules and Global CSS

**Used for:** Page-specific styles and shared application styles.

**Why chosen:** CSS modules prevent style collisions in complex role-based screens, while global CSS handles shared resets and application-wide styles.

### Lucide React and React Icons

**Used for:** Interface icons such as maps, users, documents, risks, dashboards, and actions.

**Why chosen:** Consistent icons make dense administrative screens easier to scan and reduce the need to maintain custom SVG icons.

### React State and Browser localStorage

**Used for:** Local workflow state, demo fallback, subscriptions, and UI state.

**Why chosen:** React state handles immediate UI updates. localStorage allows the demonstration workflow to continue if the backend is temporarily unavailable.

Important frontend demo keys include:

```text
BhuSetu-ai-workflow-state
BhuSetu-super-admin-state
BhuSetuUsersData
BhuSetuJurisdictionsData
BhuSetuAdminActivity
```

The localStorage path is a demo fallback. The backend should be the authoritative source in production.

## 3. GIS Stack

### Leaflet

**Used for:** Interactive maps, project markers, routes, polygons, popups, and map navigation.

**Why chosen:** Leaflet is lightweight, open source, widely adopted, and supports the project’s required 2D GIS interactions without the cost or complexity of a full 3D GIS engine.

### React Leaflet

**Used for:** Rendering Leaflet maps through React components.

**Why chosen:** It allows map layers to react to project state, selected projects, parcel status, and workflow updates.

### Leaflet Draw

**Used for:** Drawing project polygons and linear routes.

**Why chosen:** Project Officers need to create geometry directly on the map. Leaflet Draw converts the user interaction into editable geometry that can be stored as GeoJSON.

### OpenStreetMap

**Used for:** Base map tiles.

**Why chosen:** It provides a familiar geographic reference layer and is suitable for the prototype. A production deployment should use an approved tile provider or government GIS service according to usage and licensing requirements.

### GeoJSON

**Used for:** Standard storage and transfer format for project geometry.

**Why chosen:** GeoJSON is supported by web maps, spatial databases, GIS servers, and government GIS integrations.

Supported geometry types:

```text
Point
Polygon
LineString
```

The frontend also calculates polygon area and route length for project review.

## 4. Backend Stack

### Python

**Used for:** Backend API and machine-learning integration.

**Why chosen:** Python has mature web, data-science, GIS, and machine-learning libraries, making it suitable for connecting business workflows to prediction services.

### FastAPI

**Used for:** REST API services.

**Why chosen:** FastAPI provides fast JSON APIs, automatic OpenAPI documentation, request validation, and a clean structure for project, workflow, GIS, acquisition, and prediction endpoints.

Main API groups:

```text
/api/health
/api/projects
/api/projects/{id}/geometry
/api/projects/{id}/acquisition
/api/projects/{id}/workflow
/api/ai/predict/{id}
/api/ai/assessment/{id}
/api/ai/history/{id}
/api/interventions
/api/analytics/risk-distribution
```

### Uvicorn

**Used for:** Running the FastAPI application.

**Why chosen:** Uvicorn is an efficient ASGI server and works well with FastAPI during development and production deployment.

### Pydantic and Pydantic Settings

**Used for:** API request validation and environment configuration.

**Why chosen:** Typed validation prevents malformed project, workflow, and acquisition payloads from entering the backend.

### CORS Middleware

**Used for:** Allowing the Next.js frontend to call the FastAPI backend during development.

**Why chosen:** The frontend and backend run on separate ports, so controlled CORS configuration is required.

## 5. Database Stack

### SQLAlchemy

**Used for:** Python database models, queries, relationships, and transactions.

**Why chosen:** SQLAlchemy separates application logic from the database engine and allows the development database to be replaced by PostgreSQL or another supported database later.

### SQLite

**Used for:** Default development and demonstration database.

**Why chosen:** SQLite is zero-configuration, portable, and sufficient for local development and an  prototype.

Default database file:

```text
bhusetu.db
```

### Main database records

```text
projects       Project details, status, risk values, acquisition JSON and geometry
assessments    Current AI assessment results
risk_history   Previous predictions, changed fields and risk trend
interventions Nodal Officer intervention records
```

### Production database recommendation: PostgreSQL + PostGIS

**Why:** PostgreSQL provides stronger concurrency, reliability, transactions, and operational tooling. PostGIS adds spatial indexes, geometry queries, boundary intersections, and scalable GIS operations.

### MongoDB utility

The `database` folder contains a MongoDB connection utility using the official MongoDB Node.js driver and dotenv. It is not the primary database used by the current FastAPI application. The current backend uses SQLAlchemy and SQLite by default.

## 6. Machine-Learning Stack

### XGBoost

**Used for:** Land-acquisition delay-risk classification.

**Why chosen:** XGBoost performs well on structured tabular data, supports nonlinear relationships, handles mixed project features, and is practical for relatively small and medium-sized government datasets.

### scikit-learn

**Used for:** Machine-learning utilities and compatible model workflows.

**Why chosen:** It provides standard preprocessing, evaluation, model utilities, and an established Python ML ecosystem.

### pandas

**Used for:** Building the model feature row and tabular data handling.

**Why chosen:** The trained model expects structured tabular features, and pandas provides reliable column ordering and data preparation.

### Joblib

**Used for:** Loading the trained model file.

**Why chosen:** It efficiently serializes and loads Python and scikit-learn-compatible model objects.

### SHAP

**Included for:** Explainability and future feature-attribution support.

**Why chosen:** SHAP can provide model-level and prediction-level feature contribution explanations when enabled in the production prediction pipeline.

### Shapely

**Used for:** Geometry-related Python operations and future spatial validation.

**Why chosen:** It provides reliable geometry handling for validation, measurement, and future GIS processing on the backend.

### Prediction fallback

If the XGBoost model cannot be loaded, the backend uses an explainable rule-based fallback. It evaluates legal, ownership, compensation, R&R, approval, and document issues using weighted risk points.

This keeps the demo functional and makes the result understandable even without a loaded model.

## 7. Model Data

The model configuration is stored in:

```text
machine-learning-algo/model_metadata.json
```

The trained model is expected at:

```text
machine-learning-algo/land_acquisition_xgb_model.pkl
```

The feature set includes project, land, ownership, compensation, legal, R&R, approval, document, verification, timing, and state-level land-use indicators.

## 8. Workflow Technology Mapping

```text
Project creation       Next.js + React form
GIS drawing             Leaflet + React Leaflet + Leaflet Draw
Geometry storage        GeoJSON in backend JSON column
API communication       REST + JSON through FastAPI
Project persistence      SQLAlchemy + SQLite
Risk prediction          XGBoost + pandas + Joblib
Risk fallback            Python weighted rules
Risk history             SQLAlchemy assessment/history records
Officer workflow         React state + backend workflow API
Demo fallback            Browser localStorage
Final verification       Super Admin workflow endpoint and audit activity
```

## 9. Why This Stack Fits BhuSetu

- It is open source and cost-effective for a prototype.
- It supports rapid development for an  demonstration.
- It combines strong web development and data-science ecosystems.
- It uses standard REST, JSON, and GeoJSON formats.
- It keeps GIS, prediction, database, and UI responsibilities separated.
- It can evolve from SQLite to PostgreSQL/PostGIS.
- It can evolve from localStorage demo state to authenticated backend state.
- It provides explainable risk output instead of an unexplained AI score.

## 10. Production Improvements

Before production deployment, add:

1. PostgreSQL/PostGIS.
2. Server-side authentication and role-based authorization.
3. MFA and HTTPS.
4. Official cadastral and jurisdiction GIS layers.
5. Model evaluation, calibration, fairness testing, and drift monitoring.
6. Automated frontend, API, GIS, and workflow tests.
7. Immutable audit logs and database backups.
8. Background jobs for large prediction batches.
9. Approved map tile hosting or cached government map services.
10. Centralized logging, alerting, and disaster recovery.
