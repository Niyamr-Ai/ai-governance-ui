
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { Formik } from "formik";
import * as Yup from "yup";

// EU AI Act Validation Schema
const euValidationSchema = Yup.object({
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
import { Loader2, Shield } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";
import { backendFetch } from "@/utils/backend-fetch";



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





  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!systemId) return;

    const loadAssessment = async () => {
      const { error: systemError } = await supabase
        .from("ai_systems")
        .select("id")
        .eq("id", systemId)
        .single();

      if (systemError) {
        setError("Invalid or missing system");
        return;
      }

      const { data: assessment } = await supabase
        .from("eu_assessments")
        .select("answers")
        .eq("system_id", systemId)
        .single();

      const defaults = euQuestions.reduce((acc, q) => {
        acc[q.id] = q.type === "checkbox" ? [] : "";
        return acc;
      }, {} as Record<string, any>);

      setInitialValues(assessment?.answers ?? defaults);
    };

    loadAssessment();
  }, [systemId]);


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
          ...values,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit assessment");
      }

      const data = await res.json();
      const assessmentId = data.id || systemId;

      router.push(`/compliance/${assessmentId}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form based on country
  const frameworkName = "EU AI Act";

  if (!initialValues) {
    return <div className="p-8">Loading assessment…</div>;
  }


  return (
    <div className="min-h-screen bg-white">
      <Sidebar onLogout={handleLogout} />
      <div className="container mx-auto max-w-4xl py-12 px-4 lg:pl-72 pt-24">
        <Card className="glass-panel shadow-elevated">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-foreground">
              <Shield className="h-6 w-6 text-primary" />
              {frameworkName} Assessment
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Complete the EU AI Act compliance assessment
            </CardDescription>

          </CardHeader>
          <CardContent>
            <Formik
              initialValues={initialValues}
              validationSchema={euValidationSchema}
              enableReinitialize
              onSubmit={handleFormSubmit}
            >
              {({ handleSubmit, validateForm, setTouched, errors, setFieldValue, submitForm, values, touched }) => {
                return (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    // Mark all fields as touched to show validation errors
                    const allFields = euQuestions.reduce((acc, q) => {
                      acc[q.id] = true;
                      return acc;
                    }, {} as Record<string, boolean>);
                    setTouched(allFields);
                    handleSubmit(e);
                  }} className="space-y-6">
  {/* TODO: render euQuestions here */}
                    {euQuestions.map((q) => {
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
                        onClick={() => router.push("/dashboard")}
                        className="rounded-xl"
                      >
                        Back
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
  );
}