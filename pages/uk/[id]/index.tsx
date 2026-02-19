"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { UKAssessmentResult } from "@/types/uk";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";
import Head from 'next/head';

async function backendFetch(
  path: string,
  options: RequestInit = {}
) {
  const { data } = await supabase.auth.getSession();

  const accessToken = data.session?.access_token;

  if (!accessToken) {
    console.error('❌ No access token found in Supabase session');
    throw new Error("User not authenticated");
  }

  console.log('✅ Frontend: Sending token (first 50 chars):', accessToken.substring(0, 50) + '...');

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}${normalizedPath}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }
  );
}

export default function UKAssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [data, setData] = useState<UKAssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMultiJurisdiction, setIsMultiJurisdiction] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id || id === "undefined") {
        setError("Invalid assessment ID");
        setLoading(false);
        return;
      }

      try {
        const res = await backendFetch(`/api/uk-compliance/${id}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to load assessment");
        }
        const body = await res.json();
        setData(body);

        // Check if this is a multi-jurisdiction system
        if (body.system_id) {
          try {
            const { data: systemData, error: systemError } = await supabase
              .from("ai_systems")
              .select("data_processing_locations")
              .eq("id", body.system_id)
              .single();

            if (!systemError && systemData) {
              const dataProcessingLocations = systemData.data_processing_locations || [];

              // Check if system has multiple jurisdictions
              const hasUK = dataProcessingLocations.includes("United Kingdom") || dataProcessingLocations.includes("UK");
              const hasEU = dataProcessingLocations.includes("European Union") ||
                dataProcessingLocations.includes("EU") ||
                dataProcessingLocations.some((loc: string) =>
                  ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
                    "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
                    "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
                    "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
                    "Slovenia", "Spain", "Sweden"].some(c => c.toLowerCase() === loc.toLowerCase())
                );
              const hasSingapore = dataProcessingLocations.includes("Singapore");

              // Multi-jurisdiction if UK + (EU or Singapore)
              const isMulti = hasUK && (hasEU || hasSingapore);
              setIsMultiJurisdiction(isMulti);
            }
          } catch (err) {
            console.error("Error checking multi-jurisdiction status:", err);
            // If we can't check, default to false (don't show button)
            setIsMultiJurisdiction(false);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Sidebar onLogout={handleLogout} />
        <div className={`text-center ${isLoggedIn ? 'lg:pl-72' : ''}`}>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground text-lg font-medium">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Sidebar onLogout={handleLogout} />
        <div className={`container mx-auto max-w-4xl py-12 px-4 text-center ${isLoggedIn ? 'lg:pl-72' : ''}`}>
          <Card className="glass-panel border-red-200 shadow-elevated">
            <CardContent className="pt-6">
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-700 font-semibold">
                  {error || "Assessment not found"}
                </AlertDescription>
              </Alert>
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  className="border-gray-300 bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900 rounded-xl"
                  onClick={() => router.push("/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "Frontier / High-Impact Model":
        return "bg-red-50 text-red-700 border-red-200";
      case "High-Risk (Sector)":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Medium-Risk":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Low-Risk":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getAssessmentColor = (status: string) => {
    switch (status) {
      case "Compliant":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Partially compliant":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Non-compliant":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Utility function to capitalize gap strings properly
  const capitalizeGap = (gap: string): string => {
    return gap
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Utility function to capitalize sector name
  const capitalizeSector = (sector: string): string => {
    return sector
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const isRapidMode = data.assessment_mode === "rapid";
  const rapidChecks = [
    {
      label: "Robustness testing defined",
      passed: data.raw_answers?.robustness_testing === true,
    },
    {
      label: "Human oversight defined",
      passed: data.raw_answers?.human_oversight === true,
    },
    {
      label: "Accountability statement provided",
      passed: typeof data.raw_answers?.accountability_roles === "string" && data.raw_answers.accountability_roles.trim().length >= 25,
    },
  ];

  const PrincipleCard = ({
    title,
    status,
    missing,
  }: {
    title: string;
    status: { meetsPrinciple: boolean; missing: string[] };
    missing: string[];
  }) => (
    <Card className="glass-panel border-border/50 shadow-elevated">
      <CardHeader className="bg-secondary/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
          {status.meetsPrinciple ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600" />
          )}
        </div>
      </CardHeader>
      <CardContent className="bg-secondary/20">
        {status.meetsPrinciple ? (
          <p className="text-emerald-700 font-semibold">Principle is met</p>
        ) : (
          <div>
            <p className="text-red-700 font-semibold mb-2">Principle not fully met</p>
            {missing.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {missing.map((item, idx) => (
                  <li key={idx} className="text-foreground">{capitalizeGap(item)}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>UK Assessment Detail</title>
        <meta name="description" content="View detailed UK AI regulatory framework assessment results." />
      </Head>
      <Sidebar onLogout={handleLogout} />
      <div className={`container mx-auto max-w-6xl py-10 px-4 space-y-8 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              UK AI Regulatory Framework Assessment
            </h1>
            <p className="text-muted-foreground font-medium">
              Assessment ID: {id} • {new Date(data.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex gap-3">
              {data.system_id && isMultiJurisdiction && (
                <Button
                  variant="default"
                  className="bg-primary text-white hover:bg-primary/90"
                  onClick={() => router.push(`/compliance/multi/${data.system_id}`)}
                >
                  Back to Multi-Jurisdiction Results
                </Button>
              )}
              <Button
                variant="outline"
                className="border-gray-300 bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => router.push("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Risk Level and Overall Assessment */}
        {isRapidMode && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
            <AlertTitle className="text-amber-800 font-bold">Quick Scan Result</AlertTitle>
            <AlertDescription className="text-amber-700">
              {data.warning || "Rapid mode covers core indicators only. Run comprehensive mode for full control coverage."}
            </AlertDescription>
          </Alert>
        )}

        {isRapidMode && (
          <Card className="glass-panel border-border/50 shadow-elevated">
            <CardHeader className="bg-secondary/30">
              <CardTitle className="text-xl font-bold text-foreground">Quick Scan Explainability</CardTitle>
              <CardDescription className="text-muted-foreground">How this rapid result was determined</CardDescription>
            </CardHeader>
            <CardContent className="bg-secondary/20 space-y-2">
              {rapidChecks.map((check) => (
                <div key={check.label} className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 bg-white/60">
                  <span className="text-sm font-medium text-foreground">{check.label}</span>
                  <Badge className={check.passed ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}>
                    {check.passed ? "Met" : "Not met"}
                  </Badge>
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-1">
                This is a rapid screen. Use Deep Review for full control-by-control validation.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-panel border-border/50 shadow-elevated">
            <CardHeader className="bg-secondary/30">
              <CardTitle className="text-xl font-bold text-foreground">Risk Level</CardTitle>
            </CardHeader>
            <CardContent className="bg-secondary/20">
              <Badge className={getRiskLevelColor(data.risk_level)} variant="outline">
                {data.risk_level}
              </Badge>
            </CardContent>
          </Card>
          <Card className="glass-panel border-border/50 shadow-elevated">
            <CardHeader className="bg-secondary/30">
              <CardTitle className="text-xl font-bold text-foreground">Overall Assessment</CardTitle>
            </CardHeader>
            <CardContent className="bg-secondary/20">
              <Badge className={getAssessmentColor(data.overall_assessment)} variant="outline">
                {data.overall_assessment}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* UK AI Principles Compliance Progress */}
        {(() => {
          const principles = [
            data.safety_and_security,
            data.transparency,
            data.fairness,
            data.governance,
            data.contestability,
          ];
          const metCount = principles.filter(p => p?.meetsPrinciple).length;
          const totalPrinciples = principles.length;
          const compliancePercentage = (metCount / totalPrinciples) * 100;

          return (
            <Card className="glass-panel border-border/50 shadow-elevated">
              <CardHeader className="bg-secondary/30">
                <CardTitle className="text-xl font-bold text-foreground">UK AI Principles Compliance</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">
                  {metCount} of {totalPrinciples} principles met
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-secondary/20 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">Overall Compliance</span>
                    <span className="text-lg font-bold text-foreground">{Math.round(compliancePercentage)}%</span>
                  </div>
                  <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary/50">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 ease-out"
                      style={{ width: `${compliancePercentage}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${data.safety_and_security?.meetsPrinciple ? 'text-emerald-600' : 'text-red-600'}`}>
                      {data.safety_and_security?.meetsPrinciple ? '✓' : '✗'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Safety</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${data.transparency?.meetsPrinciple ? 'text-emerald-600' : 'text-red-600'}`}>
                      {data.transparency?.meetsPrinciple ? '✓' : '✗'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Transparency</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${data.fairness?.meetsPrinciple ? 'text-emerald-600' : 'text-red-600'}`}>
                      {data.fairness?.meetsPrinciple ? '✓' : '✗'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Fairness</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${data.governance?.meetsPrinciple ? 'text-emerald-600' : 'text-red-600'}`}>
                      {data.governance?.meetsPrinciple ? '✓' : '✗'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Governance</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${data.contestability?.meetsPrinciple ? 'text-emerald-600' : 'text-red-600'}`}>
                      {data.contestability?.meetsPrinciple ? '✓' : '✗'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contestability</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* UK AI Principles */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">UK AI Principles Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PrincipleCard
              title="1. Safety, Security & Robustness"
              status={data.safety_and_security}
              missing={data.safety_and_security.missing}
            />
            <PrincipleCard
              title="2. Transparency & Explainability"
              status={data.transparency}
              missing={data.transparency.missing}
            />
            <PrincipleCard
              title="3. Fairness"
              status={data.fairness}
              missing={data.fairness.missing}
            />
            <PrincipleCard
              title="4. Accountability & Governance"
              status={data.governance}
              missing={data.governance.missing}
            />
            <PrincipleCard
              title="5. Contestability & Redress"
              status={data.contestability}
              missing={data.contestability.missing}
            />
          </div>
        </div>

        {/* Sector Regulation */}
        {data.sector_regulation.sector && (
          <Card className="glass-panel border-border/50 shadow-elevated">
            <CardHeader className="bg-secondary/30">
              <CardTitle className="text-xl font-bold text-foreground">Sector-Specific Regulation</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Sector: {capitalizeSector(data.sector_regulation.sector)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 bg-secondary/20">
              {data.sector_regulation.requiredControls.length > 0 && (
                <div>
                  <h3 className="font-bold text-foreground mb-2">Required Controls:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {data.sector_regulation.requiredControls.map((control, idx) => (
                      <li key={idx} className="text-foreground">{capitalizeGap(control)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.sector_regulation.gaps.length > 0 && (
                <div>
                  <h3 className="font-bold text-red-700 mb-2">Gaps Identified:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                    {data.sector_regulation.gaps.map((gap, idx) => (
                      <li key={idx} className="text-red-700">{capitalizeGap(gap)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <Card className="glass-panel border-border/50 shadow-elevated">
          <CardHeader className="bg-secondary/30">
            <CardTitle className="text-2xl font-bold text-foreground">Assessment Summary</CardTitle>
          </CardHeader>
          <CardContent className="bg-secondary/20">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed text-base font-medium">{data.summary}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
