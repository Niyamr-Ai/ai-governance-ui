"use client";

import { useState } from "react";
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

    // Use localhost for local development, fallback to window.location.origin
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectUrl = `${siteUrl}/reset-password`;
    
    console.log('🔗 Password reset redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      // Provide user-friendly error messages
      let errorMessage = error.message;
      
      if (error.message.toLowerCase().includes('rate limit')) {
        errorMessage = "Too many password reset requests. Please wait a few minutes before trying again. If you already received an email, please check your inbox and use that link.";
      } else if (error.message.toLowerCase().includes('email')) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLoading(false);
      return;
    }

    setSuccess(
      "Password reset link sent! Please check your email and click the link to reset your password. You can close this tab."
    );
    setLoading(false);
    // Clear the form after success
    setEmail("");
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
            Enter your email address and we'll send you a password reset link.
          </p>
        </div>

        {!success && (
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
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
            <Button
              type="button"
              onClick={() => window.location.href = "/sign-in"}
              className="w-full"
              variant="default"
            >
              Go to Sign In
            </Button>
          </div>
        ) : (
          <>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button
              type="submit"
              className="mt-4 w-full"
              disabled={loading}
            >
              {loading ? "Sending link..." : "Reset Password"}
            </Button>
          </>
        )}
      </form>
    </div>
  );
}