export interface UKAssessmentResult {
  id: string;
  user_id: string | null;
  created_at: string;
  system_id?: string | null;
  assessment_mode?: "rapid" | "comprehensive";
  warning?: string | null;
  risk_level: UKRiskLevel;
  overall_assessment: UKComplianceStatus;
  safety_and_security: UKPrincipleStatus;
  transparency: UKPrincipleStatus;
  fairness: UKPrincipleStatus;
  governance: UKPrincipleStatus;
  contestability: UKPrincipleStatus;
  sector_regulation: UKSectorRegulation;
  summary: string;
  raw_answers?: Record<string, any>;
  compliance_score?: number;
  confidence_score?: number;
  score_breakdown?: {
    baseScore: number;
    penaltiesApplied: { reason: string; amount: number; conditionMet: boolean }[];
    evidenceBoost: number;
    finalScore: number;
    questionsAssessed: string[];
    questionsSkipped: string[];
    confidenceScore: number;
  };
}

export type UKRiskLevel =
  | "Frontier / High-Impact Model"
  | "High-Risk (Sector)"
  | "Medium-Risk"
  | "Low-Risk";

export type UKComplianceStatus = "Compliant" | "Partially compliant" | "Non-compliant";

export interface UKPrincipleStatus {
  meetsPrinciple: boolean;
  missing: string[];
}

export interface UKSectorRegulation {
  sector: string;
  requiredControls: string[];
  gaps: string[];
}
