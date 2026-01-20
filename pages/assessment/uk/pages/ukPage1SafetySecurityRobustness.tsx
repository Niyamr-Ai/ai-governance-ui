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


export default function UkPage1SafetySecurityRobustness({
  ukCurrentPage,
  handleEvidenceFileChange,
  evidenceContent,
}: Props) {
  const { values, setFieldValue } = useFormikContext<any>();

  if (ukCurrentPage !== 1) return null;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-foreground">Safety, Security & Robustness</CardTitle>
        <CardDescription className="text-muted-foreground">
          Ensure your AI system is safe, secure, and robust against errors and attacks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Robustness testing and validation</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.robustness_testing
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.robustness_testing ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.robustness_testing}
                onClick={() =>
                  setFieldValue(
                    "robustness_testing",
                    !values.robustness_testing
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.robustness_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.robustness_testing ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.robustness_testing ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.robustness_testing && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What testing methods do you use?</Label>
                <Textarea
                  value={values.robustness_testing_methods || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "robustness_testing_methods",
                      e.target.value
                    )
                  }
                  placeholder="e.g., Unit tests, integration tests, stress tests"
                  className="rounded-xl"
                />
              </div>


              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  How frequently do you conduct robustness testing?
                </Label>
                <div className="relative flex items-center gap-3">
                  <EvidenceUpload
                    label="Upload robustness testing frequency document"
                    accept=".pdf,.doc,.docx,.txt"
                    value={values.robustness_testing_frequency}
                    onFileSelect={(file) => {
                      handleEvidenceFileChange("uk_robustness_testing_frequency", file);
                      setFieldValue(
                        "robustness_testing_frequency",
                        file ? file.name : ""
                      );
                    }}
                  />


                  {evidenceContent.uk_robustness_testing_frequency ? (
                    <span className="text-xs text-emerald-400">
                      ✓ File processed ({evidenceContent.uk_robustness_testing_frequency.length} chars)
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      PDF, DOC, DOCX, TXT
                    </span>
                  )}

                </div>
              </div>

              <div className="space-y-2">
                <Label>Test results summary</Label>
                <Textarea
                  value={values.robustness_test_results || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "robustness_test_results",
                      e.target.value
                    )
                  }
                  placeholder="Brief summary of test results"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <EvidenceUpload
                  label="Upload robustness testing evidence"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  value={values.robustness_test_evidence}
                  onFileSelect={(file) => {
                    handleEvidenceFileChange("uk_robustness_evidence", file);
                    setFieldValue(
                      "robustness_test_evidence",
                      file ? file.name : null
                    );
                  }}
                />


                {evidenceContent.uk_robustness_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_robustness_evidence.length} characters extracted via OCR)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Red-teaming or adversarial testing</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.red_teaming
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.red_teaming ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.red_teaming}
                onClick={() =>
                  setFieldValue(
                    "red_teaming",
                    !values.red_teaming
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.red_teaming ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.red_teaming ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.red_teaming ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.red_teaming && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>Who conducts red-teaming?</Label>
                <Input
                  value={values.red_teaming_who || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "red_teaming_who",
                      e.target.value
                    )
                  }
                  placeholder="e.g., Internal security team, external consultants"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Methodology used</Label>
                <Textarea
                  value={values.red_teaming_methodology || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "red_teaming_methodology",
                      e.target.value
                    )
                  }
                  placeholder="Describe your red-teaming approach"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Key findings</Label>
                <Textarea
                  value={values.red_teaming_findings || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "red_teaming_findings",
                      e.target.value
                    )
                  }
                  placeholder="Summary of findings and actions taken"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">



                <EvidenceUpload
                  label="Upload red-teaming reports or test results"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  value={values.red_teaming_evidence}
                  onFileSelect={(file) => {
                    handleEvidenceFileChange("uk_red_teaming_evidence", file);
                    setFieldValue(
                      "red_teaming_evidence",
                      file ? file.name : null
                    );
                  }}
                />


                {evidenceContent.uk_red_teaming_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_red_teaming_evidence.length} characters extracted via OCR)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Misuse prevention measures</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.misuse_prevention
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.misuse_prevention ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.misuse_prevention}
                onClick={() =>
                  setFieldValue(
                    "misuse_prevention",
                    !values.misuse_prevention
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.misuse_prevention ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.misuse_prevention ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.misuse_prevention ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.misuse_prevention && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What specific measures are in place?</Label>
                <Textarea
                  value={values.misuse_prevention_measures || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "misuse_prevention_measures",
                      e.target.value
                    )
                  }
                  placeholder="e.g., Access controls, usage monitoring, rate limiting"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>How do you monitor for misuse?</Label>
                <Textarea
                  value={values.misuse_monitoring || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "misuse_monitoring",
                      e.target.value
                    )
                  }
                  placeholder="Describe monitoring processes"
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Cybersecurity controls and monitoring</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.cybersecurity
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.cybersecurity ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.cybersecurity}
                onClick={() =>
                  setFieldValue(
                    "cybersecurity",
                    !values.cybersecurity
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.cybersecurity ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.cybersecurity ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.cybersecurity ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.cybersecurity && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What cybersecurity controls are implemented?</Label>
                <Textarea
                  value={values.cybersecurity_controls || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "cybersecurity_controls",
                      e.target.value
                    )
                  }
                  placeholder="e.g., Encryption, authentication, network security"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Incident response plan</Label>
                <Textarea
                  value={values.cybersecurity_incident_response || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "cybersecurity_incident_response",
                      e.target.value
                    )
                  }
                  placeholder="Describe your incident response procedures"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Monitoring approach</Label>
                <Textarea
                  value={values.cybersecurity_monitoring || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "cybersecurity_monitoring",
                      e.target.value
                    )
                  }
                  placeholder="How do you monitor for security threats?"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <EvidenceUpload
                  label="Upload cybersecurity documentation or security assessment reports"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  value={values.cybersecurity_evidence}
                  onFileSelect={(file) => {
                    handleEvidenceFileChange("uk_cybersecurity_evidence", file);
                    setFieldValue(
                      "cybersecurity_evidence",
                      file ? file.name : null
                    );
                  }}
                />


                {evidenceContent.uk_cybersecurity_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_cybersecurity_evidence.length} characters extracted via OCR)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Safety testing protocols</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.safety_testing
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.safety_testing ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.safety_testing}
                onClick={() =>
                  setFieldValue(
                    "safety_testing",
                    !values.safety_testing
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.safety_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.safety_testing ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.safety_testing ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.safety_testing && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What safety testing protocols do you use?</Label>
                <Textarea
                  value={values.safety_testing_protocols || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "safety_testing_protocols",
                      e.target.value
                    )
                  }
                  placeholder="Describe your safety testing approach"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Validation methods</Label>
                <Textarea
                  value={values.safety_validation_methods || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "safety_validation_methods",
                      e.target.value
                    )
                  }
                  placeholder="How do you validate safety?"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">




                <EvidenceUpload
                  label="Upload safety testing reports or documentation"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  value={values.safety_testing_evidence}
                  onFileSelect={(file) => {
                    handleEvidenceFileChange("uk_safety_testing_evidence", file);
                    setFieldValue(
                      "safety_testing_evidence",
                      file ? file.name : null
                    );
                  }}
                />


                {evidenceContent.uk_safety_testing_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_safety_testing_evidence.length} characters extracted via OCR)
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