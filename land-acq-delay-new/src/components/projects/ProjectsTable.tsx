"use client";
// src/components/projects/ProjectsTable.tsx
// Smart Portfolio Table with 6-Axis Filtering, Priority Queue Sorting, and Traffic-Light Status Indicators.

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, Filter, ArrowUpDown } from "lucide-react";
import RiskBadge from "@/components/ui/RiskBadge";
import { calculatePriorityScore } from "@/lib/priority";
import type { Project, RiskLevel } from "@/types";

interface Props {
  projects: Project[];
}

const RISK_LEVELS: (RiskLevel | "All")[] = ["All", "Critical", "High", "Medium", "Low"];
const COMPLIANCE_STATUSES = ["All", "🟢 On Track", "🟡 Attention Needed", "🟠 Delayed", "🔴 Critical"];
const RFCTLARR_STAGES = [
  "All",
  "Social Impact Assessment (SIA)",
  "Expert Group Appraisal",
  "Preliminary Notification (Section 11)",
  "Objection Hearing (Section 15)",
  "Declaration (Section 19)",
  "Award (Section 25)",
  "Compensation & Possession (Section 38)",
];

export default function ProjectsTable({ projects }: Props) {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [complianceFilter, setComplianceFilter] = useState("All");
  const [sortKey, setSortKey] = useState<"priority" | "delayProbability" | "name" | "id">("priority");

  // Dynamic filter options derived from dataset
  const allStates = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.state))).sort()], [projects]);
  const allDistricts = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.district))).sort()], [projects]);
  const allTypes = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.projectType))).sort()], [projects]);

  // Traffic-light status calculator
  const getTrafficLight = (p: Project) => {
    if (p.riskLevel === "Critical" || p.expectedDelayDays > 120 || p.legalDisputes > 3) {
      return { text: "🔴 Critical", key: "🔴 Critical", bg: "bg-red-50 text-red-800 border-red-200" };
    }
    if (p.riskLevel === "High" || p.expectedDelayDays > 0 || p.compensationPendingPct > 40) {
      return { text: "🟠 Delayed", key: "🟠 Delayed", bg: "bg-orange-50 text-orange-800 border-orange-200" };
    }
    if (p.riskLevel === "Medium" || p.legalDisputes > 0) {
      return { text: "🟡 Attention Needed", key: "🟡 Attention Needed", bg: "bg-amber-50 text-amber-800 border-amber-200" };
    }
    return { text: "🟢 On Track", key: "🟢 On Track", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
  };

  const filtered = useMemo(() => {
    return projects
      .filter((p) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          p.id.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q);

        const matchState = stateFilter === "All" || p.state === stateFilter;
        const matchDistrict = districtFilter === "All" || p.district === districtFilter;
        const matchType = typeFilter === "All" || p.projectType === typeFilter;
        const matchStage = stageFilter === "All" || p.currentStage === stageFilter || p.currentStage.includes(stageFilter);
        const matchRisk = riskFilter === "All" || p.riskLevel === riskFilter;

        const traffic = getTrafficLight(p);
        const matchCompliance = complianceFilter === "All" || traffic.key === complianceFilter;

        return matchSearch && matchState && matchDistrict && matchType && matchStage && matchRisk && matchCompliance;
      })
      .sort((a, b) => {
        if (sortKey === "priority") {
          return calculatePriorityScore(b).score - calculatePriorityScore(a).score;
        }
        if (sortKey === "delayProbability") {
          return b.delayProbability - a.delayProbability;
        }
        if (sortKey === "name") {
          return a.name.localeCompare(b.name);
        }
        return a.id.localeCompare(b.id);
      });
  }, [projects, search, stateFilter, districtFilter, typeFilter, stageFilter, riskFilter, complianceFilter, sortKey]);

  return (
    <div className="space-y-4">
      {/* ── 6-Axis Smart Filters Bar ────────────────────────────────────────── */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#2457d6]" />
            <span className="text-[13px] font-extrabold text-[#172033]">Smart Portfolio Filters (6-Axis)</span>
          </div>
          <span className="text-[12px] font-bold text-[#687386]">
            Showing {filtered.length} of {projects.length} projects
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Search */}
          <div className="relative col-span-1 lg:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#687386]" />
            <input
              type="text"
              placeholder="Search ID, Project, District, State..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-[12px] border border-[#e6eaf0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2457d6]/30 font-medium"
            />
          </div>

          {/* 1. State Filter */}
          <div className="relative">
            <label className="text-[10px] font-bold text-[#687386] uppercase block mb-0.5">State</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full text-[11px] font-semibold border border-[#e6eaf0] rounded-xl px-2.5 py-1.5 bg-white focus:outline-none pr-6 truncate"
            >
              {allStates.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 2. District Filter */}
          <div className="relative">
            <label className="text-[10px] font-bold text-[#687386] uppercase block mb-0.5">District</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full text-[11px] font-semibold border border-[#e6eaf0] rounded-xl px-2.5 py-1.5 bg-white focus:outline-none pr-6 truncate"
            >
              {allDistricts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 3. Project Type Filter */}
          <div className="relative">
            <label className="text-[10px] font-bold text-[#687386] uppercase block mb-0.5">Project Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-[11px] font-semibold border border-[#e6eaf0] rounded-xl px-2.5 py-1.5 bg-white focus:outline-none pr-6 truncate"
            >
              {allTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 4. RFCTLARR Stage Filter */}
          <div className="relative">
            <label className="text-[10px] font-bold text-[#687386] uppercase block mb-0.5">Stage</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full text-[11px] font-semibold border border-[#e6eaf0] rounded-xl px-2.5 py-1.5 bg-white focus:outline-none pr-6 truncate"
            >
              {RFCTLARR_STAGES.map((st) => (
                <option key={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 5. Risk Level & Sort */}
          <div className="relative">
            <label className="text-[10px] font-bold text-[#687386] uppercase block mb-0.5">Risk Level</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskLevel | "All")}
              className="w-full text-[11px] font-semibold border border-[#e6eaf0] rounded-xl px-2.5 py-1.5 bg-white focus:outline-none pr-6 truncate"
            >
              {RISK_LEVELS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* 6. Compliance Status Filter */}
          <div className="relative">
            <label className="text-[10px] font-bold text-[#687386] uppercase block mb-0.5">Traffic Light Status</label>
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="w-full text-[11px] font-semibold border border-[#e6eaf0] rounded-xl px-2.5 py-1.5 bg-white focus:outline-none pr-6 truncate"
            >
              {COMPLIANCE_STATUSES.map((cs) => (
                <option key={cs}>{cs}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority Sorting control */}
        <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-[#2457d6]" />
            <span className="text-[11px] font-bold text-[#687386]">Sort Priority Queue By:</span>
            <div className="flex gap-2">
              {[
                { label: "⚡ Automatic Priority Score", value: "priority" },
                { label: "🎯 ML Risk Probability", value: "delayProbability" },
                { label: "🔤 Project Name", value: "name" },
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSortKey(s.value as typeof sortKey)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-extrabold border transition-colors ${
                    sortKey === s.value
                      ? "bg-[#2457d6] text-white border-[#1d4ed8]"
                      : "bg-[#f8fafc] text-[#172033] border-[#e6eaf0] hover:bg-[#f1f5f9]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Table View ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e6eaf0] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] min-w-[950px]">
            <thead>
              <tr className="border-b border-[#e6eaf0] bg-[#f8fafc]">
                {[
                  "Project ID & Name",
                  "Location",
                  "Type",
                  "RFCTLARR Stage",
                  "Status & Traffic Light",
                  "ML Risk",
                  "Legal Cases",
                  "Comp. Pending",
                  "Action",
                ].map((h) => (
                  <th key={h} className="text-left font-semibold text-[#687386] py-3 px-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[#687386] text-[13px]">
                    No projects match the selected 6-axis criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const traffic = getTrafficLight(p);
                  return (
                    <tr key={p.id} className="border-b border-[#f0f2f6] hover:bg-[#f8fafc] transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <span className="font-mono font-bold text-[#172033] text-[11px] block">{p.id}</span>
                          <span className="text-[#172033] font-bold text-[13px] block max-w-[200px] truncate" title={p.name}>
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#687386]">
                        <span className="block font-semibold text-[#172033]">{p.district}</span>
                        <span className="text-[10px] text-[#687386]">{p.state}</span>
                      </td>
                      <td className="py-3 px-4 text-[#687386] font-medium">{p.projectType}</td>
                      <td className="py-3 px-4 text-[#687386] max-w-[150px]">
                        <span className="block truncate font-medium">{p.currentStage}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${traffic.bg}`}>
                          {traffic.text}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-extrabold text-[12px]"
                            style={{
                              color: p.delayProbability >= 75 ? "#dc3e4d" : p.delayProbability >= 50 ? "#d97706" : "#16a673",
                            }}
                          >
                            {p.delayProbability}%
                          </span>
                          <RiskBadge level={p.riskLevel} className="text-[9px] px-1.5 py-0" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#687386]">
                        {p.legalDisputes > 0 ? (
                          <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            {p.legalDisputes} cases
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">0 cases</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#687386]">
                        {p.compensationPendingPct > 0 ? (
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {p.compensationPendingPct}%
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold">0% (Paid)</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/projects/${p.id}`}
                          className="px-3 py-1.5 text-[11px] font-extrabold text-[#2457d6] bg-[#eef3ff] border border-[#2457d6]/30 rounded-xl hover:bg-[#2457d6] hover:text-white transition-all whitespace-nowrap inline-block"
                        >
                          Inspect Project
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
