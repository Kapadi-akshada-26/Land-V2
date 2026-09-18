// src/lib/priority.ts
// Automatic Priority Queue Scoring Engine for Land Acquisition Projects.
// Ranks projects dynamically based on Delay Beyond Act, ML Risk Score, Legal Stage, Legal Cases, and Compensation Pending.

import type { Project } from "@/types";

export interface PriorityScoreBreakdown {
  score: number; // Composite priority score (higher = higher urgency)
  tier: "Critical" | "High" | "Medium" | "Low";
  reasons: string[];
}

// Stage weight map: advanced legal stages carry higher urgency
const STAGE_WEIGHTS: Record<string, number> = {
  "Compensation & Possession (Section 38)": 40,
  "Possession": 40,
  "Award (Section 25)": 35,
  "Award": 35,
  "Declaration (Section 19)": 30,
  "Declaration": 30,
  "Objection Hearing (Section 15)": 20,
  "Preliminary Notification (Section 11)": 15,
  "Expert Group Appraisal": 10,
  "Social Impact Assessment (SIA)": 5,
  "SIA": 5,
};

export function calculatePriorityScore(project: Project): PriorityScoreBreakdown {
  let score = 0;
  const reasons: string[] = [];

  // 1. ML Risk Score (0 - 100) -> Max ~30 points
  const mlContribution = (project.delayProbability / 100) * 30;
  score += mlContribution;

  // 2. Expected Delay / Statutory Overdue Days -> Max ~35 points
  const delayDays = project.expectedDelayDays || 0;
  if (delayDays > 180) {
    score += 35;
    reasons.push(`Severe statutory delay projected (${delayDays} days)`);
  } else if (delayDays > 90) {
    score += 25;
    reasons.push(`Significant delay beyond legal timeline (${delayDays} days)`);
  } else if (delayDays > 0) {
    score += 15;
    reasons.push(`Projected delay of ${delayDays} days`);
  }

  // 3. Current Stage Weight -> Max ~40 points
  const stageWeight = STAGE_WEIGHTS[project.currentStage] || 15;
  score += stageWeight;

  // 4. Legal Cases / Court Disputes -> Max ~25 points
  const disputes = project.legalDisputes || 0;
  if (disputes > 5) {
    score += 25;
    reasons.push(`Multiple active court disputes (${disputes} cases)`);
  } else if (disputes > 0) {
    score += 15;
    reasons.push(`Active legal disputes (${disputes} cases)`);
  }

  // 5. Compensation Pending Percentage -> Max ~20 points
  const compPending = project.compensationPendingPct || 0;
  if (compPending >= 50) {
    score += 20;
    reasons.push(`High pending compensation (${compPending}%)`);
  } else if (compPending > 0) {
    score += 10;
    reasons.push(`Undisbursed compensation (${compPending}%)`);
  }

  // Determine priority tier
  let tier: "Critical" | "High" | "Medium" | "Low" = "Low";
  if (score >= 90 || project.riskLevel === "Critical") {
    tier = "Critical";
  } else if (score >= 65 || project.riskLevel === "High") {
    tier = "High";
  } else if (score >= 40) {
    tier = "Medium";
  }

  return {
    score: Math.round(score),
    tier,
    reasons,
  };
}

export function sortProjectsByPriority(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const scoreA = calculatePriorityScore(a).score;
    const scoreB = calculatePriorityScore(b).score;
    return scoreB - scoreA;
  });
}
