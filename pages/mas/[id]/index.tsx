"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft } from "lucide-react";
import type { MasAssessmentResult, MasComplianceStatus, MasRiskLevel } from "@/types/mas";
import { supabase } from "@/utils/supabase/client";

async function backendFetch(
  path: string,
  options: RequestInit = {}
) {
  const { data } = await supabase.auth.getSession();

  const accessToken = data.session?.access_token;

  if (!accessToken) {
    console.error('❌ No access token found in Supabase session');
    throw new Error("User not authenticated");
  }

  console.log('✅ Frontend: Sending token (first 50 chars):', accessToken.substring(0, 50) + '...');

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}${normalizedPath}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }
  );
}

const pillarOrder: Array<keyof MasAssessmentResult> = [
  "governance",
  "inventory",
  "dataManagement",
  "transparency",
  "fairness",
  "humanOversight",
  "thirdParty",
  "algoSelection",
  "evaluationTesting",
  "techCybersecurity",
  "monitoringChange",
  "capabilityCapacity",
];

const pillarLabels: Record<string, string> = {
  governance: "Governance & Oversight",
  inventory: "AI Inventory & Classification",
  dataManagement: "Data Management",
  transparency: "Transparency & Explainability",
  fairness: "Fairness",
  humanOversight: "Human Oversight",
  thirdParty: "Third-Party / Vendor Management",
  algoSelection: "Algorithm & Feature Selection",
  evaluationTesting: "Evaluation & Testing",
  techCybersecurity: "Technology & Cybersecurity",
  monitoringChange: "Monitoring & Change Management",
  capabilityCapacity: "Capability & Capacity",
};

