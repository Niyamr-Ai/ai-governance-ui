"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";

import { Formik } from "formik";
import * as Yup from "yup";


// UK FORM PAGES
import UkPage0SystemProfile from "@/components/assessment/uk/ukPage0SystemProfile";
import UkPage1SafetySecurityRobustness from "@/components/assessment/uk/ukPage1SafetySecurityRobustness";
import UkPage2TransparencyExplainability from "@/components/assessment/uk/ukPage2TransparencyExplainability";
import UkPage3FairnessDataGovernance from "@/components/assessment/uk/ukPage3FairnessDataGovernance";
import UkPage4AccountabilityGovernance from "@/components/assessment/uk/ukPage4AccountabilityGovernance";
import UkPage5ContestabilityRedress from "@/components/assessment/uk/ukPage5ContestabilityRedress";
import UkPage6FoundationModels from "@/components/assessment/uk/ukPage6FoundationModels";


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
import Head from 'next/head';




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

  transparency_reports: false,
  transparency_reports_content: "",
  transparency_reports_frequency: "",
  transparency_reports_publication: "",


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


export default function UkAssessmentPage() {
  const router = useRouter();
  const { systemId } = router.query;

  const [ukCurrentPage, setUkCurrentPage] = useState(0);
  const [ukInitialFromDb, setUkInitialFromDb] = useState<typeof ukInitialState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMultiJurisdiction, setIsMultiJurisdiction] = useState(false);
  const initialValues = ukInitialFromDb ?? ukInitialState;
  const [evidenceContent, setEvidenceContent] = useState<Record<string, string>>({});

  const ukPageFields: Record<number, string[]> = {
    0: ["system_name", "sector", "description"],

    1: [
      "robustness_testing",               // 👈 ADD THIS
      "robustness_testing_methods",
      "robustness_testing_frequency",

      "red_teaming",                      // 👈 ADD THIS
      "red_teaming_who",
      "red_teaming_methodology",

      "misuse_prevention",                // 👈 ADD THIS
      "misuse_prevention_measures",

      "cybersecurity",                    // 👈 ADD THIS
      "cybersecurity_controls",

      "safety_testing",                   // 👈 ADD THIS
      "safety_testing_protocols",
    ],

    2: [
      // 👇 ADD THESE (CRITICAL)
      "user_disclosure",
      "explainability",
      "documentation",
      "transparency_reports",

      // user disclosure
      "user_disclosure_how",
      "user_disclosure_when",
      "user_disclosure_format",
      "user_disclosure_evidence",

      // explainability
      "explainability_methods",
      "explainability_technical_details",
      "explainability_user_types",
      "explainability_evidence",

      // documentation
      "documentation_types",
      "documentation_storage",
      "documentation_update_frequency",

      // transparency reports
      "transparency_reports_content",
      "transparency_reports_frequency",
      "transparency_reports_publication",
    ],


    3: [
      "bias_testing",
      "bias_testing_methodology",
      "bias_testing_tools",
      "bias_testing_frequency",
      "bias_testing_results",

      "discrimination_mitigation",
      "discrimination_mitigation_measures",

      "data_quality",
      "data_quality_checks",
      "data_quality_metrics",

      "fairness_monitoring",
      "fairness_monitoring_processes",
      "fairness_monitoring_alerts",

      "personal_data_handling",
      "personal_data_types",
      "personal_data_sources",
      "personal_data_retention",

      "data_representativeness",
      "protected_characteristics",
      "fairness_metrics_used",
      "fairness_evidence",
    ],
  };


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

    // Page 1 – Safety, Security & Robustness
    Yup.object({
      robustness_testing: Yup.boolean(),


      robustness_testing_methods: Yup.string().when("robustness_testing", {
        is: (v) => v === true,
        then: (s) => s.required("Testing methods are required. Enter null if nothing to show"),
      }),


      // robustness_testing_frequency: Yup.string().when("robustness_testing", {
      //   is: (v) => v === true,
      //   then: (s) => s.required("Testing frequency evidence is required. Enter null if nothing to show"),
      // }),

      robustness_test_results: Yup.string().when("robustness_testing", {
        is: (v) => v === true,
        then: (s) => s.required("Test results summary is required. Enter null if nothing to show"),
      }),

      // robustness_test_evidence: Yup.string().when("robustness_testing", {
      //   is: (v) => v === true,
      //   then: (s) => s.required("Robustness testing evidence is required. Enter null if nothing to show"),
      // }),

      red_teaming: Yup.boolean(),

      red_teaming_who: Yup.string().when("red_teaming", {
        is: (v) => v === true,
        then: (s) => s.required("Red-teaming owner is required. Enter null if nothing to show"),
      }),

      red_teaming_methodology: Yup.string().when("red_teaming", {
        is: (v) => v === true,
        then: (s) => s.required("Red-teaming methodology is required. Enter null if nothing to show"),
      }),

      red_teaming_findings: Yup.string().when("red_teaming", {
        is: (v) => v === true,
        then: (s) => s.required("Red-teaming findings are required. Enter null if nothing to show"),
      }),

      // red_teaming_evidence: Yup.string().when("red_teaming", {
      //   is: (v) => v === true,
      //   then: (s) => s.required("Red-teaming evidence is required. Enter null if nothing to show"),
      // }),

      misuse_prevention: Yup.boolean(),

      misuse_prevention_measures: Yup.string().when("misuse_prevention", {
        is: (v) => v === true,
        then: (s) => s.required("Misuse prevention measures are required. Enter null if nothing to show"),
      }),

      misuse_monitoring: Yup.string().when("misuse_prevention", {
        is: (v) => v === true,
        then: (s) => s.required("Misuse monitoring approach is required. Enter null if nothing to show"),
      }),

      cybersecurity: Yup.boolean(),

      cybersecurity_controls: Yup.string().when("cybersecurity", {
        is: (v) => v === true,
        then: (s) => s.required("Cybersecurity controls are required. Enter null if nothing to show"),
      }),

      cybersecurity_incident_response: Yup.string().when("cybersecurity", {
        is: (v) => v === true,
        then: (s) => s.required("Incident response plan is required. Enter null if nothing to show"),
      }),

      cybersecurity_monitoring: Yup.string().when("cybersecurity", {
        is: (v) => v === true,
        then: (s) => s.required("Cybersecurity monitoring is required. Enter null if nothing to show"),
      }),

      // cybersecurity_evidence: Yup.string().when("cybersecurity", {
      //   is: (v) => v === true,
      //   then: (s) => s.required("Cybersecurity evidence is required. Enter null if nothing to show"),
      // }),

      safety_testing: Yup.boolean(),

      safety_testing_protocols: Yup.string().when("safety_testing", {
        is: (v) => v === true,
        then: (s) => s.required("Safety testing protocols are required. Enter null if nothing to show"),
      }),

      safety_validation_methods: Yup.string().when("safety_testing", {
        is: (v) => v === true,
        then: (s) => s.required("Safety validation methods are required. Enter null if nothing to show"),
      }),

      // safety_testing_evidence: Yup.string().when("safety_testing", {
      //   is: (v) => v === true,
      //   then: (s) => s.required("Safety testing evidence is required. Enter null if nothing to show"),
      // }),
    }),


    // Page 2
    Yup.object({
      user_disclosure: Yup.boolean()
        .oneOf([true, false], "Please answer this question"),

      user_disclosure_how: Yup.string().when("user_disclosure", {
        is: (v) => v === true,
        then: (s) => s.required("AI disclosure to users are required. Enter null if nothing to show"),
      }),

      user_disclosure_when: Yup.string().when("user_disclosure", {
        is: (v) => v === true,
        then: (s) => s.required("when is AI disclosed is required. Enter null if nothing to show"),
      }),

      user_disclosure_format: Yup.string().when("user_disclosure", {
        is: (v) => v === true,
        then: (s) => s.required("Format of user disclosure is required. Enter null if nothing to show"),
      }),

      // user_disclosure_evidence: Yup.string().when("user_disclosure", {
      //   is: (v) => v === true,
      //   then: (s) => s.required("AI disclosure of evidence is required. Enter null if nothing to show"),
      // }),

      explainability: Yup.boolean()
        .oneOf([true, false], "Please answer this question"),

      explainability_methods: Yup.string().when("explainability", {
        is: (v) => v === true,
        then: (s) => s.required("Methods of explainability is required. Enter null if nothing to show"),
      }),

      explainability_technical_details: Yup.string().when("explainability", {
        is: (v) => v === true,
        then: (s) => s.required("Details of explainability is required. Enter null if nothing to show"),
      }),

      explainability_user_types: Yup.string().when("explainability", {
        is: (v) => v === true,
        then: (s) => s.required("Explainability of AI to different users is required. Enter null if nothing to show"),
      }),

      explainability_evidence: Yup.string().when("explainability", {
        is: (v) => v === true,
        then: (s) => s.required("Evidence of AI disclosure is required. Enter null if nothing to show"),
      }),

      documentation: Yup.boolean()
        .oneOf([true, false], "Please answer this question"),

      documentation_types: Yup.string().when("documentation", {
        is: (v) => v === true,
        then: (s) => s.required("Documentation is required. Enter null if nothing to show"),
      }),

      documentation_storage: Yup.string().when("documentation", {
        is: (v) => v === true,
        then: (s) => s.required("Place of documentation storage is required. Enter null if nothing to show"),
      }),

      documentation_update_frequency: Yup.string().when("documentation", {
        is: (v) => v === true,
        then: (s) => s.required("Documentation update frequency is required. Enter null if nothing to show")
      }),

      transparency_reports: Yup.boolean()
        .oneOf([true, false], "Please answer this question"),

      transparency_reports_content: Yup.string().when("transparency_reports", {
        is: (v) => v === true,
        then: (s) => s.required("Transparency report is required. Enter null if nothing to show"),
      }),

      transparency_reports_frequency: Yup.string().when("transparency_reports", {
        is: (v) => v === true,
        then: (s) => s.required("How often is reports recorded required. Enter null if nothing to show"),
      }),

      transparency_reports_publication: Yup.string().when("transparency_reports", {
        is: (v) => v === true,
        then: (s) => s.required("report published address is required. Enter null if nothing to show"),
      }),
    }),

    Yup.object({
      // Bias testing
      bias_testing: Yup.boolean()
        .oneOf([true, false], "Please indicate whether bias testing is conducted"),

      bias_testing_methodology: Yup.string().when("bias_testing", {
        is: true,
        then: (s) =>
          s.required("Please describe the methodology used for bias testing. Enter null if nothing to show"),
      }),

      bias_testing_tools: Yup.string().when("bias_testing", {
        is: true,
        then: (s) =>
          s.required("Please specify the tools or techniques used for bias testing. Enter null if nothing to show"),
      }),

      bias_testing_frequency: Yup.string().when("bias_testing", {
        is: true,
        then: (s) =>
          s.required("Please indicate how frequently bias testing is performed. Enter null if nothing to show"),
      }),

      bias_testing_results: Yup.string().when("bias_testing", {
        is: true,
        then: (s) =>
          s.required("Please summarise the results of bias testing. Enter null if nothing to show"),
      }),

      // Discrimination mitigation
      discrimination_mitigation: Yup.boolean()
        .oneOf([true, false], "Please indicate whether discrimination mitigation measures exist"),

      discrimination_mitigation_measures: Yup.string().when("discrimination_mitigation", {
        is: true,
        then: (s) =>
          s.required("Please describe the measures taken to mitigate discrimination"),
      }),

      // Data quality
      data_quality: Yup.boolean()
        .oneOf([true, false], "Please indicate whether data quality controls are implemented"),

      data_quality_checks: Yup.string().when("data_quality", {
        is: true,
        then: (s) =>
          s.required("Please describe the data quality checks that are performed. Enter null if nothing to show"),
      }),

      data_quality_metrics: Yup.string().when("data_quality", {
        is: true,
        then: (s) =>
          s.required("Please specify the metrics used to assess data quality. Enter null if nothing to show"),
      }),

      // Fairness monitoring
      fairness_monitoring: Yup.boolean()
        .oneOf([true, false], "Please indicate whether ongoing fairness monitoring is conducted"),

      fairness_monitoring_processes: Yup.string().when("fairness_monitoring", {
        is: true,
        then: (s) =>
          s.required("Please describe the processes used for fairness monitoring. Enter null if nothing to show"),
      }),

      fairness_monitoring_alerts: Yup.string().when("fairness_monitoring", {
        is: true,
        then: (s) =>
          s.required("Please describe how fairness issues or alerts are identified. Enter null if nothing to show"),
      }),

      // Personal data handling
      personal_data_handling: Yup.boolean()
        .oneOf([true, false], "Please indicate whether personal data is processed"),

      personal_data_types: Yup.string().when("personal_data_handling", {
        is: true,
        then: (s) =>
          s.required("Please specify the types of personal data processed. Enter null if nothing to show"),
      }),

      personal_data_sources: Yup.string().when("personal_data_handling", {
        is: true,
        then: (s) =>
          s.required("Please specify the sources of personal data. Enter null if nothing to show"),
      }),

      personal_data_retention: Yup.string().when("personal_data_handling", {
        is: true,
        then: (s) =>
          s.required("Please describe the personal data retention period. Enter null if nothing to show"),
      }),

      // Representativeness & fairness metrics
      data_representativeness: Yup.string()
        .required("Please describe how data representativeness is ensured. Enter null if nothing to show"),

      protected_characteristics: Yup.string()
        .required("Please specify which protected characteristics are considered. Enter null if nothing to show"),

      fairness_metrics_used: Yup.string()
        .required("Please describe the fairness metrics used. Enter null if nothing to show"),

      fairness_evidence: Yup.string().when("data_representativeness", {
        is: true,
        then: (s) =>
          s.required("Please provide evidence supporting fairness and representativeness assessments. Enter null if nothing to show"),
      }),
    }),



    // Page 4
    Yup.object({
      // Clear accountability framework
      accountability_framework: Yup.boolean()
        .oneOf([true, false], "Please indicate whether a clear accountability framework exists"),

      accountability_framework_structure: Yup.string().when("accountability_framework", {
        is: true,
        then: (s) =>
          s.required("Please describe the structure of your accountability framework. Enter null if nothing to show"),
      }),

      accountability_roles: Yup.string().when("accountability_framework", {
        is: true,
        then: (s) =>
          s.required("Please describe the accountability roles and responsibilities. Enter null if nothing to show"),
      }),

      // accountability_framework_evidence: Yup.string().when("accountability_framework", {
      //   is: true,
      //   then: (s) =>
      //     s.required("Please provide evidence supporting your accountability framework. Enter null if nothing to show"),
      // }),

      // Human oversight mechanisms
      human_oversight: Yup.boolean()
        .oneOf([true, false], "Please indicate whether human oversight mechanisms are in place"),

      human_oversight_who: Yup.string().when("human_oversight", {
        is: true,
        then: (s) =>
          s.required("Please specify who provides human oversight. Enter null if nothing to show"),
      }),

      human_oversight_when: Yup.string().when("human_oversight", {
        is: true,
        then: (s) =>
          s.required("Please specify when human oversight occurs. Enter null if nothing to show"),
      }),

      human_oversight_how: Yup.string().when("human_oversight", {
        is: true,
        then: (s) =>
          s.required("Please describe how human oversight is implemented. Enter null if nothing to show"),
      }),

      // human_oversight_evidence: Yup.string().when("human_oversight", {
      //   is: true,
      //   then: (s) =>
      //     s.required("Please provide evidence of human oversight mechanisms. Enter null if nothing to show"),
      // }),

      // Risk management processes
      risk_management: Yup.boolean()
        .oneOf([true, false], "Please indicate whether risk management processes are in place"),

      risk_management_processes: Yup.string().when("risk_management", {
        is: true,
        then: (s) =>
          s.required("Please describe your risk management processes. Enter null if nothing to show"),
      }),

      risk_management_documentation: Yup.string().when("risk_management", {
        is: true,
        then: (s) =>
          s.required("Please describe how risks are documented. Enter null if nothing to show"),
      }),

      // risk_management_evidence: Yup.string().when("risk_management", {
      //   is: true,
      //   then: (s) =>
      //     s.required("Please provide evidence of risk management processes. Enter null if nothing to show"),
      // }),

      // Governance structure and roles
      governance_structure: Yup.boolean()
        .oneOf([true, false], "Please indicate whether a governance structure exists"),

      governance_board_involvement: Yup.string().when("governance_structure", {
        is: true,
        then: (s) =>
          s.required("Please describe board involvement in AI governance. Enter null if nothing to show"),
      }),

      governance_committees: Yup.string().when("governance_structure", {
        is: true,
        then: (s) =>
          s.required("Please describe AI governance committees. Enter null if nothing to show"),
      }),

      // Audit trail and record-keeping
      audit_trail: Yup.boolean()
        .oneOf([true, false], "Please indicate whether audit trails are maintained"),

      audit_trail_what: Yup.string().when("audit_trail", {
        is: true,
        then: (s) =>
          s.required("Please specify what is logged in audit trails. Enter null if nothing to show"),
      }),

      audit_trail_retention: Yup.string().when("audit_trail", {
        is: true,
        then: (s) =>
          s.required("Please specify audit trail retention period. Enter null if nothing to show"),
      }),

      audit_trail_access: Yup.string().when("audit_trail", {
        is: true,
        then: (s) =>
          s.required("Please specify who has access to audit trails. Enter null if nothing to show"),
      }),

      // audit_trail_evidence: Yup.string().when("audit_trail", {
      //   is: true,
      //   then: (s) =>
      //     s.required("Please provide evidence of audit trail implementation. Enter null if nothing to show"),
      // }),

      // Senior management oversight
      senior_management_oversight: Yup.string()
        .required("Please describe senior management oversight of AI systems. Enter null if nothing to show"),

      // Ethics committee
      ethics_committee: Yup.boolean()
        .oneOf([true, false], "Please indicate whether an ethics committee exists"),

      ethics_committee_details: Yup.string().when("ethics_committee", {
        is: true,
        then: (s) =>
          s.required("Please describe your ethics committee structure and role"),
      }),

      // Policy assignment and review frequency
      policy_assignment: Yup.string()
        .required("Please describe policy assignment and review frequency. Enter null if nothing to show"),

      // Training requirements
      training_requirements: Yup.string()
        .required("Please describe training requirements for AI system staff"),

      // Escalation procedures
      escalation_procedures: Yup.string()
        .required("Please describe escalation procedures for AI-related issues. Enter null if nothing to show"),

      // Accountable person (required field)
      accountable_person: Yup.string()
        .required("Please specify who is accountable for this AI system. Enter null if nothing to show"),
    }),

    // Page 5
    Yup.object({
      // Clear user rights and information
      user_rights: Yup.boolean()
        .oneOf([true, false], "Please indicate whether clear user rights are established"),

      user_rights_what: Yup.string().when("user_rights", {
        is: true,
        then: (s) =>
          s.required("Please specify what rights users have. Enter null if nothing to show"),
      }),

      user_rights_communication: Yup.string().when("user_rights", {
        is: true,
        then: (s) =>
          s.required("Please describe how rights are communicated to users. Enter null if nothing to show"),
      }),

      user_rights_evidence: Yup.string().when("user_rights", {
        is: true,
        then: (s) =>
          s.required("Please provide evidence of user rights documentation. Enter null if nothing to show"),
      }),

      // Appeal or challenge mechanism
      appeal_mechanism: Yup.boolean()
        .oneOf([true, false], "Please indicate whether an appeal mechanism exists"),

      appeal_mechanism_process: Yup.string().when("appeal_mechanism", {
        is: true,
        then: (s) =>
          s.required("Please describe the appeal process. Enter null if nothing to show"),
      }),

      appeal_mechanism_timeline: Yup.string().when("appeal_mechanism", {
        is: true,
        then: (s) =>
          s.required("Please specify the timeline for appeals. Enter null if nothing to show"),
      }),

      appeal_mechanism_accessibility: Yup.string().when("appeal_mechanism", {
        is: true,
        then: (s) =>
          s.required("Please describe how accessible the appeal mechanism is. Enter null if nothing to show"),
      }),

      // appeal_mechanism_evidence: Yup.string().when("appeal_mechanism", {
      //   is: true,
      //   then: (s) =>
      //     s.required("Please provide evidence of appeal mechanism documentation. Enter null if nothing to show"),
      // }),

      // Redress process for adverse outcomes
      redress_process: Yup.boolean()
        .oneOf([true, false], "Please indicate whether a redress process exists"),

      redress_process_steps: Yup.string().when("redress_process", {
        is: true,
        then: (s) =>
          s.required("Please describe the steps involved in the redress process. Enter null if nothing to show"),
      }),

      redress_compensation: Yup.string().when("redress_process", {
        is: true,
        then: (s) =>
          s.required("Please describe compensation mechanisms. Enter null if nothing to show"),
      }),

      redress_documentation: Yup.string().when("redress_process", {
        is: true,
        then: (s) =>
          s.required("Please describe how redress cases are documented. Enter null if nothing to show"),
      }),

      redress_process_evidence: Yup.string().when("redress_process", {
        is: true,
        then: (s) =>
          s.required("Please provide evidence of redress process documentation. Enter null if nothing to show"),
      }),

      // Complaint handling procedures
      complaint_handling: Yup.boolean()
        .oneOf([true, false], "Please indicate whether complaint handling procedures exist"),

      complaint_handling_procedures: Yup.string().when("complaint_handling", {
        is: true,
        then: (s) =>
          s.required("Please describe complaint handling procedures. Enter null if nothing to show"),
      }),

      complaint_response_time: Yup.string().when("complaint_handling", {
        is: true,
        then: (s) =>
          s.required("Please specify complaint response time. Enter null if nothing to show"),
      }),

      complaint_tracking: Yup.string().when("complaint_handling", {
        is: true,
        then: (s) =>
          s.required("Please describe how complaints are tracked. Enter null if nothing to show"),
      }),

      // complaint_handling_evidence: Yup.string().when("complaint_handling", {
      //   is: true,
      //   then: (s) =>
      //     s.required("Please provide evidence of complaint handling procedures. Enter null if nothing to show"),
      // }),

      // Appeal success rates
      appeal_success_rates: Yup.string()
        .required("Please describe appeal success rates. Enter null if nothing to show"),

      // Redress outcomes tracking
      redress_outcomes_tracking: Yup.string()
        .required("Please describe how redress outcomes are tracked. Enter null if nothing to show"),
    }),

    // Page 6
    Yup.object({
      // Foundation model or high-impact system
      foundation_model: Yup.string()
        .oneOf(["yes", "no", "unsure"], "Please indicate if this is a foundation model or high-impact system"),

      foundation_model_documentation: Yup.string().when("foundation_model", {
        is: (val: string) => val === "yes" || val === "unsure",
        then: (s) =>
          s.required("Please describe your model card documentation. Enter null if nothing to show"),
      }),

      foundation_model_capability_testing: Yup.string().when("foundation_model", {
        is: (val: string) => val === "yes" || val === "unsure",
        then: (s) =>
          s.required("Please describe capability testing conducted. Enter null if nothing to show"),
      }),

      foundation_model_risk_assessment: Yup.string().when("foundation_model", {
        is: (val: string) => val === "yes" || val === "unsure",
        then: (s) =>
          s.required("Please describe risk assessment for foundation/high-impact systems. Enter null if nothing to show"),
      }),

      foundation_model_deployment_restrictions: Yup.string().when("foundation_model", {
        is: (val: string) => val === "yes" || val === "unsure",
        then: (s) =>
          s.required("Please describe any deployment restrictions. Enter null if nothing to show"),
      }),

      foundation_model_monitoring: Yup.string().when("foundation_model", {
        is: (val: string) => val === "yes" || val === "unsure",
        then: (s) =>
          s.required("Please describe monitoring requirements. Enter null if nothing to show"),
      }),

      // foundation_model_evidence: Yup.string().when("foundation_model", {
      //   is: (val: string) => val === "yes" || val === "unsure",
      //   then: (s) =>
      //     s.required("Please provide evidence of foundation model documentation. Enter null if nothing to show"),
      // }),

      // Regulatory sandbox participation
      regulatory_sandbox: Yup.boolean()
        .oneOf([true, false], "Please indicate regulatory sandbox participation"),

      regulatory_sandbox_details: Yup.string().when("regulatory_sandbox", {
        is: true,
        then: (s) =>
          s.required("Please describe your regulatory sandbox participation. Enter null if nothing to show"),
      }),

      // Sector-specific requirements
      sector_specific_requirements: Yup.string()
        .required("Please describe any sector-specific requirements. Enter null if nothing to show"),
    }),
  ];




  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
    };
    checkAuth();
  }, []);



  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };


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



  useEffect(() => {
    if (!systemId) return;

    const loadSystem = async () => {
      const { data, error } = await supabase
        .from("ai_systems")
        .select("*")
        .eq("id", systemId)
        .single();

      if (error) {
        setError("Failed to load assessment");
        return;
      }

      // Check if this is part of a multi-jurisdiction assessment
      const dataProcessingLocations = data.data_processing_locations || [];
      const hasMultipleJurisdictions =
        (dataProcessingLocations.includes("United Kingdom") || dataProcessingLocations.includes("UK")) &&
        (dataProcessingLocations.includes("European Union") || dataProcessingLocations.includes("EU") ||
          dataProcessingLocations.some((loc: string) =>
            ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
              "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
              "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
              "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
              "Slovenia", "Spain", "Sweden"].some(c => c.toLowerCase() === loc.toLowerCase())
          )) ||
        dataProcessingLocations.includes("Singapore");

      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔄 [UK-ASSESSMENT] Loading UK assessment`);
      console.log(`   System ID: ${systemId}`);
      console.log(`   Multi-jurisdiction flow: ${hasMultipleJurisdictions}`);
      console.log(`   Data processing locations:`, dataProcessingLocations);
      console.log(`${'='.repeat(80)}\n`);

      setIsMultiJurisdiction(hasMultipleJurisdictions);

      // If multi-jurisdiction flow, skip page 0 (common questions already answered)
      if (hasMultipleJurisdictions) {
        console.log(`➡️  [UK-ASSESSMENT] Multi-jurisdiction detected - skipping page 0, starting at page 1`);
        setUkCurrentPage(1); // Start at page 1 instead of page 0
      } else if (data.current_step && data.current_step > 1) {
        setUkCurrentPage(data.current_step - 1);
      }

      // Determine jurisdiction from data_processing_locations (preferred) or fallback to country
      let jurisdiction = "";
      if (data.data_processing_locations && Array.isArray(data.data_processing_locations) && data.data_processing_locations.length > 0) {
        // For UK form, prioritize UK if present, otherwise show all locations
        if (data.data_processing_locations.includes("United Kingdom") || data.data_processing_locations.includes("UK")) {
          jurisdiction = "United Kingdom";
        } else {
          jurisdiction = data.data_processing_locations.join(", ");
        }
      } else {
        // Fallback to country if data_processing_locations is not available
        jurisdiction = data.country ?? "";
      }

      setUkInitialFromDb({
        ...ukInitialState,
        system_name: data.system_name ?? "",
        description: data.description ?? "",
        sector: data.sector ?? "",
        system_status: data.system_status ?? "envision",
        business_use_case: data.business_use_case ?? "",
        owner: data.company_name,
        jurisdiction: jurisdiction,
      });
    };

    loadSystem();
  }, [systemId]);

  const handleSubmit = async (values: typeof ukInitialState) => {
    if (ukCurrentPage < ukPages.length - 1) return;

    setIsSubmitting(true);
    setError(null);

    const payload = {
      system_id: systemId,
      system_name: values.system_name || "",
      company_name: values.owner || "",
      company_use_case: values.business_use_case || "",
      answers: {
        ...values,
        ...Object.fromEntries(
          Object.entries(evidenceContent).map(([k, v]) => [`${k}_content`, v])
        ),
      },
    };

    const res = await backendFetch("/api/uk-compliance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setError("Submission failed");
      setIsSubmitting(false);
      return;
    }

    const data = await res.json();
    const assessmentId = data.id || systemId;

    // Check if this is part of a multi-jurisdiction assessment
    console.log(`\n${'='.repeat(80)}`);
    console.log(`✅ [UK-ASSESSMENT] UK assessment submitted successfully`);
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
      console.log(`📋 [UK-ASSESSMENT] Data processing locations:`, dataProcessingLocations);

      const hasMultipleJurisdictions =
        (dataProcessingLocations.includes("United Kingdom") || dataProcessingLocations.includes("UK")) &&
        (dataProcessingLocations.includes("European Union") || dataProcessingLocations.includes("EU") ||
          dataProcessingLocations.some((loc: string) =>
            ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
              "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
              "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
              "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
              "Slovenia", "Spain", "Sweden"].some(c => c.toLowerCase() === loc.toLowerCase())
          )) ||
        dataProcessingLocations.includes("Singapore");

      console.log(`🔍 [UK-ASSESSMENT] Multiple jurisdictions detected: ${hasMultipleJurisdictions}`);

      if (hasMultipleJurisdictions) {
        console.log(`➡️  [UK-ASSESSMENT] Redirecting to multi-jurisdiction page`);
        router.push(`/assessment/multi/${systemId}?completed=UK&assessmentId=${assessmentId}`);
      } else {
        console.log(`➡️  [UK-ASSESSMENT] Single jurisdiction - redirecting to UK results`);
        router.push(`/uk/${assessmentId}`);
      }
    } catch (err: any) {
      console.error(`❌ [UK-ASSESSMENT] Error checking multi-jurisdiction:`, err);
      console.log(`➡️  [UK-ASSESSMENT] Fallback: redirecting to UK results`);
      // Fallback to normal redirect if check fails
      router.push(`/uk/${assessmentId}`);
    }
  };


  const handleEvidenceFileChange = async (
    key: string,
    file: File | null,
    setFieldValue?: (field: string, value: any) => void
  ) => {
    if (!file) {
      setEvidenceContent((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("files", file);

      const res = await backendFetch("/api/process-evidence", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Evidence processing failed");
      }

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

              // Field name mapping: backend field names -> UK form field names
              const fieldNameMapping: Record<string, string> = {
                'fairness_testing': 'bias_testing_methodology',
                'fairness_mitigation': 'discrimination_mitigation_measures',
                'user_rights_procedures': 'user_rights_what',
                'user_rights_communication': 'user_rights_communication',
                'redress_process': 'redress_process_steps',
                'redress_timeline': 'redress_compensation',
                'complaint_tracking': 'complaint_tracking',
                'foundation_model_name': 'foundation_model_documentation',
                'foundation_model_usage': 'foundation_model_capability_testing',
                'user_disclosure_method': 'user_disclosure_how',
                'user_disclosure_content': 'user_disclosure_format',
                'explainability_scope': 'explainability_user_types',
                'safety_testing_methods': 'safety_testing_protocols',
                'safety_testing_results': 'safety_validation_methods',
                'red_teaming_methods': 'red_teaming_methodology',
                'red_teaming_findings': 'red_teaming_findings',
                'robustness_measures': 'robustness_testing_methods',
                'cybersecurity_measures': 'cybersecurity_controls',
                'cybersecurity_testing': 'cybersecurity_monitoring',
              };

              Object.keys(analysisData).forEach(fieldName => {
                const value = analysisData[fieldName];
                if (value && typeof value === 'string' && value.trim().length > 0) {
                  // Map backend field name to actual form field name
                  const actualFieldName = fieldNameMapping[fieldName] || fieldName;

                  setFieldValue(actualFieldName, value);
                  populatedCount++;
                  console.log(`✓ [AUTO-POPULATE] Populated: ${fieldName} -> ${actualFieldName} (${value.length} chars)`);

                  // Track toggle fields that should be set to true (use actualFieldName for checks)
                  // UK Accountability
                  if (actualFieldName === 'accountability_framework_structure' || actualFieldName === 'accountability_roles') {
                    toggleFields['accountability_framework'] = true;
                  }
                  // Human Oversight
                  if (actualFieldName === 'human_oversight_who' || actualFieldName === 'human_oversight_when' || actualFieldName === 'human_oversight_how') {
                    toggleFields['human_oversight'] = true;
                  }
                  // Risk Management
                  if (actualFieldName === 'risk_management_processes' || actualFieldName === 'risk_management_documentation') {
                    toggleFields['risk_management'] = true;
                  }
                  // Governance Structure
                  if (actualFieldName === 'governance_board_involvement' || actualFieldName === 'governance_committees') {
                    toggleFields['governance_structure'] = true;
                  }
                  // Audit Trail
                  if (actualFieldName === 'audit_trail_what' || actualFieldName === 'audit_trail_retention' || actualFieldName === 'audit_trail_access') {
                    toggleFields['audit_trail'] = true;
                  }
                  // User Rights
                  if (actualFieldName === 'user_rights_what' || actualFieldName === 'user_rights_communication') {
                    toggleFields['user_rights'] = true;
                  }
                  // Appeal Mechanism
                  if (actualFieldName === 'appeal_mechanism_process' || actualFieldName === 'appeal_mechanism_timeline') {
                    toggleFields['appeal_mechanism'] = true;
                  }
                  // Redress Process
                  if (actualFieldName === 'redress_process_steps' || actualFieldName === 'redress_compensation') {
                    toggleFields['redress_process'] = true;
                  }
                  // Complaint Handling
                  if (actualFieldName === 'complaint_handling_procedures' || actualFieldName === 'complaint_response_time' || actualFieldName === 'complaint_tracking') {
                    toggleFields['complaint_handling'] = true;
                  }
                  // Robustness Testing
                  if (actualFieldName === 'robustness_testing_methods' || actualFieldName === 'robustness_test_results') {
                    toggleFields['robustness_testing'] = true;
                  }
                  // Red Teaming
                  if (actualFieldName === 'red_teaming_who' || actualFieldName === 'red_teaming_methodology' || actualFieldName === 'red_teaming_findings') {
                    toggleFields['red_teaming'] = true;
                  }
                  // Misuse Prevention
                  if (actualFieldName === 'misuse_prevention_measures' || actualFieldName === 'misuse_monitoring') {
                    toggleFields['misuse_prevention'] = true;
                  }
                  // Cybersecurity
                  if (actualFieldName === 'cybersecurity_controls' || actualFieldName === 'cybersecurity_incident_response' || actualFieldName === 'cybersecurity_monitoring') {
                    toggleFields['cybersecurity'] = true;
                  }
                  // Safety Testing
                  if (actualFieldName === 'safety_testing_protocols' || actualFieldName === 'safety_validation_methods') {
                    toggleFields['safety_testing'] = true;
                  }
                  // User Disclosure
                  if (actualFieldName === 'user_disclosure_how' || actualFieldName === 'user_disclosure_when' || actualFieldName === 'user_disclosure_format') {
                    toggleFields['user_disclosure'] = true;
                  }
                  // Explainability
                  if (actualFieldName === 'explainability_methods' || actualFieldName === 'explainability_technical_details' || actualFieldName === 'explainability_user_types') {
                    toggleFields['explainability'] = true;
                  }
                  // Documentation
                  if (actualFieldName === 'documentation_types' || actualFieldName === 'documentation_storage') {
                    toggleFields['documentation'] = true;
                  }
                  // Transparency Reports
                  if (actualFieldName === 'transparency_reports_content' || actualFieldName === 'transparency_reports_frequency') {
                    toggleFields['transparency_reports'] = true;
                  }
                  // Bias Testing (check both original backend field and mapped field names)
                  if (fieldName === 'fairness_testing' || actualFieldName === 'bias_testing_methodology' || actualFieldName === 'bias_testing_results') {
                    toggleFields['bias_testing'] = true;
                  }
                  // Discrimination Mitigation (check both original backend field and mapped field names)
                  if (fieldName === 'fairness_mitigation' || actualFieldName === 'discrimination_mitigation_measures') {
                    toggleFields['discrimination_mitigation'] = true;
                  }
                  // Data Quality
                  if (actualFieldName === 'data_quality_checks' || actualFieldName === 'data_quality_metrics') {
                    toggleFields['data_quality'] = true;
                  }
                  // Fairness Monitoring
                  if (actualFieldName === 'fairness_monitoring_processes' || actualFieldName === 'fairness_monitoring_alerts') {
                    toggleFields['fairness_monitoring'] = true;
                  }
                  // Personal Data Handling
                  if (actualFieldName === 'personal_data_types' || actualFieldName === 'personal_data_sources') {
                    toggleFields['personal_data_handling'] = true;
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
              console.warn(`💡 [AUTO-POPULATE] You can continue filling the form manually`);
              console.warn(`${'='.repeat(80)}\n`);
            }
          } catch (analysisError: any) {
            console.error(`\n${'='.repeat(80)}`);
            console.error(`❌ [AUTO-POPULATE] Error during analysis`);
            console.error(`   Evidence Key: ${key}`);
            console.error(`   Error: ${analysisError.message}`);
            console.error(`💡 [AUTO-POPULATE] User can continue with manual entry`);
            console.error(`${'='.repeat(80)}\n`);
          }
        }
      }
    } catch (err) {
      console.error("Evidence upload failed", err);
      setError("Failed to process evidence file");
    }
  };

  type UkValues = typeof ukInitialState;


  type FormValues = UkValues;

  if (!systemId) {
    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>Invalid System | AI Governance</title>
          <meta name="description" content="The requested system ID is invalid or missing." />
        </Head>
        <Sidebar />
        <div className="lg:pl-72 pt-24 p-8">
          <Card className="glass-panel shadow-elevated max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Invalid System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System ID is missing from the URL. Please navigate from the dashboard.</p>
              <Button onClick={() => router.push("/dashboard")} className="mt-4 w-full rounded-xl">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!ukInitialFromDb) {
    return (
      <div className="min-h-screen bg-white">
        <Head>
          <title>Loading Assessment | AI Governance</title>
          <meta name="description" content="Loading the UK AI regulatory assessment..." />
        </Head>
        <Sidebar />
        <div className="lg:pl-72 pt-24 p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading UK assessment…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>UK AI Act Assessment</title>
        <meta name="description" content="Complete the UK AI regulatory framework compliance assessment." />
      </Head>
      <Sidebar />

      <div className="lg:pl-72 pt-24 px-4">
        <div className="container mx-auto max-w-4xl py-12 px-4">
          <Card className="glass-panel shadow-elevated">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                UK AI Regulatory Framework Assessment
              </CardTitle>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Step {isMultiJurisdiction ? ukCurrentPage : ukCurrentPage + 1} of {isMultiJurisdiction ? ukPages.length - 1 : ukPages.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {ukPages[ukCurrentPage].title}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${isMultiJurisdiction
                        ? ((ukCurrentPage) / (ukPages.length - 1)) * 100
                        : ((ukCurrentPage + 1) / ukPages.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Formik
                initialValues={initialValues}
                enableReinitialize
                validationSchema={ukPageSchemas[ukCurrentPage]}
                onSubmit={handleSubmit}
              >
                {({ handleSubmit, validateForm, setTouched, values, submitForm, setFieldValue }) => {
                  // Create wrapper function that includes setFieldValue
                  const handleEvidenceFileChangeWithForm = (key: string, file: File | null) => {
                    return handleEvidenceFileChange(key, file, setFieldValue);
                  };

                  const handleNext = async () => {
                    const errors = await validateForm();
                    if (Object.keys(errors).length > 0) {
                      setTouched(
                        Object.keys(errors).reduce(
                          (acc, key) => ({ ...acc, [key]: true }),
                          {}
                        )
                      );
                      return;
                    }

                    // Persist Page 0 (only if not multi-jurisdiction, as common questions already saved)
                    if (ukCurrentPage === 0 && !isMultiJurisdiction && systemId) {
                      const { error } = await supabase
                        .from("ai_systems")
                        .update({
                          system_name: values.system_name,
                          description: values.description,
                          sector: values.sector,
                          system_status: values.system_status,
                          business_use_case: values.business_use_case,
                          current_step: 2,
                          status: "in_progress",
                        })
                        .eq("id", systemId);

                      if (error) {
                        setError("Failed to save progress");
                        return;
                      }
                    }

                    setUkCurrentPage((p) => p + 1);
                  };

                  return (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {ukCurrentPage === 0 && !isMultiJurisdiction && (
                        <UkPage0SystemProfile ukCurrentPage={ukCurrentPage} />
                      )}

                      {ukCurrentPage === 1 && (
                        <UkPage1SafetySecurityRobustness
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />
                      )}

                      {ukCurrentPage === 2 && (
                        <UkPage2TransparencyExplainability
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />
                      )}

                      {ukCurrentPage === 3 && (
                        <UkPage3FairnessDataGovernance
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />
                      )}

                      {ukCurrentPage === 4 && (
                        <UkPage4AccountabilityGovernance
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />
                      )}

                      {ukCurrentPage === 5 && (
                        <UkPage5ContestabilityRedress
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />
                      )}

                      {ukCurrentPage === 6 && (
                        <UkPage6FoundationModels
                          ukCurrentPage={ukCurrentPage}
                          handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                          evidenceContent={evidenceContent}
                        />
                      )}

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={ukCurrentPage === 0 || (ukCurrentPage === 1 && isMultiJurisdiction)}
                          onClick={() =>
                            setUkCurrentPage((p) => Math.max(isMultiJurisdiction ? 1 : 0, p - 1))
                          }
                        >
                          Previous
                        </Button>

                        {ukCurrentPage < ukPages.length - 1 ? (
                          <Button type="button" onClick={handleNext}>
                            Next
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => submitForm()}
                          >
                            {isSubmitting ? "Submitting..." : "Submit Assessment"}
                          </Button>

                        )}
                      </div>
                    </form>
                  );
                }}
              </Formik>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

}