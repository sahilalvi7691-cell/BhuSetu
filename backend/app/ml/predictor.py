import json
import logging
import math
from datetime import datetime, timezone
from pathlib import Path

import joblib

logger = logging.getLogger(__name__)


def _number(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def build_features(project: dict, acquisition: dict | None, metadata: dict) -> dict:
    """Build the exact feature contract used by the trained pipeline."""
    acquisition = acquisition or {}
    nested = acquisition.get("acquisition", {}) if isinstance(acquisition.get("acquisition"), dict) else {}
    values = {**acquisition, **nested}
    now = datetime.now(timezone.utc)
    created = project.get("created_at") or project.get("createdAt")
    try:
        created_at = datetime.fromisoformat(str(created).replace("Z", "+00:00")) if created else now
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
    except ValueError:
        created_at = now
    age_days = max(0, (now - created_at).days)
    area = _number(project.get("required_land_area_acres", project.get("requiredLandArea")))
    if str(project.get("landUnit", project.get("unit", ""))).lower().startswith("hect"):
        area *= 2.47105
    parcels = values.get("parcels") or []
    verified_parcels = sum(1 for parcel in parcels if str(parcel.get("status", "")).lower() == "verified")
    parcel_area = sum(_number(parcel.get("area")) for parcel in parcels)
    ownership = str(values.get("ownership_status", values.get("ownership", "Pending verification")))
    compensation = str(values.get("compensation_status", values.get("compensation", "Not started")))
    legal = str(values.get("legal_status", values.get("legal", "No dispute recorded")))
    rr = str(values.get("rr_status", values.get("rr", "Not started")))
    approvals = str(values.get("approval_status", values.get("approvals", "In review")))
    documents = str(values.get("documents_status", values.get("documents", "Available")))
    unresolved = lambda text: int(text.lower() not in {"verified", "clear", "paid", "awarded", "completed", "approved", "available", "complete", "not applicable", "no dispute recorded", "on track"})
    factors = {
        "prediction_window_days": 365, "project_type": project.get("type", project.get("project_type", "Unknown")),
        "state": project.get("state", "Unknown"), "district": project.get("district", "Unknown"), "tehsil": project.get("tehsil", "Unknown"),
        "required_land_area_acres": area, "project_age_days": age_days, "parcel_area_acres": parcel_area, "required_area_acres": area,
        "land_use": values.get("land_use", "Mixed"), "ownership_type": values.get("ownership_type", "Individual"),
        "number_of_owners": _number(values.get("number_of_owners", len(parcels) or 1)), "joint_ownership": values.get("joint_ownership", "Unknown"),
        "gis_available": int(bool(project.get("geometry") or project.get("gis_available"))), "ownership_verified": int(ownership.lower() in {"verified", "clear"}),
        "title_clear": int(ownership.lower() in {"verified", "clear"}), "inheritance_issue": int(bool(values.get("inheritance_issue", False))),
        "ownership_dispute": int(bool(values.get("ownership_dispute", False)) or "dispute" in ownership.lower()), "mutation_status": values.get("mutation_status", "Unknown"),
        "missing_ownership_documents": _number(values.get("missing_ownership_documents", 0)), "ownership_complexity": _number(values.get("ownership_complexity", 1)),
        "compensation_status": compensation, "assessed_amount": _number(values.get("assessed_amount")), "offered_amount": _number(values.get("offered_amount")),
        "paid_amount": _number(values.get("paid_amount")), "payment_delay_days": _number(values.get("payment_delay_days")), "valuation_dispute": int(bool(values.get("valuation_dispute", False))),
        "bank_details_verified": int(bool(values.get("bank_details_verified", False))), "compensation_dispute": int(bool(values.get("compensation_dispute", False))),
        "legal_case_exists": int(bool(values.get("legal_case_exists", False)) or unresolved(legal)), "dispute_type": values.get("dispute_type", "None"),
        "court_case_pending": int(bool(values.get("court_case_pending", False))), "case_count": _number(values.get("case_count")), "stay_order": int(bool(values.get("stay_order", False))),
        "injunction": int(bool(values.get("injunction", False))), "legal_stage": values.get("legal_stage", "None"), "legal_case_age_days": _number(values.get("legal_case_age_days")),
        "rr_applicable": int(values.get("rr_applicable", True)), "affected_family_count": _number(values.get("affected_family_count")), "rr_assessment_status": values.get("rr_assessment_status", rr),
        "entitlement_status": values.get("entitlement_status", "Unknown"), "rehabilitation_status": values.get("rehabilitation_status", rr), "resettlement_required": int(bool(values.get("resettlement_required", False))),
        "resettlement_site_ready": int(bool(values.get("resettlement_site_ready", False))), "rr_payment_status": values.get("rr_payment_status", rr), "rr_delay_days": _number(values.get("rr_delay_days")),
        "pending_approval_count": _number(values.get("pending_approval_count", unresolved(approvals))), "missing_document_count": _number(values.get("missing_document_count", 0)),
        "document_completion_percentage": _number(values.get("document_completion_percentage", 100 if documents.lower() in {"available", "complete"} else 50)),
        "verification_pending": int(max(0, len(parcels) - verified_parcels) > 0), "officer_action_pending": int(bool(values.get("officer_action_pending", False))),
        "days_since_last_update": _number(values.get("days_since_last_update", 0)), "case_age_days": _number(values.get("case_age_days", age_days)),
        "land_acquisition_percentage": _number(values.get("land_acquisition_percentage", (verified_parcels / len(parcels) * 100) if parcels else 0)),
        "pending_issue_count": _number(values.get("pending_issue_count", unresolved(ownership) + unresolved(compensation) + unresolved(legal))),
        "compensation_pending_days": _number(values.get("compensation_pending_days")), "owners_per_acre": _number(values.get("owners_per_acre", 1 / area if area else 0)),
        "prediction_year": now.year, "prediction_month": now.month, "prediction_quarter": (now.month - 1) // 3 + 1,
        "project_start_year": created_at.year, "project_start_month": created_at.month, "project_start_quarter": (created_at.month - 1) // 3 + 1,
    }
    return {name: factors.get(name, 0 if name in metadata.get("numeric_cols", []) else "Unknown") for name in metadata.get("feature_columns", [])}


def explainable_factors(data: dict) -> list[dict]:
    checks = [
        (data.get("legal_case_exists") or data.get("legal_status") in {"Dispute Identified", "Under Review", "Pending Authority"}, 20, "Legal dispute or case pending", "Track the next legal milestone through the competent authority."),
        (data.get("ownership_conflict") or data.get("ownership_status") not in {None, "Verified", "Clear"}, 18, "Ownership verification incomplete", "Complete ownership, title and mutation verification."),
        (data.get("compensation_status") not in {None, "Paid", "Awarded"}, 18, "Compensation is not complete", "Close assessment, award and payment records with the responsible authority."),
        (data.get("rr_status") not in {None, "Completed", "Not Applicable"}, 14, "R&R actions remain pending", "Review entitlements, relocation and support milestones."),
        (data.get("approval_status") not in {None, "Approved", "Not Applicable"}, 12, "Approval dependency remains", "Follow up with the pending approving authority."),
        (data.get("documents_status") not in {None, "Complete", "Available"}, 10, "Documentation is incomplete", "Request and record the missing acquisition documents."),
    ]
    factors = [{"factor": label, "importance": weight, "explanation": label, "recommendation": recommendation} for active, weight, label, recommendation in checks if active]
    return factors or [{"factor": "No blocking acquisition factor reported", "importance": 5, "explanation": "The submitted acquisition statuses do not currently identify a blocking issue.", "recommendation": "Continue routine monitoring and keep acquisition records current."}]


class Predictor:
    def __init__(self, model_path: str, metadata_path: str):
        self.model = None
        self.metadata = {}
        self.model_version = "unavailable"
        try:
            self.metadata = json.loads(Path(metadata_path).read_text(encoding="utf-8"))
            self.model = joblib.load(model_path)
            self.model_version = "xgb-existing-model"
        except Exception as exc:
            logger.exception("Unable to load configured ML model; fallback will be used: %s", exc)

    @staticmethod
    def _fallback(data: dict) -> dict:
        checks = [
            (data.get("legal_case_exists") or data.get("legal_status") in {"Dispute Identified", "Under Review", "Pending Authority"}, 20, "Legal dispute or case pending", "Track the next legal milestone through the competent authority."),
            (data.get("ownership_conflict") or data.get("ownership_status") not in {"Verified", "Clear"}, 18, "Ownership verification incomplete", "Complete ownership, title and mutation verification."),
            (data.get("compensation_status") not in {"Paid", "Awarded"}, 18, "Compensation is not complete", "Close assessment, award and payment records with the responsible authority."),
            (data.get("rr_status") not in {"Completed", "Not Applicable"}, 14, "R&R actions remain pending", "Review entitlements, relocation and support milestones."),
            (data.get("approval_status") not in {"Approved", "Not Applicable"}, 12, "Approval dependency remains", "Follow up with the pending approving authority."),
            (data.get("documents_status") not in {"Complete", "Available"}, 10, "Documentation is incomplete", "Request and record the missing acquisition documents."),
        ]
        probability = min(95, max(5, 18 + sum(weight for active, weight, _, _ in checks if active)))
        factors = [{"factor": label, "importance": weight, "explanation": label, "recommendation": recommendation} for active, weight, label, recommendation in checks if active]
        category = "CRITICAL" if probability >= 75 else "HIGH" if probability >= 50 else "MEDIUM" if probability >= 25 else "LOW"
        return {"delay_probability": float(probability), "risk_category": category, "top_risk_factors": factors[:5], "factor_importance": {item["factor"]: item["importance"] for item in factors[:5]}, "recommendations": [item["recommendation"] for item in factors[:5]], "risk_trend": "STABLE", "model_version": "rule-based-fallback-v1", "confidence": None, "prediction_source": "RULE_BASED_FALLBACK", "last_updated": datetime.now(timezone.utc).isoformat()}

    def predict(self, data: dict) -> dict:
        factor_data = {**data, **(data.get("acquisition") or {})}
        if isinstance(data.get("acquisition"), dict) and isinstance(data["acquisition"].get("acquisition"), dict):
            factor_data.update(data["acquisition"]["acquisition"])
        factor_data.setdefault("ownership_status", factor_data.get("ownership"))
        factor_data.setdefault("compensation_status", factor_data.get("compensation"))
        factor_data.setdefault("legal_status", factor_data.get("legal"))
        factor_data.setdefault("rr_status", factor_data.get("rr"))
        factor_data.setdefault("approval_status", factor_data.get("approvals"))
        factor_data.setdefault("documents_status", factor_data.get("documents"))
        if self.model is None or not self.metadata.get("feature_columns"):
            return self._fallback(factor_data)
        try:
            import pandas as pd
            features = build_features(data.get("project", data), data.get("acquisition", data), self.metadata)
            frame = pd.DataFrame([features], columns=self.metadata["feature_columns"])
            probability = float(self.model.predict_proba(frame)[0][1] * 100) if hasattr(self.model, "predict_proba") else float(self.model.predict(frame)[0])
            probability = max(0, min(100, probability))
            category = "CRITICAL" if probability >= 75 else "HIGH" if probability >= 50 else "MEDIUM" if probability >= 25 else "LOW"
            factors = explainable_factors(factor_data)
            return {"delay_probability": round(probability, 2), "risk_category": category, "top_risk_factors": factors[:5], "factor_importance": {item["factor"]: item["importance"] for item in factors[:5]}, "recommendations": [item["recommendation"] for item in factors[:5]], "risk_trend": "STABLE", "model_version": self.model_version, "confidence": None, "prediction_source": "ML_MODEL", "last_updated": datetime.now(timezone.utc).isoformat()}
        except Exception as exc:
            logger.exception("Model prediction failed; fallback will be used: %s", exc)
            return self._fallback(factor_data)
