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

import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { UKAssessmentResult, UKComplianceStatus, UKRiskLevel } from "@/types/uk";
import { supabase } from "@/utils/supabase/client";
import { backendFetch } from "@/utils/backend-fetch";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Severity = "critical" | "high" | "info";

const PRINCIPLE_META = [
  { key: "safety_and_security", title: "Safety, Security & Robustness", lawRef: "UK AI Principle 1" },
  { key: "transparency", title: "Transparency & Explainability", lawRef: "UK AI Principle 2" },
  { key: "fairness", title: "Fairness", lawRef: "UK AI Principle 3" },
  { key: "governance", title: "Accountability & Governance", lawRef: "UK AI Principle 4" },
  { key: "contestability", title: "Contestability & Redress", lawRef: "UK AI Principle 5" },
] as const;

function riskClasses(level: UKRiskLevel) {
  switch (level) {
    case "Frontier / High-Impact Model":
      return "bg-red-100 text-red-800 border-red-200";
    case "High-Risk (Sector)":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Medium-Risk":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
}

function statusClasses(status: UKComplianceStatus) {
  switch (status) {
    case "Compliant":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Partially compliant":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-red-100 text-red-800 border-red-200";
  }
}

function warningClasses(severity: Severity) {
  if (severity === "critical") return "bg-red-50 border-red-200 text-red-900";
  if (severity === "high") return "bg-amber-50 border-amber-200 text-amber-900";
  return "bg-blue-50 border-blue-200 text-blue-900";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toReadable(text: string) {
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeSummaryText(summary: string) {
  return summary
    .replace(/\bas indicated in Q\d+[a-z]?\b\.?/gi, "")
    .replace(/\breferenced in Q\d+[a-z]?\b\.?/gi, "")
    .replace(/\bQ\d+[a-z]?\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function renderSummaryText(summary: string) {
  const normalized = normalizeSummaryText(summary || "");
  if (!normalized) return "";
  const tokens = normalized.match(/\b[a-z]+_[a-z_]+\b/gi) || [];
  if (tokens.length === 0) return normalized;
  const unique = Array.from(new Set(tokens));
  const tokenSet = new Set(unique.map((t) => t.toLowerCase()));
  const regex = new RegExp(`(${unique.map((t) => escapeRegExp(t)).join("|")})`, "gi");
  return normalized.split(regex).map((part, idx) =>
    tokenSet.has(part.toLowerCase()) ? <strong key={`${part}-${idx}`}>{toReadable(part)}</strong> : part
  );
}

export default function UKAssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [data, setData] = useState<UKAssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMultiJurisdiction, setIsMultiJurisdiction] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      setIsLoggedIn(!!auth.user);
    })();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    const load = async () => {
      if (!id || id === "undefined") {
        setError("Invalid assessment ID");
        setLoading(false);
        return;
      }

      try {
        const res = await backendFetch(`/api/uk-compliance/${id}`);
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to load assessment");
        }
        const body = await res.json();
        setData(body);

        if (body.system_id) {
          const { data: systemData, error: systemError } = await supabase
            .from("ai_systems")
            .select("data_processing_locations")
            .eq("id", body.system_id)
            .single();

          if (!systemError && systemData) {
            const locations = systemData.data_processing_locations || [];
            const hasUK = locations.includes("United Kingdom") || locations.includes("UK");
            const hasEU =
              locations.includes("European Union") ||
              locations.includes("EU") ||
              locations.some((loc: string) =>
                [
                  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
                  "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
                  "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
                  "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
                  "Slovenia", "Spain", "Sweden",
                ].some((c) => c.toLowerCase() === loc.toLowerCase())
              );
            const hasSingapore = locations.includes("Singapore");
            setIsMultiJurisdiction(hasUK && (hasEU || hasSingapore));
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const quickChecks = useMemo(() => {
    if (!data) return [];
    return [
      { label: "Robustness testing defined", passed: data.raw_answers?.robustness_testing === true },
      { label: "Human oversight defined", passed: data.raw_answers?.human_oversight === true },
      {
        label: "Accountability framework defined",
        passed: data.raw_answers?.accountability_framework === true,
      },
    ];
  }, [data]);

  const failureRows = useMemo(() => {
    if (!data) return [];
    const principleFailures = PRINCIPLE_META.flatMap((meta) => {
      const status = data[meta.key];
      if (!status || status.meetsPrinciple) return [];
      return (status.missing || []).map((reason) => ({
        law: meta.lawRef,
        area: meta.title,
        why: reason,
      }));
    });

    const sectorFailures = (data.sector_regulation?.gaps || []).map((gap) => ({
      law: "Sector Regulator Requirements",
      area: data.sector_regulation?.sector || "Sector Controls",
      why: gap,
    }));

    return [...principleFailures, ...sectorFailures];
  }, [data]);

  const principleVisual = useMemo(() => {
    if (!data) return { met: 0, unmet: 0, missingTotal: 0 };
    const rows = PRINCIPLE_META.map((meta) => data[meta.key]);
    const met = rows.filter((row) => row?.meetsPrinciple).length;
    const unmet = rows.length - met;
    const missingTotal = rows.reduce((sum, row) => sum + (row?.missing?.length || 0), 0);
    return { met, unmet, missingTotal };
  }, [data]);

  const warning = useMemo(() => {
    if (!data) return null;
    if (data.overall_assessment === "Non-compliant") {
      return {
        severity: "critical" as Severity,
        title: "Critical Compliance Failure",
        description: "This assessment is non-compliant and requires remediation before deployment or continued use.",
      };
    }
    if (data.assessment_mode === "rapid") {
      return {
        severity: "high" as Severity,
        title: "Quick Scan Result (Provisional)",
        description: data.warning || "Rapid mode covers core indicators only. Run Deep Review for full control validation.",
      };
    }
    return {
      severity: "info" as Severity,
      title: "Assessment Loaded",
      description: "Review principle-level gaps and remediation actions below.",
    };
  }, [data]);

  const ukRadarData = useMemo(() => {
    if (!data) return [];
    return PRINCIPLE_META.map((meta) => {
      const principle = data[meta.key];
      const missingCount = principle?.missing?.length || 0;
      const score = principle?.meetsPrinciple ? 100 : Math.max(10, 100 - missingCount * 25);
      return { axis: meta.title.replace(" & ", "/"), score };
    });
  }, [data]);

  const rootCauseData = useMemo(() => {
    const buckets = [
      { name: "Safety/Testing", test: /safety|robust|test|security/i, value: 0 },
      { name: "Transparency", test: /transparency|disclosure|explain/i, value: 0 },
      { name: "Fairness/Bias", test: /fair|bias|discrimin/i, value: 0 },
      { name: "Governance", test: /governance|accountab|oversight|owner/i, value: 0 },
      { name: "Redress", test: /contest|appeal|redress|challenge/i, value: 0 },
    ];
    failureRows.forEach((row) => {
      const hit = buckets.find((b) => b.test.test(`${row.area} ${row.why}`));
      if (hit) {
        hit.value += 1;
      } else {
        buckets[3].value += 1;
      }
    });
    return buckets;
  }, [failureRows]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar onLogout={handleLogout} />
        <div className={`flex items-center justify-center h-[70vh] ${isLoggedIn ? "lg:pl-72" : ""}`}>
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-slate-700">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar onLogout={handleLogout} />
        <div className={`mx-auto max-w-4xl px-4 py-16 ${isLoggedIn ? "lg:pl-72" : ""}`}>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to open assessment</AlertTitle>
            <AlertDescription>{error || "Assessment not found"}</AlertDescription>
          </Alert>
          <Button className="mt-4" variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const metPrinciples = PRINCIPLE_META.filter((meta) => data[meta.key]?.meetsPrinciple).length;
  const percentage = Math.round((metPrinciples / PRINCIPLE_META.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>UK Assessment Detail</title>
        <meta name="description" content="UK AI Regulatory Framework assessment result." />
      </Head>

      <Sidebar onLogout={handleLogout} />

      <main className={`mx-auto max-w-7xl space-y-6 px-4 py-8 ${isLoggedIn ? "lg:pl-72" : ""}`}>
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">UK AI Regulatory Framework Assessment</h1>
            <p className="mt-1 text-sm text-slate-600">
              Assessment ID: {id} • {new Date(data.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.system_id && isMultiJurisdiction && (
              <Button onClick={() => router.push(`/compliance/multi/${data.system_id}`)}>Back to Multi-Jurisdiction</Button>
            )}
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
              <CardTitle className="text-xl">{data.compliance_score ?? percentage}%</CardTitle>
              {data.confidence_score && data.confidence_score < 100 && (
                <p className="text-xs text-amber-600">{data.confidence_score}% confident</p>
              )}
            </CardHeader>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardDescription>Assessment Mode</CardDescription>
              <CardTitle className="text-xl capitalize">{data.assessment_mode || "comprehensive"}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardDescription>Risk Level</CardDescription>
              <Badge className={riskClasses(data.risk_level)} variant="outline">
                {data.risk_level}
              </Badge>
            </CardHeader>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardDescription>Overall Assessment</CardDescription>
              <Badge className={statusClasses(data.overall_assessment)} variant="outline">
                {data.overall_assessment}
              </Badge>
            </CardHeader>
          </Card>
        </section>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>High-level UK compliance interpretation</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            <ul className="space-y-1">
              <li>
                <strong>Risk Level:</strong> {data.risk_level}
              </li>
              <li>
                <strong>Overall Assessment:</strong> {data.overall_assessment}
              </li>
              <li>
                <strong>Principles Met:</strong> {metPrinciples}/{PRINCIPLE_META.length}
                {data.assessment_mode === "rapid" ? " (assessed in Quick Scan)" : ""}
              </li>
              {data.assessment_mode === "rapid" && (
                <li>
                  <strong>Not Evaluated in Quick Scan:</strong>{" "}
                  {Math.max(0, PRINCIPLE_META.length - quickChecks.length)} principle(s)
                </li>
              )}
              <li>
                <strong>Sector Context:</strong> {data.sector_regulation?.sector || "General"}
              </li>
              <li>
                <strong>Sector-Specific Gaps:</strong> {data.sector_regulation?.gaps?.length || 0}
              </li>
              {data.assessment_mode === "rapid" && (
                <li>
                  <strong>Mode Note:</strong> Provisional quick-scan output. Run Deep Review for full principle-level
                  evidence and regulatory reasoning.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Assessment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{renderSummaryText(data.summary)}</p>
          </CardContent>
        </Card>

        {data.assessment_mode === "rapid" && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Quick Scan Explainability</CardTitle>
              <CardDescription>What was checked in rapid mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickChecks.map((check) => (
                <div key={check.label} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <p className="text-sm font-medium text-slate-800">{check.label}</p>
                  <Badge className={check.passed ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"}>
                    {check.passed ? "Met" : "Not met"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>UK Principles Compliance</CardTitle>
            <CardDescription>
              {metPrinciples} of {PRINCIPLE_META.length} principles met ({percentage}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700">Met</p>
                <p className="text-lg font-semibold text-emerald-800">{principleVisual.met}</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs text-red-700">Unmet</p>
                <p className="text-lg font-semibold text-red-800">{principleVisual.unmet}</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-700">Missing Controls</p>
                <p className="text-lg font-semibold text-amber-800">{principleVisual.missingTotal}</p>
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Compliance Completion</span>
                <span className="font-semibold text-slate-900">{percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>UK Principle Maturity Radar</CardTitle>
            <CardDescription>Relative maturity by UK principle (0-100)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={ukRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: "#475569", fontSize: 11 }} />
                  <Tooltip />
                  <Radar dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>UK Root-Cause Distribution</CardTitle>
            <CardDescription>Where most failures are concentrated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rootCauseData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#475569" }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#dc2626" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>UK Principle Detail</CardTitle>
            <CardDescription>Per-principle findings and reasons</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {PRINCIPLE_META.map((meta) => {
              const principle = data[meta.key];
              const met = principle?.meetsPrinciple;
              const missingItems = (principle?.missing || []).filter((m) => (m || "").trim().length > 0);
              return (
                <div key={meta.key} className={`rounded-xl border p-4 ${met ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-slate-900">{meta.title}</p>
                    {met ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                  </div>
                  {!met && missingItems.length > 0 && (
                    <ul className="space-y-1 text-sm text-slate-700">
                      {missingItems.map((item, idx) => (
                        <li key={idx}>- {item}</li>
                      ))}
                    </ul>
                  )}
                  {!met && missingItems.length === 0 && (
                    <p className="text-sm text-slate-700">
                      This principle is marked as failed, but detailed gap text is unavailable in the current result.
                      Use Deep Review to generate full reason-level findings.
                    </p>
                  )}
                  {met && <p className="text-sm text-emerald-700">Principle requirements met.</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Why It Failed (Law/Control Level)</CardTitle>
            <CardDescription>Direct mapping of failed outcomes to UK principle or sector requirement</CardDescription>
          </CardHeader>
          <CardContent>
            {failureRows.length === 0 ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                No failed principle or sector requirement detected in this assessment.
              </div>
            ) : (
              <div className="space-y-2">
                {failureRows.map((row, index) => (
                  <div key={`${row.law}-${index}`} className="grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-[1.1fr_1fr_2fr]">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.law}</p>
                    <p className="text-sm font-semibold text-slate-800">{row.area}</p>
                    <p className="text-sm text-slate-700">{row.why}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {data.assessment_mode === "rapid" && data.system_id && (
          <div className="flex justify-end">
            <Button onClick={() => router.push(`/assessment/uk/${data.system_id}?mode=comprehensive`)}>
              Run Deep Review
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
