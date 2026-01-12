import { DiscoveredAIAsset } from "./discovery";
export type { DiscoveredAIAsset };

export type DiscoveryPrioritization = "immediate" | "high" | "medium" | "low";

export interface ShadowAIAssessment {
    shadow_probability: number;
    risk_level: "low" | "medium" | "high" | "critical";
    confidence_score: number;
    classification: {
        system_type: string;
        use_case: string;
        data_sensitivity: string;
        user_facing: boolean;
    };
    regulatory_concerns: string[];
    compliance_gaps: Array<{
        regulation: string;
        severity: "low" | "medium" | "high";
        missing_requirements: string[];
    }>;
    recommended_actions: Array<{
        priority: DiscoveryPrioritization;
        action: string;
        rationale: string;
    }>;
}

export interface SystemLinkSuggestion {
    system_name: string;
    similarity_score: number;
    confidence: "low" | "medium" | "high";
    rationale: string;
    matching_factors: string[];
}
