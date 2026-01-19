import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useFormikContext } from "formik";

type EvidenceContent = Record<string, string>;


type Props = {
  masCurrentPage: number;
  handleEvidenceFileChange: (key: string, file: File | null) => void;
  evidenceContent: EvidenceContent;
};


export default function MasPage7OperationalPillars({
  masCurrentPage,
  handleEvidenceFileChange,
  evidenceContent,
}: Props) {
  const { values, setFieldValue } = useFormikContext<any>();
  if (masCurrentPage !== 6) return null;

  return (
    <>
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-foreground">Operational Pillars</CardTitle>
          <CardDescription className="text-muted-foreground">
            Third-Party & Vendor Management, Algorithm & Feature Selection, and
            Evaluation & Testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Third-Party & Vendor Management with Sub-questions */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-medium text-foreground">
                  Third-Party & Vendor Management
                </Label>
                <p className="text-sm text-muted-foreground">
                  Do you have vendor due diligence and controls in place for
                  third-party AI services?
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${values.third_party_controls
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                >
                  {values.third_party_controls ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.third_party_controls}
                  onClick={() =>
                    setFieldValue(
                      "third_party_controls",
                      !values.third_party_controls
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.third_party_controls
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                  style={{
                    backgroundColor: values.third_party_controls
                      ? "#10b981"
                      : "#9ca3af",
                  }}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.third_party_controls
                      ? "translate-x-5"
                      : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>
            {values.third_party_controls && (
              <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    What vendor due diligence have you performed? *
                  </Label>
                  <Textarea
                    value={values.third_party_due_diligence || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "third_party_due_diligence",
                        e.target.value
                      )
                    }
                    placeholder="Describe: Security assessments, compliance checks (SOC 2, ISO 27001), data privacy reviews, vendor risk assessments, contract reviews, etc."
                    className="min-h-[100px] rounded-xl"
                    required={values.third_party_controls}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    What controls are in place in vendor contracts? *
                  </Label>
                  <Textarea
                    value={values.third_party_contracts || ""}
                    onChange={(e) =>
                      setFieldValue("third_party_contracts", e.target.value)
                    }
                    placeholder="Describe: Data protection clauses, security requirements, audit rights, breach notification, data retention policies, compliance obligations, etc."
                    className="min-h-[100px] rounded-xl"
                    required={values.third_party_controls}
                  />
                </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">
                    Evidence: Upload vendor due diligence reports or contracts
                    </Label>

                    <div className="relative flex items-center gap-3">
                      {/* Hidden File Input */}
                      <Input
                        id="third_party_controls_evidence"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={(e) =>
                          handleEvidenceFileChange(
                            "third_party_controls_evidence",
                            e.target.files?.[0] || null
                          )
                        }
                      />

                      {/* Custom Upload Button */}
                      <label
                        htmlFor="third_party_controls_evidence"
                        className="
        inline-flex cursor-pointer items-center gap-2 rounded-xl
        border border-border bg-background px-4 py-2 text-sm
        text-foreground shadow-sm transition
        hover:bg-accent hover:text-accent-foreground
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2
      "
                      >
                        📎 Upload file
                      </label>

                      {/* File Status */}
                      {evidenceContent.third_party_controls_evidence ? (
                        <span className="text-xs text-emerald-400">
                          ✓ File processed ({evidenceContent.third_party_controls_evidence.length} chars)
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          PDF, DOC, DOCX, TXT
                        </span>
                      )}
                    </div>
                  </div>

                </div>
            )}
          </div>

          {/* NEW: Vendor Risk Assessment */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Vendor Risk Assessment
              </Label>
              <p className="text-sm text-muted-foreground">
                How do you assess and monitor vendor risks?
              </p>
              <Textarea
                value={values.third_party_vendor_risk_assessment || ""}
                onChange={(e) =>
                  setFieldValue(
                    "third_party_vendor_risk_assessment",
                    e.target.value
                  )
                }
                placeholder="Describe: Risk assessment methodology, risk categories evaluated, assessment frequency, risk scoring, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: SLAs */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Service Level Agreements (SLAs)
              </Label>
              <p className="text-sm text-muted-foreground">
                What SLAs do you have with third-party AI vendors?
              </p>
              <Textarea
                value={values.third_party_slas || ""}
                onChange={(e) =>
                  setFieldValue("third_party_slas", e.target.value)
                }
                placeholder="Describe: Uptime guarantees, response times, performance metrics, penalties, monitoring, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Vendor Monitoring */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Vendor Monitoring
              </Label>
              <p className="text-sm text-muted-foreground">
                How do you continuously monitor vendor performance and
                compliance?
              </p>
              <Textarea
                value={values.third_party_vendor_monitoring || ""}
                onChange={(e) =>
                  setFieldValue(
                    "third_party_vendor_monitoring",
                    e.target.value
                  )
                }
                placeholder="Describe: Monitoring tools, metrics tracked, review frequency, compliance checks, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Exit Strategy */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Exit Strategy
              </Label>
              <p className="text-sm text-muted-foreground">
                Do you have an exit strategy if a vendor relationship ends?
              </p>
              <Textarea
                value={values.third_party_exit_strategy || ""}
                onChange={(e) =>
                  setFieldValue("third_party_exit_strategy", e.target.value)
                }
                placeholder="Describe: Data migration plans, transition procedures, service continuity, contract termination clauses, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Data Residency */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Data Residency
              </Label>
              <p className="text-sm text-muted-foreground">
                Where is your data stored by third-party vendors?
              </p>
              <Textarea
                value={values.third_party_data_residency || ""}
                onChange={(e) =>
                  setFieldValue("third_party_data_residency", e.target.value)
                }
                placeholder="Describe: Data storage locations, data residency requirements, cross-border restrictions, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Incident Reporting */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Incident Reporting
              </Label>
              <p className="text-sm text-muted-foreground">
                What are the incident reporting requirements for vendors?
              </p>
              <Textarea
                value={values.third_party_incident_reporting || ""}
                onChange={(e) =>
                  setFieldValue(
                    "third_party_incident_reporting",
                    e.target.value
                  )
                }
                placeholder="Describe: Notification timelines, incident types, reporting format, escalation procedures, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Audit Rights */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Audit Rights
              </Label>
              <p className="text-sm text-muted-foreground">
                Do you have audit rights over vendor operations?
              </p>
              <Textarea
                value={values.third_party_audit_rights || ""}
                onChange={(e) =>
                  setFieldValue("third_party_audit_rights", e.target.value)
                }
                placeholder="Describe: Audit frequency, scope, access rights, vendor cooperation requirements, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Multi-Vendor Management */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Multi-Vendor Management
              </Label>
              <p className="text-sm text-muted-foreground">
                How do you manage multiple vendors providing similar services?
              </p>
              <Textarea
                value={values.third_party_multi_vendor || ""}
                onChange={(e) =>
                  setFieldValue("third_party_multi_vendor", e.target.value)
                }
                placeholder="Describe: Vendor diversification strategy, redundancy, comparison processes, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* Algorithm & Feature Selection with Sub-questions */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-medium text-foreground">
                  Algorithm & Feature Selection
                </Label>
                <p className="text-sm text-muted-foreground">
                  Have you documented your algorithm selection and feature
                  engineering process?
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${values.algo_documented
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                >
                  {values.algo_documented ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.algo_documented}
                  onClick={() =>
                    setFieldValue(
                      "algo_documented",
                      !values.algo_documented
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.algo_documented
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                  style={{
                    backgroundColor: values.algo_documented
                      ? "#10b981"
                      : "#9ca3af",
                  }}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.algo_documented
                      ? "translate-x-5"
                      : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>
            {values.algo_documented && (
              <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    How did you select this algorithm? What was the selection
                    process? *
                  </Label>
                  <Textarea
                    value={values.algo_selection_process || ""}
                    onChange={(e) =>
                      setFieldValue("algo_selection_process", e.target.value)
                    }
                    placeholder="Describe: Algorithm comparison process, evaluation criteria, why this algorithm was chosen over alternatives, performance benchmarks, etc."
                    className="min-h-[100px] rounded-xl"
                    required={values.algo_documented}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    How did you engineer and select features? *
                  </Label>
                  <Textarea
                    value={values.algo_feature_engineering || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "algo_feature_engineering",
                        e.target.value
                      )
                    }
                    placeholder="Describe: Feature selection methods, feature importance analysis, feature engineering techniques, why certain features were included/excluded, etc."
                    className="min-h-[100px] rounded-xl"
                    required={values.algo_documented}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Evidence: Upload algorithm selection documentation or
                    feature engineering notes
                  </Label>

                  <div className="relative flex items-center gap-3">
                    {/* Hidden File Input */}
                    <Input
                      id="algo_documentation_evidence"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) =>
                        handleEvidenceFileChange(
                          "algo_documentation_evidence",
                          e.target.files?.[0] || null
                        )
                      }
                    />

                    {/* Custom Upload Button */}
                    <label
                      htmlFor="algo_documentation_evidence"
                      className="
        inline-flex cursor-pointer items-center gap-2 rounded-xl
        border border-border bg-background px-4 py-2 text-sm
        text-foreground shadow-sm transition
        hover:bg-accent hover:text-accent-foreground
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2
      "
                    >
                      📎 Upload file
                    </label>

                    {/* File Status */}
                    {evidenceContent.algo_documentation_evidence ? (
                      <span className="text-xs text-emerald-400">
                        ✓ File processed ({evidenceContent.algo_documentation_evidence.length} chars)
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, TXT
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* NEW: Algorithm Selection Criteria */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Algorithm Selection Criteria
              </Label>
              <p className="text-sm text-muted-foreground">
                What criteria do you use to select algorithms?
              </p>
              <Textarea
                value={values.algo_selection_criteria || ""}
                onChange={(e) =>
                  setFieldValue("algo_selection_criteria", e.target.value)
                }
                placeholder="Describe: Performance metrics, interpretability requirements, computational efficiency, regulatory compliance, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Model Comparison */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Model Comparison
              </Label>
              <p className="text-sm text-muted-foreground">
                How do you compare different model options?
              </p>
              <Textarea
                value={values.algo_model_comparison || ""}
                onChange={(e) =>
                  setFieldValue("algo_model_comparison", e.target.value)
                }
                placeholder="Describe: Comparison methodology, metrics used, A/B testing, cross-validation, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Feature Importance */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Feature Importance Analysis
              </Label>
              <p className="text-sm text-muted-foreground">
                How do you analyze feature importance?
              </p>
              <Textarea
                value={values.algo_feature_importance || ""}
                onChange={(e) =>
                  setFieldValue("algo_feature_importance", e.target.value)
                }
                placeholder="Describe: Methods used (SHAP, permutation importance, etc.), how importance is measured, documentation, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Feature Drift */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Feature Drift Detection
              </Label>
              <p className="text-sm text-muted-foreground">
                How do you detect and handle feature drift?
              </p>
              <Textarea
                value={values.algo_feature_drift || ""}
                onChange={(e) =>
                  setFieldValue("algo_feature_drift", e.target.value)
                }
                placeholder="Describe: Drift detection methods, monitoring frequency, alert thresholds, mitigation strategies, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Model Versioning */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Model Versioning
              </Label>
              <p className="text-sm text-muted-foreground">
                How do you version and track model changes?
              </p>
              <Textarea
                value={values.algo_model_versioning || ""}
                onChange={(e) =>
                  setFieldValue("algo_model_versioning", e.target.value)
                }
                placeholder="Describe: Versioning system, change tracking, rollback procedures, documentation, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: A/B Testing */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-medium text-foreground">
                  A/B Testing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Do you conduct A/B testing for algorithm selection?
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${values.algo_ab_testing
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                >
                  {values.algo_ab_testing ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.algo_ab_testing}
                  onClick={() =>
                    setFieldValue(
                      "algo_ab_testing",
                      !values.algo_ab_testing
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.algo_ab_testing
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                  style={{
                    backgroundColor: values.algo_ab_testing
                      ? "#10b981"
                      : "#9ca3af",
                  }}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.algo_ab_testing
                      ? "translate-x-5"
                      : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>
            {values.algo_ab_testing && (
              <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Describe your A/B testing methodology
                  </Label>
                  <Textarea
                    value={values.algo_ab_testing_details || ""}
                    onChange={(e) =>
                      setFieldValue("algo_ab_testing_details", e.target.value)
                    }
                    placeholder="Describe: Test design, sample sizes, success metrics, statistical significance, decision criteria, etc."
                    className="min-h-[100px] rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* NEW: Hyperparameter Tuning */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Hyperparameter Tuning
              </Label>
              <p className="text-sm text-muted-foreground">
                How do you tune hyperparameters?
              </p>
              <Textarea
                value={values.algo_hyperparameter_tuning || ""}
                onChange={(e) =>
                  setFieldValue("algo_hyperparameter_tuning", e.target.value)
                }
                placeholder="Describe: Tuning methods (grid search, random search, Bayesian optimization), validation approach, documentation, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* Evaluation & Testing with Sub-questions */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-medium text-foreground">
                  Evaluation & Testing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Have you completed pre-deployment testing and robustness
                  checks?
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${values.evaluation_testing
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                >
                  {values.evaluation_testing ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.evaluation_testing}
                  onClick={() =>
                    setFieldValue(
                      "evaluation_testing",
                      !values.evaluation_testing
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.evaluation_testing
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                  style={{
                    backgroundColor: values.evaluation_testing
                      ? "#10b981"
                      : "#9ca3af",
                  }}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.evaluation_testing
                      ? "translate-x-5"
                      : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>
            {values.evaluation_testing && (
              <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    What types of pre-deployment testing have you completed? *
                  </Label>
                  <Textarea
                    value={values.evaluation_test_types || ""}
                    onChange={(e) =>
                      setFieldValue("evaluation_test_types", e.target.value)
                    }
                    placeholder="e.g., Unit testing, integration testing, performance testing, accuracy testing, A/B testing, user acceptance testing, stress testing, etc."
                    className="min-h-[100px] rounded-xl"
                    required={values.evaluation_testing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    What robustness checks have you performed? *
                  </Label>
                  <Textarea
                    value={values.evaluation_robustness_checks || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "evaluation_robustness_checks",
                        e.target.value
                      )
                    }
                    placeholder="Describe: Adversarial testing, edge case testing, failure mode analysis, performance under stress, handling of unexpected inputs, error recovery, etc."
                    className="min-h-[100px] rounded-xl"
                    required={values.evaluation_testing}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Evidence: Upload testing reports or test results
                  </Label>

                  <div className="relative flex items-center gap-3">
                    {/* Hidden File Input */}
                    <Input
                      id="evaluation_evidence"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) =>
                        handleEvidenceFileChange(
                          "evaluation_evidence",
                          e.target.files?.[0] || null
                        )
                      }
                    />

                    {/* Custom Upload Button */}
                    <label
                      htmlFor="evaluation_evidence"
                      className="
        inline-flex cursor-pointer items-center gap-2 rounded-xl
        border border-border bg-background px-4 py-2 text-sm
        text-foreground shadow-sm transition
        hover:bg-accent hover:text-accent-foreground
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring focus-visible:ring-offset-2
      "
                    >
                      📎 Upload file
                    </label>

                    {/* File Status */}
                    {evidenceContent.evaluation_evidence ? (
                      <span className="text-xs text-emerald-400">
                        ✓ File processed ({evidenceContent.evaluation_evidence.length} chars)
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, TXT
                      </span>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* NEW: Test Data Management */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Test Data Management
              </Label>
              <p className="text-sm text-muted-foreground">
                How do you manage test data for evaluation?
              </p>
              <Textarea
                value={values.evaluation_test_data_management || ""}
                onChange={(e) =>
                  setFieldValue(
                    "evaluation_test_data_management",
                    e.target.value
                  )
                }
                placeholder="Describe: Test data sources, data splitting strategy, test data quality, privacy considerations, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Performance Benchmarks */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Performance Benchmarks
              </Label>
              <p className="text-sm text-muted-foreground">
                What performance benchmarks do you use?
              </p>
              <Textarea
                value={values.evaluation_performance_benchmarks || ""}
                onChange={(e) =>
                  setFieldValue(
                    "evaluation_performance_benchmarks",
                    e.target.value
                  )
                }
                placeholder="Describe: Benchmark datasets, baseline comparisons, industry standards, target metrics, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Regression Testing */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-medium text-foreground">
                  Regression Testing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Do you perform regression testing when models are updated?
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${values.evaluation_regression_testing
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                >
                  {values.evaluation_regression_testing ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.evaluation_regression_testing}
                  onClick={() =>
                    setFieldValue(
                      "evaluation_regression_testing",
                      !values.evaluation_regression_testing
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.evaluation_regression_testing
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                  style={{
                    backgroundColor: values.evaluation_regression_testing
                      ? "#10b981"
                      : "#9ca3af",
                  }}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.evaluation_regression_testing
                      ? "translate-x-5"
                      : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>
            {values.evaluation_regression_testing && (
              <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Describe your regression testing process
                  </Label>
                  <Textarea
                    value={values.evaluation_regression_details || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "evaluation_regression_details",
                        e.target.value
                      )
                    }
                    placeholder="Describe: Test suite, comparison methodology, pass/fail criteria, automation, etc."
                    className="min-h-[100px] rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* NEW: Stress Testing */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-medium text-foreground">
                  Stress Testing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Have you conducted stress testing under extreme conditions?
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${values.evaluation_stress_testing
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                >
                  {values.evaluation_stress_testing ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.evaluation_stress_testing}
                  onClick={() =>
                    setFieldValue(
                      "evaluation_stress_testing",
                      !values.evaluation_stress_testing
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.evaluation_stress_testing
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                  style={{
                    backgroundColor: values.evaluation_stress_testing
                      ? "#10b981"
                      : "#9ca3af",
                  }}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.evaluation_stress_testing
                      ? "translate-x-5"
                      : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>
            {values.evaluation_stress_testing && (
              <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Describe your stress testing methodology and results
                  </Label>
                  <Textarea
                    value={values.evaluation_stress_testing_details || ""}
                    onChange={(e) =>
                      setFieldValue(
                        "evaluation_stress_testing_details",
                        e.target.value
                      )
                    }
                    placeholder="Describe: Test scenarios, extreme conditions tested, system behavior, failure points, etc."
                    className="min-h-[100px] rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* NEW: Failsafe Mechanisms */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Failsafe Mechanisms
              </Label>
              <p className="text-sm text-muted-foreground">
                What failsafe mechanisms do you have in place?
              </p>
              <Textarea
                value={values.evaluation_failsafe_mechanisms || ""}
                onChange={(e) =>
                  setFieldValue(
                    "evaluation_failsafe_mechanisms",
                    e.target.value
                  )
                }
                placeholder="Describe: Automatic shutdown triggers, fallback systems, error handling, circuit breakers, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Rollback Procedures */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Rollback Procedures
              </Label>
              <p className="text-sm text-muted-foreground">
                What are your procedures for rolling back model deployments?
              </p>
              <Textarea
                value={values.evaluation_rollback_procedures || ""}
                onChange={(e) =>
                  setFieldValue(
                    "evaluation_rollback_procedures",
                    e.target.value
                  )
                }
                placeholder="Describe: Rollback triggers, process, time to rollback, data consistency, communication, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>

          {/* NEW: Test Documentation */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="space-y-2">
              <Label className="text-base font-medium text-foreground">
                Test Documentation
              </Label>
              <p className="text-sm text-muted-foreground">
                How do you document test results and evaluation findings?
              </p>
              <Textarea
                value={values.evaluation_test_documentation || ""}
                onChange={(e) =>
                  setFieldValue(
                    "evaluation_test_documentation",
                    e.target.value
                  )
                }
                placeholder="Describe: Documentation format, what is recorded, retention, review process, etc."
                className="min-h-[100px] rounded-xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
