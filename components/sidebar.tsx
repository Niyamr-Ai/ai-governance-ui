"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  Menu,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  FileText,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";

interface SidebarProps {
  onLogout?: () => void;
}

function SectionLabel({ children, collapsed }: { children: string; collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <p className="mb-3 px-2 text-[12px] uppercase tracking-[1.6px] text-[#587096]">
      {children}
    </p>
  );
}

type ItemProps = {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  collapsed: boolean;
};

function SidebarItem({ href, label, icon, active, collapsed }: ItemProps) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center rounded-lg transition-colors ${collapsed ? "h-10 w-10 justify-center" : "h-10 w-full gap-3 px-3"
        } ${active
          ? "bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
          : "text-[#5E6C85] hover:bg-white hover:text-[#0F172A]"
        }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="text-[14px] font-medium">{label}</span>}
      {collapsed && (
        <div className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md bg-[#1E293B] px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {label}
          <div className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-[#1E293B]" />
        </div>
      )}
    </Link>
  );
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string): boolean =>
    pathname === href || (pathname?.startsWith(`${href}/`) ?? false);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`hidden lg:flex lg:flex-col fixed top-0 left-0 h-screen border-r border-[#E5E7EB] bg-[#F7F8FA] py-6 z-20 transition-all duration-300 ease-in-out ${isCollapsed ? "w-[72px] px-3" : "w-[267px] px-4"
        }`}
    >
      {/* Header */}
      <div className={`mb-10 flex items-center ${isCollapsed ? "justify-center" : "justify-between px-2"}`}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <Image
              src="/images/uipro/Frame@3x.png"
              alt="logo"
              width={24}
              height={24}
              className="h-6 w-6 flex-shrink-0"
              priority
            />
            <div className="text-[18px] font-semibold leading-none tracking-[-0.01em]">
              <span className="text-[#0F172A]">Niyam</span>
              <span className="bg-gradient-to-r from-[#5B7FCE] to-[#64C1FF] bg-clip-text text-transparent">
                R
              </span>
              <span className="text-[#0F172A]"> AI</span>
            </div>
          </Link>
        )}
        <div className="group relative">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#334155] transition-colors hover:bg-[#E2E8F0]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className={`pointer-events-none absolute top-full z-50 mt-2 whitespace-nowrap rounded-md bg-[#1E293B] px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 ${isCollapsed ? "left-full ml-2 top-1/2 -translate-y-1/2 mt-0" : "left-1/2 -translate-x-1/2"}`}>
            {isCollapsed ? "Expand menu" : "Collapse menu"}
            <div className={`absolute h-2 w-2 rotate-45 bg-[#1E293B] ${isCollapsed ? "top-1/2 -left-1 -translate-y-1/2" : "-top-1 left-1/2 -translate-x-1/2"}`} />
          </div>
        </div>
      </div>

      {/* Dashboard Link */}
      <div className={`mb-7 ${isCollapsed ? "flex justify-center" : ""}`}>
        <Link
          href="/dashboard"
          className={`group relative flex items-center rounded-xl border transition-colors ${isCollapsed ? "h-10 w-10 justify-center" : "h-12 w-full gap-3 px-4"
            } ${isActive("/dashboard")
              ? "border-[#E2E8F0] bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
              : "border-transparent text-[#475569] hover:border-[#E2E8F0] hover:bg-white"
            }`}
        >
          <LayoutDashboard className="h-[18px] w-[18px] flex-shrink-0" />
          {!isCollapsed && <span className="text-[15px] font-medium">Dashboard</span>}
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md bg-[#1E293B] px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Dashboard
              <div className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-[#1E293B]" />
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className={`space-y-8 flex-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        <section className={isCollapsed ? "w-full flex flex-col items-center" : ""}>
          <SectionLabel collapsed={isCollapsed}>Assessments</SectionLabel>
          <div className={`space-y-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
            <SidebarItem
              href="/discovery"
              label="Discovery"
              icon={<BarChart3 className="h-[18px] w-[18px]" />}
              active={isActive("/discovery")}
              collapsed={isCollapsed}
            />
            <SidebarItem
              href="/red-teaming"
              label="Red Teaming"
              icon={<TrendingUp className="h-[18px] w-[18px]" />}
              active={isActive("/red-teaming")}
              collapsed={isCollapsed}
            />
          </div>
        </section>

        <section className={isCollapsed ? "w-full flex flex-col items-center" : ""}>
          <SectionLabel collapsed={isCollapsed}>Governance</SectionLabel>
          <div className={`space-y-1 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
            <SidebarItem
              href="/documentation"
              label="Documentation"
              icon={<FileText className="h-[18px] w-[18px]" />}
              active={isActive("/documentation")}
              collapsed={isCollapsed}
            />
            <SidebarItem
              href="/policy-tracker"
              label="Policy Tracker"
              icon={<ShieldCheck className="h-[18px] w-[18px]" />}
              active={isActive("/policy-tracker")}
              collapsed={isCollapsed}
            />
          </div>
        </section>
      </div>

      {/* Logout Button */}
      <div className={`mt-4 ${isCollapsed ? "flex justify-center" : ""}`}>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className={`group relative flex items-center rounded-lg text-[#B42318] hover:bg-[#FEE4E2] transition-colors ${isCollapsed ? "h-10 w-10 justify-center" : "h-10 w-full gap-2 px-3"
            }`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-[14px] font-medium">Logout</span>}
          {isCollapsed && (
            <div className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md bg-[#1E293B] px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Logout
              <div className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-[#1E293B]" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
