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
import { ToggleSwitchInline } from "@/components/ui/toggle-switch";
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
  let formikContext;
  try {
    formikContext = useFormikContext<any>();
  } catch (error) {
    return null;
  }
  
  if (!formikContext) return null;
  
  const { values, setFieldValue, errors, touched } = formikContext;
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
        <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Data Management & Quality</Label>
              <p className="text-sm text-muted-foreground">Have you documented data quality checks and bias analysis?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.data_quality_checks
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.data_quality_checks ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.data_quality_checks}
                onChange={(v) => setFieldValue("data_quality_checks", v)}
              />
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
                  className={`min-h-[80px] rounded-xl ${errors.data_quality_methods && touched.data_quality_methods
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.data_quality_methods &&
                  typeof errors.data_quality_methods === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.data_quality_methods}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">How have you analyzed and documented bias in your data? *</Label>
                <Textarea
                  value={values.data_bias_analysis || ""}
                  onChange={(e) => setFieldValue("data_bias_analysis", e.target.value)}
                  placeholder="Describe: Bias detection methods, bias mitigation strategies, demographic representation analysis, fairness metrics used, etc."
                  className={`min-h-[100px] rounded-xl ${errors.data_bias_analysis && touched.data_bias_analysis
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.data_bias_analysis &&
                  typeof errors.data_bias_analysis === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.data_bias_analysis}
                    </p>
                  )}
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
        <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Data Lineage Tracking</Label>
              <p className="text-sm text-muted-foreground">Do you track data lineage (where data comes from, transformations)?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.data_lineage_tracking
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.data_lineage_tracking ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.data_lineage_tracking}
                onChange={(v) => setFieldValue("data_lineage_tracking", v)}
              />
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
                  className={`min-h-[100px] rounded-xl ${errors.data_lineage_details && touched.data_lineage_details
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.data_lineage_details &&
                  typeof errors.data_lineage_details === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.data_lineage_details}
                    </p>
                  )}
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
              className={`min-h-[100px] rounded-xl ${errors.data_retention_policies && touched.data_retention_policies
                ? "border-red-500 focus:ring-red-500"
                : ""
                }`}
            />
            {touched.data_retention_policies &&
              typeof errors.data_retention_policies === "string" && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.data_retention_policies}
                </p>
              )}
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
              className={`min-h-[100px] rounded-xl ${errors.data_minimization && touched.data_minimization
                ? "border-red-500 focus:ring-red-500"
                : ""
                }`}
            />
            {touched.data_minimization &&
              typeof errors.data_minimization === "string" && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.data_minimization}
                </p>
              )}
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
              className={`min-h-[100px] rounded-xl ${errors.data_accuracy_metrics && touched.data_accuracy_metrics
                ? "border-red-500 focus:ring-red-500"
                : ""
                }`}
            />
            {touched.data_accuracy_metrics &&
              typeof errors.data_accuracy_metrics === "string" && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.data_accuracy_metrics}
                </p>
              )}
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
              className={`min-h-[100px] rounded-xl ${errors.data_freshness && touched.data_freshness
                ? "border-red-500 focus:ring-red-500"
                : ""
                }`}
            />
            {touched.data_freshness &&
              typeof errors.data_freshness === "string" && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.data_freshness}
                </p>
              )}
          </div>
        </div>

        {/* NEW: Synthetic Data Usage */}
        <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Synthetic Data Usage</Label>
              <p className="text-sm text-muted-foreground">Do you use synthetic data? If yes, how is it generated and validated?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.data_synthetic_usage
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.data_synthetic_usage ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.data_synthetic_usage}
                onChange={(v) => setFieldValue("data_synthetic_usage", v)}
              />
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
                  className={`min-h-[100px] rounded-xl ${errors.data_synthetic_details && touched.data_synthetic_details
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.data_synthetic_details &&
                  typeof errors.data_synthetic_details === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.data_synthetic_details}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* NEW: Data Privacy Impact Assessment (DPIA) */}
        <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Data Privacy Impact Assessment (DPIA)</Label>
              <p className="text-sm text-muted-foreground">Have you conducted DPIA for AI systems processing personal data?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.data_dpia_conducted
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.data_dpia_conducted ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.data_dpia_conducted}
                onChange={(v) => setFieldValue("data_dpia_conducted", v)}
              />
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
                  className={`min-h-[100px] rounded-xl ${errors.data_dpia_details && touched.data_dpia_details
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.data_dpia_details &&
                  typeof errors.data_dpia_details === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.data_dpia_details}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* NEW: Cross-Border Data Transfer */}
        <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 flex-1">
              <Label className="text-base font-medium text-foreground">Cross-Border Data Transfer</Label>
              <p className="text-sm text-muted-foreground">Do you transfer data across borders? What safeguards are in place?</p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.data_cross_border
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.data_cross_border ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.data_cross_border}
                onChange={(v) => setFieldValue("data_cross_border", v)}
              />
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
                  className={`min-h-[100px] rounded-xl ${errors.data_cross_border_safeguards && touched.data_cross_border_safeguards
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.data_cross_border_safeguards &&
                  typeof errors.data_cross_border_safeguards === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.data_cross_border_safeguards}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
