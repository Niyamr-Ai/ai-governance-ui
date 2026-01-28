import { RiskAssessment, OverallRiskLevel } from "@/types/risk-assessment";

export function calculateOverallRiskLevel(
  assessments: RiskAssessment[]
): OverallRiskLevel {
  // Filter to only approved assessments (governance rule)
  const approvedAssessments = assessments.filter(
    (a) => a.status === "approved"
  );

  if (approvedAssessments.length === 0) {
    return {
      level: "low",
      highest_category: null,
      assessment_count: 0,
      mitigated_count: 0,
    };
  }

  // Risk level priority: high > medium > low
  const riskOrder: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
  };

  // Find the highest risk assessment among approved ones
  const highestRiskAssessment = approvedAssessments.reduce((max, assessment) => {
    return riskOrder[assessment.risk_level] > riskOrder[max.risk_level]
      ? assessment
      : max;
  });

  // Count mitigated assessments
  const mitigatedCount = approvedAssessments.filter(
    (a) => a.mitigation_status === "mitigated"
  ).length;

  return {
    level: highestRiskAssessment.risk_level,
    highest_category: highestRiskAssessment.category || null,
    assessment_count: approvedAssessments.length,
    mitigated_count: mitigatedCount,
  };
}
