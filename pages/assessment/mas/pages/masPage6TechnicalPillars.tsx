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


export default function MasPage6TechnicalPillars({
  masCurrentPage,
  handleEvidenceFileChange,
  evidenceContent,
}: Props) {
  const { values, setFieldValue } = useFormikContext<any>();
  if (masCurrentPage !== 5) return null;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-foreground">Technical Pillars</CardTitle>
        <CardDescription className="text-muted-foreground">
          Transparency & Explainability, Fairness & Bias Testing, and Human Oversight
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Transparency & Explainability with Sub-questions */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Transparency & Explainability</Label>
              <p className="text-sm text-muted-foreground">Do you have documentation explaining how the system works to users or stakeholders?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.transparency_docs
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.transparency_docs ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.transparency_docs}
                onClick={() => setFieldValue("transparency_docs", !values.transparency_docs)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.transparency_docs ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.transparency_docs ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.transparency_docs ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.transparency_docs && (
            <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">What types of transparency documentation do you have? *</Label>
                <Textarea
                  value={values.transparency_doc_types || ""}
                  onChange={(e) => setFieldValue("transparency_doc_types", e.target.value)}
                  placeholder="e.g., User guides, system explanation documents, model cards, API documentation, decision explanation reports, etc."
                  className="min-h-[80px] rounded-xl"
                  required={values.transparency_docs}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">How do you explain system decisions to users or stakeholders? *</Label>
                <Textarea
                  value={values.transparency_user_explanations || ""}
                  onChange={(e) => setFieldValue("transparency_user_explanations", e.target.value)}
                  placeholder="Describe: Explanation methods (feature importance, decision trees, natural language explanations), when explanations are provided, how users access them, etc."
                  className="min-h-[100px] rounded-xl"
                  required={values.transparency_docs}
                />
              </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                  Evidence: Upload transparency documentation
                  </Label>

                  <div className="relative flex items-center gap-3">
                    {/* Hidden File Input */}
                    <Input
                      id="transparency_evidence"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) =>
                        handleEvidenceFileChange(
                          "transparency_evidence",
                          e.target.files?.[0] || null
                        )
                      }
                    />

                    {/* Custom Upload Button */}
                    <label
                      htmlFor="transparency_evidence"
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
                    {evidenceContent.transparency_evidence ? (
                      <span className="text-xs text-emerald-400">
                        ✓ File processed ({evidenceContent.transparency_evidence.length} chars)
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

        {/* NEW: Model Cards */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Model Cards</Label>
              <p className="text-sm text-muted-foreground">Do you maintain model cards for each AI system?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.transparency_model_cards
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.transparency_model_cards ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.transparency_model_cards}
                onClick={() => setFieldValue("transparency_model_cards", !values.transparency_model_cards)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.transparency_model_cards ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.transparency_model_cards ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.transparency_model_cards ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.transparency_model_cards && (
            <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Describe what information is included in your model cards</Label>
                <Textarea
                  value={values.transparency_model_cards_details || ""}
                  onChange={(e) => setFieldValue("transparency_model_cards_details", e.target.value)}
                  placeholder="e.g., Model purpose, performance metrics, training data, limitations, intended use cases, etc."
                  className="min-h-[100px] rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* NEW: Explainability Methods */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Explainability Methods</Label>
            <p className="text-sm text-muted-foreground">What explainability methods do you use?</p>
            <Textarea
              value={values.transparency_explainability_methods || ""}
              onChange={(e) => setFieldValue("transparency_explainability_methods", e.target.value)}
              placeholder="e.g., SHAP, LIME, attention maps, feature importance, decision trees, counterfactual explanations, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: User Communication */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">User Communication</Label>
            <p className="text-sm text-muted-foreground">How do you communicate AI system limitations to end users?</p>
            <Textarea
              value={values.transparency_user_communication || ""}
              onChange={(e) => setFieldValue("transparency_user_communication", e.target.value)}
              placeholder="Describe: How limitations are communicated, where users can find this information, what limitations are disclosed, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Decision Documentation */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Decision Documentation</Label>
            <p className="text-sm text-muted-foreground">Are AI decisions documented and traceable?</p>
            <Textarea
              value={values.transparency_decision_documentation || ""}
              onChange={(e) => setFieldValue("transparency_decision_documentation", e.target.value)}
              placeholder="Describe: How decisions are logged, what information is recorded, retention period, audit trail, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Interpretability Requirements */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Interpretability Requirements</Label>
            <p className="text-sm text-muted-foreground">What level of interpretability is required for different use cases?</p>
            <Textarea
              value={values.transparency_interpretability_requirements || ""}
              onChange={(e) => setFieldValue("transparency_interpretability_requirements", e.target.value)}
              placeholder="Describe: Different interpretability requirements for different use cases, risk levels, regulatory requirements, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Stakeholder Communication */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Stakeholder Communication</Label>
            <p className="text-sm text-muted-foreground">How do you communicate AI system behavior to different stakeholders?</p>
            <Textarea
              value={values.transparency_stakeholder_communication || ""}
              onChange={(e) => setFieldValue("transparency_stakeholder_communication", e.target.value)}
              placeholder="Describe: How you communicate with customers, regulators, internal teams, what information is shared, communication channels, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* Fairness & Bias Testing with Sub-questions */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Fairness & Bias Testing</Label>
              <p className="text-sm text-muted-foreground">Have you performed bias or discrimination testing on your system?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.fairness_testing
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.fairness_testing ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.fairness_testing}
                onClick={() => setFieldValue("fairness_testing", !values.fairness_testing)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.fairness_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.fairness_testing ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.fairness_testing ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.fairness_testing && (
            <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">What bias or discrimination testing methods have you used? *</Label>
                <Textarea
                  value={values.fairness_testing_methods || ""}
                  onChange={(e) => setFieldValue("fairness_testing_methods", e.target.value)}
                  placeholder="e.g., Demographic parity testing, equalized odds, calibration testing, disparate impact analysis, A/B testing across groups, etc."
                  className="min-h-[100px] rounded-xl"
                  required={values.fairness_testing}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">What were the results of your fairness testing? *</Label>
                <Textarea
                  value={values.fairness_test_results || ""}
                  onChange={(e) => setFieldValue("fairness_test_results", e.target.value)}
                  placeholder="Describe: Test results, identified biases, fairness metrics scores, any disparities found across demographic groups, mitigation actions taken, etc."
                  className="min-h-[100px] rounded-xl"
                  required={values.fairness_testing}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Evidence: Upload fairness testing reports or results
                </Label>

                <div className="relative flex items-center gap-3">
                  {/* Hidden File Input */}
                  <Input
                    id="fairness_evidence"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) =>
                      handleEvidenceFileChange(
                        "fairness_evidence",
                        e.target.files?.[0] || null
                      )
                    }
                  />

                  {/* Custom Upload Button */}
                  <label
                    htmlFor="fairness_evidence"
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
                  {evidenceContent.fairness_evidence ? (
                    <span className="text-xs text-emerald-400">
                      ✓ File processed ({evidenceContent.fairness_evidence.length} chars)
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

        {/* NEW: Protected Attributes */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Protected Attributes</Label>
            <p className="text-sm text-muted-foreground">Which protected attributes do you test for?</p>
            <Textarea
              value={values.fairness_protected_attributes || ""}
              onChange={(e) => setFieldValue("fairness_protected_attributes", e.target.value)}
              placeholder="e.g., Age, gender, race, religion, ethnicity, sexual orientation, disability, marital status, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Fairness Metrics */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Fairness Metrics</Label>
            <p className="text-sm text-muted-foreground">What fairness metrics do you use?</p>
            <Textarea
              value={values.fairness_metrics_used || ""}
              onChange={(e) => setFieldValue("fairness_metrics_used", e.target.value)}
              placeholder="e.g., Demographic parity, equalized odds, calibration, individual fairness, group fairness, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Bias Mitigation Strategies */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Bias Mitigation Strategies</Label>
            <p className="text-sm text-muted-foreground">What strategies do you use to mitigate identified biases?</p>
            <Textarea
              value={values.fairness_bias_mitigation || ""}
              onChange={(e) => setFieldValue("fairness_bias_mitigation", e.target.value)}
              placeholder="e.g., Pre-processing (data balancing), in-processing (fairness constraints), post-processing (calibration), etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Continuous Monitoring */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Continuous Monitoring</Label>
            <p className="text-sm text-muted-foreground">How do you continuously monitor for bias in production?</p>
            <Textarea
              value={values.fairness_continuous_monitoring || ""}
              onChange={(e) => setFieldValue("fairness_continuous_monitoring", e.target.value)}
              placeholder="Describe: Monitoring tools, alert thresholds, review processes, automated checks, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Adverse Impact Analysis */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Adverse Impact Analysis</Label>
            <p className="text-sm text-muted-foreground">Have you conducted adverse impact analysis for different demographic groups?</p>
            <Textarea
              value={values.fairness_adverse_impact || ""}
              onChange={(e) => setFieldValue("fairness_adverse_impact", e.target.value)}
              placeholder="Describe: Analysis methodology, groups analyzed, findings, mitigation actions taken, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Testing Frequency */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Bias Testing Frequency</Label>
            <p className="text-sm text-muted-foreground">How often do you conduct bias testing?</p>
            <Input
              value={values.fairness_testing_frequency || ""}
              onChange={(e) => setFieldValue("fairness_testing_frequency", e.target.value)}
              placeholder="e.g., Before deployment, quarterly, annually, after model updates, continuous, etc."
              className="rounded-xl"
            />
          </div>
        </div>

        {/* NEW: External Validation */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">External Validation</Label>
              <p className="text-sm text-muted-foreground">Do you use external auditors to validate fairness testing?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.fairness_external_validation
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.fairness_external_validation ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.fairness_external_validation}
                onClick={() => setFieldValue("fairness_external_validation", !values.fairness_external_validation)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.fairness_external_validation ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.fairness_external_validation ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.fairness_external_validation ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.fairness_external_validation && (
            <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Describe the external validation process</Label>
                <Textarea
                  value={values.fairness_external_validation_details || ""}
                  onChange={(e) => setFieldValue("fairness_external_validation_details", e.target.value)}
                  placeholder="Describe: Who conducts validation, validation scope, frequency, findings, etc."
                  className="min-h-[100px] rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* Human Oversight with Sub-questions */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Human Oversight</Label>
              <p className="text-sm text-muted-foreground">Do you have human-in-the-loop (HITL) or human-on-the-loop (HOTL) processes defined?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.human_oversight
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.human_oversight ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.human_oversight}
                onClick={() => setFieldValue("human_oversight", !values.human_oversight)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.human_oversight ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.human_oversight ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.human_oversight ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.human_oversight && (
            <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">What type of human oversight do you have? (HITL, HOTL, or both) *</Label>
                <Textarea
                  value={values.human_oversight_type || ""}
                  onChange={(e) => setFieldValue("human_oversight_type", e.target.value)}
                  placeholder="e.g., Human-in-the-loop (HITL) - humans review every decision before execution. Human-on-the-loop (HOTL) - humans monitor and can intervene. Both - different processes for different scenarios."
                  className="min-h-[80px] rounded-xl"
                  required={values.human_oversight}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Describe your human oversight processes and when humans intervene *</Label>
                <Textarea
                  value={values.human_oversight_processes || ""}
                  onChange={(e) => setFieldValue("human_oversight_processes", e.target.value)}
                  placeholder="Describe: When do humans review decisions? What triggers human intervention? Who are the human reviewers? What is their authority level? Escalation procedures, etc."
                  className="min-h-[100px] rounded-xl"
                  required={values.human_oversight}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Evidence: Upload human oversight process documentation
                </Label>

                <div className="relative flex items-center gap-3">
                  {/* Hidden File Input */}
                  <Input
                    id="human_oversight_evidence"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) =>
                      handleEvidenceFileChange(
                        "human_oversight_evidence",
                        e.target.files?.[0] || null
                      )
                    }
                  />

                  {/* Custom Upload Button */}
                  <label
                    htmlFor="human_oversight_evidence"
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
                  {evidenceContent.human_oversight_evidence ? (
                    <span className="text-xs text-emerald-400">
                      ✓ File processed ({evidenceContent.human_oversight_evidence.length} chars)
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

        {/* NEW: Oversight Roles */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Oversight Roles</Label>
            <p className="text-sm text-muted-foreground">Who are the designated human overseers? What are their qualifications?</p>
            <Textarea
              value={values.human_oversight_roles || ""}
              onChange={(e) => setFieldValue("human_oversight_roles", e.target.value)}
              placeholder="Describe: Who performs oversight, their roles, qualifications, training, experience requirements, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Qualifications */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Oversight Qualifications</Label>
            <p className="text-sm text-muted-foreground">What qualifications are required for human overseers?</p>
            <Textarea
              value={values.human_oversight_qualifications || ""}
              onChange={(e) => setFieldValue("human_oversight_qualifications", e.target.value)}
              placeholder="Describe: Required skills, certifications, experience, domain expertise, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Intervention Triggers */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Intervention Triggers</Label>
            <p className="text-sm text-muted-foreground">What triggers human intervention in AI decisions?</p>
            <Textarea
              value={values.human_oversight_intervention_triggers || ""}
              onChange={(e) => setFieldValue("human_oversight_intervention_triggers", e.target.value)}
              placeholder="Describe: Specific conditions that trigger intervention (e.g., low confidence, high risk, edge cases, anomalies, etc.)"
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Decision Authority */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Decision Authority</Label>
            <p className="text-sm text-muted-foreground">What authority do human overseers have to override AI decisions?</p>
            <Textarea
              value={values.human_oversight_decision_authority || ""}
              onChange={(e) => setFieldValue("human_oversight_decision_authority", e.target.value)}
              placeholder="Describe: Can overseers override decisions? What is the process? What decisions require approval? etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Training */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Oversight Training</Label>
            <p className="text-sm text-muted-foreground">What training do human overseers receive?</p>
            <Textarea
              value={values.human_oversight_training || ""}
              onChange={(e) => setFieldValue("human_oversight_training", e.target.value)}
              placeholder="Describe: Training programs, topics covered, frequency, certification requirements, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Escalation */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Escalation Procedures</Label>
            <p className="text-sm text-muted-foreground">What are the escalation procedures for oversight issues?</p>
            <Textarea
              value={values.human_oversight_escalation || ""}
              onChange={(e) => setFieldValue("human_oversight_escalation", e.target.value)}
              placeholder="Describe: When to escalate, who to escalate to, escalation path, response times, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Documentation */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Oversight Documentation</Label>
            <p className="text-sm text-muted-foreground">How are human oversight activities documented?</p>
            <Textarea
              value={values.human_oversight_documentation || ""}
              onChange={(e) => setFieldValue("human_oversight_documentation", e.target.value)}
              placeholder="Describe: What is documented, documentation format, retention, audit trail, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Automation Percentage */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Automation Level</Label>
            <p className="text-sm text-muted-foreground">What percentage of decisions are automated vs. require human review?</p>
            <Input
              value={values.human_oversight_automation_percentage || ""}
              onChange={(e) => setFieldValue("human_oversight_automation_percentage", e.target.value)}
              placeholder="e.g., 80% automated, 20% human review, or describe the split"
              className="rounded-xl"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
