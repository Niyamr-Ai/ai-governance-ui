import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ToggleSection from "@/pages/assessment/shared/toggleSection";
import EvidenceUpload from "@/pages/assessment/shared/evidenceUpload";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useFormikContext } from "formik";

type EvidenceContent = Record<string, string>;


type Props = {
  masCurrentPage: number;
  handleEvidenceFileChange: (key: string, file: File | null) => void;
};

export default function SecurityMonitoring({
  masCurrentPage,
  handleEvidenceFileChange,
}: Props) {
  // Handle SSR - Formik context not available during static generation
  let formikContext;
  try {
    formikContext = useFormikContext<any>();
  } catch (error) {
    return null;
  }
  
  if (!formikContext) return null;
  
  const { values, setFieldValue, errors, touched } = formikContext;
  return (
    <>
      {masCurrentPage === 7 && (
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-foreground">
              Security, Monitoring & Capability
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Technology & Cybersecurity, Monitoring & Change Management, and
              Capability & Capacity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Technology & Cybersecurity with Sub-questions */}
            <ToggleSection
              label="Technology & Cybersecurity"
              description="Do you have security measures to protect against misuse, prompt injection, or data leakage?"
              value={values.security_measures}
              onChange={() =>
                setFieldValue(
                  "security_measures",
                  !values.security_measures
                )
              }
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    What cybersecurity measures do you have in place? *
                  </Label>
                  <Textarea
                    value={values.security_cybersecurity_measures || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "security_cybersecurity_measures",
                        e.target.value
                      )
                    }
                    placeholder="e.g., Encryption, access controls, authentication, network security, API security..."
                    className={`min-h-[100px] rounded-xl ${errors.security_cybersecurity_measures && touched.security_cybersecurity_measures
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                      }`}
                  />
                  {touched.security_cybersecurity_measures &&
                    typeof errors.security_cybersecurity_measures === "string" && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.security_cybersecurity_measures}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    How do you protect against prompt injection attacks? *
                  </Label>
                  <Textarea
                    value={values.security_prompt_injection || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "security_prompt_injection",
                        e.target.value
                      )
                    }
                    className={`min-h-[100px] rounded-xl ${errors.security_prompt_injection && touched.security_prompt_injection
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                      }`}
                  />
                  {touched.security_prompt_injection &&
                    typeof errors.security_prompt_injection === "string" && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.security_prompt_injection}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    How do you prevent data leakage? *
                  </Label>
                  <Textarea
                    value={values.security_data_leakage || ""}
                    onChange={(e) =>
                      setFieldValue("security_data_leakage", e.target.value)
                    }
                    className={`min-h-[100px] rounded-xl ${errors.security_data_leakage && touched.security_data_leakage
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                      }`}
                  />
                  {touched.security_data_leakage &&
                    typeof errors.security_data_leakage === "string" && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.security_data_leakage}
                      </p>
                    )}
                </div>

                <EvidenceUpload
                  label="Upload security documentation or security assessment reports"
                  accept=".pdf,.doc,.docx"
                  onFileSelect={(file) =>
                    handleEvidenceFileChange("security_evidence", file)
                  }
                />
              </div>
            </ToggleSection>
            {/* NEW: Access Controls */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Access Controls
                </Label>
                <p className="text-sm text-muted-foreground">
                  What access controls do you have for AI systems?
                </p>
                <Textarea
                  value={values.security_access_controls || ""}
                  onChange={(e) =>
                    setFieldValue("security_access_controls", e.target.value)
                  }
                  placeholder="Describe: Role-based access control, authentication methods, authorization levels, access reviews, etc."
                  className={`min-h-[100px] rounded-xl ${errors.security_access_controls && touched.security_access_controls
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.security_access_controls &&
                  typeof errors.security_access_controls === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.security_access_controls}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Encryption */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Encryption
                </Label>
                <p className="text-sm text-muted-foreground">
                  How is data encrypted at rest and in transit?
                </p>
                <Textarea
                  value={values.security_encryption || ""}
                  onChange={(e) =>
                    setFieldValue("security_encryption", e.target.value)
                  }
                  placeholder="Describe: Encryption standards, key management, TLS/SSL, encryption algorithms, key rotation, etc."
                  className={`min-h-[100px] rounded-xl ${errors.security_encryption && touched.security_encryption
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.security_encryption &&
                  typeof errors.security_encryption === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.security_encryption}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Authentication */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Authentication
                </Label>
                <p className="text-sm text-muted-foreground">
                  What authentication mechanisms do you use?
                </p>
                <Textarea
                  value={values.security_authentication || ""}
                  onChange={(e) =>
                    setFieldValue("security_authentication", e.target.value)
                  }
                  placeholder="Describe: Multi-factor authentication, SSO, API keys, OAuth, biometrics, etc."
                  className={`min-h-[100px] rounded-xl ${errors.security_authentication && touched.security_authentication
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.security_authentication &&
                  typeof errors.security_authentication === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.security_authentication}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Network Security */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Network Security
                </Label>
                <p className="text-sm text-muted-foreground">
                  What network security measures are in place?
                </p>
                <Textarea
                  value={values.security_network_security || ""}
                  onChange={(e) =>
                    setFieldValue("security_network_security", e.target.value)
                  }
                  placeholder="Describe: Firewalls, VPNs, network segmentation, DDoS protection, intrusion detection, etc."
                  className={`min-h-[100px] rounded-xl ${errors.security_network_security && touched.security_network_security
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.security_network_security &&
                  typeof errors.security_network_security === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.security_network_security}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Vulnerability Scanning */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Vulnerability Scanning
                </Label>
                <p className="text-sm text-muted-foreground">
                  How often do you scan for vulnerabilities?
                </p>
                <Textarea
                  value={values.security_vulnerability_scanning || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "security_vulnerability_scanning",
                      e.target.value
                    )
                  }
                  placeholder="Describe: Scanning frequency, tools used, vulnerability management process, remediation timelines, etc."
                  className={`min-h-[100px] rounded-xl ${errors.security_vulnerability_scanning && touched.security_vulnerability_scanning
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.security_vulnerability_scanning &&
                  typeof errors.security_vulnerability_scanning === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.security_vulnerability_scanning}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Penetration Testing */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-base font-medium text-foreground">
                    Penetration Testing
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Do you conduct penetration testing?
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${values.security_penetration_testing
                        ? "text-blue-500 bg-emerald-300"
                        : "text-red-500"
                      }`}
                  >
                    {values.security_penetration_testing ? "YES" : "NO"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={values.security_penetration_testing}
                    onClick={() =>
                      setFieldValue(
                        "security_penetration_testing",
                        !values.security_penetration_testing
                      )
                    }
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.security_penetration_testing
                        ? "text-blue-500 bg-emerald-300"
                        : "text-red-500"
                      }`}
                    style={{
                      backgroundColor: values.security_penetration_testing
                        ? "#10b981"
                        : "#9ca3af",
                    }}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.security_penetration_testing
                          ? "translate-x-5"
                          : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>
              {values.security_penetration_testing && (
                <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Describe your penetration testing process
                    </Label>
                    <Textarea
                      value={values.security_penetration_details || ""}
                      onChange={(e) =>
                        setFieldValue(
                          "security_penetration_details",
                          e.target.value
                        )
                      }
                      placeholder="Describe: Testing frequency, scope, testers (internal/external), findings, remediation, etc."
                      className={`min-h-[100px] rounded-xl ${errors.security_penetration_details && touched.security_penetration_details
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    />
                    {touched.security_penetration_details &&
                      typeof errors.security_penetration_details === "string" && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.security_penetration_details}
                        </p>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* NEW: Incident Response */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Security Incident Response
                </Label>
                <p className="text-sm text-muted-foreground">
                  What is your security incident response plan?
                </p>
                <Textarea
                  value={values.security_incident_response || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "security_incident_response",
                      e.target.value
                    )
                  }
                  placeholder="Describe: Incident detection, response team, containment procedures, notification requirements, recovery, lessons learned, etc."
                  className={`min-h-[100px] rounded-xl ${errors.security_incident_response && touched.security_incident_response
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.security_incident_response &&
                  typeof errors.security_incident_response === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.security_incident_response}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Security Certifications */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Security Certifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  What security certifications or standards do you comply with?
                </p>
                <Textarea
                  value={values.security_certifications || ""}
                  onChange={(e) =>
                    setFieldValue("security_certifications", e.target.value)
                  }
                  placeholder="e.g., ISO 27001, SOC 2, PCI DSS, NIST, GDPR compliance, etc."
                  className={`min-h-[100px] rounded-xl ${errors.security_certifications && touched.security_certifications
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.security_certifications &&
                  typeof errors.security_certifications === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.security_certifications}
                    </p>
                  )}
              </div>
            </div>

            {/* Monitoring & Change Management with Sub-questions */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-base font-medium text-foreground">
                    Monitoring & Change Management
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Do you have drift monitoring, incident management, and
                    version control processes?
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${values.monitoring_plan
                        ? "text-blue-500 bg-emerald-300"
                        : "text-red-500"
                      }`}
                  >
                    {values.monitoring_plan ? "YES" : "NO"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={values.monitoring_plan}
                    onClick={() =>
                      setFieldValue(
                        "monitoring_plan",
                        !values.monitoring_plan
                      )
                    }
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.monitoring_plan
                        ? "text-blue-500 bg-emerald-300"
                        : "text-red-500"
                      }`}
                    style={{
                      backgroundColor: values.monitoring_plan
                        ? "#10b981"
                        : "#9ca3af",
                    }}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.monitoring_plan
                          ? "translate-x-5"
                          : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>
              {values.monitoring_plan && (
                <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      How do you monitor for model drift or performance
                      degradation? *
                    </Label>
                    <Textarea
                      value={values.monitoring_drift_detection || ""}
                      onChange={(e) =>
                        setFieldValue(
                          "monitoring_drift_detection",
                          e.target.value
                        )
                      }
                      placeholder="Describe: Drift detection methods, monitoring metrics, alerting thresholds, how often you check for drift, tools used, etc."
                      className={`min-h-[100px] rounded-xl ${errors.monitoring_drift_detection && touched.monitoring_drift_detection
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    />
                    {touched.monitoring_drift_detection &&
                      typeof errors.monitoring_drift_detection === "string" && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.monitoring_drift_detection}
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      What is your incident management process? *
                    </Label>
                    <Textarea
                      value={values.monitoring_incident_management || ""}
                      onChange={(e) =>
                        setFieldValue(
                          "monitoring_incident_management",
                          e.target.value
                        )
                      }
                      placeholder="Describe: Incident detection, reporting procedures, escalation process, response team, incident resolution, post-incident review, etc."
                      className={`min-h-[100px] rounded-xl ${errors.monitoring_incident_management && touched.monitoring_incident_management
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    />
                    {touched.monitoring_incident_management &&
                      typeof errors.monitoring_incident_management === "string" && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.monitoring_incident_management}
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      How do you manage version control and model updates? *
                    </Label>
                    <Textarea
                      value={values.monitoring_version_control || ""}
                      onChange={(e) =>
                        setFieldValue(
                          "monitoring_version_control",
                          e.target.value
                        )
                      }
                      placeholder="Describe: Version control system, model versioning strategy, change approval process, rollback procedures, testing before deployment, etc."
                      className={`min-h-[100px] rounded-xl ${errors.monitoring_version_control && touched.monitoring_version_control
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    />
                    {touched.monitoring_version_control &&
                      typeof errors.monitoring_version_control === "string" && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.monitoring_version_control}
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Evidence: Upload monitoring plans or incident management
                      procedures
                    </Label>
                    <EvidenceUpload
                  label="Upload security documentation or security assessment reports"
                  accept=".pdf,.doc,.docx"
                  onFileSelect={(file) =>
                    handleEvidenceFileChange("security_evidence", file)
                  }
                />
                  </div>
                </div>
              )}
            </div>

            {/* NEW: Performance Metrics */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Performance Metrics
                </Label>
                <p className="text-sm text-muted-foreground">
                  What performance metrics do you monitor?
                </p>
                <Textarea
                  value={values.monitoring_performance_metrics || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "monitoring_performance_metrics",
                      e.target.value
                    )
                  }
                  placeholder="Describe: Accuracy, latency, throughput, error rates, resource usage, business metrics, etc."
                  className={`min-h-[100px] rounded-xl ${errors.monitoring_performance_metrics && touched.monitoring_performance_metrics
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.monitoring_performance_metrics &&
                  typeof errors.monitoring_performance_metrics === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.monitoring_performance_metrics}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Alert Thresholds */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Alert Thresholds
                </Label>
                <p className="text-sm text-muted-foreground">
                  What alert thresholds do you have configured?
                </p>
                <Textarea
                  value={values.monitoring_alert_thresholds || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "monitoring_alert_thresholds",
                      e.target.value
                    )
                  }
                  placeholder="Describe: Threshold values, alert conditions, escalation levels, notification channels, etc."
                  className={`min-h-[100px] rounded-xl ${errors.monitoring_alert_thresholds && touched.monitoring_alert_thresholds
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.monitoring_alert_thresholds &&
                  typeof errors.monitoring_alert_thresholds === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.monitoring_alert_thresholds}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Monitoring Tools */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Monitoring Tools
                </Label>
                <p className="text-sm text-muted-foreground">
                  What tools do you use for monitoring?
                </p>
                <Textarea
                  value={values.monitoring_tools || ""}
                  onChange={(e) =>
                    setFieldValue("monitoring_tools", e.target.value)
                  }
                  placeholder="e.g., Prometheus, Grafana, DataDog, custom dashboards, logging systems, APM tools, etc."
                  className={`min-h-[100px] rounded-xl ${errors.monitoring_tools && touched.monitoring_tools
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.monitoring_tools &&
                  typeof errors.monitoring_tools === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.monitoring_tools}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Change Approval */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Change Approval Process
                </Label>
                <p className="text-sm text-muted-foreground">
                  What is your change approval process?
                </p>
                <Textarea
                  value={values.monitoring_change_approval || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "monitoring_change_approval",
                      e.target.value
                    )
                  }
                  placeholder="Describe: Who approves changes, approval criteria, review process, documentation requirements, etc."
                  className={`min-h-[100px] rounded-xl ${errors.monitoring_change_approval && touched.monitoring_change_approval
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.monitoring_change_approval &&
                  typeof errors.monitoring_change_approval === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.monitoring_change_approval}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Rollback Capability */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Rollback Capability
                </Label>
                <p className="text-sm text-muted-foreground">
                  How quickly can you rollback changes?
                </p>
                <Textarea
                  value={values.monitoring_rollback_capability || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "monitoring_rollback_capability",
                      e.target.value
                    )
                  }
                  placeholder="Describe: Rollback time, automation level, data consistency, testing, etc."
                  className={`min-h-[100px] rounded-xl ${errors.monitoring_rollback_capability && touched.monitoring_rollback_capability
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.monitoring_rollback_capability &&
                  typeof errors.monitoring_rollback_capability === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.monitoring_rollback_capability}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Change Impact Assessment */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Change Impact Assessment
                </Label>
                <p className="text-sm text-muted-foreground">
                  How do you assess the impact of changes?
                </p>
                <Textarea
                  value={values.monitoring_change_impact || ""}
                  onChange={(e) =>
                    setFieldValue("monitoring_change_impact", e.target.value)
                  }
                  placeholder="Describe: Impact analysis methodology, risk assessment, stakeholder review, etc."
                  className={`min-h-[100px] rounded-xl ${errors.monitoring_change_impact && touched.monitoring_change_impact
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.monitoring_change_impact &&
                  typeof errors.monitoring_change_impact === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.monitoring_change_impact}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Post-Deployment Monitoring */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="space-y-2">
                <Label className="text-base font-medium text-foreground">
                  Post-Deployment Monitoring
                </Label>
                <p className="text-sm text-muted-foreground">
                  How do you monitor systems after deployment?
                </p>
                <Textarea
                  value={values.monitoring_post_deployment || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "monitoring_post_deployment",
                      e.target.value
                    )
                  }
                  placeholder="Describe: Monitoring period, metrics tracked, review frequency, success criteria, etc."
                  className={`min-h-[100px] rounded-xl ${errors.monitoring_post_deployment && touched.monitoring_post_deployment
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.monitoring_post_deployment &&
                  typeof errors.monitoring_post_deployment === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.monitoring_post_deployment}
                    </p>
                  )}
              </div>
            </div>

            {/* NEW: Kill Switch */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-base font-medium text-foreground">
                    Kill Switch
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Do you have a kill switch to immediately stop the AI system?
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${values.monitoring_kill_switch
                        ? "text-blue-500 bg-emerald-300"
                        : "text-red-500"
                      }`}
                  >
                    {values.monitoring_kill_switch ? "YES" : "NO"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={values.monitoring_kill_switch}
                    onClick={() =>
                      setFieldValue(
                        "monitoring_kill_switch",
                        !values.monitoring_kill_switch
                      )
                    }
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.monitoring_kill_switch
                        ? "text-blue-500 bg-emerald-300"
                        : "text-red-500"
                      }`}
                    style={{
                      backgroundColor: values.monitoring_kill_switch
                        ? "#10b981"
                        : "#9ca3af",
                    }}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.monitoring_kill_switch
                          ? "translate-x-5"
                          : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>
              {values.monitoring_kill_switch && (
                <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Describe your kill switch mechanism
                    </Label>
                    <Textarea
                      value={values.monitoring_kill_switch_details || ""}
                      onChange={(e) =>
                        setFieldValue(
                          "monitoring_kill_switch_details",
                          e.target.value
                        )
                      }
                      placeholder="Describe: How it works, who can activate it, activation time, fallback systems, etc."
                      className={`min-h-[100px] rounded-xl ${errors.monitoring_kill_switch_details && touched.monitoring_kill_switch_details
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    />
                    {touched.monitoring_kill_switch_details &&
                      typeof errors.monitoring_kill_switch_details === "string" && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.monitoring_kill_switch_details}
                        </p>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Capability & Capacity with Sub-questions */}
            <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-base font-medium text-foreground">
                    Capability & Capacity
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Does your team have the necessary skills, training, and
                    infrastructure to manage this AI system?
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${values.capability_training
                        ? "text-blue-500 bg-emerald-300"
                        : "text-red-500"
                      }`}
                  >
                    {values.capability_training ? "YES" : "NO"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={values.capability_training}
                    onClick={() =>
                      setFieldValue(
                        "capability_training",
                        !values.capability_training
                      )
                    }
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.capability_training
                        ? "text-blue-500 bg-emerald-300"
                        : "text-red-500"
                      }`}
                    style={{
                      backgroundColor: values.capability_training
                        ? "#10b981"
                        : "#9ca3af",
                    }}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.capability_training
                          ? "translate-x-5"
                          : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>
              {values.capability_training && (
                <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      What skills does your team have for managing AI systems? *
                    </Label>
                    <Textarea
                      value={values.capability_team_skills || ""}
                      onChange={(e) =>
                        setFieldValue(
                          "capability_team_skills",
                          e.target.value
                        )
                      }
                      placeholder="Describe: Team members' AI/ML expertise, data science skills, compliance knowledge, risk management experience, certifications, etc."
                      className={`min-h-[100px] rounded-xl ${errors.capability_team_skills && touched.capability_team_skills
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    />
                    {touched.capability_team_skills &&
                      typeof errors.capability_team_skills === "string" && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.capability_team_skills}
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      What training programs have team members completed? *
                    </Label>
                    <Textarea
                      value={values.capability_training_programs || ""}
                      onChange={(e) =>
                        setFieldValue(
                          "capability_training_programs",
                          e.target.value
                        )
                      }
                      placeholder="e.g., AI ethics training, MAS guidelines training, risk assessment workshops, model monitoring courses, compliance certifications, etc."
                      className={`min-h-[100px] rounded-xl ${errors.capability_training_programs && touched.capability_training_programs
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    />
                    {touched.capability_training_programs &&
                      typeof errors.capability_training_programs === "string" && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.capability_training_programs}
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      What infrastructure and tools do you have for AI
                      governance? *
                    </Label>
                    <Textarea
                      value={values.capability_infrastructure || ""}
                      onChange={(e) =>
                        setFieldValue(
                          "capability_infrastructure",
                          e.target.value
                        )
                      }
                      placeholder="Describe: Monitoring tools, model versioning systems, data quality tools, compliance management platforms, risk assessment tools, etc."
                      className={`min-h-[100px] rounded-xl ${errors.capability_infrastructure && touched.capability_infrastructure
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                        }`}
                    />
                    {touched.capability_infrastructure &&
                      typeof errors.capability_infrastructure === "string" && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.capability_infrastructure}
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                      Evidence: Upload training certificates or infrastructure
                      documentation
                    </Label>
                    <EvidenceUpload
                  label=""
                  accept=".pdf,.doc,.docx"
                  onFileSelect={(file) =>
                    handleEvidenceFileChange("capability_evidence", file)
                  }
                />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
