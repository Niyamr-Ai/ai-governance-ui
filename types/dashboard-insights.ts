export type ComplianceStatus = 'compliant' | 'partially_compliant' | 'non_compliant' | 'unknown';
export type RiskTier = 'prohibited' | 'high_risk' | 'limited_risk' | 'minimal_risk' | 'unknown';

/**
 * Insight types for different dashboard contexts
 */
export interface ComplianceInsight {
  type: 'obligation' | 'recommendation' | 'warning' | 'next_step';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  regulatoryContext?: string;
  actionable: boolean;
  relatedArticles?: string[];
}

/**
 * Dashboard summary with insights
 */
export interface DashboardInsights {
  overallGuidance: string;
  keyInsights: ComplianceInsight[];
  riskTierGuidance: Record<string, string>;
  complianceStatusGuidance: Record<string, string>;
  nextSteps: string[];
  regulatoryUpdates?: string;
}

/**
 * System-specific insights
 */
export interface SystemInsights {
  systemId: string;
  systemName: string;
  riskTier: RiskTier;
  complianceStatus: ComplianceStatus;
  insights: ComplianceInsight[];
  recommendedActions: string[];
  regulatoryContext: string;
}