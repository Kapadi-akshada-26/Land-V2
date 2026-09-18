"use client";
// src/components/predict/PredictForm.tsx
// Smart Dynamic Input Form aligned with RFCTLARR Act, 2013 acquisition stages.

import { useState, useMemo } from "react";
import { Loader2, Scale, CheckCircle2, ChevronDown, ChevronUp, Sparkles, ShieldCheck, Search, Calendar } from "lucide-react";
import { predictRisk } from "@/services/predictionService";
import { USE_MOCK } from "@/services/api";
import type { PredictionRequest, PredictionResponse, AcquisitionStage } from "@/types";
import PredictionResult from "./PredictionResult";

const STATES = [
  "Maharashtra", "Gujarat", "Rajasthan", "Karnataka", "Uttar Pradesh",
  "Madhya Pradesh", "Andhra Pradesh", "Tamil Nadu", "West Bengal",
  "Odisha", "Jharkhand", "Telangana", "Punjab", "Haryana",
];

const STATE_DISTRICTS_MAP: Record<string, string[]> = {
  Maharashtra: ["Nashik", "Thane", "Nagpur", "Pune", "Mumbai Suburban", "Mumbai City", "Aurangabad", "Ahmednagar", "Solapur", "Kolhapur", "Palghar", "Raigad", "Satara", "Jalgaon", "Nanded", "Amravati"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Vapi", "Bharuch", "Gandhinagar", "Jamnagar", "Bhavnagar", "Kheda", "Kutch", "Mehsana", "Valsad"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bhilwara", "Nagaur", "Sikar"],
  Karnataka: ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Dakshina Kannada", "Dharwad", "Belagavi", "Kalaburagi", "Ballari", "Tumakuru", "Udupi"],
  "Uttar Pradesh": ["Lucknow", "Kanpur Nagar", "Gautam Buddha Nagar", "Ghaziabad", "Varanasi", "Agra", "Prayagraj", "Gorakhpur", "Meerut", "Bareilly", "Mathura", "Ayodhya"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Rewa", "Satna"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Kakinada", "Nellore", "Kurnool", "Anantapur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode"],
  "West Bengal": ["Kolkata", "Howrah", "North 24 Parganas", "South 24 Parganas", "Hooghly", "Paschim Medinipur", "Darjeeling"],
  Odisha: ["Sambalpur", "Koraput", "Khurda", "Cuttack", "Ganjam", "Sundargarh", "Balasore", "Puri", "Mayurbhanj"],
  Jharkhand: ["Ranchi", "East Singhbhum", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
  Telangana: ["Hyderabad", "Ranga Reddy", "Medchal-Malkajgiri", "Warangal", "Nizamabad", "Karimnagar"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "SAS Nagar (Mohali)", "Bathinda"],
  Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Sonipat"],
};

const PROJECT_TYPES = [
  "Highway", "Industrial Corridor", "Metro Rail", "Airport",
  "Irrigation", "Railway", "Power Plant", "Smart City", "Port",
];

// Exact RFCTLARR Act 2013 acquisition stages in legal order
const STAGES: AcquisitionStage[] = [
  "Social Impact Assessment (SIA)",
  "Expert Group Appraisal",
  "Preliminary Notification (Section 11)",
  "Objection Hearing (Section 15)",
  "Declaration (Section 19)",
  "Award (Section 25)",
  "Compensation & Possession (Section 38)",
];

const STAGE_LEGAL_TIMELINES: Record<string, { duration: string; description: string }> = {
  "Social Impact Assessment (SIA)": {
    duration: "Up to 6 months allowed",
    description: "Statutory timeframe allowed under RFCTLARR Act for SIA study and report preparation.",
  },
  "Expert Group Appraisal": {
    duration: "Around 2 months allowed",
    description: "Appraisal of SIA report by Multi-Disciplinary Expert Group under Section 7.",
  },
  "Preliminary Notification (Section 11)": {
    duration: "SIA valid up to 12 months",
    description: "SIA study report remains valid for 12 months to publish Section 11 Preliminary Notification.",
  },
  "Objection Hearing (Section 15)": {
    duration: "60 days allowed under RFCTLARR Act",
    description: "Statutory time limit for receiving and hearing landowner objections after Section 11 Notification.",
  },
  "Declaration (Section 19)": {
    duration: "Within 12 months of Preliminary Notification",
    description: "Section 11 Notification lapses if Section 19 Declaration is not published within 12 months.",
  },
  "Award (Section 25)": {
    duration: "Within 12 months of Declaration",
    description: "Entire land acquisition proceedings lapse if Section 25 Award is not declared within 12 months.",
  },
  "Compensation & Possession (Section 38)": {
    duration: "Around 3 months after Award",
    description: "Full compensation payment and R&R provision required before taking physical possession.",
  },
};

const CLEARANCE_OPTIONS = ["Approved", "Pending", "Not Required"];

const PROCESSING_STEPS = [
  "Validating Inputs",
  "Checking RFCTLARR Timeline",
  "Running XGBoost Prediction",
  "Generating SHAP Explanation",
  "Preparing Recommendations",
];

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-[#687386] uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[#687386]">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 text-[13px] border border-[#e6eaf0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2457d6]/30 text-[#172033]";

const selectCls =
  "w-full px-3 py-2.5 text-[13px] border border-[#e6eaf0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2457d6]/30 text-[#172033] cursor-pointer disabled:bg-[#f8fafc] disabled:text-gray-400 disabled:cursor-not-allowed";

interface PredictFormProps {
  initialValues?: PredictionRequest | null;
}

export default function PredictForm({ initialValues }: PredictFormProps = {}) {
  const [form, setForm] = useState<Partial<PredictionRequest>>(() => ({
    projectName: initialValues?.projectName || "",
    state: initialValues?.state || "",
    district: initialValues?.district || "",
    projectType: initialValues?.projectType || "",
    totalLandRequired: initialValues?.totalLandRequired,
    landAcquiredPercentage: initialValues?.landAcquiredPercentage,
    landPossessionPercentage: initialValues?.landPossessionPercentage,
    pendingApprovals: initialValues?.pendingApprovals,
    compensationPendingPercentage: initialValues?.compensationPendingPercentage,
    legalDisputes: initialValues?.legalDisputes,
    ownershipDisputes: initialValues?.ownershipDisputes,
    affectedFamilies: initialValues?.affectedFamilies,
    displacedFamilies: initialValues?.displacedFamilies,
    rrCompletionPercentage: initialValues?.rrCompletionPercentage,
    environmentClearance: initialValues?.environmentClearance || "",
    forestClearance: initialValues?.forestClearance || "",
    previousDelay: initialValues?.previousDelay || false,
    currentStage: initialValues?.currentStage,
    siaStartDate: "",
    siaCompletionDate: "",
    preliminaryNotificationDate: "",
    declarationDate: "",
    awardDate: "",
  }));

  const [districtSearch, setDistrictSearch] = useState("");
  const [stageStartDate, setStageStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof PredictionRequest, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Handle State Change -> Reset District & Filter District List
  const handleStateChange = (selectedState: string) => {
    setForm((f) => ({ ...f, state: selectedState, district: "" }));
    setDistrictSearch("");
  };

  const availableDistricts = useMemo(() => {
    if (!form.state) return [];
    const list = STATE_DISTRICTS_MAP[form.state] || [
      "Central District", "North District", "South District", "East District", "West District"
    ];
    if (!districtSearch.trim()) return list;
    return list.filter((d) => d.toLowerCase().includes(districtSearch.toLowerCase()));
  }, [form.state, districtSearch]);

  const selectedStage = form.currentStage || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Basic validation
    const required: (keyof PredictionRequest)[] = [
      "state", "district", "projectType", "currentStage",
      "environmentClearance", "forestClearance",
    ];
    for (const k of required) {
      if (!form[k]) {
        setError(`Please fill in all required fields (${k} is missing).`);
        return;
      }
    }

    setLoading(true);
    setActiveStep(0);

    // Step progress animation
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < PROCESSING_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 280);

    try {
      // Pass single stageStartDate to specific stage field
      const payload: PredictionRequest = {
        ...(form as PredictionRequest),
        siaStartDate: stageStartDate,
        preliminaryNotificationDate: stageStartDate,
        declarationDate: stageStartDate,
        awardDate: stageStartDate,
      };

      const res = await predictRisk(payload);
      setTimeout(() => {
        setResult(res);
        setLoading(false);
        clearInterval(stepInterval);
      }, 1200);
    } catch (err) {
      clearInterval(stepInterval);
      setError("Prediction failed. Check that the FastAPI backend is running.");
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setStageStartDate("");
    setDistrictSearch("");
    setForm({
      projectName: "",
      state: "",
      district: "",
      projectType: "",
      totalLandRequired: undefined,
      landAcquiredPercentage: undefined,
      landPossessionPercentage: undefined,
      pendingApprovals: undefined,
      compensationPendingPercentage: undefined,
      legalDisputes: undefined,
      ownershipDisputes: undefined,
      affectedFamilies: undefined,
      displacedFamilies: undefined,
      rrCompletionPercentage: undefined,
      environmentClearance: "",
      forestClearance: "",
      previousDelay: false,
      currentStage: undefined,
      siaStartDate: "",
      siaCompletionDate: "",
      preliminaryNotificationDate: "",
      declarationDate: "",
      awardDate: "",
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white border border-[#e6eaf0] rounded-2xl shadow-sm overflow-hidden">
        {/* Form Header */}
        <div className="px-6 py-4 border-b border-[#e6eaf0] bg-[#f8fafc] flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-[#172033]">Project Parameters</h2>
            <p className="text-[11px] text-[#687386] mt-0.5">
              RFCTLARR stage-aware dynamic form — inputs feed FastAPI &amp; XGBoost
            </p>
          </div>
          <span className={`text-[10px] rounded px-2.5 py-1 font-semibold border ${USE_MOCK
              ? "bg-amber-50 text-amber-600 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
            {USE_MOCK ? "Mock Mode Active" : "FastAPI + ML Live"}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Section 1: Permanent Inputs — Location & Overview */}
          <div>
            <p className="text-[11px] font-bold text-[#2457d6] uppercase tracking-widest mb-3">
              1 · Project Identification &amp; Location (Permanent)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Project Name" hint="e.g. Nashik Highway Expansion">
                <input
                  className={inputCls}
                  placeholder="e.g. Vadodara Expressway Package III"
                  value={form.projectName ?? ""}
                  onChange={(e) => set("projectName", e.target.value)}
                />
              </Field>

              {/* 1. State Dropdown */}
              <Field label="State" required>
                <select
                  className={selectCls}
                  value={form.state ?? ""}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  <option value="">Select State</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              {/* 1. Cascading State -> District Dropdown (Visually Identical to State Dropdown) */}
              <Field label="District" required hint={!form.state ? "Select State first to enable" : "Cascading district list"}>
                <select
                  className={selectCls}
                  disabled={!form.state}
                  value={form.district ?? ""}
                  onChange={(e) => set("district", e.target.value)}
                >
                  <option value="">
                    {!form.state ? "Select State First" : `Select District in ${form.state}`}
                  </option>
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>

              <Field label="Project Type" required>
                <select className={selectCls} value={form.projectType ?? ""} onChange={(e) => set("projectType", e.target.value)}>
                  <option value="">Select Type</option>
                  {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* Section 2: Permanent Inputs — Core Status & Clearances */}
          <div>
            <p className="text-[11px] font-bold text-[#2457d6] uppercase tracking-widest mb-3">
              2 · Acquisition Status &amp; Clearances (Permanent)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Field label="Land Acquired (%)" hint="0 – 100%">
                <input type="number" min={0} max={100} className={inputCls} placeholder="e.g. 42"
                  value={form.landAcquiredPercentage ?? ""}
                  onChange={(e) => set("landAcquiredPercentage", parseFloat(e.target.value))} />
              </Field>
              <Field label="Compensation Pending (%)" hint="% uncompensated">
                <input type="number" min={0} max={100} className={inputCls} placeholder="e.g. 62"
                  value={form.compensationPendingPercentage ?? ""}
                  onChange={(e) => set("compensationPendingPercentage", parseFloat(e.target.value))} />
              </Field>
              <Field label="Legal Cases / Court Stays" hint="Active court cases">
                <input type="number" min={0} className={inputCls} placeholder="e.g. 17"
                  value={form.legalDisputes ?? ""}
                  onChange={(e) => set("legalDisputes", parseInt(e.target.value))} />
              </Field>
              <Field label="Environment Clearance" required>
                <select className={selectCls} value={form.environmentClearance ?? ""} onChange={(e) => set("environmentClearance", e.target.value)}>
                  <option value="">Select</option>
                  {CLEARANCE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Forest Clearance" required>
                <select className={selectCls} value={form.forestClearance ?? ""} onChange={(e) => set("forestClearance", e.target.value)}>
                  <option value="">Select</option>
                  {CLEARANCE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* 2 & 3. Highlighted RFCTLARR Section: "RFCTLARR Stage Tracker & Legal Timeline" */}
          <div className="p-5 bg-gradient-to-r from-[#eef3ff] via-[#e6efff] to-[#edf7f6] border-2 border-[#2457d6] rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-extrabold text-[#2457d6] uppercase tracking-wider flex items-center gap-2">
                <Scale size={18} className="text-[#2457d6]" /> 3 · RFCTLARR Stage Tracker &amp; Legal Timeline
              </p>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#2457d6] text-white uppercase tracking-wide">
                Primary Feature
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
              <Field label="Current Acquisition Stage" required hint="Select exact statutory RFCTLARR stage">
                <select
                  className={`${selectCls} border-[#2457d6]/40 font-semibold focus:ring-[#2457d6]`}
                  value={form.currentStage ?? ""}
                  onChange={(e) => set("currentStage", e.target.value as AcquisitionStage)}
                >
                  <option value="">Select Acquisition Stage</option>
                  {STAGES.map((s, idx) => (
                    <option key={s} value={s}>
                      {idx + 1}. {s}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Automatic "Legal Timeline" Info Card directly below/alongside stage selection */}
              {selectedStage && STAGE_LEGAL_TIMELINES[selectedStage] ? (
                <div className="p-4 bg-white border border-[#2457d6]/40 rounded-xl text-[12px] text-[#1e40af] flex items-start gap-3 shadow-2xs animate-in fade-in duration-200">
                  <Scale size={20} className="text-[#2457d6] shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-extrabold text-[#172033] text-[13px]">
                        Current Stage: <span className="text-[#2457d6]">{selectedStage}</span>
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-bold text-[#172033]">Legal Timeline:</span>
                      <span className="text-[11px] font-extrabold text-[#2457d6] bg-[#eef3ff] border border-[#bfdbfe] px-3 py-0.5 rounded-full">
                        {STAGE_LEGAL_TIMELINES[selectedStage].duration}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475569] leading-relaxed mt-1">
                      {STAGE_LEGAL_TIMELINES[selectedStage].description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white/70 border border-dashed border-[#2457d6]/30 rounded-xl text-[11px] text-[#475569] flex items-center justify-center">
                  Select an acquisition stage above to view its statutory RFCTLARR legal timeline limit.
                </div>
              )}
            </div>

            {/* 4. Single "Stage Start Date" Field (Only 1 relevant date field displayed) */}
            {selectedStage && (
              <div className="pt-3 border-t border-[#bfdbfe]/60">
                <div className="max-w-md">
                  <Field
                    label="Stage Start Date"
                    hint={`Enter the start / notification date for ${selectedStage}`}
                  >
                    <div className="relative">
                      <input
                        type="date"
                        className={inputCls}
                        value={stageStartDate}
                        onChange={(e) => setStageStartDate(e.target.value)}
                      />
                    </div>
                  </Field>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Optional Collapsible Advanced Parameters */}
          <div className="border border-[#e6eaf0] rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-3 bg-[#f8fafc] text-left flex items-center justify-between text-[12px] font-bold text-[#172033] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#2457d6]" />
                Additional Project Parameters (Optional)
              </span>
              <span className="text-[11px] text-[#687386] font-normal flex items-center gap-1">
                {showAdvanced ? "Hide Extra Inputs" : "Show Extra Inputs"}
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>

            {showAdvanced && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-[#e6eaf0] animate-in fade-in duration-200">
                <Field label="Total Land Required (ha)" hint="Total hectares">
                  <input type="number" min={0} className={inputCls} placeholder="e.g. 75"
                    value={form.totalLandRequired ?? ""}
                    onChange={(e) => set("totalLandRequired", parseFloat(e.target.value))} />
                </Field>
                <Field label="Pending Approvals" hint="No. of pending clearances">
                  <input type="number" min={0} className={inputCls} placeholder="e.g. 5"
                    value={form.pendingApprovals ?? ""}
                    onChange={(e) => set("pendingApprovals", parseInt(e.target.value))} />
                </Field>
                <Field label="Ownership Disputes" hint="No. of ownership conflicts">
                  <input type="number" min={0} className={inputCls} placeholder="e.g. 4"
                    value={form.ownershipDisputes ?? ""}
                    onChange={(e) => set("ownershipDisputes", parseInt(e.target.value))} />
                </Field>
                <Field label="Affected Families" hint="No. of families affected">
                  <input type="number" min={0} className={inputCls} placeholder="e.g. 65"
                    value={form.affectedFamilies ?? ""}
                    onChange={(e) => set("affectedFamilies", parseInt(e.target.value))} />
                </Field>
                <Field label="Displaced Families" hint="No. of families displaced">
                  <input type="number" min={0} className={inputCls} placeholder="e.g. 20"
                    value={form.displacedFamilies ?? ""}
                    onChange={(e) => set("displacedFamilies", parseInt(e.target.value))} />
                </Field>
                <Field label="R&R Completion (%)" hint="Rehabilitation & Resettlement">
                  <input type="number" min={0} max={100} className={inputCls} placeholder="e.g. 60"
                    value={form.rrCompletionPercentage ?? ""}
                    onChange={(e) => set("rrCompletionPercentage", parseFloat(e.target.value))} />
                </Field>
                <Field label="Previous Delay Record">
                  <select className={selectCls}
                    value={form.previousDelay ? "yes" : "no"}
                    onChange={(e) => set("previousDelay", e.target.value === "yes")}>
                    <option value="no">No Previous Delay</option>
                    <option value="yes">Yes — Previous Delay</option>
                  </select>
                </Field>
              </div>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-700">
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#e6eaf0] bg-[#f8fafc] flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2457d6] text-white text-[13px] font-bold rounded-xl hover:bg-[#173f9f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : "🔍"}
            {loading ? "Processing…" : "Predict Delay Risk"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 text-[13px] font-semibold text-[#687386] hover:text-[#172033] transition-colors cursor-pointer"
          >
            Clear
          </button>
          <p className="ml-auto text-[11px] text-[#687386]">
            RFCTLARR Engine → FastAPI → XGBoost model
          </p>
        </div>
      </form>

      {/* Professional Processing Sequence Modal Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-[#e6eaf0] rounded-2xl shadow-xl p-6 max-w-md w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#eef3ff] text-[#2457d6] flex items-center justify-center mx-auto">
              <Loader2 size={24} className="animate-spin text-[#2457d6]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#172033]">Analyzing Project Timeline</h3>
              <p className="text-[11px] text-[#687386] mt-0.5">
                Evaluating RFCTLARR compliance and running ML predictions…
              </p>
            </div>

            <div className="space-y-2 text-left pt-2 border-t border-[#e6eaf0]">
              {PROCESSING_STEPS.map((step, idx) => {
                const isFinished = idx < activeStep;
                const isCurrent = idx === activeStep;
                return (
                  <div key={step} className="flex items-center gap-3 text-[12px]">
                    {isFinished ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 size={16} className="animate-spin text-[#2457d6] shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                    )}
                    <span
                      className={`font-semibold ${
                        isFinished
                          ? "text-emerald-700"
                          : isCurrent
                          ? "text-[#2457d6] font-bold"
                          : "text-gray-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && <PredictionResult result={result} onReset={handleReset} />}
    </div>
  );
}
