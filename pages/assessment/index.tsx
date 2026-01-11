"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
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
import { backendFetch } from "@/utils/backend-fetch";

const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
  "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
  "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
  "Slovenia", "Spain", "Sweden",
];

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

// UK AI Framework Questions (aligned with 5 UK principles) - Legacy questions kept for backward compatibility
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

// UK Initial State for Multi-Page Form
const ukInitialState = {
  // Page 1: System Profile & Company Info
  system_name: "",
  description: "",
  owner: "",
  jurisdiction: "",
  sector: "",
  system_status: "envision", // Changed to "envision" as first option
  business_use_case: "",
  
  // Page 2: Safety, Security & Robustness
  robustness_testing: false,
  robustness_testing_methods: "",
  robustness_testing_frequency: "",
  robustness_test_results: "",
  robustness_test_evidence: "",
  
  red_teaming: false,
  red_teaming_who: "",
  red_teaming_methodology: "",
  red_teaming_findings: "",
  red_teaming_evidence: "",
  
  misuse_prevention: false,
  misuse_prevention_measures: "",
  misuse_monitoring: "",
  misuse_prevention_evidence: "",
  
  cybersecurity: false,
  cybersecurity_controls: "",
  cybersecurity_incident_response: "",
  cybersecurity_monitoring: "",
  cybersecurity_evidence: "",
  
  safety_testing: false,
  safety_testing_protocols: "",
  safety_validation_methods: "",
  safety_testing_evidence: "",
  
  risk_assessment_process: "",
  error_handling_mechanisms: "",
  failsafe_mechanisms: "",
  adversarial_attack_testing: "",
  
  // Page 3: Transparency & Explainability
  user_disclosure: false,
  user_disclosure_how: "",
  user_disclosure_when: "",
  user_disclosure_format: "",
  user_disclosure_evidence: "",
  
  explainability: false,
  explainability_methods: "",
  explainability_technical_details: "",
  explainability_user_types: "",
  explainability_evidence: "",
  
  documentation: false,
  documentation_types: "",
  documentation_storage: "",
  documentation_update_frequency: "",
  documentation_evidence: "",
  
  transparency_reports: false,
  transparency_reports_content: "",
  transparency_reports_frequency: "",
  transparency_reports_publication: "",
  transparency_reports_evidence: "",
  
  model_interpretability: "",
  documentation_accessibility: "",
  
  // Page 4: Fairness & Data Governance
  bias_testing: false,
  bias_testing_methodology: "",
  bias_testing_tools: "",
  bias_testing_frequency: "",
  bias_testing_results: "",
  bias_testing_evidence: "",
  
  discrimination_mitigation: false,
  discrimination_mitigation_measures: "",
  discrimination_mitigation_evidence: "",
  
  data_quality: false,
  data_quality_checks: "",
  data_quality_metrics: "",
  data_quality_evidence: "",
  
  fairness_monitoring: false,
  fairness_monitoring_processes: "",
  fairness_monitoring_alerts: "",
  fairness_monitoring_evidence: "",
  
  personal_data_handling: false,
  personal_data_types: "",
  personal_data_sources: "",
  personal_data_retention: "",
  
  data_representativeness: "",
  protected_characteristics: "",
  bias_detection_training: "",
  fairness_metrics_used: "",
  fairness_continuous_monitoring: "",
  adverse_impact_assessment: "",
  
  // Page 5: Accountability & Governance
  accountability_framework: false,
  accountability_framework_structure: "",
  accountability_roles: "",
  accountability_evidence: "",
  
  human_oversight: false,
  human_oversight_who: "",
  human_oversight_when: "",
  human_oversight_how: "",
  human_oversight_evidence: "",
  
  risk_management: false,
  risk_management_processes: "",
  risk_management_documentation: "",
  risk_management_evidence: "",
  
  governance_structure: false,
  governance_board_involvement: "",
  governance_committees: "",
  governance_structure_evidence: "",
  
  audit_trail: false,
  audit_trail_what: "",
  audit_trail_retention: "",
  audit_trail_access: "",
  audit_trail_evidence: "",
  
  senior_management_oversight: "",
  ethics_committee: false,
  ethics_committee_details: "",
  policy_assignment: "",
  policy_review_frequency: "",
  training_requirements: "",
  escalation_procedures: "",
  
  // Page 6: Contestability & Redress
  user_rights: false,
  user_rights_what: "",
  user_rights_communication: "",
  user_rights_evidence: "",
  
  appeal_mechanism: false,
  appeal_mechanism_process: "",
  appeal_mechanism_timeline: "",
  appeal_mechanism_accessibility: "",
  appeal_mechanism_evidence: "",
  
  redress_process: false,
  redress_process_steps: "",
  redress_compensation: "",
  redress_documentation: "",
  redress_process_evidence: "",
  
  complaint_handling: false,
  complaint_handling_procedures: "",
  complaint_response_time: "",
  complaint_tracking: "",
  complaint_handling_evidence: "",
  
  appeal_success_rates: "",
  redress_outcomes_tracking: "",
  
  // Page 7: Foundation Models & High-Impact Systems
  foundation_model: "no", // yes, no, unsure
  foundation_model_cards: false,
  foundation_model_documentation: "",
  foundation_model_capability_testing: "",
  foundation_model_risk_assessment: "",
  foundation_model_deployment_restrictions: "",
  foundation_model_monitoring: "",
  foundation_model_evidence: "",
  
  regulatory_sandbox: false,
  regulatory_sandbox_details: "",
  sector_specific_requirements: "",
  
  // Accountability person
  accountable_person: "",
};

// MAS/Singapore Questions (simplified version)
const masInitialState = {
  system_name: "",
  description: "",
  owner: "",
  jurisdiction: "",
  sector: "",
  system_status: "envision", // Changed to "envision" as first option
  business_use_case: "",
  data_types: "",
  uses_personal_data: false,
  // Sub-questions for personal data
  personal_data_types: "",
  personal_data_logged_where: "",
  personal_data_use_cases: "",
  personal_data_evidence: "",
  uses_special_category_data: false,
  // Sub-questions for sensitive data
  sensitive_data_types: "",
  sensitive_data_logged_where: "",
  sensitive_data_evidence: "",
  uses_third_party_ai: false,
  // Sub-questions for third-party AI services
  third_party_services_list: "",
  third_party_services_safety: "",
  third_party_services_evidence: "",
  governance_policy: false,
  // Sub-questions for governance (existing)
  governance_policy_type: "",
  governance_framework: "",
  governance_board_role: "",
  governance_senior_management: "",
  governance_policy_assigned: "",
  governance_evidence: "",
  // NEW: Enhanced governance questions
  governance_ethics_committee: false,
  governance_ethics_committee_details: "",
  governance_risk_appetite: "",
  governance_policy_review_frequency: "",
  governance_escalation_procedures: "",
  governance_compliance_monitoring: "",
  governance_training_requirements: "",
  governance_conflict_resolution: "",
  inventory_recorded: false,
  // Sub-questions for inventory (existing)
  inventory_location: "",
  inventory_risk_classification: "",
  inventory_evidence: "",
  // NEW: Enhanced inventory questions
  inventory_update_frequency: "",
  inventory_risk_methodology: "",
  inventory_risk_review_process: "",
  inventory_critical_systems: "",
  inventory_dependency_mapping: "",
  inventory_legacy_systems: "",
  data_quality_checks: false,
  // Sub-questions for data quality (existing)
  data_quality_methods: "",
  data_bias_analysis: "",
  data_quality_evidence: "",
  // NEW: Enhanced data management questions
  data_lineage_tracking: false,
  data_lineage_details: "",
  data_retention_policies: "",
  data_minimization: "",
  data_accuracy_metrics: "",
  data_freshness: "",
  data_synthetic_usage: false,
  data_synthetic_details: "",
  data_dpia_conducted: false,
  data_dpia_details: "",
  data_cross_border: false,
  data_cross_border_safeguards: "",
  transparency_docs: false,
  // Sub-questions for transparency (existing)
  transparency_doc_types: "",
  transparency_user_explanations: "",
  transparency_evidence: "",
  // NEW: Enhanced transparency questions
  transparency_model_cards: false,
  transparency_model_cards_details: "",
  transparency_explainability_methods: "",
  transparency_user_communication: "",
  transparency_decision_documentation: "",
  transparency_interpretability_requirements: "",
  transparency_stakeholder_communication: "",
  fairness_testing: false,
  // Sub-questions for fairness (existing)
  fairness_testing_methods: "",
  fairness_test_results: "",
  fairness_evidence: "",
  // NEW: Enhanced fairness questions
  fairness_protected_attributes: "",
  fairness_metrics_used: "",
  fairness_bias_mitigation: "",
  fairness_continuous_monitoring: "",
  fairness_adverse_impact: "",
  fairness_testing_frequency: "",
  fairness_external_validation: false,
  fairness_external_validation_details: "",
  human_oversight: false,
  // Sub-questions for human oversight (existing)
  human_oversight_type: "",
  human_oversight_processes: "",
  human_oversight_evidence: "",
  // NEW: Enhanced human oversight questions
  human_oversight_roles: "",
  human_oversight_qualifications: "",
  human_oversight_intervention_triggers: "",
  human_oversight_decision_authority: "",
  human_oversight_training: "",
  human_oversight_escalation: "",
  human_oversight_documentation: "",
  human_oversight_automation_percentage: "",
  third_party_controls: false,
  // Sub-questions for third-party controls (existing)
  third_party_due_diligence: "",
  third_party_contracts: "",
  third_party_controls_evidence: "",
  // NEW: Enhanced third-party questions
  third_party_vendor_risk_assessment: "",
  third_party_slas: "",
  third_party_vendor_monitoring: "",
  third_party_exit_strategy: "",
  third_party_data_residency: "",
  third_party_incident_reporting: "",
  third_party_audit_rights: "",
  third_party_multi_vendor: "",
  algo_documented: false,
  // Sub-questions for algorithm documentation (existing)
  algo_selection_process: "",
  algo_feature_engineering: "",
  algo_documentation_evidence: "",
  // NEW: Enhanced algorithm questions
  algo_selection_criteria: "",
  algo_model_comparison: "",
  algo_feature_importance: "",
  algo_feature_drift: "",
  algo_model_versioning: "",
  algo_ab_testing: false,
  algo_ab_testing_details: "",
  algo_hyperparameter_tuning: "",
  evaluation_testing: false,
  // Sub-questions for evaluation (existing)
  evaluation_test_types: "",
  evaluation_robustness_checks: "",
  evaluation_evidence: "",
  // NEW: Enhanced evaluation questions
  evaluation_test_data_management: "",
  evaluation_performance_benchmarks: "",
  evaluation_regression_testing: false,
  evaluation_regression_details: "",
  evaluation_stress_testing: false,
  evaluation_stress_testing_details: "",
  evaluation_failsafe_mechanisms: "",
  evaluation_rollback_procedures: "",
  evaluation_test_documentation: "",
  security_measures: false,
  // Sub-questions for security (existing)
  security_cybersecurity_measures: "",
  security_prompt_injection: "",
  security_data_leakage: "",
  security_evidence: "",
  // NEW: Enhanced security questions
  security_access_controls: "",
  security_encryption: "",
  security_authentication: "",
  security_network_security: "",
  security_vulnerability_scanning: "",
  security_penetration_testing: false,
  security_penetration_details: "",
  security_incident_response: "",
  security_certifications: "",
  monitoring_plan: false,
  // Sub-questions for monitoring (existing)
  monitoring_drift_detection: "",
  monitoring_incident_management: "",
  monitoring_version_control: "",
  monitoring_evidence: "",
  // NEW: Enhanced monitoring questions
  monitoring_performance_metrics: "",
  monitoring_alert_thresholds: "",
  monitoring_tools: "",
  monitoring_change_approval: "",
  monitoring_rollback_capability: "",
  monitoring_change_impact: "",
  monitoring_post_deployment: "",
  monitoring_kill_switch: false,
  monitoring_kill_switch_details: "",
  capability_training: false,
  // Sub-questions for capability (existing)
  capability_team_skills: "",
  capability_training_programs: "",
  capability_infrastructure: "",
  capability_evidence: "",
  // NEW: Enhanced capability questions
  capability_talent_strategy: "",
  capability_skills_gap: "",
  capability_training_budget: "",
  capability_external_consultants: false,
  capability_external_consultants_details: "",
  capability_knowledge_management: "",
  capability_succession_planning: "",
  capability_infrastructure_scalability: "",
  // NEW: Financial sector specific
  financial_regulatory_reporting: "",
  financial_capital_requirements: false,
  financial_capital_details: "",
  financial_stress_testing: false,
  financial_stress_details: "",
  financial_market_impact: "",
  // NEW: Business continuity
  bcp_ai_systems: false,
  bcp_ai_details: "",
  bcp_disaster_recovery: "",
  bcp_backup_systems: false,
  bcp_backup_details: "",
  // NEW: Compliance & audit
  compliance_internal_audit: "",
  compliance_external_audit: false,
  compliance_external_audit_details: "",
  compliance_regulatory_examinations: "",
  compliance_reporting: "",
  // NEW: Risk management
  risk_register: false,
  risk_register_details: "",
  risk_appetite: "",
  risk_mitigation_plans: "",
  risk_reporting: "",
};

