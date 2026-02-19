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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button"; // Added missing import
import { useFormikContext } from "formik";


type Props = {
  ukCurrentPage: number;
  assessmentMode?: 'rapid' | 'comprehensive';
  setAssessmentMode?: (mode: 'rapid' | 'comprehensive') => void;
};

export default function UkPage0SystemProfile({
  ukCurrentPage,
  assessmentMode = 'comprehensive',
  setAssessmentMode = () => { }
}: Props) {
  const {
    values,
    setFieldValue,
    errors,
    touched,
  } = useFormikContext<any>();

  if (ukCurrentPage !== 0) return null;

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
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h4 className="font-semibold text-purple-900">Assessment Mode</h4>
            <p className="text-xs text-purple-700">Quick Scan gives a fast high-level check. Deep Review covers full controls, evidence, and governance depth.</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={assessmentMode === 'rapid' ? 'default' : 'outline'}
              className={assessmentMode === 'rapid' ? 'bg-purple-600' : ''}
              onClick={() => setAssessmentMode('rapid')}
            >
              Quick Scan
            </Button>
            <Button
              type="button"
              variant={assessmentMode === 'comprehensive' ? 'default' : 'outline'}
              className={assessmentMode === 'comprehensive' ? 'bg-purple-600' : ''}
              onClick={() => setAssessmentMode('comprehensive')}
            >
              Deep Review
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* System Name */}
          <div className="space-y-2">
            <Label className="text-foreground">System name *</Label>
            <Input
              value={values.system_name}
              onChange={(e) =>
                setFieldValue("system_name", e.target.value)
              }
              placeholder="e.g., Fraud Detection Engine, Customer Chatbot"
              className="rounded-xl"
            />
            {touched.system_name && typeof errors.system_name === "string" && (
              <p className="text-sm text-red-500">
                {errors.system_name}
              </p>
            )}
          </div>

          {/* Owner */}
          <div className="space-y-2">
            <Label className="text-foreground">Owner / Team</Label>
            <Input
              value={values.owner}
              onChange={(e) =>
                setFieldValue("owner", e.target.value)
              }
              placeholder="e.g., Risk Operations, Product Team"
              className="rounded-xl"
            />
          </div>

          {/* Jurisdiction */}
          <div className="space-y-2">
            <Label className="text-foreground">Jurisdiction(s)</Label>
            <Input
              value={values.jurisdiction}
              onChange={(e) =>
                setFieldValue("jurisdiction", e.target.value)
              }
              placeholder="e.g., UK, EU, Global"
              className="rounded-xl"
            />
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <Label className="text-foreground">Sector / Industry *</Label>
            <Select
              value={values.sector}
              onValueChange={(v) =>
                setFieldValue("sector", v)
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-xl z-50">
                <SelectItem value="finance">Finance (FCA regulated)</SelectItem>
                <SelectItem value="healthcare">Healthcare (MHRA regulated)</SelectItem>
                <SelectItem value="telecoms">Telecommunications (Ofcom regulated)</SelectItem>
                <SelectItem value="competition">Competition / Markets (CMA regulated)</SelectItem>
                <SelectItem value="data_privacy">Data Privacy (ICO regulated)</SelectItem>
                <SelectItem value="other">Other sector</SelectItem>
              </SelectContent>
            </Select>
            {touched.sector && typeof errors.sector === "string" && (
              <p className="text-sm text-red-500">
                {errors.sector}
              </p>
            )}
          </div>

          {/* System Status */}
          <div className="space-y-2">
            <Label className="text-foreground">System Status</Label>
            <Select
              value={values.system_status}
              onValueChange={(v) =>
                setFieldValue("system_status", v)
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-xl z-50">
                <SelectItem value="envision">
                  Envision – Planning and resource allocation
                </SelectItem>
                <SelectItem value="development">
                  Development – Still being built
                </SelectItem>
                <SelectItem value="staging">
                  Staging – Testing before launch
                </SelectItem>
                <SelectItem value="production">
                  Production – Live and in use
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Business Use Case */}
          <div className="space-y-2">
            <Label className="text-foreground">Business Purpose / Use Case</Label>
            <Input
              value={values.business_use_case}
              onChange={(e) =>
                setFieldValue("business_use_case", e.target.value)
              }
              placeholder="e.g., Automated credit scoring, Customer support"
              className="rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-foreground">System Description *</Label>
            <Textarea
              value={values.description}
              onChange={(e) =>
                setFieldValue("description", e.target.value)
              }
              placeholder="Provide a brief description of what your AI system does, how it works, and its main purpose..."
              className="min-h-[100px] rounded-xl"
            />
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
