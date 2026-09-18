// src/components/projects/StageTimeline.tsx
// Acquisition stage timeline — shows completed ✓ / active ⚠ / blocked 🔴 / pending ○

import type { AcquisitionStage } from "@/types";

const ALL_STAGES: AcquisitionStage[] = [
  "SIA", "Notification", "Declaration", "Award", "Compensation", "Possession", "Completed",
];

// Expected days per stage (rough benchmarks for government land acquisition)
const EXPECTED_DAYS: Record<AcquisitionStage, number> = {
  "Social Impact Assessment (SIA)": 180,
  "Expert Group Appraisal": 60,
  "Preliminary Notification (Section 11)": 180,
  "Objection Hearing (Section 15)": 60,
  "Declaration (Section 19)": 365,
  "Award (Section 25)": 365,
  "Compensation & Possession (Section 38)": 90,
  SIA: 45,
  Notification: 30,
  Declaration: 60,
  Award: 45,
  Compensation: 62,
  Possession: 30,
  Completed: 0,
};

interface Props {
  currentStage: AcquisitionStage;
  daysInCurrentStage?: number;
}

type StageStatus = "completed" | "active" | "blocked" | "pending";

function getStageStatus(stage: AcquisitionStage, currentStage: AcquisitionStage, daysInCurrentStage?: number): StageStatus {
  const currentIdx = ALL_STAGES.indexOf(currentStage);
  const stageIdx = ALL_STAGES.indexOf(stage);

  if (stageIdx < currentIdx) return "completed";
  if (stageIdx === currentIdx) {
    const expected = EXPECTED_DAYS[stage] ?? 60;
    if (daysInCurrentStage !== undefined && daysInCurrentStage > expected * 1.5) return "blocked";
    return "active";
  }
  return "pending";
}

const STATUS_STYLES: Record<StageStatus, { icon: string; dot: string; label: string; text: string }> = {
  completed: { icon: "✓", dot: "bg-green-500 border-green-500", label: "text-green-700", text: "Completed" },
  active:    { icon: "▶", dot: "bg-blue-500 border-blue-500",  label: "text-blue-700",  text: "In Progress" },
  blocked:   { icon: "⚠", dot: "bg-red-500 border-red-500",    label: "text-red-700",   text: "Delayed" },
  pending:   { icon: "○", dot: "bg-gray-200 border-gray-300",  label: "text-gray-400",  text: "Pending" },
};

export default function StageTimeline({ currentStage, daysInCurrentStage }: Props) {
  const expected = EXPECTED_DAYS[currentStage] ?? 60;
  const delay = daysInCurrentStage !== undefined ? Math.max(0, daysInCurrentStage - expected) : null;

  return (
    <div className="bg-white border border-[#e6eaf0] rounded-2xl p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-[14px] font-bold text-[#172033]">Acquisition Stage Timeline</h3>
        <p className="text-[11px] text-[#687386] mt-0.5">
          Current bottleneck and progression through land acquisition stages
        </p>
      </div>

      {/* Stage track */}
      <div className="relative flex items-start gap-0 overflow-x-auto pb-2">
        {ALL_STAGES.map((stage, idx) => {
          const status = getStageStatus(stage, currentStage, daysInCurrentStage);
          const style = STATUS_STYLES[status];
          const isLast = idx === ALL_STAGES.length - 1;

          return (
            <div key={stage} className="flex items-start min-w-[90px]">
              {/* Node + connector */}
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center w-full">
                  {/* Circle node */}
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-[12px] font-bold shrink-0 ${style.dot}`}>
                    {style.icon}
                  </div>
                  {/* Connector line */}
                  {!isLast && (
                    <div className={`flex-1 h-0.5 ${status === "completed" ? "bg-green-400" : "bg-gray-200"}`} />
                  )}
                </div>
                {/* Label */}
                <div className="mt-2 text-center px-1">
                  <p className={`text-[11px] font-bold ${style.label}`}>{stage}</p>
                  {status === "active" && (
                    <p className="text-[10px] text-[#687386] mt-0.5">Current</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current stage metrics */}
      {daysInCurrentStage !== undefined && (
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="bg-[#f8fafc] rounded-xl px-4 py-3 border border-[#e6eaf0]">
            <p className="text-[10px] text-[#687386] font-semibold uppercase tracking-wide mb-1">Current Stage</p>
            <p className="text-[15px] font-bold text-[#172033]">{currentStage}</p>
          </div>
          <div className="bg-[#f8fafc] rounded-xl px-4 py-3 border border-[#e6eaf0]">
            <p className="text-[10px] text-[#687386] font-semibold uppercase tracking-wide mb-1">Days in Stage</p>
            <p className="text-[15px] font-bold text-[#172033]">{daysInCurrentStage} days</p>
            <p className="text-[10px] text-[#687386]">Expected: {expected} days</p>
          </div>
          <div className={`rounded-xl px-4 py-3 border ${delay !== null && delay > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
            <p className="text-[10px] text-[#687386] font-semibold uppercase tracking-wide mb-1">Stage Delay</p>
            <p className={`text-[15px] font-bold ${delay !== null && delay > 0 ? "text-red-600" : "text-green-600"}`}>
              {delay !== null && delay > 0 ? `+${delay} days` : "On Schedule"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
