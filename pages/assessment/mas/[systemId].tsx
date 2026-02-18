"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

import { Formik } from "formik";
import * as Yup from "yup";


// MAS FORM PAGES
import MasPage1SystemProfile from "@/components/assessment/mas/masPage1Intro";
import MasPage2DataDependencies from "@/components/assessment/mas/masPage2DataDependencies"
import MasPage3GovernanceOversight from "@/components/assessment/mas/masPage3GovernanceOversight"
import MasPage4InventoryRisk from "@/components/assessment/mas/masPage4InventoryRisk"
import MasPage5DataManagementQuality from "@/components/assessment/mas/masPage5DataManagementQuality"
import MasPage6TechnicalPillars from "@/components/assessment/mas/masPage6TechnicalPillars"
import MasPage7OperationalPillars from "@/components/assessment/mas/masPage7OperationalPillars"
import SecurityMonitoring from "@/components/assessment/mas/securityMonitoring"


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


export default function MasAssessmentPage() {
    const router = useRouter();
    const { systemId } = router.query;

    // State for MAS multi-page navigation
    const [masCurrentPage, setMasCurrentPage] = useState(0);
    const [masInitialFromDb, setMasInitialFromDb] = useState<typeof masInitialState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMultiJurisdiction, setIsMultiJurisdiction] = useState(false);
    const initialValues = masInitialFromDb ?? masInitialState;
    const [evidenceContent, setEvidenceContent] = useState<Record<string, string>>({});




    const validationSchema = Yup.object({
        system_name: Yup.string().required("System name is required"),
        sector: Yup.string().required("Sector is required"),
        description: Yup.string().required("Description is required"),
    });


    const masPageSchemas = [
        // Page 0 – System Profile
        Yup.object({
            system_name: Yup.string().required("System name is required"),
            description: Yup.string().required("Description is required"),
        }),


        // Page 1 – Data & Dependencies
        Yup.object({

            // data_types: Yup.string().when("data_types", {
            //     is: true,
            //     then: (s) =>
            //         s.required("Data Types are required."),
            //     otherwise: (s) => s.notRequired(),
            // }),

            data_types: Yup.string()
                .required("Data Types are required."),

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
            // Main governance policy toggle
            governance_policy: Yup.boolean(),

            // Shown when governance_policy is true
            governance_policy_type: Yup.string().when("governance_policy", {
                is: true,
                then: (s) =>
                    s.required("Governance policy type is required"),
                otherwise: (s) => s.notRequired(),
            }),

            governance_framework: Yup.string().when("governance_policy", {
                is: true,
                then: (s) =>
                    s.required("Governance framework or standard is required"),
                otherwise: (s) => s.notRequired(),
            }),

            governance_board_role: Yup.string().when("governance_policy", {
                is: true,
                then: (s) =>
                    s.required("Board role in AI governance is required"),
                otherwise: (s) => s.notRequired(),
            }),

            governance_senior_management: Yup.string().when("governance_policy", {
                is: true,
                then: (s) =>
                    s.required("Senior management responsibilities are required"),
                otherwise: (s) => s.notRequired(),
            }),

            governance_policy_assigned: Yup.string().when("governance_policy", {
                is: true,
                then: (s) =>
                    s.required("Assigned governance responsibilities are required"),
                otherwise: (s) => s.notRequired(),
            }),

            // governance_evidence: Yup.string().when("governance_policy", {
            //     is: true,
            //     then: (s) =>
            //         s.required("Evidence for are required"),
            //     otherwise: (s) => s.notRequired(),
            // }),

            // Ethics committee section
            governance_ethics_committee_details: Yup.string()
                .required("Ethics committee details are required"),

            // Risk appetite statement
            governance_risk_appetite: Yup.string()
                .required("Risk appetite statement is required"),

            // Policy review frequency
            governance_policy_review_frequency: Yup.string()
                .required("Policy review frequency is required"),
        }),

        // Page 3 – Inventory
        Yup.object({
            // Main toggle: is the system recorded in inventory
            inventory_recorded: Yup.boolean(),

            // Shown when inventory_recorded is true
            inventory_location: Yup.string().when("inventory_recorded", {
                is: true,
                then: (s) =>
                    s.required("Inventory location is required"),
                otherwise: (s) => s.notRequired(),
            }),

            inventory_risk_classification: Yup.string().when("inventory_recorded", {
                is: true,
                then: (s) =>
                    s.required("Risk classification is required"),
                otherwise: (s) => s.notRequired(),
            }),

            // Evidence is optional at schema level (file upload)

            // Always asked (not gated by toggle)
            inventory_update_frequency: Yup.string()
                .required("Inventory update frequency is required"),

            inventory_risk_methodology: Yup.string()
                .required("Risk classification methodology is required"),

            inventory_risk_review_process: Yup.string()
                .required("Risk review process is required"),

            inventory_critical_systems: Yup.string()
                .required("Critical system identification is required"),

            inventory_dependency_mapping: Yup.string()
                .required("Dependency mapping details are required"),

            inventory_legacy_systems: Yup.string()
                .required("Legacy system handling is required"),
        }),

        // Page 4 – Data Quality
        Yup.object({
            // Main toggle: data quality checks & bias analysis documented
            data_quality_checks: Yup.boolean(),

            // Shown when data_quality_checks is true
            data_quality_methods: Yup.string().when("data_quality_checks", {
                is: true,
                then: (s) =>
                    s.required("Data quality checks are required"),
                otherwise: (s) => s.notRequired(),
            }),

            data_bias_analysis: Yup.string().when("data_quality_checks", {
                is: true,
                then: (s) =>
                    s.required("Bias analysis details are required"),
                otherwise: (s) => s.notRequired(),
            }),

            // Evidence optional (file upload)

            // Data lineage section (toggle + details)
            data_lineage_tracking: Yup.boolean(),

            data_lineage_details: Yup.string().when("data_lineage_tracking", {
                is: true,
                then: (s) =>
                    s.required("Data lineage tracking details are required"),
                otherwise: (s) => s.notRequired(),
            }),

            // Always-asked data management questions
            data_retention_policies: Yup.string()
                .required("Data retention policies are required"),

            data_minimization: Yup.string()
                .required("Data minimization approach is required"),

            data_accuracy_metrics: Yup.string()
                .required("Data accuracy metrics are required"),

            data_freshness: Yup.string()
                .required("Data freshness approach is required"),

            // Synthetic data usage (toggle + details)
            data_synthetic_usage: Yup.boolean(),

            data_synthetic_details: Yup.string().when("data_synthetic_usage", {
                is: true,
                then: (s) =>
                    s.required("Synthetic data usage details are required"),
                otherwise: (s) => s.notRequired(),
            }),

            data_dpia_conducted: Yup.boolean(),

            data_dpia_details: Yup.string().when("data_dpia_conducted", {
                is: true,
                then: (s) =>
                    s.required("Synthetic data usage details are required"),
                otherwise: (s) => s.notRequired(),
            }),

            data_cross_border: Yup.boolean(),

            data_cross_border_safeguards: Yup.string().when("data_cross_border", {
                is: true,
                then: (s) =>
                    s.required("Synthetic data usage details are required"),
                otherwise: (s) => s.notRequired(),
            }),
        }),

        // Page 5 – Technical Pillars
        Yup.object({
            // Transparency & Explainability
            transparency_docs: Yup.boolean()
                .oneOf([true, false], "Please indicate whether transparency documentation exists"),

            transparency_doc_types: Yup.string().when("transparency_docs", {
                is: true,
                then: (s) =>
                    s.required("Please specify transparency documentation types. Enter null if nothing to show"),
            }),

            transparency_user_explanations: Yup.string().when("transparency_docs", {
                is: true,
                then: (s) =>
                    s.required("Please describe user explanation methods. Enter null if nothing to show"),
            }),

            transparency_model_cards: Yup.boolean()
                .oneOf([true, false], "Please indicate whether model cards are maintained"),

            transparency_model_cards_details: Yup.string().when("transparency_model_cards", {
                is: true,
                then: (s) =>
                    s.required("Please describe what information is included in model cards. Enter null if nothing to show"),
            }),

            transparency_explainability_methods: Yup.string()
                .required("Please describe explainability methods used. Enter null if nothing to show"),

            transparency_user_communication: Yup.string()
                .required("Please describe how AI limitations are communicated to users. Enter null if nothing to show"),

            transparency_decision_documentation: Yup.string()
                .required("Please describe how AI decisions are documented. Enter null if nothing to show"),

            transparency_interpretability_requirements: Yup.string()
                .required("Please describe interpretability requirements. Enter null if nothing to show"),

            transparency_stakeholder_communication: Yup.string()
                .required("Please describe stakeholder communication about AI behavior. Enter null if nothing to show"),

            fairness_protected_attributes: Yup.string()
                .required("Please specify protected attributes tested for. Enter null if nothing to show"),

            // Fairness & Bias Testing
            fairness_testing: Yup.boolean()
                .oneOf([true, false], "Please indicate whether bias or discrimination testing has been performed"),

            fairness_testing_methods: Yup.string().when("fairness_testing", {
                is: true,
                then: (s) =>
                    s.required("Please describe bias testing methods used. Enter null if nothing to show"),
            }),

            fairness_test_results: Yup.string().when("fairness_testing", {
                is: true,
                then: (s) =>
                    s.required("Please describe fairness testing results. Enter null if nothing to show"),
            }),

            fairness_metrics_used: Yup.string()
                .required("Please describe fairness metrics used. Enter null if nothing to show"),

            fairness_bias_mitigation: Yup.string()
                .required("Please describe bias mitigation strategies. Enter null if nothing to show"),

            fairness_continuous_monitoring: Yup.string()
                .required("Please describe continuous bias monitoring. Enter null if nothing to show"),

            fairness_adverse_impact: Yup.string()
                .required("Please describe adverse impact analysis. Enter null if nothing to show"),

            fairness_testing_frequency: Yup.string()
                .required("Please describe bias testing frequency. Enter null if nothing to show"),

            fairness_external_validation: Yup.boolean(),

            fairness_external_validation_details: Yup.string().when("fairness_external_validation", {
                is: true,
                then: (s) =>
                    s.required("Please describe external validation process. Enter null if nothing to show"),
            }),

            human_oversight_processes: Yup.string().when("fairness_external_validation", {
                is: true,
                then: (s) =>
                    s.required("Please describe external validation process. Enter null if nothing to show"),
            }),

            // Human Oversight
            human_oversight: Yup.boolean()
                .oneOf([true, false], "Please indicate whether human-in-the-loop or human-on-the-loop processes exist"),

            human_oversight_type: Yup.string().when("human_oversight", {
                is: true,
                then: (s) =>
                    s.required("Please describe human oversight type (HITL, HOTL, or both). Enter null if nothing to show"),
            }),


            human_oversight_roles: Yup.string()
                .required("Please describe human oversight roles and qualifications. Enter null if nothing to show"),

            human_oversight_qualifications: Yup.string()
                .required("Please describe qualifications required for human overseers. Enter null if nothing to show"),

            human_oversight_intervention_triggers: Yup.string()
                .required("Please describe what triggers human intervention. Enter null if nothing to show"),

            human_oversight_decision_authority: Yup.string()
                .required("Please describe human overseers' decision authority. Enter null if nothing to show"),

            human_oversight_training: Yup.string()
                .required("Please describe training for human overseers. Enter null if nothing to show"),

            human_oversight_escalation: Yup.string()
                .required("Please describe escalation procedures. Enter null if nothing to show"),

            human_oversight_documentation: Yup.string()
                .required("Please describe how oversight activities are documented. Enter null if nothing to show"),

            human_oversight_automation_percentage: Yup.string()
                .required("Please describe the percentage of automated vs human-reviewed decisions. Enter null if nothing to show"),
        }),

        // Page 7 – Operational Pillars
        Yup.object({
            // Third-Party & Vendor Management
            third_party_controls: Yup.boolean()
                .oneOf([true, false], "Please indicate whether vendor due diligence and controls exist"),

            third_party_due_diligence: Yup.string().when("third_party_controls", {
                is: true,
                then: (s) =>
                    s.required("Please describe vendor due diligence performed. Enter null if nothing to show"),
            }),

            third_party_contracts: Yup.string().when("third_party_controls", {
                is: true,
                then: (s) =>
                    s.required("Please describe controls in vendor contracts. Enter null if nothing to show"),
            }),

            third_party_vendor_risk_assessment: Yup.string()
                .required("Please describe vendor risk assessment methodology. Enter null if nothing to show"),

            third_party_slas: Yup.string()
                .required("Please describe SLAs with third-party vendors. Enter null if nothing to show"),

            third_party_vendor_monitoring: Yup.string()
                .required("Please describe vendor monitoring practices. Enter null if nothing to show"),

            third_party_exit_strategy: Yup.string()
                .required("Please describe vendor exit strategy. Enter null if nothing to show"),

            third_party_data_residency: Yup.string()
                .required("Please describe data residency for vendor data. Enter null if nothing to show"),

            third_party_incident_reporting: Yup.string()
                .required("Please describe incident reporting requirements for vendors. Enter null if nothing to show"),

            third_party_audit_rights: Yup.string()
                .required("Please describe audit rights over vendor operations. Enter null if nothing to show"),

            third_party_multi_vendor: Yup.string()
                .required("Please describe multi-vendor management approach. Enter null if nothing to show"),

            // Algorithm & Feature Selection
            algo_documented: Yup.boolean()
                .oneOf([true, false], "Please indicate whether algorithm selection and feature engineering is documented"),

            algo_selection_process: Yup.string().when("algo_documented", {
                is: true,
                then: (s) =>
                    s.required("Please describe algorithm selection process. Enter null if nothing to show"),
            }),

            algo_feature_engineering: Yup.string().when("algo_documented", {
                is: true,
                then: (s) =>
                    s.required("Please describe feature engineering approach. Enter null if nothing to show"),
            }),

            algo_selection_criteria: Yup.string()
                .required("Please describe algorithm selection criteria. Enter null if nothing to show"),

            algo_model_comparison: Yup.string()
                .required("Please describe model comparison methodology. Enter null if nothing to show"),

            algo_feature_importance: Yup.string()
                .required("Please describe feature importance analysis. Enter null if nothing to show"),

            algo_feature_drift: Yup.string()
                .required("Please describe feature drift detection and handling. Enter null if nothing to show"),

            algo_model_versioning: Yup.string()
                .required("Please describe model versioning approach. Enter null if nothing to show"),

            algo_ab_testing: Yup.boolean()
                .oneOf([true, false], "Please indicate whether A/B testing is conducted for algorithm selection"),

            algo_ab_testing_details: Yup.string().when("algo_ab_testing", {
                is: true,
                then: (s) =>
                    s.required("Please describe A/B testing methodology. Enter null if nothing to show"),
            }),

            algo_hyperparameter_tuning: Yup.string()
                .required("Please describe hyperparameter tuning approach. Enter null if nothing to show"),

            // Evaluation & Testing
            evaluation_testing: Yup.boolean()
                .oneOf([true, false], "Please indicate whether pre-deployment testing and robustness checks have been completed"),

            evaluation_test_types: Yup.string().when("evaluation_testing", {
                is: true,
                then: (s) =>
                    s.required("Please describe types of pre-deployment testing completed. Enter null if nothing to show"),
            }),

            evaluation_robustness_checks: Yup.string().when("evaluation_testing", {
                is: true,
                then: (s) =>
                    s.required("Please describe robustness checks performed. Enter null if nothing to show"),
            }),

            evaluation_test_data_management: Yup.string()
                .required("Please describe test data management approach. Enter null if nothing to show"),

            evaluation_performance_benchmarks: Yup.string()
                .required("Please describe performance benchmarks used. Enter null if nothing to show"),

            evaluation_regression_testing: Yup.boolean()
                .oneOf([true, false], "Please indicate whether regression testing is performed when models are updated"),

            evaluation_regression_details: Yup.string().when("evaluation_regression_testing", {
                is: true,
                then: (s) =>
                    s.required("Please describe regression testing process. Enter null if nothing to show"),
            }),

            evaluation_stress_testing: Yup.boolean()
                .oneOf([true, false], "Please indicate whether stress testing under extreme conditions has been conducted"),

            evaluation_stress_testing_details: Yup.string().when("evaluation_stress_testing", {
                is: true,
                then: (s) =>
                    s.required("Please describe stress testing methodology and results. Enter null if nothing to show"),
            }),

            evaluation_failsafe_mechanisms: Yup.string()
                .required("Please describe failsafe mechanisms in place. Enter null if nothing to show"),

            evaluation_rollback_procedures: Yup.string()
                .required("Please describe rollback procedures for model deployments. Enter null if nothing to show"),

            evaluation_test_documentation: Yup.string()
                .required("Please describe how test results and evaluation findings are documented. Enter null if nothing to show"),
        }),

        // Page 8 – Security, Monitoring & Capability
        Yup.object({
            // Technology & Cybersecurity
            security_measures: Yup.boolean()
                .oneOf([true, false], "Please indicate whether security measures exist"),

            security_cybersecurity_measures: Yup.string().when("security_measures", {
                is: true,
                then: (s) =>
                    s.required("Please describe cybersecurity measures in place. Enter null if nothing to show"),
            }),

            security_prompt_injection: Yup.string().when("security_measures", {
                is: true,
                then: (s) =>
                    s.required("Please describe prompt injection protection. Enter null if nothing to show"),
            }),

            security_data_leakage: Yup.string().when("security_measures", {
                is: true,
                then: (s) =>
                    s.required("Please describe data leakage prevention. Enter null if nothing to show"),
            }),

            security_access_controls: Yup.string()
                .required("Please describe access controls for AI systems. Enter null if nothing to show"),

            security_encryption: Yup.string()
                .required("Please describe data encryption at rest and in transit. Enter null if nothing to show"),

            security_authentication: Yup.string()
                .required("Please describe authentication mechanisms. Enter null if nothing to show"),

            security_network_security: Yup.string()
                .required("Please describe network security measures. Enter null if nothing to show"),

            security_vulnerability_scanning: Yup.string()
                .required("Please describe vulnerability scanning frequency and process. Enter null if nothing to show"),

            security_penetration_testing: Yup.boolean()
                .oneOf([true, false], "Please indicate whether penetration testing is conducted"),

            security_penetration_details: Yup.string().when("security_penetration_testing", {
                is: true,
                then: (s) =>
                    s.required("Please describe penetration testing process. Enter null if nothing to show"),
            }),

            security_incident_response: Yup.string()
                .required("Please describe security incident response plan. Enter null if nothing to show"),

            security_certifications: Yup.string()
                .required("Please describe security certifications and standards compliance. Enter null if nothing to show"),

            // Monitoring & Change Management
            monitoring_plan: Yup.boolean()
                .oneOf([true, false], "Please indicate whether drift monitoring, incident management, and version control processes exist"),

            monitoring_drift_detection: Yup.string().when("monitoring_plan", {
                is: true,
                then: (s) =>
                    s.required("Please describe model drift detection and monitoring. Enter null if nothing to show"),
            }),

            monitoring_incident_management: Yup.string().when("monitoring_plan", {
                is: true,
                then: (s) =>
                    s.required("Please describe incident management process. Enter null if nothing to show"),
            }),

            monitoring_version_control: Yup.string().when("monitoring_plan", {
                is: true,
                then: (s) =>
                    s.required("Please describe version control and model update management. Enter null if nothing to show"),
            }),

            monitoring_performance_metrics: Yup.string()
                .required("Please describe performance metrics monitored. Enter null if nothing to show"),

            monitoring_alert_thresholds: Yup.string()
                .required("Please describe alert thresholds configured. Enter null if nothing to show"),

            monitoring_tools: Yup.string()
                .required("Please describe monitoring tools used. Enter null if nothing to show"),

            monitoring_change_approval: Yup.string()
                .required("Please describe change approval process. Enter null if nothing to show"),

            monitoring_rollback_capability: Yup.string()
                .required("Please describe rollback capability and time. Enter null if nothing to show"),

            monitoring_change_impact: Yup.string()
                .required("Please describe change impact assessment. Enter null if nothing to show"),

            monitoring_post_deployment: Yup.string()
                .required("Please describe post-deployment monitoring. Enter null if nothing to show"),

            monitoring_kill_switch: Yup.boolean()
                .oneOf([true, false], "Please indicate whether a kill switch exists to stop the AI system"),

            monitoring_kill_switch_details: Yup.string().when("monitoring_kill_switch", {
                is: true,
                then: (s) =>
                    s.required("Please describe kill switch mechanism. Enter null if nothing to show"),
            }),

            // Capability & Capacity
            capability_training: Yup.boolean()
                .oneOf([true, false], "Please indicate whether team has necessary skills, training, and infrastructure"),

            capability_team_skills: Yup.string().when("capability_training", {
                is: true,
                then: (s) =>
                    s.required("Please describe team skills for managing AI systems. Enter null if nothing to show"),
            }),

            capability_training_programs: Yup.string().when("capability_training", {
                is: true,
                then: (s) =>
                    s.required("Please describe training programs completed. Enter null if nothing to show"),
            }),

            capability_infrastructure: Yup.string().when("capability_training", {
                is: true,
                then: (s) =>
                    s.required("Please describe infrastructure and tools for AI governance. Enter null if nothing to show"),
            }),
        })
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
                dataProcessingLocations.includes("Singapore") &&
                ((dataProcessingLocations.includes("United Kingdom") || dataProcessingLocations.includes("UK")) ||
                    (dataProcessingLocations.includes("European Union") || dataProcessingLocations.includes("EU") ||
                        dataProcessingLocations.some((loc: string) =>
                            ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
                                "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
                                "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
                                "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
                                "Slovenia", "Spain", "Sweden"].some(c => c.toLowerCase() === loc.toLowerCase())
                        )));

            console.log(`\n${'='.repeat(80)}`);
            console.log(`🔄 [MAS-ASSESSMENT] Loading MAS assessment`);
            console.log(`   System ID: ${systemId}`);
            console.log(`   Multi-jurisdiction flow: ${hasMultipleJurisdictions}`);
            console.log(`   Data processing locations:`, dataProcessingLocations);
            console.log(`${'='.repeat(80)}\n`);

            setIsMultiJurisdiction(hasMultipleJurisdictions);

            // If multi-jurisdiction flow, skip page 0 (common questions already answered)
            if (hasMultipleJurisdictions) {
                console.log(`➡️  [MAS-ASSESSMENT] Multi-jurisdiction detected - skipping page 0, starting at page 1`);
                setMasCurrentPage(1); // Start at page 1 instead of page 0
            } else if (data.current_step && data.current_step > 1) {
                setMasCurrentPage(data.current_step - 1);
            }

            // Determine jurisdiction from data_processing_locations (preferred) or fallback to country
            let jurisdiction = "";
            if (data.data_processing_locations && Array.isArray(data.data_processing_locations) && data.data_processing_locations.length > 0) {
                // For MAS form, prioritize Singapore if present, otherwise show all locations
                if (data.data_processing_locations.includes("Singapore")) {
                    jurisdiction = "Singapore";
                } else {
                    jurisdiction = data.data_processing_locations.join(", ");
                }
            } else {
                // Fallback to country if data_processing_locations is not available
                jurisdiction = data.country ?? "";
            }

            setMasInitialFromDb({
                ...masInitialState,
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

    const handleSubmit = async (values: typeof masInitialState) => {
        if (masCurrentPage < masPages.length - 1) return;

        setIsSubmitting(true);
        setError(null);

        const payload = {
            system_id: systemId,
            answers: {
                ...values,
                ...Object.fromEntries(
                    Object.entries(evidenceContent).map(([k, v]) => [`${k}_content`, v])
                ),
            },
        };

        const res = await backendFetch("/api/mas-compliance", {
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
        console.log(`✅ [MAS-ASSESSMENT] MAS assessment submitted successfully`);
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
            console.log(`📋 [MAS-ASSESSMENT] Data processing locations:`, dataProcessingLocations);

            const hasMultipleJurisdictions =
                dataProcessingLocations.includes("Singapore") &&
                ((dataProcessingLocations.includes("United Kingdom") || dataProcessingLocations.includes("UK")) ||
                    (dataProcessingLocations.includes("European Union") || dataProcessingLocations.includes("EU") ||
                        dataProcessingLocations.some((loc: string) =>
                            ["Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
                                "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
                                "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
                                "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
                                "Slovenia", "Spain", "Sweden"].some(c => c.toLowerCase() === loc.toLowerCase())
                        )));

            console.log(`🔍 [MAS-ASSESSMENT] Multiple jurisdictions detected: ${hasMultipleJurisdictions}`);

            if (hasMultipleJurisdictions) {
                console.log(`➡️  [MAS-ASSESSMENT] Redirecting to multi-jurisdiction page`);
                router.push(`/assessment/multi/${systemId}?completed=MAS&assessmentId=${assessmentId}`);
            } else {
                console.log(`➡️  [MAS-ASSESSMENT] Single jurisdiction - redirecting to MAS results`);
                router.push(`/mas/${assessmentId}`);
            }
        } catch (err: any) {
            console.error(`❌ [MAS-ASSESSMENT] Error checking multi-jurisdiction:`, err);
            console.log(`➡️  [MAS-ASSESSMENT] Fallback: redirecting to MAS results`);
            // Fallback to normal redirect if check fails
            router.push(`/mas/${assessmentId}`);
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

                        // Normalize evidence key: remove 'mas_' prefix if present (backend expects keys without prefix)
                        const normalizedKey = key.startsWith('mas_') ? key.replace(/^mas_/, '') : key;

                        console.log(`🔧 [AUTO-POPULATE] Normalizing evidence key: ${key} -> ${normalizedKey}`);

                        // Call universal analysis endpoint
                        const analysisRes = await backendFetch("/api/analyze-document", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                documentText: extractedText,
                                evidenceKey: normalizedKey,
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
                                    // Third Party Controls
                                    if (fieldName === 'third_party_due_diligence' || fieldName === 'third_party_contracts') {
                                        toggleFields['third_party_controls'] = true;
                                    }
                                    // Algorithm Documentation
                                    if (fieldName === 'algo_selection_process' || fieldName === 'algo_feature_engineering') {
                                        toggleFields['algo_documented'] = true;
                                    }
                                    // Evaluation Testing
                                    if (fieldName === 'evaluation_test_types' || fieldName === 'evaluation_robustness_checks') {
                                        toggleFields['evaluation_testing'] = true;
                                    }
                                    // Security Measures
                                    if (fieldName === 'security_cybersecurity_measures' || fieldName === 'security_prompt_injection') {
                                        toggleFields['security_measures'] = true;
                                    }
                                    // Monitoring Plan
                                    if (fieldName === 'monitoring_drift_detection' || fieldName === 'monitoring_incident_management') {
                                        toggleFields['monitoring_plan'] = true;
                                    }
                                    // Capability Training
                                    if (fieldName === 'capability_team_skills' || fieldName === 'capability_training_programs') {
                                        toggleFields['capability_training'] = true;
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

    type MasValues = typeof masInitialState;


    type FormValues = MasValues;

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

    if (!masInitialFromDb) {
        return (
            <div className="min-h-screen bg-white">
                <Head>
                    <title>Loading Assessment | AI Governance</title>
                    <meta name="description" content="Loading the MAS AI risk management assessment..." />
                </Head>
                <Sidebar />
                <div className="lg:pl-72 pt-24 p-8 flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading MAS assessment…</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Head>
                <title>MAS Assessment</title>
                <meta name="description" content="Complete the MAS AI risk management framework compliance assessment." />
            </Head>
            <Sidebar />
            <div className="lg:pl-72 pt-16 lg:pt-24 px-0 lg:px-4">
                <div className="container mx-auto max-w-4xl py-4 px-2 lg:py-12 lg:px-4">
                    <Card className="glass-panel shadow-elevated">
                        <CardHeader>
                            <CardTitle>
                                MAS AI Risk Management Framework Assessment
                            </CardTitle>


                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                        Step {isMultiJurisdiction ? masCurrentPage : masCurrentPage + 1} of {isMultiJurisdiction ? masPages.length - 1 : masPages.length}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {masPages[masCurrentPage].title}
                                    </span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all"
                                        style={{
                                            width: `${isMultiJurisdiction
                                                ? ((masCurrentPage) / (masPages.length - 1)) * 100
                                                : ((masCurrentPage + 1) / masPages.length) * 100}%`,
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
                                validationSchema={masPageSchemas[masCurrentPage]}
                                onSubmit={handleSubmit}
                            >
                                {({ handleSubmit, validateForm, setTouched, values, submitForm, setFieldValue }) => {
                                    // Create wrapper function that includes setFieldValue
                                    const handleEvidenceFileChangeWithForm = (key: string, file: File | null) => {
                                        return handleEvidenceFileChange(key, file, setFieldValue);
                                    };

                                    const handleNext = async () => {
                                        const errors = await validateForm(values);

                                        if (Object.keys(errors).length > 0) {
                                            setTouched(
                                                Object.keys(errors).reduce((a, k) => ({ ...a, [k]: true }), {})
                                            );
                                            return;
                                        }

                                        setMasCurrentPage(p => p + 1);
                                    };

                                    return (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {masCurrentPage === 0 && !isMultiJurisdiction && (
                                                <MasPage1SystemProfile masCurrentPage={masCurrentPage} />
                                            )}

                                            {masCurrentPage === 1 && (
                                                <MasPage2DataDependencies
                                                    masCurrentPage={masCurrentPage}
                                                />

                                            )}

                                            {masCurrentPage === 2 && (
                                                <MasPage3GovernanceOversight
                                                    masCurrentPage={masCurrentPage}
                                                    handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                                                    evidenceContent={evidenceContent}
                                                />
                                            )}

                                            {masCurrentPage === 3 && (
                                                <MasPage4InventoryRisk
                                                    masCurrentPage={masCurrentPage}
                                                    handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                                                    evidenceContent={evidenceContent}
                                                />
                                            )}

                                            {masCurrentPage === 4 && (
                                                <MasPage5DataManagementQuality
                                                    masCurrentPage={masCurrentPage}
                                                    handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                                                    evidenceContent={evidenceContent}
                                                />
                                            )}

                                            {masCurrentPage === 5 && (
                                                <MasPage6TechnicalPillars
                                                    masCurrentPage={masCurrentPage}
                                                    handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                                                    evidenceContent={evidenceContent}
                                                />
                                            )}

                                            {masCurrentPage === 6 && (
                                                <MasPage7OperationalPillars
                                                    masCurrentPage={masCurrentPage}
                                                    handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                                                    evidenceContent={evidenceContent}
                                                />

                                            )}

                                            {masCurrentPage === 7 && (
                                                <SecurityMonitoring
                                                    masCurrentPage={masCurrentPage}
                                                    handleEvidenceFileChange={handleEvidenceFileChangeWithForm}
                                                // evidenceContent={evidenceContent}
                                                />
                                            )}

                                            <div className="flex justify-between pt-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    disabled={masCurrentPage === 0 || (masCurrentPage === 1 && isMultiJurisdiction)}
                                                    onClick={() =>
                                                        setMasCurrentPage((p) => Math.max(isMultiJurisdiction ? 1 : 0, p - 1))
                                                    }
                                                >
                                                    Previous
                                                </Button>

                                                {masCurrentPage < masPages.length - 1 ? (
                                                    <Button 
                                                        type="button" 
                                                        onClick={handleNext}
                                                        className="hover:bg-emerald-700"
                                                    >
                                                        Next
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        disabled={isSubmitting}
                                                        onClick={() => submitForm()}
                                                        className="hover:bg-emerald-700"
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

// Prevent static generation - this page requires Formik context at runtime
export async function getServerSideProps() {
    return {
        props: {},
    };
}