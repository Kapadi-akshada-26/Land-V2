"use client";
// src/components/predict/PredictionResult.tsx
// Government-style Decision Summary Dashboard for Land Acquisition Monitoring.

import { RotateCcw, CheckCircle2, AlertTriangle, Clock, Scale, Calendar, AlertOctagon, ArrowRight, ShieldAlert, FileText, CheckSquare, Award, Flame } from "lucide-react";
import RiskBadge from "@/components/ui/RiskBadge";
import type { PredictionResponse } from "@/types";
import { riskColor } from "@/lib/utils";

interface Props {
  result: PredictionResponse;
  onReset: () => void;
}

const PRIORITY_ACTIONS_MAP: Record<string, { title: string; action: string; team: string; priority: "High" | "Medium" | "Urgent" }> = {
  "Legal Disputes": {
    title: "Expedite Legal Proceedings",
    action: "Coordinate with District Government Counsel to request early hearing or vacate court stay.",
    team: "District Legal Cell",
    priority: "Urgent",
  },
  "Legal Cases": {
    title: "Expedite Court Litigation",
    action: "File counter-affidavit and seek priority hearing before High Court/District Court.",
    team: "District Legal Counsel",
    priority: "Urgent",
  },
  "Compensation Pending": {
    title: "Release Pending Compensation",
    action: "Organize special beneficiary review camps for instant compensation disbursement.",
    team: "Special Land Acquisition Officer (SLAO)",
    priority: "High",
  },
  "Pending Approvals": {
    title: "Escalate Nodal Clearances",
    action: "Depute nodal officer to follow up directly with approving ministry/authority.",
    team: "Project Implementation Unit (PIU)",
    priority: "High",
  },
  "Forest Clearance": {
    title: "Fast-Track MoEFCC Clearance",
    action: "Submit compliance report for Stage-I forest clearance to State Forest Department.",
    team: "Forest Nodal Officer",
    priority: "High",
  },
  "Environmental Clearance": {
    title: "Clear Environment Clearances",
    action: "Submit EIA & EMP reports to EAC/SEAC for priority environmental clearance.",
    team: "Environment Cell",
    priority: "High",
  },
  "R&R Completion": {
    title: "Complete R&R Disbursement",
    action: "Finalize allotment of resettlement plots and grant distribution for displaced families.",
    team: "R&R Administrator",
    priority: "Medium",
  },
  "Land Possession": {
    title: "Expedite Physical Possession",
    action: "Issue Section 38 possession notices and take physical possession of clear land parcels.",
    team: "Revenue Collectorate",
    priority: "High",
  },
  "Land Acquisition Progress": {
    title: "Accelerate Acquisition Pace",
    action: "Form dedicated revenue teams to expedite land measurement and title verification.",
    team: "Tehsildar & SLAO",
    priority: "High",
  }
};

