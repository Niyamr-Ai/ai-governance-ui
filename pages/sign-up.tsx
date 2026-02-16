"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Loader2, Eye, EyeOff, Shield, Users, Lock, ArrowRight, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react";

export default function SignUp() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate required fields
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required");
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Strategy: Try to sign up and check the response carefully
    // Supabase behavior when email confirmation is enabled:
    // - New user: Returns { data: { user: {...}, session: null }, error: null }
    // - Existing user: Returns { data: { user: null, session: null }, error: null } (for security)
    // 
    // However, sometimes Supabase might return the existing user object.
    // We need to check multiple indicators to detect existing accounts.
    
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const signupStartTime = Date.now();
    
    console.log('[Sign-up] Attempting signup for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback?redirect_to=/dashboard`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          name: fullName, // Also set 'name' field which Supabase uses for display name
        },
      },
    });
    
    console.log('[Sign-up] Supabase response:', {
      hasError: !!error,
      errorMessage: error?.message,
      hasUser: !!data?.user,
      userId: data?.user?.id,
      userCreatedAt: data?.user?.created_at,
      emailConfirmed: !!data?.user?.email_confirmed_at
    });

    // Check for explicit errors first
    if (error) {
      const errorMessage = error.message.toLowerCase();
      
      if (
        errorMessage.includes('user already registered') ||
        errorMessage.includes('email already registered') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('already been registered') ||
        errorMessage.includes('duplicate') ||
        errorMessage.includes('email address is already') ||
        errorMessage.includes('email already in use') ||
        error.code === 'signup_disabled'
      ) {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (errorMessage.includes('rate limit')) {
        setError("Too many sign-up attempts. Please wait a few minutes before trying again.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    // CRITICAL CHECK 1: If data.user is null, account already exists
    // This is the primary indicator when email confirmation is enabled
    if (!data || !data.user) {
      setError("An account with this email already exists. Please sign in instead.");
      setLoading(false);
      return;
    }

    // CRITICAL CHECK 2: Verify the user was just created
    // When Supabase returns an existing user, the created_at will be from when it was originally created
    // New signups should have a created_at timestamp very close to now (within 2 seconds)
    const signupEndTime = Date.now();
    const userCreatedAt = data.user.created_at ? new Date(data.user.created_at).getTime() : 0;
    
    // Calculate absolute time difference (handle negative values from clock skew)
    const timeDiff = Math.abs(signupEndTime - userCreatedAt);
    
    console.log('[Sign-up] Checking user creation time:', {
      userId: data.user.id,
      createdAt: data.user.created_at,
      createdAtTimestamp: userCreatedAt,
      signupEndTime,
      timeDiffMs: signupEndTime - userCreatedAt, // Show raw diff for debugging
      timeDiffMsAbs: timeDiff,
      timeDiffSeconds: Math.floor(timeDiff / 1000),
      emailConfirmed: !!data.user.email_confirmed_at,
      emailConfirmedAt: data.user.email_confirmed_at
    });
    
    // CRITICAL: If user was created more than 3 seconds before OR after signup, it's an existing account
    // (New accounts should be created within 1-2 seconds of the signup call)
    // Negative timeDiff means user was "created" after signup ended (impossible for new accounts)
    const rawTimeDiff = signupEndTime - userCreatedAt;
    // Lower threshold to catch even small negative values (like -399ms) which indicate existing account
    if (rawTimeDiff < -100 || timeDiff > 3000) {
      console.log('[Sign-up] ❌ User creation time mismatch:', {
        rawTimeDiff,
        timeDiff,
        reason: rawTimeDiff < -100 ? 'User created after signup (impossible - existing account)' : 'User created too long ago (existing account)'
      });
      setError("An account with this email already exists. Please sign in instead.");
      setLoading(false);
      return;
    }
    
    // CRITICAL CHECK 3: If user is already confirmed, it's definitely an existing account
    // (New signups won't be confirmed immediately - they need to click email link)
    if (data.user.email_confirmed_at) {
      const confirmedAt = new Date(data.user.email_confirmed_at).getTime();
      const confirmedTimeDiff = signupEndTime - confirmedAt;
      
      console.log('[Sign-up] User email confirmation check:', {
        confirmedAt,
        confirmedTimeDiffMs: confirmedTimeDiff,
        confirmedTimeDiffSeconds: Math.floor(Math.abs(confirmedTimeDiff) / 1000)
      });
      
      // If email was confirmed (and it's not a brand new account), it's existing
      // Allow 2 seconds for edge cases where confirmation happens instantly
      if (Math.abs(confirmedTimeDiff) > 2000) {
        console.log('[Sign-up] ❌ User already confirmed:', confirmedTimeDiff, 'ms difference - EXISTING ACCOUNT');
        setError("An account with this email already exists. Please sign in instead.");
        setLoading(false);
        return;
      }
    }
    
    // Additional check: If user metadata doesn't match what we're trying to set, it might be existing
    // But this is less reliable, so we'll use it as a secondary check
    const userMetadata = data.user.user_metadata || {};
    if (userMetadata.first_name && userMetadata.first_name !== firstName.trim()) {
      console.log('[Sign-up] ⚠️ User metadata mismatch - might be existing account');
      // Don't fail on this alone, but log it
    }
    
    console.log('[Sign-up] ✅ New account created successfully');

    // Success! Account created
    setSuccess("Account created successfully! Please check your email (including spam folder) to verify your account. Click the confirmation link to complete signup.");
    setLoading(false);
    
    // Clear form
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    setResendLoading(true);
    setError(null);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback?redirect_to=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setResendLoading(false);
      return;
    }

    setSuccess("Confirmation email sent! Please check your inbox (including spam folder) and click the link to verify your account.");
    setResendLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-blue-100/50 to-white p-12 flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="flex items-center justify-center">
              <img src="/images/logo.png" alt="NiyamR" className="w-32 h-32" />
              <div className="text-gray-600 text-lg font-semibold tracking-tight justify-end">AI Governance Platform</div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">
            Govern AI with{" "}
            <br />
            <span className="text-primary">Confidence</span>
          </h1>

          {/* Description */}
          <p className="text-muted-foreground text-base mb-10 max-w-md">
            The unified AI Governance OS for enterprise safety, compliance, trust, and observability.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-3 mb-16">
            <div className="glass rounded-2xl p-4 float shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Security Status</p>
                  <p className="text-sm font-semibold text-foreground">Protected</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 float-delayed shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI Agents</p>
                  <p className="text-sm font-semibold text-foreground">127 Active</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4 float-slow shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Compliance</p>
                  <p className="text-sm font-semibold text-foreground">100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold gradient-text">500+</p>
            <p className="text-sm text-muted-foreground mt-1">AI Agents Secured</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold gradient-text">99.9%</p>
            <p className="text-sm text-muted-foreground mt-1">Uptime SLA</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold gradient-text">SOC2</p>
            <p className="text-sm text-muted-foreground mt-1">Certified</p>
          </div>
        </div>
      </div>

      {/* Right Section - Sign-up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md space-y-6">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Welcome Message */}
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold text-foreground">
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign up to get started with AI governance.
            </p>
          </div>

          {/* Social Sign-up Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border border-border hover:bg-muted/50 justify-start"
              onClick={handleGoogleSignUp}
              disabled={loading || googleLoading}
            >
              {googleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Google
            </Button>
          </div>

          {/* Separator */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-xl"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-xl"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
                required
                disabled={loading || googleLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
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
                  disabled={loading || googleLoading}
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
                  disabled={loading || googleLoading}
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

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                  <div className="mt-3">
                    <Button
                      type="button"
                      onClick={handleResendConfirmation}
                      variant="outline"
                      size="sm"
                      disabled={resendLoading}
                      className="w-full"
                    >
                      {resendLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Resend Confirmation Email"
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-glow hover:shadow-glow-accent transition-all duration-300 flex items-center justify-center"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                <>
                  Sign up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/30 shadow-sm">
              <Shield className="h-3.5 w-3.5" />
              <span>SOC2 Certified</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/30 shadow-sm">
              <Lock className="h-3.5 w-3.5" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/30 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>GDPR Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
