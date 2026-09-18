
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, model_validator


class PredictionRequest(BaseModel):
    # Core fields (supports both snake_case and camelCase from frontend)
    state: str = Field(default="Maharashtra")
    district: Optional[str] = None
    project_type: Optional[str] = Field(default=None, alias="projectType")
    total_land_required_hectares: Optional[float] = Field(default=None, alias="totalLandRequired")
    land_acquired_percent: Optional[float] = Field(default=None, alias="landAcquiredPercentage")
    pending_approvals: Optional[int] = Field(default=None, alias="pendingApprovals")
    compensation_pending_percent: Optional[float] = Field(default=None, alias="compensationPendingPercentage")
    legal_cases: Optional[int] = Field(default=None, alias="legalDisputes")
    ownership_disputes: Optional[int] = Field(default=None, alias="ownershipDisputes")
    affected_families: Optional[int] = Field(default=None, alias="affectedFamilies")
    displaced_families: Optional[int] = Field(default=None, alias="displacedFamilies")
    rr_completed_percent: Optional[float] = Field(default=None, alias="rrCompletionPercentage")
    possession_percent: Optional[float] = Field(default=None, alias="landPossessionPercentage")
    planned_duration_months: Optional[int] = Field(default=24)
    environmental_clearance: Optional[str] = Field(default=None, alias="environmentClearance")
    forest_clearance: Optional[str] = Field(default=None, alias="forestClearance")
    previous_delay_days: Optional[Union[int, float]] = None
    previous_delay: Optional[Union[bool, str]] = Field(default=None, alias="previousDelay")
    project_status: Optional[str] = Field(default=None, alias="currentStage")

    # RFCTLARR Act dates & Project Name (Optional)
    project_name: Optional[str] = Field(default=None, alias="projectName")
    sia_start_date: Optional[str] = Field(default=None, alias="siaStartDate")
    sia_completion_date: Optional[str] = Field(default=None, alias="siaCompletionDate")
    preliminary_notification_date: Optional[str] = Field(default=None, alias="preliminaryNotificationDate")
    declaration_date: Optional[str] = Field(default=None, alias="declarationDate")
    award_date: Optional[str] = Field(default=None, alias="awardDate")

    class Config:
        populate_by_name = True
        extra = "allow"

    def get_feature_dict(self) -> Dict[str, Any]:
        """Convert input data to exact feature dictionary required by ML model."""
        # Map project_status from stage or status
        status_val = self.project_status or "In Progress"
        stage_map = {
            "SIA": "Early Stage",
            "Social Impact Assessment (SIA)": "Early Stage",
            "Expert Group Appraisal": "Early Stage",
            "Notification": "Early Stage",
            "Preliminary Notification (Section 11)": "Early Stage",
            "Objection Hearing": "Early Stage",
            "Objection Hearing (Section 15)": "Early Stage",
            "Declaration": "In Progress",
            "Declaration (Section 19)": "In Progress",
            "Award": "In Progress",
            "Award (Section 25)": "In Progress",
            "Compensation": "In Progress",
            "Possession": "Near Completion",
            "Compensation & Possession (Section 38)": "Near Completion",
            "Completed": "Completed"
        }
        status_val = stage_map.get(status_val, status_val)

        # Previous delay days calculation
        prev_days = 0
        if self.previous_delay_days is not None:
            prev_days = int(self.previous_delay_days)
        elif self.previous_delay is not None:
            if isinstance(self.previous_delay, bool):
                prev_days = 60 if self.previous_delay else 0
            elif str(self.previous_delay).lower() in ["true", "yes", "1"]:
                prev_days = 60

        return {
            "state": self.state or "Maharashtra",
            "project_type": self.project_type or "Highway",
            "total_land_required_hectares": float(self.total_land_required_hectares if self.total_land_required_hectares is not None else 50.0),
            "land_acquired_percent": float(self.land_acquired_percent if self.land_acquired_percent is not None else 50.0),
            "pending_approvals": int(self.pending_approvals if self.pending_approvals is not None else 0),
            "compensation_pending_percent": float(self.compensation_pending_percent if self.compensation_pending_percent is not None else 0.0),
            "legal_cases": int(self.legal_cases if self.legal_cases is not None else 0),
            "affected_families": int(self.affected_families if self.affected_families is not None else 0),
            "rr_completed_percent": float(self.rr_completed_percent if self.rr_completed_percent is not None else 100.0),
            "possession_percent": float(self.possession_percent if self.possession_percent is not None else 50.0),
            "planned_duration_months": int(self.planned_duration_months if self.planned_duration_months is not None else 24),
            "environmental_clearance": self.environmental_clearance or "Approved",
            "forest_clearance": self.forest_clearance or "Approved",
            "previous_delay_days": prev_days,
            "project_status": status_val
        }


class FactorInsight(BaseModel):
    factor: str
    value: Union[str, int, float]
    severity: str
    impact: str
    explanation: str


class RecommendationItem(BaseModel):
    priority: str
    factor: str
    severity: str
    action: str
    steps: List[str]
    responsible_team: str
    expected_benefit: str


class PredictionResponse(BaseModel):
    delay_probability: float
    risk_level: str
    predicted_delay_days: int
    expected_delay_days: int
    delayProbability: float
    riskLevel: str
    expectedDelayDays: int
    top_risk_factors: List[str]
    topRiskFactors: List[str]
    shap_values: Optional[Dict[str, float]] = None
    shapValues: Optional[Dict[str, float]] = None
    ai_priority: str
    ai_summary: str
    top_contributing_factors: List[FactorInsight]
    recommended_actions: List[RecommendationItem]
    prediction_summary: Dict[str, Any]

    # RFCTLARR Act Dynamic Timeline Engine Fields
    ml_delay_days: Optional[int] = None
    expected_legal_days: Optional[int] = None
    projected_completion_days: Optional[int] = None
    delay_beyond_act_days: Optional[int] = None
    delay_beyond_act_months: Optional[float] = None
    current_stage: Optional[str] = None
    act_compliance: Optional[str] = None
    stage_timeline: Optional[List[Dict[str, Any]]] = None
    legal_timeline_comparison: Optional[List[str]] = None
