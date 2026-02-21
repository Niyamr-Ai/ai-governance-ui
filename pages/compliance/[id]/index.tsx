"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Loader2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { backendFetch } from "@/utils/backend-fetch";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Severity = "critical" | "high" | "info";

type EUResult = {
  id: string;
  system_id?: string | null;
  created_at: string;
  assessment_mode?: "rapid" | "comprehensive";
  assessment_confidence?: string;
  is_provisional?: boolean;
  risk_tier: string;
  compliance_status: string;
  prohibited_practices_detected: boolean;
  high_risk_missing: string[];
  high_risk_all_fulfilled: boolean;
  transparency_required: boolean;
  transparency_missing: string[];
  monitoring_required: boolean;
  post_market_monitoring: boolean;
  incident_reporting: boolean;
  fria_completed: boolean;
  summary: string;
  reference?: Record<string, any>;
  compliance_score?: number;
  confidence_score?: number;
};

const HIGH_RISK_ARTICLES: Record<string, string> = {
  "Risk Management": "EU AI Act Art. 9",
  "Data Governance": "EU AI Act Art. 10",
  "Technical Documentation": "EU AI Act Art. 11",
  "Record-Keeping": "EU AI Act Art. 12",
  "Human Oversight": "EU AI Act Art. 14",
  "Accuracy": "EU AI Act Art. 15",
  "Conformity Assessment": "EU AI Act Art. 43",
};

const TRANSPARENCY_ARTICLES: Record<string, string> = {
  aiIdentityDisclosed: "EU AI Act Art. 50(1)",
  syntheticContentLabeled: "EU AI Act Art. 50(2)",
  emotionBioNotice: "EU AI Act Art. 50(3)",
};

function riskClasses(tier: string) {
  const v = tier?.toLowerCase() || "";
  if (v.includes("prohibited") || v.includes("unacceptable")) return "bg-red-100 text-red-800 border-red-200";
  if (v.includes("high")) return "bg-orange-100 text-orange-800 border-orange-200";
  if (v.includes("limited")) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
}

function statusClasses(status: string) {
  const v = status?.toLowerCase() || "";
  if (v.includes("non")) return "bg-red-100 text-red-800 border-red-200";
  if (v.includes("partial")) return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
}

function warningClasses(severity: Severity) {
  if (severity === "critical") return "bg-red-50 border-red-200 text-red-900";
  if (severity === "high") return "bg-amber-50 border-amber-200 text-amber-900";
  return "bg-blue-50 border-blue-200 text-blue-900";
}

