"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(
      "Password reset link sent. Please check your email."
    );
    setLoading(false);
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm bg-card border border-border rounded-xl p-6 shadow-soft"
      >
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Reset Password
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Remembered your password?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-6">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600">{success}</p>
        )}

        <Button
          type="submit"
          className="mt-4"
          disabled={loading}
        >
          {loading ? "Sending link..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}