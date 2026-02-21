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

export default function UkPage4AccountabilityGovernance({
  ukCurrentPage,
  handleEvidenceFileChange,
  evidenceContent,
}: Props) {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  if (ukCurrentPage !== 4) return null;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-foreground">Accountability & Governance</CardTitle>
        <CardDescription className="text-muted-foreground">
          Establish clear accountability and governance structures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Clear accountability framework</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.accountability_framework
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.accountability_framework ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.accountability_framework}
                onChange={(v) => setFieldValue("accountability_framework", v)}
              />
            </div>
          </div>
          {values.accountability_framework && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>Framework structure</Label>
                <Textarea
                  value={values.accountability_framework_structure || ""}
                  onChange={(e) =>
                    setFieldValue("accountability_framework_structure", e.target.value)
                  }
                  placeholder="e.g., Demographic parity, equalized odds, calibration"
                  className={`rounded-xl ${errors.accountability_framework_structure && touched.accountability_framework_structure
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.accountability_framework_structure &&
                  typeof errors.accountability_framework_structure === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.accountability_framework_structure}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Accountability roles</Label>
                <Textarea
                  value={values.accountability_roles || ""}
                  onChange={(e) =>
                    setFieldValue("accountability_roles", e.target.value)
                  }
                  placeholder="Who is accountable for what?"
                  className={`rounded-xl ${errors.accountability_roles && touched.accountability_roles
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.accountability_roles &&
                  typeof errors.accountability_roles === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.accountability_roles}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Evidence: Upload accountability framework documentation</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleEvidenceFileChange("uk_accountability_evidence", file);
                    setFieldValue("accountability_framework_evidence", file ? file.name : "");
                  }}
                  className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 ${errors.accountability_framework_evidence && touched.accountability_framework_evidence
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.accountability_framework_evidence &&
                  typeof errors.accountability_framework_evidence === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.accountability_framework_evidence}
                    </p>
                  )}
                {evidenceContent.uk_accountability_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_accountability_evidence.length} chars)
                  </p>
                )}

              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Human oversight mechanisms</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.human_oversight
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.human_oversight ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.human_oversight}
                onChange={(v) => setFieldValue("human_oversight", v)}
              />
              {touched.human_oversight &&
                typeof errors.human_oversight === "string" && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.human_oversight}
                  </p>
                )}
            </div>
          </div>
          {values.human_oversight && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>Who provides oversight?</Label>
                <Input
                  value={values.human_oversight_who || ""}
                  onChange={(e) =>
                    setFieldValue("human_oversight_who", e.target.value)
                  }
                  placeholder="e.g. , Review team, senior management, domain experts"
                  className={`rounded-xl ${errors.human_oversight_who && touched.human_oversight_who
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.human_oversight_who &&
                  typeof errors.human_oversight_who === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.human_oversight_who}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>When does oversight occur?</Label>
                <Input
                  value={values.human_oversight_when || ""}
                  onChange={(e) =>
                    setFieldValue("human_oversight_when", e.target.value)
                  }
                  placeholder="e.g., Before deployment, for high-risk decisions, continuously"
                  className={`rounded-xl ${errors.human_oversight_when && touched.human_oversight_when
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.human_oversight_when &&
                  typeof errors.human_oversight_when === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.human_oversight_when}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>How is oversight implemented?</Label>
                <Textarea
                  value={values.human_oversight_how || ""}
                  onChange={(e) =>
                    setFieldValue("human_oversight_how", e.target.value)
                  }
                  placeholder="Describe oversight processes"
                  className={`rounded-xl ${errors.human_oversight_how && touched.human_oversight_how
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.human_oversight_how &&
                  typeof errors.human_oversight_how === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.human_oversight_how}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Evidence: Upload human oversight documentation or procedures</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleEvidenceFileChange("uk_human_oversight_evidence", file);
                    setFieldValue("human_oversight_evidence", file ? file.name : "");
                  }}
                  className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 ${errors.human_oversight_evidence && touched.human_oversight_evidence
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.human_oversight_evidence &&
                  typeof errors.human_oversight_evidence === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.human_oversight_evidence}
                    </p>
                  )}
                {evidenceContent.uk_human_oversight_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_human_oversight_evidence.length} chars)
                  </p>
                )}

              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Risk management processes</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.risk_management
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.risk_management ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.risk_management}
                onChange={(v) => setFieldValue("risk_management", v)}
              />
            </div>
          </div>
          {values.risk_management && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What processes are in place?</Label>
                <Textarea
                  value={values.risk_management_processes || ""}
                  onChange={(e) =>
                    setFieldValue("risk_management_processes", e.target.value)
                  }
                  placeholder="Describe your risk management approach"
                  className={`rounded-xl ${errors.risk_management_processes && touched.risk_management_processes
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.human_oversight_how &&
                  typeof errors.risk_management_processes === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.risk_management_processes}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Documentation</Label>
                <Textarea
                  value={values.risk_management_documentation || ""}
                  onChange={(e) =>
                    setFieldValue("risk_management_documentation", e.target.value)
                  }
                  placeholder="How are risks documented?"
                  className={`rounded-xl ${errors.risk_management_documentation && touched.risk_management_documentation
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.risk_management_documentation &&
                  typeof errors.risk_management_documentation === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.risk_management_documentation}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Evidence: Upload risk management documentation or risk assessments</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleEvidenceFileChange("uk_risk_management_evidence", file);
                    setFieldValue("risk_management_evidence", file ? file.name : "");
                  }}
                  className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 ${errors.risk_management_evidence && touched.risk_management_evidence
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.risk_management_evidence &&
                  typeof errors.risk_management_evidence === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.risk_management_evidence}
                    </p>
                  )}
                {evidenceContent.uk_risk_management_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_risk_management_evidence.length} chars)
                  </p>
                )}

              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Governance structure and roles</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.governance_structure
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.governance_structure ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.governance_structure}
                onChange={(v) => setFieldValue("governance_structure", v)}
              />
            </div>
          </div>
          {values.governance_structure && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>Board involvement</Label>
                <Textarea
                  value={values.governance_board_involvement || ""}
                  onChange={(e) =>
                    setFieldValue("governance_board_involvement", e.target.value)
                  }
                  placeholder="How is the board involved in AI governance?"
                  className={`rounded-xl ${errors.governance_board_involvement && touched.governance_board_involvement
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.governance_board_involvement &&
                  typeof errors.governance_board_involvement === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.governance_board_involvement}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Governance committees</Label>
                <Textarea
                  value={values.governance_committees || ""}
                  onChange={(e) =>
                    setFieldValue("governance_committees", e.target.value)
                  }
                  placeholder="What committees exist for AI governance?"
                  className={`rounded-xl ${errors.governance_committees && touched.governance_committees
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.governance_committees &&
                  typeof errors.governance_committees === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.governance_committees}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label className="text-base font-semibold flex-1">Audit trail and record-keeping</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.audit_trail
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.audit_trail ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.audit_trail}
                onChange={(v) => setFieldValue("audit_trail", v)}
              />
            </div>
          </div>
          {values.audit_trail && (
            <div className="ml-8 space-y-3">
              <div className="space-y-2">
                <Label>What is logged?</Label>
                <Textarea
                  value={values.audit_trail_what || ""}
                  onChange={(e) =>
                    setFieldValue("audit_trail_what", e.target.value)
                  }
                  placeholder="e.g., Decisions, inputs, model versions, user actions"
                  className={`rounded-xl ${errors.audit_trail_what && touched.audit_trail_what
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.audit_trail_what &&
                  typeof errors.audit_trail_what === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.audit_trail_what}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Retention period</Label>
                <Input
                  value={values.audit_trail_retention || ""}
                  onChange={(e) =>
                    setFieldValue("audit_trail_retention", e.target.value)
                  }
                  placeholder="e.g., 7 years, indefinitely"
                  className={`rounded-xl ${errors.audit_trail_retention && touched.audit_trail_retention
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.audit_trail_retention &&
                  typeof errors.audit_trail_retention === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.audit_trail_retention}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label>Who has access?</Label>
                <Input
                  value={values.audit_trail_access || ""}
                  onChange={(e) =>
                    setFieldValue("audit_trail_access", e.target.value)
                  }
                  placeholder="e.g., Compliance team, auditors, regulators"
                  className={`rounded-xl ${errors.audit_trail_access && touched.audit_trail_access
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.audit_trail_access &&
                  typeof errors.audit_trail_access === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.audit_trail_access}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Evidence: Upload audit trail documentation or sample logs</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleEvidenceFileChange("uk_audit_trail_evidence", file);
                    setFieldValue("audit_trail_evidence", file ? file.name : "");
                  }}
                  className={`file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 ${errors.audit_trail_evidence && touched.audit_trail_evidence
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
                />
                {touched.audit_trail_evidence &&
                  typeof errors.audit_trail_evidence === "string" && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.audit_trail_evidence}
                    </p>
                  )}
                {evidenceContent.uk_audit_trail_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_audit_trail_evidence.length} chars)
                  </p>
                )}
              </div>

            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Senior management oversight</Label>
          <Textarea
            value={values.senior_management_oversight || ""}
            onChange={(e) =>
              setFieldValue("senior_management_oversight", e.target.value)
            }
            placeholder="How does senior management oversee AI systems?"
            className={`rounded-xl ${errors.senior_management_oversight && touched.senior_management_oversight
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.senior_management_oversight &&
            typeof errors.senior_management_oversight === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.senior_management_oversight}
              </p>
            )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 rounded-xl border transition-colors bg-slate-50 border-slate-200 hover:bg-slate-100">
            <Label>Do you have an ethics committee?</Label>
            <div className="ml-4 flex items-center gap-2">
              <span className={`text-xs font-bold px-2 py-1 rounded ${values.ethics_committee
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
                }`}>
                {values.ethics_committee ? "YES" : "NO"}
              </span>
              <ToggleSwitchInline
                checked={values.ethics_committee}
                onChange={(v) => setFieldValue("ethics_committee", v)}
              />
            </div>
          </div>
          {values.ethics_committee && (
            <div className="ml-8 mt-3">
              <Textarea
                value={values.ethics_committee_details || ""}
                onChange={(e) =>
                  setFieldValue("ethics_committee_details", e.target.value)
                }
                placeholder="Describe your ethics committee structure and role"
                className={`rounded-xl ${errors.ethics_committee_details && touched.ethics_committee_details
                  ? "border-red-500 focus:ring-red-500"
                  : ""
                  }`}
              />
              {touched.ethics_committee_details &&
                typeof errors.ethics_committee_details === "string" && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.ethics_committee_details}
                  </p>
                )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Policy assignment and review frequency</Label>
          <Textarea
            value={values.policy_assignment || ""}
            onChange={(e) =>
              setFieldValue("policy_assignment", e.target.value)
            }
            placeholder="Who is assigned to policies and how often are they reviewed?"
            className={`rounded-xl ${errors.policy_assignment && touched.policy_assignment
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.policy_assignment &&
            typeof errors.policy_assignment === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.policy_assignment}
              </p>
            )}
        </div>

        <div className="space-y-2">
          <Label>Training requirements</Label>
          <Textarea
            value={values.training_requirements || ""}
            onChange={(e) =>
              setFieldValue("training_requirements", e.target.value)
            }
            placeholder="What training is required for staff working with AI systems?"
            className={`rounded-xl ${errors.policy_assignment && touched.policy_assignment
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.training_requirements &&
            typeof errors.training_requirements === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.training_requirements}
              </p>
            )}
        </div>

        <div className="space-y-2">
          <Label>Escalation procedures</Label>
          <Textarea
            value={values.escalation_procedures || ""}
            onChange={(e) =>
              setFieldValue("escalation_procedures", e.target.value)
            }
            placeholder="How are AI-related issues escalated?"
            className={`rounded-xl ${errors.escalation_procedures && touched.escalation_procedures
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.escalation_procedures &&
            typeof errors.escalation_procedures === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.escalation_procedures}
              </p>
            )}
        </div>

        <div className="space-y-2">
          <Label>Who is accountable for this AI system? (Name, role, or department) *</Label>
          <Input
            value={values.accountable_person || ""}
            onChange={(e) =>
              setFieldValue("accountable_person", e.target.value)
            }
            placeholder="e.g., Jane Doe - Head of AI Ethics, or Compliance Department"
            className={`rounded-xl ${errors.accountable_person && touched.accountable_person
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.accountable_person &&
            typeof errors.accountable_person === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.accountable_person}
              </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}