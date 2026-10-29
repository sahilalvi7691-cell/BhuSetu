import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, create_engine, delete, func, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker

from .ml.predictor import Predictor

logging.basicConfig(level=logging.INFO)
ROOT = Path(__file__).resolve().parents[2]
database_url = os.getenv("DATABASE_URL", f"sqlite:///{ROOT / 'bhusetu.db'}")
engine = create_engine(database_url, connect_args={"check_same_thread": False} if database_url.startswith("sqlite") else {})
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
model_path = os.getenv("MODEL_PATH", str(ROOT / "machine-learning-algo" / "land_acquisition_xgb_model.pkl"))
metadata_path = os.getenv("MODEL_METADATA_PATH", str(ROOT / "machine-learning-algo" / "model_metadata.json"))
predictor = Predictor(model_path, metadata_path)


class Base(DeclarativeBase):
    pass


class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    type: Mapped[str] = mapped_column(String(80))
    state: Mapped[str] = mapped_column(String(100))
    district: Mapped[str] = mapped_column(String(100))
    village: Mapped[str | None] = mapped_column(String(200), nullable=True)
    tehsil: Mapped[str | None] = mapped_column(String(100), nullable=True)
    required_land_area: Mapped[float] = mapped_column(Float, default=0)
    geometry: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(80), default="Draft")
    risk_probability: Mapped[float | None] = mapped_column(Float, nullable=True)
    risk_category: Mapped[str | None] = mapped_column(String(20), nullable=True)
    acquisition_data: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    assessments: Mapped[list["Assessment"]] = relationship(cascade="all, delete-orphan")


class Assessment(Base):
    __tablename__ = "assessments"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    delay_probability: Mapped[float] = mapped_column(Float)
    risk_category: Mapped[str] = mapped_column(String(20))
    risk_factors: Mapped[list] = mapped_column(JSON, default=list)
    factor_importance: Mapped[dict] = mapped_column(JSON, default=dict)
    recommendations: Mapped[list] = mapped_column(JSON, default=list)
    risk_trend: Mapped[str] = mapped_column(String(20), default="STABLE")
    model_version: Mapped[str] = mapped_column(String(80))
    prediction_source: Mapped[str] = mapped_column(String(40))
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))


class RiskHistory(Base):
    __tablename__ = "risk_history"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    previous_probability: Mapped[float | None] = mapped_column(Float, nullable=True)
    new_probability: Mapped[float] = mapped_column(Float)
    previous_risk: Mapped[str | None] = mapped_column(String(20), nullable=True)
    new_risk: Mapped[str] = mapped_column(String(20))
    changed_fields: Mapped[list] = mapped_column(JSON, default=list)
    prediction_source: Mapped[str] = mapped_column(String(40))
    model_version: Mapped[str] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))


class Intervention(Base):
    __tablename__ = "interventions"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    intervention_type: Mapped[str] = mapped_column(String(100))
    action_taken: Mapped[str] = mapped_column(String(500))
    responsible_officer: Mapped[str] = mapped_column(String(120))
    priority: Mapped[str] = mapped_column(String(30), default="Medium")
    due_date: Mapped[str | None] = mapped_column(String(30), nullable=True)
    remarks: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Open")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))


class ProjectIn(BaseModel):
    projectId: str = Field(min_length=1)
    projectName: str = Field(min_length=1)
    description: str | None = None
    department: str | None = None
    documents: list[dict] = Field(default_factory=list)
    acquisitionRequirement: str | None = None
    purpose: str | None = None
    plannedStartDate: str | None = None
    targetCompletionDate: str | None = None
    estimatedProjectCost: float | None = None
    fundingSource: str | None = None
    projectType: str = Field(min_length=1)
    state: str = Field(min_length=1)
    district: str = Field(min_length=1)
    village: str | None = None
    villages: str | None = None
    tehsil: str | None = None
    requiredLandArea: float = Field(gt=0)
    unit: str = "Hectare"
    locationType: str = "linear"
    latitude: float | None = None
    longitude: float | None = None
    geometry: dict | None = None
    calculatedArea: str | None = None
    routeLength: str | None = None
    status: str = "Pending LAO Verification"


