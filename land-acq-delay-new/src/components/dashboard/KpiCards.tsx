// src/components/dashboard/KpiCards.tsx
// Executive Dashboard KPIs - Total Projects, Critical Risk, Medium Risk, On Track, Avg Delay Probability

import { TrendingUp, TrendingDown, AlertCircle, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import DemoDataBadge from "@/components/ui/DemoDataBadge";
import type { DashboardStats } from "@/types";

interface CardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  trend?: React.ReactNode;
  accent?: string;
  bg?: string;
}

function KpiCard({ label, value, sub, icon, trend, accent, bg }: CardProps) {
  return (
    <div className={`border rounded-2xl p-5 shadow-sm flex flex-col gap-3 transition-shadow hover:shadow-md ${bg || "bg-white border-[#e6eaf0]"}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#687386]">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-[#f5f7fb] flex items-center justify-center text-[#687386]">
          {icon}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-1">
          <p className={`text-3xl font-extrabold leading-none ${accent ?? "text-[#172033]"}`}>
            {value}
          </p>
          {trend}
        </div>
        <p className="text-[12px] text-[#687386] mt-1.5">{sub}</p>
      </div>
    </div>
  );
}

export default function KpiCards({ stats }: { stats: DashboardStats }) {
  const critical = stats.criticalHighRisk ?? Math.round(stats.totalProjects * 0.25);
  const medium = stats.mediumRisk ?? Math.round(stats.totalProjects * 0.35);
  const onTrack = stats.onTrack ?? Math.round(stats.totalProjects * 0.40);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-extrabold text-[#172033] uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} className="text-[#2457d6]" /> Portfolio Executive KPIs
          </h2>
          <p className="text-[11px] text-[#687386]">Real-time land acquisition risk breakdown across active projects</p>
        </div>
        <DemoDataBadge />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Total Projects */}
        <KpiCard
          label="Total Projects"
          value={stats.totalProjects.toLocaleString()}
          sub="Across all states &amp; districts"
          icon={<Activity size={16} className="text-[#2457d6]" />}
          trend={<span className="text-[11px] text-[#2457d6] font-bold flex items-center gap-0.5"><TrendingUp size={12} /> Active</span>}
        />

        {/* 2. Critical Risk */}
        <KpiCard
          label="Critical Risk"
          value={critical.toLocaleString()}
          sub="Immediate intervention required"
          icon={<AlertCircle size={16} className="text-red-600" />}
          accent="text-red-600"
          bg="bg-red-50/30 border-red-200"
          trend={<span className="text-[11px] text-red-600 font-bold flex items-center gap-0.5"><TrendingUp size={12} /> High</span>}
        />

        {/* 3. Medium Risk */}
        <KpiCard
          label="Medium Risk"
          value={medium.toLocaleString()}
          sub="Close monitoring needed"
          icon={<AlertTriangle size={16} className="text-amber-600" />}
          accent="text-amber-600"
          bg="bg-amber-50/30 border-amber-200"
          trend={<span className="text-[11px] text-amber-600 font-bold flex items-center gap-0.5"><TrendingUp size={12} /> Watch</span>}
        />

        {/* 4. On Track */}
        <KpiCard
          label="On Track"
          value={onTrack.toLocaleString()}
          sub="Proceeding as scheduled"
          icon={<CheckCircle2 size={16} className="text-emerald-600" />}
          accent="text-emerald-600"
          bg="bg-emerald-50/30 border-emerald-200"
          trend={<span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5"><TrendingDown size={12} /> Normal</span>}
        />

        {/* 5. Avg Delay Probability */}
        <KpiCard
          label="Avg Delay Probability"
          value={`${stats.avgDelayProbability.toFixed(1)}%`}
          sub="Portfolio ML risk average"
          icon={<TrendingUp size={16} className="text-[#2457d6]" />}
          accent="text-[#2457d6]"
          trend={<span className="text-[11px] text-[#2457d6] font-bold flex items-center gap-0.5"><TrendingUp size={12} /> ML Score</span>}
        />
      </div>
    </div>
  );
}

