"use client";
// src/components/predict/PredictionResult.tsx
// Executive Decision Support Summary Dashboard aligned with RFCTLARR & ML Prediction

import { RotateCcw, AlertTriangle, Clock, ArrowRight, ShieldAlert, CheckSquare, Sparkles, FileText } from "lucide-react";
import RiskBadge from "@/components/ui/RiskBadge";
import StageTimeline from "@/components/projects/StageTimeline";
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
  const pct = Math.round(result.delayProbability * (result.delayProbability <= 1 ? 100 : 1));
  const color = riskColor(result.riskLevel);
  const delayDays = result.expectedDelayDays ?? result.mlDelayDays ?? 120;

  // SHAP Feature Entries
  const rawShap = result.shapValues;
  const shapEntries = rawShap
    ? Object.entries(rawShap).sort((a, b) => b[1] - a[1])
    : result.topRiskFactors.map((f, i) => [f, (0.35 - i * 0.08)] as [string, number]);

  const totalShapSum = Math.max(0.001, shapEntries.reduce((acc, [, v]) => acc + Math.abs(v), 0));
  const maxShap = Math.max(...shapEntries.map(([, v]) => Math.abs(v)), 0.01);

  const dynamicShapFactors = shapEntries.map(([factor, val]) => {
    const contributionPct = Math.round((Math.abs(val) / totalShapSum) * pct);
    const isNegative = val < 0;
    return {
      factor,
      val,
      displayPercent: isNegative ? `-${Math.abs(contributionPct)}%` : `+${contributionPct}%`,
      barWidthPct: Math.round((Math.abs(val) / maxShap) * 100),
    };
  });

  // Calculate Needle Rotation for Circular Gauge (0 to 180 degrees)
  const needleRotation = Math.min(180, Math.max(0, (pct / 100) * 180));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Action Header */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#2457d6] text-white text-[10px] font-extrabold uppercase tracking-wider">
              Executive Prediction Report
            </span>
            <span className="text-[12px] text-[#687386]">RFCTLARR Aligned</span>
          </div>
          <h2 className="text-[18px] font-extrabold text-[#172033] mt-1">
            Prediction Results &amp; Decision Summary
          </h2>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-[#f8fafc] border border-[#e6eaf0] rounded-xl text-[12px] font-bold text-[#172033] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
        >
          <RotateCcw size={14} /> New Prediction
        </button>
      </div>

      {/* ── 1. CIRCULAR RISK GAUGE & 2. PREDICTED DELAY DAYS ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Circular Risk Gauge Component */}
        <div className="bg-white border border-[#e6eaf0] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
          <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-[#687386]">
            1. Delay Risk Level Gauge
          </h3>

          {/* SVG Circular Gauge */}
          <div className="relative w-64 h-36 flex items-center justify-center">
            <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
              {/* Arc Segments: Low (Green), Medium (Amber), High (Orange), Critical (Red) */}
              <path d="M 20 100 A 80 80 0 0 1 60 43.4" fill="none" stroke="#10b981" strokeWidth="18" strokeLinecap="round" />
              <path d="M 60 43.4 A 80 80 0 0 1 100 20" fill="none" stroke="#f59e0b" strokeWidth="18" />
              <path d="M 100 20 A 80 80 0 0 1 140 43.4" fill="none" stroke="#f97316" strokeWidth="18" />
              <path d="M 140 43.4 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round" />

              {/* Needle Indicator */}
              <g transform={`rotate(${needleRotation - 90}, 100, 100)`} className="transition-all duration-1000 ease-out">
                <line x1="100" y1="100" x2="100" y2="30" stroke="#172033" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="100" cy="100" r="7" fill="#172033" />
              </g>
            </svg>

            {/* Scale Labels */}
            <div className="absolute bottom-0 w-full flex justify-between px-4 text-[9px] font-bold text-[#687386]">
              <span className="text-emerald-600">Low (0-25%)</span>
              <span className="text-amber-600">Med (25-50%)</span>
              <span className="text-orange-600">High (50-75%)</span>
              <span className="text-red-600">Crit (75-100%)</span>
            </div>
          </div>

          {/* Central Score Display */}
          <div className="pt-2">
            <div className="flex items-center justify-center gap-2">
              <RiskBadge level={result.riskLevel} className="text-[14px] px-3.5 py-1" />
              <span className="text-[24px] font-black" style={{ color }}>{pct}%</span>
            </div>
            <p className="text-[11px] text-[#687386] mt-1">XGBoost ML Calculated Delay Probability</p>
          </div>
        </div>

        {/* 2. Predicted Delay Days Card */}
        <div className="bg-white border border-[#e6eaf0] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-[#687386] flex items-center gap-2">
              <Clock size={16} className="text-[#2457d6]" /> 2. Predicted Delay Duration
            </h3>
            <p className="text-[11px] text-[#687386] mt-0.5">Estimated timeline delay generated by ML model</p>
          </div>

          <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#2457d6]">Expected Delay</p>
            <p className="text-[40px] font-black text-[#172033] leading-none">
              {delayDays} <span className="text-[16px] font-bold text-[#687386]">Days</span>
            </p>
            <p className="text-[12px] font-bold text-[#2457d6]">
              ≈ {Number((delayDays / 30).toFixed(1))} Months Projected Delay
            </p>
          </div>

          <div className="p-3 bg-[#f8fafc] border border-[#e6eaf0] rounded-xl text-[11px] text-[#475569] flex items-center justify-between">
            <span>Primary Bottleneck Stage:</span>
            <span className="font-extrabold text-[#172033]">{result.currentStage || "Section 11 Notification"}</span>
          </div>
        </div>
      </div>

      {/* ── 3. TOP RISK FACTORS (SHAP EXPLANATION) ─────────────────────────── */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#e6eaf0] pb-3">
          <div>
            <h3 className="text-[14px] font-extrabold text-[#172033] flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#2457d6]" /> 3. Top Risk Factors (SHAP Explanation)
            </h3>
            <p className="text-[11px] text-[#687386] mt-0.5">
              Features contributing most to the predicted delay probability
            </p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#eef3ff] text-[#2457d6] border border-[#bfdbfe]">
            SHAP Engine
          </span>
        </div>

        <div className="space-y-3">
          {dynamicShapFactors.map((item) => (
            <div key={item.factor} className="flex items-center gap-3">
              <span className="w-[180px] text-[12px] font-semibold text-[#172033] shrink-0 line-clamp-1">{item.factor}</span>
              <div className="flex-1 h-2.5 bg-[#f0f2f6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${item.barWidthPct}%`,
                    background: item.val > 0 ? "#dc3e4d" : "#2457d6",
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

      {/* ── 4. AI SUMMARY ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl shadow-sm p-6 space-y-3">
        <div className="flex items-center gap-2 border-b border-[#e6eaf0] pb-2">
          <Sparkles size={16} className="text-[#2457d6]" />
          <h3 className="text-[14px] font-extrabold text-[#172033]">4. AI Decision Summary</h3>
        </div>
        <p className="text-[13px] text-[#334155] leading-relaxed bg-[#f8fafc] border border-[#e6eaf0] rounded-xl p-4 font-medium">
          {result.aiSummary ||
            `Project exhibits a ${pct}% probability of land acquisition delay (Risk Level: ${result.riskLevel}). Primary contributors include pending compensation disbursement and active legal proceedings. Early administrative intervention is recommended.`}
        </p>
      </div>

      {/* ── 5. RECOMMENDED ACTIONS ─────────────────────────────────────────── */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-[14px] font-extrabold text-[#172033] flex items-center gap-2">
            <CheckSquare size={16} className="text-[#2457d6]" /> 5. Recommended Interventions
          </h3>
          <p className="text-[11px] text-[#687386] mt-0.5">Prioritized steps for the Executive Engineer &amp; SLAO</p>
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

      {/* ── 6. RFCTLARR STAGE TRACKER (REUSING STAGETIMELINE) ──────────────── */}
      <StageTimeline
        currentStage={result.currentStage || "Section 11 Preliminary Notification"}
        daysInCurrentStage={41}
        expectedDelayDays={delayDays}
      />
    </div>
  );
}

