"use client";

import { useState, useEffect, useMemo } from "react";
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
  Eye,
  Scale,
  UserCheck,
  MessageSquare,
  Box,
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
  ukPageSchemas,
  ukRapidPageSchemas,
  getDefaultValues,
  type UkFormValues,
} from "@/components/assessment/uk/ukSchema";

import UkPage0SystemProfile from "@/components/assessment/uk/ukPage0SystemProfile";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Info } from "lucide-react";

type AssessmentMode = "rapid" | "comprehensive";

const comprehensiveSteps = [
  { id: "profile", title: "Profile", icon: <Settings className="h-4 w-4" /> },
  { id: "safety", title: "Safety", icon: <Shield className="h-4 w-4" /> },
  { id: "transparency", title: "Transparency", icon: <Eye className="h-4 w-4" /> },
  { id: "fairness", title: "Fairness", icon: <Scale className="h-4 w-4" /> },
  { id: "accountability", title: "Accountability", icon: <UserCheck className="h-4 w-4" /> },
  { id: "contestability", title: "Contestability", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "foundation", title: "Foundation", icon: <Box className="h-4 w-4" /> },
];

const rapidSteps = [
  { id: "profile", title: "Profile", icon: <Settings className="h-4 w-4" /> },
  { id: "rapid", title: "Screening", icon: <Shield className="h-4 w-4" /> },
  { id: "foundation", title: "Foundation", icon: <Box className="h-4 w-4" /> },
];

