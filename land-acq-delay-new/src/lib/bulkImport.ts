// src/lib/bulkImport.ts
// Bulk Import Parser & Validation Engine for Land Acquisition Projects.

import type { PredictionRequest } from "@/types";

export interface BulkImportRow {
  rowIndex: number;
  raw: Record<string, string>;
  request?: PredictionRequest;
  isValid: boolean;
  errors: string[];
  isDuplicate?: boolean;
}

export interface BulkValidationResult {
  totalRows: number;
  validRows: BulkImportRow[];
  invalidRows: BulkImportRow[];
  duplicateCount: number;
}

// Sample CSV template for user download
export const SAMPLE_CSV_TEMPLATE = `Project Name,State,District,Project Type,Total Land Required (Ha),Land Acquired (%),Current Stage,Compensation Pending (%),Legal Cases,Pending Approvals,Environment Clearance,Forest Clearance
NH-44 Expansion,Maharashtra,Nagpur,Highway,120.5,65,Declaration (Section 19),25,2,1,Approved,Pending
Mumbai Metro Line 4,Maharashtra,Thane,Metro Rail,45.0,80,Award (Section 25),40,1,0,Approved,Approved
Delhi-Jaipur Expressway,Rajasthan,Jaipur,Highway,210.0,40,Preliminary Notification (Section 11),70,4,3,Pending,Pending
Subernarekha Irrigation,Odisha,Mayurbhanj,Irrigation,310.0,20,Social Impact Assessment (SIA),90,0,2,Not Required,Pending`;

export function parseCSVText(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple regex parsing supporting quotes
    const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
    const cleanedValues = values.map((v) => v.trim().replace(/^["']|["']$/g, ""));

    if (cleanedValues.every((v) => !v)) continue; // skip empty line

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cleanedValues[idx] || "";
    });
    rows.push(rowObj);
  }

  return rows;
}

export function validateBulkRows(rows: Record<string, string>[], existingProjectNames: string[] = []): BulkValidationResult {
  const validRows: BulkImportRow[] = [];
  const invalidRows: BulkImportRow[] = [];
  const seenNames = new Set<string>(existingProjectNames.map((n) => n.toLowerCase()));
  let duplicateCount = 0;

  rows.forEach((raw, idx) => {
    const errors: string[] = [];
    const rowIndex = idx + 2; // header is row 1

    const projectName = raw["Project Name"] || raw["projectName"] || raw["Name"] || "";
    const state = raw["State"] || raw["state"] || "";
    const district = raw["District"] || raw["district"] || "";
    const projectType = raw["Project Type"] || raw["projectType"] || raw["Type"] || "Infrastructure";
    const stage = raw["Current Stage"] || raw["currentStage"] || raw["Stage"] || "";

    // Validation Rules
    if (!projectName) errors.push("Missing Project Name");
    if (!state) errors.push("Missing State");
    if (!district) errors.push("Missing District");
    if (!stage) errors.push("Missing Current Stage");

    // Check Duplicate
    let isDuplicate = false;
    if (projectName && seenNames.has(projectName.toLowerCase())) {
      isDuplicate = true;
      duplicateCount++;
      errors.push("Duplicate Project Name");
    } else if (projectName) {
      seenNames.add(projectName.toLowerCase());
    }

    const landReq = parseFloat(raw["Total Land Required (Ha)"] || raw["totalLandRequired"] || "100") || 100;
    const landAcqPct = parseFloat(raw["Land Acquired (%)"] || raw["landAcquiredPercentage"] || "50") || 50;
    const compPendingPct = parseFloat(raw["Compensation Pending (%)"] || raw["compensationPendingPercentage"] || "20") || 20;
    const legalDisputes = parseInt(raw["Legal Cases"] || raw["legalDisputes"] || "0", 10) || 0;
    const pendingApprovals = parseInt(raw["Pending Approvals"] || raw["pendingApprovals"] || "0", 10) || 0;

    const envClearance = raw["Environment Clearance"] || raw["environmentClearance"] || "Pending";
    const forestClearance = raw["Forest Clearance"] || raw["forestClearance"] || "Pending";

    const isValid = errors.length === 0;

    const parsedRequest: PredictionRequest = {
      projectName: projectName || `Project Row ${rowIndex}`,
      state: state || "Maharashtra",
      district: district || "District",
      projectType: projectType || "Highway",
      totalLandRequired: landReq,
      landAcquiredPercentage: landAcqPct,
      landPossessionPercentage: Math.max(0, landAcqPct - 10),
      pendingApprovals,
      compensationPendingPercentage: compPendingPct,
      legalDisputes,
      ownershipDisputes: Math.min(legalDisputes, 1),
      affectedFamilies: Math.round(landReq * 2),
      displacedFamilies: Math.round(landReq * 0.5),
      rrCompletionPercentage: Math.max(0, 100 - compPendingPct),
      environmentClearance: envClearance,
      forestClearance: forestClearance,
      previousDelay: compPendingPct > 30 || legalDisputes > 0,
      currentStage: (stage || "Declaration (Section 19)") as any,
    };

    const rowResult: BulkImportRow = {
      rowIndex,
      raw,
      request: parsedRequest,
      isValid,
      errors,
      isDuplicate,
    };

    if (isValid) {
      validRows.push(rowResult);
    } else {
      invalidRows.push(rowResult);
    }
  });

  return {
    totalRows: rows.length,
    validRows,
    invalidRows,
    duplicateCount,
  };
}
