import { LifecycleStage } from "@/types/lifecycle";

export function canCreateRiskAssessment(stage: LifecycleStage) {
  return stage !== "Retired";
}

interface LifecycleWarning {
  type: 'error' | 'warning' | 'info';
  message: string;
  action?: string;
}

export function getLifecycleWarnings(
  stage: LifecycleStage,
  hasApproved: boolean
): LifecycleWarning[] {
  if (stage === "Deployed" && !hasApproved) {
    return [{
      type: 'error',
      message: "At least one approved risk assessment is required before deployment",
      action: "Add Risk Assessment"
    }];
  }
  return [];
}

export function getLifecycleConstraints(stage: LifecycleStage): string[] {
  switch (stage) {
    case "Planning":
      return [
        "Define system purpose and intended use cases",
        "Identify key stakeholders and responsibilities",
        "Conduct initial risk assessment scoping",
        "Establish governance framework and oversight"
      ];
    case "Development":
      return [
        "Implement security-by-design principles",
        "Conduct regular code reviews and testing",
        "Document system architecture and data flows",
        "Maintain audit trail of development decisions"
      ];
    case "Testing":
      return [
        "Perform comprehensive risk assessments",
        "Conduct security testing and vulnerability scans",
        "Validate compliance with regulatory requirements",
        "Document test results and mitigation measures"
      ];
    case "Deployed":
      return [
        "Maintain approved risk assessments",
        "Implement continuous monitoring and alerting",
        "Conduct regular security audits and reviews",
        "Ensure incident response procedures are in place",
        "Maintain compliance documentation and evidence"
      ];
    case "Retired":
      return [
        "Archive system data securely",
        "Document decommissioning procedures",
        "Notify stakeholders of system retirement",
        "Maintain records for regulatory compliance periods"
      ];
    default:
      return [];
  }
}