class ProjectRefreshIn(BaseModel):
    projectId: str = Field(min_length=1)
    name: str = Field(min_length=1)
    description: str = ""
    department: str | None = None
    acquisitionRequirement: str | None = None
    purpose: str | None = None
    plannedStartDate: str | None = None
    targetCompletionDate: str | None = None
    estimatedProjectCost: float | None = None
    fundingSource: str | None = None
    locationType: str = "linear"
    calculatedArea: str | None = None
    routeLength: str | None = None
    type: str = Field(min_length=1)
    state: str = Field(min_length=1)
    district: str = Field(min_length=1)
    village: str | None = None
    tehsil: str | None = None
    requiredLandArea: float = Field(gt=0)
    landUnit: str = "hectares"
    geometry: dict | None = None
    status: str = "Draft"
    workflowStatus: str | None = None
    nodalReviewCompleted: bool = False
    submittedAt: str | None = None
    submittedBy: str | None = None
    correctionReason: str | None = None
    verification: dict | None = None
    workflowActivity: list[dict] = Field(default_factory=list)
    decisionHistory: list[dict] = Field(default_factory=list)
    documents: list[dict] = Field(default_factory=list)
    acquisitionSummary: dict = Field(default_factory=dict)
    analysisInputs: dict = Field(default_factory=dict)
    riskProbability: float | None = None
    riskCategory: str | None = None
    assessment: dict = Field(default_factory=dict)
    createdAt: str | None = None
    updatedAt: str | None = None


class InterventionIn(BaseModel):
    project_id: int
    intervention_type: str
    action_taken: str
    responsible_officer: str
    priority: str = "Medium"
    due_date: str | None = None
    remarks: str | None = None


class WorkflowIn(BaseModel):
    status: str = Field(min_length=1)
    workflowStatus: str | None = None
    nodalReviewCompleted: bool | None = None
    submittedAt: str | None = None
    submittedBy: str | None = None
    correctionReason: str | None = None
    verification: dict | None = None
    workflowActivity: list[dict] | None = None


class DecisionIn(BaseModel):
    decision: str = Field(min_length=1)
    priority: str = "Medium"
    officer: str = Field(min_length=1)
    targetDate: str | None = None
    remarks: str = Field(min_length=1)
    followUpDate: str | None = None
    status: str = "Open"
    actor: str = "Nodal Officer"


def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def serialize_project(project: Project) -> dict:
    workflow = (project.acquisition_data or {}).get("workflow", {})
    detail = project.acquisition_data or {}
    assessment = detail.get("latestAssessment", {})
    return {"id": project.id, "projectId": project.project_id, "name": project.name, "description": detail.get("description", ""), "department": detail.get("department"), "acquisitionRequirement": detail.get("acquisitionRequirement"), "purpose": detail.get("purpose"), "plannedStartDate": detail.get("plannedStartDate"), "targetCompletionDate": detail.get("targetCompletionDate"), "estimatedProjectCost": detail.get("estimatedProjectCost"), "fundingSource": detail.get("fundingSource"), "locationType": detail.get("locationType"), "calculatedArea": detail.get("calculatedArea"), "routeLength": detail.get("routeLength"), "type": project.type, "state": project.state, "district": project.district, "village": project.village, "tehsil": project.tehsil, "requiredLandArea": project.required_land_area, "landUnit": detail.get("landUnit", "hectares"), "geometry": project.geometry, "status": project.status, "workflowStatus": workflow.get("workflowStatus", project.status), "nodalReviewCompleted": workflow.get("nodalReviewCompleted", False), "submittedAt": workflow.get("submittedAt"), "submittedBy": workflow.get("submittedBy"), "correctionReason": workflow.get("correctionReason"), "verification": workflow.get("verification"), "workflowActivity": workflow.get("workflowActivity", []), "decisionHistory": detail.get("decisionHistory", []), "documents": detail.get("documents", []), "acquisitionSummary": detail.get("acquisitionSummary", {}), "analysisInputs": detail.get("analysisInputs", {}), "riskProbability": project.risk_probability, "riskCategory": project.risk_category, "assessment": assessment, "createdAt": project.created_at.isoformat(), "updatedAt": project.updated_at.isoformat()}


