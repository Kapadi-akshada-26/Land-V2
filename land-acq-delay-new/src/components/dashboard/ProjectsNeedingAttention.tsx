// src/components/dashboard/ProjectsNeedingAttention.tsx
// Automatic Priority Queue Component displaying Traffic-Light Status & Urgency Rankings.

import Link from "next/link";
import { ExternalLink, Flame } from "lucide-react";
import RiskBadge from "@/components/ui/RiskBadge";
import { sortProjectsByPriority, calculatePriorityScore } from "@/lib/priority";
import type { Project } from "@/types";

interface Props {
  projects: Project[];
}

export default function ProjectsNeedingAttention({ projects }: Props) {
  const sortedProjects = sortProjectsByPriority(projects).slice(0, 5);

  return (
    <div className="bg-white border border-[#e6eaf0] rounded-2xl p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-bold text-[#172033] flex items-center gap-2">
            <Flame size={16} className="text-[#dc3e4d]" /> Automatic Priority Queue
          </h3>
          <p className="text-[11px] text-[#687386] mt-0.5">
            Ranked by RFCTLARR Statutory Delay, ML Risk Score &amp; Active Disputes
          </p>
        </div>
        <Link
          href="/projects"
          className="text-[11px] font-semibold text-[#2457d6] hover:underline flex items-center gap-1"
        >
          View all queue <ExternalLink size={11} />
        </Link>
      </div>

      <div className="overflow-x-auto -mx-5 px-5 flex-1">
        <table className="w-full text-[12px] min-w-[620px]">
          <thead>
            <tr className="border-b border-[#e6eaf0] bg-[#f8fafc]">
              {["Rank", "Project ID & Name", "Stage", "Traffic Light", "ML Risk", "Top Bottleneck", "Action"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left font-semibold text-[#687386] py-2.5 px-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((p, idx) => {
              const { score } = calculatePriorityScore(p);

              // 5-Axis Traffic-Light Status Determination
              // Red = Critical, Orange = Delayed, Yellow = Attention Needed, Green = On Track
              let trafficLightColor = "bg-emerald-500 text-white border-emerald-600";
              let trafficLightText = "🟢 On Track";
              let trafficBg = "bg-emerald-50 text-emerald-800 border-emerald-200";

              if (p.riskLevel === "Critical" || p.expectedDelayDays > 120 || p.legalDisputes > 3) {
                trafficLightColor = "bg-red-600 text-white border-red-700 animate-pulse";
                trafficLightText = "🔴 Critical";
                trafficBg = "bg-red-50 text-red-800 border-red-200";
              } else if (p.riskLevel === "High" || p.expectedDelayDays > 0 || p.compensationPendingPct > 40) {
                trafficLightColor = "bg-orange-500 text-white border-orange-600";
                trafficLightText = "🟠 Delayed";
                trafficBg = "bg-orange-50 text-orange-800 border-orange-200";
              } else if (p.riskLevel === "Medium" || p.legalDisputes > 0) {
                trafficLightColor = "bg-amber-400 text-amber-950 border-amber-500";
                trafficLightText = "🟡 Attention Needed";
                trafficBg = "bg-amber-50 text-amber-800 border-amber-200";
              }

              return (
                <tr
                  key={p.id}
                  className="border-b border-[#f0f2f6] hover:bg-[#f8fafc] transition-colors"
                >
                  <td className="py-3 px-3">
                    <span className="w-5 h-5 rounded-full bg-[#2457d6]/10 text-[#2457d6] text-[10px] font-extrabold flex items-center justify-center border border-[#2457d6]/20">
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div>
                      <span className="font-mono font-bold text-[#172033] block text-[11px]">{p.id}</span>
                      <span className="text-[#172033] font-semibold block text-[12px] max-w-[150px] truncate" title={p.name}>
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#687386] max-w-[130px] truncate">{p.currentStage}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${trafficBg}`}>
                      {trafficLightText}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-bold text-[12px]"
                        style={{
                          color: p.delayProbability >= 75 ? "#dc3e4d" : p.delayProbability >= 50 ? "#d97706" : "#16a673",
                        }}
                      >
                        {p.delayProbability}%
                      </span>
                      <RiskBadge level={p.riskLevel} className="text-[9px] px-1.5 py-0" />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#687386] max-w-[120px] truncate">
                    {p.topDelayDriver || "Land Acquisition Pace"}
                  </td>
                  <td className="py-3 px-3">
                    <Link
                      href={`/projects/${p.id}`}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#2457d6] border border-[#2457d6]/30 rounded-lg hover:bg-[#eef3ff] transition-colors whitespace-nowrap"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
