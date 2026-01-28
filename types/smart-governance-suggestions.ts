import type { GovernanceRegulation } from './governance-task';

export interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'compliance' | 'risk_management' | 'documentation' | 'governance' | 'monitoring';
  regulation: GovernanceRegulation;
  actionable_steps: string[];
  rationale: string;
  estimated_effort: 'low' | 'medium' | 'high';
  dependencies?: string[];
  resources?: string[];
}

export interface TaskSuggestionContext {
  systemId: string;
  systemName: string;
  systemDescription: string;
  riskLevel: string;
  complianceStatus: string;
  lifecycleStage: string;
  regulation: GovernanceRegulation;
  existingTasks: string[];
  completedTasks: string[];
}