import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormikContext } from "formik";

type Props = {
  masCurrentPage: number;
};

export default function MasPage2DataDependencies({
  masCurrentPage,
}: Props) {
  const { values, setFieldValue } = useFormikContext<any>();
  if (masCurrentPage !== 1) return null;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-foreground">Data & Dependencies</CardTitle>
        <CardDescription className="text-muted-foreground">
          What data does your system use, and does it rely on external AI services?
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">What types of data does your system use?</Label>
                      <Textarea
                        value={values.data_types}
                        onChange={(e) => setFieldValue("data_types", e.target.value)}
                        placeholder="e.g., Transaction logs, customer chat transcripts, financial records, images, text documents"
                        className="min-h-[80px] rounded-xl"
                      />
                      <p className="text-xs text-muted-foreground">List the main types of data your AI system processes</p>
                    </div>
                    <div className="space-y-4 pt-2">
                      {/* Personal Data Question with Sub-questions */}
                      <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Does your system process personal data?</Label>
                          <p className="text-sm text-muted-foreground">Personal data includes names, emails, IDs, or any information that identifies individuals</p>
                        </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              values.uses_personal_data 
                                ? "text-blue-500 bg-emerald-300" 
                                : "text-red-500 bg-blue-400"
                            }`}>
                              {values.uses_personal_data ? "YES" : "NO"}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={values.uses_personal_data}
                              onClick={() => setFieldValue("uses_personal_data", !values.uses_personal_data)}
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                values.uses_personal_data 
                                  ? "text-blue-500 bg-emerald-300" 
                                : "text-red-500 bg-blue-400"
                              }`}
                              style={{
                                backgroundColor: values.uses_personal_data ? '#10b981' : '#9ca3af',
                              }}
                            >
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                  values.uses_personal_data ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                      </div>
                        </div>
                        {values.uses_personal_data && (
                          <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">What kind of personal data are you using? *</Label>
                              <Textarea
                                value={values.personal_data_types || ""}
                                onChange={(e) => setFieldValue("personal_data_types", e.target.value)}
                                placeholder="e.g., Names, email addresses, phone numbers, national IDs, customer IDs, usernames, IP addresses, etc."
                                className="min-h-[80px] rounded-xl"
                                required={values.uses_personal_data}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Where is this personal data logged or stored? *</Label>
                              <Textarea
                                value={values.personal_data_logged_where || ""}
                                onChange={(e) => setFieldValue("personal_data_logged_where", e.target.value)}
                                placeholder="e.g., Database servers (PostgreSQL), cloud storage (AWS S3), application logs, audit trails, etc."
                                className="min-h-[80px] rounded-xl"
                                required={values.uses_personal_data}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Personal Data Registry: Which use cases use which personal data?</Label>
                              <Textarea
                                value={values.personal_data_use_cases || ""}
                                onChange={(e) => setFieldValue("personal_data_use_cases", e.target.value)}
                                placeholder="e.g., Use Case 1 (Resume Screening): Uses names, emails, phone numbers. Use Case 2 (Credit Scoring): Uses IDs, financial records."
                                className="min-h-[100px] rounded-xl"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sensitive Data Question with Sub-questions */}
                      <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Does your system process sensitive or special category data?</Label>
                          <p className="text-sm text-muted-foreground">Sensitive data includes health records, financial info, biometrics, race, religion, etc.</p>
                        </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              values.uses_special_category_data 
                                ? "text-blue-500 bg-emerald-300" 
                                : "text-red-500 bg-blue-400"
                            }`}>
                              {values.uses_special_category_data ? "YES" : "NO"}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={values.uses_special_category_data}
                              onClick={() => setFieldValue("uses_special_category_data", !values.uses_special_category_data)}
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                values.uses_special_category_data 
                                  ? "text-blue-500 bg-emerald-300" 
                                : "text-red-500 bg-blue-400"
                              }`}
                              style={{
                                backgroundColor: values.uses_special_category_data ? '#10b981' : '#9ca3af',
                              }}
                            >
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                  values.uses_special_category_data ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                      </div>
                        </div>
                        {values.uses_special_category_data && (
                          <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">What specific sensitive data types are you processing? *</Label>
                              <Textarea
                                value={values.sensitive_data_types || ""}
                                onChange={(e) => setFieldValue("sensitive_data_types", e.target.value)}
                                placeholder="Specify: Health records, financial information, biometric data (fingerprints, face recognition), race/ethnicity, religion, sexual orientation, political opinions, etc."
                                className="min-h-[80px] rounded-xl"
                                required={values.uses_special_category_data}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Where is sensitive data logged or stored? *</Label>
                              <Textarea
                                value={values.sensitive_data_logged_where || ""}
                                onChange={(e) => setFieldValue("sensitive_data_logged_where", e.target.value)}
                                placeholder="e.g., Encrypted database, secure cloud storage with access controls, etc."
                                className="min-h-[80px] rounded-xl"
                                required={values.uses_special_category_data}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Third-Party AI Services Question with Sub-questions */}
                      <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5 flex-1">
                          <Label className="text-base font-medium text-foreground">Does your system use third-party AI services?</Label>
                          <p className="text-sm text-muted-foreground">External AI APIs, cloud AI services, or pre-built AI models from vendors</p>
                        </div>
                          <div className="ml-4 flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              values.uses_third_party_ai 
                                ? "text-blue-500 bg-emerald-300" 
                                : "text-red-500 bg-blue-400"
                            }`}>
                              {values.uses_third_party_ai ? "YES" : "NO"}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={values.uses_third_party_ai}
                              onClick={() => setFieldValue("uses_third_party_ai", !values.uses_third_party_ai)}
                              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                values.uses_third_party_ai 
                                  ? "text-blue-500 bg-emerald-300" 
                                : "text-red-500 bg-blue-400"
                              }`}
                              style={{
                                backgroundColor: values.uses_third_party_ai ? '#10b981' : '#9ca3af',
                              }}
                            >
                              <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                                  values.uses_third_party_ai ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        {values.uses_third_party_ai && (
                          <div className="ml-4 space-y-3 mt-3 pl-4 border-l-2 border-emerald-500">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">What third-party AI services are you using? *</Label>
                              <Textarea
                                value={values.third_party_services_list || ""}
                                onChange={(e) => setFieldValue("third_party_services_list", e.target.value)}
                                placeholder="List each service: e.g., OpenAI ChatGPT API, Google Cloud AI, AWS Comprehend, Azure Cognitive Services, Anthropic Claude, etc."
                                className="min-h-[100px] rounded-xl"
                                required={values.uses_third_party_ai}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">Are these third-party services safe? What are they doing with your data? *</Label>
                              <Textarea
                                value={values.third_party_services_safety || ""}
                                onChange={(e) => setFieldValue("third_party_services_safety", e.target.value)}
                                placeholder="Describe: Data privacy policies, data retention, data sharing practices, security measures, compliance certifications (SOC 2, ISO 27001), etc."
                                className="min-h-[100px] rounded-xl"
                                required={values.uses_third_party_ai}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
      </CardContent>
    </Card>
  );
}