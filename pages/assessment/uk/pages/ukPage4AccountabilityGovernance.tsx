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
  
  export default function UkPage4AccountabilityGovernance({
    ukCurrentPage,
    handleEvidenceFileChange,
    evidenceContent,
  }: Props) {
    const { values, setFieldValue } = useFormikContext<any>();
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
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex-1">Clear accountability framework</Label>
              <div className="ml-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  values.accountability_framework 
                    ? "text-emerald-900 bg-emerald-300" 
                    : "text-slate-400 bg-slate-700"
                }`}>
                  {values.accountability_framework ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.accountability_framework}
                  onClick={() =>
                    setFieldValue(
                      "accountability_framework",
                      !values.accountability_framework
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                    values.accountability_framework ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                  style={{ backgroundColor: values.accountability_framework ? '#10b981' : '#9ca3af' }}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    values.accountability_framework ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
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
                    placeholder="Describe your accountability framework"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Accountability roles</Label>
                  <Textarea
                    value={values.accountability_roles || ""}
                    onChange={(e) =>
                        setFieldValue("accountability_roles", e.target.value)
                      }
                    placeholder="Who is accountable for what?"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Evidence: Upload accountability framework documentation</Label>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleEvidenceFileChange("uk_accountability_evidence", file || null);
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                  />
                  {evidenceContent.uk_accountability_evidence && (
                    <p className="text-xs text-emerald-400 mt-1">
                      ✓ File processed ({evidenceContent.uk_accountability_evidence.length} characters extracted via OCR)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
  
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex-1">Human oversight mechanisms</Label>
              <div className="ml-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  values.human_oversight 
                    ? "text-emerald-900 bg-emerald-300" 
                    : "text-slate-400 bg-slate-700"
                }`}>
                  {values.human_oversight ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.human_oversight}
                  onClick={() =>
                    setFieldValue(
                      "human_oversight",
                      !values.human_oversight
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                    values.human_oversight ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                  style={{ backgroundColor: values.human_oversight ? '#10b981' : '#9ca3af' }}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    values.human_oversight ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
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
                    placeholder="e.g., Review team, senior management, domain experts"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>When does oversight occur?</Label>
                  <Input
                    value={values.human_oversight_when || ""}
                    onChange={(e) =>
                        setFieldValue("human_oversight_when", e.target.value)
                      }
                    placeholder="e.g., Before deployment, for high-risk decisions, continuously"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>How is oversight implemented?</Label>
                  <Textarea
                    value={values.human_oversight_how || ""}
                    onChange={(e) =>
                        setFieldValue("human_oversight_how", e.target.value)
                      }
                    placeholder="Describe oversight processes"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Evidence: Upload human oversight documentation or procedures</Label>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleEvidenceFileChange("uk_human_oversight_evidence", file || null);
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                  />
                  {evidenceContent.uk_human_oversight_evidence && (
                    <p className="text-xs text-emerald-400 mt-1">
                      ✓ File processed ({evidenceContent.uk_human_oversight_evidence.length} characters extracted via OCR)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
  
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex-1">Risk management processes</Label>
              <div className="ml-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  values.risk_management 
                    ? "text-emerald-900 bg-emerald-300" 
                    : "text-slate-400 bg-slate-700"
                }`}>
                  {values.risk_management ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.risk_management}
                  onClick={() =>
                    setFieldValue(
                      "risk_management",
                      !values.risk_management
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                    values.risk_management ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                  style={{ backgroundColor: values.risk_management ? '#10b981' : '#9ca3af' }}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    values.risk_management ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
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
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Documentation</Label>
                  <Textarea
                    value={values.risk_management_documentation || ""}
                    onChange={(e) =>
                        setFieldValue("risk_management_documentation", e.target.value)
                      } 
                    placeholder="How are risks documented?"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Evidence: Upload risk management documentation or risk assessments</Label>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleEvidenceFileChange("uk_risk_management_evidence", file || null);
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                  />
                  {evidenceContent.uk_risk_management_evidence && (
                    <p className="text-xs text-emerald-400 mt-1">
                      ✓ File processed ({evidenceContent.uk_risk_management_evidence.length} characters extracted via OCR)
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
  
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex-1">Governance structure and roles</Label>
              <div className="ml-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  values.governance_structure 
                    ? "text-emerald-900 bg-emerald-300" 
                    : "text-slate-400 bg-slate-700"
                }`}>
                  {values.governance_structure ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.governance_structure}
                  onClick={() =>
                    setFieldValue(
                      "governance_structure",
                      !values.governance_structure
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                    values.governance_structure ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                  style={{ backgroundColor: values.governance_structure ? '#10b981' : '#9ca3af' }}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    values.governance_structure ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
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
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Governance committees</Label>
                  <Textarea
                    value={values.governance_committees || ""}
                    onChange={(e) =>
                        setFieldValue("governance_committees", e.target.value)
                      } 
                    placeholder="What committees exist for AI governance?"
                    className="rounded-xl"
                  />
                </div>
              </div>
            )}
          </div>
  
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex-1">Audit trail and record-keeping</Label>
              <div className="ml-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  values.audit_trail 
                    ? "text-emerald-900 bg-emerald-300" 
                    : "text-slate-400 bg-slate-700"
                }`}>
                  {values.audit_trail ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.audit_trail}
                  onClick={() =>
                    setFieldValue(
                      "audit_trail",
                      !values.audit_trail
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                    values.audit_trail ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                  style={{ backgroundColor: values.audit_trail ? '#10b981' : '#9ca3af' }}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    values.audit_trail ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
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
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Retention period</Label>
                  <Input
                    value={values.audit_trail_retention || ""}
                    onChange={(e) =>
                        setFieldValue("audit_trail_retention", e.target.value)
                      } 
                    placeholder="e.g., 7 years, indefinitely"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Who has access?</Label>
                  <Input
                    value={values.audit_trail_access || ""}
                    onChange={(e) =>
                        setFieldValue("audit_trail_access", e.target.value)
                      } 
                    placeholder="e.g., Compliance team, auditors, regulators"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Evidence: Upload audit trail documentation or sample logs</Label>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleEvidenceFileChange("uk_audit_trail_evidence", file || null);
                    }}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                  />
                  {evidenceContent.uk_audit_trail_evidence && (
                    <p className="text-xs text-emerald-400 mt-1">
                      ✓ File processed ({evidenceContent.uk_audit_trail_evidence.length} characters extracted via OCR)
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
              className="rounded-xl"
            />
          </div>
  
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Do you have an ethics committee?</Label>
              <div className="ml-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  values.ethics_committee 
                    ? "text-emerald-900 bg-emerald-300" 
                    : "text-slate-400 bg-slate-700"
                }`}>
                  {values.ethics_committee ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.ethics_committee}
                  onClick={() =>
                    setFieldValue(
                      "ethics_committee",
                      !values.ethics_committee
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                    values.ethics_committee ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                  style={{ backgroundColor: values.ethics_committee ? '#10b981' : '#9ca3af' }}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    values.ethics_committee ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
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
                  className="rounded-xl"
                />
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
              className="rounded-xl"
            />
          </div>
  
          <div className="space-y-2">
            <Label>Training requirements</Label>
            <Textarea
              value={values.training_requirements || ""}
              onChange={(e) =>
                setFieldValue("training_requirements", e.target.value)
              } 
              placeholder="What training is required for staff working with AI systems?"
              className="rounded-xl"
            />
          </div>
  
          <div className="space-y-2">
            <Label>Escalation procedures</Label>
            <Textarea
              value={values.escalation_procedures || ""}
              onChange={(e) =>
                setFieldValue("escalation_procedures", e.target.value)
              } 
              placeholder="How are AI-related issues escalated?"
              className="rounded-xl"
            />
          </div>
  
          <div className="space-y-2">
            <Label>Who is accountable for this AI system? (Name, role, or department) *</Label>
            <Input
              value={values.accountable_person || ""}
              onChange={(e) =>
                setFieldValue("accountable_person", e.target.value)
              } 
              placeholder="e.g., Jane Doe - Head of AI Ethics, or Compliance Department"
              required
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>
    );
  }  








   