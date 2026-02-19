import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormikContext } from "formik";
import { Button } from "@/components/ui/button";

type Props = {
  masCurrentPage: number;
  assessmentMode: 'rapid' | 'comprehensive';
  setAssessmentMode: (mode: 'rapid' | 'comprehensive') => void;
};

export default function MasPage1SystemProfile({ masCurrentPage, assessmentMode, setAssessmentMode }: Props) {
  const {
    values,
    setFieldValue,
    errors,
    touched,
  } = useFormikContext<any>();

  if (masCurrentPage !== 0) return null;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-foreground">
          System Profile & Company Information
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Tell us about your AI system and company - basic information to get started
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Assessment Mode Selector */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900">Assessment Mode</h4>
            <p className="text-xs text-blue-700">Quick Scan gives a fast high-level check. Deep Review covers full controls, evidence, and governance depth.</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={assessmentMode === 'rapid' ? 'default' : 'outline'}
              className={assessmentMode === 'rapid' ? 'bg-blue-600' : ''}
              onClick={() => setAssessmentMode('rapid')}
            >
              Quick Scan
            </Button>
            <Button
              type="button"
              variant={assessmentMode === 'comprehensive' ? 'default' : 'outline'}
              className={assessmentMode === 'comprehensive' ? 'bg-blue-600' : ''}
              onClick={() => setAssessmentMode('comprehensive')}
            >
              Deep Review
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-foreground">System name *</Label>
            <Input
              value={values.system_name}
              onChange={(e) => setFieldValue("system_name", e.target.value)}
              placeholder="e.g., Fraud Detection Engine, Customer Chatbot"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Give your AI system a clear, descriptive name
            </p>
            {touched.system_name && typeof errors.system_name === "string" && (
              <p className="text-sm text-red-500">
                {errors.system_name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Owner / Team</Label>
            <Input
              value={values.owner}
              onChange={(e) => setFieldValue("owner", e.target.value)}
              placeholder="e.g., Risk Operations, Product Team"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Who is responsible for this system?
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Jurisdiction(s)</Label>
            <Input
              value={values.jurisdiction}
              onChange={(e) => setFieldValue("jurisdiction", e.target.value)}
              placeholder="e.g., Singapore, UK, Global"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Where does this system operate?
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Sector / Industry</Label>
            <Input
              value={values.sector}
              onChange={(e) => setFieldValue("sector", e.target.value)}
              placeholder="e.g., Finance, Healthcare, Retail"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              What industry does this system serve?
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">System Status</Label>
            <Select
              value={values.system_status}
              onValueChange={(v) => setFieldValue("system_status", v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>

              <SelectContent className="!bg-white !border-2 !border-gray-200 !text-gray-900 z-50 shadow-xl">
                <SelectItem value="envision">Envision - Planning</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="deprecated">Deprecated</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Current stage of your AI system
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Business Purpose / Use Case</Label>
            <Input
              value={values.business_use_case}
              onChange={(e) => setFieldValue("business_use_case", e.target.value)}
              placeholder="e.g., Automated credit scoring, Customer support"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              What problem does this system solve?
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-foreground">System Description *</Label>
            <Textarea
              value={values.description}
              onChange={(e) => setFieldValue("description", e.target.value)}
              placeholder="Provide a brief description of what your AI system does..."
              className="min-h-[100px] rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Describe your AI system in 2–3 sentences
            </p>
            {touched.description && typeof errors.description === "string" && (
              <p className="text-sm text-red-500">
                {errors.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
