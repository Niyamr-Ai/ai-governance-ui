// Shared types for frontend components
// These are duplicated from backend to avoid cross-compilation issues

export type DetectedVendor = 'OpenAI' | 'Anthropic' | 'AWS' | 'Azure' | 'Custom' | 'Unknown';
export type ConfidenceScore = 'low' | 'medium' | 'high';
export type Environment = 'dev' | 'test' | 'prod' | 'unknown';

export interface DiscoveredAIAsset {
  id: string;
  source_type: string;
  detected_name: string;
  detected_description?: string | null;
  detected_vendor?: DetectedVendor | null;
  detected_endpoint_or_repo?: string | null;
  confidence_score: ConfidenceScore;
  environment?: Environment | null;
  linked_system_id?: string | null;
  shadow_status: string;
  created_by?: string | null;
  metadata?: Record<string, any> | null;
  discovered_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface ShadowAIAssessment {
  asset_id: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  shadow_probability: number; // 0-100
  regulatory_concerns: string[];
  classification: {
    system_type: string;
    use_case: string;
    data_sensitivity: 'low' | 'medium' | 'high';
    user_facing: boolean;
  };
  compliance_gaps: {
    regulation: 'EU' | 'UK' | 'MAS';
    missing_requirements: string[];
    severity: 'low' | 'medium' | 'high';
  }[];
  recommended_actions: {
    priority: 'immediate' | 'high' | 'medium' | 'low';
    action: string;
    rationale: string;
  }[];
  confidence_score: number; // 0-100
}

export interface SystemLinkSuggestion {
  existing_system_id: string;
  system_name: string;
  similarity_score: number; // 0-100
  matching_factors: string[];
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
}

export interface DiscoveryPrioritization {
  asset_id: string;
  priority_score: number; // 0-100
  priority_level: 'critical' | 'high' | 'medium' | 'low';
  risk_factors: string[];
  business_impact: string;
}

export type EnforcementLevel = 'Mandatory' | 'Advisory';
export type AppliesTo = 'All AI' | 'High-risk only' | 'Specific systems';

export interface CreateInternalPolicyInput {
  name: string;
  description?: string;
  summary?: string;
  applies_to?: AppliesTo;
  enforcement_level?: EnforcementLevel;
  owner?: string;
  effective_date?: string;
  version?: string;
  document_url?: string;
}