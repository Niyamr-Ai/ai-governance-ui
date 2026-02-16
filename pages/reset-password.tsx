"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { AlertCircle, Loader2, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Handle code exchange and check for errors
    const handleAuthFlow = async () => {
      if (typeof window === 'undefined') return;
      
      // Read URL parameters directly from the browser URL (more reliable)
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Get error parameters from both query string and hash
      const error = urlParams.get('error') || hashParams.get('error');
      const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
      const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
      const code = urlParams.get('code') || hashParams.get('code');
      
      // Check for error parameters first
      if (error || errorDescription) {
        let errorMessage = "The password reset link is invalid or has expired.";
        
        if (errorDescription) {
          errorMessage = decodeURIComponent(errorDescription);
        } else if (errorCode === 'otp_expired') {
          errorMessage = "The password reset link has expired. Please request a new one.";
        } else if (error === 'access_denied') {
          errorMessage = "Access denied. The password reset link is invalid or has expired.";
        }
        
        setLinkError(errorMessage);
        return;
      }
      
      // If there's a code parameter, Supabase should auto-exchange it (detectSessionInUrl: true)
      // Wait a moment for the exchange to complete, then check session
      if (code) {
        setLoading(true);
        // Wait for Supabase to exchange the code (detectSessionInUrl handles this)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setLinkError("Failed to verify the reset link. Please request a new password reset link.");
          setLoading(false);
          return;
        }
        
        // Code exchanged successfully, clear the code from URL
        window.history.replaceState({}, '', '/reset-password');
        setLoading(false);
        return;
      }
      
      // No code, check if we have a valid session for password reset
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLinkError("No active session found. Please use the password reset link from your email.");
      }
    };

    handleAuthFlow();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    // Update password using Supabase
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message || "Failed to update password. The link may have expired.");
      setLoading(false);
      return;
    }

    setSuccess("New password created successfully!");
    setLoading(false);
    
    // Redirect to sign in after 3 seconds
    setTimeout(() => {
      router.push("/sign-in");
    }, 3000);
  };

  const handleRequestNewLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setLinkError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess("A new password reset link has been sent to your email. Please check your inbox.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-50 via-blue-100/50 to-white">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold text-foreground">
            Reset Password
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        {/* Link Error Alert */}
        {linkError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {linkError}
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Request a new password reset link:</p>
                <form onSubmit={handleRequestNewLink} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Link"}
                  </Button>
                </form>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Password Reset Form - Only show if no link error */}
        {!linkError && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 rounded-xl"
                  minLength={6}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 rounded-xl"
                  minLength={6}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-glow hover:shadow-glow-accent transition-all duration-300 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