def demo_project_data(payload: ProjectIn) -> dict:
    documents = payload.documents or [
        {"name": "Project Proposal.pdf", "type": "Project Proposal", "status": "Verified", "uploadedBy": "Project Officer"},
        {"name": "Route Plan.pdf", "type": "Project Plan / Route", "status": "In Review", "uploadedBy": "Project Officer"},
    ]
    parcels = [
        {"id": "demo-parcel-1", "khasra": "K-102/4", "area": round(payload.requiredLandArea * 0.04, 2), "location": payload.village or payload.villages, "landUse": "Agricultural", "owner": "Owner reference pending", "status": "Verified"},
        {"id": "demo-parcel-2", "khasra": "K-108/2", "area": round(payload.requiredLandArea * 0.03, 2), "location": payload.village or payload.villages, "landUse": "Residential", "owner": "Owner reference pending", "status": "Pending"},
        {"id": "demo-parcel-3", "khasra": "K-114/7", "area": round(payload.requiredLandArea * 0.02, 2), "location": payload.village or payload.villages, "landUse": "Agricultural", "owner": "Owner reference pending", "status": "Pending"},
    ]
    return {"acquisition": {"ownership": "Pending verification", "compensation": "Not started", "legal": "Dispute Identified", "rr": "Not started", "approvals": "In review", "documents": "Available", "possession": "Not started"}, "parcels": parcels, "documents": documents, "acquisitionSummary": {"totalParcels": len(parcels), "verifiedParcels": 1, "pendingVerification": len(parcels) - 1, "ownershipIssues": 2, "compensationProgress": 35, "legalCases": 1, "rrStatus": "In progress", "approvals": "In review", "possessionStatus": "Not started"}}


