"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  Settings,
  Database,
  Users,
  ListTree,
  HardDrive,
  Cpu,
  Activity,
  Lock,
  Info,
} from "lucide-react";

import { supabase } from "@/utils/supabase/client";
import { backendFetch } from "@/utils/backend-fetch";
import Sidebar from "@/components/sidebar";

import {
  AssessmentCard,
  ProgressStepper,
  ValidationMessage,
} from "@/components/assessment/shared";

import {
  masPageSchemas,
  masRapidPageSchemas,
  getDefaultValues,
  type MasFormValues,
} from "@/components/assessment/mas/masSchema";

import MasPage1Intro from "@/components/assessment/mas/masPage1Intro";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleSwitch } from "@/components/ui/toggle-switch";

type AssessmentMode = "rapid" | "comprehensive";

const comprehensiveSteps = [
  { id: "profile", title: "Profile", icon: <Settings className="h-4 w-4" /> },
  { id: "data", title: "Data", icon: <Database className="h-4 w-4" /> },
  { id: "governance", title: "Governance", icon: <Users className="h-4 w-4" /> },
  { id: "inventory", title: "Inventory", icon: <ListTree className="h-4 w-4" /> },
  { id: "datamgmt", title: "Data Mgmt", icon: <HardDrive className="h-4 w-4" /> },
  { id: "technical", title: "Technical", icon: <Cpu className="h-4 w-4" /> },
  { id: "operational", title: "Operational", icon: <Activity className="h-4 w-4" /> },
  { id: "security", title: "Security", icon: <Lock className="h-4 w-4" /> },
];

const rapidSteps = [
  { id: "profile", title: "Profile", icon: <Settings className="h-4 w-4" /> },
  { id: "rapid", title: "Screening", icon: <Shield className="h-4 w-4" /> },
  { id: "security", title: "Security", icon: <Lock className="h-4 w-4" /> },
];

