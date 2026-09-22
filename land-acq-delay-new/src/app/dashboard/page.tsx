// src/app/dashboard/page.tsx
// Dashboard page — server component; fetches all data, renders client charts

import SmartAlertBanner from "@/components/dashboard/SmartAlertBanner";
import KpiCards from "@/components/dashboard/KpiCards";
import ProjectsNeedingAttention from "@/components/dashboard/ProjectsNeedingAttention";
import TopDelayDrivers from "@/components/dashboard/TopDelayDrivers";
import RiskDistributionChart from "@/components/dashboard/RiskDistributionChart";
import StateTrendChart from "@/components/dashboard/StateTrendChart";
import RecentAlerts from "@/components/dashboard/RecentAlerts";

import { getDashboardStats, getDelayDrivers, getRiskDistribution, getStateTrends, getDistrictTrends } from "@/services/analyticsService";
import { getTopRiskyProjects } from "@/services/projectService";
import { getRecentAlerts } from "@/services/alertService";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, drivers, riskDist, stateTrends, districtTrends, topProjects, recentAlerts] =
    await Promise.all([
      getDashboardStats(),
      getDelayDrivers(),
      getRiskDistribution(),
      getStateTrends(),
      getDistrictTrends(),
      getTopRiskyProjects(5),
      getRecentAlerts(5),
    ]);

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Page title */}
      <div>
        <h1 className="text-[22px] font-extrabold text-[#172033] leading-tight">
          Predictive Analytics Dashboard
        </h1>
        <p className="text-[13px] text-[#687386] mt-1">
          Early detection of land acquisition delays across infrastructure projects
        </p>
      </div>

      {/* AI Priority Alert Banner */}
      <SmartAlertBanner />

      {/* Row 1 — KPI Cards */}
      <KpiCards stats={stats} />

      {/* Row 2 — Map placeholder + Projects Needing Attention */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* GIS Map placeholder */}
        <div className="bg-white border border-[#e6eaf0] rounded-2xl p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[14px] font-bold text-[#172033]">GIS Risk Map</h3>
              <p className="text-[11px] text-[#687386] mt-0.5">
                Project locations by risk level
              </p>
            </div>
            <a
              href="/gis-map"
              className="text-[11px] font-semibold text-[#2457d6] hover:underline"
            >
              Full map →
            </a>
          </div>
          {/* Decorative map placeholder that matches existing demo style */}
          <div
            className="flex-1 min-h-[260px] rounded-xl overflow-hidden relative"
            style={{
              background:
                "linear-gradient(135deg, #e8f1e6, #d9e8f4)",
            }}
          >
            {/* India outline hint */}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[#687386] text-[13px] font-medium text-center px-8">
                🗺️ Interactive Leaflet map available on the{" "}
                <a href="/gis-map" className="text-[#2457d6] underline">
                  GIS Risk Map
                </a>{" "}
                page
              </p>
            </div>
            {/* Sample markers */}
            <div className="absolute top-[30%] left-[52%] w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md" title="Critical risk project" />
            <div className="absolute top-[48%] left-[46%] w-3.5 h-3.5 rounded-full bg-orange-400 border-2 border-white shadow-md" title="High risk project" />
            <div className="absolute top-[55%] left-[60%] w-3.5 h-3.5 rounded-full bg-orange-400 border-2 border-white shadow-md" title="High risk project" />
            <div className="absolute top-[40%] left-[55%] w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-md" title="Medium risk project" />
            <div className="absolute top-[62%] left-[50%] w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-md" title="Low risk project" />
            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-[10px] flex gap-3 border border-[#e6eaf0]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical/High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Low</span>
            </div>
          </div>
        </div>

        {/* Projects needing attention */}
        <ProjectsNeedingAttention projects={topProjects} />
      </div>

      {/* Row 3 — Delay Drivers + Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <TopDelayDrivers drivers={drivers} />
        </div>
        <div className="lg:col-span-2">
          <RiskDistributionChart data={riskDist} />
        </div>
      </div>

      {/* Row 4 — State / District Trend */}
      <StateTrendChart stateTrends={stateTrends} districtTrends={districtTrends} />

      {/* Row 5 — Recent Alerts */}
      <RecentAlerts alerts={recentAlerts} />
    </div>
  );
}
