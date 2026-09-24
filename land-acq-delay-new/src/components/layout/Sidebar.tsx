"use client";
// src/components/layout/Sidebar.tsx
// Dark navy sidebar: fixed on desktop, collapsible on tablet, drawer on mobile.
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BrainCircuit,
  FolderOpen,
  Bell,
  Map,
  BarChart2,
  FileText,
  Info,
  Settings,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/predict", label: "Predict Delay", icon: BrainCircuit },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/alerts", label: "Risk Alerts", icon: Bell },
  { href: "/gis-map", label: "GIS Risk Map", icon: Map },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/reports", label: "Reports", icon: FileText },
  // { href: "/about",      label: "About / Technology",  icon: Info },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings },
];

interface NavLinkProps {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
  onClick?: () => void;
}

function NavLink({ href, label, Icon, active, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-[#08524b] text-white font-semibold shadow-xs"
          : "text-[#b4d4ce] hover:bg-[#074741] hover:text-white"
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

interface SidebarContentProps {
  pathname: string;
  onClose?: () => void;
}

function SidebarContent({ pathname, onClose }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#094d46]">
        <Image
          src="/nlogo.jpg.png"
          alt="Logo"
          width={36}
          height={36}
          className="w-10 h-10 rounded-full object-cover shrink-0 shadow-md"
        />

        <div>
          <p className="text-white font-bold text-[14px] leading-tight">PurvaDrishti</p>
          <p className="text-[#7ea8a1] text-[10px] uppercase tracking-wider mt-0.5 font-medium">
            यथा दृष्टिः तथा सृष्टिः
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-[#7ea8a1] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7ea8a1] px-3 mb-2">
          Navigation
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            active={pathname === href || pathname.startsWith(href + "/")}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-[#094d46] pt-3 space-y-0.5">
        {BOTTOM_ITEMS.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            active={pathname === href}
            onClick={onClose}
          />
        ))}
        <div className="px-3 pt-3">
          <p className="text-[10px] text-[#7ea8a1] leading-relaxed">

          </p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex flex-col w-[250px] shrink-0 bg-[#02332f] fixed inset-y-0 left-0 z-30">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Tablet/Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-9 h-9 bg-[#02332f] rounded-lg flex items-center justify-center text-white shadow-lg"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[260px] bg-[#02332f] h-full shadow-2xl">
            <SidebarContent
              pathname={pathname}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  );
}
