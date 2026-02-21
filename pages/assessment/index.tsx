"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Shield, ArrowRight, Zap, Globe, Check, Loader2, Lock } from "lucide-react";

import { supabase } from "@/utils/supabase/client";
import Sidebar from "@/components/sidebar";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/shared-utils";

const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
  "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
  "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
  "Slovenia", "Spain", "Sweden",
];

const FRAMEWORKS = [
  {
    id: "eu",
    name: "EU AI Act",
    flag: "🇪🇺",
    description: "European Union AI Regulation",
    details: "180+ obligations, risk tiers",
    color: "blue",
  },
  {
    id: "uk",
    name: "UK AI Act",
    flag: "🇬🇧",
    description: "UK AI Framework",
    details: "Cross-sectoral principles",
    color: "purple",
  },
  {
    id: "mas",
    name: "MAS FEAT",
    flag: "🇸🇬",
    description: "Singapore AI Governance",
    details: "FEAT principles",
    color: "green",
  },
];

export default function AssessmentEntryPage() {
  const router = useRouter();

  const [assessmentMode, setAssessmentMode] = useState<"rapid" | "comprehensive">("comprehensive");
  const [systemName, setSystemName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [dataProcessingLocations, setDataProcessingLocations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const hasUK = dataProcessingLocations.includes("UK");
  const hasEU = dataProcessingLocations.includes("EU");
  const hasMAS = dataProcessingLocations.includes("Singapore");

  const selectedFrameworks = useMemo(() => {
    const frameworks: string[] = [];
    if (hasEU) frameworks.push("EU");
    if (hasUK) frameworks.push("UK");
    if (hasMAS) frameworks.push("MAS");
    return frameworks;
  }, [hasEU, hasUK, hasMAS]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleLocation = (location: string) => {
    if (dataProcessingLocations.includes(location)) {
      setDataProcessingLocations(dataProcessingLocations.filter((l) => l !== location));
    } else {
      setDataProcessingLocations([...dataProcessingLocations, location]);
    }
  };

  const handleStartAssessment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (dataProcessingLocations.length === 0) {
      setError("Please select at least one data processing location.");
      return;
    }

    if (!systemName.trim()) {
      setError("Please enter a system name.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      let assessmentType: "UK" | "EU" | "MAS" = "EU";
      let country = "Unknown";

      if (hasUK) {
        assessmentType = "UK";
        country = "United Kingdom";
      } else if (hasMAS) {
        assessmentType = "MAS";
        country = "Singapore";
      } else if (hasEU) {
        assessmentType = "EU";
        country = "European Union";
      }

      const { data, error: insertError } = await supabase
        .from("ai_systems")
        .insert({
          system_name: systemName.trim(),
          company_name: companyName.trim() || "Unknown Company",
          description: description.trim(),
          country: country,
          data_processing_locations: dataProcessingLocations,
          assessment_type: assessmentType,
          assessment_mode: assessmentMode,
          status: "draft",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (selectedFrameworks.length > 1) {
        router.push(`/assessment/multi/${data.id}?mode=${assessmentMode}`);
      } else if (hasUK) {
        router.push(`/assessment/uk/${data.id}?mode=${assessmentMode}`);
      } else if (hasMAS) {
        router.push(`/assessment/mas/${data.id}?mode=${assessmentMode}`);
      } else {
        router.push(`/assessment/eu/${data.id}?mode=${assessmentMode}`);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to start assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>New Assessment | AI Governance</title>
      </Head>

      {isLoggedIn && <Sidebar onLogout={handleLogout} />}

      <div className={cn(isLoggedIn && "lg:pl-72")}>
        <div className="px-4 lg:px-8 py-6 lg:py-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">New Compliance Assessment</h1>
                <p className="text-sm text-muted-foreground">
                  Configure and start your assessment
                </p>
              </div>
            </div>

            <form onSubmit={handleStartAssessment} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="glass-panel border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Assessment Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setAssessmentMode("rapid")}
                        className={cn(
                          "flex-1 p-3 rounded-xl border-2 text-left transition-all",
                          assessmentMode === "rapid"
                            ? "border-primary bg-primary/5"
                            : "border-border/50 hover:border-primary/30"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground text-sm">Quick Scan</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Fast high-level risk check
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAssessmentMode("comprehensive")}
                        className={cn(
                          "flex-1 p-3 rounded-xl border-2 text-left transition-all",
                          assessmentMode === "comprehensive"
                            ? "border-green-500 bg-green-50"
                            : "border-border/50 hover:border-green-500/30"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground text-sm">Deep Review</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Full compliance analysis
                        </p>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-panel border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      System Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">
                        System Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        placeholder="e.g., Fraud Detection Engine"
                        className="rounded-lg h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Organization / Team</Label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g., Risk Operations"
                        className="rounded-lg h-9"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-panel border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Data Processing Locations
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select all jurisdictions where data is processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {FRAMEWORKS.map((framework) => {
                      const isSelected = dataProcessingLocations.includes(
                        framework.id === "eu" ? "EU" : framework.id === "uk" ? "UK" : "Singapore"
                      );

                      return (
                        <button
                          key={framework.id}
                          type="button"
                          onClick={() =>
                            toggleLocation(
                              framework.id === "eu" ? "EU" : framework.id === "uk" ? "UK" : "Singapore"
                            )
                          }
                          className={cn(
                            "p-3 rounded-xl border-2 text-left transition-all",
                            isSelected
                              ? framework.id === "eu"
                                ? "border-blue-500 bg-blue-50"
                                : framework.id === "uk"
                                ? "border-purple-500 bg-purple-50"
                                : "border-green-500 bg-green-50"
                              : "border-border/50 hover:border-primary/30"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xl">{framework.flag}</span>
                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium text-foreground text-sm">{framework.name}</h3>
                          <p className="text-xs text-muted-foreground">{framework.details}</p>
                        </button>
                      );
                    })}
                  </div>

                  {selectedFrameworks.length > 1 && (
                    <Alert className="mt-3 bg-blue-50 border-blue-200">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800 text-sm">
                        <strong>Multi-jurisdiction:</strong> {selectedFrameworks.join(", ")} - we'll guide you through each.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-panel border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what this AI system does..."
                    className="min-h-[80px] rounded-lg"
                  />
                </CardContent>
              </Card>

              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between pt-2 pb-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/dashboard")}
                  className="rounded-lg"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || dataProcessingLocations.length === 0}
                  className="rounded-lg bg-primary hover:bg-primary/90 text-white px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      Start Assessment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
