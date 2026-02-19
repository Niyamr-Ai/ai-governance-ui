// FORCE LOG ON FILE LOAD
console.log(`\n${'='.repeat(80)}`);
console.log(`📄 [EU-ASSESSMENT] FILE LOADED: pages/assessment/eu/[systemId].tsx`);
console.log(`   Timestamp: ${new Date().toISOString()}`);
console.log(`${'='.repeat(80)}\n`);

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { Formik } from "formik";
import * as Yup from "yup";

// Assessment Modes
type AssessmentMode = 'rapid' | 'comprehensive';

// EU AI Act Validation Schema
const comprehensiveSchema = Yup.object({
  q1: Yup.string()
    .oneOf(["yes", "no"], "Please indicate whether your AI system affects users in the European Union")
    .required("Please indicate whether your AI system affects users in the European Union"),

  q2: Yup.string()
    .required("Please describe what your AI system does. Enter null if nothing to show"),

  q3: Yup.array()
    .min(1, "Please select at least one option for how your company uses or provides the AI system")
    .required("Please select how your company uses or provides the AI system"),

  q4: Yup.array()
    .min(1, "Please select at least one option or 'None of the above'")
    .required("Please indicate what activities your AI system performs"),

  q5: Yup.array()
    .min(1, "Please select at least one option or 'None of the above'")
    .required("Please indicate if your AI system does any banned or controversial activities"),

  q6: Yup.array()
    .min(1, "Please select at least one option or 'None of these'")
    .required("Please indicate which risk management actions have been taken"),

  q7: Yup.string()
    .oneOf(["yes", "no"], "Please indicate whether your AI system interacts with people or creates synthetic content")
    .required("Please indicate whether your AI system interacts with people or creates synthetic content"),

  q7a: Yup.string().when("q7", {
    is: "yes",
    then: (s) =>
      s.required("Please describe how users are informed it's AI. Enter null if nothing to show"),
  }),

  q8: Yup.string()
    .oneOf(["yes", "partial", "no"], "Please indicate assessment completion status")
    .required("Please indicate whether assessments have been completed"),

  q9: Yup.array()
    .min(1, "Please select at least one option or 'None of these'")
    .required("Please indicate which accountability and governance measures have been implemented"),

  q10: Yup.string()
    .required("Please specify who is accountable for this AI system. Enter null if nothing to show"),
});

const rapidSchema = Yup.object({
  q1: Yup.string()
    .oneOf(["yes", "no"], "Required")
    .required("Required"),
  q2: Yup.string()
    .required("Required"),
  q4: Yup.array()
    .min(1, "Required")
    .required("Required"),
  q5: Yup.array()
    .min(1, "Required")
    .required("Required"),
  q7: Yup.string()
    .oneOf(["yes", "no"], "Required")
    .required("Required"),
  q7a: Yup.string().when("q7", {
    is: "yes",
    then: (s) => s.required("Required"),
  }),
  q10: Yup.string()
    .required("Required"),
});

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
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";
import { backendFetch } from "@/utils/backend-fetch";
import Head from 'next/head';



