"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { AlertTriangle, CheckCircle2, FileWarning, Loader2, XCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { MasAssessmentResult, MasComplianceStatus, MasRiskLevel } from "@/types/mas";
import { supabase } from "@/utils/supabase/client";
import { backendFetch } from "@/utils/backend-fetch";

type Severity = "critical" | "high" | "info";

const PILLARS: Array<{ key: keyof MasAssessmentResult; title: string; lawRef: string }> = [
  { key: "governance", title: "Governance & Oversight", lawRef: "MAS FEAT: Governance" },
  { key: "inventory", title: "AI Inventory & Classification", lawRef: "MAS FEAT: Accountability/Transparency" },
  { key: "dataManagement", title: "Data Management", lawRef: "MAS FEAT: Fairness" },
  { key: "transparency", title: "Transparency & Explainability", lawRef: "MAS FEAT: Transparency" },
  { key: "fairness", title: "Fairness", lawRef: "MAS FEAT: Fairness" },
  { key: "humanOversight", title: "Human Oversight", lawRef: "MAS FEAT: Governance" },
  { key: "thirdParty", title: "Third-Party/Vendor Management", lawRef: "MAS FEAT: Accountability" },
  { key: "algoSelection", title: "Algorithm & Feature Selection", lawRef: "MAS FEAT: Fairness" },
  { key: "evaluationTesting", title: "Evaluation & Testing", lawRef: "MAS FEAT: Ethics" },
  { key: "techCybersecurity", title: "Technology & Cybersecurity", lawRef: "MAS FEAT: Governance" },
  { key: "monitoringChange", title: "Monitoring & Change Management", lawRef: "MAS FEAT: Accountability" },
  { key: "capabilityCapacity", title: "Capability & Capacity", lawRef: "MAS FEAT: Governance" },
];

function riskClasses(level: MasRiskLevel) {
  if (level === "Critical") return "bg-red-100 text-red-800 border-red-200";
  if (level === "High") return "bg-orange-100 text-orange-800 border-orange-200";
  if (level === "Medium") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-emerald-100 text-emerald-800 border-emerald-200";
}

