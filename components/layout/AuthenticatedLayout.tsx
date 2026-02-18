"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";
import { Loader2, Menu, X, LayoutDashboard, Layers, FileText, ShieldCheck, TestTube } from "lucide-react";

interface AuthenticatedLayoutProps {
  children: ReactNode;
  showLoading?: boolean;
}

export default function AuthenticatedLayout({ 
  children, 
  showLoading = false 
}: AuthenticatedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items matching the sidebar
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Discovery", icon: Layers, href: "/discovery" },
    { label: "Documentation", icon: FileText, href: "/documentation" },
    { label: "Policy Tracker", icon: ShieldCheck, href: "/policy-tracker" },
    { label: "Red Teaming", icon: TestTube, href: "/red-teaming" },
  ];

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const checkAuth = async () => {
      const sessionRes = await supabase.auth.getSession();
      const session = sessionRes.data.session;

      if (!session) {
        router.push("/sign-in");
        return;
      }

      setIsLoggedIn(true);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          router.push("/sign-in");
          return;
        }
        setIsLoggedIn(!!session);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Show loading skeleton (always render Sidebar to prevent layout shift)
  if (isLoading || showLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar onLogout={handleLogout} />
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-panel shadow-soft border-b border-border/30">
          <div className="flex items-center justify-between px-6 h-16">
            <span className="text-xl font-bold text-foreground">
              Niyam<span className="gradient-text">R</span>
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="lg:hidden fixed top-16 left-0 right-0 bottom-0 z-50 bg-background border-t border-border/30 overflow-y-auto">
              <div className="px-6 py-6">
                <div className="flex flex-col gap-1">
                  {navItems.map(({ label, icon: Icon, href }) => {
                    const isActive = pathname === href || pathname?.startsWith(href + "/");
                    return (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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
                  <div className="pt-4 mt-4 border-t border-border/30">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all w-full text-left"
                    >
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        <div className="container mx-auto max-w-7xl py-8 px-4 lg:pl-72 pt-16 lg:pt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar onLogout={handleLogout} />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-panel shadow-soft border-b border-border/30">
        <div className="flex items-center justify-between px-6 h-16">
          <span className="text-xl font-bold text-foreground">
            Niyam<span className="gradient-text">R</span>
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Dark Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="lg:hidden fixed top-16 left-0 right-0 bottom-0 z-50 bg-background border-t border-border/30 overflow-y-auto">
            <div className="px-6 py-6">
              <div className="flex flex-col gap-1">
                {navItems.map(({ label, icon: Icon, href }) => {
                  const isActive = pathname === href || pathname?.startsWith(href + "/");
                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
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
                <div className="pt-4 mt-4 border-t border-border/30">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all w-full text-left"
                  >
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="p-6 lg:p-8 lg:pl-72 pt-16 lg:pt-24">
        {children}
      </div>
    </div>
  );
}
