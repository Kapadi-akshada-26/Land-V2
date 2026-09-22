// src/components/dashboard/SmartAlertBanner.tsx
// Lightweight AI Priority Alert Banner for Dashboard

import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  projectName?: string;
  district?: string;
  message?: string;
  projectId?: string;
}

export default function SmartAlertBanner({
  projectName = "Project NH-48 Nashik Bypass",
  message = "shows increasing compensation and approval risks that could delay the next acquisition milestone.",
  projectId = "PRJ-MH-2026-001",
}: Props) {
  return (
    <div className="bg-gradient-to-r from-[#172033] via-[#1e293b] to-[#2457d6] text-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 border border-blue-900/40">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
          <Sparkles size={18} className="text-amber-300 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-500 text-white">
              AI Priority Alert
            </span>
            <span className="text-[11px] text-blue-200 font-semibold truncate">Early Warning Engine</span>
          </div>
          <p className="text-[12.5px] font-medium text-slate-100 mt-0.5 leading-tight truncate">
            <strong className="text-white font-bold">{projectName}</strong> {message}
          </p>
        </div>
      </div>

      <Link
        href={`/projects/${projectId}`}
        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 hover:translate-x-0.5 cursor-pointer"
      >
        <span>Review Intervention</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
}