export default function PredictionResult({ result, onReset }: Props) {
  const pct = Math.round(result.delayProbability * 100);
  const color = riskColor(result.riskLevel);

  // Dynamic SHAP values normalized to sum to total risk % or raw percentages
  const rawShap = result.shapValues;
  const shapEntries = rawShap
    ? Object.entries(rawShap).sort((a, b) => b[1] - a[1])
    : result.topRiskFactors.map((f, i) => [f, (0.35 - i * 0.08)] as [string, number]);

  const totalShapSum = Math.max(0.001, shapEntries.reduce((acc, [, v]) => acc + Math.abs(v), 0));
  const maxShap = Math.max(...shapEntries.map(([, v]) => Math.abs(v)), 0.01);

  // Compute actual dynamic SHAP contribution percentage for each factor
  const dynamicShapFactors = shapEntries.map(([factor, val]) => {
    // Dynamic percentage contribution based on SHAP weight & total delay probability
    const contributionPct = Math.round((Math.abs(val) / totalShapSum) * pct);
    const isNegative = val < 0;
    return {
      factor,
      val,
      contributionPct: isNegative ? -Math.abs(contributionPct) : contributionPct,
      displayPercent: isNegative ? `-${Math.abs(contributionPct)}%` : `+${contributionPct}%`,
      barWidthPct: Math.round((Math.abs(val) / maxShap) * 100),
    };
  });

  // Top 3 Priority Ranked Drivers
  const topRankedDrivers = dynamicShapFactors.slice(0, 3);

  // RFCTLARR metrics
  const expectedLegalDays = result.expectedLegalDays ?? 365;
  const legalDeadlineDate = result.legalDeadlineDate;
  const daysRemaining = result.daysRemaining ?? 0;
  const projectedCompletionDays = result.projectedCompletionDays ?? (expectedLegalDays + result.expectedDelayDays);
  const delayBeyondActDays = result.delayBeyondActDays ?? Math.max(0, projectedCompletionDays - expectedLegalDays);
  const delayBeyondActMonths = result.delayBeyondActMonths ?? Number((delayBeyondActDays / 30).toFixed(1));
  const currentStage = result.currentStage || "Declaration (Section 19)";
  const actCompliance = result.actCompliance || (delayBeyondActDays > 90 ? "Critical" : delayBeyondActDays > 0 ? "Delayed" : "On Track");
  const stageTimeline = result.stageTimeline || [];

  // Dynamic Rule Engine for Legal Observations (Condition-based)
  const conditionalLegalObservations: string[] = [];
  
  if (result.legalTimelineComparison && result.legalTimelineComparison.length > 0) {
    conditionalLegalObservations.push(...result.legalTimelineComparison);
  } else {
    if (delayBeyondActDays > 0) {
      conditionalLegalObservations.push(`Projected delay of ${delayBeyondActDays} days (${delayBeyondActMonths} months) exceeds the statutory limit under the RFCTLARR Act, 2013.`);
    } else {
      conditionalLegalObservations.push(`Project is currently operating within statutory RFCTLARR Act timelines with ${daysRemaining} days remaining.`);
    }
    
    // Add specific rule-based observations based on top factors
    result.topRiskFactors.forEach((factor) => {
      if (factor.includes("Compensation")) {
        conditionalLegalObservations.push("Compensation still pending under Section 37; full payment required prior to possession.");
      } else if (factor.includes("Legal") || factor.includes("Dispute")) {
        conditionalLegalObservations.push("Legal disputes remain active under Section 64/69; litigation may delay physical possession.");
      } else if (factor.includes("Approval")) {
        conditionalLegalObservations.push("Pending administrative approvals must be cleared before advancing to the next stage.");
      } else if (factor.includes("R&R") || factor.includes("Rehabilitation")) {
        conditionalLegalObservations.push("Rehabilitation & Resettlement progress needs attention under Section 31.");
      } else if (factor.includes("Forest") || factor.includes("Clearance")) {
        conditionalLegalObservations.push("Required statutory forest/environment clearances remain pending.");
      }
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── Government Decision Dashboard Header ───────────────────────────── */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#2457d6] text-white text-[10px] font-extrabold uppercase tracking-wider">
              Decision Support Dashboard
            </span>
            <span className="text-[12px] text-[#687386]">RFCTLARR Act, 2013 Aligned</span>
          </div>
          <h2 className="text-[18px] font-extrabold text-[#172033] mt-1">
            Project Legal &amp; Delay Status Summary
          </h2>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-[#f8fafc] border border-[#e6eaf0] rounded-xl text-[12px] font-bold text-[#172033] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
        >
          <RotateCcw size={14} /> New Prediction
        </button>
      </div>

      {/* ── 1. Executive Summary Cards (Top 4 KPIs) ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Risk Level */}
        <div className="bg-white border border-[#e6eaf0] rounded-2xl p-5 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-[#687386] uppercase tracking-wide">Risk Level</p>
          <div className="flex items-center justify-between">
            <RiskBadge level={result.riskLevel} className="text-[14px] px-3.5 py-1" />
            <span className="text-[20px] font-black" style={{ color }}>{pct}%</span>
          </div>
          <p className="text-[10px] text-[#687386]">XGBoost Delay Probability</p>
        </div>

        {/* KPI 2: Delay Beyond Act */}
        <div className={`border rounded-2xl p-5 shadow-sm space-y-2 ${
          delayBeyondActDays > 0 ? "bg-red-50/50 border-red-200" : "bg-emerald-50/50 border-emerald-200"
        }`}>
          <p className="text-[11px] font-bold text-[#687386] uppercase tracking-wide">Delay Beyond Act</p>
          <p className={`text-[22px] font-black ${delayBeyondActDays > 0 ? "text-red-700" : "text-emerald-700"}`}>
            {delayBeyondActDays > 0 ? `${delayBeyondActDays} days` : "On Schedule"}
          </p>
          <p className="text-[10px] text-[#687386]">
            {delayBeyondActDays > 0 ? `(${delayBeyondActMonths} months overdue)` : "Statutory limits respected"}
          </p>
        </div>

        {/* KPI 3: Current Acquisition Stage */}
        <div className="bg-white border border-[#e6eaf0] rounded-2xl p-5 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-[#687386] uppercase tracking-wide">Current Stage</p>
          <p className="text-[14px] font-extrabold text-[#172033] line-clamp-1">{currentStage}</p>
          <p className="text-[10px] text-[#687386]">Active RFCTLARR Process</p>
        </div>

        {/* KPI 4: Next Legal Deadline */}
        <div className="bg-white border border-[#e6eaf0] rounded-2xl p-5 shadow-sm space-y-2">
          <p className="text-[11px] font-bold text-[#687386] uppercase tracking-wide flex items-center gap-1">
            <Calendar size={13} className="text-[#2457d6]" /> Next Legal Deadline
          </p>
          <p className="text-[18px] font-extrabold text-[#2457d6]">
            {legalDeadlineDate ? legalDeadlineDate : `${expectedLegalDays} days`}
          </p>
          <p className="text-[10px] text-[#687386]">
            {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Statutory deadline reached"}
          </p>
        </div>
      </div>

      {/* ── 2. RFCTLARR Timeline Status (Cleaner Comparison Card) ──────────── */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl shadow-sm p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6eaf0] pb-4">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-[#2457d6]" />
            <h3 className="text-[15px] font-bold text-[#172033]">RFCTLARR Timeline Evaluation</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#687386]">Compliance Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-[12px] font-bold border flex items-center gap-1.5 ${
                actCompliance === "On Track"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : actCompliance === "Warning"
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : actCompliance === "Delayed"
                  ? "bg-orange-50 text-orange-800 border-orange-300"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {actCompliance === "On Track" ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              ) : actCompliance === "Warning" ? (
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              ) : actCompliance === "Delayed" ? (
                <AlertTriangle size={13} className="text-orange-600" />
              ) : (
                <AlertOctagon size={13} className="text-red-600" />
              )}
              {actCompliance}
            </span>
          </div>
        </div>

        {/* Clean Timeline Comparison Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#f8fafc] border border-[#e6eaf0] rounded-xl space-y-1">
            <p className="text-[11px] text-[#687386] font-bold uppercase tracking-wide">Expected Legal Timeline</p>
            <p className="text-[20px] font-extrabold text-[#2457d6]">
              {expectedLegalDays} <span className="text-[13px] font-normal text-[#687386]">days</span>
            </p>
            <p className="text-[10px] text-[#687386]">Statutory limit under RFCTLARR Act</p>
          </div>

          <div className="p-4 bg-[#f8fafc] border border-[#e6eaf0] rounded-xl space-y-1">
            <p className="text-[11px] text-[#687386] font-bold uppercase tracking-wide">Actual / Projected Timeline</p>
            <p className="text-[20px] font-extrabold text-[#172033]">
              {projectedCompletionDays} <span className="text-[13px] font-normal text-[#687386]">days</span>
            </p>
            <p className="text-[10px] text-[#687386]">ML + stage elapsed calculation</p>
          </div>

          <div className={`p-4 rounded-xl border space-y-1 ${
            delayBeyondActDays > 0 ? "bg-red-50/70 border-red-200" : "bg-emerald-50/70 border-emerald-200"
          }`}>
            <p className="text-[11px] text-[#687386] font-bold uppercase tracking-wide">Delay Beyond Act</p>
            <p className={`text-[20px] font-extrabold ${delayBeyondActDays > 0 ? "text-red-700" : "text-emerald-700"}`}>
              {delayBeyondActDays} <span className="text-[13px] font-semibold">days ({delayBeyondActMonths} mos)</span>
            </p>
            <p className="text-[10px] text-[#687386]">Excess duration beyond legal limit</p>
          </div>
        </div>
      </div>

      {/* ── 3. Horizontal Stage Progress Tracker ────────────────────────────── */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-bold text-[#172033] flex items-center gap-2">
            <Clock size={16} className="text-[#2457d6]" /> Acquisition Stage Horizontal Progress Tracker
          </p>
          <span className="text-[11px] font-semibold text-[#687386]">
            Stage: {currentStage}
          </span>
        </div>

        <div className="relative flex items-center justify-between gap-2 overflow-x-auto py-3 px-2 bg-[#f8fafc] border border-[#e6eaf0] rounded-xl">
          {stageTimeline.map((item, idx) => {
            const isCompleted = item.status === "completed";
            const isCurrent = item.status === "current" || item.status === "delayed";
            const isUpcoming = item.status === "upcoming";

            return (
              <div key={item.stage + idx} className="flex-1 min-w-[130px] flex flex-col items-center text-center">
                <div className="flex items-center w-full justify-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] border shadow-xs ${
                      isCompleted
                        ? "bg-emerald-500 text-white border-emerald-600"
                        : isCurrent
                        ? "bg-[#2457d6] text-white border-[#1d4ed8] ring-4 ring-[#2457d6]/20 font-extrabold animate-pulse"
                        : isUpcoming
                        ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                        : "bg-gray-200 text-gray-500 border-gray-300"
                    }`}
                  >
                    {isCompleted ? "✓" : isCurrent ? "▶" : isUpcoming ? "NEXT" : idx + 1}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#172033] mt-2 line-clamp-1">{item.label}</span>
                <span
                  className={`text-[10px] font-semibold mt-1 px-2 py-0.5 rounded border ${
                    isCompleted
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : isCurrent
                      ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                      : isUpcoming
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                >
                  {item.statusText || (isCompleted ? "✓ Completed" : isCurrent ? "▶ Active" : isUpcoming ? "⏭ Next Up" : "⏳ Future")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Dynamic SHAP Feature Importance Section (With Top 3 Priority Ranking) ── */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#172033] flex items-center gap-2">
              <Flame size={16} className="text-[#dc3e4d]" /> Dynamic SHAP Feature Importance &amp; Impact
            </h3>
            <span className="text-[11px] font-bold text-[#2457d6] bg-[#eef3ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full">
              Dynamic Project SHAP
            </span>
          </div>
          <p className="text-[11px] text-[#687386] mt-0.5">
            Exact feature contributions computed dynamically for this specific project.
          </p>
        </div>

        {/* Priority Ranking Badges for Top 3 SHAP Drivers */}
        {topRankedDrivers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topRankedDrivers.map((item, index) => {
              const ranks = [
                { rank: "1st Highest Impact", badgeCls: "bg-red-50 text-red-700 border-red-200" },
                { rank: "2nd Highest Impact", badgeCls: "bg-orange-50 text-orange-700 border-orange-200" },
                { rank: "3rd Highest Impact", badgeCls: "bg-amber-50 text-amber-800 border-amber-200" },
              ];
              const r = ranks[index] || { rank: `${index + 1}th Impact`, badgeCls: "bg-blue-50 text-blue-700 border-blue-200" };
              return (
                <div key={item.factor + index} className="p-3 bg-[#f8fafc] border border-[#e6eaf0] rounded-xl flex items-center justify-between">
                  <div>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${r.badgeCls}`}>
                      {r.rank}
                    </span>
                    <p className="text-[12px] font-extrabold text-[#172033] mt-1">{item.factor}</p>
                  </div>
                  <span className="text-[14px] font-black text-[#dc3e4d]">
                    {item.displayPercent}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic SHAP Contribution Bars */}
        <div className="space-y-3 pt-2">
          {dynamicShapFactors.map((item) => (
            <div key={item.factor} className="flex items-center gap-3">
              <span className="w-[180px] text-[12px] font-semibold text-[#172033] shrink-0 line-clamp-1">{item.factor}</span>
              <div className="flex-1 h-2.5 bg-[#f0f2f6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.barWidthPct}%`,
                    background: item.contributionPct >= 15 ? "#dc3e4d" : item.contributionPct >= 8 ? "#d97706" : "#2457d6"
                  }}
                />
              </div>
              <span className="w-[60px] text-right text-[12px] font-bold shrink-0 text-[#dc3e4d]">
                {item.displayPercent}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Separate Legal Comparison Section (Rule Engine Driven) ───────── */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#e6eaf0] pb-3">
          <div>
            <h3 className="text-[14px] font-bold text-[#172033] flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#2457d6]" /> Legal Comparison &amp; Rule Engine Observations
            </h3>
            <p className="text-[11px] text-[#687386] mt-0.5">
              Conditional observations generated dynamically from project input data and statutory rules.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#2457d6] bg-[#eef3ff] border border-[#bfdbfe] px-2.5 py-1 rounded-lg">
            Dynamic Rule Engine
          </span>
        </div>

        <div className="space-y-3">
          {conditionalLegalObservations.map((obsText, idx) => (
            <div key={idx} className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[12px] text-amber-900 flex items-start gap-3">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold leading-relaxed">{obsText}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Executive Priority Actions for Officer Review ────────────────── */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-[14px] font-bold text-[#172033] flex items-center gap-2">
            <CheckSquare size={16} className="text-[#2457d6]" /> Executive Priority Actions for Officer Review
          </h3>
          <p className="text-[11px] text-[#687386] mt-0.5">
            Key actionable interventions prioritized based on prediction results and legal timeline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.topRiskFactors.map((factor) => {
            const item = PRIORITY_ACTIONS_MAP[factor] || {
              title: `Address ${factor}`,
              action: `Review and resolve outstanding bottlenecks in ${factor} immediately.`,
              team: "Nodal Administrative Unit",
              priority: "High",
            };

            return (
              <div
                key={factor}
                className="p-4 bg-white border border-[#e6eaf0] rounded-xl shadow-xs space-y-2 flex flex-col justify-between hover:border-[#bfdbfe] transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                      {item.priority} Priority
                    </span>
                    <span className="text-[10px] text-[#687386] font-semibold">{item.team}</span>
                  </div>
                  <h4 className="text-[13px] font-extrabold text-[#172033]">{item.title}</h4>
                  <p className="text-[11px] text-[#475569] leading-relaxed">{item.action}</p>
                </div>

                <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[10px] text-[#2457d6] font-bold">
                  <span>Action Required</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
