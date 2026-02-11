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
import EvidenceUpload from "@/pages/assessment/shared/evidenceUpload";

type Props = {
  ukCurrentPage: number;
  handleEvidenceFileChange: (key: string, file: File | null) => void;
  evidenceContent: Record<string, string>;
};

export default function UkPage3FairnessDataGovernance({
  ukCurrentPage,
  handleEvidenceFileChange,
  evidenceContent,
}: Props) {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  if (ukCurrentPage !== 3) return null;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-foreground">Fairness & Data Governance</CardTitle>
        <CardDescription className="text-muted-foreground">
          Ensure your AI system treats all users fairly and uses quality data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Bias testing and assessment</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.bias_testing
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.bias_testing ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.bias_testing}
                onClick={() =>
                  setFieldValue(
                    "bias_testing",
                    !values.bias_testing
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.bias_testing ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.bias_testing ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.bias_testing ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.bias_testing && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What methodology do you use?</Label>
                <Textarea
                  value={values.bias_testing_methodology || ""}
                  onChange={(e) =>
                    setFieldValue("bias_testing_methodology", e.target.value)
                  }
                  placeholder="Describe your bias testing approach"
                  className={`rounded-xl ${errors.bias_testing_methodology && touched.bias_testing_methodology
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.bias_testing_methodology &&
                  typeof errors.bias_testing_methodology === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.bias_testing_methodology}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>What tools do you use?</Label>
                <Input
                  value={values.bias_testing_tools || ""}
                  onChange={(e) =>
                    setFieldValue("bias_testing_tools", e.target.value)
                  }
                  placeholder="e.g., Fairness indicators, Aequitas, What-If Tool"
                  className={`rounded-xl ${errors.bias_testing_tools && touched.bias_testing_tools
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.bias_testing_tools &&
                  typeof errors.bias_testing_tools === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.bias_testing_tools}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Testing frequency</Label>
                <Input
                  value={values.bias_testing_frequency || ""}
                  onChange={(e) =>
                    setFieldValue("bias_testing_frequency", e.target.value)
                  }
                  placeholder="e.g., Before deployment, quarterly, with each model update"
                  className={`rounded-xl ${errors.bias_testing_frequency && touched.bias_testing_frequency
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.bias_testing_frequency &&
                  typeof errors.bias_testing_frequency === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.bias_testing_frequency}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Test results summary</Label>
                <Textarea
                  value={values.bias_testing_results || ""}
                  onChange={(e) =>
                    setFieldValue("bias_testing_results", e.target.value)
                  }
                  placeholder="Summary of bias testing results"
                  className={`rounded-xl ${errors.bias_testing_results && touched.bias_testing_results
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.bias_testing_results &&
                  typeof errors.bias_testing_results === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.bias_testing_results}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Discriminatory risk mitigation</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.discrimination_mitigation
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.discrimination_mitigation ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.discrimination_mitigation}
                onClick={() =>
                  setFieldValue(
                    "discrimination_mitigation",
                    !values.discrimination_mitigation
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.discrimination_mitigation ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.discrimination_mitigation ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.discrimination_mitigation ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.discrimination_mitigation && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What measures are in place?</Label>
                <Textarea
                  value={values.discrimination_mitigation_measures || ""}
                  onChange={(e) =>
                    setFieldValue("discrimination_mitigation_measures", e.target.value)
                  }
                  placeholder="Describe your discrimination mitigation strategies"
                  className={`rounded-xl ${errors.discrimination_mitigation_measures && touched.discrimination_mitigation_measures
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.discrimination_mitigation_measures &&
                  typeof errors.discrimination_mitigation_measures === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.discrimination_mitigation_measures}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Data quality and representativeness checks</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.data_quality
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.data_quality ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.data_quality}
                onClick={() =>
                  setFieldValue(
                    "data_quality",
                    !values.data_quality
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.data_quality ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.data_quality ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.data_quality ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.data_quality && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What checks do you perform?</Label>
                <Textarea
                  value={values.data_quality_checks || ""}
                  onChange={(e) =>
                    setFieldValue("data_quality_checks", e.target.value)
                  }
                  placeholder="e.g., Completeness, accuracy, consistency checks"
                  className={`rounded-xl ${errors.data_quality_checks && touched.data_quality_checks
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.data_quality_checks &&
                  typeof errors.data_quality_checks === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.data_quality_checks}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>What metrics do you use?</Label>
                <Input
                  value={values.data_quality_metrics || ""}
                  onChange={(e) =>
                    setFieldValue("data_quality_metrics", e.target.value)
                  }
                  placeholder="e.g., Completeness, accuracy, consistency checks"
                  className={`rounded-xl ${errors.data_quality_metrics && touched.data_quality_metrics
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.data_quality_metrics &&
                  typeof errors.data_quality_metrics === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.data_quality_metrics}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex-1">Ongoing fairness monitoring</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.fairness_monitoring
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.fairness_monitoring ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.fairness_monitoring}
                onClick={() =>
                  setFieldValue(
                    "fairness_monitoring",
                    !values.fairness_monitoring
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.fairness_monitoring ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.fairness_monitoring ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.fairness_monitoring ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.fairness_monitoring && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What processes are in place?</Label>
                <Textarea
                  value={values.fairness_monitoring_processes || ""}
                  onChange={(e) =>
                    setFieldValue("fairness_monitoring_processes", e.target.value)
                  }
                  placeholder="Describe ongoing monitoring processes"
                  className={`rounded-xl ${errors.fairness_monitoring_processes && touched.fairness_monitoring_processes
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.fairness_monitoring_processes &&
                  typeof errors.fairness_monitoring_processes === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.fairness_monitoring_processes}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Alert mechanisms</Label>
                <Textarea
                  value={values.fairness_monitoring_alerts || ""}
                  onChange={(e) =>
                    setFieldValue("fairness_monitoring_alerts", e.target.value)
                  }
                  placeholder="How are fairness issues detected and alerted?"
                  className={`rounded-xl ${errors.fairness_monitoring_alerts && touched.fairness_monitoring_alerts
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.fairness_monitoring_alerts &&
                  typeof errors.fairness_monitoring_alerts === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.fairness_monitoring_alerts}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Does your system handle personal data?</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.personal_data_handling
                ? "text-blue-500 bg-emerald-300"
                : "text-red-500 bg-blue-400"
                }`}>
                {values.personal_data_handling ? "YES" : "NO"}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={values.personal_data_handling}
                onClick={() =>
                  setFieldValue(
                    "personal_data_handling",
                    !values.personal_data_handling
                  )
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${values.personal_data_handling ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                style={{ backgroundColor: values.personal_data_handling ? '#10b981' : '#9ca3af' }}
              >
                <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${values.personal_data_handling ? "translate-x-5" : "translate-x-0"
                  }`} />
              </button>
            </div>
          </div>
          {values.personal_data_handling && (
            <div className="ml-8 space-y-3 mt-3">
              <div className="space-y-2">
                <Label>What types of personal data?</Label>
                <Textarea
                  value={values.personal_data_types || ""}
                  onChange={(e) =>
                    setFieldValue("personal_data_types", e.target.value)
                  }
                  placeholder="e.g., Names, emails, addresses, financial information"
                  className={`rounded-xl ${errors.personal_data_types && touched.personal_data_types
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.personal_data_types &&
                  typeof errors.personal_data_types === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.personal_data_types}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Data sources</Label>
                <Textarea
                  value={values.personal_data_sources || ""}
                  onChange={(e) =>
                    setFieldValue("personal_data_sources", e.target.value)
                  }
                  placeholder="Where does personal data come from?"
                  className={`rounded-xl ${errors.personal_data_sources && touched.personal_data_sources
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.personal_data_sources &&
                  typeof errors.personal_data_sources === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.personal_data_sources}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Data retention policies</Label>
                <Textarea
                  value={values.personal_data_retention || ""}
                  onChange={(e) =>
                    setFieldValue("personal_data_retention", e.target.value)
                  }
                  placeholder="How long is personal data retained?"
                  className={`rounded-xl ${errors.personal_data_retention && touched.personal_data_retention
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.personal_data_retention &&
                  typeof errors.personal_data_retention === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.personal_data_retention}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Data representativeness</Label>
          <Textarea
            value={values.data_representativeness || ""}
            onChange={(e) =>
              setFieldValue("data_representativeness", e.target.value)
            }
            placeholder="How do you ensure data represents your user base?"
            className={`rounded-xl ${errors.data_representativeness && touched.data_representativeness
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.data_representativeness &&
            typeof errors.data_representativeness === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.data_representativeness}
              </p>
            )}
        </div>

        <div className="space-y-2">
          <Label>Protected characteristics consideration</Label>
          <Textarea
            value={values.protected_characteristics || ""}
            onChange={(e) =>
              setFieldValue("protected_characteristics", e.target.value)
            }
            placeholder="How do you handle protected characteristics (age, gender, race, etc.)?"
            className={`rounded-xl ${errors.protected_characteristics && touched.protected_characteristics
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.protected_characteristics &&
            typeof errors.protected_characteristics === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.protected_characteristics}
              </p>
            )}
        </div>

        <div className="space-y-2">
          <Label>Fairness metrics used</Label>
          <Textarea
            value={values.fairness_metrics_used || ""}
            onChange={(e) =>
              setFieldValue("fairness_metrics_used", e.target.value)
            }
            placeholder="e.g., Demographic parity, equalized odds, calibration"
            className={`rounded-xl ${errors.fairness_metrics_used && touched.fairness_metrics_used
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.fairness_metrics_used &&
            typeof errors.fairness_metrics_used === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.fairness_metrics_used}
              </p>
            )}
        </div>
        <div className="space-y-2">
          <EvidenceUpload
            label="Upload fairness testing reports or bias analysis documentation"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            value={values.fairness_evidence}
            onFileSelect={(file) => {
              handleEvidenceFileChange("uk_fairness_evidence", file);
              setFieldValue(
                "fairness_evidence",
                file ? file.name : ""
              );
            }}
          />

          {evidenceContent.uk_fairness_evidence && (
            <p className="text-xs text-emerald-400 mt-1">
              ✓ File processed ({evidenceContent.uk_fairness_evidence.length} chars)
            </p>
          )}

        </div>
      </CardContent>
    </Card>
  );
}



