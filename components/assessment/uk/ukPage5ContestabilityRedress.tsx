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

export default function UkPage5ContestabilityRedress({
  ukCurrentPage,
  handleEvidenceFileChange,
  evidenceContent,
}: Props) {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  if (ukCurrentPage !== 5) return null;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-foreground">Contestability & Redress</CardTitle>
        <CardDescription className="text-muted-foreground">
          Ensure users can challenge decisions and seek redress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Clear user rights and information</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.user_rights
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.user_rights ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.user_rights}
                onChange={(v) => setFieldValue("user_rights", v)}
              />
            </div>
          </div>
          {values.user_rights && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What rights do users have?</Label>
                <Textarea
                  value={values.user_rights_what || ""}
                  onChange={(e) =>
                    setFieldValue("user_rights_what", e.target.value)
                  }
                  placeholder="e.g., Right to explanation, right to challenge decisions"
                  className={`rounded-xl ${errors.user_rights_what && touched.user_rights_what
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.user_rights_what &&
                  typeof errors.user_rights_what === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.user_rights_what}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>How are rights communicated?</Label>
                <Textarea
                  value={values.user_rights_communication || ""}
                  onChange={(e) =>
                    setFieldValue("user_rights_communication", e.target.value)
                  }
                  placeholder="How do you inform users of their rights?"
                  className={`rounded-xl ${errors.user_rights_communication && touched.user_rights_communication
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.user_rights_communication &&
                  typeof errors.user_rights_communication === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.user_rights_communication}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Evidence: Upload user rights documentation or communication materials
                  <span className="text-xs text-muted-foreground ml-2">(Optional if text fields above are filled)</span>
                </Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleEvidenceFileChange("uk_user_rights_evidence", file);
                    setFieldValue("user_rights_evidence", file ? file.name : "");
                  }}
                  className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 ${errors.user_rights_evidence && touched.user_rights_evidence
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.user_rights_evidence &&
                  typeof errors.user_rights_evidence === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.user_rights_evidence}
                    </p>
                  )}
                {evidenceContent.uk_user_rights_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_user_rights_evidence.length} chars)
                  </p>
                )}
              </div>

            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Appeal or challenge mechanism</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.appeal_mechanism
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.appeal_mechanism ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.appeal_mechanism}
                onChange={(v) => setFieldValue("appeal_mechanism", v)}
              />
            </div>
          </div>
          {values.appeal_mechanism && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What is the appeal process?</Label>
                <Textarea
                  value={values.appeal_mechanism_process || ""}
                  onChange={(e) =>
                    setFieldValue("appeal_mechanism_process", e.target.value)
                  }
                  placeholder="Describe the steps users can take to appeal"
                  className={`rounded-xl ${errors.appeal_mechanism_process && touched.appeal_mechanism_process
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.appeal_mechanism_process &&
                  typeof errors.appeal_mechanism_process === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.appeal_mechanism_process}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Timeline for appeals</Label>
                <Input
                  value={values.appeal_mechanism_timeline || ""}
                  onChange={(e) =>
                    setFieldValue("appeal_mechanism_timeline", e.target.value)
                  }
                  placeholder="e.g., Within 30 days, response within 5 business days"
                  className={`rounded-xl ${errors.appeal_mechanism_timeline && touched.appeal_mechanism_timeline
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.appeal_mechanism_timeline &&
                  typeof errors.appeal_mechanism_timeline === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.appeal_mechanism_timeline}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>How accessible is the appeal mechanism?</Label>
                <Textarea
                  value={values.appeal_mechanism_accessibility || ""}
                  onChange={(e) =>
                    setFieldValue("appeal_mechanism_accessibility", e.target.value)
                  }
                  placeholder="How easy is it for users to appeal?"
                  className={`rounded-xl ${errors.appeal_mechanism_accessibility && touched.appeal_mechanism_accessibility
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.appeal_mechanism_accessibility &&
                  typeof errors.appeal_mechanism_accessibility === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.appeal_mechanism_accessibility}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Evidence: Upload appeal mechanism documentation or process flows</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleEvidenceFileChange("uk_appeal_mechanism_evidence", file);
                    setFieldValue("appeal_mechanism_evidence", file ? file.name : "");
                  }}
                  className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 ${errors.appeal_mechanism_evidence && touched.appeal_mechanism_evidence
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.appeal_mechanism_evidence &&
                  typeof errors.appeal_mechanism_evidence === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.appeal_mechanism_evidence}
                    </p>
                  )}
                {evidenceContent.uk_appeal_mechanism_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_appeal_mechanism_evidence.length} chars)
                  </p>
                )}
              </div>

            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Redress process for adverse outcomes</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.redress_process
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.redress_process ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.redress_process}
                onChange={(v) => setFieldValue("redress_process", v)}
              />
            </div>
          </div>
          {values.redress_process && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What steps are involved?</Label>
                <Textarea
                  value={values.redress_process_steps || ""}
                  onChange={(e) =>
                    setFieldValue("redress_process_steps", e.target.value)
                  }
                  placeholder="Describe the redress process"
                  className={`rounded-xl ${errors.redress_process_steps && touched.redress_process_steps
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.redress_process_steps &&
                  typeof errors.redress_process_steps === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.redress_process_steps}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Compensation mechanisms</Label>
                <Textarea
                  value={values.redress_compensation || ""}
                  onChange={(e) =>
                    setFieldValue("redress_compensation", e.target.value)
                  }
                  placeholder="How is compensation provided if needed?"
                  className={`rounded-xl ${errors.redress_compensation && touched.redress_compensation
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.redress_compensation &&
                  typeof errors.redress_compensation === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.redress_compensation}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Documentation</Label>
                <Textarea
                  value={values.redress_documentation || ""}
                  onChange={(e) =>
                    setFieldValue("redress_documentation", e.target.value)
                  }
                  placeholder="How are redress cases documented?"
                  className={`rounded-xl ${errors.redress_documentation && touched.redress_documentation
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.redress_documentation &&
                  typeof errors.redress_documentation === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.redress_documentation}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Evidence: Upload redress process documentation or case examples
                  <span className="text-xs text-muted-foreground ml-2">(Optional if text fields above are filled)</span>
                </Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleEvidenceFileChange("uk_redress_process_evidence", file);
                    setFieldValue("redress_process_evidence", file ? file.name : "");
                  }}
                  className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 ${errors.redress_process_evidence && touched.redress_process_evidence
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.redress_process_evidence &&
                  typeof errors.redress_process_evidence === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.redress_process_evidence}
                    </p>
                  )}
                {evidenceContent.uk_redress_process_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_redress_process_evidence.length} chars)
                  </p>
                )}
              </div>

            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Complaint handling procedures</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.complaint_handling
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.complaint_handling ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.complaint_handling}
                onChange={(v) => setFieldValue("complaint_handling", v)}
              />
            </div>
          </div>
          {values.complaint_handling && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What procedures are in place?</Label>
                <Textarea
                  value={values.complaint_handling_procedures || ""}
                  onChange={(e) =>
                    setFieldValue("complaint_handling_procedures", e.target.value)
                  }
                  placeholder="Describe complaint handling processes"
                  className={`rounded-xl ${errors.complaint_handling_procedures && touched.complaint_handling_procedures
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.complaint_handling_procedures &&
                  typeof errors.complaint_handling_procedures === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.complaint_handling_procedures}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Response time</Label>
                <Input
                  value={values.complaint_response_time || ""}
                  onChange={(e) =>
                    setFieldValue("complaint_response_time", e.target.value)
                  }
                  placeholder="e.g., Within 48 hours, within 5 business days"
                  className={`rounded-xl ${errors.complaint_response_time && touched.complaint_response_time
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.complaint_response_time &&
                  typeof errors.complaint_response_time === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.complaint_response_time}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>How are complaints tracked?</Label>
                <Textarea
                  value={values.complaint_tracking || ""}
                  onChange={(e) =>
                    setFieldValue("complaint_tracking", e.target.value)
                  }
                  placeholder="Describe complaint tracking system"
                  className={`rounded-xl ${errors.complaint_tracking && touched.complaint_tracking
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.complaint_tracking &&
                  typeof errors.complaint_tracking === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.complaint_tracking}
                    </p>
                  )}
              </div>


              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Evidence: Upload complaint handling procedures or tracking reports</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleEvidenceFileChange("uk_complaint_handling_evidence", file);
                    setFieldValue("complaint_handling_evidence", file ? file.name : "");
                  }}
                  className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 ${errors.complaint_handling_evidence && touched.complaint_handling_evidence
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.complaint_handling_evidence &&
                  typeof errors.complaint_handling_evidence === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.complaint_handling_evidence}
                    </p>
                  )}
                {evidenceContent.uk_complaint_handling_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_complaint_handling_evidence.length} chars)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Appeal success rates</Label>
          <Textarea
            value={values.appeal_success_rates || ""}
            onChange={(e) =>
              setFieldValue("appeal_success_rates", e.target.value)
            }
            placeholder="What percentage of appeals are successful?"
            className={`rounded-xl ${errors.appeal_success_rates && touched.appeal_success_rates
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.appeal_success_rates &&
            typeof errors.appeal_success_rates === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.appeal_success_rates}
              </p>
            )}
        </div>

        <div className="space-y-2">
          <Label>Redress outcomes tracking</Label>
          <Textarea
            value={values.redress_outcomes_tracking || ""}
            onChange={(e) =>
              setFieldValue("redress_outcomes_tracking", e.target.value)
            }
            placeholder="How do you track redress outcomes?"
            className={`rounded-xl ${errors.redress_outcomes_tracking && touched.redress_outcomes_tracking
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.redress_outcomes_tracking &&
            typeof errors.redress_outcomes_tracking === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.redress_outcomes_tracking}
              </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}