function statusClasses(status: MasComplianceStatus) {
  if (status === "Compliant") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (status === "Partially compliant") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-red-100 text-red-800 border-red-200";
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

function isRapidUnassessedPillar(pillar: any): boolean {
  const gaps = Array.isArray(pillar?.gaps) ? pillar.gaps : [];
  return gaps.some((g: string) => typeof g === "string" && g.toLowerCase().includes("not fully assessed in quick scan"));
}

export default function MasAssessmentDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const [data, setData] = useState<MasAssessmentResult | null>(null);
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
    if (!router.isReady || !id) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await backendFetch(`/api/mas-compliance/${id}`);
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to load assessment");
        }
        const body = await res.json();
        setData(body);
        setError(null);

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
            setIsMultiJurisdiction(hasSingapore && (hasUK || hasEU));
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [router.isReady, id]);

  const warning = useMemo(() => {
    if (!data) return null;
    if (data.overall_compliance_status === "Non-compliant" || data.overall_risk_level === "Critical") {
      return {
        severity: "critical" as Severity,
        title: "Critical MAS Compliance Risk",
        description: "This system requires urgent remediation before continuing production operations.",
      };
    }
    if (data.assessment_mode === "rapid") {
      return {
        severity: "high" as Severity,
        title: "Quick Scan Result (Provisional)",
        description: data.warning || "Rapid mode assesses only core controls. Run Deep Review for complete pillar validation.",
      };
    }
    return {
      severity: "info" as Severity,
      title: "Assessment Loaded",
      description: "Use the pillar-level findings to prioritize remediation.",
    };
  }, [data]);

  const pillars = useMemo(() => {
    if (!data) return [];
    return PILLARS.map((pillarMeta) => {
      const pillar = data[pillarMeta.key] as any;
      const coreRapidPillars = ["governance", "inventory", "humanOversight"];
      const isCoreRapid = coreRapidPillars.includes(String(pillarMeta.key));
      const unassessed =
        data.assessment_mode === "rapid" &&
        (!isCoreRapid || isRapidUnassessedPillar(pillar));
      return {
        ...pillarMeta,
        status: pillar?.status || "Partially compliant",
        score: unassessed ? null : pillar?.score ?? 0,
        gaps: Array.isArray(pillar?.gaps) ? pillar.gaps : [],
        recommendations: Array.isArray(pillar?.recommendations) ? pillar.recommendations : [],
        unassessed,
      };
    });
  }, [data]);

  const rapidScoreModel = useMemo(() => {
    if (!data || data.assessment_mode !== "rapid") return null;
    const raw = data.raw_answers || {};
    const governanceChecks = [
      raw.governance_policy === true,
      typeof raw.governance_framework === "string" && raw.governance_framework.trim().length >= 25,
    ];
    const inventoryChecks = [raw.inventory_recorded === true];
    const oversightChecks = [raw.human_oversight === true];

    const toPct = (arr: boolean[]) => Math.round((arr.filter(Boolean).length / Math.max(1, arr.length)) * 100);
    return {
      governance: { met: governanceChecks.filter(Boolean).length, total: governanceChecks.length, pct: toPct(governanceChecks) },
      inventory: { met: inventoryChecks.filter(Boolean).length, total: inventoryChecks.length, pct: toPct(inventoryChecks) },
      humanOversight: { met: oversightChecks.filter(Boolean).length, total: oversightChecks.length, pct: toPct(oversightChecks) },
    };
  }, [data]);

  const failureRows = useMemo(() => {
    return pillars
      .filter((p) => p.status !== "Compliant" && !p.unassessed)
      .flatMap((p) =>
        (p.gaps.length ? p.gaps : ["Control requirements not fully met"]).map((gap) => ({
          law: p.lawRef,
          area: p.title,
          why: gap,
        }))
      );
  }, [pillars]);

  const assessedPillars = pillars.filter((p) => !p.unassessed);
  const compliantCount = assessedPillars.filter((p) => p.status === "Compliant").length;
  const totalPillars = assessedPillars.length || 1;
  const compliancePct = Math.round((compliantCount / totalPillars) * 100);
  const averageScore = Math.round(
    assessedPillars.reduce((sum, p) => sum + (typeof p.score === "number" ? p.score : 0), 0) / totalPillars
  );

  const pillarVisual = useMemo(() => {
    const compliant = assessedPillars.filter((p) => p.status === "Compliant").length;
    const partial = assessedPillars.filter((p) => p.status === "Partially compliant").length;
    const nonCompliant = assessedPillars.filter((p) => p.status === "Non-compliant").length;
    return { compliant, partial, nonCompliant, assessed: assessedPillars.length, total: pillars.length };
  }, [assessedPillars, pillars.length]);

  const masChartData = useMemo(() => {
    return [
      { name: "Compliant", value: pillarVisual.compliant, color: "#16a34a" },
      { name: "Partial", value: pillarVisual.partial, color: "#d97706" },
      { name: "Non-Compliant", value: pillarVisual.nonCompliant, color: "#dc2626" },
      { name: "Unassessed", value: Math.max(0, pillarVisual.total - pillarVisual.assessed), color: "#64748b" },
    ];
  }, [pillarVisual]);

  const masMatrixData = useMemo(() => {
    const statusY = (status: string) =>
      status === "Compliant" ? 3 : status === "Partially compliant" ? 2 : 1;
    return assessedPillars.map((pillar) => ({
      x: pillar.score ?? 0,
      y: statusY(pillar.status),
      z: Math.max(40, (pillar.score ?? 0) / 2),
      name: pillar.title,
      status: pillar.status,
    }));
  }, [assessedPillars]);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Head>
        <title>MAS Assessment Detail</title>
        <meta name="description" content="MAS AI risk assessment result." />
      </Head>

      <Sidebar onLogout={handleLogout} />

      <main className={`mx-auto max-w-7xl space-y-6 px-4 py-8 ${isLoggedIn ? "lg:pl-72" : ""}`}>
        <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">MAS Compliance Result</h1>
            <p className="mt-1 text-sm text-slate-600">
              {data.system_name || "Untitled System"} • {new Date(data.created_at).toLocaleDateString()}
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
              <CardTitle className="text-xl">{data.compliance_score ?? compliancePct}%</CardTitle>
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
              <Badge className={riskClasses(data.overall_risk_level)} variant="outline">
                {data.overall_risk_level}
              </Badge>
            </CardHeader>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardDescription>Compliance Status</CardDescription>
              <Badge className={statusClasses(data.overall_compliance_status)} variant="outline">
                {data.overall_compliance_status}
              </Badge>
            </CardHeader>
          </Card>
        </section>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>High-level MAS compliance interpretation</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            <ul className="space-y-1">
              <li>
                <strong>Risk Level:</strong> {data.overall_risk_level}
              </li>
              <li>
                <strong>Overall Assessment:</strong> {data.overall_compliance_status}
              </li>
              <li>
                <strong>Pillars Assessed:</strong> {totalPillars}/{pillars.length}
              </li>
              <li>
                <strong>Compliant Pillars:</strong> {compliantCount}/{totalPillars}
              </li>
              <li>
                <strong>Compliance Score (Assessed Pillars):</strong> {compliancePct}%
              </li>
              <li>
                <strong>Average Pillar Score:</strong> {averageScore}/100
              </li>
              {data.assessment_mode === "rapid" && (
                <li>
                  <strong>Mode Note:</strong> Provisional quick-scan output. Non-core pillars need Deep Review for
                  complete control validation.
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
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {data.assessment_mode === "rapid"
                ? `Rapid mode outcome: ${data.overall_compliance_status}. Core checks indicate ${compliantCount} compliant pillar(s) out of ${totalPillars} assessed core pillars. This result is provisional; run Deep Review for full 12-pillar legal and control validation.`
                : renderSummaryText(data.summary)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>MAS Compliance Snapshot</CardTitle>
            <CardDescription>
              {compliantCount} of {totalPillars} assessed pillars compliant • Average score: {averageScore}/100
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Overall Compliance</span>
                <span className="font-semibold text-slate-900">{compliancePct}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${compliancePct}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">Average Pillar Score</span>
                <span className="font-semibold text-slate-900">{averageScore}/100</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${averageScore}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>MAS Pillar Risk Matrix</CardTitle>
            <CardDescription>Pillar score (x-axis) vs compliance severity (y-axis)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: "#475569" }}
                    label={{ value: "Score", position: "insideBottom", offset: -4, fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={[0.5, 3.5]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(v) => (v === 3 ? "Compliant" : v === 2 ? "Partial" : "Non-compliant")}
                    tick={{ fontSize: 11, fill: "#475569" }}
                  />
                  <Tooltip
                    formatter={(_, __, payload: any) => [payload?.payload?.status || "", "Status"]}
                    labelFormatter={(_, payload: any) =>
                      payload?.[0]?.payload ? `${payload[0].payload.name} (Score: ${payload[0].payload.x})` : ""
                    }
                  />
                  <Scatter data={masMatrixData} fill="#3b82f6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>MAS Outcome Distribution</CardTitle>
            <CardDescription>Outcome counts including unassessed pillars</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={masChartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#475569" }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {masChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Pillar Breakdown</CardTitle>
            <CardDescription>Status and score across all MAS pillars</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pillars.map((pillar) => (
              <div key={pillar.key as string} className={`rounded-xl border p-4 ${pillar.status === "Compliant" ? "border-emerald-200 bg-emerald-50/50" : pillar.unassessed ? "border-slate-200 bg-slate-50" : "border-red-200 bg-red-50/50"}`}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{pillar.title}</p>
                  {pillar.status === "Compliant" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className="text-sm text-slate-700">
                  {pillar.unassessed
                    ? "Not fully assessed in quick scan"
                    : data.assessment_mode === "rapid"
                      ? rapidScoreModel && String(pillar.key) in rapidScoreModel
                        ? `Core checks met: ${(rapidScoreModel as any)[String(pillar.key)].met
                        }/${(rapidScoreModel as any)[String(pillar.key)].total} (${(rapidScoreModel as any)[String(pillar.key)].pct}%)`
                        : `Indicative core score: ${pillar.score ?? 0}/100`
                      : `Score: ${pillar.score ?? 0}/100`}
                </p>
                {!pillar.unassessed && pillar.gaps.length > 0 && (
                  <p className="mt-2 text-xs text-slate-600">Top gap: {pillar.gaps[0]}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>System Context</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <div>
              <p className="text-slate-500">Owner</p>
              <p className="font-semibold text-slate-800">{data.owner || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-500">Jurisdiction</p>
              <p className="font-semibold text-slate-800">{data.jurisdiction || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-500">Business Use Case</p>
              <p className="font-semibold text-slate-800">{data.business_use_case || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Why It Failed (Law/Control Level)</CardTitle>
            <CardDescription>Mapping of failed controls to MAS FEAT pillar obligations</CardDescription>
          </CardHeader>
          <CardContent>
            {failureRows.length === 0 ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                No failed pillar-level requirement detected in this assessment.
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
      </main>
    </div>
  );
}
