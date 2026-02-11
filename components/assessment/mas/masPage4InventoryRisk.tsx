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
  inventory_recorded?: boolean;
  inventory_location?: string;
  inventory_risk_classification?: string;
  inventory_update_frequency?: string;
  inventory_risk_methodology?: string;
  inventory_risk_review_process?: string;
  inventory_critical_systems?: string;
  inventory_dependency_mapping?: string;
  inventory_legacy_systems?: string;
};


export default function MasPage4InventoryRisk({
  masCurrentPage,
  handleEvidenceFileChange,
  evidenceContent,
}: Props) {
  // Handle SSR - Formik context not available during static generation
  let formikContext;
  try {
    formikContext = useFormikContext<any>();
  } catch (error) {
    return null;
  }
  
  if (!formikContext) return null;
  
  const { values, setFieldValue, errors, touched } = formikContext;
  if (masCurrentPage !== 3) return null;

  const isRecorded = !!values.inventory_recorded;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-foreground">
          System Inventory & Risk Classification
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          System inventory management and risk classification methodology
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* System Inventory & Risk Classification */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-1">
              <Label className="text-base font-medium text-foreground">
                System Inventory & Risk Classification
              </Label>
              <p className="text-sm text-muted-foreground">
                Is this system recorded in your internal AI system inventory?
              </p>
            </div>

            <div className="ml-4 flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${isRecorded
                  ? "text-blue-500 bg-emerald-300"
                  : "text-red-500 bg-blue-400"
                  }`}
              >
                {isRecorded ? "YES" : "NO"}
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={isRecorded}
                onClick={() =>
                  setFieldValue("inventory_recorded", !isRecorded)
                }
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${isRecorded
                  ? "text-blue-500 bg-emerald-300"
                  : "text-red-500 bg-blue-400"
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${isRecorded ? "translate-x-5" : "translate-x-0"
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Sub-questions */}
          {isRecorded && (
            <div className="ml-4 mt-3 pl-4 space-y-4 border-l-2 border-emerald-500">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Where is this system recorded? *
                </Label>
                <Textarea
                  value={values.inventory_location || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "inventory_location",
                      e.target.value
                    )
                  }
                  placeholder="Central AI Registry, Confluence, Excel, etc."
                  className={`min-h-[80px] rounded-xl ${errors.inventory_location && touched.inventory_location
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.inventory_location &&
                  typeof errors.inventory_location === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.inventory_location}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  What is the risk classification assigned? *
                </Label>
                <Textarea
                  value={
                    values.inventory_risk_classification || ""
                  }
                  onChange={(e) =>
                    setFieldValue(
                      "inventory_risk_classification",
                      e.target.value
                    )
                  }
                  placeholder="High / Medium / Low with criteria"
                  className={`min-h-[80px] rounded-xl ${errors.inventory_risk_classification && touched.inventory_risk_classification
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.inventory_risk_classification &&
                  typeof errors.inventory_risk_classification === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.inventory_risk_classification}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                  Evidence: Upload screenshot or document
                  </Label>

                  <div className="relative flex items-center gap-3">
                    {/* Hidden File Input */}
                    <Input
                      id="inventory_evidence"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) =>
                        handleEvidenceFileChange(
                          "inventory_evidence",
                          e.target.files?.[0] || null
                        )
                      }
                    />

                    {/* Custom Upload Button */}
                    <label
                      htmlFor="inventory_evidence"
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
                    {evidenceContent.inventory_evidence ? (
                      <span className="text-xs text-emerald-400">
                        ✓ File processed ({evidenceContent.inventory_evidence.length} chars)
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, TXT
                      </span>
                    )}
                  </div>
                </div>

                {evidenceContent.inventory_evidence && (
                  <p className="text-xs text-emerald-400">
                    ✓ File processed (
                    {evidenceContent.inventory_evidence.length}{" "}
                    characters extracted)
                  </p>
                )}
              </div>
          )}
        </div>

        {/* Inventory Update Frequency */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <Label className="text-base font-medium">
            Inventory Update Frequency
          </Label>
          <p className="text-sm text-muted-foreground">
            How often is your AI system inventory updated?
          </p>
          <Input
            value={values.inventory_update_frequency || ""}
            onChange={(e) =>
              setFieldValue(
                "inventory_update_frequency",
                e.target.value
              )
            }
            placeholder="Monthly, Quarterly, Real-time"
            className={`rounded-xl ${errors.inventory_update_frequency && touched.inventory_update_frequency
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.inventory_update_frequency &&
            typeof errors.inventory_update_frequency === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.inventory_update_frequency}
              </p>
            )}
        </div>

        {/* Risk Classification Methodology */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <Label className="text-base font-medium">
            Risk Classification Methodology
          </Label>
          <p className="text-sm text-muted-foreground">
            What methodology do you use?
          </p>
          <Textarea
            value={values.inventory_risk_methodology || ""}
            onChange={(e) =>
              setFieldValue(
                "inventory_risk_methodology",
                e.target.value
              )
            }
            className={`min-h-[100px] rounded-xl ${errors.inventory_risk_methodology && touched.inventory_risk_methodology
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
            placeholder="MAS TRM, ISO 31000, NIST, etc."
          />
          {touched.inventory_risk_methodology &&
            typeof errors.inventory_risk_methodology === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.inventory_risk_methodology}
              </p>
            )}
        </div>

        {/* Risk Review Process */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <Label className="text-base font-medium">
            Risk Review Process
          </Label>
          <p className="text-sm text-muted-foreground">
            How often are risk classifications reviewed?
          </p>
          <Textarea
            value={
              values.inventory_risk_review_process || ""
            }
            onChange={(e) =>
              setFieldValue(
                "inventory_risk_review_process",
                e.target.value
              )
            }
            className={`min-h-[100px] rounded-xl ${errors.inventory_risk_review_process && touched.inventory_risk_review_process
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.inventory_risk_review_process &&
            typeof errors.inventory_risk_review_process === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.inventory_risk_review_process}
              </p>
            )}
        </div>

        {/* Critical System Identification */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <Label className="text-base font-medium">
            Critical System Identification
          </Label>
          <p className="text-sm text-muted-foreground">
            Which systems are classified as critical?
          </p>
          <Textarea
            value={values.inventory_critical_systems || ""}
            onChange={(e) =>
              setFieldValue(
                "inventory_critical_systems",
                e.target.value
              )
            }
            className={`min-h-[100px] rounded-xl ${errors.inventory_critical_systems && touched.inventory_critical_systems
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.inventory_critical_systems &&
            typeof errors.inventory_critical_systems === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.inventory_critical_systems}
              </p>
            )}
        </div>

        {/* Dependency Mapping */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <Label className="text-base font-medium">
            Dependency Mapping
          </Label>
          <p className="text-sm text-muted-foreground">
            Have you mapped dependencies between AI systems?
          </p>
          <Textarea
            value={
              values.inventory_dependency_mapping || ""
            }
            onChange={(e) =>
              setFieldValue(
                "inventory_dependency_mapping",
                e.target.value
              )
            }
            className={`min-h-[100px] rounded-xl ${errors.inventory_dependency_mapping && touched.inventory_dependency_mapping
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.inventory_dependency_mapping &&
            typeof errors.inventory_dependency_mapping === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.inventory_dependency_mapping}
              </p>
            )}
        </div>

        {/* Legacy System Handling */}
        <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
          <Label className="text-base font-medium">
            Legacy System Handling
          </Label>
          <p className="text-sm text-muted-foreground">
            How are legacy AI systems handled?
          </p>
          <Textarea
            value={values.inventory_legacy_systems || ""}
            onChange={(e) =>
              setFieldValue(
                "inventory_legacy_systems",
                e.target.value
              )
            }
          className={`min-h-[100px] rounded-xl ${errors.inventory_legacy_systems && touched.inventory_legacy_systems
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.inventory_legacy_systems &&
            typeof errors.inventory_legacy_systems === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.inventory_legacy_systems}
              </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}  