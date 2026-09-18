// src/services/predictionService.ts
import { USE_MOCK, apiFetch } from "./api";
import type { PredictionRequest, PredictionResponse, RiskLevel } from "@/types";

// Mock prediction fallback
const mockPrediction: PredictionResponse = {
  delayProbability: 0.92,
  riskLevel: "Critical",
  expectedDelayDays: 180,
  mlDelayDays: 180,
  expectedLegalDays: 730,
  projectedCompletionDays: 910,
  delayBeyondActDays: 180,
  delayBeyondActMonths: 6.0,
  currentStage: "Award",
  actCompliance: "Delayed",
  stageTimeline: [
    { stage: "SIA", label: "Social Impact Assessment (SIA)", status: "completed" },
    { stage: "Notification", label: "Preliminary Notification (Sec 11)", status: "completed" },
    { stage: "Objection Hearing", label: "Objection Hearing (Sec 15)", status: "completed" },
    { stage: "Declaration", label: "Declaration (Sec 19)", status: "completed" },
    { stage: "Award", label: "Compensation Award (Sec 25)", status: "delayed" },
    { stage: "Possession", label: "Possession & R&R (Sec 37/38)", status: "pending" },
  ],
  legalTimelineComparison: [
    "Compensation Award (Section 25) projected delay: 180 days (6 months) beyond statutory 12-month limit from Declaration.",
    "Section 25 statutory rule: Entire land acquisition proceedings lapse if Award is not declared within 12 months of Section 19 Declaration.",
    "Statutory Deadline: 730 days | Projected Completion: 910 days | Delay Beyond RFCTLARR Act: 180 days.",
  ],
  topRiskFactors: [
    "Legal Disputes",
    "Compensation Pending",
    "Pending Approvals",
  ],
  shapValues: {
    "Legal Disputes": 0.38,
    "Compensation Pending": 0.27,
    "Pending Approvals": 0.18,
    "Incomplete Documentation": 0.09,
    "R&R Incomplete": 0.05,
    "Forest Clearance": 0.03,
  },
};

function normalizeRiskLevel(level: string): RiskLevel {
  const norm = (level || "").toUpperCase();
  if (norm.includes("CRIT")) return "Critical";
  if (norm.includes("HIGH")) return "High";
  if (norm.includes("MED")) return "Medium";
  return "Low";
}

export async function predictRisk(
  data: PredictionRequest
): Promise<PredictionResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    // Dynamically adjust mock response based on input stage if provided
    const stage = data.currentStage || "Award";
    const isDecl = stage === "Declaration";
    const expLegal = isDecl ? 365 : 730;
    const projComp = isDecl ? 420 : 910;
    const delayAct = projComp - expLegal;
    return {
      ...mockPrediction,
      currentStage: stage,
      expectedLegalDays: expLegal,
      projectedCompletionDays: projComp,
      delayBeyondActDays: delayAct,
      delayBeyondActMonths: Number((delayAct / 30).toFixed(1)),
    };
  }

  const rawRes = await apiFetch<Record<string, any>>("/predict", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // Calculate normalized probability (0 - 1)
  const rawProb = typeof rawRes.delayProbability === "number"
    ? rawRes.delayProbability
    : typeof rawRes.delay_probability === "number"
    ? rawRes.delay_probability
    : 0;
  const delayProb = rawProb > 1 ? rawProb / 100 : rawProb;

  // Normalized delay days
  const expectedDays = rawRes.expectedDelayDays ?? rawRes.predicted_delay_days ?? rawRes.expected_delay_days ?? 0;

  // Normalized risk level
  const riskLevel = normalizeRiskLevel(rawRes.riskLevel || rawRes.risk_level || "Medium");

  // Normalized top risk factors
  const topFactors: string[] = rawRes.topRiskFactors || rawRes.top_risk_factors || [];

  return {
    delayProbability: Number(delayProb.toFixed(4)),
    riskLevel,
    expectedDelayDays: Math.round(Number(expectedDays)),
    mlDelayDays: Math.round(Number(rawRes.mlDelayDays ?? rawRes.ml_delay_days ?? expectedDays)),
    expectedLegalDays: rawRes.expectedLegalDays ?? rawRes.expected_legal_days ?? 730,
    legalDeadlineDate: rawRes.legalDeadlineDate ?? rawRes.legal_deadline_date,
    daysRemaining: rawRes.daysRemaining ?? rawRes.days_remaining ?? 0,
    projectedCompletionDays: rawRes.projectedCompletionDays ?? rawRes.projected_completion_days ?? 910,
    delayBeyondActDays: rawRes.delayBeyondActDays ?? rawRes.delay_beyond_act_days ?? 180,
    delayBeyondActMonths: rawRes.delayBeyondActMonths ?? rawRes.delay_beyond_act_months ?? 6,
    currentStage: rawRes.currentStage || rawRes.current_stage || data.currentStage || "Award",
    actCompliance: rawRes.actCompliance || rawRes.act_compliance || "Delayed",
    stageTimeline: rawRes.stageTimeline || rawRes.stage_timeline,
    legalTimelineComparison: rawRes.legalTimelineComparison || rawRes.legal_timeline_comparison,
    topRiskFactors: topFactors.length > 0 ? topFactors : ["Land Acquisition Progress"],
    shapValues: rawRes.shapValues || rawRes.shap_values,
    aiPriority: rawRes.aiPriority || rawRes.ai_priority,
    aiSummary: rawRes.aiSummary || rawRes.ai_summary,
    topContributingFactors: rawRes.topContributingFactors || rawRes.top_contributing_factors,
    recommendedActions: rawRes.recommendedActions || rawRes.recommended_actions,
    predictionSummary: rawRes.predictionSummary || rawRes.prediction_summary,
  };
}