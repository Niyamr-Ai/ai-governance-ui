"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import { Shield, ArrowLeft, Loader2, AlertTriangle, Check, Info } from "lucide-react";

import { supabase } from "@/utils/supabase/client";
import { backendFetch } from "@/utils/backend-fetch";
import Sidebar from "@/components/sidebar";

import {
  AssessmentCard,
  QuestionCard,
  ModeSelector,
  StyledRadio,
  StyledCheckbox,
  AutoSaveIndicator,
  ValidationMessage,
} from "@/components/assessment/shared";

import {
  euQuestions,
  getQuestionsForMode,
  getSectionsWithQuestions,
  type Question,
} from "@/components/assessment/eu/euQuestions";

import {
  getSchemaForMode,
  getDefaultValues,
  type EuFormValues,
} from "@/components/assessment/eu/euSchema";

import { useAutoSave } from "@/hooks/useAutoSave";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type AssessmentMode = "rapid" | "comprehensive";

export default function EUAssessmentPage() {
  const router = useRouter();
  const { systemId, mode: modeParam, multi, common: commonId, completed: prevCompleted } = router.query;

  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemName, setSystemName] = useState<string | null>(null);
  const [existingAssessmentId, setExistingAssessmentId] = useState<string | null>(null);
  const [isMultiJurisdiction, setIsMultiJurisdiction] = useState(false);
  const [commonData, setCommonData] = useState<any>(null);
  const [completedJurisdictions, setCompletedJurisdictions] = useState<string[]>([]);

  const schema = getSchemaForMode(assessmentMode || "comprehensive");

  const methods = useForm<EuFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: getDefaultValues("comprehensive"),
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors, isValid },
    trigger,
  } = methods;

  useEffect(() => {
    if (modeParam === "rapid" || modeParam === "comprehensive") {
      setAssessmentMode(modeParam);
    }

    console.log("[EU] Params:", { modeParam, multi, commonId, prevCompleted });

    // Check if this is part of multi-jurisdiction flow
    if (multi === "true") {
      setIsMultiJurisdiction(true);

      // Load common data from localStorage
      if (commonId) {
        const stored = localStorage.getItem(`multi_${commonId}_common`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setCommonData(parsed);
          } catch (e) {
            console.error("Failed to parse common data:", e);
          }
        }
      }

      // Load previously completed jurisdictions
      if (prevCompleted && typeof prevCompleted === "string") {
        const completed = prevCompleted.split(",").filter(Boolean);
        console.log("[EU] Setting completed jurisdictions:", completed);
        setCompletedJurisdictions(completed);
      }
    }
  }, [modeParam, multi, commonId, prevCompleted]);

  useEffect(() => {
    if (!router.isReady || !systemId) return;

    const loadAssessment = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: systemData, error: systemError } = await supabase
          .from("ai_systems")
          .select("id, system_name, description, company_name")
          .eq("id", systemId as string)
          .maybeSingle();

        if (systemError) throw new Error(systemError.message);
        if (!systemData) throw new Error("System not found");

        setSystemName(systemData.system_name);

        const { data: assessment, error: assessmentError } = await supabase
          .from("eu_assessments")
          .select("id, answers")
          .eq("system_id", systemId as string)
          .maybeSingle();

        if (assessmentError && assessmentError.code !== "PGRST116") {
          console.warn("Error loading assessment:", assessmentError);
        }

        if (assessment) {
          setExistingAssessmentId(assessment.id);
          reset(assessment.answers);
        } else {
          const defaults = getDefaultValues("comprehensive", {
            q2: systemData.description,
            q10: systemData.company_name,
          });
          reset(defaults);
        }
      } catch (err: any) {
        console.error("Error loading assessment:", err);
        setError(err.message || "Failed to load assessment");
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessment();
  }, [router.isReady, systemId, reset]);

  const handleAutoSave = useCallback(
    async (data: any) => {
      if (!systemId || !assessmentMode) return;

      try {
        const response = await backendFetch("/api/assessments/eu/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_id: systemId,
            assessment_mode: assessmentMode,
            answers: data,
            draft_id: existingAssessmentId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.id) {
            setExistingAssessmentId(result.id);
          }
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
        throw error;
      }
    },
    [systemId, assessmentMode, existingAssessmentId]
  );

  const { status: saveStatus, lastSaved, saveNow } = useAutoSave({
    watch,
    getValues,
    onSave: handleAutoSave,
    interval: 30000,
    debounceMs: 2000,
  });

  const handleModeSelect = (mode: AssessmentMode) => {
    setAssessmentMode(mode);
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, mode },
      },
      undefined,
      { shallow: true }
    );
  };

  const onSubmit = async (values: EuFormValues) => {
    if (!systemId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await backendFetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_id: systemId,
          system_name: systemName || "Unnamed System",
          assessment_mode: assessmentMode,
          ...values,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit assessment");
      }

      const data = await response.json();
      const assessmentResultId = data.id || systemId;

      const { data: systemData } = await supabase
        .from("ai_systems")
        .select("data_processing_locations")
        .eq("id", systemId as string)
        .single();

      const locations = systemData?.data_processing_locations || [];
      const hasEU = locations.some(
        (loc: string) =>
          loc === "European Union" ||
          loc === "EU" ||
          [
            "Austria",
            "Belgium",
            "Bulgaria",
            "Croatia",
            "Cyprus",
            "Czechia",
            "Denmark",
            "Estonia",
            "Finland",
            "France",
            "Germany",
            "Greece",
            "Hungary",
            "Ireland",
            "Italy",
            "Latvia",
            "Lithuania",
            "Luxembourg",
            "Malta",
            "Netherlands",
            "Poland",
            "Portugal",
            "Romania",
            "Slovakia",
            "Slovenia",
            "Spain",
            "Sweden",
          ].some((c) => c.toLowerCase() === loc.toLowerCase())
      );

      const hasOther = locations.includes("United Kingdom") || locations.includes("Singapore");

      if (isMultiJurisdiction) {
        // Navigate back to multi-jurisdiction page to continue with next jurisdiction
        const allCompleted = [...completedJurisdictions, "EU"].filter(Boolean).join(",");
        const redirectUrl = `/assessment/multi/${systemId}?step=jurisdiction-forms&completed=${allCompleted}&mode=${assessmentMode}`;
        console.log("[EU] Multi-jurisdiction redirect:", redirectUrl);
        router.push(redirectUrl);
      } else if (hasEU && hasOther) {
        router.push(
          `/assessment/multi/${systemId}?completed=EU&assessmentId=${assessmentResultId}&mode=${assessmentMode}`
        );
      } else {
        router.push(`/compliance/${assessmentResultId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>Loading Assessment | AI Governance</title>
        </Head>
        <Sidebar onLogout={handleLogout} />
        <div className="lg:pl-72 pt-16 lg:pt-24 px-4">
          <div className="max-w-4xl mx-auto py-12 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading assessment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !methods.formState.isDirty) {
    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>Error | AI Governance</title>
        </Head>
        <Sidebar onLogout={handleLogout} />
        <div className="lg:pl-72 pt-16 lg:pt-24 px-4">
          <div className="max-w-4xl mx-auto py-12">
            <ValidationMessage type="error" message={error} />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessmentMode) {
    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>Select Mode | EU AI Act Assessment</title>
        </Head>
        <Sidebar onLogout={handleLogout} />
        <div className="lg:pl-72 pt-16 lg:pt-24 px-4">
          <div className="max-w-4xl mx-auto py-12">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">EU AI Act Assessment</h1>
                  <p className="text-muted-foreground">
                    {systemName || "Choose your assessment mode to begin"}
                  </p>
                </div>
              </div>
            </div>

            <ModeSelector
              value={null}
              onChange={handleModeSelect}
              rapidLabel="Quick Scan"
              comprehensiveLabel="Deep Review"
            />

            <Button
              variant="ghost"
              className="mt-8"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel and Return
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sections = getSectionsWithQuestions(assessmentMode);
  const questions = getQuestionsForMode(assessmentMode);

  const formValues = watch();
  const visibleQuestions = questions.filter((q) => {
    if (!q.conditional) return true;
    return formValues[q.conditional.dependsOn as keyof EuFormValues] === q.conditional.value;
  });

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>
          {assessmentMode === "rapid" ? "Quick Scan" : "Deep Review"} | EU AI Act
        </title>
      </Head>
      <Sidebar onLogout={handleLogout} />

      <div className="lg:pl-72 pt-16 lg:pt-24 px-4">
        <div className="max-w-4xl mx-auto py-8">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      EU AI Act{" "}
                      {assessmentMode === "rapid" ? "Quick Scan" : "Deep Review"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {systemName || "Complete all required questions"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved || undefined} />
                </div>
              </div>

              {assessmentMode === "rapid" && (
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Quick Scan:</strong> This provides a preliminary risk classification
                    based on core indicators. Run Deep Review for full regulatory compliance.
                  </AlertDescription>
                </Alert>
              )}

              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-xs">
                      Section {sectionIndex + 1} of {sections.length}
                    </Badge>
                    <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                  </div>

                  <div className="space-y-4">
                    {section.questions.map((question, questionIndex) => {
                      const dependentValue = question.conditional ? formValues[question.conditional.dependsOn as keyof EuFormValues] : undefined;
                      if (
                        question.conditional &&
                        dependentValue !== question.conditional.value
                      ) {
                        return null;
                      }

                      const globalIndex = visibleQuestions.indexOf(question) + 1;
                      const fieldError = errors[question.id as keyof EuFormValues];
                      const errorMessage = fieldError?.message as string | undefined;

                      return (
                        <QuestionCard
                          key={question.id}
                          id={question.id}
                          title={question.title}
                          description={question.description}
                          type={question.type as "text" | "radio" | "checkbox"}
                          priority={question.priority}
                          required={question.required}
                          helperText={question.helpText}
                          questionNumber={globalIndex}
                          totalQuestions={visibleQuestions.length}
                          error={errorMessage}
                        >
                          {question.type === "textarea" && (
                            <Textarea
                              {...methods.register(question.id as keyof EuFormValues)}
                              placeholder={question.placeholder}
                              className="min-h-[100px] rounded-xl"
                            />
                          )}

                          {question.type === "text" && (
                            <Textarea
                              {...methods.register(question.id as keyof EuFormValues)}
                              placeholder={question.placeholder}
                              className="min-h-[60px] rounded-xl"
                            />
                          )}

                          {question.type === "radio" && question.options && (
                            <StyledRadio
                              name={question.id}
                              options={question.options.map((opt) => ({
                                value: opt.value,
                                label: opt.label,
                                description: opt.description,
                              }))}
                            />
                          )}

                          {question.type === "checkbox" && question.options && (
                            <StyledCheckbox
                              name={question.id}
                              options={question.options.map((opt) => ({
                                value: opt.value,
                                label: opt.label,
                                description: opt.description,
                              }))}
                              orientation="grid"
                              noneOption="none"
                            />
                          )}
                        </QuestionCard>
                      );
                    })}
                  </div>
                </div>
              ))}

              {error && (
                <ValidationMessage type="error" message={error} className="mb-6" />
              )}

              <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAssessmentMode(null)}
                    className="rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Change Mode
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => saveNow()}
                    disabled={saveStatus === "saving"}
                    className="rounded-xl"
                  >
                    {saveStatus === "saving" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Save Draft
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Submit Assessment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
