"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";

import { Formik } from "formik";
import * as Yup from "yup";


// UK FORM PAGES
import UkPage0SystemProfile from "../uk/pages/ukPage0SystemProfile";
import UkPage1SafetySecurityRobustness from "../uk/pages/ukPage1SafetySecurityRobustness";
import UkPage2TransparencyExplainability from "../uk/pages/ukPage2TransparencyExplainability";
import UkPage3FairnessDataGovernance from "../uk/pages/ukPage3FairnessDataGovernance";
import UkPage4AccountabilityGovernance from "../uk/pages/ukPage4AccountabilityGovernance";
import UkPage5ContestabilityRedress from "../uk/pages/ukPage5ContestabilityRedress";
import UkPage6FoundationModels from "../uk/pages/ukPage6FoundationModels";


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


export default function UkAssessmentPage() {
    const router = useRouter();
    const { systemId } = router.query;

    const [ukCurrentPage, setUkCurrentPage] = useState(0);
    const [ukInitialFromDb, setUkInitialFromDb] = useState<typeof ukInitialState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const initialValues = ukInitialFromDb ?? ukInitialState;
    const [evidenceContent, setEvidenceContent] = useState<Record<string, string>>({});




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

        // Page 3 – Fairness
        Yup.object({
            bias_testing: Yup.boolean(),
            bias_testing_evidence: Yup.string().when("bias_testing", {
                is: true,
                then: (s) => s.required("Evidence is required for bias testing"),
            }),
        }),


        // Page 4
        Yup.object({}),

        // Page 5
        Yup.object({}),

        // Page 6
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

            if (data.current_step && data.current_step > 1) {
                setUkCurrentPage(data.current_step - 1);
            }

            setUkInitialFromDb({
                ...ukInitialState,
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

    const handleSubmit = async (values: typeof ukInitialState) => {
        if (ukCurrentPage < ukPages.length - 1) return;

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

    type UkValues = typeof ukInitialState;


    type FormValues = UkValues;

    if (!systemId) {
        return <div className="p-8">Invalid system</div>;
    }

    if (!ukInitialFromDb) {
        return <div className="p-8">Loading assessment…</div>;
    }

    return (
        <div className="min-h-screen bg-white">
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
                                            Step {ukCurrentPage + 1} of {ukPages.length}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {ukPages[ukCurrentPage].title}
                                        </span>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${((ukCurrentPage + 1) / ukPages.length) * 100}%`,
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
                                            if (ukCurrentPage === 0 && systemId) {
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
                                                {ukCurrentPage === 0 && (
                                                    <UkPage0SystemProfile ukCurrentPage={ukCurrentPage} />
                                                )}

                                                {ukCurrentPage === 1 && (
                                                    <UkPage1SafetySecurityRobustness
                                                        ukCurrentPage={ukCurrentPage}
                                                        handleEvidenceFileChange={handleEvidenceFileChange}
                                                        evidenceContent={evidenceContent}
                                                    />
                                                )}

                                                {ukCurrentPage === 2 && (
                                                    <UkPage2TransparencyExplainability
                                                        ukCurrentPage={ukCurrentPage}
                                                        handleEvidenceFileChange={handleEvidenceFileChange}
                                                        evidenceContent={evidenceContent}
                                                    />
                                                )}

                                                {ukCurrentPage === 3 && (
                                                    <UkPage3FairnessDataGovernance
                                                        ukCurrentPage={ukCurrentPage}
                                                        handleEvidenceFileChange={handleEvidenceFileChange}
                                                        evidenceContent={evidenceContent}
                                                    />
                                                )}

                                                {ukCurrentPage === 4 && (
                                                    <UkPage4AccountabilityGovernance
                                                        ukCurrentPage={ukCurrentPage}
                                                        handleEvidenceFileChange={handleEvidenceFileChange}
                                                        evidenceContent={evidenceContent}
                                                    />
                                                )}

                                                {ukCurrentPage === 5 && (
                                                    <UkPage5ContestabilityRedress
                                                        ukCurrentPage={ukCurrentPage}
                                                        handleEvidenceFileChange={handleEvidenceFileChange}
                                                        evidenceContent={evidenceContent}
                                                    />
                                                )}

                                                {ukCurrentPage === 6 && (
                                                    <UkPage6FoundationModels
                                                        ukCurrentPage={ukCurrentPage}
                                                        handleEvidenceFileChange={handleEvidenceFileChange}
                                                        evidenceContent={evidenceContent}
                                                    />
                                                )}

                                                <div className="flex justify-between pt-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        disabled={ukCurrentPage === 0}
                                                        onClick={() =>
                                                            setUkCurrentPage((p) => Math.max(0, p - 1))
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