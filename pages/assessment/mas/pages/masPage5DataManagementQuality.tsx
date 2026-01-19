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

type values = {
  data_quality_checks?: boolean;
  data_quality_methods?: string;
  data_bias_analysis?: string;
  data_lineage_tracking?: boolean;
  data_lineage_details?: string;
  data_retention_policies?: string;
  data_minimization?: string;
  data_accuracy_metrics?: string;
  data_freshness?: string;
  data_synthetic_usage?: boolean;
  data_synthetic_details?: string;
  data_dpia_conducted?: boolean;
  data_dpia_details?: string;
  data_cross_border?: boolean;
  data_cross_border_safeguards?: string;
};


export default function MasPage5DataManagementQuality({
  masCurrentPage,
  handleEvidenceFileChange,
  evidenceContent,
}: Props) {
  const { values, setFieldValue } = useFormikContext<any>();
  if (masCurrentPage !== 4) return null;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-foreground">Data Management & Quality</CardTitle>
        <CardDescription className="text-muted-foreground">
          Data quality checks, bias analysis, data lineage, retention policies, and data minimization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Data Management & Quality with Sub-questions */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Data Management & Quality</Label>
              <p className="text-sm text-muted-foreground">Have you documented data quality checks and bias analysis?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.data_quality_checks
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.data_quality_checks ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.data_quality_checks}
                onClick={() => setFieldValue("data_quality_checks", !values.data_quality_checks)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.data_quality_checks ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.data_quality_checks ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.data_quality_checks ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.data_quality_checks && (
            <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">What data quality checks have you implemented? *</Label>
                <Textarea
                  value={values.data_quality_methods || ""}
                  onChange={(e) => setFieldValue("data_quality_methods", e.target.value)}
                  placeholder="e.g., Data completeness checks, data accuracy validation, data freshness monitoring, data consistency checks, etc."
                  className="min-h-[80px] rounded-xl"
                  required={values.data_quality_checks}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">How have you analyzed and documented bias in your data? *</Label>
                <Textarea
                  value={values.data_bias_analysis || ""}
                  onChange={(e) => setFieldValue("data_bias_analysis", e.target.value)}
                  placeholder="Describe: Bias detection methods, bias mitigation strategies, demographic representation analysis, fairness metrics used, etc."
                  className="min-h-[100px] rounded-xl"
                  required={values.data_quality_checks}
                />
              </div>
              
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                  Evidence: Upload data quality reports or bias analysis documentation
                  </Label>

                  <div className="relative flex items-center gap-3">
                    {/* Hidden File Input */}
                    <Input
                      id="data_quality_evidence"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) =>
                        handleEvidenceFileChange(
                          "data_quality_evidence",
                          e.target.files?.[0] || null
                        )
                      }
                    />

                    {/* Custom Upload Button */}
                    <label
                      htmlFor="data_quality_evidence"
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
                    {evidenceContent.data_quality_evidence ? (
                      <span className="text-xs text-emerald-400">
                        ✓ File processed ({evidenceContent.data_quality_evidence.length} chars)
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, TXT
                      </span>
                    )}
                  </div>
                </div>

                {evidenceContent.data_quality_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.data_quality_evidence.length} characters extracted)
                  </p>
                )}
              </div>
          )}
        </div>

        {/* NEW: Data Lineage Tracking */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Data Lineage Tracking</Label>
              <p className="text-sm text-muted-foreground">Do you track data lineage (where data comes from, transformations)?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.data_lineage_tracking
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.data_lineage_tracking ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.data_lineage_tracking}
                onClick={() => setFieldValue("data_lineage_tracking", !values.data_lineage_tracking)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.data_lineage_tracking ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.data_lineage_tracking ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.data_lineage_tracking ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.data_lineage_tracking && (
            <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Describe your data lineage tracking approach</Label>
                <Textarea
                  value={values.data_lineage_details || ""}
                  onChange={(e) => setFieldValue("data_lineage_details", e.target.value)}
                  placeholder="Describe: Tools used, what is tracked, how transformations are documented, lineage visualization, etc."
                  className="min-h-[100px] rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* NEW: Data Retention Policies */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Data Retention Policies</Label>
            <p className="text-sm text-muted-foreground">What are your data retention policies for AI training data?</p>
            <Textarea
              value={values.data_retention_policies || ""}
              onChange={(e) => setFieldValue("data_retention_policies", e.target.value)}
              placeholder="Describe: How long is training data retained? What triggers deletion? How is data archived? Compliance with regulations?"
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Data Minimization */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Data Minimization</Label>
            <p className="text-sm text-muted-foreground">How do you ensure data minimization (collecting only necessary data)?</p>
            <Textarea
              value={values.data_minimization || ""}
              onChange={(e) => setFieldValue("data_minimization", e.target.value)}
              placeholder="Describe: Processes to determine what data is necessary, data collection limits, regular reviews, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Data Accuracy Metrics */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Data Accuracy Metrics</Label>
            <p className="text-sm text-muted-foreground">What metrics do you use to measure data accuracy?</p>
            <Textarea
              value={values.data_accuracy_metrics || ""}
              onChange={(e) => setFieldValue("data_accuracy_metrics", e.target.value)}
              placeholder="e.g., Completeness percentage, accuracy rate, error rate, validation rules, data quality scores, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Data Freshness */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="space-y-2">
            <Label className="text-base font-medium text-foreground">Data Freshness</Label>
            <p className="text-sm text-muted-foreground">How do you ensure training data remains current and relevant?</p>
            <Textarea
              value={values.data_freshness || ""}
              onChange={(e) => setFieldValue("data_freshness", e.target.value)}
              placeholder="Describe: Data refresh schedules, staleness detection, data expiration policies, etc."
              className="min-h-[100px] rounded-xl"
            />
          </div>
        </div>

        {/* NEW: Synthetic Data Usage */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Synthetic Data Usage</Label>
              <p className="text-sm text-muted-foreground">Do you use synthetic data? If yes, how is it generated and validated?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.data_synthetic_usage
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.data_synthetic_usage ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.data_synthetic_usage}
                onClick={() => setFieldValue("data_synthetic_usage", !values.data_synthetic_usage)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.data_synthetic_usage ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.data_synthetic_usage ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.data_synthetic_usage ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.data_synthetic_usage && (
            <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Describe how synthetic data is generated and validated</Label>
                <Textarea
                  value={values.data_synthetic_details || ""}
                  onChange={(e) => setFieldValue("data_synthetic_details", e.target.value)}
                  placeholder="Describe: Generation methods, validation processes, quality checks, use cases, etc."
                  className="min-h-[100px] rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* NEW: Data Privacy Impact Assessment (DPIA) */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Data Privacy Impact Assessment (DPIA)</Label>
              <p className="text-sm text-muted-foreground">Have you conducted DPIA for AI systems processing personal data?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.data_dpia_conducted
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.data_dpia_conducted ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.data_dpia_conducted}
                onClick={() => setFieldValue("data_dpia_conducted", !values.data_dpia_conducted)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.data_dpia_conducted ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.data_dpia_conducted ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.data_dpia_conducted ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.data_dpia_conducted && (
            <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Describe the DPIA findings and mitigation measures</Label>
                <Textarea
                  value={values.data_dpia_details || ""}
                  onChange={(e) => setFieldValue("data_dpia_details", e.target.value)}
                  placeholder="Describe: DPIA scope, identified risks, mitigation measures, review frequency, etc."
                  className="min-h-[100px] rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* NEW: Cross-Border Data Transfer */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Cross-Border Data Transfer</Label>
              <p className="text-sm text-muted-foreground">Do you transfer data across borders? What safeguards are in place?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.data_cross_border
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.data_cross_border ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.data_cross_border}
                onClick={() => setFieldValue("data_cross_border", !values.data_cross_border)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.data_cross_border ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.data_cross_border ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.data_cross_border ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.data_cross_border && (
            <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Describe safeguards for cross-border data transfer</Label>
                <Textarea
                  value={values.data_cross_border_safeguards || ""}
                  onChange={(e) => setFieldValue("data_cross_border_safeguards", e.target.value)}
                  placeholder="Describe: Standard contractual clauses, adequacy decisions, binding corporate rules, encryption, etc."
                  className="min-h-[100px] rounded-xl"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