export default function MasAssessmentPage() {
  const router = useRouter();
  const { systemId, mode: modeParam, multi, common: commonId, completed: prevCompleted } = router.query;

  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>("comprehensive");
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemName, setSystemName] = useState<string | null>(null);
  const [isMultiJurisdiction, setIsMultiJurisdiction] = useState(false);
  const [commonData, setCommonData] = useState<any>(null);
  const [completedJurisdictions, setCompletedJurisdictions] = useState<string[]>([]);

  const steps = useMemo(
    () => (assessmentMode === "rapid" ? rapidSteps : comprehensiveSteps),
    [assessmentMode]
  );

  const pageSchemas = useMemo(
    () => (assessmentMode === "rapid" ? masRapidPageSchemas : masPageSchemas),
    [assessmentMode]
  );

  const methods = useForm<MasFormValues>({
    resolver: zodResolver(pageSchemas[currentPage] as any),
    defaultValues: getDefaultValues(),
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    trigger,
    register,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    console.log("[MAS] Params:", { modeParam, multi, commonId, prevCompleted });

    if (modeParam === "rapid" || modeParam === "comprehensive") {
      setAssessmentMode(modeParam);
    }

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
        console.log("[MAS] Setting completed jurisdictions:", completed);
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
          .select("*")
          .eq("id", systemId as string)
          .single();

        if (systemError) throw new Error(systemError.message);

        setSystemName(systemData.system_name);

        const locations = systemData.data_processing_locations || [];
        const hasSingapore = locations.includes("Singapore");
        const hasEU =
          locations.includes("European Union") ||
          locations.includes("EU") ||
          locations.some((loc: string) =>
            [
              "Austria",
              "Belgium",
              "France",
              "Germany",
              "Ireland",
              "Italy",
              "Netherlands",
              "Spain",
              "Sweden",
            ].some((c) => c.toLowerCase() === loc.toLowerCase())
          );
        const hasUK = locations.includes("United Kingdom") || locations.includes("UK");

        setIsMultiJurisdiction(hasSingapore && (hasEU || hasUK));

        if (hasSingapore && (hasEU || hasUK)) {
          setCurrentPage(1);
        }

        let jurisdiction = "";
        if (locations.includes("Singapore")) {
          jurisdiction = "Singapore";
        } else if (locations.length > 0) {
          jurisdiction = locations.join(", ");
        }

        reset(
          getDefaultValues({
            system_name: systemData.system_name,
            description: systemData.description,
            sector: systemData.sector,
            system_status: systemData.system_status,
            business_use_case: systemData.business_use_case,
            owner: systemData.company_name,
            jurisdiction,
          })
        );
      } catch (err: any) {
        console.error("Error loading assessment:", err);
        setError(err.message || "Failed to load assessment");
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessment();
  }, [router.isReady, systemId, reset]);

  const handleModeChange = (mode: AssessmentMode) => {
    setAssessmentMode(mode);
    setCurrentPage(0);
    router.replace(
      { pathname: router.pathname, query: { ...router.query, mode } },
      undefined,
      { shallow: true }
    );
  };

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      if (currentPage < steps.length - 1) {
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const onSubmit = async (values: MasFormValues) => {
    if (currentPage !== steps.length - 1) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await backendFetch("/api/mas-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_id: systemId,
          system_name: values.system_name,
          company_name: values.owner,
          company_use_case: values.business_use_case,
          assessment_mode: assessmentMode,
          answers: values,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit assessment");
      }

      const data = await response.json();
      const assessmentId = data.id || systemId;

      if (isMultiJurisdiction) {
        // Navigate back to multi-jurisdiction page to continue with next jurisdiction
        const allCompleted = [...completedJurisdictions, "MAS"].filter(Boolean).join(",");
        const redirectUrl = `/assessment/multi/${systemId}?step=jurisdiction-forms&completed=${allCompleted}&mode=${assessmentMode}`;
        console.log("[MAS] Multi-jurisdiction redirect:", redirectUrl);
        router.push(redirectUrl);
      } else {
        router.push(`/mas/${assessmentId}`);
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
              className="mt-4 rounded-xl"
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

  const isLastPage = currentPage === steps.length - 1;

  const ToggleField = ({
    name,
    label,
    description,
  }: {
    name: keyof MasFormValues | "accountability_roles";
    label: string;
    description?: string;
  }) => {
    const checked = Boolean(watch(name as any));
    return (
      <ToggleSwitch
        checked={checked}
        onChange={(val) => setValue(name as any, val, { shouldValidate: true, shouldDirty: true })}
        label={label}
        description={description}
      />
    );
  };

  const AreaField = ({
    name,
    label,
    placeholder,
  }: {
    name: keyof MasFormValues | "accountability_roles";
    label: string;
    placeholder?: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm text-foreground">{label}</Label>
      <Textarea
        {...register(name as any)}
        placeholder={placeholder}
        className="min-h-[90px] rounded-xl"
      />
      {(errors as any)?.[name]?.message && (
        <p className="text-xs text-red-500">{String((errors as any)[name].message)}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{steps[currentPage]?.title} | MAS Assessment</title>
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
                      MAS AI Risk Management{" "}
                      {assessmentMode === "rapid" ? "Quick Scan" : "Deep Review"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {systemName || "Complete all required questions"}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={assessmentMode === "rapid" ? "secondary" : "default"}
                  className="text-xs"
                >
                  {assessmentMode === "rapid" ? "~5 min" : "~30 min"}
                </Badge>
              </div>

              <div className="mb-8">
                <ProgressStepper
                  steps={steps}
                  currentStep={currentPage}
                  onStepClick={setCurrentPage}
                  variant="compact"
                />
              </div>

              {assessmentMode === "rapid" && (
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Quick Scan:</strong> This provides a preliminary assessment based on
                    FEAT principles. Run Deep Review for comprehensive coverage.
                  </AlertDescription>
                </Alert>
              )}

              <div className="mb-8">
                {currentPage === 0 && (
                  <MasPage1Intro
                    assessmentMode={assessmentMode}
                    onModeChange={handleModeChange}
                  />
                )}

                {currentPage >= 1 && (
                  <AssessmentCard
                    title={steps[currentPage]?.title || "Assessment"}
                    description={`Section ${currentPage + 1} of ${steps.length}`}
                    icon={steps[currentPage]?.icon}
                  >
                    <div className="space-y-4">
                      {assessmentMode === "rapid" && currentPage === 1 && (
                        <>
                          <ToggleField
                            name="uses_personal_data"
                            label="Uses Personal Data"
                            description="Quick signal for privacy and governance risk."
                          />
                          <ToggleField
                            name="governance_policy"
                            label="Governance Policy Documented"
                            description="Whether AI governance policy/framework is in place."
                          />
                          <ToggleField
                            name="human_oversight"
                            label="Human Oversight Defined"
                            description="Human-in-the-loop/human-on-the-loop control."
                          />
                          <ToggleField
                            name="security_measures"
                            label="Security Measures Implemented"
                            description="Core cybersecurity controls for this system."
                          />
                          <AreaField
                            name="accountability_roles"
                            label="Accountability Statement"
                            placeholder="Who is accountable, who approves, and who monitors this system."
                          />
                        </>
                      )}

                      {assessmentMode === "rapid" && currentPage === 2 && (
                        <>
                          <AreaField
                            name="accountable_person"
                            label="Accountable Person (Required)"
                            placeholder="Name and role of the accountable owner."
                          />
                          <AreaField
                            name="security_incident_response"
                            label="Incident Response Plan"
                            placeholder="How incidents are detected, escalated, and resolved."
                          />
                          <AreaField
                            name="monitoring_metrics"
                            label="Monitoring Metrics"
                            placeholder="Key runtime/model risk metrics tracked continuously."
                          />
                        </>
                      )}

                      {assessmentMode === "comprehensive" && currentPage === 1 && (
                        <>
                          <ToggleField name="uses_personal_data" label="Uses Personal Data" />
                          {watch("uses_personal_data") && <AreaField name="personal_data_types" label="Personal Data Types" />}
                          <ToggleField name="uses_special_category_data" label="Uses Special Category Data" />
                          {watch("uses_special_category_data") && <AreaField name="sensitive_data_types" label="Sensitive Data Types" />}
                          <ToggleField name="uses_third_party_ai" label="Uses Third-Party AI Services" />
                          {watch("uses_third_party_ai") && (
                            <>
                              <AreaField name="third_party_services_list" label="Third-Party Services" />
                              <AreaField name="third_party_services_safety" label="Third-Party Safety & Data Handling" />
                            </>
                          )}
                        </>
                      )}

                      {assessmentMode === "comprehensive" && currentPage === 2 && (
                        <>
                          <ToggleField name="governance_policy" label="Governance Policy in Place" />
                          {watch("governance_policy") && (
                            <>
                              <AreaField name="governance_policy_type" label="Policy Type" />
                              <AreaField name="governance_framework" label="Framework/Standard Followed" />
                              <AreaField name="governance_board_role" label="Board Role" />
                              <AreaField name="governance_senior_management" label="Senior Management Role" />
                              <AreaField name="governance_risk_appetite" label="Risk Appetite Statement" />
                              <AreaField name="governance_escalation_procedures" label="Escalation Procedures" />
                            </>
                          )}
                        </>
                      )}

                      {assessmentMode === "comprehensive" && currentPage === 3 && (
                        <>
                          <ToggleField name="inventory_recorded" label="System Recorded in AI Inventory" />
                          {watch("inventory_recorded") && (
                            <>
                              <AreaField name="inventory_location" label="Inventory Location" />
                              <AreaField name="inventory_risk_classification" label="Risk Classification" />
                              <AreaField name="inventory_update_frequency" label="Inventory Update Frequency" />
                              <AreaField name="inventory_risk_methodology" label="Risk Methodology" />
                              <AreaField name="inventory_critical_systems" label="Critical Systems Criteria" />
                            </>
                          )}
                        </>
                      )}

                      {assessmentMode === "comprehensive" && currentPage === 4 && (
                        <>
                          <ToggleField name="data_quality_checks" label="Data Quality Checks Implemented" />
                          {watch("data_quality_checks") && (
                            <>
                              <AreaField name="data_quality_methods" label="Data Quality Methods" />
                              <AreaField name="data_bias_analysis" label="Bias Analysis Approach" />
                            </>
                          )}
                          <ToggleField name="data_lineage_tracking" label="Data Lineage Tracking" />
                          {watch("data_lineage_tracking") && <AreaField name="data_retention_policies" label="Data Retention Policies" />}
                          <ToggleField name="data_dpia_conducted" label="DPIA Conducted" />
                          <ToggleField name="data_cross_border" label="Cross-Border Data Transfer" />
                          {watch("data_cross_border") && <AreaField name="data_cross_border_safeguards" label="Cross-Border Safeguards" />}
                        </>
                      )}

                      {assessmentMode === "comprehensive" && currentPage === 5 && (
                        <>
                          <ToggleField name="transparency_docs" label="Transparency Documentation Available" />
                          {watch("transparency_docs") && <AreaField name="transparency_doc_types" label="Documentation Types" />}
                          <ToggleField name="transparency_model_cards" label="Model Cards Maintained" />
                          {watch("transparency_model_cards") && <AreaField name="transparency_explainability_methods" label="Explainability Methods" />}
                          <ToggleField name="fairness_testing" label="Fairness Testing Performed" />
                          {watch("fairness_testing") && (
                            <>
                              <AreaField name="fairness_testing_methods" label="Fairness Testing Methods" />
                              <AreaField name="fairness_metrics_used" label="Fairness Metrics" />
                            </>
                          )}
                          <ToggleField name="human_oversight" label="Human Oversight Implemented" />
                          {watch("human_oversight") && (
                            <>
                              <AreaField name="human_oversight_type" label="Human Oversight Type" />
                              <AreaField name="human_oversight_processes" label="Human Oversight Processes" />
                            </>
                          )}
                        </>
                      )}

                      {assessmentMode === "comprehensive" && currentPage === 6 && (
                        <>
                          <ToggleField name="third_party_controls" label="Third-Party Controls in Place" />
                          {watch("third_party_controls") && <AreaField name="third_party_due_diligence" label="Third-Party Due Diligence" />}
                          <ToggleField name="algo_documented" label="Algorithms & Features Documented" />
                          {watch("algo_documented") && <AreaField name="algo_documentation_location" label="Documentation Location" />}
                          <ToggleField name="evaluation_testing" label="Evaluation & Testing Performed" />
                          {watch("evaluation_testing") && (
                            <>
                              <AreaField name="evaluation_methods" label="Evaluation Methods" />
                              <AreaField name="evaluation_frequency" label="Evaluation Frequency" />
                            </>
                          )}
                        </>
                      )}

                      {assessmentMode === "comprehensive" && currentPage === 7 && (
                        <>
                          <ToggleField name="security_measures" label="Security Measures Implemented" />
                          {watch("security_measures") && <AreaField name="security_measures_details" label="Security Control Details" />}
                          <AreaField name="security_incident_response" label="Incident Response Process" />
                          <ToggleField name="monitoring_plan" label="Monitoring Plan Defined" />
                          {watch("monitoring_plan") && <AreaField name="monitoring_metrics" label="Monitoring Metrics" />}
                          <ToggleField name="capability_training" label="Capability/Training Program Active" />
                          {watch("capability_training") && <AreaField name="capability_training_details" label="Training Program Details" />}
                          <ToggleField name="financial_regulatory_reporting" label="Regulatory Reporting Required" />
                          {watch("financial_regulatory_reporting") && <AreaField name="financial_reporting_details" label="Reporting Details" />}
                          <AreaField name="accountable_person" label="Accountable Person (Required)" />
                        </>
                      )}
                    </div>
                  </AssessmentCard>
                )}
              </div>

              {error && (
                <ValidationMessage type="error" message={error} className="mb-6" />
              )}

              <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentPage === 0}
                  className="rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  {!isLastPage ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="rounded-xl bg-primary"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
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
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