// EU AI Act Questions
const euQuestions = [
  {
    id: "q1",
    title: "Does your AI system affect users in the European Union?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "q2",
    title: "In one or two lines, what does your AI system do?",
    type: "text",
  },
  {
    id: "q3",
    title: "Which of these best describe how your company uses or provides the AI system?",
    type: "checkbox",
    options: [
      { value: "provider", label: "We build the AI system (Provider)" },
      { value: "deployer", label: "We use the AI system (Deployer)" },
      { value: "importer", label: "We import AI models/tools into the EU (Importer)" },
      { value: "distributor", label: "We resell or redistribute AI tools (Distributor)" },
    ],
  },
  {
    id: "q4",
    title: "Does your AI system do any of the following?",
    type: "checkbox",
    options: [
      { value: "job_decision", label: "Help decide who gets a job or promotion" },
      { value: "credit_scoring", label: "Score people for loans or credit" },
      { value: "education_eval", label: "Teach or evaluate students" },
      { value: "facial_recognition", label: "Identify people using facial recognition" },
      { value: "border_screening", label: "Screen people at borders" },
      { value: "machine_safety", label: "Control safety in machines or vehicles" },
      { value: "none", label: "None of the above" },
    ],
  },
  {
    id: "q5",
    title: "Does your AI system do any of these banned or controversial things?",
    type: "checkbox",
    options: [
      { value: "subliminal", label: "Influence users without their awareness (e.g., subliminal tricks)" },
      { value: "social_scoring", label: "Score people's behaviour or trustworthiness (social scoring)" },
      { value: "facial_scraping", label: "Use facial recognition from the open web" },
      { value: "emotion_tracking", label: "Track emotions at work or school" },
      { value: "biometric_grouping", label: "Group people by race, sexuality, or religion using biometrics" },
      { value: "none", label: "None of the above" },
    ],
  },
  {
    id: "q6",
    title: "Which of these have you already done or are planning to do?",
    type: "checkbox",
    options: [
      { value: "risk_management", label: "We have a risk management or mitigation process" },
      { value: "bias_checking", label: "We check for bias or data quality issues" },
      { value: "documentation", label: "We keep documentation/logs of how the system works" },
      { value: "human_loop", label: "Humans are in the loop for important decisions" },
      { value: "accuracy", label: "We check system accuracy and protect it from being hacked" },
      { value: "conformity", label: "We've done an official conformity assessment" },
      { value: "none", label: "None of these" },
    ],
  },
  {
    id: "q7",
    title: "Does your AI system interact with people or create synthetic content (text, image, audio, video)?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "q7a",
    title: "Do users know it's AI? How do you tell them?",
    type: "text",
    conditional: { dependsOn: "q7", value: "yes" },
  },
  {
    id: "q8",
    title: "Have you completed these assessments?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes, we've done both Fundamental Rights Impact Assessment and post-market monitoring" },
      { value: "partial", label: "Partially completed" },
      { value: "no", label: "Not done yet" },
    ],
  },
  {
    id: "q9",
    title: "Accountability & Governance: Which of these have you implemented?",
    type: "checkbox",
    options: [
      { value: "accountability_framework", label: "Clear accountability framework" },
      { value: "human_oversight", label: "Human oversight mechanisms" },
      { value: "governance_structure", label: "Governance structure and roles" },
      { value: "audit_trail", label: "Audit trail and record-keeping" },
      { value: "risk_management_process", label: "Risk management processes" },
      { value: "none", label: "None of these" },
    ],
  },
  {
    id: "q10",
    title: "Who is accountable for this AI system? (Name, role, or department)",
    type: "text",
    placeholder: "e.g., John Smith - Chief AI Officer, or AI Governance Team",
  },
];




