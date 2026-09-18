// src/lib/reportExporter.ts
// Download Report Exporter for PDF Summaries & Excel CSV Data.

import type { PredictionResponse, PredictionRequest } from "@/types";

export interface BatchPredictionResultItem {
  id: string;
  request: PredictionRequest;
  response: PredictionResponse;
}

export function exportBatchToCSV(items: BatchPredictionResultItem[], filename = "Land_Acquisition_Delay_Report.csv") {
  const headers = [
    "Project ID",
    "Project Name",
    "State",
    "District",
    "Project Type",
    "Current Stage",
    "ML Delay Probability (%)",
    "Risk Level",
    "Statutory Legal Days",
    "Projected Days",
    "Delay Beyond Act (Days)",
    "Delay Beyond Act (Months)",
    "Compliance Status",
    "Top Risk Factor",
  ];

  const csvRows: string[] = [];
  csvRows.push(headers.join(","));

  items.forEach((item, idx) => {
    const req = item.request;
    const res = item.response;
    const pId = item.id || `PRJ-${1000 + idx}`;
    const pName = `"${(req.projectName || `Project ${idx + 1}`).replace(/"/g, '""')}"`;
    const state = `"${(req.state || "").replace(/"/g, '""')}"`;
    const district = `"${(req.district || "").replace(/"/g, '""')}"`;
    const type = `"${(req.projectType || "").replace(/"/g, '""')}"`;
    const stage = `"${(res.currentStage || req.currentStage || "").replace(/"/g, '""')}"`;
    const delayProb = Math.round(res.delayProbability * 100);
    const risk = res.riskLevel;
    const expLegal = res.expectedLegalDays ?? 730;
    const projDays = res.projectedCompletionDays ?? (expLegal + res.expectedDelayDays);
    const delayActDays = res.delayBeyondActDays ?? Math.max(0, projDays - expLegal);
    const delayActMonths = res.delayBeyondActMonths ?? Number((delayActDays / 30).toFixed(1));
    const compliance = res.actCompliance || "Delayed";
    const topDriver = `"${(res.topRiskFactors?.[0] || "Land Acquisition Pace").replace(/"/g, '""')}"`;

    const row = [
      pId,
      pName,
      state,
      district,
      type,
      stage,
      delayProb,
      risk,
      expLegal,
      projDays,
      delayActDays,
      delayActMonths,
      compliance,
      topDriver,
    ];

    csvRows.push(row.join(","));
  });

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePDFSummaryReport(items: BatchPredictionResultItem[], title = "Land Acquisition Portfolio Delay Executive Report") {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const total = items.length;
  const highRisk = items.filter((i) => i.response.riskLevel === "Critical" || i.response.riskLevel === "High").length;
  const beyondAct = items.filter((i) => (i.response.delayBeyondActDays ?? 0) > 0).length;
  const dateStr = new Date().toLocaleDateString("en-IN", { dateStyle: "full" });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #172033; background: #fff; }
        .header { border-bottom: 2px solid #2457d6; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { margin: 0; text-transform: uppercase; font-size: 20px; color: #172033; }
        .header p { margin: 5px 0 0 0; color: #687386; font-size: 12px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
        .kpi-card { background: #f8fafc; border: 1px solid #e6eaf0; padding: 12px; border-radius: 8px; text-align: center; }
        .kpi-card .val { font-size: 22px; font-weight: 800; color: #2457d6; }
        .kpi-card .lbl { font-size: 10px; color: #687386; font-weight: 700; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px; }
        th, td { border: 1px solid #e6eaf0; padding: 8px 10px; text-align: left; }
        th { background: #f1f5f9; color: #475569; font-weight: 700; }
        .tag-critical { background: #fef2f2; color: #b91c1c; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
        .tag-high { background: #fff7ed; color: #c2410c; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
        .tag-on-track { background: #f0fdf4; color: #15803d; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
        .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; text-align: center; border-t: 1px solid #e2e8f0; padding-top: 15px; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #2457d6; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Print / Save as PDF
        </button>
      </div>

      <div class="header">
        <h1>Government of India - Land Acquisition Monitoring System</h1>
        <p>${title} | Generated on: ${dateStr} | Statutary RFCTLARR Act 2013 Aligned</p>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="val">${total}</div>
          <div class="lbl">Total Projects Analyzed</div>
        </div>
        <div class="kpi-card">
          <div class="val" style="color: #dc3e4d;">${highRisk}</div>
          <div class="lbl">High / Critical Risk Projects</div>
        </div>
        <div class="kpi-card">
          <div class="val" style="color: #d97706;">${beyondAct}</div>
          <div class="lbl">Projects Beyond Act Limit</div>
        </div>
        <div class="kpi-card">
          <div class="val" style="color: #16a673;">${total - highRisk}</div>
          <div class="lbl">On Track Projects</div>
        </div>
      </div>

      <h2>Detailed Bulk Prediction Summary Table</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Project ID &amp; Name</th>
            <th>State / District</th>
            <th>Acquisition Stage</th>
            <th>ML Risk</th>
            <th>Delay Beyond Act</th>
            <th>Compliance</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => {
            const req = item.request;
            const res = item.response;
            const riskCls = res.riskLevel === "Critical" ? "tag-critical" : res.riskLevel === "High" ? "tag-high" : "tag-on-track";
            const delayDays = res.delayBeyondActDays ?? 0;
            return `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${item.id}</strong><br/>${req.projectName || "Project"}</td>
                <td>${req.district}, ${req.state}</td>
                <td>${res.currentStage || req.currentStage}</td>
                <td><span class="${riskCls}">${res.riskLevel} (${Math.round(res.delayProbability * 100)}%)</span></td>
                <td>${delayDays > 0 ? `${delayDays} days overdue` : "On Schedule"}</td>
                <td>${res.actCompliance || "On Track"}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>

      <div class="footer">
        Confidential Decision Support Report - Generated by RFCTLARR AI Timeline Engine
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
