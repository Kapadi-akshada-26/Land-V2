// src/services/alertService.ts
// Intelligent Dynamic Alert Generation Service for Land Acquisition Monitoring.

import { USE_MOCK, apiFetch } from "./api";
import dataset from "@/data/processedProjects.json";
import type { Alert, Project } from "@/types";

const fallbackAlerts = (dataset.alerts || []) as Alert[];

export function generateIntelligentAlertsFromProjects(projects: Project[]): Alert[] {
  const alerts: Alert[] = [];
  const todayStr = new Date().toISOString().split("T")[0];

  projects.forEach((p, idx) => {
    // Rule 1: Legal timeline exceeded
    if (p.expectedDelayDays && p.expectedDelayDays > 90) {
      alerts.push({
        id: `alt-legal-exceed-${p.id}-${idx}`,
        projectId: p.id,
        projectName: p.name,
        district: p.district,
        state: p.state,
        description: `Statutory RFCTLARR Act timeline exceeded by projected ${p.expectedDelayDays} days in ${p.currentStage}.`,
        severity: "Critical",
        date: todayStr,
        status: "Open",
      });
    }

    // Rule 2: Compensation pending after Award stage
    if (
      (p.currentStage.includes("Award") || p.currentStage.includes("Possession") || p.currentStage.includes("Section 25") || p.currentStage.includes("Section 38")) &&
      p.compensationPendingPct > 0
    ) {
      alerts.push({
        id: `alt-comp-award-${p.id}-${idx}`,
        projectId: p.id,
        projectName: p.name,
        district: p.district,
        state: p.state,
        description: `${p.compensationPendingPct}% compensation disbursement pending post Award declaration under Section 37.`,
        severity: p.compensationPendingPct >= 50 ? "Critical" : "High",
        date: todayStr,
        status: "Open",
      });
    }

    // Rule 3: Active Legal Disputes affecting possession
    if (p.legalDisputes && p.legalDisputes > 0) {
      alerts.push({
        id: `alt-disputes-${p.id}-${idx}`,
        projectId: p.id,
        projectName: p.name,
        district: p.district,
        state: p.state,
        description: `${p.legalDisputes} active court dispute(s) pending under Section 64/69 delaying land handover.`,
        severity: p.legalDisputes > 3 ? "Critical" : "High",
        date: todayStr,
        status: "Under Review",
      });
    }

    // Rule 4: High Delay Risk approaching stage deadline
    if (p.delayProbability >= 75) {
      alerts.push({
        id: `alt-high-risk-${p.id}-${idx}`,
        projectId: p.id,
        projectName: p.name,
        district: p.district,
        state: p.state,
        description: `High XGBoost delay risk score (${p.delayProbability}%) detected for ${p.projectType} acquisition.`,
        severity: "High",
        date: todayStr,
        status: "Open",
      });
    }
  });

  return alerts.length > 0 ? alerts : fallbackAlerts;
}

export async function getAlerts(): Promise<Alert[]> {
  if (USE_MOCK) {
    const projects = (dataset.projects || []) as Project[];
    return generateIntelligentAlertsFromProjects(projects);
  }
  try {
    return await apiFetch<Alert[]>("/api/alerts");
  } catch {
    const projects = (dataset.projects || []) as Project[];
    return generateIntelligentAlertsFromProjects(projects);
  }
}

export async function getRecentAlerts(limit = 5): Promise<Alert[]> {
  const allAlerts = await getAlerts();
  return allAlerts.slice(0, limit);
}
