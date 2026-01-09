"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";

const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
  "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
  "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
  "Slovenia", "Spain", "Sweden",
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

// UK AI Framework Questions (aligned with 5 UK principles)
const ukQuestions = [
  {
    id: "uk1",
    title: "What does your AI system do? (Brief description)",
    type: "text",
  },
  {
    id: "uk2",
    title: "Which sector does your AI system operate in?",
    type: "select",
    options: [
      { value: "finance", label: "Finance (FCA regulated)" },
      { value: "healthcare", label: "Healthcare (MHRA regulated)" },
      { value: "telecoms", label: "Telecommunications (Ofcom regulated)" },
      { value: "competition", label: "Competition/Markets (CMA regulated)" },
      { value: "data_privacy", label: "Data Privacy (ICO regulated)" },
      { value: "other", label: "Other sector" },
    ],
  },
  {
    id: "uk3",
    title: "Safety, Security & Robustness: Which of these have you implemented?",
    type: "checkbox",
    options: [
      { value: "robustness_testing", label: "Robustness testing and validation" },
      { value: "red_teaming", label: "Red-teaming or adversarial testing" },
      { value: "misuse_prevention", label: "Misuse prevention measures" },
      { value: "cybersecurity", label: "Cybersecurity controls and monitoring" },
      { value: "safety_testing", label: "Safety testing protocols" },
      { value: "none", label: "None of these" },
    ],
  },
  {
    id: "uk4",
    title: "Transparency & Explainability: Which of these have you implemented?",
    type: "checkbox",
    options: [
      { value: "user_disclosure", label: "Clear disclosure to users that AI is being used" },
      { value: "explainability", label: "Explainability mechanisms for decisions" },
      { value: "documentation", label: "Documentation of system capabilities and limitations" },
      { value: "transparency_reports", label: "Transparency reports or public documentation" },
      { value: "none", label: "None of these" },
    ],
  },
  {
    id: "uk5",
    title: "Fairness: Which of these have you implemented?",
    type: "checkbox",
    options: [
      { value: "bias_testing", label: "Bias testing and assessment" },
      { value: "discrimination_mitigation", label: "Discriminatory risk mitigation" },
      { value: "data_quality", label: "Data quality and representativeness checks" },
      { value: "fairness_monitoring", label: "Ongoing fairness monitoring" },
      { value: "none", label: "None of these" },
    ],
  },
  {
    id: "uk6",
    title: "Accountability & Governance: Which of these have you implemented?",
    type: "checkbox",
    options: [
      { value: "accountability_framework", label: "Clear accountability framework" },
      { value: "human_oversight", label: "Human oversight mechanisms" },
      { value: "risk_management", label: "Risk management processes" },
      { value: "governance_structure", label: "Governance structure and roles" },
      { value: "audit_trail", label: "Audit trail and record-keeping" },
      { value: "none", label: "None of these" },
    ],
  },
  {
    id: "uk7",
    title: "Contestability & Redress: Which of these have you implemented?",
    type: "checkbox",
    options: [
      { value: "user_rights", label: "Clear user rights and information" },
      { value: "appeal_mechanism", label: "Appeal or challenge mechanism" },
      { value: "redress_process", label: "Redress process for adverse outcomes" },
      { value: "complaint_handling", label: "Complaint handling procedures" },
      { value: "none", label: "None of these" },
    ],
  },
  {
    id: "uk8",
    title: "Is your system a foundation model or high-impact AI system?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes, it's a foundation model or high-impact system" },
      { value: "no", label: "No" },
      { value: "unsure", label: "Unsure" },
    ],
  },
  {
    id: "uk9",
    title: "Who is accountable for this AI system? (Name, role, or department)",
    type: "text",
    placeholder: "e.g., Jane Doe - Head of AI Ethics, or Compliance Department",
  },
];

// MAS/Singapore Questions (simplified version)
const masInitialState = {
  system_name: "",
  description: "",
  owner: "",
  jurisdiction: "",
  sector: "",
  system_status: "development",
  business_use_case: "",
  data_types: "",
  uses_personal_data: false,
  uses_special_category_data: false,
  uses_third_party_ai: false,
  governance_policy: false,
  inventory_recorded: false,
  data_quality_checks: false,
  transparency_docs: false,
  fairness_testing: false,
  human_oversight: false,
  third_party_controls: false,
  algo_documented: false,
  evaluation_testing: false,
  security_measures: false,
  monitoring_plan: false,
  capability_training: false,
};

