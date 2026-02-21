"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Shield, ArrowRight, CheckCircle2, Circle, Loader2, Zap, Globe, Lock, ArrowLeft } from "lucide-react";

import { supabase } from "@/utils/supabase/client";
import { backendFetch } from "@/utils/backend-fetch";
import Sidebar from "@/components/sidebar";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/shared-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COMMON_QUESTIONS = [
  { id: "q1", title: "What does your AI system do?", type: "textarea", required: true },
  { id: "q2", title: "Who is accountable for this AI system?", type: "text", required: true },
  { id: "q3", title: "Does your system process personal data?", type: "radio", options: ["Yes", "No"], required: true },
  { id: "q4", title: "Does your system make automated decisions affecting individuals?", type: "radio", options: ["Yes", "No"], required: true },
  { id: "q5", title: "Have you conducted risk assessments for this AI system?", type: "radio", options: ["Yes", "No", "In Progress"], required: true },
];

const JURISDICTION_ORDER = ["UK", "EU", "MAS"] as const;

const jurisdictionLabels = {
  UK: { name: "UK AI Act", flag: "🇬🇧", path: "/assessment/uk" },
  EU: { name: "EU AI Act", flag: "🇪🇺", path: "/assessment/eu" },
  MAS: { name: "MAS FEAT", flag: "🇸🇬", path: "/assessment/mas" },
};

type Step = "common" | "jurisdiction-forms" | "submitting";

