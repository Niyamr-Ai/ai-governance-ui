"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Formik } from "formik";
import * as Yup from "yup";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle2, Circle } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";
import { backendFetch } from "@/utils/backend-fetch";
import Head from 'next/head';

// Common questions state (shared across all jurisdictions)
const commonInitialState = {
  system_name: "",
  description: "",
  owner: "",
  jurisdiction: "",
  sector: "",
  system_status: "envision",
  business_use_case: "",
};

// Common questions validation schema
const commonValidationSchema = Yup.object({
  system_name: Yup.string().required("System name is required"),
  description: Yup.string().required("Description is required"),
  sector: Yup.string().required("Sector is required"),
});

type JurisdictionStatus = {
  id: "UK" | "EU" | "MAS";
  name: string;
  completed: boolean;
  assessmentId?: string;
};

export default function MultiJurisdictionAssessmentPage() {
  const router = useRouter();
  const { systemId } = router.query;

  const [currentStep, setCurrentStep] = useState<"common" | "jurisdiction">("common");
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<("UK" | "EU" | "MAS")[]>([]);
  const [currentJurisdictionIndex, setCurrentJurisdictionIndex] = useState(0);
  const [jurisdictionStatuses, setJurisdictionStatuses] = useState<JurisdictionStatus[]>([]);
  const [commonQuestionsCompleted, setCommonQuestionsCompleted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [commonValues, setCommonValues] = useState<typeof commonInitialState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle completion query parameters
  useEffect(() => {
    if (!systemId || !router.isReady || jurisdictionStatuses.length === 0) {
      if (systemId && router.isReady && jurisdictionStatuses.length === 0) {
        console.log(`⏳ [MULTI-ASSESSMENT] Waiting for jurisdiction statuses to be initialized`);
      }
      return;
    }

    const { completed, assessmentId } = router.query;
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔄 [MULTI-ASSESSMENT] Checking completion query params`);
    console.log(`   System ID: ${systemId}`);
    console.log(`   Completed: ${completed}`);
    console.log(`   Assessment ID: ${assessmentId}`);
    console.log(`   Current jurisdictions: ${jurisdictionStatuses.map(s => `${s.id}(${s.completed ? '✓' : '○'})`).join(', ')}`);
    console.log(`${'='.repeat(80)}\n`);

    if (completed && assessmentId && typeof completed === "string" && typeof assessmentId === "string") {
      // Mark the completed jurisdiction as done
      const jurisdictionId = completed as "UK" | "EU" | "MAS";
      console.log(`\n${'='.repeat(80)}`);
      console.log(`✅ [MULTI-ASSESSMENT] Marking jurisdiction as completed`);
      console.log(`   Jurisdiction: ${jurisdictionId}`);
      console.log(`   Assessment ID: ${assessmentId}`);
      console.log(`${'='.repeat(80)}\n`);

      setJurisdictionStatuses((prev) => {
        const updated = prev.map((status) =>
          status.id === jurisdictionId
            ? { ...status, completed: true, assessmentId }
            : status
        );

        console.log(`📊 [MULTI-ASSESSMENT] Updated statuses:`, updated.map(s => `${s.id}: ${s.completed ? 'Completed ✓' : 'Pending ○'}`));

        // Check if all are completed
        const allDone = updated.every((s) => s.completed);
        if (allDone) {
          console.log(`\n${'='.repeat(80)}`);
          console.log(`🎉 [MULTI-ASSESSMENT] All jurisdictions completed!`);
          console.log(`   Redirecting to results page immediately...`);
          console.log(`${'='.repeat(80)}\n`);
          setIsRedirecting(true);
          // Redirect immediately without delay
          router.push(`/compliance/multi/${systemId}`);
        } else {
          // Move to next incomplete jurisdiction
          const currentIndex = updated.findIndex((s) => s.id === jurisdictionId);
          const nextIncompleteIndex = updated.findIndex((s, idx) => idx > currentIndex && !s.completed);
          if (nextIncompleteIndex !== -1) {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`➡️  [MULTI-ASSESSMENT] Moving to next jurisdiction`);
            console.log(`   Current index: ${currentIndex} (${jurisdictionId})`);
            console.log(`   Next index: ${nextIncompleteIndex} (${updated[nextIncompleteIndex].id})`);
            console.log(`${'='.repeat(80)}\n`);
            setCurrentJurisdictionIndex(nextIncompleteIndex);
            setCurrentStep("jurisdiction"); // Switch to jurisdiction step
          } else {
            // Check if there's any incomplete jurisdiction before current one
            const firstIncompleteIndex = updated.findIndex((s) => !s.completed);
            if (firstIncompleteIndex !== -1) {
              console.log(`\n${'='.repeat(80)}`);
              console.log(`➡️  [MULTI-ASSESSMENT] Moving to first incomplete jurisdiction`);
              console.log(`   Index: ${firstIncompleteIndex} (${updated[firstIncompleteIndex].id})`);
              console.log(`${'='.repeat(80)}\n`);
              setCurrentJurisdictionIndex(firstIncompleteIndex);
              setCurrentStep("jurisdiction"); // Switch to jurisdiction step
            } else {
              console.log(`⚠️  [MULTI-ASSESSMENT] No next incomplete jurisdiction found - all should be completed`);
              // Double-check: if we can't find incomplete, redirect to results
              setTimeout(() => {
                router.push(`/compliance/multi/${systemId}`);
              }, 2000);
            }
          }
        }

        return updated;
      });

      // Clear query params
      router.replace(`/assessment/multi/${systemId}`, undefined, { shallow: true });
    }
  }, [router.isReady, router.query, systemId, jurisdictionStatuses.length]);

  // Load system data and determine selected jurisdictions
  useEffect(() => {
    if (!systemId) {
      console.warn(`⚠️  [MULTI-ASSESSMENT] No systemId provided`);
      return;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔄 [MULTI-ASSESSMENT] Loading system data`);
    console.log(`   System ID: ${systemId}`);
    console.log(`${'='.repeat(80)}\n`);

    const loadSystem = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_systems")
          .select("*")
          .eq("id", systemId)
          .single();

        if (error) {
          console.error(`❌ [MULTI-ASSESSMENT] Error loading system:`, error);
          throw error;
        }

        console.log(`✅ [MULTI-ASSESSMENT] System data loaded:`, {
          system_name: data?.system_name,
          data_processing_locations: data?.data_processing_locations,
        });

        // Determine which jurisdictions are selected based on data_processing_locations
        const jurisdictions: ("UK" | "EU" | "MAS")[] = [];
        const dataProcessingLocations = data.data_processing_locations || [];

        if (dataProcessingLocations.includes("United Kingdom") || dataProcessingLocations.includes("UK")) {
          jurisdictions.push("UK");
        }
        if (dataProcessingLocations.includes("European Union") || dataProcessingLocations.includes("EU") ||
          dataProcessingLocations.some((loc: string) =>
            ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
              "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
              "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
              "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
              "Slovenia", "Spain", "Sweden"].some(c => c.toLowerCase() === loc.toLowerCase())
          )) {
          jurisdictions.push("EU");
        }
        if (dataProcessingLocations.includes("Singapore")) {
          jurisdictions.push("MAS");
        }

        if (jurisdictions.length === 0) {
          console.error(`❌ [MULTI-ASSESSMENT] No valid jurisdictions found`);
          setError("No valid jurisdictions found. Please go back and select data processing locations.");
          setIsLoading(false);
          return;
        }

        console.log(`✅ [MULTI-ASSESSMENT] Jurisdictions identified:`, jurisdictions);
        setSelectedJurisdictions(jurisdictions);

        // Check for existing assessments in database
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🔍 [MULTI-ASSESSMENT] Checking for existing assessments`);
        console.log(`   System ID: ${systemId}`);
        console.log(`${'='.repeat(80)}\n`);

        const assessmentChecks = await Promise.all([
          // Check UK assessment
          jurisdictions.includes("UK")
            ? supabase
              .from("uk_ai_assessments")
              .select("id")
              .eq("system_id", systemId)
              .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          // Check EU assessment
          jurisdictions.includes("EU")
            ? supabase
              .from("eu_ai_act_check_results")
              .select("id")
              .eq("system_id", systemId)
              .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          // Check MAS assessment
          jurisdictions.includes("MAS")
            ? supabase
              .from("mas_ai_risk_assessments")
              .select("id")
              .eq("system_id", systemId)
              .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

        const [ukAssessment, euAssessment, masAssessment] = assessmentChecks;

        console.log(`📊 [MULTI-ASSESSMENT] Assessment check results:`);
        console.log(`   UK: ${ukAssessment.data ? `Found (${ukAssessment.data.id})` : "Not found"}`);
        console.log(`   EU: ${euAssessment.data ? `Found (${euAssessment.data.id})` : "Not found"}`);
        console.log(`   MAS: ${masAssessment.data ? `Found (${masAssessment.data.id})` : "Not found"}`);
        console.log(`${'='.repeat(80)}\n`);

        // Initialize jurisdiction statuses with completion status from database
        const statuses: JurisdictionStatus[] = jurisdictions.map((id) => {
          let assessmentId: string | undefined;
          let completed = false;

          if (id === "UK" && ukAssessment.data) {
            completed = true;
            assessmentId = ukAssessment.data.id;
          } else if (id === "EU" && euAssessment.data) {
            completed = true;
            assessmentId = euAssessment.data.id;
          } else if (id === "MAS" && masAssessment.data) {
            completed = true;
            assessmentId = masAssessment.data.id;
          }

          return {
            id,
            name: id === "UK" ? "United Kingdom" : id === "EU" ? "European Union" : "Singapore (MAS)",
            completed,
            assessmentId,
          };
        });
        setJurisdictionStatuses(statuses);

        // Load common values from database
        const jurisdiction = data.data_processing_locations?.includes("United Kingdom")
          ? "United Kingdom"
          : data.data_processing_locations?.includes("Singapore")
            ? "Singapore"
            : data.data_processing_locations?.includes("European Union") || data.data_processing_locations?.some((loc: string) =>
              ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
                "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
                "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
                "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
                "Slovenia", "Spain", "Sweden"].some(c => c.toLowerCase() === loc.toLowerCase())
            )
              ? "European Union"
              : data.country || "";

        setCommonValues({
          system_name: data.system_name ?? "",
          description: data.description ?? "",
          owner: data.company_name ?? "",
          jurisdiction: jurisdiction,
          sector: data.sector ?? "",
          system_status: data.system_status ?? "envision",
          business_use_case: data.business_use_case ?? "",
        });

        // Check if common questions have been filled (all required fields present)
        const hasCommonData = data.system_name && data.description && data.sector;
        if (hasCommonData) {
          setCommonQuestionsCompleted(true);
          console.log(`✅ [MULTI-ASSESSMENT] Common questions already completed`);
        }

        // Check query params for completed assessments (in case user is returning after completing one)
        const { completed, assessmentId } = router.query;
        let finalStatuses = statuses;

        if (completed && typeof completed === "string" && assessmentId) {
          const jurisdictionId = completed as "UK" | "EU" | "MAS";
          console.log(`\n${'='.repeat(80)}`);
          console.log(`🔄 [MULTI-ASSESSMENT] Detected completed jurisdiction in query params during load`);
          console.log(`   Jurisdiction: ${jurisdictionId}`);
          console.log(`${'='.repeat(80)}\n`);

          // Update statuses to mark this jurisdiction as completed (override database check if needed)
          finalStatuses = statuses.map((status) =>
            status.id === jurisdictionId
              ? { ...status, completed: true, assessmentId: assessmentId as string }
              : status
          );
        }

        setJurisdictionStatuses(finalStatuses);

        // Determine which step to show
        const allCompleted = finalStatuses.every((s) => s.completed);
        if (allCompleted && hasCommonData) {
          // All done - redirect to results immediately
          console.log(`🎉 [MULTI-ASSESSMENT] All jurisdictions completed during load - redirecting immediately`);
          setIsRedirecting(true);
          router.push(`/compliance/multi/${systemId}`);
          return; // Exit early to prevent rendering
        } else if (hasCommonData) {
          // Common questions done, find first incomplete jurisdiction
          const firstIncompleteIndex = finalStatuses.findIndex((s) => !s.completed);
          if (firstIncompleteIndex !== -1) {
            setCurrentStep("jurisdiction");
            setCurrentJurisdictionIndex(firstIncompleteIndex);
            console.log(`➡️  [MULTI-ASSESSMENT] Showing jurisdiction step: ${finalStatuses[firstIncompleteIndex].name}`);
          }
        }

        console.log(`✅ [MULTI-ASSESSMENT] System initialization complete`);
        setIsLoading(false);
      } catch (err: any) {
        console.error(`\n${'='.repeat(80)}`);
        console.error(`❌ [MULTI-ASSESSMENT] Critical error loading system`);
        console.error(`   Error:`, err);
        console.error(`   Message: ${err.message}`);
        console.error(`   Stack: ${err.stack}`);
        console.error(`${'='.repeat(80)}\n`);
        setError("Failed to load assessment data.");
        setIsLoading(false);
      }
    };

    loadSystem();
  }, [systemId]);

  // Handle common questions submission
  const handleCommonSubmit = async (values: typeof commonInitialState) => {
    if (!systemId) {
      console.error(`❌ [MULTI-ASSESSMENT] Cannot submit: no systemId`);
      return;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`💾 [MULTI-ASSESSMENT] Submitting common questions`);
    console.log(`   System ID: ${systemId}`);
    console.log(`   Values:`, {
      system_name: values.system_name,
      sector: values.sector,
      description: values.description?.substring(0, 50) + '...',
    });
    console.log(`${'='.repeat(80)}\n`);

    setIsSubmitting(true);
    setError(null);

    try {
      // Update the system record with common values
      const { error: updateError } = await supabase
        .from("ai_systems")
        .update({
          system_name: values.system_name,
          description: values.description,
          sector: values.sector,
          system_status: values.system_status,
          business_use_case: values.business_use_case,
        })
        .eq("id", systemId);

      if (updateError) {
        console.error(`❌ [MULTI-ASSESSMENT] Error updating system:`, updateError);
        throw updateError;
      }

      console.log(`✅ [MULTI-ASSESSMENT] Common questions saved successfully`);
      console.log(`➡️  [MULTI-ASSESSMENT] Moving to jurisdiction step`);

      // Move to first jurisdiction
      setCommonQuestionsCompleted(true);
      setCurrentStep("jurisdiction");
      setCurrentJurisdictionIndex(0);
    } catch (err: any) {
      console.error(`\n${'='.repeat(80)}`);
      console.error(`❌ [MULTI-ASSESSMENT] Error submitting common questions`);
      console.error(`   Error:`, err);
      console.error(`   Message: ${err.message}`);
      console.error(`${'='.repeat(80)}\n`);
      setError("Failed to save common information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle jurisdiction completion
  const handleJurisdictionComplete = (jurisdictionId: "UK" | "EU" | "MAS", assessmentId?: string) => {
    setJurisdictionStatuses((prev) => {
      const updated = prev.map((status) =>
        status.id === jurisdictionId
          ? { ...status, completed: true, assessmentId }
          : status
      );

      // Check if all are completed
      const allDone = updated.every((s) => s.completed);
      if (allDone) {
        // Small delay before redirecting to results
        setTimeout(() => {
          router.push(`/compliance/multi/${systemId}`);
        }, 2000);
      } else {
        // Move to next incomplete jurisdiction
        const currentIndex = updated.findIndex((s) => s.id === jurisdictionId);
        const nextIncompleteIndex = updated.findIndex((s, idx) => idx > currentIndex && !s.completed);
        if (nextIncompleteIndex !== -1) {
          setCurrentJurisdictionIndex(nextIncompleteIndex);
        }
      }

      return updated;
    });
  };

  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>{isRedirecting ? "Redirecting..." : "Loading Assessment"} | AI Governance</title>
          <meta name="description" content="Loading multi-jurisdiction compliance assessment..." />
        </Head>
        <Sidebar />
        <div className="lg:pl-72 pt-24 p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              {isRedirecting ? "Redirecting to results..." : "Loading assessment..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !commonValues) {
    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>Error - Multi-Jurisdiction Assessment</title>
        </Head>
        <Sidebar />
        <div className="lg:pl-72 pt-24 p-8">
          <Card className="glass-panel shadow-elevated max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-foreground">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push("/assessment")}
                className="mt-4"
                variant="outline"
              >
                Go Back to Intro
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentJurisdiction = selectedJurisdictions[currentJurisdictionIndex];
  const allCompleted = jurisdictionStatuses.every((s) => s.completed);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Multi-Jurisdiction Assessment</title>
        <meta name="description" content="Complete AI compliance assessments across multiple jurisdictions." />
      </Head>
      <Sidebar />
      <div className="lg:pl-72 pt-24 p-8">
        <div className="container mx-auto max-w-5xl">
          {/* Progress Tracker */}
          <Card className="glass-panel shadow-elevated mb-6">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Multi-Jurisdiction Assessment Progress
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Complete common questions first, then proceed through each jurisdiction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Common Questions Status */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                  {commonQuestionsCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${commonQuestionsCompleted ? "text-green-500" : "text-foreground"}`}>
                      Common Questions
                    </p>
                    <p className="text-xs text-muted-foreground">
                      System profile information shared across all jurisdictions
                    </p>
                  </div>
                  {commonQuestionsCompleted && (
                    <span className="text-xs text-green-500 font-medium">Completed</span>
                  )}
                </div>

                {/* Jurisdiction Statuses */}
                {jurisdictionStatuses.map((status, index) => (
                  <div
                    key={status.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${index === currentJurisdictionIndex && currentStep === "jurisdiction"
                      ? "bg-primary/20 border-2 border-primary"
                      : status.completed
                        ? "bg-green-500/10"
                        : "bg-secondary/20"
                      }`}
                  >
                    {status.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${status.completed
                          ? "text-green-500"
                          : index === currentJurisdictionIndex && currentStep === "jurisdiction"
                            ? "text-primary"
                            : "text-foreground"
                          }`}
                      >
                        {status.name} Assessment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {status.completed
                          ? "Assessment completed"
                          : index === currentJurisdictionIndex && currentStep === "jurisdiction"
                            ? "In progress..."
                            : "Pending"}
                      </p>
                    </div>
                    {status.completed && (
                      <span className="text-xs text-green-500 font-medium">Completed</span>
                    )}
                    {index === currentJurisdictionIndex && currentStep === "jurisdiction" && !status.completed && (
                      <span className="text-xs text-primary font-medium">Current</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Common Questions Form */}
          {currentStep === "common" && commonValues && (
            <Card className="glass-panel shadow-elevated">
              <CardHeader>
                <CardTitle className="text-foreground">Common Questions</CardTitle>
                <CardDescription className="text-muted-foreground">
                  These questions are shared across all selected jurisdictions: {selectedJurisdictions.join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Formik
                  initialValues={commonValues}
                  validationSchema={commonValidationSchema}
                  enableReinitialize
                  onSubmit={handleCommonSubmit}
                >
                  {({ handleSubmit, values, setFieldValue, errors, touched }) => (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">System name *</Label>
                          <Input
                            value={values.system_name}
                            onChange={(e) => setFieldValue("system_name", e.target.value)}
                            placeholder="e.g., Fraud Detection Engine"
                            className="rounded-xl"
                          />
                          {touched.system_name && errors.system_name && (
                            <p className="text-sm text-red-500">{errors.system_name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground">Sector *</Label>
                          <Input
                            value={values.sector}
                            onChange={(e) => setFieldValue("sector", e.target.value)}
                            placeholder="e.g., Financial Services, Healthcare"
                            className="rounded-xl"
                          />
                          {touched.sector && errors.sector && (
                            <p className="text-sm text-red-500">{errors.sector}</p>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-foreground">Description *</Label>
                          <Textarea
                            value={values.description}
                            onChange={(e) => setFieldValue("description", e.target.value)}
                            placeholder="Describe your AI system"
                            className="rounded-xl min-h-[100px]"
                          />
                          {touched.description && errors.description && (
                            <p className="text-sm text-red-500">{errors.description}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground">Owner / Company</Label>
                          <Input
                            value={values.owner}
                            onChange={(e) => setFieldValue("owner", e.target.value)}
                            placeholder="e.g., Risk Operations Team"
                            className="rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-foreground">System Status</Label>
                          <Select
                            value={values.system_status}
                            onValueChange={(v) => setFieldValue("system_status", v)}
                          >
                            <SelectTrigger className="rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-border shadow-lg">
                              <SelectItem value="envision">Envision</SelectItem>
                              <SelectItem value="develop">Develop</SelectItem>
                              <SelectItem value="deploy">Deploy</SelectItem>
                              <SelectItem value="operate">Operate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-foreground">Business Use Case</Label>
                          <Textarea
                            value={values.business_use_case}
                            onChange={(e) => setFieldValue("business_use_case", e.target.value)}
                            placeholder="Describe how your company uses this AI system"
                            className="rounded-xl min-h-[80px]"
                          />
                        </div>
                      </div>

                      {error && (
                        <Alert variant="destructive" className="rounded-xl">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push("/assessment")}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="hero"
                          className="rounded-xl"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (() => {
                            // Find the first incomplete jurisdiction
                            const nextIncomplete = jurisdictionStatuses.find(s => !s.completed);
                            return nextIncomplete
                              ? `Continue to ${nextIncomplete.name} Assessment`
                              : "Continue to Assessment";
                          })()}
                        </Button>
                      </div>
                    </form>
                  )}
                </Formik>
              </CardContent>
            </Card>
          )}

          {/* Jurisdiction-Specific Forms */}
          {currentStep === "jurisdiction" && currentJurisdiction && !allCompleted && (
            <div className="space-y-4">
              <Card className="glass-panel shadow-elevated">
                <CardHeader>
                  <CardTitle className="text-foreground">
                    {jurisdictionStatuses[currentJurisdictionIndex]?.name} Assessment
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Complete the {jurisdictionStatuses[currentJurisdictionIndex]?.name} compliance assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      {jurisdictionStatuses[currentJurisdictionIndex]?.completed
                        ? `${jurisdictionStatuses[currentJurisdictionIndex]?.name} assessment completed!`
                        : `Click below to start the ${jurisdictionStatuses[currentJurisdictionIndex]?.name} assessment form`}
                    </p>
                    {!jurisdictionStatuses[currentJurisdictionIndex]?.completed && (
                      <Button
                        onClick={() => {
                          console.log(`\n${'='.repeat(80)}`);
                          console.log(`🖱️  [MULTI-ASSESSMENT] Button clicked to navigate to jurisdiction form`);
                          console.log(`   Current jurisdiction: ${currentJurisdiction}`);
                          console.log(`   System ID: ${systemId}`);
                          console.log(`${'='.repeat(80)}\n`);

                          if (currentJurisdiction === "UK") {
                            const url = `/assessment/uk/${systemId}`;
                            console.log(`➡️  [MULTI-ASSESSMENT] Navigating to: ${url}`);
                            router.push(url);
                          } else if (currentJurisdiction === "MAS") {
                            const url = `/assessment/mas/${systemId}`;
                            console.log(`➡️  [MULTI-ASSESSMENT] Navigating to: ${url}`);
                            router.push(url);
                          } else {
                            const url = `/assessment/eu/${systemId}`;
                            console.log(`➡️  [MULTI-ASSESSMENT] Navigating to EU form: ${url}`);
                            console.log(`   System ID being passed: ${systemId}`);
                            router.push(url);
                          }
                        }}
                        variant="hero"
                        className="rounded-xl"
                      >
                        Go to {jurisdictionStatuses[currentJurisdictionIndex]?.name} Assessment
                      </Button>
                    )}
                    {jurisdictionStatuses[currentJurisdictionIndex]?.completed && currentJurisdictionIndex < selectedJurisdictions.length - 1 && (
                      <Button
                        onClick={() => {
                          const nextIndex = currentJurisdictionIndex + 1;
                          setCurrentJurisdictionIndex(nextIndex);
                        }}
                        variant="hero"
                        className="rounded-xl mt-4"
                      >
                        Continue to {jurisdictionStatuses[currentJurisdictionIndex + 1]?.name} Assessment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* All Completed Screen */}
          {allCompleted && (
            <Card className="glass-panel shadow-elevated">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  All Assessments Completed!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You have successfully completed all selected jurisdiction assessments.
                </p>
                <Button
                  onClick={() => router.push(`/compliance/multi/${systemId}`)}
                  variant="hero"
                  className="rounded-xl"
                >
                  View All Results
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

