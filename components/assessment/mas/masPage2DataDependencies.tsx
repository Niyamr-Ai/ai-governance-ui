import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleSwitchInline } from "@/components/ui/toggle-switch";
import { useFormikContext } from "formik";

type Props = {
  masCurrentPage: number;
};

export default function MasPage2DataDependencies({
  masCurrentPage,
}: Props) {
  let formikContext;
  try {
    formikContext = useFormikContext<any>();
  } catch (error) {
    return null;
  }
  
  if (!formikContext) return null;
  
  const { values, setFieldValue, errors, touched } = formikContext;
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
            className={`rounded-xl ${errors.data_types && touched.data_types
              ? "border-red-500 focus:ring-red-500"
              : ""
              }`}
          />
          {touched.data_types &&
            typeof errors.data_types === "string" && (
              <p className="text-xs text-red-500 mt-1">
                {errors.data_types}
              </p>
            )}
        </div>
        <div className="space-y-4 pt-2">
          {/* Personal Data Question with Sub-questions */}
          <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-medium text-foreground">Does your system process personal data?</Label>
                <p className="text-sm text-muted-foreground">Personal data includes names, emails, IDs, or any information that identifies individuals</p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${values.uses_personal_data
                  ? "text-emerald-700 bg-emerald-100"
                  : "text-slate-500 bg-slate-200"
                  }`}>
                  {values.uses_personal_data ? "YES" : "NO"}
                </span>
                <ToggleSwitchInline
                  checked={values.uses_personal_data}
                  onChange={(v) => setFieldValue("uses_personal_data", v)}
                />
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
                  <Label className="text-sm font-medium text-foreground">Where is this personal data logged or stored? *</Label>
                  <Textarea
                    value={values.personal_data_logged_where || ""}
                    onChange={(e) => setFieldValue("personal_data_logged_where", e.target.value)}
                    placeholder="e.g., Database servers (PostgreSQL), cloud storage (AWS S3), application logs, audit trails, etc."
                    className={`rounded-xl ${errors.personal_data_logged_where && touched.personal_data_logged_where
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                      }`}
                  />
                  {touched.personal_data_logged_where &&
                    typeof errors.personal_data_logged_where === "string" && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.personal_data_logged_where}
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Personal Data Registry: Which use cases use which personal data?</Label>
                  <Textarea
                    value={values.personal_data_use_cases || ""}
                    onChange={(e) => setFieldValue("personal_data_use_cases", e.target.value)}
                  placeholder="e.g., Use Case 1 (Resume Screening): Uses names, emails, phone numbers. Use Case 2 (Credit Scoring): Uses IDs, financial records."
                  className={`rounded-xl ${errors.personal_data_use_cases && touched.personal_data_use_cases
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
          />
                  {touched.personal_data_use_cases &&
                    typeof errors.personal_data_use_cases === "string" && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.personal_data_use_cases}
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Sensitive Data Question with Sub-questions */}
          <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-medium text-foreground">Does your system process sensitive or special category data?</Label>
                <p className="text-sm text-muted-foreground">Sensitive data includes health records, financial info, biometrics, race, religion, etc.</p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${values.uses_special_category_data
                  ? "text-emerald-700 bg-emerald-100"
                  : "text-slate-500 bg-slate-200"
                  }`}>
                  {values.uses_special_category_data ? "YES" : "NO"}
                </span>
                <ToggleSwitchInline
                  checked={values.uses_special_category_data}
                  onChange={(v) => setFieldValue("uses_special_category_data", v)}
                />
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
                  className={`rounded-xl ${errors.sensitive_data_types && touched.sensitive_data_types
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
          />
                  {touched.sensitive_data_types &&
                    typeof errors.sensitive_data_types === "string" && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.sensitive_data_types}
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Where is sensitive data logged or stored? *</Label>
                  <Textarea
                    value={values.sensitive_data_logged_where || ""}
                    onChange={(e) => setFieldValue("sensitive_data_logged_where", e.target.value)}

                  placeholder="e.g., Encrypted database, secure cloud storage with access controls, etc."
                  className={`rounded-xl ${errors.sensitive_data_logged_where && touched.sensitive_data_logged_where
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
          />
                  {touched.sensitive_data_logged_where &&
                    typeof errors.sensitive_data_logged_where === "string" && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.sensitive_data_logged_where}
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Third-Party AI Services Question with Sub-questions */}
          <div className="space-y-3 border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <Label className="text-base font-medium text-foreground">Does your system use third-party AI services?</Label>
                <p className="text-sm text-muted-foreground">External AI APIs, cloud AI services, or pre-built AI models from vendors</p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${values.uses_third_party_ai
                  ? "text-emerald-700 bg-emerald-100"
                  : "text-slate-500 bg-slate-200"
                  }`}>
                  {values.uses_third_party_ai ? "YES" : "NO"}
                </span>
                <ToggleSwitchInline
                  checked={values.uses_third_party_ai}
                  onChange={(v) => setFieldValue("uses_third_party_ai", v)}
                />
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
                  className={`rounded-xl ${errors.third_party_services_list && touched.third_party_services_list
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
          />
                  {touched.third_party_services_list &&
                    typeof errors.third_party_services_list === "string" && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.third_party_services_list}
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Are these third-party services safe? What are they doing with your data? *</Label>
                  <Textarea
                    value={values.third_party_services_safety || ""}
                    onChange={(e) => setFieldValue("third_party_services_safety", e.target.value)}
placeholder="Describe: Data privacy policies, data retention, data sharing practices, security measures, compliance certifications (SOC 2, ISO 27001), etc."
                  className={`rounded-xl ${errors.third_party_services_safety && touched.third_party_services_safety
                    ? "border-red-500 focus:ring-red-500"
                    : ""
                    }`}
          />
                  {touched.third_party_services_safety &&
                    typeof errors.third_party_services_safety === "string" && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.third_party_services_safety}
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
