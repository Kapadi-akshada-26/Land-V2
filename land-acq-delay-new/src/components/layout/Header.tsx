"use client";
// src/components/layout/Header.tsx
// Top header: title/subtitle, notification center popover, Executive Engineer profile

import { useState, useEffect } from "react";
import { Bell, User, CheckCheck, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { getRecentAlerts } from "@/services/alertService";
import type { Alert } from "@/types";

export default function Header() {
  // Notifications Popover State
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [bellOpen, setBellOpen] = useState(false);

  useEffect(() => {
    getRecentAlerts(5).then((data) => {
      setAlerts(data);
    });
  }, []);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <header className="h-16 bg-white border-b border-[#e6eaf0] flex items-center px-6 gap-4 sticky top-0 z-20">
      {/* Brand Title & Subtitle */}
      <div className="hidden lg:block min-w-0">
        <h1 className="text-[15px] font-extrabold text-[#172033] leading-tight truncate">
          PurvaDrishti · Land Acquisition Delay Prediction
        </h1>
        <p className="text-[11px] text-[#687386] truncate font-medium">
          AI-Powered Early Warning &amp; Executive Decision Support System
        </p>
      </div>

      {/* Spacer on mobile */}
      <div className="flex-1 lg:hidden" />

      {/* Right Actions: Notification Bell + Executive Engineer Profile */}
      <div className="flex items-center gap-3 ml-auto relative">
        {/* Notification Bell Icon */}
        <div className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-[#f5f7fb] border border-[#e6eaf0] hover:bg-[#eef3ff] transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell size={16} className="text-[#172033]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e6eaf0] rounded-2xl shadow-2xl py-3 px-4 z-50 animate-in fade-in duration-150 space-y-3">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-2">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-[#2457d6]" />
                  <span className="text-[13px] font-extrabold text-[#172033]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 text-red-600 border border-red-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#2457d6] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {alerts.length > 0 ? (
                  alerts.slice(0, 4).map((alt) => (
                    <div
                      key={alt.id}
                      className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#e6eaf0] hover:bg-[#f1f5f9] transition-colors flex items-start gap-2.5 text-[11px]"
                    >
                      {alt.severity === "Critical" ? (
                        <ShieldAlert size={16} className="text-red-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[#172033] truncate max-w-[170px]">
                            {alt.projectName}
                          </span>
                          <span className="text-[10px] text-[#687386] font-medium">{alt.district}</span>
                        </div>
                        <p className="text-[#475569] leading-tight line-clamp-2">{alt.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-[#687386] text-center py-4">No unread notifications.</p>
                )}
              </div>

              <div className="pt-2 border-t border-[#f1f5f9] text-center">
                <Link
                  href="/alerts"
                  onClick={() => setBellOpen(false)}
                  className="text-[11px] font-extrabold text-[#2457d6] hover:underline inline-block"
                >
                  View All Risk Alerts →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Executive Engineer Profile */}
        <div className="flex items-center gap-2 bg-[#f5f7fb] border border-[#e6eaf0] rounded-xl px-3 py-1.5 cursor-default">
          <div className="w-6 h-6 rounded-full bg-[#2457d6] flex items-center justify-center text-white">
            <User size={12} />
          </div>
          <div className="hidden md:block">
            <p className="text-[11px] font-extrabold text-[#172033] leading-tight">Executive Engineer</p>
            <p className="text-[10px] text-[#687386] leading-tight">Nodal Officer</p>
          </div>
        </div>
      </div>
    </header>
  );
}