export default function MasAssessmentDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const [data, setData] = useState<MasAssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for router to be ready and id to be available
    if (!router.isReady || !id) {
      return;
    }

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const res = await backendFetch(`/api/mas-compliance/${id}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to load assessment");
        }
        const body = await res.json();
        setData(body);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessment();
  }, [router.isReady, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-700 text-lg font-medium">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto max-w-4xl py-12 px-4 text-center">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <p className="text-gray-900 text-lg font-semibold mb-4">
          {error || "Assessment not found"}
        </p>
              <Button 
                variant="outline" 
                className="border-gray-300 bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => router.push("/dashboard")}
              >
          Back to Dashboard
        </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="container mx-auto max-w-6xl py-10 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
            className="text-gray-900 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button
          variant="outline"
            className="border-gray-300 bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900"
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>

        {/* MAS Compliance Progress */}
        {(() => {
          const pillars = pillarOrder.map(key => data[key] as any);
          const compliantCount = pillars.filter(p => p?.status === 'Compliant').length;
          const totalPillars = pillars.length;
          const compliancePercentage = (compliantCount / totalPillars) * 100;
          const averageScore = pillars.reduce((sum, p) => sum + (p?.score ?? 0), 0) / totalPillars;
          
          return (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader className="bg-white">
                <CardTitle className="text-2xl text-gray-900 font-bold">MAS Compliance Overview</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  {compliantCount} of {totalPillars} pillars fully compliant • Average Score: {Math.round(averageScore)}/100
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-white space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Overall Compliance</span>
                    <span className="text-lg font-bold text-gray-900">{Math.round(compliancePercentage)}%</span>
                  </div>
                  <Progress value={compliancePercentage} className="h-4" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Average Score</span>
                    <span className="text-lg font-bold text-gray-900">{Math.round(averageScore)}/100</span>
                  </div>
                  <Progress value={averageScore} className="h-4" />
                </div>
              </CardContent>
            </Card>
          );
        })()}

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="space-y-2 bg-white">
            <CardDescription className="text-gray-600 font-medium">MAS / UK-style AI Risk</CardDescription>
            <CardTitle className="text-3xl text-gray-900 font-bold">{data.system_name}</CardTitle>
            <p className="text-gray-700 text-base">{data.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-medium">
              Sector: {data.sector || "—"}
            </Badge>
              <Badge className="bg-gray-100 text-gray-800 border-gray-300 capitalize font-medium">
              Status: {data.system_status}
            </Badge>
            <StatusBadge level={data.overall_risk_level} />
            <ComplianceBadge status={data.overall_compliance_status} />
          </div>
        </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white">
          <InfoItem label="Owner" value={data.owner} />
          <InfoItem label="Jurisdiction" value={data.jurisdiction} />
          <InfoItem label="Business use case" value={data.business_use_case} />
          <InfoItem
            label="Data types"
            value={data.data_types}
            className="md:col-span-3"
          />
          <InfoItem
            label="Flags"
            value={[
              data.uses_personal_data ? "Personal data" : null,
              data.uses_special_category_data ? "Special category data" : null,
              data.uses_third_party_ai ? "Third-party AI" : null,
            ]
              .filter(Boolean)
              .join(" • ") || "None indicated"}
            className="md:col-span-3"
          />
          <InfoItem
            label="Created at"
            value={data.created_at ? new Date(data.created_at).toLocaleString() : "—"}
          />
        </CardContent>
      </Card>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="bg-white">
            <CardTitle className="text-2xl text-gray-900 font-bold">Pillar overview</CardTitle>
            <CardDescription className="text-gray-600">Snapshot of status and scores.</CardDescription>
        </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
          {pillarOrder.map((key) => {
            const pillar = data[key] as any;
            return (
              <div
                key={key}
                  className="border-2 border-gray-200 rounded-lg p-4 flex flex-col gap-3 bg-white hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                      <p className="text-base font-semibold text-gray-900">{pillarLabels[key]}</p>
                      <div className="text-sm text-gray-600 font-medium mt-1">Score: {pillar?.score ?? 0}/100</div>
                  </div>
                  <ComplianceBadge status={pillar?.status || "Partially compliant"} />
                </div>
                <Progress value={pillar?.score ?? 0} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillarOrder.map((key) => {
          const pillar = data[key] as any;
          return (
              <Card key={key} className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="bg-white">
                  <CardTitle className="text-xl text-gray-900 font-bold">{pillarLabels[key]}</CardTitle>
                <CardDescription className="flex items-center gap-3">
                  <ComplianceBadge status={pillar?.status || "Partially compliant"} />
                    <span className="text-gray-700 font-semibold">Score: {pillar?.score ?? 0}/100</span>
                </CardDescription>
              </CardHeader>
                <CardContent className="space-y-4 bg-white">
                <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Gaps</p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                    {(pillar?.gaps || ["No gaps provided"]).map((item: string, idx: number) => (
                        <li key={idx} className="text-gray-800">{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 mb-2">Recommended actions</p>
                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-700">
                    {(pillar?.recommendations || ["No recommendations provided"]).map(
                      (item: string, idx: number) => (
                          <li key={idx} className="text-gray-800">{item}</li>
                      )
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="bg-white">
            <CardTitle className="text-2xl text-gray-900 font-bold">Summary</CardTitle>
            <CardDescription className="text-gray-600">
            Overall risk and compliance narrative (100-200 words).
          </CardDescription>
        </CardHeader>
          <CardContent className="bg-white">
            <p className="text-gray-800 whitespace-pre-line leading-relaxed text-base">{data.summary}</p>
          </CardContent>
      </Card>
      </div>
    </div>
  );
}

function StatusBadge({ level }: { level: MasRiskLevel }) {
  const color =
    level === "Critical"
      ? "bg-red-100 text-red-800 border-red-300"
      : level === "High"
      ? "bg-orange-100 text-orange-800 border-orange-300"
      : level === "Medium"
      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
      : "bg-green-100 text-green-800 border-green-300";
  return <Badge className={`${color} font-semibold capitalize`}>{level}</Badge>;
}

function ComplianceBadge({ status }: { status: MasComplianceStatus }) {
  const color =
    status === "Compliant"
      ? "bg-green-100 text-green-800 border-green-300"
      : status === "Partially compliant"
      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
      : "bg-red-100 text-red-800 border-red-300";
  return <Badge className={`${color} font-semibold`}>{status}</Badge>;
}

function InfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="text-gray-900 font-medium">{value || "—"}</p>
    </div>
  );
}
