"use client";
// src/app/predict/page.tsx
// Smart Project Onboarding Page - Quick Form default with More Tools dropdown.

import { useState } from "react";
import { FileText, Search, Upload, Wrench, ChevronDown } from "lucide-react";
import PredictForm from "@/components/predict/PredictForm";
import ProjectIdLookup from "@/components/predict/ProjectIdLookup";
import BulkUpload from "@/components/predict/BulkUpload";
import type { PredictionRequest } from "@/types";

type OnboardingMode = "quick_form" | "id_lookup" | "bulk_upload";

export default function PredictPage() {
  const [mode, setMode] = useState<OnboardingMode>("quick_form");
  const [prefilledRequest, setPrefilledRequest] = useState<PredictionRequest | null>(null);
  const [toolsOpen, setToolsOpen] = useState(false);

  const handleSelectProjectFromLookup = (req: PredictionRequest) => {
    setPrefilledRequest(req);
    setMode("quick_form");
    setToolsOpen(false);
  };

  return (
    <div className="max-w-[1000px] space-y-6">
      {/* Header with More Tools Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#e6eaf0] rounded-2xl p-5 shadow-xs">
        <div>
          <h1 className="text-[20px] font-extrabold text-[#172033] leading-tight">
            Predict Land Acquisition Delay Risk
          </h1>
          <p className="text-[12px] text-[#687386] mt-0.5">
            Executive decision tool running FastAPI → XGBoost ML model → SHAP insights.
          </p>
        </div>

        {/* Navigation / Secondary Tools Action */}
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => {
              setMode("quick_form");
              setToolsOpen(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-[12px] font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              mode === "quick_form"
                ? "bg-[#2457d6] text-white shadow-xs"
                : "bg-[#f8fafc] text-[#687386] border border-[#e6eaf0] hover:text-[#172033]"
            }`}
          >
            <FileText size={14} /> Primary Prediction Form
          </button>

          {/* More Tools Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`px-3.5 py-2 rounded-xl text-[12px] font-extrabold transition-all flex items-center gap-2 cursor-pointer border ${
                mode !== "quick_form" || toolsOpen
                  ? "bg-[#172033] text-white border-[#172033]"
                  : "bg-[#f8fafc] text-[#172033] border-[#e6eaf0] hover:bg-[#f1f5f9]"
              }`}
            >
              <Wrench size={14} /> More Tools <ChevronDown size={14} />
            </button>

            {/* Dropdown Menu */}
            {toolsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#e6eaf0] rounded-2xl shadow-xl py-2 z-30 animate-in fade-in duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#687386] border-b border-[#f1f5f9]">
                  Secondary Utilities
                </div>

                <button
                  onClick={() => {
                    setMode("id_lookup");
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-[12px] font-semibold text-[#172033] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer"
                >
                  <Search size={14} className="text-[#2457d6]" />
                  <span>Project ID Lookup (BhoomiRashi)</span>
                </button>

                <button
                  onClick={() => {
                    setMode("bulk_upload");
                    setToolsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-[12px] font-semibold text-[#172033] hover:bg-[#f8fafc] flex items-center gap-2 cursor-pointer"
                >
                  <Upload size={14} className="text-[#2457d6]" />
                  <span>Bulk Excel / CSV Upload</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render Active View */}
      {mode === "quick_form" && (
        <PredictForm initialValues={prefilledRequest} />
      )}

      {mode === "id_lookup" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-3 text-[12px] text-blue-900">
            <span>Viewing secondary tool: <strong>Project ID Lookup</strong></span>
            <button
              onClick={() => setMode("quick_form")}
              className="font-bold underline text-[#2457d6] cursor-pointer"
            >
              Back to Primary Form
            </button>
          </div>
          <ProjectIdLookup onSelectProject={handleSelectProjectFromLookup} />
        </div>
      )}

      {mode === "bulk_upload" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-3 text-[12px] text-blue-900">
            <span>Viewing secondary tool: <strong>Bulk Excel / CSV Upload</strong></span>
            <button
              onClick={() => setMode("quick_form")}
              className="font-bold underline text-[#2457d6] cursor-pointer"
            >
              Back to Primary Form
            </button>
          </div>
          <BulkUpload />
        </div>
      )}
    </div>
  );
}