export default function UkAssessmentPage() {
  const router = useRouter();
  const { systemId, mode: modeParam, multi, common: commonId, prev, completed: prevCompleted } = router.query;

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
    () => (assessmentMode === "rapid" ? ukRapidPageSchemas : ukPageSchemas),
    [assessmentMode]
  );

  const methods = useForm<UkFormValues>({
    resolver: zodResolver(pageSchemas[currentPage] as any),
    defaultValues: getDefaultValues(),
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    watch,
    register,
    setValue,
    trigger,
    formState: { errors },
  } = methods;

  useEffect(() => {
    console.log("[UK] Params:", { modeParam, multi, commonId, prevCompleted });

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
        console.log("[UK] Setting completed jurisdictions:", completed);
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
        const hasUK = locations.includes("United Kingdom") || locations.includes("UK");
        const hasEU = locations.includes("European Union") || locations.includes("EU");
        const hasSingapore = locations.includes("Singapore");

        setIsMultiJurisdiction(hasUK && (hasEU || hasSingapore));

        if (hasUK && (hasEU || hasSingapore)) {
          setCurrentPage(1);
        }

        let jurisdiction = "";
        if (locations.includes("United Kingdom") || locations.includes("UK")) {
          jurisdiction = "United Kingdom";
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

  const onSubmit = async (values: UkFormValues) => {
    if (currentPage !== steps.length - 1) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Merge common data with jurisdiction-specific answers
      const mergedValues = commonData ? {
        ...values,
        system_name: values.system_name || commonData.systemName,
        owner: values.owner || commonData.companyName,
        business_use_case: values.business_use_case || commonData.businessUseCase,
        description: values.description || commonData.description,
      } : values;

      const response = await backendFetch("/api/uk-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_id: systemId,
          system_name: mergedValues.system_name,
          company_name: mergedValues.owner,
          company_use_case: mergedValues.business_use_case,
          assessment_mode: assessmentMode,
          answers: mergedValues,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit assessment");
      }

      const data = await response.json();
      const assessmentId = data.id || systemId;

      if (isMultiJurisdiction) {
        // Navigate back to multi-jurisdiction page to continue with next jurisdiction
        const allCompleted = [...completedJurisdictions, "UK"].filter(Boolean).join(",");
        const redirectUrl = `/assessment/multi/${systemId}?step=jurisdiction-forms&completed=${allCompleted}&mode=${assessmentMode}`;
        console.log("[UK] Multi-jurisdiction redirect:", redirectUrl);
        router.push(redirectUrl);
      } else {
        router.push(`/uk/${assessmentId}`);
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
    name: keyof UkFormValues;
    label: string;
    description?: string;
  }) => {
    const checked = Boolean(watch(name));
    return (
      <ToggleSwitch
        checked={checked}
        onChange={(val) => setValue(name, val, { shouldValidate: true, shouldDirty: true })}
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
    name: keyof UkFormValues;
    label: string;
    placeholder?: string;
  }) => (
    <div className="space-y-1">
      <Label className="text-sm text-foreground">{label}</Label>
      <Textarea {...register(name)} placeholder={placeholder} className="min-h-[88px] rounded-xl" />
      {(errors as any)?.[name]?.message && <p className="text-xs text-red-500">{String((errors as any)[name].message)}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>
          {steps[currentPage]?.title} | UK AI Act Assessment
        </title>
      </Head>
      <Sidebar onLogout={handleLogout} />

      <div className="lg:pl-72 pt-16 lg:pt-24 px-4">
        <div className="max-w-4xl mx-auto py-8">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      UK AI Act {assessmentMode === "rapid" ? "Quick Scan" : "Deep Review"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {systemName || "Complete all required questions"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                </div>
              </div>

              <div className="mb-8">
                <ProgressStepper
                  steps={steps}
                  currentStep={currentPage}
                  onStepClick={setCurrentPage}
                  variant="default"
                />
              </div>

              {assessmentMode === "rapid" && (
                <Alert className="mb-6 bg-purple-50 border-purple-200">
                  <Info className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <strong>Quick Scan:</strong> This provides a preliminary assessment. Run Deep
                    Review for comprehensive compliance analysis.
                  </AlertDescription>
                </Alert>
              )}

              <div className="mb-8">
                {currentPage === 0 && (
                  <UkPage0SystemProfile
                    assessmentMode={assessmentMode}
                    onModeChange={handleModeChange}
                  />
                )}

                {currentPage === 1 && assessmentMode === "comprehensive" && (
                  <AssessmentCard
                    title="Safety, Security & Robustness"
                    description="Ensure your AI system is safe, secure, and robust"
                    icon={<Shield className="h-5 w-5" />}
                  >
                    <div className="space-y-4">
                      <ToggleField name="robustness_testing" label="Robustness Testing and Validation" description="Whether structured robustness tests are run." />
                      {watch("robustness_testing") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                          <AreaField name="robustness_testing_methods" label="Testing Methods" placeholder="e.g., Unit tests, integration tests, stress tests." />
                          <AreaField name="robustness_testing_frequency_text" label="Testing Frequency" placeholder="e.g., Before release, monthly, quarterly." />
                          <AreaField name="robustness_test_results" label="Latest Test Results Summary" placeholder="Brief summary of key results and failures." />
                        </div>
                      )}

                      <ToggleField name="red_teaming" label="Red Teaming / Adversarial Testing" />
                      {watch("red_teaming") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                          <AreaField name="red_teaming_who" label="Who Conducts Red Teaming" placeholder="Internal team, external specialists, or hybrid." />
                          <AreaField name="red_teaming_methodology" label="Methodology" placeholder="Describe attack simulation methods." />
                          <AreaField name="red_teaming_findings" label="Key Findings" placeholder="Key vulnerabilities and remediation outcomes." />
                        </div>
                      )}

                      <ToggleField name="misuse_prevention" label="Misuse Prevention Controls" />
                      {watch("misuse_prevention") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                          <AreaField name="misuse_prevention_measures" label="Control Measures" placeholder="Access controls, abuse filters, guardrails, etc." />
                          <AreaField name="misuse_monitoring" label="Misuse Monitoring Approach" placeholder="How misuse is detected and escalated." />
                        </div>
                      )}

                      <ToggleField name="cybersecurity" label="Cybersecurity Controls" />
                      {watch("cybersecurity") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                          <AreaField name="cybersecurity_controls" label="Cybersecurity Controls" placeholder="Encryption, IAM, network segmentation, etc." />
                          <AreaField name="cybersecurity_incident_response" label="Incident Response Plan" placeholder="Detection to resolution playbook." />
                          <AreaField name="cybersecurity_monitoring" label="Security Monitoring" placeholder="Monitoring stack and alerting process." />
                        </div>
                      )}

                      <ToggleField name="safety_testing" label="Safety Testing Protocols" />
                      {watch("safety_testing") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
                          <AreaField name="safety_testing_protocols" label="Safety Testing Protocols" placeholder="Describe safety testing stages." />
                          <AreaField name="safety_validation_methods" label="Safety Validation Methods" placeholder="How outcomes are validated before release." />
                        </div>
                      )}
                    </div>
                  </AssessmentCard>
                )}

                {currentPage === 1 && assessmentMode === "rapid" && (
                  <AssessmentCard
                    title="Rapid Risk Screening"
                    description="Quick assessment of key risk indicators"
                    icon={<Shield className="h-5 w-5" />}
                  >
                    <div className="space-y-4">
                      <ToggleField name="robustness_testing" label="Robustness Testing in Place" />
                      <ToggleField name="personal_data_handling" label="Processes Personal or Sensitive Data" />
                      <ToggleField name="human_oversight" label="Human Oversight Defined" />
                      <ToggleField name="accountability_framework" label="Accountability Framework Defined" />
                    </div>
                  </AssessmentCard>
                )}

                {currentPage === 2 && assessmentMode === "comprehensive" && (
                  <AssessmentCard
                    title="Transparency & Explainability"
                    description="How users are informed and how decisions are explained"
                    icon={steps[currentPage]?.icon}
                  >
                    <div className="space-y-4">
                      <ToggleField name="user_disclosure" label="User Disclosure Implemented" />
                      {watch("user_disclosure") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                          <AreaField name="user_disclosure_how" label="How Disclosure Happens" placeholder="In-app notice, policy screen, banner, etc." />
                          <AreaField name="user_disclosure_when" label="When Disclosure Happens" placeholder="Before first use, at each interaction, etc." />
                          <AreaField name="user_disclosure_format" label="Disclosure Format" placeholder="Simple plain-language notice format." />
                        </div>
                      )}

                      <ToggleField name="explainability" label="Explainability Methods Implemented" />
                      {watch("explainability") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                          <AreaField name="explainability_methods" label="Explainability Methods" placeholder="SHAP, feature importance, decision traces, etc." />
                          <AreaField name="explainability_technical_details" label="Technical Detail Level" placeholder="What technical depth is documented." />
                          <AreaField name="explainability_user_types" label="Audience-Specific Explanation" placeholder="How explanations differ for users, auditors, developers." />
                        </div>
                      )}

                      <ToggleField name="documentation" label="Documentation Available" />
                      {watch("documentation") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                          <AreaField name="documentation_types" label="Documentation Types" placeholder="User docs, technical docs, model docs, etc." />
                          <AreaField name="documentation_storage" label="Documentation Storage" placeholder="Where documentation is stored and versioned." />
                          <AreaField name="documentation_update_frequency" label="Update Frequency" placeholder="How often documentation is updated." />
                        </div>
                      )}

                      <ToggleField name="transparency_reports" label="Transparency Reports Published" />
                      {watch("transparency_reports") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-blue-200 bg-blue-50/40 p-3">
                          <AreaField name="transparency_reports_content" label="Report Content" placeholder="What is included in transparency reports." />
                          <AreaField name="transparency_reports_frequency" label="Report Frequency" placeholder="Quarterly, annual, on major release, etc." />
                          <AreaField name="transparency_reports_publication" label="Publication Channel" placeholder="Internal portal, website, regulator filing, etc." />
                        </div>
                      )}
                    </div>
                  </AssessmentCard>
                )}

                {currentPage === 3 && assessmentMode === "comprehensive" && (
                  <AssessmentCard title="Fairness & Data Governance" description="Bias controls, fairness monitoring, and data handling" icon={steps[currentPage]?.icon}>
                    <div className="space-y-4">
                      <ToggleField name="bias_testing" label="Bias Testing Conducted" />
                      {watch("bias_testing") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                          <AreaField name="bias_testing_methodology" label="Bias Testing Methodology" placeholder="Describe methodology." />
                          <AreaField name="bias_testing_tools" label="Bias Testing Tools" placeholder="Tools used for bias checks." />
                          <AreaField name="bias_testing_frequency" label="Bias Testing Frequency" placeholder="When fairness tests are executed." />
                          <AreaField name="bias_testing_results" label="Bias Testing Results" placeholder="Summary of outcomes and unresolved issues." />
                        </div>
                      )}
                      <ToggleField name="discrimination_mitigation" label="Discrimination Mitigation Controls" />
                      {watch("discrimination_mitigation") && <AreaField name="discrimination_mitigation_measures" label="Mitigation Measures" placeholder="How discrimination risk is reduced." />}
                      <ToggleField name="data_quality" label="Data Quality Controls" />
                      {watch("data_quality") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                          <AreaField name="data_quality_checks" label="Data Quality Checks" placeholder="Completeness, consistency, validity checks." />
                          <AreaField name="data_quality_metrics" label="Quality Metrics" placeholder="Metrics used to track data quality." />
                        </div>
                      )}
                      <ToggleField name="fairness_monitoring" label="Fairness Monitoring in Production" />
                      {watch("fairness_monitoring") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                          <AreaField name="fairness_monitoring_processes" label="Monitoring Processes" placeholder="How fairness drift is monitored." />
                          <AreaField name="fairness_monitoring_alerts" label="Alert Mechanisms" placeholder="How alerts are triggered and handled." />
                        </div>
                      )}
                      <ToggleField name="personal_data_handling" label="Personal Data Handling" />
                      {watch("personal_data_handling") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                          <AreaField name="personal_data_types" label="Personal Data Types" placeholder="Types of personal/sensitive data used." />
                          <AreaField name="personal_data_sources" label="Personal Data Sources" placeholder="Data origin and collection process." />
                          <AreaField name="personal_data_retention" label="Retention Policy" placeholder="Retention windows and deletion policy." />
                        </div>
                      )}
                      {(watch("bias_testing") || watch("fairness_monitoring") || watch("data_quality")) && (
                        <AreaField name="data_representativeness" label="Data Representativeness" placeholder="How representative the dataset is." />
                      )}
                      {watch("personal_data_handling") && (
                        <AreaField name="protected_characteristics" label="Protected Characteristics Handling" placeholder="How protected characteristics are considered." />
                      )}
                      {(watch("bias_testing") || watch("fairness_monitoring")) && (
                        <AreaField name="fairness_metrics_used" label="Fairness Metrics Used" placeholder="Metrics used for fairness evaluation." />
                      )}
                    </div>
                  </AssessmentCard>
                )}

                {currentPage === 4 && assessmentMode === "comprehensive" && (
                  <AssessmentCard title="Accountability & Governance" description="Ownership, oversight, auditability, escalation" icon={steps[currentPage]?.icon}>
                    <div className="space-y-4">
                      <ToggleField name="accountability_framework" label="Accountability Framework Defined" />
                      {watch("accountability_framework") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-violet-200 bg-violet-50/40 p-3">
                          <AreaField name="accountability_framework_structure" label="Framework Structure" placeholder="Structure of accountability model." />
                          <AreaField name="accountability_roles" label="Accountability Roles" placeholder="Role-to-responsibility mapping." />
                        </div>
                      )}

                      <ToggleField name="human_oversight" label="Human Oversight in Place" />
                      {watch("human_oversight") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-violet-200 bg-violet-50/40 p-3">
                          <AreaField name="human_oversight_who" label="Who Provides Oversight" placeholder="Teams/roles providing oversight." />
                          <AreaField name="human_oversight_when" label="When Oversight Happens" placeholder="At what decision points oversight is applied." />
                          <AreaField name="human_oversight_how" label="How Oversight Is Executed" placeholder="Workflow for intervention/escalation." />
                        </div>
                      )}

                      <ToggleField name="risk_management" label="Risk Management Process Defined" />
                      {watch("risk_management") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-violet-200 bg-violet-50/40 p-3">
                          <AreaField name="risk_management_processes" label="Risk Processes" placeholder="How risks are identified/tracked." />
                          <AreaField name="risk_management_documentation" label="Risk Documentation" placeholder="Where risk register and records are maintained." />
                        </div>
                      )}

                      <ToggleField name="governance_structure" label="Governance Structure Active" />
                      {watch("governance_structure") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-violet-200 bg-violet-50/40 p-3">
                          <AreaField name="governance_board_involvement" label="Board Involvement" placeholder="Board decision/oversight responsibilities." />
                          <AreaField name="governance_committees" label="Governance Committees" placeholder="Committees and their charter." />
                        </div>
                      )}

                      <ToggleField name="audit_trail" label="Audit Trail Enabled" />
                      {watch("audit_trail") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-violet-200 bg-violet-50/40 p-3">
                          <AreaField name="audit_trail_what" label="What is Logged" placeholder="Decisions, model versions, inputs, outputs." />
                          <AreaField name="audit_trail_retention" label="Retention Duration" placeholder="How long audit logs are retained." />
                          <AreaField name="audit_trail_access" label="Audit Access" placeholder="Who can access and review audit logs." />
                        </div>
                      )}

                      <AreaField name="senior_management_oversight" label="Senior Management Oversight" placeholder="How senior management oversees AI risk." />
                      <ToggleField name="ethics_committee" label="Ethics Committee in Place" />
                      {watch("ethics_committee") && <AreaField name="ethics_committee_details" label="Ethics Committee Details" placeholder="Scope, membership, and review cadence." />}
                      <AreaField name="policy_assignment" label="Policy Assignment" placeholder="Who owns policy maintenance and review." />
                      <AreaField name="training_requirements" label="Training Requirements" placeholder="Mandatory training for relevant staff." />
                      <AreaField name="escalation_procedures" label="Escalation Procedures" placeholder="Escalation paths for model/system risks." />
                      <AreaField name="accountable_person" label="Accountable Person (Required)" placeholder="Name and role of accountable owner." />
                    </div>
                  </AssessmentCard>
                )}

                {currentPage === 5 && assessmentMode === "comprehensive" && (
                  <AssessmentCard title="Contestability & Redress" description="Appeals, complaints, and user rights protections" icon={steps[currentPage]?.icon}>
                    <div className="space-y-4">
                      <ToggleField name="user_rights" label="User Rights Framework Defined" />
                      {watch("user_rights") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-cyan-200 bg-cyan-50/40 p-3">
                          <AreaField name="user_rights_what" label="User Rights Covered" placeholder="What rights are granted to affected users." />
                          <AreaField name="user_rights_communication" label="How Rights Are Communicated" placeholder="How users learn about rights and options." />
                        </div>
                      )}

                      <ToggleField name="appeal_mechanism" label="Appeal Mechanism Available" />
                      {watch("appeal_mechanism") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-cyan-200 bg-cyan-50/40 p-3">
                          <AreaField name="appeal_mechanism_process" label="Appeal Process" placeholder="Steps users take to submit appeals." />
                          <AreaField name="appeal_mechanism_timeline" label="Appeal Timeline" placeholder="Expected response and resolution timeline." />
                          <AreaField name="appeal_mechanism_accessibility" label="Appeal Accessibility" placeholder="Accessibility and language support details." />
                        </div>
                      )}

                      <ToggleField name="redress_process" label="Redress Process Defined" />
                      {watch("redress_process") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-cyan-200 bg-cyan-50/40 p-3">
                          <AreaField name="redress_process_steps" label="Redress Steps" placeholder="Steps from complaint to redress closure." />
                          <AreaField name="redress_compensation" label="Compensation Process" placeholder="If applicable, how compensation is determined." />
                          <AreaField name="redress_documentation" label="Redress Documentation" placeholder="How redress outcomes are recorded." />
                        </div>
                      )}

                      <ToggleField name="complaint_handling" label="Complaint Handling Process" />
                      {watch("complaint_handling") && (
                        <div className="ml-2 grid gap-3 rounded-xl border border-cyan-200 bg-cyan-50/40 p-3">
                          <AreaField name="complaint_handling_procedures" label="Complaint Procedures" placeholder="Complaint intake and handling steps." />
                          <AreaField name="complaint_response_time" label="Response Time Targets" placeholder="SLA/response commitments." />
                          <AreaField name="complaint_tracking" label="Complaint Tracking" placeholder="System for tracking complaint status/outcomes." />
                        </div>
                      )}

                      {watch("appeal_mechanism") && (
                        <AreaField name="appeal_success_rates" label="Appeal Success Rates" placeholder="How appeal outcomes are measured." />
                      )}
                      {watch("redress_process") && (
                        <AreaField name="redress_outcomes_tracking" label="Redress Outcome Tracking" placeholder="How you track long-term redress outcomes." />
                      )}
                    </div>
                  </AssessmentCard>
                )}

                {currentPage === 6 && assessmentMode === "comprehensive" && (
                  <AssessmentCard title="Foundation Models & High-Impact" description="Additional controls for foundation/high-impact systems" icon={steps[currentPage]?.icon}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-foreground">Is this a foundation or high-impact model?</Label>
                        <Select
                          value={watch("foundation_model") || "no"}
                          onValueChange={(value) => setValue("foundation_model", value as any, { shouldValidate: true, shouldDirty: true })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border shadow-lg">
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="unsure">Unsure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(watch("foundation_model") === "yes" || watch("foundation_model") === "unsure") && (
                        <div className="grid gap-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3">
                          <ToggleField name="foundation_model_cards" label="Model Cards Maintained" />
                          {watch("foundation_model_cards") && (
                            <AreaField name="foundation_model_documentation" label="Model Card Documentation" placeholder="Describe model card artifacts and coverage." />
                          )}
                          <AreaField name="foundation_model_capability_testing" label="Capability Testing" placeholder="Capability testing methods and outcomes." />
                          <AreaField name="foundation_model_risk_assessment" label="Risk Assessment" placeholder="Foundation/high-impact-specific risk analysis." />
                          <AreaField name="foundation_model_deployment_restrictions" label="Deployment Restrictions" placeholder="Any deployment constraints or gating." />
                          <AreaField name="foundation_model_monitoring" label="Monitoring Requirements" placeholder="Post-deployment monitoring strategy." />
                        </div>
                      )}

                      <ToggleField name="regulatory_sandbox" label="Regulatory Sandbox Participation" />
                      {watch("regulatory_sandbox") && (
                        <AreaField name="regulatory_sandbox_details" label="Sandbox Details" placeholder="Participation details and outcomes." />
                      )}
                      <AreaField name="sector_specific_requirements" label="Sector-Specific Requirements" placeholder="FCA, MHRA, Ofcom, or other sector requirements." />
                    </div>
                  </AssessmentCard>
                )}

                {currentPage === 2 && assessmentMode === "rapid" && (
                  <AssessmentCard
                    title="Foundation Models & High-Impact"
                    description="Assessment for foundation models"
                    icon={<Box className="h-5 w-5" />}
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-foreground">Foundation or High-Impact Model</Label>
                        <Select
                          value={watch("foundation_model") || "no"}
                          onValueChange={(value) => setValue("foundation_model", value as any, { shouldValidate: true, shouldDirty: true })}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select option" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border shadow-lg">
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="unsure">Unsure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <ToggleField name="regulatory_sandbox" label="Regulatory Sandbox Participation" />
                      {watch("regulatory_sandbox") && (
                        <AreaField name="regulatory_sandbox_details" label="Sandbox Details" placeholder="Describe participation and controls." />
                      )}
                      <AreaField name="sector_specific_requirements" label="Sector-Specific Requirements" placeholder="Applicable sector-specific requirements." />
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
