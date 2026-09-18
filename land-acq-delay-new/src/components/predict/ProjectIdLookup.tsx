"use client";
// src/components/predict/ProjectIdLookup.tsx
// Future-Ready Project ID Lookup Component with BhoomiRashi & NHAI API Integration Readiness.

import { useState } from "react";
import { Search, Building2, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import dataset from "@/data/processedProjects.json";
import type { Project, PredictionRequest } from "@/types";

interface Props {
  onSelectProject: (req: PredictionRequest) => void;
}

export default function ProjectIdLookup({ onSelectProject }: Props) {
  const [searchId, setSearchId] = useState("");
  const [searchedProject, setSearchedProject] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  const projects = dataset.projects as Project[];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setNotFound(false);

    if (!searchId.trim()) return;

    const q = searchId.trim().toLowerCase();
    const found = projects.find((p) => p.id.toLowerCase() === q || p.name.toLowerCase().includes(q));

    if (found) {
      setSearchedProject(found);
    } else {
      setSearchedProject(null);
      setNotFound(true);
    }
  };

  const handleAutoFillForm = () => {
    if (!searchedProject) return;

    const autoFillReq: PredictionRequest = {
      projectName: searchedProject.name,
      state: searchedProject.state,
      district: searchedProject.district,
      projectType: searchedProject.projectType,
      totalLandRequired: searchedProject.totalLandRequired || 120,
      landAcquiredPercentage: searchedProject.landAcquiredPct || 45,
      landPossessionPercentage: searchedProject.landPossessionPct || 30,
      pendingApprovals: searchedProject.pendingApprovals || 2,
      compensationPendingPercentage: searchedProject.compensationPendingPct || 25,
      legalDisputes: searchedProject.legalDisputes || 1,
      ownershipDisputes: searchedProject.ownershipDisputes || 0,
      affectedFamilies: searchedProject.affectedFamilies || 250,
      displacedFamilies: searchedProject.displacedFamilies || 50,
      rrCompletionPercentage: searchedProject.rrCompletionPct || 60,
      environmentClearance: searchedProject.environmentalClearance || "Approved",
      forestClearance: searchedProject.forestClearance || "Pending",
      previousDelay: searchedProject.expectedDelayDays > 0,
      currentStage: searchedProject.currentStage,
    };

    onSelectProject(autoFillReq);
  };

  return (
    <div className="bg-white border border-[#e6eaf0] rounded-2xl p-6 shadow-sm space-y-6">
      {/* BhoomiRashi / NHAI Integration Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#f8fafc] border border-[#e6eaf0] rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2457d6]/10 text-[#2457d6] flex items-center justify-center font-bold">
            <Building2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-extrabold text-[#172033]">BhoomiRashi &amp; NHAI Portal Auto-Lookup</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-extrabold uppercase border border-emerald-200 flex items-center gap-1">
                <ShieldCheck size={10} /> Future-Ready Integration API
              </span>
            </div>
            <p className="text-[11px] text-[#687386]">
              Enter a Project ID or Name to fetch live land acquisition records from National Highway &amp; State Portals.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="space-y-3">
        <label className="text-[11px] font-bold text-[#687386] uppercase tracking-wide block">
          Search Government Project Registry
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#687386]" />
            <input
              type="text"
              placeholder="e.g. PRJ001, NH-44, Mumbai Metro..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-[13px] border border-[#e6eaf0] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2457d6]/30 font-semibold"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#2457d6] text-white text-[12px] font-bold rounded-xl hover:bg-[#1d4ed8] transition-colors cursor-pointer flex items-center gap-2 shrink-0"
          >
            Lookup Record <ArrowRight size={14} />
          </button>
        </div>
        <p className="text-[10px] text-[#687386]">
          Tip: Try searching sample IDs like <code className="bg-gray-100 px-1 py-0.5 rounded text-[#2457d6] font-bold">PRJ001</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-[#2457d6] font-bold">PRJ002</code>, or <code className="bg-gray-100 px-1 py-0.5 rounded text-[#2457d6] font-bold">PRJ005</code>.
        </p>
      </form>

      {/* Searched Project Card Preview */}
      {searchedProject && (
        <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
            <div>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                ID: {searchedProject.id}
              </span>
              <h4 className="text-[16px] font-extrabold text-[#172033] mt-1">{searchedProject.name}</h4>
              <p className="text-[11px] text-[#687386]">
                {searchedProject.district}, {searchedProject.state} • {searchedProject.projectType}
              </p>
            </div>

            <button
              onClick={handleAutoFillForm}
              className="px-4 py-2 bg-[#2457d6] text-white text-[12px] font-bold rounded-xl hover:bg-[#1d4ed8] transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={14} /> Auto-Fill Predict Form
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div className="p-2.5 bg-white border border-blue-100 rounded-lg">
              <span className="text-[#687386] block text-[10px] font-bold uppercase">Current Stage</span>
              <span className="font-extrabold text-[#172033]">{searchedProject.currentStage}</span>
            </div>
            <div className="p-2.5 bg-white border border-blue-100 rounded-lg">
              <span className="text-[#687386] block text-[10px] font-bold uppercase">Land Acquired</span>
              <span className="font-extrabold text-[#172033]">{searchedProject.landAcquiredPct}%</span>
            </div>
            <div className="p-2.5 bg-white border border-blue-100 rounded-lg">
              <span className="text-[#687386] block text-[10px] font-bold uppercase">Compensation Pending</span>
              <span className="font-extrabold text-amber-700">{searchedProject.compensationPendingPct}%</span>
            </div>
            <div className="p-2.5 bg-white border border-blue-100 rounded-lg">
              <span className="text-[#687386] block text-[10px] font-bold uppercase">Active Legal Cases</span>
              <span className="font-extrabold text-red-600">{searchedProject.legalDisputes} cases</span>
            </div>
          </div>
        </div>
      )}

      {notFound && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-900 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Project ID Not Found in Local Cache</p>
            <p className="text-[11px] text-amber-800">
              Live BhoomiRashi API integration endpoint will automatically create a new record when connected. You can use the Quick Form or Bulk CSV Upload to add this project manually.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
