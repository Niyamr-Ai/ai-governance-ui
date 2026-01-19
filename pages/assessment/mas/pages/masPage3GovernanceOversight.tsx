import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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

export default function MasPage3GovernanceOversight({
  masCurrentPage,
  handleEvidenceFileChange,
  evidenceContent,
}: Props) {
  const { values, setFieldValue } = useFormikContext<any>();
  if (masCurrentPage !== 2) return null;

  return (
    <>
      {/* Page 3: Governance & Oversight */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-foreground">Governance & Oversight</CardTitle>
          <CardDescription className="text-muted-foreground">
            AI governance policy, framework, board oversight, and senior management responsibilities
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">

          {/* Governance Policy */}
          <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-medium text-foreground">
                  Governance & Oversight
                </Label>
                <p className="text-sm text-muted-foreground">
                  Do you have a documented AI risk governance policy or framework?
                </p>
              </div>

              <div className="ml-4 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${values.governance_policy
                    ? "text-blue-500 bg-emerald-300"
                    : "text-red-500 bg-blue-400"
                    }`}
                >
                  {values.governance_policy ? "YES" : "NO"}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={values.governance_policy}
                  onClick={() =>
                    setFieldValue(
                      "governance_policy",
                      !values.governance_policy
                    )
                  }
                  className="relative inline-flex h-7 w-12 items-center rounded-full border-2"
                  style={{
                    backgroundColor: values.governance_policy
                      ? "#10b981"
                      : "#9ca3af",
                  }}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${values.governance_policy
                      ? "translate-x-5"
                      : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>

            {values.governance_policy && (
              <div className="ml-4 mt-3 space-y-3 pl-4 border-l-2 border-emerald-500">
                <Textarea
                  value={values.governance_policy_type || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "governance_policy_type",
                      e.target.value
                    )
                  }
                  placeholder="Type of governance policy"
                  className="min-h-[80px] rounded-xl"
                />

                <Textarea
                  value={values.governance_framework || ""}
                  onChange={(e) =>
                    setFieldValue("governance_framework", e.target.value)
                  }
                  placeholder="Framework or standard followed"
                  className="min-h-[80px] rounded-xl"
                />

                <Textarea
                  value={values.governance_board_role || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "governance_board_role",
                      e.target.value
                    )
                  }
                  placeholder="Board of Directors role"
                  className="min-h-[100px] rounded-xl"
                />

                <Textarea
                  value={values.governance_senior_management || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "governance_senior_management",
                      e.target.value
                    )
                  }
                  placeholder="Senior management responsibilities"
                  className="min-h-[100px] rounded-xl"
                />

                <Textarea
                  value={values.governance_policy_assigned || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "governance_policy_assigned",
                      e.target.value
                    )
                  }
                  placeholder="Assigned responsibilities"
                  className="min-h-[100px] rounded-xl"
                />

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Upload Governance Evidence
                  </Label>

                  <div className="relative flex items-center gap-3">
                    {/* Hidden File Input */}
                    <Input
                      id="governance-evidence"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) =>
                        handleEvidenceFileChange(
                          "governance_evidence",
                          e.target.files?.[0] || null
                        )
                      }
                    />

                    {/* Custom Upload Button */}
                    <label
                      htmlFor="governance-evidence"
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
                    {evidenceContent.governance_evidence ? (
                      <span className="text-xs text-emerald-400">
                        ✓ File processed ({evidenceContent.governance_evidence.length} chars)
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        PDF, DOC, DOCX, TXT
                      </span>
                    )}
                  </div>
                </div>


                {evidenceContent.governance_evidence && (
                  <p className="text-xs text-emerald-400">
                    ✓ File processed (
                    {evidenceContent.governance_evidence.length} characters)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Ethics Committee */}
          <div className="space-y-2 border border-border rounded-xl p-4 glass-panel">
            <Label className="text-base font-medium text-foreground">
              AI Ethics Committee
            </Label>
            <Textarea
              value={values.governance_ethics_committee_details || ""}
              onChange={(e) =>
                setFieldValue(
                  "governance_ethics_committee_details",
                  e.target.value
                )
              }
              placeholder="Ethics committee details"
              className="min-h-[100px] rounded-xl"
            />
          </div>

          {/* Risk Appetite */}
          <div className="space-y-2 border border-border rounded-xl p-4 glass-panel">
            <Label className="text-base font-medium text-foreground">
              Risk Appetite Statement
            </Label>
            <Textarea
              value={values.governance_risk_appetite || ""}
              onChange={(e) =>
                setFieldValue("governance_risk_appetite", e.target.value)
              }
              className="min-h-[100px] rounded-xl"
            />
          </div>

          {/* Policy Review */}
          <div className="space-y-2 border border-border rounded-xl p-4 glass-panel">
            <Label className="text-base font-medium text-foreground">
              Policy Review Frequency
            </Label>
            <Input
              className="rounded-xl"
              value={values.governance_policy_review_frequency || ""}
              onChange={(e) =>
                setFieldValue(
                  "governance_policy_review_frequency",
                  e.target.value
                )
              }
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}