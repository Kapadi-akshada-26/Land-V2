// src/components/dashboard/KpiCards.tsx
import { TrendingUp, AlertTriangle, AlertCircle, CheckCircle2, Activity, Scale, Bell } from "lucide-react";
import DemoDataBadge from "@/components/ui/DemoDataBadge";
import type { DashboardStats } from "@/types";

interface CardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent?: string;
  bg?: string;
}

function KpiCard({ label, value, sub, icon, accent, bg }: CardProps) {
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
        <p className={`text-3xl font-extrabold leading-none ${accent ?? "text-[#172033]"}`}>
          {value}
        </p>
        <p className="text-[12px] text-[#687386] mt-1.5">{sub}</p>
      </div>
    </div>
  );
}

export default function KpiCards({ stats }: { stats: DashboardStats }) {
  const beyondAct = stats.projectsBeyondAct ?? Math.round(stats.criticalHighRisk * 0.85);
  const criticalAlerts = stats.criticalAlerts ?? Math.round(stats.totalProjects * 0.08);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-extrabold text-[#172033] uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} className="text-[#2457d6]" /> Portfolio Dashboard KPIs
          </h2>
          <p className="text-[11px] text-[#687386]">Real-time land acquisition risk &amp; statutory compliance metrics</p>
        </div>
        <DemoDataBadge />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* 1. Total Projects */}
        <KpiCard
          label="Total Projects"
          value={stats.totalProjects.toLocaleString()}
          sub="Across all states &amp; sectors"
          icon={<Activity size={16} className="text-[#2457d6]" />}
        />

        {/* 2. High-Risk Projects */}
        <KpiCard
          label="High-Risk Projects"
          value={stats.criticalHighRisk.toLocaleString()}
          sub="Require priority mitigation"
          icon={<AlertCircle size={16} className="text-red-600" />}
          accent="text-red-600"
          bg="bg-red-50/30 border-red-200"
        />

        {/* 3. Projects Beyond Act */}
        <KpiCard
          label="Projects Beyond Act"
          value={beyondAct.toLocaleString()}
          sub="RFCTLARR statutory limit exceeded"
          icon={<Scale size={16} className="text-amber-600" />}
          accent="text-amber-700"
          bg="bg-amber-50/40 border-amber-200"
        />

        {/* 4. Critical Alerts */}
        <KpiCard
          label="Critical Alerts"
          value={criticalAlerts.toLocaleString()}
          sub="Immediate action required"
          icon={<Bell size={16} className="text-orange-600" />}
          accent="text-orange-600"
          bg="bg-orange-50/30 border-orange-200"
        />

        {/* 5. Avg Delay Probability */}
        <KpiCard
          label="Avg Delay Probability"
          value={`${stats.avgDelayProbability.toFixed(1)}%`}
          sub="Portfolio-wide ML risk average"
          icon={<TrendingUp size={16} className="text-[#2457d6]" />}
          accent="text-[#2457d6]"
        />
      </div>
    </div>
  );
}
