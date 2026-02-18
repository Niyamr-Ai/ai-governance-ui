"use client";
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase/client";


export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      const { data: { user } } = await supabase.auth.getUser();
      const loggedIn = !!user;
      setIsLoggedIn(loggedIn);
      setIsLoading(false);

      // Only redirect on initial load if user is logged in AND on the landing page
      // Don't redirect if already on an authenticated page
      if (loggedIn && pathname === '/') {
        router.push("/dashboard");
        return;
      }

      // Listen for auth state changes - only update state, don't redirect
      // Redirects should only happen on initial page load, not on auth state changes
      // This prevents unwanted redirects when switching tabs
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        const isLoggedIn = !!session?.user;
        setIsLoggedIn(isLoggedIn);
        // Do NOT redirect here - only update state
        // Redirects should only happen on initial page load
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    checkAuth();
  }, [router, pathname]);

  // Show loading state while checking auth or redirecting
  if (isLoading || isLoggedIn) {
    return (
      <main className="relative bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </main>
    );
  }

  const navLinks = [
    { href: '#platform', label: 'Platform' },
    { href: '#solutions', label: 'Solutions' },
    { href: '#use-cases', label: 'Use Cases' },
    { href: '#company', label: 'Company' },
  ];

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${isScrolled ? 'glass-panel shadow-soft' : 'bg-transparent'}
    `}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Image
                src="/images/logo.png"
                alt="NiyamR Flow"
                className="rounded-xl transition-transform duration-300 group-hover:scale-105"
                width={100}
                height={100}
                priority
              />
            </div>
            <span className="text-xl font-bold text-foreground">
              Niyam<span className="gradient-text">R</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button variant="hero" size="sm" className="text-sm px-6 h-9 rounded-xl" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Dark Overlay */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <div className="md:hidden fixed top-16 left-0 right-0 bottom-0 z-50 bg-background border-t border-border/30 overflow-y-auto">
              <div className="container mx-auto px-6 py-6">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="flex flex-col gap-2 pt-4 border-t border-border/30">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button variant="hero" size="sm" className="w-full rounded-xl" asChild>
                      <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

