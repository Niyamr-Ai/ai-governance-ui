"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { supabase } from "@/utils/supabase/client";

export default function HeaderAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <Badge
          variant="default"
          className="font-normal pointer-events-none text-xs"
        >
          Please update .env.local with anon key & url
        </Badge>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-300">Loading...</span>
      </div>
    );
  }

  return user ? (
    <div className="flex items-center gap-4 text-sm">
      <span className="text-slate-300">Hey, {user.email}</span>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button 
        asChild 
        size="sm" 
        variant="outline"
        className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
      >
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default" className="bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/50">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