app = FastAPI(title="BhuSetu API", version="1.0.0", docs_url="/docs", openapi_url="/api/openapi.json")
origins = [item.strip() for item in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"], allow_credentials=True)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(engine)


@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": predictor.model is not None, "prediction_source": "ML_MODEL" if predictor.model is not None else "RULE_BASED_FALLBACK"}


@app.get("/api/projects")
def list_projects(session: Session = Depends(db), risk: str | None = Query(None), district: str | None = Query(None)):
    statement = select(Project).order_by(Project.updated_at.desc())
    if risk: statement = statement.where(Project.risk_category == risk.upper())
    if district: statement = statement.where(Project.district == district)
    projects = session.scalars(statement).all()
    for project in projects:
        if project.risk_probability is None or project.risk_category is None:
            _save_prediction(session, project, ["project_list_refresh"])
    return [serialize_project(item) for item in projects]


@app.post("/api/projects", status_code=201)
def create_project(payload: ProjectIn, session: Session = Depends(db)):
    if session.scalar(select(Project).where(Project.project_id == payload.projectId)):
        raise HTTPException(409, "Project ID already exists")
    geometry = payload.geometry or ({"type": "Point", "coordinates": [payload.longitude, payload.latitude]} if payload.latitude is not None and payload.longitude is not None else None)
    project = Project(project_id=payload.projectId, name=payload.projectName, type=payload.projectType, state=payload.state, district=payload.district, village=payload.village or payload.villages, tehsil=payload.tehsil, required_land_area=payload.requiredLandArea, geometry=geometry, status=payload.status, acquisition_data={"description": payload.description or "", "department": payload.department, "landUnit": payload.unit, "acquisitionRequirement": payload.acquisitionRequirement, "purpose": payload.purpose, "plannedStartDate": payload.plannedStartDate, "targetCompletionDate": payload.targetCompletionDate, "estimatedProjectCost": payload.estimatedProjectCost, "fundingSource": payload.fundingSource, "locationType": payload.locationType, "calculatedArea": payload.calculatedArea, "routeLength": payload.routeLength, **demo_project_data(payload)})
    session.add(project)
    session.commit()
    session.refresh(project)
    return _save_prediction(session, project, ["project_created"])["project"]


@app.get("/api/projects/{project_id}")
def get_project(project_id: int, session: Session = Depends(db)):
    project = session.get(Project, project_id)
    if not project: raise HTTPException(404, "Project not found")
    if project.risk_probability is None or project.risk_category is None:
        _save_prediction(session, project, ["project_detail_refresh"])
    return serialize_project(project)


@app.get("/api/projects/by-code/{project_code}")
def get_project_by_code(project_code: str, session: Session = Depends(db)):
    project = session.scalar(select(Project).where(Project.project_id == project_code))
    if not project:
        raise HTTPException(404, "Project not found")
    if project.risk_probability is None or project.risk_category is None:
        _save_prediction(session, project, ["project_detail_refresh"])
    return serialize_project(project)


@app.put("/api/projects/by-code/{project_code}")
def refresh_project_by_code(project_code: str, payload: ProjectRefreshIn, session: Session = Depends(db)):
    if payload.projectId != project_code:
        raise HTTPException(422, "projectId must match the project code in the URL")

    project = session.scalar(select(Project).where(Project.project_id == project_code))
    if project is None:
        project = Project(project_id=project_code)
        session.add(project)

    def parse_timestamp(value: str | None, fallback: datetime) -> datetime:
        if not value:
            return fallback
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError as error:
            raise HTTPException(422, f"Invalid timestamp: {value}") from error

    now = datetime.now(timezone.utc)
    assessment_data = payload.assessment
    project.name = payload.name
    project.type = payload.type
    project.state = payload.state
    project.district = payload.district
    project.village = payload.village
    project.tehsil = payload.tehsil
    project.required_land_area = payload.requiredLandArea
    project.geometry = payload.geometry
    project.status = payload.status
    project.risk_probability = payload.riskProbability
    project.risk_category = payload.riskCategory
    project.created_at = parse_timestamp(payload.createdAt, now)
    project.updated_at = parse_timestamp(payload.updatedAt, now)
    project.acquisition_data = {
        **(project.acquisition_data or {}),
        "description": payload.description,
        "department": payload.department,
        "landUnit": payload.landUnit,
        "acquisitionRequirement": payload.acquisitionRequirement,
        "purpose": payload.purpose,
        "plannedStartDate": payload.plannedStartDate,
        "targetCompletionDate": payload.targetCompletionDate,
        "estimatedProjectCost": payload.estimatedProjectCost,
        "fundingSource": payload.fundingSource,
        "locationType": payload.locationType,
        "calculatedArea": payload.calculatedArea,
        "routeLength": payload.routeLength,
        "workflow": {
            "workflowStatus": payload.workflowStatus or payload.status,
            "nodalReviewCompleted": payload.nodalReviewCompleted,
            "submittedAt": payload.submittedAt,
            "submittedBy": payload.submittedBy,
            "correctionReason": payload.correctionReason,
            "verification": payload.verification,
            "workflowActivity": payload.workflowActivity,
        },
        "decisionHistory": payload.decisionHistory,
        "documents": payload.documents,
        "acquisitionSummary": payload.acquisitionSummary,
        "analysisInputs": payload.analysisInputs,
        "latestAssessment": assessment_data,
    }

    session.flush()
    if assessment_data:
        session.execute(delete(Assessment).where(Assessment.project_id == project.id))
        session.add(Assessment(
            project_id=project.id,
            delay_probability=assessment_data.get("delay_probability", payload.riskProbability or 0),
            risk_category=assessment_data.get("risk_category", payload.riskCategory or "LOW"),
            risk_factors=assessment_data.get("top_risk_factors", []),
            factor_importance=assessment_data.get("factor_importance", {}),
            recommendations=assessment_data.get("recommendations", []),
            risk_trend=assessment_data.get("risk_trend", "STABLE"),
            model_version=assessment_data.get("model_version", "snapshot"),
            prediction_source=assessment_data.get("prediction_source", "SNAPSHOT"),
            confidence=assessment_data.get("confidence"),
            created_at=parse_timestamp(assessment_data.get("last_updated"), now),
        ))
    else:
        session.execute(delete(Assessment).where(Assessment.project_id == project.id))

    session.commit()
    session.refresh(project)
    return serialize_project(project)


@app.delete("/api/projects/by-code/{project_code}")
def delete_project_by_code(project_code: str, session: Session = Depends(db)):
    project = session.scalar(select(Project).where(Project.project_id == project_code))
    if not project:
        raise HTTPException(404, "Project not found")

    session.execute(delete(RiskHistory).where(RiskHistory.project_id == project.id))
    session.execute(delete(Intervention).where(Intervention.project_id == project.id))
    session.delete(project)
    session.commit()
    return {"deleted": True, "id": project.id, "projectId": project_code}


@app.get("/api/projects/{project_id}/geometry")
def get_geometry(project_id: int, session: Session = Depends(db)):
    project = session.get(Project, project_id)
    if not project: raise HTTPException(404, "Project not found")
    return {"geometry": project.geometry, "gis_available": project.geometry is not None, "label": "Demo GIS data"}


@app.put("/api/projects/{project_id}/workflow")
def update_project_workflow(project_id: int, payload: WorkflowIn, session: Session = Depends(db)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    current_data = project.acquisition_data or {}
    current_workflow = current_data.get("workflow", {})
    next_workflow = {**current_workflow, **payload.model_dump(exclude_none=True)}
    project.acquisition_data = {**current_data, "workflow": next_workflow}
    project.status = payload.status
    project.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(project)
    return serialize_project(project)


@app.post("/api/projects/{project_id}/decisions")
def create_project_decision(project_id: int, payload: DecisionIn, session: Session = Depends(db)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    now = datetime.now(timezone.utc)
    detail = {**(project.acquisition_data or {})}
    decision = {"date": now.date().isoformat(), "decision": payload.decision, "remarks": payload.remarks, "officer": payload.officer, "targetDate": payload.targetDate, "followUpDate": payload.followUpDate, "priority": payload.priority, "status": payload.status, "timestamp": now.isoformat()}
    detail["decisionHistory"] = [decision, *(detail.get("decisionHistory") or [])]
    project.acquisition_data = {**detail, "workflow": {**detail.get("workflow", {}), "lastDecision": decision}}
    project.status = "Intervention Required" if payload.decision == "Intervention Required" else "Under Monitoring"
    project.updated_at = now
    session.add(Intervention(project_id=project.id, intervention_type=payload.decision, action_taken=payload.remarks, responsible_officer=payload.officer, priority=payload.priority, due_date=payload.targetDate, remarks=payload.remarks, status=payload.status, created_at=now))
    session.commit()
    session.refresh(project)
    return {"project": serialize_project(project), "decision": decision}


@app.get("/api/projects/{project_id}/interventions")
def list_project_interventions(project_id: int, session: Session = Depends(db)):
    if not session.get(Project, project_id):
        raise HTTPException(404, "Project not found")
    return [{"id": item.id, "type": item.intervention_type, "action": item.action_taken, "assignedOfficer": item.responsible_officer, "priority": item.priority, "dueDate": item.due_date, "remarks": item.remarks, "status": item.status, "timestamp": item.created_at.isoformat()} for item in session.scalars(select(Intervention).where(Intervention.project_id == project_id).order_by(Intervention.created_at.desc())).all()]


@app.put("/api/projects/{project_id}/acquisition")
def update_acquisition(project_id: int, data: dict, session: Session = Depends(db)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    project.acquisition_data = {**(project.acquisition_data or {}), **data}
    return _save_prediction(session, project, list(data.keys()))


def _save_prediction(session: Session, project: Project, changed_fields: list[str]):
    current_data = project.acquisition_data or {}
    default_acquisition = {"ownership": "Pending verification", "compensation": "Not started", "legal": "Dispute Identified", "rr": "Not started", "approvals": "In review", "documents": "Available", "possession": "Not started"}
    acquisition = {**current_data, "acquisition": {**default_acquisition, **(current_data.get("acquisition") or {})}, "parcels": current_data.get("parcels") or [{"area": 2.4, "status": "Verified"}, {"area": 1.8, "status": "Pending"}]}
    result = predictor.predict({"project": {"type": project.type, "state": project.state, "district": project.district, "tehsil": project.tehsil or "Unknown", "requiredLandArea": project.required_land_area, "landUnit": current_data.get("landUnit", "acres"), "geometry": project.geometry, "created_at": project.created_at.isoformat()}, "acquisition": acquisition})
    previous = session.scalars(select(Assessment).where(Assessment.project_id == project.id).order_by(Assessment.created_at.desc())).first()
    result["risk_trend"] = "INCREASING" if previous and result["delay_probability"] > previous.delay_probability else "DECREASING" if previous and result["delay_probability"] < previous.delay_probability else "STABLE"
    session.add(Assessment(project_id=project.id, delay_probability=result["delay_probability"], risk_category=result["risk_category"], risk_factors=result["top_risk_factors"], factor_importance=result["factor_importance"], recommendations=result["recommendations"], risk_trend=result["risk_trend"], model_version=result["model_version"], prediction_source=result["prediction_source"], confidence=result["confidence"]))
    session.add(RiskHistory(project_id=project.id, previous_probability=previous.delay_probability if previous else None, new_probability=result["delay_probability"], previous_risk=previous.risk_category if previous else None, new_risk=result["risk_category"], changed_fields=changed_fields, prediction_source=result["prediction_source"], model_version=result["model_version"]))
    project.risk_probability = result["delay_probability"]
    project.risk_category = result["risk_category"]
    project.acquisition_data = {**current_data, "analysisInputs": acquisition, "latestAssessment": result}
    project.updated_at = datetime.now(timezone.utc)
    session.commit()
    return {"project": serialize_project(project), "assessment": result}


@app.post("/api/ai/predict/{project_id}")
def predict(project_id: int, session: Session = Depends(db)):
    project = session.get(Project, project_id)
    if not project: raise HTTPException(404, "Project not found")
    current_data = project.acquisition_data or {}
    default_acquisition = {"ownership": "Pending verification", "compensation": "Not started", "legal": "Dispute Identified", "rr": "Not started", "approvals": "In review", "documents": "Available", "possession": "Not started"}
    acquisition = {**current_data, "acquisition": {**default_acquisition, **(current_data.get("acquisition") or {})}, "parcels": current_data.get("parcels") or [{"area": 2.4, "status": "Verified"}, {"area": 1.8, "status": "Pending"}]}
    result = predictor.predict({"project": {"type": project.type, "state": project.state, "district": project.district, "tehsil": project.tehsil or "Unknown", "requiredLandArea": project.required_land_area, "landUnit": current_data.get("landUnit", "acres"), "geometry": project.geometry, "created_at": project.created_at.isoformat()}, "acquisition": acquisition})
    previous = session.scalars(select(Assessment).where(Assessment.project_id == project.id).order_by(Assessment.created_at.desc())).first()
    result["risk_trend"] = "INCREASING" if previous and result["delay_probability"] > previous.delay_probability else "DECREASING" if previous and result["delay_probability"] < previous.delay_probability else "STABLE"
    assessment = Assessment(project_id=project.id, delay_probability=result["delay_probability"], risk_category=result["risk_category"], risk_factors=result["top_risk_factors"], factor_importance=result["factor_importance"], recommendations=result["recommendations"], risk_trend=result["risk_trend"], model_version=result["model_version"], prediction_source=result["prediction_source"], confidence=result["confidence"])
    session.add(assessment)
    session.add(RiskHistory(project_id=project.id, previous_probability=previous.delay_probability if previous else None, new_probability=result["delay_probability"], previous_risk=previous.risk_category if previous else None, new_risk=result["risk_category"], changed_fields=[], prediction_source=result["prediction_source"], model_version=result["model_version"]))
    project.risk_probability = result["delay_probability"]
    project.risk_category = result["risk_category"]
    project.acquisition_data = {**current_data, "analysisInputs": acquisition, "latestAssessment": result}
    project.updated_at = datetime.now(timezone.utc)
    session.commit()
    return result


@app.get("/api/ai/assessment/{project_id}")
def assessment(project_id: int, session: Session = Depends(db)):
    item = session.scalars(select(Assessment).where(Assessment.project_id == project_id).order_by(Assessment.created_at.desc())).first()
    if not item: raise HTTPException(404, "No assessment available")
    return {"delay_probability": item.delay_probability, "risk_category": item.risk_category, "top_risk_factors": item.risk_factors, "factor_importance": item.factor_importance, "recommendations": item.recommendations, "risk_trend": item.risk_trend, "model_version": item.model_version, "prediction_source": item.prediction_source, "confidence": item.confidence, "last_updated": item.created_at.isoformat()}


@app.get("/api/ai/history/{project_id}")
def history(project_id: int, session: Session = Depends(db)):
    return [{"previous_probability": item.previous_probability, "new_probability": item.new_probability, "previous_risk": item.previous_risk, "new_risk": item.new_risk, "changed_fields": item.changed_fields, "timestamp": item.created_at.isoformat(), "model_version": item.model_version, "prediction_source": item.prediction_source} for item in session.scalars(select(RiskHistory).where(RiskHistory.project_id == project_id).order_by(RiskHistory.created_at.desc())).all()]


@app.post("/api/interventions", status_code=201)
def create_intervention(payload: InterventionIn, session: Session = Depends(db)):
    if not session.get(Project, payload.project_id): raise HTTPException(404, "Project not found")
    item = Intervention(**payload.model_dump())
    session.add(item)
    session.commit()
    session.refresh(item)
    return {"id": item.id, **payload.model_dump(), "status": item.status, "created_at": item.created_at.isoformat()}


@app.get("/api/analytics/risk-distribution")
def risk_distribution(session: Session = Depends(db)):
    rows = session.execute(select(Project.risk_category, func.count(Project.id)).where(Project.risk_category.is_not(None)).group_by(Project.risk_category)).all()
    return [{"risk_category": category, "count": count} for category, count in rows]