export default function AssessmentChooserPage() {
  const router = useRouter();
  const [step, setStep] = useState<"intro" | "form">("intro");
  const [name, setName] = useState("");
  const [systemName, setSystemName] = useState("");
  const [country, setCountry] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyUseCase, setCompanyUseCase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<Record<string, File>>({});
  const [evidenceContent, setEvidenceContent] = useState<Record<string, string>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form answers state
  const [euAnswers, setEuAnswers] = useState<Record<string, any>>({});
  const [ukAnswers, setUkAnswers] = useState<Record<string, any>>(ukInitialState);
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

  // State for MAS multi-page navigation
  const [masCurrentPage, setMasCurrentPage] = useState(0);
  
  // MAS Page structure (7-8 pages)
  const masPages = [
    { id: "profile", title: "System Profile & Company Info" },
    { id: "data", title: "Data & Dependencies" },
    { id: "governance", title: "Governance & Oversight" },
    { id: "inventory", title: "Inventory & Risk Classification" },
    { id: "dataManagement", title: "Data Management & Quality" },
    { id: "technical", title: "Technical Pillars" },
    { id: "operational", title: "Operational Pillars" },
    { id: "security", title: "Security, Monitoring & Capability" },
  ];

  // State for UK multi-page navigation
  const [ukCurrentPage, setUkCurrentPage] = useState(0);
  
  // UK Page structure (7 pages)
  const ukPages = [
    { id: "profile", title: "System Profile & Company Info" },
    { id: "safety", title: "Safety, Security & Robustness" },
    { id: "transparency", title: "Transparency & Explainability" },
    { id: "fairness", title: "Fairness & Data Governance" },
    { id: "accountability", title: "Accountability & Governance" },
    { id: "contestability", title: "Contestability & Redress" },
    { id: "foundation", title: "Foundation Models & High-Impact Systems" },
  ];

  // Load MAS form state from localStorage on mount
  useEffect(() => {
    if (isSingapore && step === "form") {
      const savedState = localStorage.getItem('mas_assessment_state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setMasAnswers(parsed);
          // Restore current page if saved
          const savedPage = localStorage.getItem('mas_current_page');
          if (savedPage) {
            setMasCurrentPage(parseInt(savedPage, 10));
          }
        } catch (e) {
          console.error('Error loading saved MAS state:', e);
          setMasAnswers(masInitialState);
        }
      } else {
        setMasAnswers(masInitialState);
      }
    }
  }, [step, isSingapore]);

  // Load EU form state from localStorage on mount
  useEffect(() => {
    if (isEU && step === "form") {
      const savedState = localStorage.getItem('eu_assessment_state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setEuAnswers(parsed);
        } catch (e) {
          console.error('Error loading saved EU state:', e);
          // Initialize with empty state if parsing fails
          const initial = euQuestions.reduce((acc, q) => {
            if (q.type === "checkbox") acc[q.id] = [];
            else acc[q.id] = "";
            return acc;
          }, {} as Record<string, any>);
          setEuAnswers(initial);
        }
      }
    }
  }, [step, isEU]);

  // Load UK form state from localStorage on mount
  useEffect(() => {
    if (isUK && step === "form") {
      const savedState = localStorage.getItem('uk_assessment_state');
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          setUkAnswers(parsed);
          // Restore current page if saved
          const savedPage = localStorage.getItem('uk_current_page');
          if (savedPage) {
            setUkCurrentPage(parseInt(savedPage, 10));
          }
        } catch (e) {
          console.error('Error loading saved UK state:', e);
          setUkAnswers(ukInitialState);
        }
      } else {
        setUkAnswers(ukInitialState);
      }
    }
  }, [step, isUK]);

  // Save MAS form state to localStorage whenever it changes
  useEffect(() => {
    if (isSingapore && step === "form") {
      localStorage.setItem('mas_assessment_state', JSON.stringify(masAnswers));
      localStorage.setItem('mas_current_page', masCurrentPage.toString());
    }
  }, [masAnswers, masCurrentPage, isSingapore, step]);

  // Save EU form state to localStorage whenever it changes
  useEffect(() => {
    if (isEU && step === "form" && Object.keys(euAnswers).length > 0) {
      localStorage.setItem('eu_assessment_state', JSON.stringify(euAnswers));
    }
  }, [euAnswers, isEU, step]);

  // Save UK form state to localStorage whenever it changes
  useEffect(() => {
    if (isUK && step === "form") {
      localStorage.setItem('uk_assessment_state', JSON.stringify(ukAnswers));
      localStorage.setItem('uk_current_page', ukCurrentPage.toString());
    }
  }, [ukAnswers, ukCurrentPage, isUK, step]);

  // Log page navigation for debugging
  useEffect(() => {
    if (isSingapore && step === "form") {
      console.log("[MAS Form] Page changed:", {
        currentPage: masCurrentPage,
        pageTitle: masPages[masCurrentPage]?.title,
        isLastPage: masCurrentPage === masPages.length - 1,
        totalPages: masPages.length,
        isSubmitting
      });
    }
  }, [masCurrentPage, isSingapore, step]);

  // Initialize answers based on framework
  useEffect(() => {
    if (step === "form") {
      if (isEU) {
        // State is loaded from localStorage in the effect above
        // Only initialize if no saved state exists
        const savedState = localStorage.getItem('eu_assessment_state');
        if (!savedState) {
        const initial = euQuestions.reduce((acc, q) => {
          if (q.type === "checkbox") acc[q.id] = [];
          else acc[q.id] = "";
          return acc;
        }, {} as Record<string, any>);
        setEuAnswers(initial);
        }
      } else if (isUK) {
        // State is loaded from localStorage in the effect above
        // Only initialize if no saved state exists
        const savedState = localStorage.getItem('uk_assessment_state');
        if (!savedState) {
          setUkAnswers(ukInitialState);
        }
      } else if (isSingapore) {
        // State is loaded from localStorage in the effect above
        // Only initialize if no saved state exists
        const savedState = localStorage.getItem('mas_assessment_state');
        if (!savedState) {
        setMasAnswers(masInitialState);
        }
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
    if (!companyName.trim()) {
      setError("Please provide your company name.");
      return;
    }
    if (!companyUseCase.trim()) {
      setError("Please describe what your company is using this AI system for.");
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

  const handleEvidenceFileChange = async (key: string, file: File | null) => {
    if (!file) {
      // Remove file
      setEvidenceFiles((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      setEvidenceContent((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      // Update the appropriate form state (MAS or UK)
      if (key.startsWith('uk_')) {
        setUkAnswers((prev) => ({ ...prev, [key]: "" }));
      } else {
        handleMasChange(key, "");
      }
      return;
    }

    // Store file
    setEvidenceFiles((prev) => ({ ...prev, [key]: file }));
    
    // Update the appropriate form state (MAS or UK)
    if (key.startsWith('uk_')) {
      setUkAnswers((prev) => ({ ...prev, [key]: file.name }));
    } else {
      handleMasChange(key, file.name);
    }

    // Process file immediately to extract text using backend endpoint
    try {
      const formData = new FormData();
      formData.append('files', file);

      const res = await backendFetch('/api/process-evidence', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.files && data.files[file.name]) {
          setEvidenceContent((prev) => ({
            ...prev,
            [key]: data.files[file.name],
          }));
        }
      } else {
        console.error('Failed to process evidence file:', file.name);
      }
    } catch (error) {
      console.error('Error processing evidence file:', error);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if not on last page for MAS or UK form
    if (isSingapore && masCurrentPage < masPages.length - 1) {
      console.log("[MAS Form] Prevented form submission - not on last page. Current page:", masCurrentPage, "Total pages:", masPages.length);
      return;
    }
    if (isUK && ukCurrentPage < ukPages.length - 1) {
      console.log("[UK Form] Prevented form submission - not on last page. Current page:", ukCurrentPage, "Total pages:", ukPages.length);
      return;
    }
    
    console.log("[Form Submit] Starting submission...", {
      isSingapore,
      masCurrentPage,
      isEU,
      isUK,
      isSubmitting
    });
    
    setIsSubmitting(true);
    setError(null);

    try {
      let endpoint = "";
      let payload: any = { name, country, system_name: systemName };

      if (isEU) {
        endpoint = "/api/compliance";
        payload = { 
          ...euAnswers, 
          system_name: systemName,
          company_name: companyName,
          company_use_case: companyUseCase,
        };
      } else if (isUK) {
        endpoint = "/api/uk-compliance";
        // Include evidence content in payload for AI processing
        const ukEvidencePayload: Record<string, string> = {};
        Object.keys(evidenceContent).forEach(key => {
          // Include all UK-specific evidence (keys starting with uk_ or evidence fields from UK form)
          if (evidenceContent[key] && (
            key.startsWith('uk_') || 
            key.includes('robustness') || 
            key.includes('cybersecurity') || 
            key.includes('transparency') || 
            key.includes('fairness') || 
            key.includes('accountability') || 
            key.includes('human_oversight') ||
            key.includes('risk_management') ||
            key.includes('audit_trail') ||
            key.includes('user_rights') ||
            key.includes('appeal_mechanism') ||
            key.includes('redress') ||
            key.includes('complaint_handling') ||
            key.includes('foundation_model')
          )) {
            ukEvidencePayload[`${key}_content`] = evidenceContent[key];
          }
        });
        
        payload = { 
          answers: {
            ...ukAnswers,
            ...ukEvidencePayload, // Include extracted evidence text
          },
          system_name: ukAnswers.system_name || systemName,
          company_name: companyName,
          company_use_case: companyUseCase,
        };
      } else if (isSingapore) {
        endpoint = "/api/mas-compliance";
        // Include evidence content in payload for AI processing
        const evidencePayload: Record<string, string> = {};
        Object.keys(evidenceContent).forEach(key => {
          if (evidenceContent[key]) {
            evidencePayload[`${key}_content`] = evidenceContent[key];
          }
        });
        
        payload = { 
          ...masAnswers, 
          company_name: companyName,
          company_use_case: companyUseCase,
          ...evidencePayload, // Include extracted evidence text
        }; // MAS already has system_name in masAnswers
      } else {
        // Default to EU
        endpoint = "/api/compliance";
        payload = { 
          ...euAnswers, 
          system_name: systemName,
          company_name: companyName,
          company_use_case: companyUseCase,
        };
    }

      const res = await backendFetch(endpoint, {
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
      
      // Clear localStorage after successful submission to start fresh next time
      if (isSingapore) {
        localStorage.removeItem('mas_assessment_state');
        localStorage.removeItem('mas_current_page');
        console.log("[MAS Form] Cleared localStorage after successful submission");
      } else if (isEU) {
        localStorage.removeItem('eu_assessment_state');
        console.log("[EU Form] Cleared localStorage after successful submission");
      } else if (isUK) {
        localStorage.removeItem('uk_assessment_state');
        localStorage.removeItem('uk_current_page');
        console.log("[UK Form] Cleared localStorage after successful submission");
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
              <Label className="text-foreground">Company name *</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Acme Corporation, Tech Solutions Inc."
                required
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">What is your company name?</p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">What is your company using this AI system for? *</Label>
              <Textarea
                value={companyUseCase}
                onChange={(e) => setCompanyUseCase(e.target.value)}
                placeholder="e.g., We are a financial services company using AI for fraud detection in credit card transactions. We process customer payment data to identify suspicious patterns and prevent fraudulent activities."
                required
                className="rounded-xl min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">Describe your company's business and how you plan to use this AI system</p>
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
              {name} - {companyName} - {country}
            </CardDescription>
            {isSingapore && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Step {masCurrentPage + 1} of {masPages.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {masPages[masCurrentPage].title}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((masCurrentPage + 1) / masPages.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {isUK && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Step {ukCurrentPage + 1} of {ukPages.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {ukPages[ukCurrentPage].title}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((ukCurrentPage + 1) / ukPages.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </CardHeader>
        <CardContent>
          <form 
            onSubmit={handleFormSubmit} 
            onKeyDown={(e) => {
              // Prevent Enter key from submitting form unless on last page
              if (e.key === 'Enter' && isSingapore && masCurrentPage < masPages.length - 1) {
                e.preventDefault();
                console.log("[MAS Form] Prevented Enter key submission - not on last page");
              }
              if (e.key === 'Enter' && isUK && ukCurrentPage < ukPages.length - 1) {
                e.preventDefault();
                console.log("[UK Form] Prevented Enter key submission - not on last page");
              }
            }}
            className="space-y-6"
          >
            {isUK ? (
              // UK multi-page form
              <div className="space-y-6">
                {/* Page 1: System Profile & Company Info */}
                {ukCurrentPage === 0 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">System Profile & Company Information</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Tell us about your AI system and company - basic information to get started
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">System name *</Label>
                      <Input
                        value={ukAnswers.system_name || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, system_name: e.target.value})}
                        placeholder="e.g., Fraud Detection Engine, Customer Chatbot"
                        required
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">Give your AI system a clear, descriptive name</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Owner / Team</Label>
                      <Input
                        value={ukAnswers.owner || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, owner: e.target.value})}
                        placeholder="e.g., Risk Operations, Product Team"
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">Who is responsible for this system?</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Jurisdiction(s)</Label>
                      <Input
                        value={ukAnswers.jurisdiction || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, jurisdiction: e.target.value})}
                        placeholder="e.g., UK, EU, Global"
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">Where does this system operate?</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Sector / Industry *</Label>
                      <Select
                        value={ukAnswers.sector || ""}
                        onValueChange={(v) => setUkAnswers({...ukAnswers, sector: v})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                        <SelectContent className="!bg-white !border-2 !border-gray-200 !text-gray-900 z-50 shadow-xl">
                          <SelectItem value="finance" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Finance (FCA regulated)</SelectItem>
                          <SelectItem value="healthcare" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Healthcare (MHRA regulated)</SelectItem>
                          <SelectItem value="telecoms" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Telecommunications (Ofcom regulated)</SelectItem>
                          <SelectItem value="competition" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Competition/Markets (CMA regulated)</SelectItem>
                          <SelectItem value="data_privacy" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Data Privacy (ICO regulated)</SelectItem>
                          <SelectItem value="other" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Other sector</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">What industry does this system serve?</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">System Status</Label>
                      <Select
                        value={ukAnswers.system_status || "envision"}
                        onValueChange={(v) => setUkAnswers({...ukAnswers, system_status: v})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="!bg-white !border-2 !border-gray-200 !text-gray-900 z-50 shadow-xl">
                          <SelectItem 
                            value="envision" 
                            className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2"
                            style={{ backgroundColor: '#ffffff', color: '#111827' }}
                          >
                            Envision - Planning and resource allocation
                          </SelectItem>
                          <SelectItem 
                            value="development" 
                            className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2"
                            style={{ backgroundColor: '#ffffff', color: '#111827' }}
                          >
                            Development - Still being built
                          </SelectItem>
                          <SelectItem 
                            value="staging" 
                            className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2"
                            style={{ backgroundColor: '#ffffff', color: '#111827' }}
                          >
                            Staging - Testing before launch
                          </SelectItem>
                          <SelectItem 
                            value="production" 
                            className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2"
                            style={{ backgroundColor: '#ffffff', color: '#111827' }}
                          >
                            Production - Live and in use
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Current stage of your AI system</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Business Purpose / Use Case</Label>
                      <Input
                        value={ukAnswers.business_use_case || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, business_use_case: e.target.value})}
                        placeholder="e.g., Automated credit scoring, Customer support"
                        className="rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">What problem does this system solve?</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-foreground">System Description *</Label>
                      <Textarea
                        value={ukAnswers.description || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, description: e.target.value})}
                        placeholder="Provide a brief description of what your AI system does, how it works, and its main purpose..."
                        className="min-h-[100px] rounded-xl"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Describe your AI system in 2-3 sentences</p>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 2: Safety, Security & Robustness */}
                {ukCurrentPage === 1 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Safety, Security & Robustness</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Ensure your AI system is safe, secure, and robust against errors and attacks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Robustness testing and validation</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.robustness_testing 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.robustness_testing ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.robustness_testing}
                            onClick={() => setUkAnswers({...ukAnswers, robustness_testing: !ukAnswers.robustness_testing})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.robustness_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.robustness_testing ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.robustness_testing ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.robustness_testing && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What testing methods do you use?</Label>
                            <Textarea
                              value={ukAnswers.robustness_testing_methods || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, robustness_testing_methods: e.target.value})}
                              placeholder="e.g., Unit tests, integration tests, stress tests"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>How frequently do you conduct robustness testing?</Label>
                            <Input
                              value={ukAnswers.robustness_testing_frequency || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, robustness_testing_frequency: e.target.value})}
                              placeholder="e.g., Weekly, before each release"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Test results summary</Label>
                            <Textarea
                              value={ukAnswers.robustness_test_results || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, robustness_test_results: e.target.value})}
                              placeholder="Brief summary of test results"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload robustness testing reports or documentation</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_robustness_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_robustness_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_robustness_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Red-teaming or adversarial testing</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.red_teaming 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.red_teaming ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.red_teaming}
                            onClick={() => setUkAnswers({...ukAnswers, red_teaming: !ukAnswers.red_teaming})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.red_teaming ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.red_teaming ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.red_teaming ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.red_teaming && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>Who conducts red-teaming?</Label>
                            <Input
                              value={ukAnswers.red_teaming_who || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, red_teaming_who: e.target.value})}
                              placeholder="e.g., Internal security team, external consultants"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Methodology used</Label>
                            <Textarea
                              value={ukAnswers.red_teaming_methodology || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, red_teaming_methodology: e.target.value})}
                              placeholder="Describe your red-teaming approach"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Key findings</Label>
                            <Textarea
                              value={ukAnswers.red_teaming_findings || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, red_teaming_findings: e.target.value})}
                              placeholder="Summary of findings and actions taken"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload red-teaming reports or test results</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_red_teaming_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_red_teaming_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_red_teaming_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Misuse prevention measures</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.misuse_prevention 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.misuse_prevention ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.misuse_prevention}
                            onClick={() => setUkAnswers({...ukAnswers, misuse_prevention: !ukAnswers.misuse_prevention})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.misuse_prevention ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.misuse_prevention ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.misuse_prevention ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.misuse_prevention && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What specific measures are in place?</Label>
                            <Textarea
                              value={ukAnswers.misuse_prevention_measures || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, misuse_prevention_measures: e.target.value})}
                              placeholder="e.g., Access controls, usage monitoring, rate limiting"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>How do you monitor for misuse?</Label>
                            <Textarea
                              value={ukAnswers.misuse_monitoring || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, misuse_monitoring: e.target.value})}
                              placeholder="Describe monitoring processes"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Cybersecurity controls and monitoring</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.cybersecurity 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.cybersecurity ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.cybersecurity}
                            onClick={() => setUkAnswers({...ukAnswers, cybersecurity: !ukAnswers.cybersecurity})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.cybersecurity ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.cybersecurity ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.cybersecurity ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.cybersecurity && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What cybersecurity controls are implemented?</Label>
                            <Textarea
                              value={ukAnswers.cybersecurity_controls || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, cybersecurity_controls: e.target.value})}
                              placeholder="e.g., Encryption, authentication, network security"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Incident response plan</Label>
                            <Textarea
                              value={ukAnswers.cybersecurity_incident_response || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, cybersecurity_incident_response: e.target.value})}
                              placeholder="Describe your incident response procedures"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Monitoring approach</Label>
                            <Textarea
                              value={ukAnswers.cybersecurity_monitoring || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, cybersecurity_monitoring: e.target.value})}
                              placeholder="How do you monitor for security threats?"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload cybersecurity documentation or security assessment reports</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_cybersecurity_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_cybersecurity_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_cybersecurity_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Safety testing protocols</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.safety_testing 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.safety_testing ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.safety_testing}
                            onClick={() => setUkAnswers({...ukAnswers, safety_testing: !ukAnswers.safety_testing})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.safety_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.safety_testing ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.safety_testing ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.safety_testing && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What safety testing protocols are in place?</Label>
                            <Textarea
                              value={ukAnswers.safety_testing_protocols || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, safety_testing_protocols: e.target.value})}
                              placeholder="Describe your safety testing approach"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Validation methods</Label>
                            <Textarea
                              value={ukAnswers.safety_validation_methods || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, safety_validation_methods: e.target.value})}
                              placeholder="How do you validate safety?"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Risk assessment process</Label>
                      <Textarea
                        value={ukAnswers.risk_assessment_process || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, risk_assessment_process: e.target.value})}
                        placeholder="Describe your risk assessment methodology"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Error handling and fail-safe mechanisms</Label>
                      <Textarea
                        value={ukAnswers.error_handling_mechanisms || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, error_handling_mechanisms: e.target.value})}
                        placeholder="How does your system handle errors and failures?"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Adversarial attack testing</Label>
                      <Textarea
                        value={ukAnswers.adversarial_attack_testing || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, adversarial_attack_testing: e.target.value})}
                        placeholder="Describe testing against adversarial attacks"
                        className="rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 3: Transparency & Explainability */}
                {ukCurrentPage === 2 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Transparency & Explainability</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Ensure users understand when and how AI is being used
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Clear disclosure to users that AI is being used</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.user_disclosure 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.user_disclosure ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.user_disclosure}
                            onClick={() => setUkAnswers({...ukAnswers, user_disclosure: !ukAnswers.user_disclosure})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.user_disclosure ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.user_disclosure ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.user_disclosure ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.user_disclosure && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>How do you disclose AI usage?</Label>
                            <Textarea
                              value={ukAnswers.user_disclosure_how || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, user_disclosure_how: e.target.value})}
                              placeholder="e.g., In-app notifications, terms of service, user interface labels"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>When is disclosure made?</Label>
                            <Input
                              value={ukAnswers.user_disclosure_when || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, user_disclosure_when: e.target.value})}
                              placeholder="e.g., Before first use, at login, continuously"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Format of disclosure</Label>
                            <Textarea
                              value={ukAnswers.user_disclosure_format || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, user_disclosure_format: e.target.value})}
                              placeholder="Describe the format and content"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload disclosure documentation or screenshots</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_transparency_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_transparency_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_transparency_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Explainability mechanisms for decisions</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.explainability 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.explainability ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.explainability}
                            onClick={() => setUkAnswers({...ukAnswers, explainability: !ukAnswers.explainability})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.explainability ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.explainability ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.explainability ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.explainability && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What explainability methods do you use?</Label>
                            <Textarea
                              value={ukAnswers.explainability_methods || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, explainability_methods: e.target.value})}
                              placeholder="e.g., SHAP values, LIME, feature importance, decision trees"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Technical details</Label>
                            <Textarea
                              value={ukAnswers.explainability_technical_details || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, explainability_technical_details: e.target.value})}
                              placeholder="Technical implementation details"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>How do you explain to different user types?</Label>
                            <Textarea
                              value={ukAnswers.explainability_user_types || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, explainability_user_types: e.target.value})}
                              placeholder="e.g., Technical explanations for developers, simple explanations for end users"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload explainability documentation or examples</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_explainability_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_explainability_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_explainability_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Documentation of system capabilities and limitations</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.documentation 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.documentation ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.documentation}
                            onClick={() => setUkAnswers({...ukAnswers, documentation: !ukAnswers.documentation})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.documentation ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.documentation ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.documentation ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.documentation && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What types of documentation exist?</Label>
                            <Textarea
                              value={ukAnswers.documentation_types || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, documentation_types: e.target.value})}
                              placeholder="e.g., API docs, user guides, technical specifications"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Where is documentation stored?</Label>
                            <Input
                              value={ukAnswers.documentation_storage || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, documentation_storage: e.target.value})}
                              placeholder="e.g., Confluence, GitHub wiki, internal portal"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>How frequently is documentation updated?</Label>
                            <Input
                              value={ukAnswers.documentation_update_frequency || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, documentation_update_frequency: e.target.value})}
                              placeholder="e.g., With each release, quarterly, as needed"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Transparency reports or public documentation</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.transparency_reports 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.transparency_reports ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.transparency_reports}
                            onClick={() => setUkAnswers({...ukAnswers, transparency_reports: !ukAnswers.transparency_reports})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.transparency_reports ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.transparency_reports ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.transparency_reports ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.transparency_reports && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What content is included in transparency reports?</Label>
                            <Textarea
                              value={ukAnswers.transparency_reports_content || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, transparency_reports_content: e.target.value})}
                              placeholder="Describe the content and scope"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Publication frequency</Label>
                            <Input
                              value={ukAnswers.transparency_reports_frequency || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, transparency_reports_frequency: e.target.value})}
                              placeholder="e.g., Quarterly, annually"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Where are reports published?</Label>
                            <Input
                              value={ukAnswers.transparency_reports_publication || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, transparency_reports_publication: e.target.value})}
                              placeholder="e.g., Company website, public repository"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Model interpretability techniques</Label>
                      <Textarea
                        value={ukAnswers.model_interpretability || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, model_interpretability: e.target.value})}
                        placeholder="Describe techniques used for model interpretability"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Documentation accessibility</Label>
                      <Textarea
                        value={ukAnswers.documentation_accessibility || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, documentation_accessibility: e.target.value})}
                        placeholder="How accessible is your documentation to different stakeholders?"
                        className="rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 4: Fairness & Data Governance */}
                {ukCurrentPage === 3 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Fairness & Data Governance</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Ensure your AI system treats all users fairly and uses quality data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Bias testing and assessment</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.bias_testing 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.bias_testing ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.bias_testing}
                            onClick={() => setUkAnswers({...ukAnswers, bias_testing: !ukAnswers.bias_testing})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.bias_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.bias_testing ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.bias_testing ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.bias_testing && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What methodology do you use?</Label>
                            <Textarea
                              value={ukAnswers.bias_testing_methodology || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, bias_testing_methodology: e.target.value})}
                              placeholder="Describe your bias testing approach"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>What tools do you use?</Label>
                            <Input
                              value={ukAnswers.bias_testing_tools || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, bias_testing_tools: e.target.value})}
                              placeholder="e.g., Fairness indicators, Aequitas, What-If Tool"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Testing frequency</Label>
                            <Input
                              value={ukAnswers.bias_testing_frequency || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, bias_testing_frequency: e.target.value})}
                              placeholder="e.g., Before deployment, quarterly, with each model update"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Test results summary</Label>
                            <Textarea
                              value={ukAnswers.bias_testing_results || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, bias_testing_results: e.target.value})}
                              placeholder="Summary of bias testing results"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Discriminatory risk mitigation</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.discrimination_mitigation 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.discrimination_mitigation ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.discrimination_mitigation}
                            onClick={() => setUkAnswers({...ukAnswers, discrimination_mitigation: !ukAnswers.discrimination_mitigation})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.discrimination_mitigation ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.discrimination_mitigation ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.discrimination_mitigation ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.discrimination_mitigation && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What measures are in place?</Label>
                            <Textarea
                              value={ukAnswers.discrimination_mitigation_measures || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, discrimination_mitigation_measures: e.target.value})}
                              placeholder="Describe your discrimination mitigation strategies"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Data quality and representativeness checks</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.data_quality 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.data_quality ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.data_quality}
                            onClick={() => setUkAnswers({...ukAnswers, data_quality: !ukAnswers.data_quality})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.data_quality ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.data_quality ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.data_quality ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.data_quality && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What checks do you perform?</Label>
                            <Textarea
                              value={ukAnswers.data_quality_checks || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, data_quality_checks: e.target.value})}
                              placeholder="e.g., Completeness, accuracy, consistency checks"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>What metrics do you use?</Label>
                            <Input
                              value={ukAnswers.data_quality_metrics || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, data_quality_metrics: e.target.value})}
                              placeholder="e.g., Data completeness %, accuracy rate"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Ongoing fairness monitoring</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.fairness_monitoring 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.fairness_monitoring ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.fairness_monitoring}
                            onClick={() => setUkAnswers({...ukAnswers, fairness_monitoring: !ukAnswers.fairness_monitoring})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.fairness_monitoring ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.fairness_monitoring ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.fairness_monitoring ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.fairness_monitoring && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What processes are in place?</Label>
                            <Textarea
                              value={ukAnswers.fairness_monitoring_processes || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, fairness_monitoring_processes: e.target.value})}
                              placeholder="Describe ongoing monitoring processes"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Alert mechanisms</Label>
                            <Textarea
                              value={ukAnswers.fairness_monitoring_alerts || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, fairness_monitoring_alerts: e.target.value})}
                              placeholder="How are fairness issues detected and alerted?"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Does your system handle personal data?</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.personal_data_handling 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.personal_data_handling ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.personal_data_handling}
                            onClick={() => setUkAnswers({...ukAnswers, personal_data_handling: !ukAnswers.personal_data_handling})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.personal_data_handling ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.personal_data_handling ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.personal_data_handling ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.personal_data_handling && (
                        <div className="ml-8 space-y-3 mt-3">
                          <div className="space-y-2">
                            <Label>What types of personal data?</Label>
                            <Textarea
                              value={ukAnswers.personal_data_types || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, personal_data_types: e.target.value})}
                              placeholder="e.g., Names, emails, addresses, financial information"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Data sources</Label>
                            <Textarea
                              value={ukAnswers.personal_data_sources || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, personal_data_sources: e.target.value})}
                              placeholder="Where does personal data come from?"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Data retention policies</Label>
                            <Textarea
                              value={ukAnswers.personal_data_retention || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, personal_data_retention: e.target.value})}
                              placeholder="How long is personal data retained?"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Data representativeness</Label>
                      <Textarea
                        value={ukAnswers.data_representativeness || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, data_representativeness: e.target.value})}
                        placeholder="How do you ensure data represents your user base?"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Protected characteristics consideration</Label>
                      <Textarea
                        value={ukAnswers.protected_characteristics || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, protected_characteristics: e.target.value})}
                        placeholder="How do you handle protected characteristics (age, gender, race, etc.)?"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Fairness metrics used</Label>
                      <Textarea
                        value={ukAnswers.fairness_metrics_used || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, fairness_metrics_used: e.target.value})}
                        placeholder="e.g., Demographic parity, equalized odds, calibration"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Evidence: Upload fairness testing reports or bias analysis documentation</Label>
                      <Input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleEvidenceFileChange("uk_fairness_evidence", file || null);
                        }}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                      />
                      {evidenceContent.uk_fairness_evidence && (
                        <p className="text-xs text-emerald-400 mt-1">
                          ✓ File processed ({evidenceContent.uk_fairness_evidence.length} characters extracted via OCR)
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 5: Accountability & Governance */}
                {ukCurrentPage === 4 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Accountability & Governance</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Establish clear accountability and governance structures
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Clear accountability framework</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.accountability_framework 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.accountability_framework ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.accountability_framework}
                            onClick={() => setUkAnswers({...ukAnswers, accountability_framework: !ukAnswers.accountability_framework})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.accountability_framework ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.accountability_framework ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.accountability_framework ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.accountability_framework && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>Framework structure</Label>
                            <Textarea
                              value={ukAnswers.accountability_framework_structure || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, accountability_framework_structure: e.target.value})}
                              placeholder="Describe your accountability framework"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Accountability roles</Label>
                            <Textarea
                              value={ukAnswers.accountability_roles || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, accountability_roles: e.target.value})}
                              placeholder="Who is accountable for what?"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload accountability framework documentation</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_accountability_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_accountability_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_accountability_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Human oversight mechanisms</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.human_oversight 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.human_oversight ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.human_oversight}
                            onClick={() => setUkAnswers({...ukAnswers, human_oversight: !ukAnswers.human_oversight})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.human_oversight ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.human_oversight ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.human_oversight ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.human_oversight && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>Who provides oversight?</Label>
                            <Input
                              value={ukAnswers.human_oversight_who || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, human_oversight_who: e.target.value})}
                              placeholder="e.g., Review team, senior management, domain experts"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>When does oversight occur?</Label>
                            <Input
                              value={ukAnswers.human_oversight_when || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, human_oversight_when: e.target.value})}
                              placeholder="e.g., Before deployment, for high-risk decisions, continuously"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>How is oversight implemented?</Label>
                            <Textarea
                              value={ukAnswers.human_oversight_how || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, human_oversight_how: e.target.value})}
                              placeholder="Describe oversight processes"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload human oversight documentation or procedures</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_human_oversight_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_human_oversight_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_human_oversight_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Risk management processes</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.risk_management 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.risk_management ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.risk_management}
                            onClick={() => setUkAnswers({...ukAnswers, risk_management: !ukAnswers.risk_management})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.risk_management ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.risk_management ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.risk_management ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.risk_management && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What processes are in place?</Label>
                            <Textarea
                              value={ukAnswers.risk_management_processes || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, risk_management_processes: e.target.value})}
                              placeholder="Describe your risk management approach"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Documentation</Label>
                            <Textarea
                              value={ukAnswers.risk_management_documentation || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, risk_management_documentation: e.target.value})}
                              placeholder="How are risks documented?"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload risk management documentation or risk assessments</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_risk_management_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_risk_management_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_risk_management_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Governance structure and roles</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.governance_structure 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.governance_structure ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.governance_structure}
                            onClick={() => setUkAnswers({...ukAnswers, governance_structure: !ukAnswers.governance_structure})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.governance_structure ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.governance_structure ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.governance_structure ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.governance_structure && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>Board involvement</Label>
                            <Textarea
                              value={ukAnswers.governance_board_involvement || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, governance_board_involvement: e.target.value})}
                              placeholder="How is the board involved in AI governance?"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Governance committees</Label>
                            <Textarea
                              value={ukAnswers.governance_committees || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, governance_committees: e.target.value})}
                              placeholder="What committees exist for AI governance?"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Audit trail and record-keeping</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.audit_trail 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.audit_trail ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.audit_trail}
                            onClick={() => setUkAnswers({...ukAnswers, audit_trail: !ukAnswers.audit_trail})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.audit_trail ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.audit_trail ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.audit_trail ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.audit_trail && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What is logged?</Label>
                            <Textarea
                              value={ukAnswers.audit_trail_what || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, audit_trail_what: e.target.value})}
                              placeholder="e.g., Decisions, inputs, model versions, user actions"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Retention period</Label>
                            <Input
                              value={ukAnswers.audit_trail_retention || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, audit_trail_retention: e.target.value})}
                              placeholder="e.g., 7 years, indefinitely"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Who has access?</Label>
                            <Input
                              value={ukAnswers.audit_trail_access || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, audit_trail_access: e.target.value})}
                              placeholder="e.g., Compliance team, auditors, regulators"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload audit trail documentation or sample logs</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_audit_trail_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_audit_trail_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_audit_trail_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Senior management oversight</Label>
                      <Textarea
                        value={ukAnswers.senior_management_oversight || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, senior_management_oversight: e.target.value})}
                        placeholder="How does senior management oversee AI systems?"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Do you have an ethics committee?</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.ethics_committee 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.ethics_committee ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.ethics_committee}
                            onClick={() => setUkAnswers({...ukAnswers, ethics_committee: !ukAnswers.ethics_committee})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.ethics_committee ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.ethics_committee ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.ethics_committee ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.ethics_committee && (
                        <div className="ml-8 mt-3">
                          <Textarea
                            value={ukAnswers.ethics_committee_details || ""}
                            onChange={(e) => setUkAnswers({...ukAnswers, ethics_committee_details: e.target.value})}
                            placeholder="Describe your ethics committee structure and role"
                            className="rounded-xl"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Policy assignment and review frequency</Label>
                      <Textarea
                        value={ukAnswers.policy_assignment || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, policy_assignment: e.target.value})}
                        placeholder="Who is assigned to policies and how often are they reviewed?"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Training requirements</Label>
                      <Textarea
                        value={ukAnswers.training_requirements || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, training_requirements: e.target.value})}
                        placeholder="What training is required for staff working with AI systems?"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Escalation procedures</Label>
                      <Textarea
                        value={ukAnswers.escalation_procedures || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, escalation_procedures: e.target.value})}
                        placeholder="How are AI-related issues escalated?"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Who is accountable for this AI system? (Name, role, or department) *</Label>
                      <Input
                        value={ukAnswers.accountable_person || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, accountable_person: e.target.value})}
                        placeholder="e.g., Jane Doe - Head of AI Ethics, or Compliance Department"
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 6: Contestability & Redress */}
                {ukCurrentPage === 5 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Contestability & Redress</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Ensure users can challenge decisions and seek redress
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Clear user rights and information</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.user_rights 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.user_rights ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.user_rights}
                            onClick={() => setUkAnswers({...ukAnswers, user_rights: !ukAnswers.user_rights})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.user_rights ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.user_rights ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.user_rights ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.user_rights && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What rights do users have?</Label>
                            <Textarea
                              value={ukAnswers.user_rights_what || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, user_rights_what: e.target.value})}
                              placeholder="e.g., Right to explanation, right to challenge decisions"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>How are rights communicated?</Label>
                            <Textarea
                              value={ukAnswers.user_rights_communication || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, user_rights_communication: e.target.value})}
                              placeholder="How do you inform users of their rights?"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload user rights documentation or communication materials</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_user_rights_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_user_rights_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_user_rights_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Appeal or challenge mechanism</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.appeal_mechanism 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.appeal_mechanism ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.appeal_mechanism}
                            onClick={() => setUkAnswers({...ukAnswers, appeal_mechanism: !ukAnswers.appeal_mechanism})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.appeal_mechanism ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.appeal_mechanism ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.appeal_mechanism ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.appeal_mechanism && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What is the appeal process?</Label>
                            <Textarea
                              value={ukAnswers.appeal_mechanism_process || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, appeal_mechanism_process: e.target.value})}
                              placeholder="Describe the steps users can take to appeal"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Timeline for appeals</Label>
                            <Input
                              value={ukAnswers.appeal_mechanism_timeline || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, appeal_mechanism_timeline: e.target.value})}
                              placeholder="e.g., Within 30 days, response within 5 business days"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>How accessible is the appeal mechanism?</Label>
                            <Textarea
                              value={ukAnswers.appeal_mechanism_accessibility || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, appeal_mechanism_accessibility: e.target.value})}
                              placeholder="How easy is it for users to appeal?"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload appeal mechanism documentation or process flows</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_appeal_mechanism_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_appeal_mechanism_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_appeal_mechanism_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Redress process for adverse outcomes</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.redress_process 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.redress_process ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.redress_process}
                            onClick={() => setUkAnswers({...ukAnswers, redress_process: !ukAnswers.redress_process})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.redress_process ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.redress_process ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.redress_process ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.redress_process && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What steps are involved?</Label>
                            <Textarea
                              value={ukAnswers.redress_process_steps || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, redress_process_steps: e.target.value})}
                              placeholder="Describe the redress process"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Compensation mechanisms</Label>
                            <Textarea
                              value={ukAnswers.redress_compensation || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, redress_compensation: e.target.value})}
                              placeholder="How is compensation provided if needed?"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Documentation</Label>
                            <Textarea
                              value={ukAnswers.redress_documentation || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, redress_documentation: e.target.value})}
                              placeholder="How are redress cases documented?"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload redress process documentation or case examples</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_redress_process_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_redress_process_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_redress_process_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold flex-1">Complaint handling procedures</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.complaint_handling 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.complaint_handling ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.complaint_handling}
                            onClick={() => setUkAnswers({...ukAnswers, complaint_handling: !ukAnswers.complaint_handling})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.complaint_handling ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.complaint_handling ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.complaint_handling ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.complaint_handling && (
                        <div className="ml-8 space-y-3">
                          <div className="space-y-2">
                            <Label>What procedures are in place?</Label>
                            <Textarea
                              value={ukAnswers.complaint_handling_procedures || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, complaint_handling_procedures: e.target.value})}
                              placeholder="Describe complaint handling processes"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Response time</Label>
                            <Input
                              value={ukAnswers.complaint_response_time || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, complaint_response_time: e.target.value})}
                              placeholder="e.g., Within 48 hours, within 5 business days"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>How are complaints tracked?</Label>
                            <Textarea
                              value={ukAnswers.complaint_tracking || ""}
                              onChange={(e) => setUkAnswers({...ukAnswers, complaint_tracking: e.target.value})}
                              placeholder="Describe complaint tracking system"
                              className="rounded-xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload complaint handling procedures or tracking reports</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("uk_complaint_handling_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.uk_complaint_handling_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.uk_complaint_handling_evidence.length} characters extracted via OCR)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Appeal success rates</Label>
                      <Textarea
                        value={ukAnswers.appeal_success_rates || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, appeal_success_rates: e.target.value})}
                        placeholder="What percentage of appeals are successful?"
                        className="rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Redress outcomes tracking</Label>
                      <Textarea
                        value={ukAnswers.redress_outcomes_tracking || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, redress_outcomes_tracking: e.target.value})}
                        placeholder="How do you track redress outcomes?"
                        className="rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 7: Foundation Models & High-Impact Systems */}
                {ukCurrentPage === 6 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Foundation Models & High-Impact Systems</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Additional requirements for foundation models and high-impact AI systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Is your system a foundation model or high-impact AI system? *</Label>
                      <Select
                        value={ukAnswers.foundation_model || "no"}
                        onValueChange={(v) => setUkAnswers({...ukAnswers, foundation_model: v})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent className="!bg-white !border-2 !border-gray-200 !text-gray-900 z-50 shadow-xl">
                          <SelectItem value="yes" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Yes, it's a foundation model or high-impact system</SelectItem>
                          <SelectItem value="no" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>No</SelectItem>
                          <SelectItem value="unsure" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Unsure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(ukAnswers.foundation_model === "yes" || ukAnswers.foundation_model === "unsure") && (
                      <div className="space-y-4 border-t pt-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Model cards and documentation</Label>
                              <div className="ml-4 flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${
                                  ukAnswers.foundation_model_cards 
                                    ? "text-emerald-900 bg-emerald-300" 
                                    : "text-slate-400 bg-slate-700"
                                }`}>
                                  {ukAnswers.foundation_model_cards ? "YES" : "NO"}
                                </span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={ukAnswers.foundation_model_cards}
                                  onClick={() => setUkAnswers({...ukAnswers, foundation_model_cards: !ukAnswers.foundation_model_cards})}
                                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                                    ukAnswers.foundation_model_cards ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                                  }`}
                                  style={{ backgroundColor: ukAnswers.foundation_model_cards ? '#10b981' : '#9ca3af' }}
                                >
                                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                                    ukAnswers.foundation_model_cards ? "translate-x-5" : "translate-x-0"
                                  }`} />
                                </button>
                              </div>
                            </div>
                          {ukAnswers.foundation_model_cards && (
                            <div className="ml-8 mt-3">
                              <Textarea
                                value={ukAnswers.foundation_model_documentation || ""}
                                onChange={(e) => setUkAnswers({...ukAnswers, foundation_model_documentation: e.target.value})}
                                placeholder="Describe your model card documentation"
                                className="rounded-xl"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Capability testing</Label>
                          <Textarea
                            value={ukAnswers.foundation_model_capability_testing || ""}
                            onChange={(e) => setUkAnswers({...ukAnswers, foundation_model_capability_testing: e.target.value})}
                            placeholder="What capability testing have you conducted?"
                            className="rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Risk assessment specifics</Label>
                          <Textarea
                            value={ukAnswers.foundation_model_risk_assessment || ""}
                            onChange={(e) => setUkAnswers({...ukAnswers, foundation_model_risk_assessment: e.target.value})}
                            placeholder="Describe risk assessment for foundation/high-impact systems"
                            className="rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Deployment restrictions</Label>
                          <Textarea
                            value={ukAnswers.foundation_model_deployment_restrictions || ""}
                            onChange={(e) => setUkAnswers({...ukAnswers, foundation_model_deployment_restrictions: e.target.value})}
                            placeholder="Are there any deployment restrictions?"
                            className="rounded-xl"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Monitoring requirements</Label>
                          <Textarea
                            value={ukAnswers.foundation_model_monitoring || ""}
                            onChange={(e) => setUkAnswers({...ukAnswers, foundation_model_monitoring: e.target.value})}
                            placeholder="What monitoring is in place for foundation/high-impact systems?"
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">Evidence: Upload foundation model documentation, model cards, or capability assessments</Label>
                          <Input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.txt"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              handleEvidenceFileChange("uk_foundation_model_evidence", file || null);
                            }}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                          />
                          {evidenceContent.uk_foundation_model_evidence && (
                            <p className="text-xs text-emerald-400 mt-1">
                              ✓ File processed ({evidenceContent.uk_foundation_model_evidence.length} characters extracted via OCR)
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <Label>Regulatory sandbox participation</Label>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            ukAnswers.regulatory_sandbox 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {ukAnswers.regulatory_sandbox ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={ukAnswers.regulatory_sandbox}
                            onClick={() => setUkAnswers({...ukAnswers, regulatory_sandbox: !ukAnswers.regulatory_sandbox})}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              ukAnswers.regulatory_sandbox ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: ukAnswers.regulatory_sandbox ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              ukAnswers.regulatory_sandbox ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {ukAnswers.regulatory_sandbox && (
                        <div className="ml-8 mt-3">
                          <Textarea
                            value={ukAnswers.regulatory_sandbox_details || ""}
                            onChange={(e) => setUkAnswers({...ukAnswers, regulatory_sandbox_details: e.target.value})}
                            placeholder="Describe your regulatory sandbox participation"
                            className="rounded-xl"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Sector-specific requirements</Label>
                      <Textarea
                        value={ukAnswers.sector_specific_requirements || ""}
                        onChange={(e) => setUkAnswers({...ukAnswers, sector_specific_requirements: e.target.value})}
                        placeholder="Are there any sector-specific requirements (FCA, MHRA, Ofcom, etc.) that apply?"
                        className="rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>
                )}
              </div>
            ) : isSingapore ? (
              // MAS multi-page form
              <div className="space-y-6">
                {/* Page 1: System Profile & Company Info */}
                {masCurrentPage === 0 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">System Profile & Company Information</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Tell us about your AI system and company - basic information to get started
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
                        <SelectContent className="!bg-white !border-2 !border-gray-200 !text-gray-900 z-50 shadow-xl">
                          <SelectItem 
                            value="envision" 
                            className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2"
                            style={{ backgroundColor: '#ffffff', color: '#111827' }}
                          >
                            Envision - Planning and resource allocation
                          </SelectItem>
                          <SelectItem 
                            value="development" 
                            className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2"
                            style={{ backgroundColor: '#ffffff', color: '#111827' }}
                          >
                            Development - Still being built
                          </SelectItem>
                          <SelectItem 
                            value="staging" 
                            className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2"
                            style={{ backgroundColor: '#ffffff', color: '#111827' }}
                          >
                            Staging - Testing before launch
                          </SelectItem>
                          <SelectItem 
                            value="production" 
                            className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2"
                            style={{ backgroundColor: '#ffffff', color: '#111827' }}
                          >
                            Production - Live and in use
                          </SelectItem>
                          <SelectItem 
                            value="deprecated" 
                            className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2"
                            style={{ backgroundColor: '#ffffff', color: '#111827' }}
                          >
                            Deprecated - No longer active
                          </SelectItem>
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
                )}

                {/* Page 2: Data & Dependencies */}
                {masCurrentPage === 1 && (
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
                    <div className="space-y-4 pt-2">
                      {/* Personal Data Question with Sub-questions */}
                      <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Does your system process personal data?</Label>
                          <p className="text-sm text-muted-foreground">Personal data includes names, emails, IDs, or any information that identifies individuals</p>
                        </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              masAnswers.uses_personal_data 
                                ? "text-emerald-900 bg-emerald-300" 
                                : "text-slate-400 bg-slate-700"
                            }`}>
                              {masAnswers.uses_personal_data ? "YES" : "NO"}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={masAnswers.uses_personal_data}
                              onClick={() => handleMasChange("uses_personal_data", !masAnswers.uses_personal_data)}
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                masAnswers.uses_personal_data 
                                  ? "bg-emerald-600 border-emerald-500" 
                                  : "bg-gray-400 border-gray-500"
                              }`}
                              style={{
                                backgroundColor: masAnswers.uses_personal_data ? '#10b981' : '#9ca3af',
                              }}
                            >
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                  masAnswers.uses_personal_data ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                      </div>
                        </div>
                        {masAnswers.uses_personal_data && (
                          <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">What kind of personal data are you using? *</Label>
                              <Textarea
                                value={masAnswers.personal_data_types || ""}
                                onChange={(e) => handleMasChange("personal_data_types", e.target.value)}
                                placeholder="e.g., Names, email addresses, phone numbers, national IDs, customer IDs, usernames, IP addresses, etc."
                                className="min-h-[80px] rounded-xl"
                                required={masAnswers.uses_personal_data}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Where is this personal data logged or stored? *</Label>
                              <Textarea
                                value={masAnswers.personal_data_logged_where || ""}
                                onChange={(e) => handleMasChange("personal_data_logged_where", e.target.value)}
                                placeholder="e.g., Database servers (PostgreSQL), cloud storage (AWS S3), application logs, audit trails, etc."
                                className="min-h-[80px] rounded-xl"
                                required={masAnswers.uses_personal_data}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Personal Data Registry: Which use cases use which personal data?</Label>
                              <Textarea
                                value={masAnswers.personal_data_use_cases || ""}
                                onChange={(e) => handleMasChange("personal_data_use_cases", e.target.value)}
                                placeholder="e.g., Use Case 1 (Resume Screening): Uses names, emails, phone numbers. Use Case 2 (Credit Scoring): Uses IDs, financial records."
                                className="min-h-[100px] rounded-xl"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sensitive Data Question with Sub-questions */}
                      <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Does your system process sensitive or special category data?</Label>
                          <p className="text-sm text-muted-foreground">Sensitive data includes health records, financial info, biometrics, race, religion, etc.</p>
                        </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              masAnswers.uses_special_category_data 
                                ? "text-emerald-900 bg-emerald-300" 
                                : "text-slate-400 bg-slate-700"
                            }`}>
                              {masAnswers.uses_special_category_data ? "YES" : "NO"}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={masAnswers.uses_special_category_data}
                              onClick={() => handleMasChange("uses_special_category_data", !masAnswers.uses_special_category_data)}
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                masAnswers.uses_special_category_data 
                                  ? "bg-emerald-600 border-emerald-500" 
                                  : "bg-gray-400 border-gray-500"
                              }`}
                              style={{
                                backgroundColor: masAnswers.uses_special_category_data ? '#10b981' : '#9ca3af',
                              }}
                            >
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                  masAnswers.uses_special_category_data ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                      </div>
                        </div>
                        {masAnswers.uses_special_category_data && (
                          <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">What specific sensitive data types are you processing? *</Label>
                              <Textarea
                                value={masAnswers.sensitive_data_types || ""}
                                onChange={(e) => handleMasChange("sensitive_data_types", e.target.value)}
                                placeholder="Specify: Health records, financial information, biometric data (fingerprints, face recognition), race/ethnicity, religion, sexual orientation, political opinions, etc."
                                className="min-h-[80px] rounded-xl"
                                required={masAnswers.uses_special_category_data}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Where is sensitive data logged or stored? *</Label>
                              <Textarea
                                value={masAnswers.sensitive_data_logged_where || ""}
                                onChange={(e) => handleMasChange("sensitive_data_logged_where", e.target.value)}
                                placeholder="e.g., Encrypted database, secure cloud storage with access controls, etc."
                                className="min-h-[80px] rounded-xl"
                                required={masAnswers.uses_special_category_data}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Third-Party AI Services Question with Sub-questions */}
                      <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Does your system use third-party AI services?</Label>
                          <p className="text-sm text-muted-foreground">External AI APIs, cloud AI services, or pre-built AI models from vendors</p>
                        </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              masAnswers.uses_third_party_ai 
                                ? "text-emerald-900 bg-emerald-300" 
                                : "text-slate-400 bg-slate-700"
                            }`}>
                              {masAnswers.uses_third_party_ai ? "YES" : "NO"}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={masAnswers.uses_third_party_ai}
                              onClick={() => handleMasChange("uses_third_party_ai", !masAnswers.uses_third_party_ai)}
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                masAnswers.uses_third_party_ai 
                                  ? "bg-emerald-600 border-emerald-500" 
                                  : "bg-gray-400 border-gray-500"
                              }`}
                              style={{
                                backgroundColor: masAnswers.uses_third_party_ai ? '#10b981' : '#9ca3af',
                              }}
                            >
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                  masAnswers.uses_third_party_ai ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        {masAnswers.uses_third_party_ai && (
                          <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">What third-party AI services are you using? *</Label>
                              <Textarea
                                value={masAnswers.third_party_services_list || ""}
                                onChange={(e) => handleMasChange("third_party_services_list", e.target.value)}
                                placeholder="List each service: e.g., OpenAI ChatGPT API, Google Cloud AI, AWS Comprehend, Azure Cognitive Services, Anthropic Claude, etc."
                                className="min-h-[100px] rounded-xl"
                                required={masAnswers.uses_third_party_ai}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Are these third-party services safe? What are they doing with your data? *</Label>
                              <Textarea
                                value={masAnswers.third_party_services_safety || ""}
                                onChange={(e) => handleMasChange("third_party_services_safety", e.target.value)}
                                placeholder="Describe: Data privacy policies, data retention, data sharing practices, security measures, compliance certifications (SOC 2, ISO 27001), etc."
                                className="min-h-[100px] rounded-xl"
                                required={masAnswers.uses_third_party_ai}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 3: Governance & Oversight */}
                {masCurrentPage === 2 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Governance & Oversight</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      AI governance policy, framework, board oversight, and senior management responsibilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Governance & Oversight with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">Governance & Oversight</Label>
                        <p className="text-sm text-muted-foreground">Do you have a documented AI risk governance policy or framework?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.governance_policy 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.governance_policy ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.governance_policy}
                            onClick={() => handleMasChange("governance_policy", !masAnswers.governance_policy)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.governance_policy ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.governance_policy ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.governance_policy ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.governance_policy && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What kind of governance policy do you have? *</Label>
                            <Textarea
                              value={masAnswers.governance_policy_type || ""}
                              onChange={(e) => handleMasChange("governance_policy_type", e.target.value)}
                              placeholder="e.g., AI Ethics Policy, AI Risk Management Framework, Responsible AI Guidelines, etc."
                              className="min-h-[80px] rounded-xl"
                              required={masAnswers.governance_policy}
                      />
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What framework or standard does your policy follow? *</Label>
                            <Textarea
                              value={masAnswers.governance_framework || ""}
                              onChange={(e) => handleMasChange("governance_framework", e.target.value)}
                              placeholder="e.g., MAS AI Guidelines, ISO/IEC 23053, NIST AI RMF, company-specific framework, etc."
                              className="min-h-[80px] rounded-xl"
                              required={masAnswers.governance_policy}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What is the role of the Board of Directors in AI governance oversight? *</Label>
                            <Textarea
                              value={masAnswers.governance_board_role || ""}
                              onChange={(e) => handleMasChange("governance_board_role", e.target.value)}
                              placeholder="Describe: Does the board review AI risks? How often? What decisions require board approval? What is their oversight responsibility?"
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.governance_policy}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What is the role of Senior Management in AI governance? *</Label>
                            <Textarea
                              value={masAnswers.governance_senior_management || ""}
                              onChange={(e) => handleMasChange("governance_senior_management", e.target.value)}
                              placeholder="Describe: Who are the accountable senior managers? What are their responsibilities? How do they oversee AI systems?"
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.governance_policy}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Has your policy assigned responsibilities for data management, risk assessment, and compliance? *</Label>
                            <Textarea
                              value={masAnswers.governance_policy_assigned || ""}
                              onChange={(e) => handleMasChange("governance_policy_assigned", e.target.value)}
                              placeholder="Describe: Who is responsible for data management? Who handles risk assessments? Who ensures compliance? Are roles clearly defined?"
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.governance_policy}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload your governance policy document</Label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("governance_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.governance_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.governance_evidence.length} characters extracted)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: AI Ethics Committee */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">AI Ethics Committee/Board</Label>
                          <p className="text-sm text-muted-foreground">Does your organization have a dedicated AI ethics committee or board?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.governance_ethics_committee 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.governance_ethics_committee ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.governance_ethics_committee}
                            onClick={() => handleMasChange("governance_ethics_committee", !masAnswers.governance_ethics_committee)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.governance_ethics_committee ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.governance_ethics_committee ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.governance_ethics_committee ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.governance_ethics_committee && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe the structure, composition, and responsibilities of your AI ethics committee</Label>
                            <Textarea
                              value={masAnswers.governance_ethics_committee_details || ""}
                              onChange={(e) => handleMasChange("governance_ethics_committee_details", e.target.value)}
                              placeholder="e.g., Who are the members? How often do they meet? What decisions do they review? What is their authority?"
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Risk Appetite Statement */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Risk Appetite Statement</Label>
                        <p className="text-sm text-muted-foreground">Have you defined your organization's risk appetite for AI systems?</p>
                        <Textarea
                          value={masAnswers.governance_risk_appetite || ""}
                          onChange={(e) => handleMasChange("governance_risk_appetite", e.target.value)}
                          placeholder="Describe your organization's risk tolerance for AI systems. What level of risk is acceptable? What risks are unacceptable?"
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Policy Review Frequency */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Policy Review Frequency</Label>
                        <p className="text-sm text-muted-foreground">How often is your AI governance policy reviewed and updated?</p>
                        <Input
                          value={masAnswers.governance_policy_review_frequency || ""}
                          onChange={(e) => handleMasChange("governance_policy_review_frequency", e.target.value)}
                          placeholder="e.g., Annually, Quarterly, After major incidents, When regulations change, etc."
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Escalation Procedures */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Escalation Procedures</Label>
                        <p className="text-sm text-muted-foreground">What are the escalation procedures for AI-related incidents or concerns?</p>
                        <Textarea
                          value={masAnswers.governance_escalation_procedures || ""}
                          onChange={(e) => handleMasChange("governance_escalation_procedures", e.target.value)}
                          placeholder="Describe: Who should be notified? What triggers escalation? What is the escalation path? How quickly should incidents be escalated?"
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Compliance Monitoring */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Compliance Monitoring</Label>
                        <p className="text-sm text-muted-foreground">How do you monitor compliance with your AI governance policy?</p>
                        <Textarea
                          value={masAnswers.governance_compliance_monitoring || ""}
                          onChange={(e) => handleMasChange("governance_compliance_monitoring", e.target.value)}
                          placeholder="Describe: Regular audits, automated monitoring, compliance dashboards, reporting mechanisms, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Training Requirements */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Training Requirements</Label>
                        <p className="text-sm text-muted-foreground">Are there mandatory AI governance training requirements for staff?</p>
                        <Textarea
                          value={masAnswers.governance_training_requirements || ""}
                          onChange={(e) => handleMasChange("governance_training_requirements", e.target.value)}
                          placeholder="Describe: Who must complete training? How often? What topics are covered? How is completion tracked?"
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Conflict Resolution */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Conflict Resolution</Label>
                        <p className="text-sm text-muted-foreground">How are conflicts between business objectives and AI ethics resolved?</p>
                        <Textarea
                          value={masAnswers.governance_conflict_resolution || ""}
                          onChange={(e) => handleMasChange("governance_conflict_resolution", e.target.value)}
                          placeholder="Describe: What happens when business goals conflict with ethical AI principles? Who makes the final decision? What is the process?"
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 4: Inventory & Risk Classification */}
                {masCurrentPage === 3 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">System Inventory & Risk Classification</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      System inventory management and risk classification methodology
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* System Inventory & Risk Classification with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">System Inventory & Risk Classification</Label>
                        <p className="text-sm text-muted-foreground">Is this system recorded in your internal AI system inventory?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.inventory_recorded 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.inventory_recorded ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.inventory_recorded}
                            onClick={() => handleMasChange("inventory_recorded", !masAnswers.inventory_recorded)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.inventory_recorded ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.inventory_recorded ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.inventory_recorded ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.inventory_recorded && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Where is this system recorded? (Inventory location/system) *</Label>
                            <Textarea
                              value={masAnswers.inventory_location || ""}
                              onChange={(e) => handleMasChange("inventory_location", e.target.value)}
                              placeholder="e.g., Central AI Registry (Confluence), System Inventory Database, Excel spreadsheet, etc."
                              className="min-h-[80px] rounded-xl"
                              required={masAnswers.inventory_recorded}
                      />
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What is the risk classification assigned to this system? *</Label>
                            <Textarea
                              value={masAnswers.inventory_risk_classification || ""}
                              onChange={(e) => handleMasChange("inventory_risk_classification", e.target.value)}
                              placeholder="e.g., High Risk, Medium Risk, Low Risk. Explain the classification criteria used."
                              className="min-h-[80px] rounded-xl"
                              required={masAnswers.inventory_recorded}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload screenshot or document showing system in inventory</Label>
                            <Input
                              type="file"
                              accept=".pdf,.png,.jpg,.doc,.docx,.txt"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("inventory_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.inventory_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.inventory_evidence.length} characters extracted)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Inventory Update Frequency */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Inventory Update Frequency</Label>
                        <p className="text-sm text-muted-foreground">How often is your AI system inventory updated?</p>
                        <Input
                          value={masAnswers.inventory_update_frequency || ""}
                          onChange={(e) => handleMasChange("inventory_update_frequency", e.target.value)}
                          placeholder="e.g., Monthly, Quarterly, Annually, Real-time, On-demand, etc."
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Risk Classification Methodology */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Risk Classification Methodology</Label>
                        <p className="text-sm text-muted-foreground">What methodology do you use for risk classification?</p>
                        <Textarea
                          value={masAnswers.inventory_risk_methodology || ""}
                          onChange={(e) => handleMasChange("inventory_risk_methodology", e.target.value)}
                          placeholder="e.g., MAS TRM risk matrix, ISO 31000, NIST framework, company-specific methodology, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Risk Review Process */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Risk Review Process</Label>
                        <p className="text-sm text-muted-foreground">How often are risk classifications reviewed?</p>
                        <Textarea
                          value={masAnswers.inventory_risk_review_process || ""}
                          onChange={(e) => handleMasChange("inventory_risk_review_process", e.target.value)}
                          placeholder="Describe: Review frequency, who conducts reviews, what triggers a review, review process, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Critical System Identification */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Critical System Identification</Label>
                        <p className="text-sm text-muted-foreground">Which systems are classified as critical? Why?</p>
                        <Textarea
                          value={masAnswers.inventory_critical_systems || ""}
                          onChange={(e) => handleMasChange("inventory_critical_systems", e.target.value)}
                          placeholder="List critical AI systems and explain why they are classified as critical (e.g., impact on operations, regulatory requirements, etc.)"
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Dependency Mapping */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Dependency Mapping</Label>
                        <p className="text-sm text-muted-foreground">Have you mapped dependencies between AI systems?</p>
                        <Textarea
                          value={masAnswers.inventory_dependency_mapping || ""}
                          onChange={(e) => handleMasChange("inventory_dependency_mapping", e.target.value)}
                          placeholder="Describe: How systems depend on each other, data flows, integration points, failure cascades, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Legacy System Handling */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Legacy System Handling</Label>
                        <p className="text-sm text-muted-foreground">How are legacy AI systems handled in your inventory?</p>
                        <Textarea
                          value={masAnswers.inventory_legacy_systems || ""}
                          onChange={(e) => handleMasChange("inventory_legacy_systems", e.target.value)}
                          placeholder="Describe: How legacy systems are identified, documented, risk-assessed, maintained, or decommissioned"
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 5: Data Management & Quality */}
                {masCurrentPage === 4 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Data Management & Quality</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Data quality checks, bias analysis, data lineage, retention policies, and data minimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Data Management & Quality with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">Data Management & Quality</Label>
                        <p className="text-sm text-muted-foreground">Have you documented data quality checks and bias analysis?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.data_quality_checks 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.data_quality_checks ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.data_quality_checks}
                            onClick={() => handleMasChange("data_quality_checks", !masAnswers.data_quality_checks)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.data_quality_checks ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.data_quality_checks ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.data_quality_checks ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.data_quality_checks && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What data quality checks have you implemented? *</Label>
                            <Textarea
                              value={masAnswers.data_quality_methods || ""}
                              onChange={(e) => handleMasChange("data_quality_methods", e.target.value)}
                              placeholder="e.g., Data completeness checks, data accuracy validation, data freshness monitoring, data consistency checks, etc."
                              className="min-h-[80px] rounded-xl"
                              required={masAnswers.data_quality_checks}
                      />
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">How have you analyzed and documented bias in your data? *</Label>
                            <Textarea
                              value={masAnswers.data_bias_analysis || ""}
                              onChange={(e) => handleMasChange("data_bias_analysis", e.target.value)}
                              placeholder="Describe: Bias detection methods, bias mitigation strategies, demographic representation analysis, fairness metrics used, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.data_quality_checks}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload data quality reports or bias analysis documentation</Label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,.xlsx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleEvidenceFileChange("data_quality_evidence", file || null);
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                            {evidenceContent.data_quality_evidence && (
                              <p className="text-xs text-emerald-400 mt-1">
                                ✓ File processed ({evidenceContent.data_quality_evidence.length} characters extracted)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Data Lineage Tracking */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Data Lineage Tracking</Label>
                          <p className="text-sm text-muted-foreground">Do you track data lineage (where data comes from, transformations)?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.data_lineage_tracking 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.data_lineage_tracking ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.data_lineage_tracking}
                            onClick={() => handleMasChange("data_lineage_tracking", !masAnswers.data_lineage_tracking)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.data_lineage_tracking ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.data_lineage_tracking ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.data_lineage_tracking ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.data_lineage_tracking && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe your data lineage tracking approach</Label>
                            <Textarea
                              value={masAnswers.data_lineage_details || ""}
                              onChange={(e) => handleMasChange("data_lineage_details", e.target.value)}
                              placeholder="Describe: Tools used, what is tracked, how transformations are documented, lineage visualization, etc."
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Data Retention Policies */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Data Retention Policies</Label>
                        <p className="text-sm text-muted-foreground">What are your data retention policies for AI training data?</p>
                        <Textarea
                          value={masAnswers.data_retention_policies || ""}
                          onChange={(e) => handleMasChange("data_retention_policies", e.target.value)}
                          placeholder="Describe: How long is training data retained? What triggers deletion? How is data archived? Compliance with regulations?"
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Data Minimization */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Data Minimization</Label>
                        <p className="text-sm text-muted-foreground">How do you ensure data minimization (collecting only necessary data)?</p>
                        <Textarea
                          value={masAnswers.data_minimization || ""}
                          onChange={(e) => handleMasChange("data_minimization", e.target.value)}
                          placeholder="Describe: Processes to determine what data is necessary, data collection limits, regular reviews, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Data Accuracy Metrics */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Data Accuracy Metrics</Label>
                        <p className="text-sm text-muted-foreground">What metrics do you use to measure data accuracy?</p>
                        <Textarea
                          value={masAnswers.data_accuracy_metrics || ""}
                          onChange={(e) => handleMasChange("data_accuracy_metrics", e.target.value)}
                          placeholder="e.g., Completeness percentage, accuracy rate, error rate, validation rules, data quality scores, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Data Freshness */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Data Freshness</Label>
                        <p className="text-sm text-muted-foreground">How do you ensure training data remains current and relevant?</p>
                        <Textarea
                          value={masAnswers.data_freshness || ""}
                          onChange={(e) => handleMasChange("data_freshness", e.target.value)}
                          placeholder="Describe: Data refresh schedules, staleness detection, data expiration policies, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Synthetic Data Usage */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Synthetic Data Usage</Label>
                          <p className="text-sm text-muted-foreground">Do you use synthetic data? If yes, how is it generated and validated?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.data_synthetic_usage 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.data_synthetic_usage ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.data_synthetic_usage}
                            onClick={() => handleMasChange("data_synthetic_usage", !masAnswers.data_synthetic_usage)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.data_synthetic_usage ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.data_synthetic_usage ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.data_synthetic_usage ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.data_synthetic_usage && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe how synthetic data is generated and validated</Label>
                            <Textarea
                              value={masAnswers.data_synthetic_details || ""}
                              onChange={(e) => handleMasChange("data_synthetic_details", e.target.value)}
                              placeholder="Describe: Generation methods, validation processes, quality checks, use cases, etc."
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Data Privacy Impact Assessment (DPIA) */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Data Privacy Impact Assessment (DPIA)</Label>
                          <p className="text-sm text-muted-foreground">Have you conducted DPIA for AI systems processing personal data?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.data_dpia_conducted 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.data_dpia_conducted ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.data_dpia_conducted}
                            onClick={() => handleMasChange("data_dpia_conducted", !masAnswers.data_dpia_conducted)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.data_dpia_conducted ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.data_dpia_conducted ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.data_dpia_conducted ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.data_dpia_conducted && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe the DPIA findings and mitigation measures</Label>
                            <Textarea
                              value={masAnswers.data_dpia_details || ""}
                              onChange={(e) => handleMasChange("data_dpia_details", e.target.value)}
                              placeholder="Describe: DPIA scope, identified risks, mitigation measures, review frequency, etc."
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Cross-Border Data Transfer */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Cross-Border Data Transfer</Label>
                          <p className="text-sm text-muted-foreground">Do you transfer data across borders? What safeguards are in place?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.data_cross_border 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.data_cross_border ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.data_cross_border}
                            onClick={() => handleMasChange("data_cross_border", !masAnswers.data_cross_border)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.data_cross_border ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.data_cross_border ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.data_cross_border ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.data_cross_border && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe safeguards for cross-border data transfer</Label>
                            <Textarea
                              value={masAnswers.data_cross_border_safeguards || ""}
                              onChange={(e) => handleMasChange("data_cross_border_safeguards", e.target.value)}
                              placeholder="Describe: Standard contractual clauses, adequacy decisions, binding corporate rules, encryption, etc."
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 6: Technical Pillars (Transparency, Fairness, Human Oversight) */}
                {masCurrentPage === 5 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Technical Pillars</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Transparency & Explainability, Fairness & Bias Testing, and Human Oversight
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Transparency & Explainability with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">Transparency & Explainability</Label>
                        <p className="text-sm text-muted-foreground">Do you have documentation explaining how the system works to users or stakeholders?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.transparency_docs 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.transparency_docs ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.transparency_docs}
                            onClick={() => handleMasChange("transparency_docs", !masAnswers.transparency_docs)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.transparency_docs ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.transparency_docs ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.transparency_docs ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.transparency_docs && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What types of transparency documentation do you have? *</Label>
                            <Textarea
                              value={masAnswers.transparency_doc_types || ""}
                              onChange={(e) => handleMasChange("transparency_doc_types", e.target.value)}
                              placeholder="e.g., User guides, system explanation documents, model cards, API documentation, decision explanation reports, etc."
                              className="min-h-[80px] rounded-xl"
                              required={masAnswers.transparency_docs}
                      />
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">How do you explain system decisions to users or stakeholders? *</Label>
                            <Textarea
                              value={masAnswers.transparency_user_explanations || ""}
                              onChange={(e) => handleMasChange("transparency_user_explanations", e.target.value)}
                              placeholder="Describe: Explanation methods (feature importance, decision trees, natural language explanations), when explanations are provided, how users access them, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.transparency_docs}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload transparency documentation</Label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleEvidenceFileChange("transparency_evidence", file || null);
                                }
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Model Cards */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Model Cards</Label>
                          <p className="text-sm text-muted-foreground">Do you maintain model cards for each AI system?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.transparency_model_cards 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.transparency_model_cards ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.transparency_model_cards}
                            onClick={() => handleMasChange("transparency_model_cards", !masAnswers.transparency_model_cards)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.transparency_model_cards ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.transparency_model_cards ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.transparency_model_cards ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.transparency_model_cards && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe what information is included in your model cards</Label>
                            <Textarea
                              value={masAnswers.transparency_model_cards_details || ""}
                              onChange={(e) => handleMasChange("transparency_model_cards_details", e.target.value)}
                              placeholder="e.g., Model purpose, performance metrics, training data, limitations, intended use cases, etc."
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Explainability Methods */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Explainability Methods</Label>
                        <p className="text-sm text-muted-foreground">What explainability methods do you use?</p>
                        <Textarea
                          value={masAnswers.transparency_explainability_methods || ""}
                          onChange={(e) => handleMasChange("transparency_explainability_methods", e.target.value)}
                          placeholder="e.g., SHAP, LIME, attention maps, feature importance, decision trees, counterfactual explanations, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: User Communication */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">User Communication</Label>
                        <p className="text-sm text-muted-foreground">How do you communicate AI system limitations to end users?</p>
                        <Textarea
                          value={masAnswers.transparency_user_communication || ""}
                          onChange={(e) => handleMasChange("transparency_user_communication", e.target.value)}
                          placeholder="Describe: How limitations are communicated, where users can find this information, what limitations are disclosed, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Decision Documentation */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Decision Documentation</Label>
                        <p className="text-sm text-muted-foreground">Are AI decisions documented and traceable?</p>
                        <Textarea
                          value={masAnswers.transparency_decision_documentation || ""}
                          onChange={(e) => handleMasChange("transparency_decision_documentation", e.target.value)}
                          placeholder="Describe: How decisions are logged, what information is recorded, retention period, audit trail, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Interpretability Requirements */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Interpretability Requirements</Label>
                        <p className="text-sm text-muted-foreground">What level of interpretability is required for different use cases?</p>
                        <Textarea
                          value={masAnswers.transparency_interpretability_requirements || ""}
                          onChange={(e) => handleMasChange("transparency_interpretability_requirements", e.target.value)}
                          placeholder="Describe: Different interpretability requirements for different use cases, risk levels, regulatory requirements, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Stakeholder Communication */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Stakeholder Communication</Label>
                        <p className="text-sm text-muted-foreground">How do you communicate AI system behavior to different stakeholders?</p>
                        <Textarea
                          value={masAnswers.transparency_stakeholder_communication || ""}
                          onChange={(e) => handleMasChange("transparency_stakeholder_communication", e.target.value)}
                          placeholder="Describe: How you communicate with customers, regulators, internal teams, what information is shared, communication channels, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Fairness & Bias Testing with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">Fairness & Bias Testing</Label>
                        <p className="text-sm text-muted-foreground">Have you performed bias or discrimination testing on your system?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.fairness_testing 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.fairness_testing ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.fairness_testing}
                            onClick={() => handleMasChange("fairness_testing", !masAnswers.fairness_testing)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.fairness_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.fairness_testing ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.fairness_testing ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.fairness_testing && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What bias or discrimination testing methods have you used? *</Label>
                            <Textarea
                              value={masAnswers.fairness_testing_methods || ""}
                              onChange={(e) => handleMasChange("fairness_testing_methods", e.target.value)}
                              placeholder="e.g., Demographic parity testing, equalized odds, calibration testing, disparate impact analysis, A/B testing across groups, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.fairness_testing}
                      />
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What were the results of your fairness testing? *</Label>
                            <Textarea
                              value={masAnswers.fairness_test_results || ""}
                              onChange={(e) => handleMasChange("fairness_test_results", e.target.value)}
                              placeholder="Describe: Test results, identified biases, fairness metrics scores, any disparities found across demographic groups, mitigation actions taken, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.fairness_testing}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload fairness testing reports or results</Label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,.xlsx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleEvidenceFileChange("fairness_evidence", file || null);
                                }
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Protected Attributes */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Protected Attributes</Label>
                        <p className="text-sm text-muted-foreground">Which protected attributes do you test for?</p>
                        <Textarea
                          value={masAnswers.fairness_protected_attributes || ""}
                          onChange={(e) => handleMasChange("fairness_protected_attributes", e.target.value)}
                          placeholder="e.g., Age, gender, race, religion, ethnicity, sexual orientation, disability, marital status, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Fairness Metrics */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Fairness Metrics</Label>
                        <p className="text-sm text-muted-foreground">What fairness metrics do you use?</p>
                        <Textarea
                          value={masAnswers.fairness_metrics_used || ""}
                          onChange={(e) => handleMasChange("fairness_metrics_used", e.target.value)}
                          placeholder="e.g., Demographic parity, equalized odds, calibration, individual fairness, group fairness, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Bias Mitigation Strategies */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Bias Mitigation Strategies</Label>
                        <p className="text-sm text-muted-foreground">What strategies do you use to mitigate identified biases?</p>
                        <Textarea
                          value={masAnswers.fairness_bias_mitigation || ""}
                          onChange={(e) => handleMasChange("fairness_bias_mitigation", e.target.value)}
                          placeholder="e.g., Pre-processing (data balancing), in-processing (fairness constraints), post-processing (calibration), etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Continuous Monitoring */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Continuous Monitoring</Label>
                        <p className="text-sm text-muted-foreground">How do you continuously monitor for bias in production?</p>
                        <Textarea
                          value={masAnswers.fairness_continuous_monitoring || ""}
                          onChange={(e) => handleMasChange("fairness_continuous_monitoring", e.target.value)}
                          placeholder="Describe: Monitoring tools, alert thresholds, review processes, automated checks, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Adverse Impact Analysis */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Adverse Impact Analysis</Label>
                        <p className="text-sm text-muted-foreground">Have you conducted adverse impact analysis for different demographic groups?</p>
                        <Textarea
                          value={masAnswers.fairness_adverse_impact || ""}
                          onChange={(e) => handleMasChange("fairness_adverse_impact", e.target.value)}
                          placeholder="Describe: Analysis methodology, groups analyzed, findings, mitigation actions taken, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Testing Frequency */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Bias Testing Frequency</Label>
                        <p className="text-sm text-muted-foreground">How often do you conduct bias testing?</p>
                        <Input
                          value={masAnswers.fairness_testing_frequency || ""}
                          onChange={(e) => handleMasChange("fairness_testing_frequency", e.target.value)}
                          placeholder="e.g., Before deployment, quarterly, annually, after model updates, continuous, etc."
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: External Validation */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">External Validation</Label>
                          <p className="text-sm text-muted-foreground">Do you use external auditors to validate fairness testing?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.fairness_external_validation 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.fairness_external_validation ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.fairness_external_validation}
                            onClick={() => handleMasChange("fairness_external_validation", !masAnswers.fairness_external_validation)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.fairness_external_validation ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.fairness_external_validation ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.fairness_external_validation ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.fairness_external_validation && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe the external validation process</Label>
                            <Textarea
                              value={masAnswers.fairness_external_validation_details || ""}
                              onChange={(e) => handleMasChange("fairness_external_validation_details", e.target.value)}
                              placeholder="Describe: Who conducts validation, validation scope, frequency, findings, etc."
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Human Oversight with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">Human Oversight</Label>
                        <p className="text-sm text-muted-foreground">Do you have human-in-the-loop (HITL) or human-on-the-loop (HOTL) processes defined?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.human_oversight 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.human_oversight ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.human_oversight}
                            onClick={() => handleMasChange("human_oversight", !masAnswers.human_oversight)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.human_oversight ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.human_oversight ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.human_oversight ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.human_oversight && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What type of human oversight do you have? (HITL, HOTL, or both) *</Label>
                            <Textarea
                              value={masAnswers.human_oversight_type || ""}
                              onChange={(e) => handleMasChange("human_oversight_type", e.target.value)}
                              placeholder="e.g., Human-in-the-loop (HITL) - humans review every decision before execution. Human-on-the-loop (HOTL) - humans monitor and can intervene. Both - different processes for different scenarios."
                              className="min-h-[80px] rounded-xl"
                              required={masAnswers.human_oversight}
                      />
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe your human oversight processes and when humans intervene *</Label>
                            <Textarea
                              value={masAnswers.human_oversight_processes || ""}
                              onChange={(e) => handleMasChange("human_oversight_processes", e.target.value)}
                              placeholder="Describe: When do humans review decisions? What triggers human intervention? Who are the human reviewers? What is their authority level? Escalation procedures, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.human_oversight}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload human oversight process documentation</Label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleEvidenceFileChange("human_oversight_evidence", file || null);
                                }
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Oversight Roles */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Oversight Roles</Label>
                        <p className="text-sm text-muted-foreground">Who are the designated human overseers? What are their qualifications?</p>
                        <Textarea
                          value={masAnswers.human_oversight_roles || ""}
                          onChange={(e) => handleMasChange("human_oversight_roles", e.target.value)}
                          placeholder="Describe: Who performs oversight, their roles, qualifications, training, experience requirements, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Qualifications */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Oversight Qualifications</Label>
                        <p className="text-sm text-muted-foreground">What qualifications are required for human overseers?</p>
                        <Textarea
                          value={masAnswers.human_oversight_qualifications || ""}
                          onChange={(e) => handleMasChange("human_oversight_qualifications", e.target.value)}
                          placeholder="Describe: Required skills, certifications, experience, domain expertise, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Intervention Triggers */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Intervention Triggers</Label>
                        <p className="text-sm text-muted-foreground">What triggers human intervention in AI decisions?</p>
                        <Textarea
                          value={masAnswers.human_oversight_intervention_triggers || ""}
                          onChange={(e) => handleMasChange("human_oversight_intervention_triggers", e.target.value)}
                          placeholder="Describe: Specific conditions that trigger intervention (e.g., low confidence, high risk, edge cases, anomalies, etc.)"
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Decision Authority */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Decision Authority</Label>
                        <p className="text-sm text-muted-foreground">What authority do human overseers have to override AI decisions?</p>
                        <Textarea
                          value={masAnswers.human_oversight_decision_authority || ""}
                          onChange={(e) => handleMasChange("human_oversight_decision_authority", e.target.value)}
                          placeholder="Describe: Can overseers override decisions? What is the process? What decisions require approval? etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Training */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Oversight Training</Label>
                        <p className="text-sm text-muted-foreground">What training do human overseers receive?</p>
                        <Textarea
                          value={masAnswers.human_oversight_training || ""}
                          onChange={(e) => handleMasChange("human_oversight_training", e.target.value)}
                          placeholder="Describe: Training programs, topics covered, frequency, certification requirements, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Escalation */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Escalation Procedures</Label>
                        <p className="text-sm text-muted-foreground">What are the escalation procedures for oversight issues?</p>
                        <Textarea
                          value={masAnswers.human_oversight_escalation || ""}
                          onChange={(e) => handleMasChange("human_oversight_escalation", e.target.value)}
                          placeholder="Describe: When to escalate, who to escalate to, escalation path, response times, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Documentation */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Oversight Documentation</Label>
                        <p className="text-sm text-muted-foreground">How are human oversight activities documented?</p>
                        <Textarea
                          value={masAnswers.human_oversight_documentation || ""}
                          onChange={(e) => handleMasChange("human_oversight_documentation", e.target.value)}
                          placeholder="Describe: What is documented, documentation format, retention, audit trail, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Automation Percentage */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Automation Level</Label>
                        <p className="text-sm text-muted-foreground">What percentage of decisions are automated vs. require human review?</p>
                        <Input
                          value={masAnswers.human_oversight_automation_percentage || ""}
                          onChange={(e) => handleMasChange("human_oversight_automation_percentage", e.target.value)}
                          placeholder="e.g., 80% automated, 20% human review, or describe the split"
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 7: Operational Pillars (Third-Party, Algorithm, Evaluation) */}
                {masCurrentPage === 6 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Operational Pillars</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Third-Party & Vendor Management, Algorithm & Feature Selection, and Evaluation & Testing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Third-Party & Vendor Management with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">Third-Party & Vendor Management</Label>
                        <p className="text-sm text-muted-foreground">Do you have vendor due diligence and controls in place for third-party AI services?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.third_party_controls 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.third_party_controls ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.third_party_controls}
                            onClick={() => handleMasChange("third_party_controls", !masAnswers.third_party_controls)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.third_party_controls ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.third_party_controls ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.third_party_controls ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.third_party_controls && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What vendor due diligence have you performed? *</Label>
                            <Textarea
                              value={masAnswers.third_party_due_diligence || ""}
                              onChange={(e) => handleMasChange("third_party_due_diligence", e.target.value)}
                              placeholder="Describe: Security assessments, compliance checks (SOC 2, ISO 27001), data privacy reviews, vendor risk assessments, contract reviews, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.third_party_controls}
                      />
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What controls are in place in vendor contracts? *</Label>
                            <Textarea
                              value={masAnswers.third_party_contracts || ""}
                              onChange={(e) => handleMasChange("third_party_contracts", e.target.value)}
                              placeholder="Describe: Data protection clauses, security requirements, audit rights, breach notification, data retention policies, compliance obligations, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.third_party_controls}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload vendor due diligence reports or contracts</Label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleEvidenceFileChange("third_party_controls_evidence", file || null);
                                }
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Vendor Risk Assessment */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Vendor Risk Assessment</Label>
                        <p className="text-sm text-muted-foreground">How do you assess and monitor vendor risks?</p>
                        <Textarea
                          value={masAnswers.third_party_vendor_risk_assessment || ""}
                          onChange={(e) => handleMasChange("third_party_vendor_risk_assessment", e.target.value)}
                          placeholder="Describe: Risk assessment methodology, risk categories evaluated, assessment frequency, risk scoring, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: SLAs */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Service Level Agreements (SLAs)</Label>
                        <p className="text-sm text-muted-foreground">What SLAs do you have with third-party AI vendors?</p>
                        <Textarea
                          value={masAnswers.third_party_slas || ""}
                          onChange={(e) => handleMasChange("third_party_slas", e.target.value)}
                          placeholder="Describe: Uptime guarantees, response times, performance metrics, penalties, monitoring, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Vendor Monitoring */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Vendor Monitoring</Label>
                        <p className="text-sm text-muted-foreground">How do you continuously monitor vendor performance and compliance?</p>
                        <Textarea
                          value={masAnswers.third_party_vendor_monitoring || ""}
                          onChange={(e) => handleMasChange("third_party_vendor_monitoring", e.target.value)}
                          placeholder="Describe: Monitoring tools, metrics tracked, review frequency, compliance checks, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Exit Strategy */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Exit Strategy</Label>
                        <p className="text-sm text-muted-foreground">Do you have an exit strategy if a vendor relationship ends?</p>
                        <Textarea
                          value={masAnswers.third_party_exit_strategy || ""}
                          onChange={(e) => handleMasChange("third_party_exit_strategy", e.target.value)}
                          placeholder="Describe: Data migration plans, transition procedures, service continuity, contract termination clauses, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Data Residency */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Data Residency</Label>
                        <p className="text-sm text-muted-foreground">Where is your data stored by third-party vendors?</p>
                        <Textarea
                          value={masAnswers.third_party_data_residency || ""}
                          onChange={(e) => handleMasChange("third_party_data_residency", e.target.value)}
                          placeholder="Describe: Data storage locations, data residency requirements, cross-border restrictions, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Incident Reporting */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Incident Reporting</Label>
                        <p className="text-sm text-muted-foreground">What are the incident reporting requirements for vendors?</p>
                        <Textarea
                          value={masAnswers.third_party_incident_reporting || ""}
                          onChange={(e) => handleMasChange("third_party_incident_reporting", e.target.value)}
                          placeholder="Describe: Notification timelines, incident types, reporting format, escalation procedures, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Audit Rights */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Audit Rights</Label>
                        <p className="text-sm text-muted-foreground">Do you have audit rights over vendor operations?</p>
                        <Textarea
                          value={masAnswers.third_party_audit_rights || ""}
                          onChange={(e) => handleMasChange("third_party_audit_rights", e.target.value)}
                          placeholder="Describe: Audit frequency, scope, access rights, vendor cooperation requirements, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Multi-Vendor Management */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Multi-Vendor Management</Label>
                        <p className="text-sm text-muted-foreground">How do you manage multiple vendors providing similar services?</p>
                        <Textarea
                          value={masAnswers.third_party_multi_vendor || ""}
                          onChange={(e) => handleMasChange("third_party_multi_vendor", e.target.value)}
                          placeholder="Describe: Vendor diversification strategy, redundancy, comparison processes, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Algorithm & Feature Selection with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">Algorithm & Feature Selection</Label>
                        <p className="text-sm text-muted-foreground">Have you documented your algorithm selection and feature engineering process?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.algo_documented 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.algo_documented ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.algo_documented}
                            onClick={() => handleMasChange("algo_documented", !masAnswers.algo_documented)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.algo_documented ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.algo_documented ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.algo_documented ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.algo_documented && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">How did you select this algorithm? What was the selection process? *</Label>
                            <Textarea
                              value={masAnswers.algo_selection_process || ""}
                              onChange={(e) => handleMasChange("algo_selection_process", e.target.value)}
                              placeholder="Describe: Algorithm comparison process, evaluation criteria, why this algorithm was chosen over alternatives, performance benchmarks, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.algo_documented}
                      />
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">How did you engineer and select features? *</Label>
                            <Textarea
                              value={masAnswers.algo_feature_engineering || ""}
                              onChange={(e) => handleMasChange("algo_feature_engineering", e.target.value)}
                              placeholder="Describe: Feature selection methods, feature importance analysis, feature engineering techniques, why certain features were included/excluded, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.algo_documented}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload algorithm selection documentation or feature engineering notes</Label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,.ipynb"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleEvidenceFileChange("algo_documentation_evidence", file || null);
                                }
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Algorithm Selection Criteria */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Algorithm Selection Criteria</Label>
                        <p className="text-sm text-muted-foreground">What criteria do you use to select algorithms?</p>
                        <Textarea
                          value={masAnswers.algo_selection_criteria || ""}
                          onChange={(e) => handleMasChange("algo_selection_criteria", e.target.value)}
                          placeholder="Describe: Performance metrics, interpretability requirements, computational efficiency, regulatory compliance, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Model Comparison */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Model Comparison</Label>
                        <p className="text-sm text-muted-foreground">How do you compare different model options?</p>
                        <Textarea
                          value={masAnswers.algo_model_comparison || ""}
                          onChange={(e) => handleMasChange("algo_model_comparison", e.target.value)}
                          placeholder="Describe: Comparison methodology, metrics used, A/B testing, cross-validation, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Feature Importance */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Feature Importance Analysis</Label>
                        <p className="text-sm text-muted-foreground">How do you analyze feature importance?</p>
                        <Textarea
                          value={masAnswers.algo_feature_importance || ""}
                          onChange={(e) => handleMasChange("algo_feature_importance", e.target.value)}
                          placeholder="Describe: Methods used (SHAP, permutation importance, etc.), how importance is measured, documentation, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Feature Drift */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Feature Drift Detection</Label>
                        <p className="text-sm text-muted-foreground">How do you detect and handle feature drift?</p>
                        <Textarea
                          value={masAnswers.algo_feature_drift || ""}
                          onChange={(e) => handleMasChange("algo_feature_drift", e.target.value)}
                          placeholder="Describe: Drift detection methods, monitoring frequency, alert thresholds, mitigation strategies, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Model Versioning */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Model Versioning</Label>
                        <p className="text-sm text-muted-foreground">How do you version and track model changes?</p>
                        <Textarea
                          value={masAnswers.algo_model_versioning || ""}
                          onChange={(e) => handleMasChange("algo_model_versioning", e.target.value)}
                          placeholder="Describe: Versioning system, change tracking, rollback procedures, documentation, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: A/B Testing */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">A/B Testing</Label>
                          <p className="text-sm text-muted-foreground">Do you conduct A/B testing for algorithm selection?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.algo_ab_testing 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.algo_ab_testing ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.algo_ab_testing}
                            onClick={() => handleMasChange("algo_ab_testing", !masAnswers.algo_ab_testing)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.algo_ab_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.algo_ab_testing ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.algo_ab_testing ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.algo_ab_testing && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe your A/B testing methodology</Label>
                            <Textarea
                              value={masAnswers.algo_ab_testing_details || ""}
                              onChange={(e) => handleMasChange("algo_ab_testing_details", e.target.value)}
                              placeholder="Describe: Test design, sample sizes, success metrics, statistical significance, decision criteria, etc."
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Hyperparameter Tuning */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Hyperparameter Tuning</Label>
                        <p className="text-sm text-muted-foreground">How do you tune hyperparameters?</p>
                        <Textarea
                          value={masAnswers.algo_hyperparameter_tuning || ""}
                          onChange={(e) => handleMasChange("algo_hyperparameter_tuning", e.target.value)}
                          placeholder="Describe: Tuning methods (grid search, random search, Bayesian optimization), validation approach, documentation, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Evaluation & Testing with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">Evaluation & Testing</Label>
                        <p className="text-sm text-muted-foreground">Have you completed pre-deployment testing and robustness checks?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.evaluation_testing 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.evaluation_testing ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.evaluation_testing}
                            onClick={() => handleMasChange("evaluation_testing", !masAnswers.evaluation_testing)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.evaluation_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.evaluation_testing ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.evaluation_testing ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.evaluation_testing && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What types of pre-deployment testing have you completed? *</Label>
                            <Textarea
                              value={masAnswers.evaluation_test_types || ""}
                              onChange={(e) => handleMasChange("evaluation_test_types", e.target.value)}
                              placeholder="e.g., Unit testing, integration testing, performance testing, accuracy testing, A/B testing, user acceptance testing, stress testing, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.evaluation_testing}
                      />
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What robustness checks have you performed? *</Label>
                            <Textarea
                              value={masAnswers.evaluation_robustness_checks || ""}
                              onChange={(e) => handleMasChange("evaluation_robustness_checks", e.target.value)}
                              placeholder="Describe: Adversarial testing, edge case testing, failure mode analysis, performance under stress, handling of unexpected inputs, error recovery, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.evaluation_testing}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload testing reports or test results</Label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx,.xlsx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleEvidenceFileChange("evaluation_evidence", file || null);
                                }
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Test Data Management */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Test Data Management</Label>
                        <p className="text-sm text-muted-foreground">How do you manage test data for evaluation?</p>
                        <Textarea
                          value={masAnswers.evaluation_test_data_management || ""}
                          onChange={(e) => handleMasChange("evaluation_test_data_management", e.target.value)}
                          placeholder="Describe: Test data sources, data splitting strategy, test data quality, privacy considerations, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Performance Benchmarks */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Performance Benchmarks</Label>
                        <p className="text-sm text-muted-foreground">What performance benchmarks do you use?</p>
                        <Textarea
                          value={masAnswers.evaluation_performance_benchmarks || ""}
                          onChange={(e) => handleMasChange("evaluation_performance_benchmarks", e.target.value)}
                          placeholder="Describe: Benchmark datasets, baseline comparisons, industry standards, target metrics, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Regression Testing */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Regression Testing</Label>
                          <p className="text-sm text-muted-foreground">Do you perform regression testing when models are updated?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.evaluation_regression_testing 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.evaluation_regression_testing ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.evaluation_regression_testing}
                            onClick={() => handleMasChange("evaluation_regression_testing", !masAnswers.evaluation_regression_testing)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.evaluation_regression_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.evaluation_regression_testing ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.evaluation_regression_testing ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.evaluation_regression_testing && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe your regression testing process</Label>
                            <Textarea
                              value={masAnswers.evaluation_regression_details || ""}
                              onChange={(e) => handleMasChange("evaluation_regression_details", e.target.value)}
                              placeholder="Describe: Test suite, comparison methodology, pass/fail criteria, automation, etc."
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Stress Testing */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Stress Testing</Label>
                          <p className="text-sm text-muted-foreground">Have you conducted stress testing under extreme conditions?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.evaluation_stress_testing 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.evaluation_stress_testing ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.evaluation_stress_testing}
                            onClick={() => handleMasChange("evaluation_stress_testing", !masAnswers.evaluation_stress_testing)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.evaluation_stress_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.evaluation_stress_testing ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.evaluation_stress_testing ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.evaluation_stress_testing && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe your stress testing methodology and results</Label>
                            <Textarea
                              value={masAnswers.evaluation_stress_testing_details || ""}
                              onChange={(e) => handleMasChange("evaluation_stress_testing_details", e.target.value)}
                              placeholder="Describe: Test scenarios, extreme conditions tested, system behavior, failure points, etc."
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Failsafe Mechanisms */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Failsafe Mechanisms</Label>
                        <p className="text-sm text-muted-foreground">What failsafe mechanisms do you have in place?</p>
                        <Textarea
                          value={masAnswers.evaluation_failsafe_mechanisms || ""}
                          onChange={(e) => handleMasChange("evaluation_failsafe_mechanisms", e.target.value)}
                          placeholder="Describe: Automatic shutdown triggers, fallback systems, error handling, circuit breakers, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Rollback Procedures */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Rollback Procedures</Label>
                        <p className="text-sm text-muted-foreground">What are your procedures for rolling back model deployments?</p>
                        <Textarea
                          value={masAnswers.evaluation_rollback_procedures || ""}
                          onChange={(e) => handleMasChange("evaluation_rollback_procedures", e.target.value)}
                          placeholder="Describe: Rollback triggers, process, time to rollback, data consistency, communication, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Test Documentation */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Test Documentation</Label>
                        <p className="text-sm text-muted-foreground">How do you document test results and evaluation findings?</p>
                        <Textarea
                          value={masAnswers.evaluation_test_documentation || ""}
                          onChange={(e) => handleMasChange("evaluation_test_documentation", e.target.value)}
                          placeholder="Describe: Documentation format, what is recorded, retention, review process, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* Page 8: Security, Monitoring & Capability */}
                {masCurrentPage === 7 && (
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-foreground">Security, Monitoring & Capability</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Technology & Cybersecurity, Monitoring & Change Management, and Capability & Capacity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Technology & Cybersecurity with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">Technology & Cybersecurity</Label>
                        <p className="text-sm text-muted-foreground">Do you have security measures to protect against misuse, prompt injection, or data leakage?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.security_measures 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.security_measures ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.security_measures}
                            onClick={() => handleMasChange("security_measures", !masAnswers.security_measures)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.security_measures ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.security_measures ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.security_measures ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.security_measures && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What cybersecurity measures do you have in place? *</Label>
                            <Textarea
                              value={masAnswers.security_cybersecurity_measures || ""}
                              onChange={(e) => handleMasChange("security_cybersecurity_measures", e.target.value)}
                              placeholder="e.g., Encryption, access controls, authentication, network security, API security, secure coding practices, vulnerability scanning, penetration testing, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.security_measures}
                      />
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">How do you protect against prompt injection attacks? *</Label>
                            <Textarea
                              value={masAnswers.security_prompt_injection || ""}
                              onChange={(e) => handleMasChange("security_prompt_injection", e.target.value)}
                              placeholder="Describe: Input validation, prompt sanitization, rate limiting, monitoring for suspicious prompts, testing for prompt injection vulnerabilities, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.security_measures}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">How do you prevent data leakage? *</Label>
                            <Textarea
                              value={masAnswers.security_data_leakage || ""}
                              onChange={(e) => handleMasChange("security_data_leakage", e.target.value)}
                              placeholder="Describe: Data access controls, data masking, output filtering, logging and monitoring, data retention policies, secure data handling procedures, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.security_measures}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload security documentation or security assessment reports</Label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleEvidenceFileChange("security_evidence", file || null);
                                }
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Access Controls */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Access Controls</Label>
                        <p className="text-sm text-muted-foreground">What access controls do you have for AI systems?</p>
                        <Textarea
                          value={masAnswers.security_access_controls || ""}
                          onChange={(e) => handleMasChange("security_access_controls", e.target.value)}
                          placeholder="Describe: Role-based access control, authentication methods, authorization levels, access reviews, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Encryption */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Encryption</Label>
                        <p className="text-sm text-muted-foreground">How is data encrypted at rest and in transit?</p>
                        <Textarea
                          value={masAnswers.security_encryption || ""}
                          onChange={(e) => handleMasChange("security_encryption", e.target.value)}
                          placeholder="Describe: Encryption standards, key management, TLS/SSL, encryption algorithms, key rotation, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Authentication */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Authentication</Label>
                        <p className="text-sm text-muted-foreground">What authentication mechanisms do you use?</p>
                        <Textarea
                          value={masAnswers.security_authentication || ""}
                          onChange={(e) => handleMasChange("security_authentication", e.target.value)}
                          placeholder="Describe: Multi-factor authentication, SSO, API keys, OAuth, biometrics, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Network Security */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Network Security</Label>
                        <p className="text-sm text-muted-foreground">What network security measures are in place?</p>
                        <Textarea
                          value={masAnswers.security_network_security || ""}
                          onChange={(e) => handleMasChange("security_network_security", e.target.value)}
                          placeholder="Describe: Firewalls, VPNs, network segmentation, DDoS protection, intrusion detection, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Vulnerability Scanning */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Vulnerability Scanning</Label>
                        <p className="text-sm text-muted-foreground">How often do you scan for vulnerabilities?</p>
                        <Textarea
                          value={masAnswers.security_vulnerability_scanning || ""}
                          onChange={(e) => handleMasChange("security_vulnerability_scanning", e.target.value)}
                          placeholder="Describe: Scanning frequency, tools used, vulnerability management process, remediation timelines, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Penetration Testing */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Penetration Testing</Label>
                          <p className="text-sm text-muted-foreground">Do you conduct penetration testing?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.security_penetration_testing 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.security_penetration_testing ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.security_penetration_testing}
                            onClick={() => handleMasChange("security_penetration_testing", !masAnswers.security_penetration_testing)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.security_penetration_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.security_penetration_testing ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.security_penetration_testing ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.security_penetration_testing && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe your penetration testing process</Label>
                            <Textarea
                              value={masAnswers.security_penetration_details || ""}
                              onChange={(e) => handleMasChange("security_penetration_details", e.target.value)}
                              placeholder="Describe: Testing frequency, scope, testers (internal/external), findings, remediation, etc."
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Incident Response */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Security Incident Response</Label>
                        <p className="text-sm text-muted-foreground">What is your security incident response plan?</p>
                        <Textarea
                          value={masAnswers.security_incident_response || ""}
                          onChange={(e) => handleMasChange("security_incident_response", e.target.value)}
                          placeholder="Describe: Incident detection, response team, containment procedures, notification requirements, recovery, lessons learned, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Security Certifications */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Security Certifications</Label>
                        <p className="text-sm text-muted-foreground">What security certifications or standards do you comply with?</p>
                        <Textarea
                          value={masAnswers.security_certifications || ""}
                          onChange={(e) => handleMasChange("security_certifications", e.target.value)}
                          placeholder="e.g., ISO 27001, SOC 2, PCI DSS, NIST, GDPR compliance, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Monitoring & Change Management with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">Monitoring & Change Management</Label>
                        <p className="text-sm text-muted-foreground">Do you have drift monitoring, incident management, and version control processes?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.monitoring_plan 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.monitoring_plan ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.monitoring_plan}
                            onClick={() => handleMasChange("monitoring_plan", !masAnswers.monitoring_plan)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.monitoring_plan ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.monitoring_plan ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.monitoring_plan ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.monitoring_plan && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">How do you monitor for model drift or performance degradation? *</Label>
                            <Textarea
                              value={masAnswers.monitoring_drift_detection || ""}
                              onChange={(e) => handleMasChange("monitoring_drift_detection", e.target.value)}
                              placeholder="Describe: Drift detection methods, monitoring metrics, alerting thresholds, how often you check for drift, tools used, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.monitoring_plan}
                      />
                    </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What is your incident management process? *</Label>
                            <Textarea
                              value={masAnswers.monitoring_incident_management || ""}
                              onChange={(e) => handleMasChange("monitoring_incident_management", e.target.value)}
                              placeholder="Describe: Incident detection, reporting procedures, escalation process, response team, incident resolution, post-incident review, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.monitoring_plan}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">How do you manage version control and model updates? *</Label>
                            <Textarea
                              value={masAnswers.monitoring_version_control || ""}
                              onChange={(e) => handleMasChange("monitoring_version_control", e.target.value)}
                              placeholder="Describe: Version control system, model versioning strategy, change approval process, rollback procedures, testing before deployment, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.monitoring_plan}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload monitoring plans or incident management procedures</Label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleEvidenceFileChange("monitoring_evidence", file || null);
                                }
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Performance Metrics */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Performance Metrics</Label>
                        <p className="text-sm text-muted-foreground">What performance metrics do you monitor?</p>
                        <Textarea
                          value={masAnswers.monitoring_performance_metrics || ""}
                          onChange={(e) => handleMasChange("monitoring_performance_metrics", e.target.value)}
                          placeholder="Describe: Accuracy, latency, throughput, error rates, resource usage, business metrics, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Alert Thresholds */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Alert Thresholds</Label>
                        <p className="text-sm text-muted-foreground">What alert thresholds do you have configured?</p>
                        <Textarea
                          value={masAnswers.monitoring_alert_thresholds || ""}
                          onChange={(e) => handleMasChange("monitoring_alert_thresholds", e.target.value)}
                          placeholder="Describe: Threshold values, alert conditions, escalation levels, notification channels, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Monitoring Tools */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Monitoring Tools</Label>
                        <p className="text-sm text-muted-foreground">What tools do you use for monitoring?</p>
                        <Textarea
                          value={masAnswers.monitoring_tools || ""}
                          onChange={(e) => handleMasChange("monitoring_tools", e.target.value)}
                          placeholder="e.g., Prometheus, Grafana, DataDog, custom dashboards, logging systems, APM tools, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Change Approval */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Change Approval Process</Label>
                        <p className="text-sm text-muted-foreground">What is your change approval process?</p>
                        <Textarea
                          value={masAnswers.monitoring_change_approval || ""}
                          onChange={(e) => handleMasChange("monitoring_change_approval", e.target.value)}
                          placeholder="Describe: Who approves changes, approval criteria, review process, documentation requirements, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Rollback Capability */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Rollback Capability</Label>
                        <p className="text-sm text-muted-foreground">How quickly can you rollback changes?</p>
                        <Textarea
                          value={masAnswers.monitoring_rollback_capability || ""}
                          onChange={(e) => handleMasChange("monitoring_rollback_capability", e.target.value)}
                          placeholder="Describe: Rollback time, automation level, data consistency, testing, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Change Impact Assessment */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Change Impact Assessment</Label>
                        <p className="text-sm text-muted-foreground">How do you assess the impact of changes?</p>
                        <Textarea
                          value={masAnswers.monitoring_change_impact || ""}
                          onChange={(e) => handleMasChange("monitoring_change_impact", e.target.value)}
                          placeholder="Describe: Impact analysis methodology, risk assessment, stakeholder review, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Post-Deployment Monitoring */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="space-y-2">
                        <Label className="text-base font-medium text-foreground">Post-Deployment Monitoring</Label>
                        <p className="text-sm text-muted-foreground">How do you monitor systems after deployment?</p>
                        <Textarea
                          value={masAnswers.monitoring_post_deployment || ""}
                          onChange={(e) => handleMasChange("monitoring_post_deployment", e.target.value)}
                          placeholder="Describe: Monitoring period, metrics tracked, review frequency, success criteria, etc."
                          className="min-h-[100px] rounded-xl"
                        />
                      </div>
                    </div>

                    {/* NEW: Kill Switch */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Kill Switch</Label>
                          <p className="text-sm text-muted-foreground">Do you have a kill switch to immediately stop the AI system?</p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.monitoring_kill_switch 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.monitoring_kill_switch ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.monitoring_kill_switch}
                            onClick={() => handleMasChange("monitoring_kill_switch", !masAnswers.monitoring_kill_switch)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.monitoring_kill_switch ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.monitoring_kill_switch ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.monitoring_kill_switch ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.monitoring_kill_switch && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Describe your kill switch mechanism</Label>
                            <Textarea
                              value={masAnswers.monitoring_kill_switch_details || ""}
                              onChange={(e) => handleMasChange("monitoring_kill_switch_details", e.target.value)}
                              placeholder="Describe: How it works, who can activate it, activation time, fallback systems, etc."
                              className="min-h-[100px] rounded-xl"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Capability & Capacity with Sub-questions */}
                    <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                        <Label className="text-base font-medium text-foreground">Capability & Capacity</Label>
                        <p className="text-sm text-muted-foreground">Does your team have the necessary skills, training, and infrastructure to manage this AI system?</p>
                      </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            masAnswers.capability_training 
                              ? "text-emerald-900 bg-emerald-300" 
                              : "text-slate-400 bg-slate-700"
                          }`}>
                            {masAnswers.capability_training ? "YES" : "NO"}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={masAnswers.capability_training}
                            onClick={() => handleMasChange("capability_training", !masAnswers.capability_training)}
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                              masAnswers.capability_training ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                            }`}
                            style={{ backgroundColor: masAnswers.capability_training ? '#10b981' : '#9ca3af' }}
                          >
                            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                              masAnswers.capability_training ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                      </div>
                      {masAnswers.capability_training && (
                        <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What skills does your team have for managing AI systems? *</Label>
                            <Textarea
                              value={masAnswers.capability_team_skills || ""}
                              onChange={(e) => handleMasChange("capability_team_skills", e.target.value)}
                              placeholder="Describe: Team members' AI/ML expertise, data science skills, compliance knowledge, risk management experience, certifications, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.capability_training}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What training programs have team members completed? *</Label>
                            <Textarea
                              value={masAnswers.capability_training_programs || ""}
                              onChange={(e) => handleMasChange("capability_training_programs", e.target.value)}
                              placeholder="e.g., AI ethics training, MAS guidelines training, risk assessment workshops, model monitoring courses, compliance certifications, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.capability_training}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">What infrastructure and tools do you have for AI governance? *</Label>
                            <Textarea
                              value={masAnswers.capability_infrastructure || ""}
                              onChange={(e) => handleMasChange("capability_infrastructure", e.target.value)}
                              placeholder="Describe: Monitoring tools, model versioning systems, data quality tools, compliance management platforms, risk assessment tools, etc."
                              className="min-h-[100px] rounded-xl"
                              required={masAnswers.capability_training}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">Evidence: Upload training certificates or infrastructure documentation</Label>
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleEvidenceFileChange("capability_evidence", file || null);
                                }
                              }}
                              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                )}
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
              {isUK ? (
                // UK multi-page navigation
                <>
                  <div className="flex gap-2">
                    {ukCurrentPage > 0 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setUkCurrentPage(ukCurrentPage - 1)}
                        className="rounded-xl"
                      >
                        Previous
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep("intro")}
                        className="rounded-xl"
                      >
                        Back to Intro
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {ukCurrentPage < ukPages.length - 1 ? (
                      <Button
                        type="button"
                        variant="hero"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("[UK Navigation] Moving to next page:", ukCurrentPage + 1);
                          setUkCurrentPage(ukCurrentPage + 1);
                        }}
                        className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        variant="hero"
                        onClick={(e) => {
                          console.log("[UK Form] Submit button clicked on page", ukCurrentPage);
                          // Let form onSubmit handle it
                        }}
                        className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
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
                    )}
                  </div>
                </>
              ) : isSingapore ? (
                // MAS multi-page navigation
                <>
                  <div className="flex gap-2">
                    {masCurrentPage > 0 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMasCurrentPage(masCurrentPage - 1)}
                        className="rounded-xl"
                      >
                        Previous
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep("intro")}
                        className="rounded-xl"
                      >
                        Back to Intro
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {masCurrentPage < masPages.length - 1 ? (
                      <Button
                        type="button"
                        variant="hero"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("[MAS Navigation] Moving to next page:", masCurrentPage + 1);
                          setMasCurrentPage(masCurrentPage + 1);
                        }}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        variant="hero"
                        onClick={(e) => {
                          console.log("[MAS Form] Submit button clicked on page", masCurrentPage);
                          // Let form onSubmit handle it
                        }}
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
                    )}
                  </div>
                </>
              ) : (
                // EU single-page navigation
                <>
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
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

