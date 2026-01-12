// ui/types/policy.ts

export type ComplianceStatus =
  | "Compliant"
  | "Partially compliant"
  | "Non-compliant"
  | "Not assessed";

export type PolicyRequirement = {
  id: string;
  policy_id: string;
  requirement_code?: string;
  title: string;
  description?: string;
  applies_to_scope: string;
  compliance_status: ComplianceStatus;
  notes?: string;
};

export type Policy = {
  id: string;
  name: string;
  policy_type: "External" | "Internal";

  // common
  summary?: string;
  description?: string;
  version: string;

  // external
  jurisdiction?: string;

  // internal
  status?: "Active" | "Draft" | "Archived";
  owner?: string;
  enforcement_level?: "Mandatory" | "Advisory";
  applies_to?: string;
  effective_date?: string;
  document_url?: string;

  requirements?: PolicyRequirement[];
};
export interface CreateInternalPolicyInput {
  name: string;
  description: string;
  applies_to: "All AI" | "High-risk only" | "Specific systems";
  enforcement_level: "Mandatory" | "Advisory";
  owner: string;
  effective_date: string;
  version: string;
  document_url: string;
}
export type SystemPolicyMapping = {
  id: string;
  policy_id: string;
  ai_system_id: string;
  compliance_status: ComplianceStatus;
  assessed_by?: string | null;
  assessed_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};