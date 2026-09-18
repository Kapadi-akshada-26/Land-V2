// src/types/index.ts
// Central type definitions for the Land Acquisition Delay Prediction Dashboard

export type RiskLevel = "Critical" | "High" | "Medium" | "Low";

export type AcquisitionStage =
  | "Social Impact Assessment (SIA)"
  | "Expert Group Appraisal"
  | "Preliminary Notification (Section 11)"
  | "Objection Hearing (Section 15)"
  | "Declaration (Section 19)"
  | "Award (Section 25)"
  | "Compensation & Possession (Section 38)"
  | "SIA"
  | "Notification"
  | "Declaration"
  | "Award"
  | "Compensation"
  | "Possession"
  | "Completed";

export interface DashboardStats {
  totalProjects: number;
  criticalHighRisk: number;
  mediumRisk: number;
  onTrack: number;
  avgDelayProbability: number; // 0–100 (percentage)
  projectsBeyondAct?: number;
  criticalAlerts?: number;
}

export interface Project {
  id: string;
  name: string;
  state: string;
  district: string;
  projectType: string;
  currentStage: AcquisitionStage;
  delayProbability: number; // 0–100
  riskLevel: RiskLevel;
  topDelayDriver: string;
  landAcquiredPct: number;
  landPossessionPct: number;
  compensationPendingPct: number;
  rrCompletionPct: number;
  pendingApprovals: number;
  legalDisputes: number;
  ownershipDisputes: number;
  affectedFamilies: number;
  displacedFamilies: number;
  expectedDelayDays: number;
  lat?: number;
  lng?: number;
  totalLandRequired?: number;
  environmentalClearance?: string;
  forestClearance?: string;
  ministry?: string;
  keyEvent?: string;
  urbanRural?: string;
  year?: number;
}

export interface Alert {
  id: string;
  projectId: string;
  projectName: string;
  district: string;
  state: string;
  description: string;
  severity: RiskLevel;
  date: string; // ISO string
  status: "Open" | "Under Review" | "Resolved";
}

export interface DelayDriver {
  name: string;
  percentage: number;
  projectCount: number;
}

export interface RiskDistribution {
  level: RiskLevel;
  count: number;
  percentage: number;
}

export interface StateTrend {
  name: string;
  avgDelayProbability: number;
  projectCount: number;
  highRiskCount: number;
}

export interface DistrictTrend {
  name: string;
  state: string;
  avgDelayProbability: number;
  projectCount: number;
}

export interface PredictionRequest {
  projectName?: string;
  state: string;
  district: string;
  projectType: string;
  totalLandRequired: number;
  landAcquiredPercentage: number;
  landPossessionPercentage: number;
  pendingApprovals: number;
  compensationPendingPercentage: number;
  legalDisputes: number;
  ownershipDisputes: number;
  affectedFamilies: number;
  displacedFamilies: number;
  rrCompletionPercentage: number;
  environmentClearance: string;
  forestClearance: string;
  previousDelay: boolean;
  currentStage: AcquisitionStage;

  // RFCTLARR Act timeline inputs
  siaStartDate?: string;
  siaCompletionDate?: string;
  preliminaryNotificationDate?: string;
  declarationDate?: string;
  awardDate?: string;
}

export interface StageTimelineItem {
  stage: string;
  label: string;
  status: "completed" | "current" | "upcoming" | "future" | "delayed" | "in_progress" | "pending";
  statusText?: string;
}

export interface PredictionResponse {
  delayProbability: number; // 0–1
  riskLevel: RiskLevel;
  expectedDelayDays: number;
  topRiskFactors: string[];
  shapValues?: Record<string, number>;
  aiPriority?: string;
  aiSummary?: string;

  // Extended RFCTLARR Timeline Fields
  mlDelayDays?: number;
  expectedLegalDays?: number;
  legalDeadlineDate?: string;
  daysRemaining?: number;
  projectedCompletionDays?: number;
  delayBeyondActDays?: number;
  delayBeyondActMonths?: number;
  currentStage?: AcquisitionStage | string;
  actCompliance?: "On Track" | "Warning" | "Delayed" | "Critical" | string;
  stageTimeline?: StageTimelineItem[];
  legalTimelineComparison?: string[];

  topContributingFactors?: Array<{
    factor: string;
    value: string | number;
    severity: string;
    impact: string;
    explanation: string;
  }>;
  recommendedActions?: Array<{
    priority: string;
    factor: string;
    severity: string;
    action: string;
    steps: string[];
    responsible_team: string;
    expected_benefit: string;
  }>;
  predictionSummary?: Record<string, unknown>;
}

export interface AnalyticsData {
  stateTrends: StateTrend[];
  districtTrends: DistrictTrend[];
  delayDrivers: DelayDriver[];
  riskDistribution: RiskDistribution[];
}
