import { z } from "zod";

export const masPage0Schema = z.object({
  system_name: z.string().min(1, "System name is required"),
  description: z.string().min(1, "Description is required"),
  owner: z.string().optional(),
  jurisdiction: z.string().optional(),
  sector: z.string().min(1, "Sector is required"),
  system_status: z.string().optional(),
  business_use_case: z.string().optional(),
});

export const masPage1Schema = z.object({
  uses_personal_data: z.boolean().optional(),
  personal_data_types: z.string().optional(),
  uses_special_category_data: z.boolean().optional(),
  sensitive_data_types: z.string().optional(),
  uses_third_party_ai: z.boolean().optional(),
  third_party_services_list: z.string().optional(),
  third_party_services_safety: z.string().optional(),
});

export const masPage2Schema = z.object({
  governance_policy: z.boolean().optional(),
  governance_policy_type: z.string().optional(),
  governance_framework: z.string().optional(),
  governance_board_role: z.string().optional(),
  governance_senior_management: z.string().optional(),
  governance_ethics_committee: z.boolean().optional(),
  governance_risk_appetite: z.string().optional(),
  governance_escalation_procedures: z.string().optional(),
});

export const masPage3Schema = z.object({
  inventory_recorded: z.boolean().optional(),
  inventory_location: z.string().optional(),
  inventory_risk_classification: z.string().optional(),
  inventory_update_frequency: z.string().optional(),
  inventory_risk_methodology: z.string().optional(),
  inventory_critical_systems: z.string().optional(),
});

export const masPage4Schema = z.object({
  data_quality_checks: z.boolean().optional(),
  data_quality_methods: z.string().optional(),
  data_bias_analysis: z.string().optional(),
  data_lineage_tracking: z.boolean().optional(),
  data_retention_policies: z.string().optional(),
  data_dpia_conducted: z.boolean().optional(),
  data_cross_border: z.boolean().optional(),
  data_cross_border_safeguards: z.string().optional(),
});

export const masPage5Schema = z.object({
  transparency_docs: z.boolean().optional(),
  transparency_doc_types: z.string().optional(),
  transparency_model_cards: z.boolean().optional(),
  transparency_explainability_methods: z.string().optional(),
  fairness_testing: z.boolean().optional(),
  fairness_testing_methods: z.string().optional(),
  fairness_metrics_used: z.string().optional(),
  human_oversight: z.boolean().optional(),
  human_oversight_type: z.string().optional(),
  human_oversight_processes: z.string().optional(),
});

export const masPage6Schema = z.object({
  third_party_controls: z.boolean().optional(),
  third_party_due_diligence: z.string().optional(),
  algo_documented: z.boolean().optional(),
  algo_documentation_location: z.string().optional(),
  evaluation_testing: z.boolean().optional(),
  evaluation_methods: z.string().optional(),
  evaluation_frequency: z.string().optional(),
});

export const masPage7Schema = z.object({
  security_measures: z.boolean().optional(),
  security_measures_details: z.string().optional(),
  security_incident_response: z.string().optional(),
  monitoring_plan: z.boolean().optional(),
  monitoring_metrics: z.string().optional(),
  capability_training: z.boolean().optional(),
  capability_training_details: z.string().optional(),
  financial_regulatory_reporting: z.boolean().optional(),
  financial_reporting_details: z.string().optional(),
  accountable_person: z.string().min(1, "Accountable person is required"),
});

export const masComprehensiveSchema = masPage0Schema
  .merge(masPage1Schema)
  .merge(masPage2Schema)
  .merge(masPage3Schema)
  .merge(masPage4Schema)
  .merge(masPage5Schema)
  .merge(masPage6Schema)
  .merge(masPage7Schema);

export const masRapidSchema = masPage0Schema.merge(
  z.object({
    uses_personal_data: z.boolean().optional(),
    governance_policy: z.boolean().optional(),
    human_oversight: z.boolean().optional(),
    accountability_roles: z.string().optional(),
    security_measures: z.boolean().optional(),
    accountable_person: z.string().min(1, "Accountable person is required"),
  })
);

export type MasFormValues = z.infer<typeof masComprehensiveSchema>;

export const masPageSchemas = [
  masPage0Schema,
  masPage1Schema,
  masPage2Schema,
  masPage3Schema,
  masPage4Schema,
  masPage5Schema,
  masPage6Schema,
  masPage7Schema,
];