function toReadable(text: string) {
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSummaryText(summary: string) {
  return summary
    .replace(/\bas indicated in Q\d+[a-z]?\b\.?/gi, "")
    .replace(/\breferenced in Q\d+[a-z]?\b\.?/gi, "")
    .replace(/\bQ\d+[a-z]?\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function renderSummaryText(summary: string, highlights: string[] = []) {
  const normalized = normalizeSummaryText(summary || "");
  if (!normalized) return "";

  const autoTokens = normalized.match(/\b[a-z]+_[a-z_]+\b/gi) || [];
  const merged = Array.from(new Set([...highlights, ...autoTokens].filter(Boolean)));
  if (merged.length === 0) return normalized;

  const regex = new RegExp(`(${merged.map((m) => escapeRegExp(m)).join("|")})`, "gi");
  const mergedLower = new Set(merged.map((m) => m.toLowerCase()));

  return normalized.split(regex).map((part, idx) => {
    if (mergedLower.has(part.toLowerCase())) {
      return <strong key={`${part}-${idx}`}>{toReadable(part)}</strong>;
    }
    return part;
  });
}

export default function EUComplianceResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [result, setResult] = useState<EUResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError("Invalid compliance ID");
        setLoading(false);
        return;
      }
      try {
        const res = await backendFetch(`/api/compliance/${id}`);
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Unable to load compliance result");
        }
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message || "Unable to load compliance result");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const isProhibited = useMemo(() => {
    if (!result) return false;
    const tier = (result.risk_tier || "").toLowerCase();
    return tier.includes("prohibited") || tier.includes("unacceptable") || result.prohibited_practices_detected;
  }, [result]);

  const isMinimal = useMemo(() => {
    if (!result) return false;
    return (result.risk_tier || "").toLowerCase().includes("minimal");
  }, [result]);

  const prohibitedItems = useMemo(() => {
    if (!result) return [];
    return Array.isArray(result.reference?.prohibited_practices)
      ? result.reference?.prohibited_practices
      : [];
  }, [result]);

  const warning = useMemo(() => {
    if (!result) return null;
    if (isProhibited || result.compliance_status?.toLowerCase().includes("non")) {
      return {
        severity: "critical" as Severity,
        title: "Critical EU AI Act Compliance Failure",
        description: "This system is non-compliant or includes prohibited risk indicators and requires immediate remediation.",
      };
    }
    if (result.assessment_mode === "rapid" || result.is_provisional) {
      return {
        severity: "high" as Severity,
        title: "Quick Scan Result (Provisional)",
        description:
          "This result is from rapid mode and does not represent full obligation coverage. Run Deep Review for complete validation.",
      };
    }
    return {
      severity: "info" as Severity,
      title: "Assessment Loaded",
      description: "Review missing obligations and legal references below.",
    };
  }, [result, isProhibited]);

  const failureRows = useMemo(() => {
    if (!result) return [];

    const prohibitedFailures =
      isProhibited
        ? [
          {
            law: "EU AI Act Art. 5 (Prohibited Practices)",
            area: "Prohibited Classification",
            why:
              prohibitedItems.length > 0
                ? `Prohibited practice(s) identified: ${prohibitedItems.map((p: string) => toReadable(p)).join(", ")}.`
                : "System has been classified as prohibited/unacceptable risk under submitted answers.",
          },
        ]
        : [];

    const highRiskFailures = (result.high_risk_missing || []).map((item) => ({
      law: HIGH_RISK_ARTICLES[item] || "EU AI Act (High-Risk Obligations)",
      area: item,
      why: `Control is marked as missing in the submitted assessment.`,
    }));

    const transparencyFailures = (result.transparency_missing || []).map((key) => ({
      law: TRANSPARENCY_ARTICLES[key] || "EU AI Act Art. 50",
      area: key,
      why: "Required transparency disclosure was not confirmed.",
    }));

    const monitoringFailures: Array<{ law: string; area: string; why: string }> = [];
    if (result.monitoring_required && !isProhibited && !isMinimal) {
      if (!result.post_market_monitoring) {
        monitoringFailures.push({
          law: "EU AI Act Art. 72",
          area: "Post-Market Monitoring",
          why: "Required monitoring process is missing.",
        });
      }
      if (!result.incident_reporting) {
        monitoringFailures.push({
          law: "EU AI Act Art. 73",
          area: "Incident Reporting",
          why: "Serious incident reporting setup is missing.",
        });
      }
      if (!result.fria_completed) {
        monitoringFailures.push({
          law: "EU AI Act FRIA Requirement",
          area: "Fundamental Rights Impact Assessment",
          why: "FRIA completion is not confirmed.",
        });
      }
    }

    return [...prohibitedFailures, ...highRiskFailures, ...transparencyFailures, ...monitoringFailures];
  }, [result, isProhibited, isMinimal, prohibitedItems]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-3 text-slate-700">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to open assessment</AlertTitle>
          <AlertDescription>{error || "Assessment not found"}</AlertDescription>
        </Alert>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const totalObligations = Object.keys(HIGH_RISK_ARTICLES).length;
  const applicable = !isProhibited && !isMinimal;
  const fulfilled = applicable ? Math.max(0, totalObligations - (result.high_risk_missing || []).length) : 0;
  const obligationPct = applicable ? Math.round((fulfilled / totalObligations) * 100) : 0;
  const visualData = {
    prohibited: isProhibited ? 1 : 0,
    highRiskMissing: (result.high_risk_missing || []).length,
    transparencyMissing: (result.transparency_missing || []).length,
    monitoringMissing:
      (result.monitoring_required && !result.post_market_monitoring ? 1 : 0) +
      (result.monitoring_required && !result.incident_reporting ? 1 : 0) +
      (result.monitoring_required && !result.fria_completed ? 1 : 0),
  };
  const euChartData = [
    { name: "Prohibited", value: visualData.prohibited, color: "#dc2626" },
    { name: "High-Risk Missing", value: visualData.highRiskMissing, color: "#d97706" },
    { name: "Transparency Missing", value: visualData.transparencyMissing, color: "#f59e0b" },
    { name: "Monitoring Missing", value: visualData.monitoringMissing, color: "#ef4444" },
  ];
  const legalAreaMatrix = [
    {
      area: "Prohibited Practices",
      met: 0,
      missing: isProhibited ? 1 : 0,
      na: isProhibited ? 0 : 1,
    },
    {
      area: "High-Risk Obligations",
      met: applicable && result.high_risk_missing.length === 0 ? 1 : 0,
      missing: applicable && result.high_risk_missing.length > 0 ? 1 : 0,
      na: applicable ? 0 : 1,
    },
    {
      area: "Transparency",
      met: result.transparency_required ? (result.transparency_missing.length === 0 ? 1 : 0) : 0,
      missing: result.transparency_required && result.transparency_missing.length > 0 ? 1 : 0,
      na: result.transparency_required ? 0 : 1,
    },
    {
      area: "Monitoring/FRIA",
      met:
        result.monitoring_required
          ? result.post_market_monitoring && result.incident_reporting && result.fria_completed
            ? 1
            : 0
          : 0,
      missing:
        result.monitoring_required &&
          (!result.post_market_monitoring || !result.incident_reporting || !result.fria_completed)
          ? 1
          : 0,
      na: result.monitoring_required ? 0 : 1,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <Head>
        <title>EU Compliance Detail</title>
        <meta name="description" content="EU AI Act compliance assessment detail." />
      </Head>

      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">EU AI Act Compliance Result</h1>
            <p className="mt-1 text-sm text-slate-600">
              Assessment Date:{" "}
              {new Date(result.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </header>

        {warning && (
          <Alert className={warningClasses(warning.severity)}>
            <FileWarning className="h-4 w-4" />
            <AlertTitle>{warning.title}</AlertTitle>
            <AlertDescription>{warning.description}</AlertDescription>
          </Alert>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardDescription>Compliance Score</CardDescription>
              <CardTitle className="text-xl">{result.compliance_score ?? obligationPct}%</CardTitle>
              {result.confidence_score && result.confidence_score < 100 && (
                <p className="text-xs text-amber-600">{result.confidence_score}% confident</p>
              )}
            </CardHeader>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardDescription>Assessment Mode</CardDescription>
              <CardTitle className="text-xl capitalize">{result.assessment_mode || "comprehensive"}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardDescription>Risk Tier</CardDescription>
              <Badge className={riskClasses(result.risk_tier)} variant="outline">
                {result.risk_tier}
              </Badge>
            </CardHeader>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardDescription>Compliance Status</CardDescription>
              <Badge className={statusClasses(result.compliance_status)} variant="outline">
                {result.compliance_status}
              </Badge>
            </CardHeader>
          </Card>
        </section>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>High-level outcome and immediate interpretation</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            <ul className="space-y-1">
              <li>
                <strong>Risk Tier:</strong> {result.risk_tier}
              </li>
              <li>
                <strong>Overall Assessment:</strong> {result.compliance_status}
              </li>
              <li>
                <strong>Failed Legal Requirements:</strong> {failureRows.length}
              </li>
              <li>
                <strong>High-Risk Obligation Coverage:</strong> {applicable ? `${fulfilled}/${totalObligations} (${obligationPct}%)` : "Not applicable"}
              </li>
              <li>
                <strong>Transparency Requirements Missing:</strong> {result.transparency_missing?.length || 0}
              </li>
              <li>
                <strong>Monitoring/FRIA Missing:</strong>{" "}
                {(result.monitoring_required && !result.post_market_monitoring ? 1 : 0) +
                  (result.monitoring_required && !result.incident_reporting ? 1 : 0) +
                  (result.monitoring_required && !result.fria_completed ? 1 : 0)}
              </li>
              {result.assessment_mode === "rapid" && (
                <li>
                  <strong>Mode Note:</strong> Provisional quick-scan output. Run Deep Review for full legal obligation validation.
                </li>
              )}
            </ul>
            {isProhibited && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="font-semibold text-red-800">Prohibited Practice Indicators</p>
                {prohibitedItems.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {prohibitedItems.map((item: string) => (
                      <Badge key={item} className="bg-red-100 text-red-800 border-red-200" variant="outline">
                        {toReadable(item)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-red-700">System is marked prohibited/unacceptable based on submitted answers.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Assessment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {renderSummaryText(result.summary, prohibitedItems)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>High-Risk Obligation Coverage</CardTitle>
            <CardDescription>
              {applicable
                ? `${fulfilled} of ${totalObligations} obligations fulfilled`
                : "High-risk obligations are not applicable to this classification"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Coverage</span>
                <span className="font-semibold text-slate-900">{applicable ? `${obligationPct}%` : "N/A"}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${applicable ? obligationPct : 0}%` }} />
              </div>
            </div>

            {!applicable && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {isProhibited
                  ? "System is prohibited/unacceptable risk. High-risk obligations are not the governing path."
                  : "Minimal-risk systems do not require high-risk obligation controls."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>EU Legal-Area Status Matrix</CardTitle>
            <CardDescription>Per legal area: met vs missing vs not applicable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={legalAreaMatrix} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="area" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#475569" }} />
                  <Tooltip />
                  <Bar dataKey="met" stackId="a" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="missing" stackId="a" fill="#dc2626" />
                  <Bar dataKey="na" stackId="a" fill="#94a3b8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Obligation Checklist</CardTitle>
            <CardDescription>Core EU AI Act high-risk control checks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Object.entries(HIGH_RISK_ARTICLES).map(([obligation, article]) => {
              const missing = (result.high_risk_missing || []).includes(obligation);
              const notApplicable = !applicable;
              return (
                <div key={obligation} className={`rounded-xl border p-4 ${notApplicable
                    ? "border-slate-300 bg-slate-50"
                    : missing
                      ? "border-red-200 bg-red-50/50"
                      : "border-emerald-200 bg-emerald-50/50"
                  }`}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{obligation}</p>
                    {notApplicable ? (
                      <Badge variant="outline" className="border-slate-300 text-slate-600">N/A</Badge>
                    ) : missing ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{article}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Why It Failed (Law/Control Level)</CardTitle>
            <CardDescription>Direct mapping of failed controls to relevant EU AI Act obligations</CardDescription>
          </CardHeader>
          <CardContent>
            {failureRows.length === 0 ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                No failed EU obligation detected from the current assessment outputs.
              </div>
            ) : (
              <div className="space-y-2">
                {failureRows.map((row, index) => (
                  <div key={`${row.law}-${index}`} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-[1.2fr_1fr_2fr]">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.law}</p>
                    <p className="text-sm font-semibold text-slate-800">{row.area}</p>
                    <p className="text-sm text-slate-700">{row.why}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {result.assessment_mode === "rapid" && (result.system_id || id) && (
          <div className="flex justify-end">
            <Button onClick={() => router.push(`/assessment/eu/${result.system_id || id}?mode=comprehensive`)}>
              Run Deep Review
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