export default function MultiJurisdictionAssessmentPage() {
  const router = useRouter();
  const { systemId, mode: modeParam, step: stepParam, completed: completedParam } = router.query;

  const [assessmentMode, setAssessmentMode] = useState<"rapid" | "comprehensive">("rapid");
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<("UK" | "EU" | "MAS")[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>("common");
  const [currentJurisdictionIndex, setCurrentJurisdictionIndex] = useState(0);
  const [completedJurisdictions, setCompletedJurisdictions] = useState<("UK" | "EU" | "MAS")[]>([]);

  const [systemName, setSystemName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [businessUseCase, setBusinessUseCase] = useState("");
  const [systemStatus, setSystemStatus] = useState("envision");

  const [commonAnswers, setCommonAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (modeParam === "rapid" || modeParam === "comprehensive") {
      setAssessmentMode(modeParam);
    }
  }, [modeParam]);

  useEffect(() => {
    if (completedParam && typeof completedParam === "string") {
      const completed = completedParam.split(",").filter(Boolean) as ("UK" | "EU" | "MAS")[];
      console.log("[Multi] Setting completed jurisdictions:", completed);
      setCompletedJurisdictions(completed);
    }
    if (stepParam === "jurisdiction-forms") {
      console.log("[Multi] Setting step to jurisdiction-forms");
      setCurrentStep("jurisdiction-forms");
    }
  }, [stepParam, completedParam]);

  useEffect(() => {
    if (!systemId || !router.isReady) return;

    const loadSystem = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_systems")
          .select("*")
          .eq("id", systemId as string)
          .single();

        if (error) throw error;

        setSystemName(data.system_name || "");
        setCompanyName(data.company_name || "");
        setSector(data.sector || "");
        setDescription(data.description || "");
        setBusinessUseCase(data.business_use_case || "");
        setSystemStatus(data.system_status || "envision");

        const jurisdictions: ("UK" | "EU" | "MAS")[] = [];
        const locations = data.data_processing_locations || [];

        if (locations.includes("UK") || locations.includes("United Kingdom")) {
          jurisdictions.push("UK");
        }
        if (locations.includes("EU") || locations.includes("European Union")) {
          jurisdictions.push("EU");
        }
        if (locations.includes("Singapore")) {
          jurisdictions.push("MAS");
        }

        if (jurisdictions.length === 0) {
          setError("No valid jurisdictions found. Please go back and select data processing locations.");
        } else {
          setSelectedJurisdictions(jurisdictions);
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error("Error loading system:", err);
        setError("Failed to load assessment data.");
        setIsLoading(false);
      }
    };

    loadSystem();
  }, [systemId, router.isReady]);

  // Auto-navigate to next jurisdiction form when in jurisdiction-forms step
  useEffect(() => {
    console.log("[Multi] Auto-nav check:", {
      currentStep,
      isLoading,
      isSubmitting,
      selectedJurisdictions,
      completedJurisdictions,
      hasNavigated: hasNavigatedRef.current
    });

    if (currentStep !== "jurisdiction-forms" || isLoading || isSubmitting || selectedJurisdictions.length === 0) return;

    const remaining = selectedJurisdictions.filter((j) => !completedJurisdictions.includes(j));
    console.log("[Multi] Remaining jurisdictions:", remaining);

    if (remaining.length > 0 && !hasNavigatedRef.current) {
      // Navigate to next jurisdiction form, passing completed jurisdictions
      const nextJurisdiction = remaining[0];
      const path = jurisdictionLabels[nextJurisdiction].path;
      const completedParam = completedJurisdictions.join(",");

      console.log("[Multi] Navigating to:", `${path}/${systemId}?mode=${assessmentMode}&multi=true&common=${systemId}&completed=${completedParam}`);

      hasNavigatedRef.current = true;

      const timer = setTimeout(() => {
        router.push(`${path}/${systemId}?mode=${assessmentMode}&multi=true&common=${systemId}&completed=${completedParam}`);
      }, 200);

      return () => clearTimeout(timer);
    } else if (remaining.length === 0 && completedJurisdictions.length === selectedJurisdictions.length && completedJurisdictions.length > 0) {
      // All jurisdictions complete - submit final results
      console.log("[Multi] All jurisdictions complete, submitting final...");
      handleSubmitFinal();
    }
  }, [currentStep, completedJurisdictions, selectedJurisdictions, isLoading, isSubmitting, assessmentMode, systemId]);

  // Reset navigation flag when step changes
  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [currentStep]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setCommonAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isFormValid = useMemo(() => {
    if (!systemName.trim() || !sector.trim() || !description.trim()) return false;
    return COMMON_QUESTIONS.filter((q) => q.required).every(
      (q) => commonAnswers[q.id] && commonAnswers[q.id].trim() !== ""
    );
  }, [systemName, sector, description, commonAnswers]);

  const handleSubmitFinal = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // All individual jurisdiction forms have been submitted
      // Now update the ai_systems status and redirect to results
      await supabase
        .from("ai_systems")
        .update({ status: "completed" })
        .eq("id", systemId as string);

      // Clear the stored common data
      localStorage.removeItem(`multi_${systemId}_common`);

      // Redirect to multi-jurisdiction results page
      router.push(`/compliance/multi/${systemId}`);
    } catch (err: any) {
      console.error("Final submission error:", err);
      setError(err.message || "Failed to complete assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedToJurisdictions = async () => {
    if (!isFormValid) {
      setError("Please fill in all required fields.");
      return;
    }

    await supabase
      .from("ai_systems")
      .update({
        system_name: systemName.trim(),
        company_name: companyName.trim(),
        sector: sector.trim(),
        description: description.trim(),
        business_use_case: businessUseCase.trim(),
        system_status: systemStatus,
      })
      .eq("id", systemId as string);

    // Store common answers in localStorage for jurisdiction forms to access
    localStorage.setItem(`multi_${systemId}_common`, JSON.stringify({
      commonAnswers,
      systemName,
      companyName,
      sector,
      description,
      businessUseCase,
      assessmentMode,
    }));

    // Ensure common answers are mapped for all jurisdictions
    const firstJurisdiction = selectedJurisdictions[0];
    const path = jurisdictionLabels[firstJurisdiction].path;
    router.push(`${path}/${systemId}?mode=${assessmentMode}&multi=true&common=${systemId}`);
  };

  const handleSubmitRapid = async () => {
    setError(null);
    setIsSubmitting(true);
    setCurrentStep("submitting");

    try {
      const response = await backendFetch("/api/multi-jurisdiction-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_id: systemId,
          jurisdictions: selectedJurisdictions,
          assessment_mode: "rapid",
          common_answers: commonAnswers,
          system_name: systemName,
          company_name: companyName,
          sector,
          description,
          business_use_case: businessUseCase,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to run assessment");
      }

      const result = await response.json();
      router.push(`/compliance/multi/${systemId}`);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Failed to submit assessment. Please try again.");
      setCurrentStep("common");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRemainingJurisdictions = () => {
    return selectedJurisdictions.filter((j) => !completedJurisdictions.includes(j));
  };

  const handleContinueFromJurisdiction = (jurisdiction: "UK" | "EU" | "MAS") => {
    const newCompleted = [...completedJurisdictions, jurisdiction];
    setCompletedJurisdictions(newCompleted);

    const remaining = selectedJurisdictions.filter((j) => !newCompleted.includes(j));

    if (remaining.length === 0) {
      // All jurisdictions complete - submit
      router.push(`/assessment/multi/${systemId}?step=submit&completed=${newCompleted.join(",")}`);
    } else {
      // Navigate to next jurisdiction
      const nextJurisdiction = remaining[0];
      const path = jurisdictionLabels[nextJurisdiction].path;
      router.push(`${path}/${systemId}?mode=${assessmentMode}&multi=true&common=${systemId}&prev=${jurisdiction}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>Loading Assessment | AI Governance</title>
        </Head>
        {isLoggedIn && <Sidebar onLogout={handleLogout} />}
        <div className={cn("flex items-center justify-center min-h-[400px]", isLoggedIn && "lg:pl-72 pt-24")}>
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  // Progress indicator for comprehensive mode
  const renderProgress = () => {
    if (assessmentMode !== "comprehensive") return null;

    const steps = ["Common Questions", ...selectedJurisdictions.map((j) => jurisdictionLabels[j].name)];

    return (
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {steps.map((step, idx) => {
          const isCompleted = idx === 0
            ? currentStep !== "common" || completedJurisdictions.length > 0
            : completedJurisdictions.includes(selectedJurisdictions[idx - 1]);
          const isCurrent = idx === 0
            ? currentStep === "common"
            : currentStep === "jurisdiction-forms" && !completedJurisdictions.includes(selectedJurisdictions[idx - 1]) && completedJurisdictions.length === idx - 1;

          return (
            <div key={idx} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap",
                isCompleted ? "bg-emerald-100 text-emerald-700" : isCurrent ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"
              )}>
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                {step}
              </div>
              {idx < steps.length - 1 && <ArrowRight className="h-4 w-4 text-slate-300" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Multi-Jurisdiction Assessment | AI Governance</title>
      </Head>
      {isLoggedIn && <Sidebar onLogout={handleLogout} />}

      <div className={cn("px-4 lg:px-8 py-6", isLoggedIn && "lg:pl-72 pt-24")}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Multi-Jurisdiction Assessment</h1>
              <p className="text-sm text-muted-foreground">
                {assessmentMode === "comprehensive"
                  ? "Complete common questions, then each jurisdiction form"
                  : "Quick scan across all selected frameworks"}
              </p>
            </div>
          </div>

          {renderProgress()}

          <Card className="glass-panel border-border/50 mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Selected Jurisdictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {selectedJurisdictions.map((j) => {
                  const isCompleted = completedJurisdictions.includes(j);
                  return (
                    <div
                      key={j}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors",
                        isCompleted
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-primary/10 border-primary/20"
                      )}
                    >
                      <span className="text-lg">{jurisdictionLabels[j].flag}</span>
                      <span className="font-medium text-sm">{jurisdictionLabels[j].name}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <form onSubmit={(e) => { e.preventDefault(); handleProceedToJurisdictions(); }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">
                        Sector <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        placeholder="e.g., Finance"
                        className="rounded-lg h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Status</Label>
                      <Select value={systemStatus} onValueChange={setSystemStatus}>
                        <SelectTrigger className="rounded-lg h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg z-50">
                          <SelectItem value="envision">Planning</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="staging">Testing</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                      <p className="text-xs text-muted-foreground">Fast high-level risk check across all jurisdictions</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAssessmentMode("comprehensive")}
                      className={cn(
                        "flex-1 p-3 rounded-xl border-2 text-left transition-all",
                        assessmentMode === "comprehensive"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-border/50 hover:border-emerald-500/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground text-sm">Deep Review</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Full compliance analysis with jurisdiction-specific forms</p>
                    </button>
                  </div>

                  {assessmentMode === "comprehensive" && (
                    <Alert className="mt-3 bg-blue-50 border-blue-200">
                      <AlertDescription className="text-blue-800 text-xs">
                        Deep Review will guide you through each jurisdiction's full form after common questions.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-1.5 mt-3">
                    <Label className="text-sm">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your AI system..."
                      className="min-h-[60px] rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-panel border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Common Assessment Questions</CardTitle>
                <CardDescription className="text-xs">
                  These answers apply to all selected jurisdictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {COMMON_QUESTIONS.map((q) => (
                  <div key={q.id} className="space-y-1.5">
                    <Label className="text-sm">
                      {q.title}
                      {q.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {q.type === "textarea" && (
                      <Textarea
                        value={commonAnswers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Enter your answer..."
                        className="min-h-[60px] rounded-lg"
                      />
                    )}
                    {q.type === "text" && (
                      <Input
                        value={commonAnswers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Enter your answer..."
                        className="rounded-lg h-9"
                      />
                    )}
                    {q.type === "radio" && (
                      <div className="flex gap-2 mt-1">
                        {q.options?.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleAnswerChange(q.id, opt)}
                            className={cn(
                              "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                              commonAnswers[q.id] === opt
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/50 hover:border-primary/30"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="space-y-1.5">
                  <Label className="text-sm">Business Use Case</Label>
                  <Textarea
                    value={businessUseCase}
                    onChange={(e) => setBusinessUseCase(e.target.value)}
                    placeholder="How is this AI system used in your business?"
                    className="min-h-[60px] rounded-lg"
                  />
                </div>
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
                onClick={() => router.push("/assessment")}
                className="rounded-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : assessmentMode === "rapid" ? (
                  <>
                    Run Quick Scan ({selectedJurisdictions.length} jurisdictions)
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continue to Jurisdiction Forms
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
