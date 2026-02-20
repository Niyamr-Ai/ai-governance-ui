"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutGrid,
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

function SectionLabel({ children }: { children: string }) {
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
};

function SidebarItem({ href, label, icon, active }: ItemProps) {
  return (
    <Link
      href={href}
      className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] font-medium transition-colors ${
        active
          ? "bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
          : "text-[#5E6C85] hover:bg-white hover:text-[#0F172A]"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <aside className="hidden lg:flex lg:flex-col fixed top-0 left-0 w-[267px] h-screen border-r border-[#E5E7EB] bg-[#F7F8FA] px-4 py-6 z-20">
      <div className="mb-10 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <Image
            src="/images/uipro/Frame@3x.png"
            alt="logo"
            width={24}
            height={24}
            className="h-6 w-6"
            priority
          />
          <div className="text-[18px] font-semibold leading-none tracking-[-0.01em]">
            <span className="text-[#0F172A]">Niyam</span>
            <span className="bg-gradient-to-r from-[#5B7FCE] to-[#64C1FF] bg-clip-text text-transparent">
              R
            </span>
            <span className="text-[#0F172A]"> AI</span>
          </div>
        </div>
        <LayoutGrid className="h-4 w-4 text-[#334155]" />
      </div>

      <div className="mb-7">
        <Link
          href="/dashboard"
          className={`flex h-12 w-full items-center gap-3 rounded-xl border px-4 text-left text-[15px] font-medium transition-colors ${
            isActive("/dashboard")
              ? "border-[#E2E8F0] bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
              : "border-transparent text-[#475569] hover:border-[#E2E8F0] hover:bg-white"
          }`}
        >
          <LayoutDashboard className="h-[18px] w-[18px]" />
          Dashboard
        </Link>
      </div>

      <div className="space-y-8 flex-1">
        <section>
          <SectionLabel>Assessments</SectionLabel>
          <div className="space-y-1">
            <SidebarItem
              href="/discovery"
              label="Discovery"
              icon={<BarChart3 className="h-[18px] w-[18px]" />}
              active={isActive("/discovery")}
            />
            <SidebarItem
              href="/red-teaming"
              label="Red Teaming"
              icon={<TrendingUp className="h-[18px] w-[18px]" />}
              active={isActive("/red-teaming")}
            />
          </div>
        </section>

        <section>
          <SectionLabel>Governance</SectionLabel>
          <div className="space-y-1">
            <SidebarItem
              href="/documentation"
              label="Documentation"
              icon={<FileText className="h-[18px] w-[18px]" />}
              active={isActive("/documentation")}
            />
            <SidebarItem
              href="/policy-tracker"
              label="Policy Tracker"
              icon={<ShieldCheck className="h-[18px] w-[18px]" />}
              active={isActive("/policy-tracker")}
            />
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={() => void handleLogout()}
        className="mt-4 flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-[14px] font-medium text-[#B42318] hover:bg-[#FEE4E2]"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
