"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";

import { Formik } from "formik";
import * as Yup from "yup";


// MAS FORM PAGES
import MasPage1SystemProfile from "../mas/pages/masPage1Intro";
import MasPage2DataDependencies from "../mas/pages/masPage2DataDependencies"
import MasPage3GovernanceOversight from "../mas/pages/masPage3GovernanceOversight"
import MasPage4InventoryRisk from "../mas/pages/masPage4InventoryRisk"
import MasPage5DataManagementQuality from "../mas/pages/masPage5DataManagementQuality"
import MasPage6TechnicalPillars from "../mas/pages/masPage6TechnicalPillars"
import MasPage7OperationalPillars from "../mas/pages/masPage7OperationalPillars"
import SecurityMonitoring from "../mas/pages/securityMonitoring"


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

    const [masCurrentPage, setMasCurrentPage] = useState(0);
    const [masInitialFromDb, setMasInitialFromDb] = useState<typeof masInitialState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        };
        checkAuth();
    }, []);



    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };


    // MAS Page structure (8 pages)
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

            if (data.current_step && data.current_step > 1) {
                setMasCurrentPage(data.current_step - 1);
            }

            setMasInitialFromDb({
                ...masInitialState,
                system_name: data.system_name ?? "",
                description: data.description ?? "",
                sector: data.sector ?? "",
                system_status: data.system_status ?? "envision",
                business_use_case: data.business_use_case ?? "",
                owner: data.company_name,
                jurisdiction: data.country,
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

        router.push(`/compliance/${systemId}`);
    };


    const handleEvidenceFileChange = async (
        key: string,
        file: File | null
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
                setEvidenceContent((prev) => ({
                    ...prev,
                    [key]: data.files[file.name],
                }));
            }
        } catch (err) {
            console.error("Evidence upload failed", err);
            setError("Failed to process evidence file");
        }
    };

    type MasValues = typeof masInitialState;


    type FormValues = MasValues;

    if (!systemId) {
        return <div className="p-8">Invalid system</div>;
    }

    if (!masInitialFromDb) {
        return <div className="p-8">Loading assessment…</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <Sidebar />

<div className="lg:pl-72 pt-24 px-4">
            <div className="container mx-auto max-w-4xl py-12 px-4">
                <Card className="glass-panel shadow-elevated">
                    <CardHeader>
                        <CardTitle>
                            MAS AI Risk Management Framework Assessment
                        </CardTitle>


                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                    Step {masCurrentPage + 1} of {masPages.length}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {masPages[masCurrentPage].title}
                                </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-purple-600 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${((masCurrentPage + 1) / masPages.length) * 100}%`,
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
                            {({ handleSubmit, validateForm, setTouched, values, submitForm }) => {
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

                                    // Persist Page 0
                                    if (masCurrentPage === 0 && systemId) {
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

                                    setMasCurrentPage((p) => p + 1);
                                };

                                return (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {masCurrentPage === 0 && (
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
                                                handleEvidenceFileChange={handleEvidenceFileChange}
                                                evidenceContent={evidenceContent}
                                            />
                                        )}

                                        {masCurrentPage === 3 && (
                                            <MasPage4InventoryRisk
                                                masCurrentPage={masCurrentPage}
                                                handleEvidenceFileChange={handleEvidenceFileChange}
                                                evidenceContent={evidenceContent}
                                            />
                                        )}

                                        {masCurrentPage === 4 && (
                                            <MasPage5DataManagementQuality
                                                masCurrentPage={masCurrentPage}
                                                handleEvidenceFileChange={handleEvidenceFileChange}
                                                evidenceContent={evidenceContent}
                                            />
                                        )}

                                        {masCurrentPage === 5 && (
                                            <MasPage6TechnicalPillars
                                                masCurrentPage={masCurrentPage}
                                                handleEvidenceFileChange={handleEvidenceFileChange}
                                                evidenceContent={evidenceContent}
                                            />
                                        )}

                                        {masCurrentPage === 6 && (
                                            <MasPage7OperationalPillars
                                                masCurrentPage={masCurrentPage}
                                                handleEvidenceFileChange={handleEvidenceFileChange}
                                                evidenceContent={evidenceContent}
                                            />
                                        )}

                                        <div className="flex justify-between pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={masCurrentPage === 0}
                                                onClick={() =>
                                                    setMasCurrentPage((p) => Math.max(0, p - 1))
                                                }
                                            >
                                                Previous
                                            </Button>

                                            {masCurrentPage < masPages.length - 1 ? (
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