"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Layers,
  FileText,
  ShieldCheck,
  Lock,
  ArrowRight,
  Settings,
  TestTube,
  type LucideIcon,
} from "lucide-react";

interface SidebarItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Discovery", icon: Layers, href: "/discovery" },
  { label: "Documentation", icon: FileText, href: "/documentation" },
  { label: "Policy Tracker", icon: ShieldCheck, href: "/policy-tracker" },
  { label: "Red Teaming", icon: TestTube, href: "/red-teaming" },
];

interface SidebarProps {
  onLogout?: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 w-64 h-screen overflow-y-auto glass-panel shadow-elevated border-r border-border/50 z-20">
      {/* Logo */}
      <div className="p-6 border-b border-border/30">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Image
              src="/images/logo.png"
              alt="NiyamR"
              className="rounded-lg transition-transform duration-300 group-hover:scale-105"
              width={32}
              height={32}
              priority
            />
          </div>
          <span className="text-lg font-bold text-foreground">
            Niyam<span className="gradient-text">R</span>
          </span>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-4 px-3 space-y-1">
        {sidebarItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={label}
              href={href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-border/30 p-4 space-y-1">
        <button className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50">
          <Settings className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">Settings</span>
        </button>
        {onLogout && (
          <button
            onClick={onLogout}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left w-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 cursor-pointer"
          >
            <ArrowRight className="h-5 w-5 flex-shrink-0 rotate-180" />
            <span className="text-sm">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}

