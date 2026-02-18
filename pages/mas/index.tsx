"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Head from 'next/head';

type BoolKey =
  | "uses_personal_data"
  | "uses_special_category_data"
  | "uses_third_party_ai"
  | "governance_policy"
  | "inventory_recorded"
  | "data_quality_checks"
  | "transparency_docs"
  | "fairness_testing"
  | "human_oversight"
  | "third_party_controls"
  | "algo_documented"
  | "evaluation_testing"
  | "security_measures"
  | "monitoring_plan"
  | "capability_training";

const initialState = {
  system_name: "",
  description: "",
  owner: "",
  jurisdiction: "",
  sector: "",
  system_status: "development",
  business_use_case: "",
  data_types: "",
  uses_personal_data: false,
  uses_special_category_data: false,
  uses_third_party_ai: false,
  governance_policy: false,
  inventory_recorded: false,
  data_quality_checks: false,
  transparency_docs: false,
  fairness_testing: false,
  human_oversight: false,
  third_party_controls: false,
  algo_documented: false,
  evaluation_testing: false,
  security_measures: false,
  monitoring_plan: false,
  capability_training: false,
};

export default function MasAssessmentFormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: BoolKey) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mas-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to submit assessment");
      }
      const data = await res.json();
      router.push(`/mas/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4 space-y-8">
      <Head>
        <title>MAS Assessment</title>
        <meta name="description" content="MAS (Monetary Authority of Singapore) AI risk assessment form." />
      </Head>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-200 mb-1">MAS / UK-style AI Risk</p>
          <h1 className="text-3xl font-bold text-slate-100">
            New MAS AI Risk Assessment
          </h1>
          <p className="text-slate-200 mt-2">
            Provide system details and checkpoints. We’ll score each MAS pillar
            and return a risk/compliance report.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/mas/dashboard")}
          className="border-slate-400 bg-white text-slate-900 hover:bg-slate-100"
        >
          View Dashboard
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Submission failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-slate-900 border-slate-700 text-slate-100">
          <CardHeader>
            <CardTitle>System Profile</CardTitle>
            <CardDescription className="text-slate-300">
              Core details about this AI system.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-100">System name</Label>
              <Input
                required
                value={formData.system_name}
                onChange={(e) => handleChange("system_name", e.target.value)}
                placeholder="Fraud detection engine"
                className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-100">Owner / team</Label>
              <Input
                value={formData.owner}
                onChange={(e) => handleChange("owner", e.target.value)}
                placeholder="Risk Ops"
                className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-100">Jurisdiction(s)</Label>
              <Input
                value={formData.jurisdiction}
                onChange={(e) => handleChange("jurisdiction", e.target.value)}
                placeholder="Singapore, UK"
                className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-100">Sector</Label>
              <Input
                value={formData.sector}
                onChange={(e) => handleChange("sector", e.target.value)}
                placeholder="Finance, Healthcare, etc."
                className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-100">System status</Label>
              <Select
                value={formData.system_status}
                onValueChange={(v) => handleChange("system_status", v)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-100">Business purpose / use case</Label>
              <Input
                value={formData.business_use_case}
                onChange={(e) => handleChange("business_use_case", e.target.value)}
                placeholder="Automated credit decisioning"
                className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-100">Short description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Brief description of the AI system, context, and purpose."
                className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700 text-slate-100">
          <CardHeader>
            <CardTitle>Data & Dependencies</CardTitle>
            <CardDescription className="text-slate-300">
              Describe data usage and third-party reliance.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-100">Data types used</Label>
              <Textarea
                value={formData.data_types}
                onChange={(e) => handleChange("data_types", e.target.value)}
                placeholder="e.g., transaction logs, chat transcripts, tabular KYC data"
                className="bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <ToggleRow
              label="Processes personal data"
              checked={formData.uses_personal_data}
              onCheckedChange={() => handleToggle("uses_personal_data")}
            />
            <ToggleRow
              label="Processes special category / sensitive data"
              checked={formData.uses_special_category_data}
              onCheckedChange={() => handleToggle("uses_special_category_data")}
            />
            <ToggleRow
              label="Relies on third-party AI services (APIs, SaaS, models)"
              checked={formData.uses_third_party_ai}
              onCheckedChange={() => handleToggle("uses_third_party_ai")}
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700 text-slate-100">
          <CardHeader>
            <CardTitle>MAS Pillar Checkpoints</CardTitle>
            <CardDescription className="text-slate-300">
              Quick yes/no signals for each pillar to help scoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleRow
              label="Governance: Documented AI risk governance policy"
              checked={formData.governance_policy}
              onCheckedChange={() => handleToggle("governance_policy")}
            />
            <ToggleRow
              label="Inventory: System recorded in internal AI inventory"
              checked={formData.inventory_recorded}
              onCheckedChange={() => handleToggle("inventory_recorded")}
            />
            <ToggleRow
              label="Data: Data quality checks & bias analysis documented"
              checked={formData.data_quality_checks}
              onCheckedChange={() => handleToggle("data_quality_checks")}
            />
            <ToggleRow
              label="Transparency: User / stakeholder explanations documented"
              checked={formData.transparency_docs}
              onCheckedChange={() => handleToggle("transparency_docs")}
            />
            <ToggleRow
              label="Fairness: Bias / discrimination testing performed"
              checked={formData.fairness_testing}
              onCheckedChange={() => handleToggle("fairness_testing")}
            />
            <ToggleRow
              label="Human oversight: HITL / HOTL defined"
              checked={formData.human_oversight}
              onCheckedChange={() => handleToggle("human_oversight")}
            />
            <ToggleRow
              label="Third-party: Vendor due diligence / controls in place"
              checked={formData.third_party_controls}
              onCheckedChange={() => handleToggle("third_party_controls")}
            />
            <ToggleRow
              label="Algorithm: Feature selection & documentation completed"
              checked={formData.algo_documented}
              onCheckedChange={() => handleToggle("algo_documented")}
            />
            <ToggleRow
              label="Evaluation: Pre-deployment testing and robustness checks"
              checked={formData.evaluation_testing}
              onCheckedChange={() => handleToggle("evaluation_testing")}
            />
            <ToggleRow
              label="Security: Tech & cybersecurity measures against misuse"
              checked={formData.security_measures}
              onCheckedChange={() => handleToggle("security_measures")}
            />
            <ToggleRow
              label="Monitoring: Drift monitoring / incident & change management"
              checked={formData.monitoring_plan}
              onCheckedChange={() => handleToggle("monitoring_plan")}
            />
            <ToggleRow
              label="Capability: Team skills/training and infra readiness"
              checked={formData.capability_training}
              onCheckedChange={() => handleToggle("capability_training")}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[180px] bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Assessing...
              </span>
            ) : (
              "Run MAS Assessment"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

type ToggleRowProps = {
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
};

function ToggleRow({ label, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between border border-slate-700 rounded-md px-3 py-2 bg-slate-800">
      <span className="text-sm text-slate-100">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
