export type AttackType = 'prompt_injection' | 'jailbreak' | 'data_leakage' | 'policy_bypass' | 'adversarial_input' | 'model_inversion';

export interface AttackPrompt {
  id: string;
  type: AttackType;
  name: string;
  description: string;
  prompt: string;
  expected_behavior?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface TargetedAttackPrompt extends AttackPrompt {
  systemContext?: string;
  targetedPrompt: string;
  vulnerabilityFocus: string[];
  riskFactors: string[];
  customization: 'high' | 'medium' | 'low';
}

export interface TestGenerationStrategy {
  systemId: string;
  systemName: string;
  systemType: string;
  riskProfile: string[];
  vulnerabilities: string[];
  attackTypes: AttackType[];
  testCount: number;
}

export interface TargetedTestSuite {
  systemId: string;
  systemName: string;
  strategy: TestGenerationStrategy;
  attacks: TargetedAttackPrompt[];
  recommendations: string[];
  riskAssessment: string;
}