export const masRapidPageSchemas = [
  masPage0Schema,
  z.object({
    uses_personal_data: z.boolean().optional(),
    governance_policy: z.boolean().optional(),
    human_oversight: z.boolean().optional(),
    accountability_roles: z.string().optional(),
    security_measures: z.boolean().optional(),
  }),
  masPage7Schema,
];

export function getDefaultValues(existingData?: Partial<MasFormValues>): MasFormValues {
  return {
    system_name: existingData?.system_name || "",
    description: existingData?.description || "",
    owner: existingData?.owner || "",
    jurisdiction: existingData?.jurisdiction || "",
    sector: existingData?.sector || "",
    system_status: existingData?.system_status || "envision",
    business_use_case: existingData?.business_use_case || "",
    uses_personal_data: existingData?.uses_personal_data || false,
    personal_data_types: existingData?.personal_data_types || "",
    uses_special_category_data: existingData?.uses_special_category_data || false,
    sensitive_data_types: existingData?.sensitive_data_types || "",
    uses_third_party_ai: existingData?.uses_third_party_ai || false,
    third_party_services_list: existingData?.third_party_services_list || "",
    third_party_services_safety: existingData?.third_party_services_safety || "",
    governance_policy: existingData?.governance_policy || false,
    governance_policy_type: existingData?.governance_policy_type || "",
    governance_framework: existingData?.governance_framework || "",
    governance_board_role: existingData?.governance_board_role || "",
    governance_senior_management: existingData?.governance_senior_management || "",
    governance_ethics_committee: existingData?.governance_ethics_committee || false,
    governance_risk_appetite: existingData?.governance_risk_appetite || "",
    governance_escalation_procedures: existingData?.governance_escalation_procedures || "",
    inventory_recorded: existingData?.inventory_recorded || false,
    inventory_location: existingData?.inventory_location || "",
    inventory_risk_classification: existingData?.inventory_risk_classification || "",
    inventory_update_frequency: existingData?.inventory_update_frequency || "",
    inventory_risk_methodology: existingData?.inventory_risk_methodology || "",
    inventory_critical_systems: existingData?.inventory_critical_systems || "",
    data_quality_checks: existingData?.data_quality_checks || false,
    data_quality_methods: existingData?.data_quality_methods || "",
    data_bias_analysis: existingData?.data_bias_analysis || "",
    data_lineage_tracking: existingData?.data_lineage_tracking || false,
    data_retention_policies: existingData?.data_retention_policies || "",
    data_dpia_conducted: existingData?.data_dpia_conducted || false,
    data_cross_border: existingData?.data_cross_border || false,
    data_cross_border_safeguards: existingData?.data_cross_border_safeguards || "",
    transparency_docs: existingData?.transparency_docs || false,
    transparency_doc_types: existingData?.transparency_doc_types || "",
    transparency_model_cards: existingData?.transparency_model_cards || false,
    transparency_explainability_methods: existingData?.transparency_explainability_methods || "",
    fairness_testing: existingData?.fairness_testing || false,
    fairness_testing_methods: existingData?.fairness_testing_methods || "",
    fairness_metrics_used: existingData?.fairness_metrics_used || "",
    human_oversight: existingData?.human_oversight || false,
    human_oversight_type: existingData?.human_oversight_type || "",
    human_oversight_processes: existingData?.human_oversight_processes || "",
    third_party_controls: existingData?.third_party_controls || false,
    third_party_due_diligence: existingData?.third_party_due_diligence || "",
    algo_documented: existingData?.algo_documented || false,
    algo_documentation_location: existingData?.algo_documentation_location || "",
    evaluation_testing: existingData?.evaluation_testing || false,
    evaluation_methods: existingData?.evaluation_methods || "",
    evaluation_frequency: existingData?.evaluation_frequency || "",
    security_measures: existingData?.security_measures || false,
    security_measures_details: existingData?.security_measures_details || "",
    security_incident_response: existingData?.security_incident_response || "",
    monitoring_plan: existingData?.monitoring_plan || false,
    monitoring_metrics: existingData?.monitoring_metrics || "",
    capability_training: existingData?.capability_training || false,
    capability_training_details: existingData?.capability_training_details || "",
    financial_regulatory_reporting: existingData?.financial_regulatory_reporting || false,
    financial_reporting_details: existingData?.financial_reporting_details || "",
    accountable_person: existingData?.accountable_person || "",
  };
}
