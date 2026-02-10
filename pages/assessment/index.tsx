"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";

import { Formik } from "formik";
import * as Yup from "yup";


// MAS FORM PAGES
import MasPage1SystemProfile from "./mas/pages/masPage1Intro";
import MasPage2DataDependencies from "./mas/pages/masPage2DataDependencies"
import MasPage3GovernanceOversight from "./mas/pages/masPage3GovernanceOversight"
import MasPage4InventoryRisk from "./mas/pages/masPage4InventoryRisk"
import MasPage5DataManagementQuality from "./mas/pages/masPage5DataManagementQuality"
import MasPage6TechnicalPillars from "./mas/pages/masPage6TechnicalPillars"
import MasPage7OperationalPillars from "./mas/pages/masPage7OperationalPillars"
import SecurityMonitoring from "./mas/pages/securityMonitoring"

// UK FORM PAGES
import UkPage0SystemProfile from "./uk/pages/ukPage0SystemProfile";
import UkPage1SafetySecurityRobustness from "./uk/pages/ukPage1SafetySecurityRobustness";
import UkPage2TransparencyExplainability from "./uk/pages/ukPage2TransparencyExplainability";
import UkPage3FairnessDataGovernance from "./uk/pages/ukPage3FairnessDataGovernance";
import UkPage4AccountabilityGovernance from "./uk/pages/ukPage4AccountabilityGovernance";
import UkPage5ContestabilityRedress from "./uk/pages/ukPage5ContestabilityRedress";
import UkPage6FoundationModels from "./uk/pages/ukPage6FoundationModels";


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
import { Checkbox } from "@/components/ui/checkbox";
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
  const [dataProcessingLocations, setDataProcessingLocations] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<Record<string, File>>({});
  const [evidenceContent, setEvidenceContent] = useState<Record<string, string>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Form answers state
  const [euAnswers, setEuAnswers] = useState<Record<string, any>>({});

  const validationSchema = Yup.object({
    system_name: Yup.string().required("System name is required"),
    sector: Yup.string().required("Sector is required"),
    description: Yup.string().required("Description is required"),
  });


  const ukPageSchemas = [
    // Page 0
    Yup.object({
      system_name: Yup.string().required("System name is required"),
      sector: Yup.string().required("Sector is required"),
      description: Yup.string().required("Description is required"),
    }),

    // Page 1
    Yup.object({}),

    // Page 2
    Yup.object({}),

    // Page 3
    Yup.object({}),

    // Page 4
    Yup.object({}),

    // Page 5
    Yup.object({}),

    // Page 6
    Yup.object({}),
  ];


  const masPageSchemas = [
    // Page 0 – System Profile
    Yup.object({
      system_name: Yup.string().required("System name is required"),
      description: Yup.string().required("Description is required"),
    }),


    // Page 1 – Data & Dependencies
    Yup.object({
      uses_personal_data: Yup.boolean(),

      personal_data_types: Yup.string().when("uses_personal_data", {
        is: true,
        then: (s) =>
          s.required("What kind of personal data are you using is required"),
        otherwise: (s) => s.notRequired(),
      }),

      personal_data_logged_where: Yup.string().when("uses_personal_data", {
        is: true,
        then: (s) =>
          s.required("Where the personal data is stored is required"),
        otherwise: (s) => s.notRequired(),
      }),

      personal_data_use_cases: Yup.string().when("uses_personal_data", {
        is: true,
        then: (s) =>
          s.required("Personal data use cases are required"),
        otherwise: (s) => s.notRequired(),
      }),

      sensitive_data_types: Yup.string().when("uses_special_category_data", {
        is: true,
        then: (s) =>
          s.required("sensitive data types are required"),
        otherwise: (s) => s.notRequired(),
      }),

      sensitive_data_logged_where: Yup.string().when("uses_special_category_data", {
        is: true,
        then: (s) =>
          s.required("Where the sensitive data is stored is required"),
        otherwise: (s) => s.notRequired(),
      }),

      third_party_services_list: Yup.string().when("uses_third_party_ai", {
        is: true,
        then: (s) =>
          s.required("sensitive data types are required"),
        otherwise: (s) => s.notRequired(),
      }),

      third_party_services_safety: Yup.string().when("uses_third_party_ai", {
        is: true,
        then: (s) =>
          s.required("List of Third Party services are required"),
        otherwise: (s) => s.notRequired(),
      }),
    }),


    // Page 2 – Governance
    Yup.object({
      governance_policy: Yup.boolean(),
    }),

    // Page 3 – Inventory
    Yup.object({
      inventory_recorded: Yup.boolean().required(),
    }),

    // Page 4 – Data Quality
    Yup.object({}),

    // Page 5 – Technical Pillars
    Yup.object({
      fairness_testing: Yup.boolean(),
      fairness_testing_methods: Yup.string().when("fairness_testing", {
        is: true,
        then: (s) => s.required(),
      }),
    }),

    // Page 6 – Operational
    Yup.object({}),

    // Page 7 – Security
    Yup.object({}),
  ];



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

  // Determine compliance forms based on data processing locations, not just country
  const hasUKDataProcessing = useMemo(
    () => dataProcessingLocations.includes("UK"),
    [dataProcessingLocations]
  );
  const hasEUDataProcessing = useMemo(
    () => dataProcessingLocations.some((loc) => 
      loc === "EU" || EU_COUNTRIES.some((c) => c.toLowerCase() === loc.toLowerCase())
    ),
    [dataProcessingLocations]
  );
  const hasSingaporeDataProcessing = useMemo(
    () => dataProcessingLocations.includes("Singapore"),
    [dataProcessingLocations]
  );

  // Keep old logic for backward compatibility (fallback to country if no data processing locations selected)
  const isEU = useMemo(
    () => hasEUDataProcessing || (dataProcessingLocations.length === 0 && EU_COUNTRIES.some((c) => c.toLowerCase() === country.toLowerCase())),
    [hasEUDataProcessing, dataProcessingLocations.length, country]
  );
  const isSingapore = useMemo(
    () => hasSingaporeDataProcessing || (dataProcessingLocations.length === 0 && country.toLowerCase() === "singapore"),
    [hasSingaporeDataProcessing, dataProcessingLocations.length, country]
  );
  const isUK = useMemo(
    () => hasUKDataProcessing || (dataProcessingLocations.length === 0 && (country.toLowerCase() === "united kingdom" || country.toLowerCase() === "uk")),
    [hasUKDataProcessing, dataProcessingLocations.length, country]
  );

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


  // Save EU form state to localStorage whenever it changes
  useEffect(() => {
    if (isEU && step === "form" && Object.keys(euAnswers).length > 0) {
      localStorage.setItem('eu_assessment_state', JSON.stringify(euAnswers));
    }
  }, [euAnswers, isEU, step]);


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
      }
    }
  }, [step, isEU]);

  const handleIntroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country) {
      setError("Please provide your name and country.");
      return;
    }
    if (!systemName.trim()) {
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
    if (dataProcessingLocations.length === 0) {
      setError("Please select at least one data processing location.");
      return;
    }

    // Check if only India is selected (no UK/EU/Singapore)
    const hasOnlyIndia = dataProcessingLocations.length === 1 && dataProcessingLocations.includes("India");
    const hasRelevantJurisdiction = hasUKDataProcessing || hasEUDataProcessing || hasSingaporeDataProcessing;

    if (hasOnlyIndia && !hasRelevantJurisdiction) {
      setError("If you only process data in India, you may not need UK/EU/MAS compliance. Please select UK, EU, or Singapore if you process data from those jurisdictions.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Count how many jurisdictions are selected
      const selectedJurisdictions: string[] = [];
      if (hasUKDataProcessing) selectedJurisdictions.push("UK");
      if (hasEUDataProcessing) selectedJurisdictions.push("EU");
      if (hasSingaporeDataProcessing) selectedJurisdictions.push("MAS");

      // Determine assessment type based on data processing locations (priority order: UK > EU > MAS)
      // This is used for backward compatibility and single-jurisdiction flows
      let assessmentType: "UK" | "EU" | "MAS";

      if (hasUKDataProcessing) {
        assessmentType = "UK";
      } else if (hasEUDataProcessing) {
        assessmentType = "EU";
      } else if (hasSingaporeDataProcessing) {
        assessmentType = "MAS";
      } else {
        // Fallback to country-based logic if no matching data processing location
        if (country.toLowerCase() === "singapore") {
          assessmentType = "MAS";
        } else if (
          country.toLowerCase() === "united kingdom" ||
          country.toLowerCase() === "uk"
        ) {
          assessmentType = "UK";
        } else {
          assessmentType = "EU";
        }
      }

      const { data, error } = await supabase
        .from("ai_systems")
        .insert({
          system_name: systemName,
          company_name: companyName,
          country,
          data_processing_locations: dataProcessingLocations,
          assessment_type: assessmentType,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;

      // If multiple jurisdictions selected, route to multi-jurisdiction flow
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔄 [INTRO] Routing after intro submission`);
      console.log(`   System ID: ${data.id}`);
      console.log(`   Selected jurisdictions: ${selectedJurisdictions.join(', ')}`);
      console.log(`   Assessment type: ${assessmentType}`);
      console.log(`${'='.repeat(80)}\n`);

      if (selectedJurisdictions.length > 1) {
        console.log(`➡️  [INTRO] Multiple jurisdictions detected - routing to multi-jurisdiction flow`);
        router.push(`/assessment/multi/${data.id}`);
      } else if (assessmentType === "UK") {
        console.log(`➡️  [INTRO] Single jurisdiction (UK) - routing to UK assessment`);
        router.push(`/assessment/uk/${data.id}`);
      } else if (assessmentType === "MAS") {
        console.log(`➡️  [INTRO] Single jurisdiction (MAS) - routing to MAS assessment`);
        router.push(`/assessment/mas/${data.id}`);
      } else {
        console.log(`➡️  [INTRO] Single jurisdiction (EU) - routing to EU assessment`);
        router.push(`/assessment/eu/${data.id}`);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to start assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleEvidenceFileChange = async (
    key: string,
    file: File | null,
    setFieldValue?: (field: string, value: any) => void
  ) => {
    if (!file) {
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

      return;
    }

    setEvidenceFiles((prev) => ({ ...prev, [key]: file }));

    try {
      const formData = new FormData();
      formData.append("files", file);

      const res = await backendFetch("/api/process-evidence", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.files?.[file.name]) {
          const extractedText = data.files[file.name];
          setEvidenceContent((prev) => ({
            ...prev,
            [key]: extractedText,
          }));

          // Auto-populate form fields for supported evidence types
          if (setFieldValue) {
            try {
              console.log(`\n${'='.repeat(80)}`);
              console.log(`🤖 [AUTO-POPULATE] Starting auto-population analysis`);
              console.log(`📋 [AUTO-POPULATE] Evidence key: ${key}`);
              console.log(`📄 [AUTO-POPULATE] Extracted text length: ${extractedText.length} characters`);
              console.log(`${'='.repeat(80)}\n`);
              
              // Call universal analysis endpoint
              const analysisRes = await backendFetch("/api/analyze-document", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  documentText: extractedText,
                  evidenceKey: key,
                }),
              });

              if (analysisRes.ok) {
                const analysisData = await analysisRes.json();
                console.log(`✅ [AUTO-POPULATE] Analysis completed successfully`);
                console.log(`📊 [AUTO-POPULATE] Extracted fields:`, Object.keys(analysisData));

                // Auto-populate all fields returned by the analysis
                let populatedCount = 0;
                let toggleFields: Record<string, boolean> = {};

                Object.keys(analysisData).forEach(fieldName => {
                  const value = analysisData[fieldName];
                  if (value && typeof value === 'string' && value.trim().length > 0) {
                    setFieldValue(fieldName, value);
                    populatedCount++;
                    console.log(`✓ [AUTO-POPULATE] Populated: ${fieldName} (${value.length} chars)`);
                    
                    // Track toggle fields that should be set to true
                    // Governance
                    if (fieldName === 'governance_policy_type' || fieldName === 'governance_framework') {
                      toggleFields['governance_policy'] = true;
                    }
                    // Inventory
                    if (fieldName === 'inventory_location' || fieldName === 'inventory_risk_classification') {
                      toggleFields['inventory_recorded'] = true;
                    }
                    // Data Quality
                    if (fieldName === 'data_quality_methods' || fieldName === 'data_bias_analysis') {
                      toggleFields['data_quality_checks'] = true;
                    }
                    // Transparency
                    if (fieldName === 'transparency_doc_types' || fieldName === 'transparency_user_explanations') {
                      toggleFields['transparency_docs'] = true;
                    }
                    // Fairness
                    if (fieldName === 'fairness_testing_methods' || fieldName === 'fairness_test_results') {
                      toggleFields['fairness_testing'] = true;
                    }
                    // Human Oversight
                    if (fieldName === 'human_oversight_type' || fieldName === 'human_oversight_processes' || 
                        fieldName === 'human_oversight_who' || fieldName === 'human_oversight_when' || fieldName === 'human_oversight_how') {
                      toggleFields['human_oversight'] = true;
                    }
                    // UK Accountability
                    if (fieldName === 'accountability_framework_structure' || fieldName === 'accountability_roles') {
                      toggleFields['accountability_framework'] = true;
                    }
                  }
                });

                // Set toggle fields to true
                Object.keys(toggleFields).forEach(toggleField => {
                  setFieldValue(toggleField, true);
                  console.log(`✓ [AUTO-POPULATE] Set toggle: ${toggleField} = true`);
                });

                console.log(`\n${'='.repeat(80)}`);
                console.log(`✅ [AUTO-POPULATE] Auto-population completed`);
                console.log(`📊 [AUTO-POPULATE] Total fields populated: ${populatedCount}`);
                console.log(`📊 [AUTO-POPULATE] Toggles set: ${Object.keys(toggleFields).length}`);
                console.log(`${'='.repeat(80)}\n`);
              } else {
                const errorData = await analysisRes.json().catch(() => ({}));
                console.warn(`\n${'='.repeat(80)}`);
                console.warn(`⚠️  [AUTO-POPULATE] Analysis failed`);
                console.warn(`   Status: ${analysisRes.status}`);
                console.warn(`   Status Text: ${analysisRes.statusText}`);
                console.warn(`   Error:`, errorData);
                
                // Provide user-friendly error message
                if (analysisRes.status === 500) {
                  if (errorData.message?.includes('Connection error')) {
                    console.warn(`   🔴 Issue: Cannot connect to OpenAI API`);
                    console.warn(`   💡 Solutions:`);
                    console.warn(`      1. Check your internet connection`);
                    console.warn(`      2. Verify OPEN_AI_KEY is set in backend .env file`);
                    console.warn(`      3. Check if OpenAI API is accessible`);
                    console.warn(`      4. Try again in a few moments`);
                  } else if (errorData.message?.includes('API key')) {
                    console.warn(`   🔴 Issue: OpenAI API key problem`);
                    console.warn(`   💡 Solutions:`);
                    console.warn(`      1. Check OPEN_AI_KEY in backend .env file`);
                    console.warn(`      2. Verify API key is valid and not expired`);
                    console.warn(`      3. Restart backend server after updating .env`);
                  } else {
                    console.warn(`   🔴 Issue: Backend error during analysis`);
                    console.warn(`   💡 Check backend logs for more details`);
                  }
                } else if (analysisRes.status === 400) {
                  console.warn(`   🔴 Issue: Invalid request`);
                  console.warn(`   💡 Check if evidence key is supported`);
                }
                
                console.warn(`💡 [AUTO-POPULATE] You can continue filling the form manually`);
                console.warn(`${'='.repeat(80)}\n`);
                // Don't throw error - allow user to continue with manual entry
              }
            } catch (analysisError: any) {
              console.error(`\n${'='.repeat(80)}`);
              console.error(`❌ [AUTO-POPULATE] Error during analysis`);
              console.error(`   Evidence Key: ${key}`);
              console.error(`   Error: ${analysisError.message}`);
              console.error(`   Stack: ${analysisError.stack}`);
              console.error(`💡 [AUTO-POPULATE] User can continue with manual entry`);
              console.error(`${'='.repeat(80)}\n`);
              // Don't throw error - allow user to continue with manual entry
            }
          } else {
            console.log(`ℹ️  [AUTO-POPULATE] setFieldValue not available, skipping auto-population`);
          }
        }
      }
    } catch (error) {
      console.error("Error processing evidence file:", error);
    }
  };





  const initialValues = isUK
    ? ukInitialState
    : isSingapore
      ? masInitialState
      : euAnswers;



  type UkValues = typeof ukInitialState;
  type MasValues = typeof masInitialState;
  type EuValues = Record<string, any>;

  type FormValues = UkValues | MasValues | EuValues;

  const handleFormSubmit = async (values: FormValues) => {

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
            ...values,
            ...ukEvidencePayload,
          },
          system_name: values.system_name,
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
          ...values,
          company_name: companyName,
          company_use_case: companyUseCase,
          ...evidencePayload,
        };
        // MAS already has system_name in masAnswers
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
                      <SelectItem value="India" className="!bg-orange-50 hover:!bg-orange-100 focus:!bg-orange-100 data-[highlighted]:!bg-orange-100 border border-orange-200 rounded-lg my-1 mx-1">
                        India
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
                  <p className="text-xs text-muted-foreground">Where is your company/tool located?</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-foreground">Where is the data being processed? *</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Select all jurisdictions where you process data. This determines which compliance forms you need.
                  </p>
                  <div className="space-y-2 border border-border/50 rounded-xl p-4 bg-secondary/20">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="data-processing-uk"
                        checked={dataProcessingLocations.includes("UK")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDataProcessingLocations([...dataProcessingLocations, "UK"]);
                          } else {
                            setDataProcessingLocations(dataProcessingLocations.filter((loc) => loc !== "UK"));
                          }
                        }}
                      />
                      <Label
                        htmlFor="data-processing-uk"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        United Kingdom (UK)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="data-processing-eu"
                        checked={dataProcessingLocations.includes("EU")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDataProcessingLocations([...dataProcessingLocations, "EU"]);
                          } else {
                            setDataProcessingLocations(dataProcessingLocations.filter((loc) => loc !== "EU"));
                          }
                        }}
                      />
                      <Label
                        htmlFor="data-processing-eu"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        European Union (EU)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="data-processing-singapore"
                        checked={dataProcessingLocations.includes("Singapore")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDataProcessingLocations([...dataProcessingLocations, "Singapore"]);
                          } else {
                            setDataProcessingLocations(dataProcessingLocations.filter((loc) => loc !== "Singapore"));
                          }
                        }}
                      />
                      <Label
                        htmlFor="data-processing-singapore"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Singapore (MAS)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="data-processing-india"
                        checked={dataProcessingLocations.includes("India")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDataProcessingLocations([...dataProcessingLocations, "India"]);
                          } else {
                            setDataProcessingLocations(dataProcessingLocations.filter((loc) => loc !== "India"));
                          }
                        }}
                      />
                      <Label
                        htmlFor="data-processing-india"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        India
                      </Label>
                    </div>
                  </div>
                  {dataProcessingLocations.length === 0 && (
                    <p className="text-xs text-red-500">Please select at least one data processing location</p>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button type="submit" variant="hero" className="rounded-xl" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      "Continue"
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

  // Render form based on country
  const frameworkName = isEU ? "EU AI Act" : isUK ? "UK AI Regulatory Framework" : isSingapore ? "MAS AI Risk Management" : "EU AI Act";


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
            <Formik
              initialValues={initialValues}
              validationSchema={
                isSingapore
                  ? masPageSchemas[masCurrentPage]
                  : isUK
                    ? ukPageSchemas[ukCurrentPage]
                    : validationSchema
              }
              onSubmit={handleFormSubmit}
            >
              {({ handleSubmit, validateForm, setTouched, errors, setFieldValue, submitForm }) => {
                
                // Create wrapper function that includes setFieldValue
                const handleEvidenceFileChangeWithForm = (key: string, file: File | null) => {
                  return handleEvidenceFileChange(key, file, setFieldValue);
                };

                const handleMasNext = async () => {
                  const errors = await validateForm();

                  if (Object.keys(errors).length > 0) {
                    const touched = Object.keys(errors).reduce((acc, key) => {
                      acc[key] = true;
                      return acc;
                    }, {} as Record<string, boolean>);

                    setTouched(touched);
                    return; // 🚫 BLOCK navigation
                  }

                  setMasCurrentPage((p) => p + 1);
                };


                const handleUkNext = async () => {
                  const errors = await validateForm();

                  if (Object.keys(errors).length > 0) {
                    const touched = Object.keys(errors).reduce((acc, key) => {
                      acc[key] = true;
                      return acc;
                    }, {} as Record<string, boolean>);

                    setTouched(touched);

                    return; // 🚫 BLOCK navigation
                  }

                  setUkCurrentPage((p) => p + 1);
                };
                return (
                  <form
                    onSubmit={handleSubmit}
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
                        <UkPage0SystemProfile
                          ukCurrentPage={ukCurrentPage}
                        />


                        <UkPage1SafetySecurityRobustness
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />

                        <UkPage2TransparencyExplainability
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />


                        <UkPage3FairnessDataGovernance
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />

                        <UkPage4AccountabilityGovernance
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />

                        <UkPage5ContestabilityRedress
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />


                        <UkPage6FoundationModels
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />

                      </div>
                    ) : isSingapore ? (
                      // MAS multi-page form
                      <>
                        <div className="space-y-6">
                          <MasPage1SystemProfile
                            masCurrentPage={masCurrentPage} />

                          <MasPage2DataDependencies
                            masCurrentPage={masCurrentPage} />

                          <MasPage3GovernanceOversight
                            masCurrentPage={masCurrentPage}
                            handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                            evidenceContent={evidenceContent}
                          />


                          <MasPage4InventoryRisk
                            masCurrentPage={masCurrentPage}
                            handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                            evidenceContent={evidenceContent}
                          />


                          <MasPage5DataManagementQuality
                            masCurrentPage={masCurrentPage}
                            handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                            evidenceContent={evidenceContent}
                          />



                          <MasPage6TechnicalPillars
                            masCurrentPage={masCurrentPage}
                            handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                            evidenceContent={evidenceContent}
                          />

                          <MasPage7OperationalPillars
                            masCurrentPage={masCurrentPage}
                            handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                            evidenceContent={evidenceContent}
                          />


                          <SecurityMonitoring
                            masCurrentPage={masCurrentPage}
                            handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          />
                        </div>


                        {error && (
                          <Alert variant="destructive" className="rounded-xl">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                      </>
                    ) : (
                      <>
                      </>
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
                                onClick={handleUkNext}
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
                                onClick={handleMasNext}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                Next
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                  console.log("[MAS Form] Manual submit triggered");
                                  submitForm();
                                }}
                              >
                                Submit Assessment
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
                )
              }}
            </Formik>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}