"use client";
// src/components/dashboard/ProjectsNeedingAttention.tsx
// Executive Projects Needing Attention Table with State/District/Type Filters & Search.

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Search, AlertCircle, ChevronDown } from "lucide-react";
import RiskBadge from "@/components/ui/RiskBadge";
import { ALL_INDIAN_STATES, getDistrictsForState } from "@/data/districtData";
import type { Project } from "@/types";

interface Props {
  projects: Project[];
}

export default function ProjectsNeedingAttention({ projects }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedType, setSelectedType] = useState("All Types");

  const availableDistricts = selectedState === "All States"
    ? ["All Districts"]
    : ["All Districts", ...getDistrictsForState(selectedState)];

  const handleStateChange = (st: string) => {
    setSelectedState(st);
    setSelectedDistrict("All Districts");
  };

  // Filter projects by Search query, State, District, and Project Type
  const filteredProjects = projects.filter((p) => {
    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.projectType.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // 2. State filter
    if (selectedState !== "All States" && p.state && p.state.toLowerCase() !== selectedState.toLowerCase()) {
      return false;
    }

    // 3. District filter
    if (selectedDistrict !== "All Districts" && p.district && p.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
      return false;
    }

    // 4. Project Type filter
    if (selectedType !== "All Types" && p.projectType && p.projectType.toLowerCase() !== selectedType.toLowerCase()) {
      return false;
    }

    return true;
  });

  const displayProjects = filteredProjects.slice(0, 6);

  return (
    <div className="bg-white border border-[#e6eaf0] rounded-2xl p-5 shadow-sm h-full flex flex-col space-y-4">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f1f5f9] pb-3">
        <div>
          <h3 className="text-[14px] font-extrabold text-[#172033] flex items-center gap-2">
            <AlertCircle size={16} className="text-[#2457d6]" /> Projects Needing Priority Attention
          </h3>
          <p className="text-[11px] text-[#687386] mt-0.5">
            Filter by state, district, type or search by keyword
          </p>
        </div>

        <Link
          href="/projects"
          className="text-[11px] font-semibold text-[#2457d6] hover:underline flex items-center gap-1 shrink-0"
        >
          View all <ExternalLink size={11} />
        </Link>
      </div>

      {/* Filter Control Bar: State, District, Project Type + Search Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 bg-[#f8fafc] border border-[#e6eaf0] rounded-xl p-2.5">
        {/* State Dropdown */}
        <div className="relative">
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full appearance-none bg-white border border-[#e6eaf0] rounded-lg pl-3 pr-7 py-1.5 text-xs text-[#172033] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2457d6]/30 shadow-2xs"
          >
            <option value="All States">All States</option>
            {ALL_INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687386] pointer-events-none"
          />
        </div>

        {/* District Dropdown */}
        <div className="relative">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full appearance-none bg-white border border-[#e6eaf0] rounded-lg pl-3 pr-7 py-1.5 text-xs text-[#172033] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2457d6]/30 shadow-2xs"
          >
            {availableDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687386] pointer-events-none"
          />
        </div>

        {/* Project Type Dropdown */}
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full appearance-none bg-white border border-[#e6eaf0] rounded-lg pl-3 pr-7 py-1.5 text-xs text-[#172033] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2457d6]/30 shadow-2xs"
          >
            {["All Types", "Highway", "Industrial Corridor", "Metro Rail", "Airport", "Irrigation", "Railway", "Power Plant"].map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              )
            )}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#687386] pointer-events-none"
          />
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#687386]" />
          <input
            type="text"
            placeholder="Search keyword…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#e6eaf0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2457d6]/30 text-[#172033] shadow-2xs"
          />
        </div>
      </div>

      {/* Simplified Clean Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-[12px] min-w-[640px]">
          <thead>
            <tr className="border-b border-[#e6eaf0] bg-[#f8fafc]">
              <th className="text-left font-bold text-[#687386] py-2.5 px-3">Project</th>
              <th className="text-left font-bold text-[#687386] py-2.5 px-3">District</th>
              <th className="text-left font-bold text-[#687386] py-2.5 px-3">Delay Probability</th>
              <th className="text-left font-bold text-[#687386] py-2.5 px-3">Risk Level</th>
              <th className="text-left font-bold text-[#687386] py-2.5 px-3">Top Driver</th>
              <th className="text-left font-bold text-[#687386] py-2.5 px-3">Recommended Action</th>
            </tr>
          </thead>
          <tbody>
            {displayProjects.length > 0 ? (
              displayProjects.map((p) => {
                const prob = Math.round(p.delayProbability * (p.delayProbability <= 1 ? 100 : 1));

                return (
                  <tr
                    key={p.id}
                    className="border-b border-[#f0f2f6] hover:bg-[#f8fafc] transition-colors"
                  >
                    {/* Project */}
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-mono font-bold text-[#172033] block text-[11px]">{p.id}</span>
                        <span className="text-[#172033] font-semibold block text-[12px] max-w-[170px] truncate" title={p.name}>
                          {p.name}
                        </span>
                      </div>
                    </td>

                    {/* District */}
                    <td className="py-3 px-3 text-[#172033] font-medium">{p.district}</td>

                    {/* Delay Probability */}
                    <td className="py-3 px-3">
                      <span
                        className="font-extrabold text-[12px]"
                        style={{
                          color: prob >= 75 ? "#dc3e4d" : prob >= 50 ? "#d97706" : "#16a673",
                        }}
                      >
                        {prob}%
                      </span>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3 px-3">
                      <RiskBadge level={p.riskLevel} />
                    </td>

                    {/* Top Driver */}
                    <td className="py-3 px-3 text-[#687386] max-w-[130px] truncate">
                      {p.topDelayDriver || "Land Acquisition Progress"}
                    </td>

                    {/* Recommended Action */}
                    <td className="py-3 px-3">
                      <Link
                        href={`/projects/${p.id}`}
                        className="px-3 py-1 text-[11px] font-bold text-[#2457d6] border border-[#2457d6]/30 rounded-lg hover:bg-[#eef3ff] transition-colors inline-block whitespace-nowrap"
                      >
                        Review Intervention
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[12px] text-[#687386]">
                  No matching projects found for "{searchQuery}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

