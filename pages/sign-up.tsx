"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignUp() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(
      "Account created! Please check your email to verify your account."
    );
    setLoading(false);
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-6">
      <Card className="w-full max-w-md glass-panel shadow-elevated border-border/50 animate-fade-in-up">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-3xl font-bold text-foreground">
            Sign up
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign in
            </Link>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            {success && (
              <p className="text-sm text-green-600">{success}</p>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-glow hover:shadow-glow-accent hover:scale-105 transition-all duration-300 rounded-xl"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
