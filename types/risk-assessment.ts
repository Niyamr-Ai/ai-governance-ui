export type RiskLevel = "low" | "medium" | "high";
export type RiskCategory = 'bias' | 'robustness' | 'privacy' | 'explainability';
export type MitigationStatus = 'not_started' | 'in_progress' | 'mitigated';
export type AssessmentStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface RiskAssessment {
  id: string;
  ai_system_id: string;
  category: RiskCategory;
  summary: string;
  metrics: Record<string, any>;
  risk_level: RiskLevel;
  mitigation_status: MitigationStatus;
  status: AssessmentStatus;
  assessed_by: string | null;
  assessed_at: string;
  evidence_links: string[];
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRiskAssessmentInput {
  ai_system_id: string;
  category: RiskCategory;
  summary: string;
  metrics?: Record<string, any>;
  risk_level: RiskLevel;
  mitigation_status?: MitigationStatus;
  evidence_links?: string[];
}

export interface OverallRiskLevel {
  level: RiskLevel;
  highest_category: RiskCategory | null;
  assessment_count: number;
  mitigated_count: number;
}
