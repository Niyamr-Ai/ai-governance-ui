import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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

export default function MasPage3GovernanceOversight({
  masCurrentPage,
  handleEvidenceFileChange,
  evidenceContent,
}: Props) {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
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
          <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
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
                    ? "text-emerald-700 bg-emerald-100"
                    : "text-slate-500 bg-slate-200"
                    }`}
                >
                  {values.governance_policy ? "YES" : "NO"}
                </span>

                <ToggleSwitchInline
                  checked={values.governance_policy}
                  onChange={(v) => setFieldValue("governance_policy", v)}
                />
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
                  className={`min-h-[80px] rounded-xl ${errors.governance_policy_type && touched.governance_policy_type
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.governance_policy_type &&
                  typeof errors.governance_policy_type === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.governance_policy_type}
                    </p>
                  )}

                <Textarea
                  value={values.governance_framework || ""}
                  onChange={(e) =>
                    setFieldValue("governance_framework", e.target.value)
                  }
                  placeholder="Framework or standard followed"
                  className={`min-h-[80px] rounded-xl ${errors.governance_framework && touched.governance_framework
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.governance_framework &&
                  typeof errors.governance_framework === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.governance_framework}
                    </p>
                  )}

                <Textarea
                  value={values.governance_board_role || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "governance_board_role",
                      e.target.value
                    )
                  }
                  placeholder="Board of Directors role"
                  className={`min-h-[100px] rounded-xl ${errors.governance_board_role && touched.governance_board_role
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.governance_board_role &&
                  typeof errors.governance_board_role === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.governance_board_role}
                    </p>
                  )}

                <Textarea
                  value={values.governance_senior_management || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "governance_senior_management",
                      e.target.value
                    )
                  }
                  placeholder="Senior management responsibilities"
                  className={`min-h-[100px] rounded-xl ${errors.governance_senior_management && touched.governance_senior_management
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.governance_senior_management &&
                  typeof errors.governance_senior_management === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.governance_senior_management}
                    </p>
                  )}

                <Textarea
                  value={values.governance_policy_assigned || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "governance_policy_assigned",
                      e.target.value
                    )
                  }
                  placeholder="Assigned responsibilities"
                  className={`min-h-[100px] rounded-xl ${errors.governance_policy_assigned && touched.governance_policy_assigned
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.governance_policy_assigned &&
                  typeof errors.governance_policy_assigned === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.governance_policy_assigned}
                    </p>
                  )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Evidence: Upload disclosure documentation or screenshots</Label>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleEvidenceFileChange("mas_governance_evidence", file);
                      setFieldValue("governance_evidence", file ? file.name : "");
                    }}

                    className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 ${errors.user_disclosure_evidence && touched.user_disclosure_evidence
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                      }`}
                  />
                  {touched.governance_evidence &&
                    typeof errors.governance_evidence === "string" && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.governance_evidence}
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
              className={`min-h-[100px] rounded-xl ${errors.governance_ethics_committee_details && touched.governance_ethics_committee_details
                ? "border-red-500 focus:ring-red-500"
                : ""
                }`}
            />
            {touched.governance_ethics_committee_details &&
              typeof errors.governance_ethics_committee_details === "string" && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.governance_ethics_committee_details}
                </p>
              )}
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
              className={`min-h-[100px] rounded-xl ${errors.governance_risk_appetite && touched.governance_risk_appetite
                ? "border-red-500 focus:ring-red-500"
                : ""
                }`}
            />
            {touched.governance_risk_appetite &&
              typeof errors.governance_risk_appetite === "string" && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.governance_risk_appetite}
                </p>
              )}
          </div>

          {/* Policy Review */}
          <div className="space-y-2 border border-border rounded-xl p-4 glass-panel">
            <Label className="text-base font-medium text-foreground">
              Policy Review Frequency
            </Label>
            <Textarea
              value={values.governance_policy_review_frequency || ""}
              onChange={(e) =>
                setFieldValue("governance_policy_review_frequency", e.target.value)
              }
              className={`min-h-[100px] rounded-xl ${errors.governance_policy_review_frequency && touched.governance_policy_review_frequency
                ? "border-red-500 focus:ring-red-500"
                : ""
                }`}
            />
            {touched.governance_policy_review_frequency &&
              typeof errors.governance_policy_review_frequency === "string" && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.governance_policy_review_frequency}
                </p>
              )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