export default function AssessmentChooserPage() {
  const router = useRouter();
  const [step, setStep] = useState<"intro" | "form">("intro");
  const [name, setName] = useState("");
  const [systemName, setSystemName] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form answers state
  const [euAnswers, setEuAnswers] = useState<Record<string, any>>({});
  const [ukAnswers, setUkAnswers] = useState<Record<string, any>>({});
  const [masAnswers, setMasAnswers] = useState(masInitialState);

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

  const isEU = useMemo(
    () => EU_COUNTRIES.some((c) => c.toLowerCase() === country.toLowerCase()),
    [country]
  );
  const isSingapore = country.toLowerCase() === "singapore";
  const isUK = country.toLowerCase() === "united kingdom" || country.toLowerCase() === "uk";

  // Initialize answers based on framework
  useEffect(() => {
    if (step === "form") {
      if (isEU) {
        const initial = euQuestions.reduce((acc, q) => {
          if (q.type === "checkbox") acc[q.id] = [];
          else acc[q.id] = "";
          return acc;
        }, {} as Record<string, any>);
        setEuAnswers(initial);
      } else if (isUK) {
        const initial = ukQuestions.reduce((acc, q) => {
          if (q.type === "checkbox") acc[q.id] = [];
          else acc[q.id] = "";
          return acc;
        }, {} as Record<string, any>);
        setUkAnswers(initial);
      } else if (isSingapore) {
        setMasAnswers(masInitialState);
      }
    }
  }, [step, isEU, isUK, isSingapore]);

  const handleIntroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country) {
      setError("Please provide your name and country.");
      return;
    }
    if (!systemName.trim() && !isSingapore) {
      setError("Please provide a system name.");
      return;
    }
    setError(null);
    setStep("form");
  };

  const getVisibleQuestions = (questions: any[], answers: Record<string, any>) => {
    return questions.filter((q) => {
      if (!q.conditional) return true;
      const parentVal = answers[q.conditional.dependsOn];
      const expected = Array.isArray(q.conditional.value)
        ? q.conditional.value
        : [q.conditional.value];
      return (
        expected.includes(parentVal) ||
        (Array.isArray(parentVal) && parentVal.some((v) => expected.includes(v)))
      );
    });
  };

  const handleQuestionChange = (
    id: string,
    value: any,
    type: string,
    framework: "eu" | "uk"
  ) => {
    if (framework === "eu") {
      setEuAnswers((prev) => {
        const updated = { ...prev };
        if (type === "checkbox") {
          const curr = new Set(updated[id] || []);
          curr.has(value) ? curr.delete(value) : curr.add(value);
          updated[id] = Array.from(curr);
        } else {
          updated[id] = value;
        }
        return updated;
      });
    } else if (framework === "uk") {
      setUkAnswers((prev) => {
        const updated = { ...prev };
        if (type === "checkbox") {
          const curr = new Set(updated[id] || []);
          curr.has(value) ? curr.delete(value) : curr.add(value);
          updated[id] = Array.from(curr);
        } else {
          updated[id] = value;
        }
        return updated;
      });
    }
  };

  const handleMasChange = (key: string, value: any) => {
    setMasAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let endpoint = "";
      let payload: any = { name, country, system_name: systemName };

      if (isEU) {
        endpoint = `${API_BASE_URL}/compliance`;
        payload = { ...euAnswers, system_name: systemName };
      } else if (isUK) {
        endpoint = `${API_BASE_URL}/uk-compliance`;
        payload = {
          answers: { name, country, system_name: systemName, ...ukAnswers },
          system_name: systemName,
        };
      } else if (isSingapore) {
        endpoint = `${API_BASE_URL}/mas-compliance`;
        payload = masAnswers;
      } else {
        endpoint = `${API_BASE_URL}/compliance`;
        payload = { ...euAnswers, system_name: systemName };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit assessment");
      }

      const data = await res.json();
      
      // Validate that we have an ID before navigating
      if (!data.id) {
        throw new Error("Assessment submitted but no ID returned. Please try again.");
      }
      
      // Route to appropriate results page
    if (isEU) {
        router.push(`/compliance/${data.id}`);
      } else if (isUK) {
        router.push(`/uk/${data.id}`);
      } else if (isSingapore) {
        router.push(`/mas/${data.id}`);
      } else {
        router.push(`/compliance/${data.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (q: any, answers: Record<string, any>, framework: "eu" | "uk") => {
    const value = answers[q.id];
    
    if (q.type === "text") {
      return (
        <div key={q.id} className="space-y-2">
          <Label className="text-base font-semibold text-foreground">{q.title}</Label>
          <Textarea
            value={value || ""}
            onChange={(e) => handleQuestionChange(q.id, e.target.value, q.type, framework)}
            placeholder="Enter your answer..."
            required
            className="min-h-[100px] rounded-xl"
          />
        </div>
      );
    }
    
    if (q.type === "radio") {
      return (
        <div key={q.id} className="space-y-2">
          <Label className="text-base font-semibold text-foreground">{q.title}</Label>
          <div className="space-y-2">
            {q.options.map((opt: any) => (
              <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleQuestionChange(q.id, e.target.value, q.type, framework)}
                  required
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }
    
    if (q.type === "checkbox") {
      return (
        <div key={q.id} className="space-y-2">
          <Label className="text-base font-semibold text-foreground">{q.title}</Label>
          <div className="space-y-2">
            {q.options.map((opt: any) => (
              <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt.value)}
                  onChange={() => handleQuestionChange(q.id, opt.value, q.type, framework)}
                  className="w-4 h-4 text-primary focus:ring-primary rounded"
                />
                <span className="text-foreground">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }
    
    if (q.type === "select") {
      return (
        <div key={q.id} className="space-y-2">
          <Label className="text-base font-semibold text-foreground">{q.title}</Label>
          <Select
            value={value || ""}
            onValueChange={(v) => handleQuestionChange(q.id, v, q.type, framework)}
            required
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {q.options.map((opt: any) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
    
    return null;
  };

  if (step === "intro") {
  return (
    <div className="min-h-screen bg-white">
      {isLoggedIn && <Sidebar onLogout={handleLogout} />}
      <div className={`container mx-auto max-w-3xl py-12 px-4 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        <Card className="glass-panel shadow-elevated">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-foreground">
              <Shield className="h-6 w-6 text-primary" />
              Start an AI compliance check
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Tell us who you are and where you operate. We'll show you the appropriate compliance form based on your jurisdiction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIntroSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-foreground">Your name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Smith"
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">System name *</Label>
              <Input
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                placeholder="My AI System"
                required
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">Give your AI system a clear, descriptive name</p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Country</Label>
              <Select value={country} onValueChange={(v) => setCountry(v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-[300px]">
                  <SelectItem value="United Kingdom" className="!bg-purple-50 hover:!bg-purple-100 focus:!bg-purple-100 data-[highlighted]:!bg-purple-100 border border-purple-200 rounded-lg my-1 mx-1">
                    United Kingdom
                  </SelectItem>
                  <SelectItem value="Singapore" className="!bg-emerald-50 hover:!bg-emerald-100 focus:!bg-emerald-100 data-[highlighted]:!bg-emerald-100 border border-emerald-200 rounded-lg my-1 mx-1">
                    Singapore
                  </SelectItem>
                  {EU_COUNTRIES.map((c) => (
                    <SelectItem 
                      key={c} 
                      value={c}
                      className="!bg-blue-50 hover:!bg-blue-100 focus:!bg-blue-100 data-[highlighted]:!bg-blue-100 border border-blue-200 rounded-lg my-1 mx-1"
                    >
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button type="submit" variant="hero" className="rounded-xl">
                Continue
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  }

  // Render form based on country
  const frameworkName = isEU ? "EU AI Act" : isUK ? "UK AI Regulatory Framework" : isSingapore ? "MAS AI Risk Management" : "EU AI Act";
  const questions = isEU ? euQuestions : isUK ? ukQuestions : [];
  const answers = isEU ? euAnswers : isUK ? ukAnswers : {};
  const visibleQuestions = getVisibleQuestions(questions, answers);

  return (
    <div className="min-h-screen bg-white">
      {isLoggedIn && <Sidebar onLogout={handleLogout} />}
      <div className={`container mx-auto max-w-4xl py-12 px-4 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        <Card className="glass-panel shadow-elevated">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-foreground">
              <Shield className="h-6 w-6 text-primary" />
              {frameworkName} Assessment
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {name} - {country}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {isSingapore ? (
              // MAS form with clear sections
              <div className="space-y-6">
                {/* System Profile Section */}
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">System Profile</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Tell us about your AI system - basic information to get started
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">System name *</Label>
                      <Input
                        value={masAnswers.system_name}
                        onChange={(e) => handleMasChange("system_name", e.target.value)}
                        placeholder="e.g., Fraud Detection Engine, Customer Chatbot"
                        required
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">Give your AI system a clear, descriptive name</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Owner / Team</Label>
                      <Input
                        value={masAnswers.owner}
                        onChange={(e) => handleMasChange("owner", e.target.value)}
                        placeholder="e.g., Risk Operations, Product Team"
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">Who is responsible for this system?</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Jurisdiction(s)</Label>
                      <Input
                        value={masAnswers.jurisdiction}
                        onChange={(e) => handleMasChange("jurisdiction", e.target.value)}
                        placeholder="e.g., Singapore, UK, Global"
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">Where does this system operate?</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Sector / Industry</Label>
                      <Input
                        value={masAnswers.sector}
                        onChange={(e) => handleMasChange("sector", e.target.value)}
                        placeholder="e.g., Finance, Healthcare, Retail"
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">What industry does this system serve?</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">System Status</Label>
                      <Select
                        value={masAnswers.system_status}
                        onValueChange={(v) => handleMasChange("system_status", v)}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">Development - Still being built</SelectItem>
                          <SelectItem value="staging">Staging - Testing before launch</SelectItem>
                          <SelectItem value="production">Production - Live and in use</SelectItem>
                          <SelectItem value="deprecated">Deprecated - No longer active</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Current stage of your AI system</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Business Purpose / Use Case</Label>
                      <Input
                        value={masAnswers.business_use_case}
                        onChange={(e) => handleMasChange("business_use_case", e.target.value)}
                        placeholder="e.g., Automated credit scoring, Customer support"
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">What problem does this system solve?</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-foreground">System Description *</Label>
                      <Textarea
                        value={masAnswers.description}
                        onChange={(e) => handleMasChange("description", e.target.value)}
                        placeholder="Provide a brief description of what your AI system does, how it works, and its main purpose..."
                        className="min-h-[100px] rounded-xl"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Describe your AI system in 2-3 sentences</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Data & Dependencies Section */}
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Data & Dependencies</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      What data does your system use, and does it rely on external AI services?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">What types of data does your system use?</Label>
                      <Textarea
                        value={masAnswers.data_types}
                        onChange={(e) => handleMasChange("data_types", e.target.value)}
                        placeholder="e.g., Transaction logs, customer chat transcripts, financial records, images, text documents"
                        className="min-h-[80px] rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">List the main types of data your AI system processes</p>
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                        <div className="space-y-0.5">
                          <Label className="text-base font-medium text-foreground">Does your system process personal data?</Label>
                          <p className="text-sm text-muted-foreground">Personal data includes names, emails, IDs, or any information that identifies individuals</p>
                        </div>
                        <Switch
                          checked={masAnswers.uses_personal_data}
                          onCheckedChange={(checked) => handleMasChange("uses_personal_data", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                        <div className="space-y-0.5">
                          <Label className="text-base font-medium text-foreground">Does your system process sensitive or special category data?</Label>
                          <p className="text-sm text-muted-foreground">Sensitive data includes health records, financial info, biometrics, race, religion, etc.</p>
                        </div>
                        <Switch
                          checked={masAnswers.uses_special_category_data}
                          onCheckedChange={(checked) => handleMasChange("uses_special_category_data", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                        <div className="space-y-0.5">
                          <Label className="text-base font-medium text-foreground">Does your system use third-party AI services?</Label>
                          <p className="text-sm text-muted-foreground">External AI APIs, cloud AI services, or pre-built AI models from vendors</p>
                        </div>
                        <Switch
                          checked={masAnswers.uses_third_party_ai}
                          onCheckedChange={(checked) => handleMasChange("uses_third_party_ai", checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* MAS Pillar Checkpoints */}
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">MAS AI Risk Management Pillars</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Check which of these risk management practices you have in place. This helps us assess your compliance with MAS guidelines.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">Governance & Oversight</Label>
                        <p className="text-sm text-muted-foreground">Do you have a documented AI risk governance policy or framework?</p>
                      </div>
                      <Switch
                        checked={masAnswers.governance_policy}
                        onCheckedChange={(checked) => handleMasChange("governance_policy", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">System Inventory & Risk Classification</Label>
                        <p className="text-sm text-muted-foreground">Is this system recorded in your internal AI system inventory?</p>
                      </div>
                      <Switch
                        checked={masAnswers.inventory_recorded}
                        onCheckedChange={(checked) => handleMasChange("inventory_recorded", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">Data Management & Quality</Label>
                        <p className="text-sm text-muted-foreground">Have you documented data quality checks and bias analysis?</p>
                      </div>
                      <Switch
                        checked={masAnswers.data_quality_checks}
                        onCheckedChange={(checked) => handleMasChange("data_quality_checks", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">Transparency & Explainability</Label>
                        <p className="text-sm text-muted-foreground">Do you have documentation explaining how the system works to users or stakeholders?</p>
                      </div>
                      <Switch
                        checked={masAnswers.transparency_docs}
                        onCheckedChange={(checked) => handleMasChange("transparency_docs", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">Fairness & Bias Testing</Label>
                        <p className="text-sm text-muted-foreground">Have you performed bias or discrimination testing on your system?</p>
                      </div>
                      <Switch
                        checked={masAnswers.fairness_testing}
                        onCheckedChange={(checked) => handleMasChange("fairness_testing", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">Human Oversight</Label>
                        <p className="text-sm text-muted-foreground">Do you have human-in-the-loop (HITL) or human-on-the-loop (HOTL) processes defined?</p>
                      </div>
                      <Switch
                        checked={masAnswers.human_oversight}
                        onCheckedChange={(checked) => handleMasChange("human_oversight", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">Third-Party & Vendor Management</Label>
                        <p className="text-sm text-muted-foreground">Do you have vendor due diligence and controls in place for third-party AI services?</p>
                      </div>
                      <Switch
                        checked={masAnswers.third_party_controls}
                        onCheckedChange={(checked) => handleMasChange("third_party_controls", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">Algorithm & Feature Selection</Label>
                        <p className="text-sm text-muted-foreground">Have you documented your algorithm selection and feature engineering process?</p>
                      </div>
                      <Switch
                        checked={masAnswers.algo_documented}
                        onCheckedChange={(checked) => handleMasChange("algo_documented", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">Evaluation & Testing</Label>
                        <p className="text-sm text-muted-foreground">Have you completed pre-deployment testing and robustness checks?</p>
                      </div>
                      <Switch
                        checked={masAnswers.evaluation_testing}
                        onCheckedChange={(checked) => handleMasChange("evaluation_testing", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">Technology & Cybersecurity</Label>
                        <p className="text-sm text-muted-foreground">Do you have security measures to protect against misuse, prompt injection, or data leakage?</p>
                      </div>
                      <Switch
                        checked={masAnswers.security_measures}
                        onCheckedChange={(checked) => handleMasChange("security_measures", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">Monitoring & Change Management</Label>
                        <p className="text-sm text-muted-foreground">Do you have drift monitoring, incident management, and version control processes?</p>
                      </div>
                      <Switch
                        checked={masAnswers.monitoring_plan}
                        onCheckedChange={(checked) => handleMasChange("monitoring_plan", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl glass-panel">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium text-foreground">Capability & Capacity</Label>
                        <p className="text-sm text-muted-foreground">Does your team have the necessary skills, training, and infrastructure to manage this AI system?</p>
                      </div>
                      <Switch
                        checked={masAnswers.capability_training}
                        onCheckedChange={(checked) => handleMasChange("capability_training", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // EU or UK questions
              visibleQuestions.map((q) => renderQuestion(q, answers, isEU ? "eu" : "uk"))
            )}

            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("intro")}
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
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
