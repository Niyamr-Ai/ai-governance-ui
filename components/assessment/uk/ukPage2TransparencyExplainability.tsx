import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleSwitchInline } from "@/components/ui/toggle-switch";
import { useFormikContext } from "formik";

type Props = {
  ukCurrentPage: number;
  handleEvidenceFileChange: (key: string, file: File | null) => void;
  evidenceContent: Record<string, string>;
};


export default function UkPage2TransparencyExplainability({
  ukCurrentPage,
  handleEvidenceFileChange,
  evidenceContent,
}: Props) {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  if (ukCurrentPage !== 2) return null;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-foreground">Transparency & Explainability</CardTitle>
        <CardDescription className="text-muted-foreground">
          Ensure users understand when and how AI is being used
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Clear disclosure to users that AI is being used</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.user_disclosure
                  ? "text-emerald-700 bg-emerald-100"
                  : "text-slate-500 bg-slate-200"
                }`}>
                {values.user_disclosure ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.user_disclosure}
                onChange={(v) => setFieldValue("user_disclosure", v)}
              />
            </div>
          </div>
          {values.user_disclosure && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>How do you disclose AI usage?</Label>
                <Textarea
                  value={values.user_disclosure_how || ""}
                  onChange={(e) =>
                    setFieldValue("user_disclosure_how", e.target.value)
                  }
                  placeholder="e.g., In-app notifications, terms of service, user interface labels"
                  className={`rounded-xl ${errors.user_disclosure_how && touched.user_disclosure_how
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.user_disclosure_how &&
                  typeof errors.user_disclosure_how === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.user_disclosure_how}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>When is disclosure made?</Label>
                <Input
                  value={values.user_disclosure_when || ""}
                  onChange={(e) =>
                    setFieldValue("user_disclosure_when", e.target.value)
                  }
                  placeholder="e.g., Before first use, at login, continuously"
                  className={`rounded-xl ${errors.user_disclosure_when && touched.user_disclosure_when
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.user_disclosure_when &&
                  typeof errors.user_disclosure_when === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.user_disclosure_when}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Format of disclosure</Label>
                <Textarea
                  value={values.user_disclosure_format || ""}
                  onChange={(e) =>
                    setFieldValue("user_disclosure_format", e.target.value)
                  }
                  placeholder="Describe the format and content"
                  className={`rounded-xl ${errors.user_disclosure_format && touched.user_disclosure_format
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.user_disclosure_format &&
                  typeof errors.user_disclosure_format === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.user_disclosure_format}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Evidence: Upload disclosure documentation or screenshots</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleEvidenceFileChange("uk_user_disclosure_evidence", file);
                    setFieldValue("user_disclosure_evidence", file ? file.name : "");
                  }}

                  className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 ${errors.user_disclosure_evidence && touched.user_disclosure_evidence
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.user_disclosure_evidence &&
                  typeof errors.user_disclosure_evidence === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.user_disclosure_evidence}
                    </p>
                  )}
                {evidenceContent.uk_user_disclosure_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_user_disclosure_evidence.length} characters extracted via OCR)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Explainability mechanisms for decisions</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.explainability
                  ? "text-emerald-700 bg-emerald-100"
                  : "text-slate-500 bg-slate-200"
                }`}>
                {values.explainability ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.explainability}
                onChange={(v) => setFieldValue("explainability", v)}
              />
            </div>
          </div>
          {values.explainability && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What explainability methods do you use?</Label>
                <Textarea
                  value={values.explainability_methods || ""}
                  onChange={(e) =>
                    setFieldValue("explainability_methods", e.target.value)
                  }
                  placeholder="e.g., SHAP values, LIME, feature importance, decision trees"
                  className={`rounded-xl ${errors.explainability_methods && touched.explainability_methods
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.explainability_methods &&
                  typeof errors.explainability_methods === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.explainability_methods}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Technical details</Label>
                <Textarea
                  value={values.explainability_technical_details || ""}
                  onChange={(e) =>
                    setFieldValue("explainability_technical_details", e.target.value)
                  }
                  placeholder="Technical implementation details"
                  className={`rounded-xl ${errors.explainability_technical_details && touched.explainability_technical_details
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.explainability_technical_details &&
                  typeof errors.explainability_technical_details === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.explainability_technical_details}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>How do you explain to different user types?</Label>
                <Textarea
                  value={values.explainability_user_types || ""}
                  onChange={(e) =>
                    setFieldValue("explainability_user_types", e.target.value)
                  }
                  placeholder="e.g., Technical explanations for developers, simple explanations for end users"
                  className={`rounded-xl ${errors.explainability_user_types && touched.explainability_user_types
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.explainability_user_types &&
                  typeof errors.explainability_user_types === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.explainability_user_types}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Evidence: Upload explainability documentation or examples
                  <span className="text-xs text-muted-foreground ml-2">(Optional if text fields above are filled)</span>
                </Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleEvidenceFileChange("uk_explainability_evidence", file);
                    setFieldValue("explainability_evidence", file ? file.name : "");
                  }}
                  className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 ${errors.explainability_evidence && touched.explainability_evidence
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.explainability_evidence &&
                  typeof errors.explainability_evidence === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.explainability_evidence}
                    </p>
                  )}
                {evidenceContent.uk_explainability_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_explainability_evidence.length} characters extracted via OCR)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Documentation of system capabilities and limitations</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.documentation
                  ? "text-emerald-700 bg-emerald-100"
                  : "text-slate-500 bg-slate-200"
                }`}>
                {values.documentation ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.documentation}
                onChange={(v) => setFieldValue("documentation", v)}
              />
            </div>
          </div>
          {values.documentation && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What types of documentation exist?</Label>
                <Textarea
                  value={values.documentation_types || ""}
                  onChange={(e) =>
                    setFieldValue("documentation_types", e.target.value)
                  }
                  placeholder="e.g., API docs, user guides, technical specifications"
                  className={`rounded-xl ${errors.documentation_types && touched.documentation_types
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.documentation_types &&
                  typeof errors.documentation_types === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.documentation_types}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Where is documentation stored?</Label>
                <Input
                  value={values.documentation_storage || ""}
                  onChange={(e) =>
                    setFieldValue("documentation_storage", e.target.value)
                  }
                  placeholder="e.g., Confluence, GitHub wiki, internal portal"
                  className={`rounded-xl ${errors.documentation_storage && touched.documentation_storage
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.documentation_storage &&
                  typeof errors.documentation_storage === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.documentation_storage}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>How frequently is documentation updated?</Label>
                <Input
                  value={values.documentation_update_frequency || ""}
                  onChange={(e) =>
                    setFieldValue("documentation_update_frequency", e.target.value)
                  }
                  placeholder="e.g., With each release, quarterly, as needed"
                  className={`rounded-xl ${errors.documentation_update_frequency && touched.documentation_update_frequency
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.documentation_update_frequency &&
                  typeof errors.documentation_update_frequency === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.documentation_update_frequency}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Transparency reports or public documentation</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.transparency_reports
                  ? "text-emerald-700 bg-emerald-100"
                  : "text-slate-500 bg-slate-200"
                }`}>
                {values.transparency_reports ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.transparency_reports}
                onChange={(v) => setFieldValue("transparency_reports", v)}
              />
            </div>
          </div>
          {values.transparency_reports && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What content is included in transparency reports?</Label>
                <Textarea
                  value={values.transparency_reports_content || ""}
                  onChange={(e) =>
                    setFieldValue("transparency_reports_content", e.target.value)
                  }
                  placeholder="Describe the content and scope"
                  className={`rounded-xl ${errors.transparency_reports_content && touched.transparency_reports_content
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.transparency_reports_content &&
                  typeof errors.transparency_reports_content === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.transparency_reports_content}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Publication frequency</Label>
                <Input
                  value={values.transparency_reports_frequency || ""}
                  onChange={(e) =>
                    setFieldValue("transparency_reports_frequency", e.target.value)
                  }
                  placeholder="e.g., Quarterly, annually"
                  className={`rounded-xl ${errors.transparency_reports_frequency && touched.transparency_reports_frequency
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.transparency_reports_frequency &&
                  typeof errors.transparency_reports_frequency === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.transparency_reports_frequency}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Where are reports published?</Label>
                <Input
                  value={values.transparency_reports_publication || ""}
                  onChange={(e) =>
                    setFieldValue("transparency_reports_publication", e.target.value)
                  }
                  placeholder="e.g., Company website, public repository"
                  className={`rounded-xl ${errors.transparency_reports_publication && touched.transparency_reports_publication
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.transparency_reports_publication &&
                  typeof errors.transparency_reports_publication === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.transparency_reports_publication}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}




