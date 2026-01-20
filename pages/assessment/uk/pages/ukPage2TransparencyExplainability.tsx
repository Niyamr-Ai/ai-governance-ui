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
  const { values, setFieldValue } = useFormikContext<any>();
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
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Clear disclosure to users that AI is being used</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.user_disclosure
                  ? "text-blue-500 bg-emerald-300"
                  : "text-red-500 bg-blue-400"
                }`}>
                {values.user_disclosure ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.user_disclosure}
                onClick={() =>
                  setFieldValue("user_disclosure", !values.user_disclosure)
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.user_disclosure ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.user_disclosure ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.user_disclosure ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
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
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>When is disclosure made?</Label>
                <Input
                  value={values.user_disclosure_when || ""}
                  onChange={(e) =>
                    setFieldValue("user_disclosure_when", e.target.value)
                  }
                  placeholder="e.g., Before first use, at login, continuously"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Format of disclosure</Label>
                <Textarea
                  value={values.user_disclosure_format || ""}
                  onChange={(e) =>
                    setFieldValue("user_disclosure_format", e.target.value)
                  }
                  placeholder="Describe the format and content"
                  className="rounded-xl"
                />
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
                  
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                />
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
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Explainability mechanisms for decisions</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.explainability
                  ? "text-blue-500 bg-emerald-300"
                  : "text-red-500 bg-blue-400"
                }`}>
                {values.explainability ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.explainability}
                onClick={() =>
                  setFieldValue("explainability", !values.explainability)
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.explainability ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.explainability ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.explainability ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
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
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Technical details</Label>
                <Textarea
                  value={values.explainability_technical_details || ""}
                  onChange={(e) =>
                    setFieldValue("explainability_technical_details", e.target.value)
                  }
                  placeholder="Technical implementation details"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>How do you explain to different user types?</Label>
                <Textarea
                  value={values.explainability_user_types || ""}
                  onChange={(e) =>
                    setFieldValue("explainability_user_types", e.target.value)
                  }
                  placeholder="e.g., Technical explanations for developers, simple explanations for end users"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Evidence: Upload explainability documentation or examples</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleEvidenceFileChange("uk_explainability_evidence", file);
                    setFieldValue("explainability_evidence", file ? file.name : "");
                  }}
                  
                  
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                />
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
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Documentation of system capabilities and limitations</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.documentation
                  ? "text-blue-500 bg-emerald-300"
                  : "text-red-500 bg-blue-400"
                }`}>
                {values.documentation ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.documentation}
                onClick={() =>
                  setFieldValue("documentation", !values.documentation)
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.documentation ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.documentation ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.documentation ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
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
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Where is documentation stored?</Label>
                <Input
                  value={values.documentation_storage || ""}
                  onChange={(e) =>
                    setFieldValue("documentation_storage", e.target.value)
                  }
                  placeholder="e.g., Confluence, GitHub wiki, internal portal"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>How frequently is documentation updated?</Label>
                <Input
                  value={values.documentation_update_frequency || ""}
                  onChange={(e) =>
                    setFieldValue("documentation_update_frequency", e.target.value)
                  }
                  placeholder="e.g., With each release, quarterly, as needed"
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Transparency reports or public documentation</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.transparency_reports
                  ? "text-blue-500 bg-emerald-300"
                  : "text-red-500 bg-blue-400"
                }`}>
                {values.transparency_reports ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.transparency_reports}
                onClick={() =>
                  setFieldValue("transparency_reports", !values.transparency_reports)
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.transparency_reports ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.transparency_reports ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.transparency_reports ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
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
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Publication frequency</Label>
                <Input
                  value={values.transparency_reports_frequency || ""}
                  onChange={(e) =>
                    setFieldValue("transparency_reports_frequency", e.target.value)
                  }
                  placeholder="e.g., Quarterly, annually"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Where are reports published?</Label>
                <Input
                  value={values.transparency_reports_publication || ""}
                  onChange={(e) =>
                    setFieldValue("transparency_reports_publication", e.target.value)
                  }
                  placeholder="e.g., Company website, public repository"
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}




