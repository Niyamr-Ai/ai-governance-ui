"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Layers,
  FileText,
  ShieldCheck,
  Settings,
  TestTube,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

// Helper function to get user display name
function getUserDisplayName(user: any): string {
  if (!user) return "User";
  
  // Try user_metadata first
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (fullName) return fullName;
  
  // Fallback to email (extract name part before @)
  if (user.email) {
    const emailName = user.email.split("@")[0];
    // Capitalize first letter
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  }
  
  return "User";
}

// Helper function to get user initials for avatar
function getUserInitials(user: any): string {
  if (!user) return "U";
  
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (fullName) {
    const names = fullName.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return fullName[0].toUpperCase();
  }
  
  if (user.email) {
    return user.email[0].toUpperCase();
  }
  
  return "U";
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

      {/* User Profile Section */}
      {!isLoading && user && (
        <div className="px-4 py-3 border-b border-border/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all text-left hover:bg-secondary/50 group">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Hi, {getUserDisplayName(user)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Settings className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-56 bg-white dark:bg-slate-900 border border-border/50 shadow-lg backdrop-blur-sm"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-foreground">{getUserDisplayName(user)}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer text-foreground">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              {onLogout && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

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

    </aside>
  );
}