export default function EUAssessmentPage() {
  const router = useRouter();
  const { systemId } = router.query;
  const [error, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<Record<string, any> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [systemName, setSystemName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode | null>(null);

  const rapidQuestionIds = ["q1", "q2", "q4", "q5", "q7", "q7a", "q10"];
  const currentQuestions = assessmentMode === 'rapid'
    ? euQuestions.filter(q => rapidQuestionIds.includes(q.id))
    : euQuestions;

  const currentSchema = assessmentMode === 'rapid' ? rapidSchema : comprehensiveSchema;

  useEffect(() => {
    const modeParam = router.query.mode;
    const modeValue = Array.isArray(modeParam) ? modeParam[0] : modeParam;
    if ((modeValue === "rapid" || modeValue === "comprehensive") && assessmentMode === null) {
      setAssessmentMode(modeValue);
    }
  }, [router.query.mode, assessmentMode]);


  // Log component mount immediately
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚀 [EU-ASSESSMENT] Component rendering`);
  console.log(`   Router ready: ${router.isReady}`);
  console.log(`   System ID from query: ${systemId}`);
  console.log(`   System ID type: ${typeof systemId}`);
  console.log(`   Full query:`, router.query);
  console.log(`   Current pathname: ${router.pathname}`);
  console.log(`   Current asPath: ${router.asPath}`);
  console.log(`${'='.repeat(80)}\n`);

  // Log router state for debugging
  useEffect(() => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔄 [EU-ASSESSMENT] Component mounted/updated`);
    console.log(`   Router ready: ${router.isReady}`);
    console.log(`   System ID from query: ${systemId}`);
    console.log(`   System ID type: ${typeof systemId}`);
    console.log(`   Full query:`, router.query);
    console.log(`${'='.repeat(80)}\n`);
  }, [router.isReady, systemId, router.query]);





  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔍 [EU-ASSESSMENT] useEffect triggered`);
    console.log(`   Router ready: ${router.isReady}`);
    console.log(`   System ID: ${systemId}`);
    console.log(`   System ID type: ${typeof systemId}`);
    console.log(`   Router pathname: ${router.pathname}`);
    console.log(`   Router asPath: ${router.asPath}`);
    console.log(`${'='.repeat(80)}\n`);

    // Helper function to extract systemId
    const extractSystemId = (): string | undefined => {
      // First try from query
      let systemIdValue = systemId as string | undefined;

      // Fallback: extract from URL path if query param is missing
      if ((!systemIdValue || systemIdValue === 'undefined') && router.asPath) {
        const pathMatch = router.asPath.match(/\/assessment\/eu\/([^/?]+)/);
        if (pathMatch && pathMatch[1] && pathMatch[1] !== 'undefined') {
          systemIdValue = pathMatch[1];
          console.log(`🔧 [EU-ASSESSMENT] Extracted systemId from URL path: ${systemIdValue}`);
        }
      }

      return systemIdValue;
    };

    // Try to get systemId immediately
    let systemIdValue = extractSystemId();

    // If we don't have systemId yet, wait a bit for router to be ready
    if (!systemIdValue) {
      if (!router.isReady) {
        console.log(`⏳ [EU-ASSESSMENT] Router not ready yet, will retry when router.isReady changes`);
        // Don't proceed - wait for router to be ready, then this useEffect will run again
        return;
      } else {
        // Router is ready but still no systemId - this is an error
        console.error(`❌ [EU-ASSESSMENT] Router is ready but no systemId found`);
        console.error(`   Router query:`, router.query);
        console.error(`   Router asPath: ${router.asPath}`);
        setError("System ID is missing from the URL. Please navigate from the assessment page.");
        setIsLoading(false);
        return;
      }
    }

    // Final validation
    if (systemIdValue === 'undefined') {
      console.error(`❌ [EU-ASSESSMENT] systemId is literally 'undefined' string`);
      setError("Invalid system ID. Please navigate from the assessment page.");
      setIsLoading(false);
      return;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🚀 [EU-ASSESSMENT] Starting to load assessment`);
    console.log(`   System ID: ${systemIdValue}`);
    console.log(`${'='.repeat(80)}\n`);

    const loadAssessment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(`📡 [EU-ASSESSMENT] Fetching system data from database...`);

        // Fetch system data — include description and company_name for pre-filling
        const { data: systemData, error: systemError } = await supabase
          .from("ai_systems")
          .select("id, system_name, description, company_name")
          .eq("id", systemIdValue)
          .maybeSingle();

        if (systemError) {
          console.error(`❌ [EU-ASSESSMENT] Error loading system:`, systemError);
          console.error(`   Error code: ${systemError.code}`);
          console.error(`   Error message: ${systemError.message}`);
          setError(`Invalid or missing system: ${systemError.message}`);
          setIsLoading(false);
          return;
        }

        if (!systemData) {
          console.warn(`⚠️  [EU-ASSESSMENT] No ai_systems row found for systemId=${systemIdValue}. Continuing with default values.`);
        }

        console.log(`✅ [EU-ASSESSMENT] System data loaded:`, systemData);

        // Store system name for submission
        if (systemData?.system_name) {
          setSystemName(systemData.system_name);
          console.log(`📝 [EU-ASSESSMENT] System name set: ${systemData.system_name}`);
        }

        console.log(`📡 [EU-ASSESSMENT] Checking for existing EU assessment...`);

        // Try to fetch existing assessment (may not exist for new assessments)
        const { data: assessment, error: assessmentError } = await supabase
          .from("eu_assessments")
          .select("answers")
          .eq("system_id", systemIdValue)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

        if (assessmentError) {
          if (assessmentError.code === 'PGRST116') {
            console.log(`ℹ️  [EU-ASSESSMENT] No existing assessment found (this is normal for new assessments)`);
          } else {
            console.warn(`⚠️  [EU-ASSESSMENT] Error loading assessment (will use defaults):`, assessmentError);
          }
        } else if (assessment) {
          console.log(`✅ [EU-ASSESSMENT] Found existing assessment with answers`);
        } else {
          console.log(`ℹ️  [EU-ASSESSMENT] No existing assessment found, will use defaults`);
        }

        // Create default values
        console.log(`🔧 [EU-ASSESSMENT] Creating default form values...`);
        const defaults = euQuestions.reduce((acc, q) => {
          acc[q.id] = q.type === "checkbox" ? [] : "";
          return acc;
        }, {} as Record<string, any>);

        // Use existing answers if available, otherwise use defaults pre-filled from system data
        let finalValues: Record<string, any>;
        if (assessment?.answers) {
          finalValues = assessment.answers;
        } else {
          // Pre-fill q2 (description) and q10 (accountable person) from the ai_systems record
          finalValues = {
            ...defaults,
            ...(systemData?.description ? { q2: systemData.description } : {}),
            ...(systemData?.company_name ? { q10: systemData.company_name } : {}),
          };
        }
        console.log(`✅ [EU-ASSESSMENT] Setting initial values (${assessment ? 'from existing assessment' : 'using defaults'})`);
        setInitialValues(finalValues);

        console.log(`\n${'='.repeat(80)}`);
        console.log(`✅ [EU-ASSESSMENT] Assessment loaded successfully`);
        console.log(`   System ID: ${systemIdValue}`);
        console.log(`   System Name: ${systemData?.system_name || 'N/A'}`);
        console.log(`   Has existing assessment: ${!!assessment}`);
        console.log(`   Initial values set: ${!!finalValues}`);
        console.log(`${'='.repeat(80)}\n`);
      } catch (err: any) {
        console.error(`\n${'='.repeat(80)}`);
        console.error(`❌ [EU-ASSESSMENT] Error in loadAssessment:`, err);
        console.error(`   Error message: ${err.message}`);
        console.error(`   Error stack:`, err.stack);
        console.error(`${'='.repeat(80)}\n`);
        setError(`Failed to load assessment: ${err.message}`);

        // Still set defaults so form can render
        console.log(`🔧 [EU-ASSESSMENT] Setting default values as fallback...`);
        const defaults = euQuestions.reduce((acc, q) => {
          acc[q.id] = q.type === "checkbox" ? [] : "";
          return acc;
        }, {} as Record<string, any>);
        setInitialValues(defaults);
      } finally {
        console.log(`🏁 [EU-ASSESSMENT] Loading complete, setting isLoading to false`);
        setIsLoading(false);
      }
    };

    loadAssessment();
  }, [router.isReady, systemId]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };




  type EuValues = Record<string, any>;

  type FormValues = EuValues;

  const handleFormSubmit = async (values: Record<string, any>) => {
    if (!systemId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await backendFetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_id: systemId,
          system_name: systemName || "Unnamed System",
          assessment_mode: assessmentMode,
          ...values,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit assessment");
      }

      const data = await res.json();
      const assessmentId = data.id || systemId;

      // Check if this is part of a multi-jurisdiction assessment
      console.log(`\n${'='.repeat(80)}`);
      console.log(`✅ [EU-ASSESSMENT] EU assessment submitted successfully`);
      console.log(`   System ID: ${systemId}`);
      console.log(`   Assessment ID: ${assessmentId}`);
      console.log(`   Checking for multi-jurisdiction flow...`);
      console.log(`${'='.repeat(80)}\n`);

      try {
        const { data: systemData } = await supabase
          .from("ai_systems")
          .select("data_processing_locations")
          .eq("id", systemId)
          .single();

        const dataProcessingLocations = systemData?.data_processing_locations || [];
        console.log(`📋 [EU-ASSESSMENT] Data processing locations:`, dataProcessingLocations);

        const hasMultipleJurisdictions =
          (dataProcessingLocations.includes("European Union") || dataProcessingLocations.includes("EU") ||
            dataProcessingLocations.some((loc: string) =>
              ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
                "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
                "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
                "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
                "Slovenia", "Spain", "Sweden"].some(c => c.toLowerCase() === loc.toLowerCase())
            )) &&
          ((dataProcessingLocations.includes("United Kingdom") || dataProcessingLocations.includes("UK")) ||
            dataProcessingLocations.includes("Singapore"));

        console.log(`🔍 [EU-ASSESSMENT] Multiple jurisdictions detected: ${hasMultipleJurisdictions}`);

        if (hasMultipleJurisdictions) {
          console.log(`➡️  [EU-ASSESSMENT] Redirecting to multi-jurisdiction page`);
          router.push(`/assessment/multi/${systemId}?completed=EU&assessmentId=${assessmentId}&mode=${assessmentMode}`);
        } else {
          console.log(`➡️  [EU-ASSESSMENT] Single jurisdiction - redirecting to EU results`);
          router.push(`/compliance/${assessmentId}`);
        }
      } catch (err: any) {
        console.error(`❌ [EU-ASSESSMENT] Error checking multi-jurisdiction:`, err);
        console.log(`➡️  [EU-ASSESSMENT] Fallback: redirecting to EU results`);
        // Fallback to normal redirect if check fails
        router.push(`/compliance/${assessmentId}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form based on country
  const frameworkName = "EU AI Act";

  if (isLoading || !initialValues) {
    // Log loading state
    console.log(`\n${'='.repeat(80)}`);
    console.log(`⏳ [EU-ASSESSMENT] Showing loading screen`);
    console.log(`   isLoading: ${isLoading}`);
    console.log(`   initialValues: ${initialValues ? 'set' : 'null'}`);
    console.log(`   router.isReady: ${router.isReady}`);
    console.log(`   systemId: ${systemId}`);
    console.log(`${'='.repeat(80)}\n`);

    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>Loading Assessment | AI Governance</title>
          <meta name="description" content="Loading the EU AI Act compliance assessment..." />
        </Head>
        <Sidebar onLogout={handleLogout} />
        <div className="lg:pl-72 pt-16 lg:pt-24 px-0 lg:px-4">
          <div className="container mx-auto max-w-4xl py-4 px-2 lg:py-12 lg:px-4">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading assessment…</p>
                {error && (
                  <p className="text-red-600 mt-4 text-sm">Error: {error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !initialValues) {
    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>Assessment Error | AI Governance</title>
          <meta name="description" content="An error occurred while loading the assessment." />
        </Head>
        <Sidebar onLogout={handleLogout} />
        <div className="lg:pl-72 pt-16 lg:pt-24 px-0 lg:px-4">
          <div className="container mx-auto max-w-4xl py-4 px-2 lg:py-12 lg:px-4">
            <Card className="glass-panel shadow-elevated">
              <CardContent className="p-8">
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!assessmentMode) {
    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>Select Assessment Mode | EU AI Act</title>
        </Head>
        <Sidebar onLogout={handleLogout} />
        <div className="container mx-auto max-w-4xl py-12 px-4 lg:pl-72 pt-24">
          <h1 className="text-3xl font-bold mb-8 text-foreground">EU AI Act Assessment</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="glass-panel hover:border-primary cursor-pointer transition-all hover:shadow-lg p-6 flex flex-col items-center justify-center text-center space-y-4"
              onClick={() => setAssessmentMode('rapid')}
            >
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl mb-2">Quick Scan</CardTitle>
                <CardDescription>
                  Fast high-level risk classification using core indicators.
                </CardDescription>
              </div>
              <Button variant="outline" className="w-full rounded-xl">Start Quick Scan</Button>
            </Card>

            <Card
              className="glass-panel hover:border-primary cursor-pointer transition-all hover:shadow-lg p-6 flex flex-col items-center justify-center text-center space-y-4"
              onClick={() => setAssessmentMode('comprehensive')}
            >
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl mb-2">Deep Review</CardTitle>
                <CardDescription>
                  Full EU AI Act review with detailed controls, governance, and evidence checks.
                </CardDescription>
              </div>
              <Button variant="hero" className="w-full rounded-xl bg-green-600 text-white">Start Deep Review</Button>
            </Card>
          </div>
          <Button
            variant="ghost"
            className="mt-8 rounded-xl"
            onClick={() => router.push("/dashboard")}
          >
            Cancel and Return
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>EU AI Act Assessment</title>
        <meta name="description" content="Complete the EU AI Act compliance assessment for your system." />
      </Head>
      <Sidebar onLogout={handleLogout} />
      <div className="lg:pl-72 pt-16 lg:pt-24 px-0 lg:px-4">
        <div className="container mx-auto max-w-4xl py-4 px-2 lg:py-12 lg:px-4">
          <Card className="glass-panel shadow-elevated">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-foreground">
              <Shield className="h-6 w-6 text-primary" />
              {frameworkName} {assessmentMode === 'rapid' ? 'Rapid' : 'Comprehensive'} Assessment
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {assessmentMode === 'rapid'
                ? "Core risk classification based on critical high-signal indicators"
                : "Full compliance assessment according to EU AI Act standards"}
            </CardDescription>

          </CardHeader>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={currentSchema}
              enableReinitialize
              onSubmit={handleFormSubmit}
            >
              {({ handleSubmit, validateForm, setTouched, errors, setFieldValue, submitForm, values, touched }) => {
                return (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    // Mark all fields as touched to show validation errors
                    const allFields = currentQuestions.reduce((acc, q) => {
                      acc[q.id] = true;
                      return acc;
                    }, {} as Record<string, boolean>);
                    setTouched(allFields);
                    handleSubmit(e);
                  }} className="space-y-6">
                    {assessmentMode === 'rapid' && (
                      <Alert className="bg-blue-50 border-blue-200 mb-6">
                        <AlertTriangle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>Quick Scan:</strong> This result is based on core indicators only.
                          Run Deep Review for full legal control coverage.
                        </AlertDescription>
                      </Alert>
                    )}
                    {currentQuestions.map((q) => {
                      // conditional logic (e.g. q7 → q7a)
                      if (q.conditional) {
                        const parentValue = values[q.conditional.dependsOn];
                        if (parentValue !== q.conditional.value) return null;
                      }

                      // Get field error safely
                      const fieldError = errors[q.id];
                      const hasFieldError = touched[q.id] && typeof fieldError === "string";

                      return (
                        <Card key={q.id} className="rounded-xl border">
                          <CardHeader>
                            <CardTitle className="text-base">
                              {q.title}
                            </CardTitle>
                          </CardHeader>

                          <CardContent className="space-y-3">
                            {/* TEXT */}
                            {q.type === "text" && (
                              <>
                                <Textarea
                                  value={values[q.id]}
                                  onChange={(e) => setFieldValue(q.id, e.target.value)}
                                  placeholder={q.placeholder}
                                  className={`rounded-xl ${hasFieldError
                                    ? "border-red-500 focus:ring-red-500"
                                    : ""
                                    }`}
                                />
                                {hasFieldError && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {fieldError}
                                  </p>
                                )}
                              </>
                            )}

                            {/* RADIO */}
                            {q.type === "radio" && (
                              <>
                                <div className="space-y-2">
                                  {q.options?.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={q.id}
                                        checked={values[q.id] === opt.value}
                                        onChange={() => setFieldValue(q.id, opt.value)}
                                      />
                                      <span>{opt.label}</span>
                                    </label>
                                  ))}
                                </div>
                                {hasFieldError && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {fieldError}
                                  </p>
                                )}
                              </>
                            )}

                            {/* CHECKBOX */}
                            {q.type === "checkbox" && (
                              <>
                                <div className="space-y-2">
                                  {q.options?.map((opt) => {
                                    const checked = values[q.id].includes(opt.value);

                                    return (
                                      <label key={opt.value} className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => {
                                            if (checked) {
                                              setFieldValue(
                                                q.id,
                                                values[q.id].filter((v: string) => v !== opt.value)
                                              );
                                            } else {
                                              setFieldValue(q.id, [...values[q.id], opt.value]);
                                            }
                                          }}
                                        />
                                        <span>{opt.label}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                                {hasFieldError && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {fieldError}
                                  </p>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}


                    {error && (
                      <Alert variant="destructive" className="rounded-xl">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAssessmentMode(null)}
                        className="rounded-xl"
                      >
                        Change Mode
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        variant="hero"
                        className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Assessment"
                        )}
                      </Button>
                    </div>
                  </form>

                )
              }}
            </Formik>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
