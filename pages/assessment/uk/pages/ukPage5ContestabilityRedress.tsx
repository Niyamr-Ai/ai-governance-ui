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
import EvidenceUpload from "../../shared/evidenceUpload";

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
  const { values, setFieldValue } = useFormikContext<any>();
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
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Clear user rights and information</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.user_rights
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.user_rights ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.user_rights}
                onClick={() =>
                  setFieldValue(
                    "user_rights",
                    !values.user_rights
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.user_rights ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.user_rights ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.user_rights ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
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
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>How are rights communicated?</Label>
                <Textarea
                  value={values.user_rights_communication || ""}
                  onChange={(e) =>
                    setFieldValue("user_rights_communication", e.target.value)
                  }
                  placeholder="How do you inform users of their rights?"
                  className="rounded-xl"
                />
              </div>
              <EvidenceUpload
                label="Upload user rights documentation or communication materials"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                value={values.user_rights_evidence}
                onFileSelect={(file) => {
                  handleEvidenceFileChange("uk_user_rights_evidence", file);
                  setFieldValue(
                    "user_rights_evidence",
                    file ? file.name : ""
                  );
                }}
              />

              {evidenceContent.uk_user_rights_evidence && (
                <p className="text-xs text-emerald-400 mt-1">
                  ✓ File processed ({evidenceContent.uk_user_rights_evidence.length} chars)
                </p>
              )}

            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Appeal or challenge mechanism</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.appeal_mechanism
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.appeal_mechanism ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.appeal_mechanism}
                onClick={() =>
                  setFieldValue(
                    "appeal_mechanism",
                    !values.appeal_mechanism
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.appeal_mechanism ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.appeal_mechanism ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.appeal_mechanism ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
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
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Timeline for appeals</Label>
                <Input
                  value={values.appeal_mechanism_timeline || ""}
                  onChange={(e) =>
                    setFieldValue("appeal_mechanism_timeline", e.target.value)
                  }
                  placeholder="e.g., Within 30 days, response within 5 business days"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>How accessible is the appeal mechanism?</Label>
                <Textarea
                  value={values.appeal_mechanism_accessibility || ""}
                  onChange={(e) =>
                    setFieldValue("appeal_mechanism_accessibility", e.target.value)
                  }
                  placeholder="How easy is it for users to appeal?"
                  className="rounded-xl"
                />
              </div>
              <EvidenceUpload
                label="Upload appeal mechanism documentation or process flows"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                value={values.appeal_mechanism_evidence}
                onFileSelect={(file) => {
                  handleEvidenceFileChange("uk_appeal_mechanism_evidence", file);
                  setFieldValue(
                    "appeal_mechanism_evidence",
                    file ? file.name : ""
                  );
                }}
              />

              {evidenceContent.uk_appeal_mechanism_evidence && (
                <p className="text-xs text-emerald-400 mt-1">
                  ✓ File processed ({evidenceContent.uk_appeal_mechanism_evidence.length} chars)
                </p>
              )}

            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Redress process for adverse outcomes</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.redress_process
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.redress_process ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.redress_process}
                onClick={() =>
                  setFieldValue(
                    "redress_process",
                    !values.redress_process
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.redress_process ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.redress_process ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.redress_process ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
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
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Compensation mechanisms</Label>
                <Textarea
                  value={values.redress_compensation || ""}
                  onChange={(e) =>
                    setFieldValue("redress_compensation", e.target.value)
                  }
                  placeholder="How is compensation provided if needed?"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Documentation</Label>
                <Textarea
                  value={values.redress_documentation || ""}
                  onChange={(e) =>
                    setFieldValue("redress_documentation", e.target.value)
                  }
                  placeholder="How are redress cases documented?"
                  className="rounded-xl"
                />
              </div>
              <EvidenceUpload
                label="Upload redress process documentation or case examples"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                value={values.redress_process_evidence}
                onFileSelect={(file) => {
                  handleEvidenceFileChange("uk_redress_process_evidence", file);
                  setFieldValue(
                    "redress_process_evidence",
                    file ? file.name : ""
                  );
                }}
              />

              {evidenceContent.uk_redress_process_evidence && (
                <p className="text-xs text-emerald-400 mt-1">
                  ✓ File processed ({evidenceContent.uk_redress_process_evidence.length} chars)
                </p>
              )}

            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Complaint handling procedures</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.complaint_handling
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.complaint_handling ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.complaint_handling}

                onClick={() =>
                  setFieldValue(
                    "complaint_handling",
                    !values.complaint_handling
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.complaint_handling ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.complaint_handling ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.complaint_handling ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
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
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Response time</Label>
                <Input
                  value={values.complaint_response_time || ""}
                  onChange={(e) =>
                    setFieldValue("complaint_response_time", e.target.value)
                  }
                  placeholder="e.g., Within 48 hours, within 5 business days"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>How are complaints tracked?</Label>
                <Textarea
                  value={values.complaint_tracking || ""}
                  onChange={(e) =>
                    setFieldValue("complaint_tracking", e.target.value)
                  }
                  placeholder="Describe complaint tracking system"
                  className="rounded-xl"
                />
              </div>


              <EvidenceUpload
                label="Upload complaint handling procedures or tracking reports"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                value={values.complaint_handling_evidence}
                onFileSelect={(file) => {
                  handleEvidenceFileChange("uk_complaint_handling_evidence", file);
                  setFieldValue(
                    "complaint_handling_evidence",
                    file ? file.name : ""
                  );
                }}
              />

              {evidenceContent.uk_complaint_handling_evidence && (
                <p className="text-xs text-emerald-400 mt-1">
                  ✓ File processed ({evidenceContent.uk_complaint_handling_evidence.length} chars)
                </p>
              )}
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
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label>Redress outcomes tracking</Label>
          <Textarea
            value={values.redress_outcomes_tracking || ""}
            onChange={(e) =>
              setFieldValue("redress_outcomes_tracking", e.target.value)
            }
            placeholder="How do you track redress outcomes?"
            className="rounded-xl"
          />
        </div>
      </CardContent>
    </Card>
  );
}




