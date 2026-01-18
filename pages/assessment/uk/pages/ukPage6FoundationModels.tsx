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
  import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
  } from "@/components/ui/select";
  import { useFormikContext } from "formik";
  
  type Props = {
    ukCurrentPage: number;
    handleEvidenceFileChange: (key: string, file: File | null) => void;
    evidenceContent: Record<string, string>;
  };
  
  export default function UkPage6FoundationModels({
    ukCurrentPage,
    handleEvidenceFileChange,
    evidenceContent,
  }: Props) {
    const { values, setFieldValue } = useFormikContext<any>();
    if (ukCurrentPage !== 6) return null;
  
    return (
        <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-foreground">Foundation Models & High-Impact Systems</CardTitle>
          <CardDescription className="text-muted-foreground">
            Additional requirements for foundation models and high-impact AI systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Is your system a foundation model or high-impact AI system?</Label>
            <Select
              value={values.foundation_model || "no"}
              onValueChange={(v) =>
                setFieldValue("foundation_model", v)
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="!bg-white !border-2 !border-gray-200 !text-gray-900 z-50 shadow-xl">
                <SelectItem value="yes" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Yes, it's a foundation model or high-impact system</SelectItem>
                <SelectItem value="no" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>No</SelectItem>
                <SelectItem value="unsure" className="!bg-white !text-gray-900 hover:!bg-gray-100 focus:!bg-gray-100 cursor-pointer py-2" style={{ backgroundColor: '#ffffff', color: '#111827' }}>Unsure</SelectItem>
              </SelectContent>
            </Select>
          </div>
  
          {(values.foundation_model === "yes" || values.foundation_model === "unsure") && (
            <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Model cards and documentation</Label>
                    <div className="ml-4 flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        values.foundation_model_cards 
                          ? "text-emerald-900 bg-emerald-300" 
                          : "text-slate-400 bg-slate-700"
                      }`}>
                        {values.foundation_model_cards ? "YES" : "NO"}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={values.foundation_model_cards}
                        onClick={() =>
                            setFieldValue(
                              "foundation_model_cards",
                              !values.foundation_model_cards
                            )
                          }
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                          values.foundation_model_cards ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                        }`}
                        style={{ backgroundColor: values.foundation_model_cards ? '#10b981' : '#9ca3af' }}
                      >
                        <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                          values.foundation_model_cards ? "translate-x-5" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  </div>
                {values.foundation_model_cards && (
                  <div className="ml-8 mt-3">
                    <Textarea
                      value={values.foundation_model_documentation || ""}
                      onChange={(e) =>
                        setFieldValue("foundation_model_documentation", e.target.value)
                      }
                      placeholder="Describe your model card documentation"
                      className="rounded-xl"
                    />
                  </div>
                )}
              </div>
  
              <div className="space-y-2">
                <Label>Capability testing</Label>
                <Textarea
                  value={values.foundation_model_capability_testing || ""}
                  onChange={(e) =>
                    setFieldValue("foundation_model_capability_testing", e.target.value)
                  }
                  placeholder="What capability testing have you conducted?"
                  className="rounded-xl"
                />
              </div>
  
              <div className="space-y-2">
                <Label>Risk assessment specifics</Label>
                <Textarea
                  value={values.foundation_model_risk_assessment || ""}
                  onChange={(e) =>
                    setFieldValue("foundation_model_risk_assessment", e.target.value)
                  }
                  placeholder="Describe risk assessment for foundation/high-impact systems"
                  className="rounded-xl"
                />
              </div>
  
              <div className="space-y-2">
                <Label>Deployment restrictions</Label>
                <Textarea
                  value={values.foundation_model_deployment_restrictions || ""}
                  onChange={(e) =>
                    setFieldValue("foundation_model_deployment_restrictions", e.target.value)
                  }
                  placeholder="Are there any deployment restrictions?"
                  className="rounded-xl"
                />
              </div>
  
              <div className="space-y-2">
                <Label>Monitoring requirements</Label>
                <Textarea
                  value={values.foundation_model_monitoring || ""}
                  onChange={(e) =>
                    setFieldValue("foundation_model_monitoring", e.target.value)
                  }
                  placeholder="What monitoring is in place for foundation/high-impact systems?"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Evidence: Upload foundation model documentation, model cards, or capability assessments</Label>
                <Input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleEvidenceFileChange("uk_foundation_model_evidence", file || null);
                  }}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600"
                />
                {evidenceContent.uk_foundation_model_evidence && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ File processed ({evidenceContent.uk_foundation_model_evidence.length} characters extracted via OCR)
                  </p>
                )}
              </div>
            </div>
          )}
  
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Regulatory sandbox participation</Label>
              <div className="ml-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  values.regulatory_sandbox 
                    ? "text-emerald-900 bg-emerald-300" 
                    : "text-slate-400 bg-slate-700"
                }`}>
                  {values.regulatory_sandbox ? "YES" : "NO"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.regulatory_sandbox}
                  onClick={() =>
                    setFieldValue(
                      "regulatory_sandbox",
                      !values.regulatory_sandbox
                    )
                  }
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                    values.regulatory_sandbox ? "bg-emerald-600 border-emerald-500" : "bg-gray-400 border-gray-500"
                  }`}
                  style={{ backgroundColor: values.regulatory_sandbox ? '#10b981' : '#9ca3af' }}
                >
                  <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    values.regulatory_sandbox ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
            {values.regulatory_sandbox && (
              <div className="ml-8 mt-3">
                <Textarea
                  value={values.regulatory_sandbox_details || ""}
                  onChange={(e) =>
                    setFieldValue("regulatory_sandbox_details", e.target.value)
                  }
                  placeholder="Describe your regulatory sandbox participation"
                  className="rounded-xl"
                />
              </div>
            )}
          </div>
  
          <div className="space-y-2">
            <Label>Sector-specific requirements</Label>
            <Textarea
              value={values.sector_specific_requirements || ""}
              onChange={(e) =>
                setFieldValue("sector_specific_requirements", e.target.value)
              } 
              placeholder="Are there any sector-specific requirements (FCA, MHRA, Ofcom, etc.) that apply?"
              className="rounded-xl"
            />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  






    