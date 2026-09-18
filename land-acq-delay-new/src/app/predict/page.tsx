"use client";
// src/app/predict/page.tsx
// Smart Project Onboarding Page supporting Quick Form, Project ID Lookup, and Bulk Excel/CSV Import.

import { useState } from "react";
import { FileText, Search, Upload, Sparkles, Building2 } from "lucide-react";
import PredictForm from "@/components/predict/PredictForm";
import ProjectIdLookup from "@/components/predict/ProjectIdLookup";
import BulkUpload from "@/components/predict/BulkUpload";
import type { PredictionRequest } from "@/types";

type OnboardingMode = "quick_form" | "id_lookup" | "bulk_upload";

export default function PredictPage() {
  const [mode, setMode] = useState<OnboardingMode>("quick_form");
  const [prefilledRequest, setPrefilledRequest] = useState<PredictionRequest | null>(null);

  const handleSelectProjectFromLookup = (req: PredictionRequest) => {
    setPrefilledRequest(req);
    setMode("quick_form");
  };

  return (
    <div className="max-w-[1000px] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#172033] leading-tight">
            Smart Project Onboarding &amp; Delay Prediction
          </h1>
          <p className="text-[13px] text-[#687386] mt-1">
            Choose your onboarding mode below. Predictions execute via FastAPI → XGBoost ML Model → SHAP Engine.
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="bg-[#f8fafc] border border-[#e6eaf0] rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setMode("quick_form")}
          className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-[12px] font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === "quick_form"
              ? "bg-white text-[#2457d6] shadow-sm border border-[#e6eaf0]"
              : "text-[#687386] hover:text-[#172033] hover:bg-white/50"
          }`}
        >
          <FileText size={15} /> 1. Quick Form Entry
        </button>

        <button
          onClick={() => setMode("id_lookup")}
          className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-[12px] font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === "id_lookup"
              ? "bg-white text-[#2457d6] shadow-sm border border-[#e6eaf0]"
              : "text-[#687386] hover:text-[#172033] hover:bg-white/50"
          }`}
        >
          <Search size={15} /> 2. Project ID Lookup (BhoomiRashi)
        </button>

        <button
          onClick={() => setMode("bulk_upload")}
          className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-[12px] font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            mode === "bulk_upload"
              ? "bg-white text-[#2457d6] shadow-sm border border-[#e6eaf0]"
              : "text-[#687386] hover:text-[#172033] hover:bg-white/50"
          }`}
        >
          <Upload size={15} /> 3. Bulk Excel / CSV Upload
        </button>
      </div>

      {/* Render Active Mode */}
      {mode === "quick_form" && (
        <PredictForm initialValues={prefilledRequest} />
      )}

      {mode === "id_lookup" && (
        <ProjectIdLookup onSelectProject={handleSelectProjectFromLookup} />
      )}

      {mode === "bulk_upload" && (
        <BulkUpload />
      )}
    </div>
  );
}
