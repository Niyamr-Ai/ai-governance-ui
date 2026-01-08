// @ts-nocheck
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  FileText,
  Eye,
  TrendingUp,
  Ban,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Risk Tier badge styles
const getRiskTierClasses = (tier) => {
  switch (tier) {
    case "Minimal-Risk":
      return "bg-emerald-900/50 text-emerald-300 border-emerald-700/50";
    case "Limited-Risk":
      return "bg-amber-900/50 text-amber-300 border-amber-700/50";
    case "High-Risk":
      return "bg-orange-900/50 text-orange-300 border-orange-700/50";
    case "Prohibited":
    case "Unacceptable":
      return "bg-red-900/50 text-red-300 border-red-700/50";
    default:
      return "bg-slate-800/50 text-slate-300 border-slate-700/50";
  }
};

// Compliance Status badge styles
const getComplianceStatusClasses = (status) => {
  switch (status) {
    case "Compliant":
      return "bg-emerald-600/80 text-white border-emerald-500/50";
    case "Partial":
      return "bg-amber-600/80 text-white border-amber-500/50";
    case "Non-Compliant":
      return "bg-red-600/80 text-white border-red-500/50";
    default:
      return "bg-slate-600/80 text-white border-slate-500/50";
  }
};

const highRiskObligationLabels = {
  riskManagement: "Risk Management",
  dataQuality: "Data Quality",
  documentation: "Documentation",
  humanOversight: "Human Oversight",
  accuracy: "Accuracy",
  conformityAssessment: "Conformity Assessment",
};

const transparencyLabels = {
  aiIdentityDisclosed: "AI Identity Disclosed",
  syntheticContentLabeled: "Synthetic Content Labeled",
  emotionBioNotice: "Emotion/Biometric Notice",
};

const monitoringFRIALabels = {
  postMarketMonitoring: "Post-Market Monitoring",
  incidentReporting: "Incident Reporting",
  friaCompleted: "Fundamental Rights Impact Assessment (FRIA) Completed",
};

export default function ComplianceResultPage() {
  const { id } = useParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchResult() {
      try {
        const res = await fetch(`/api/compliance/${id}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setResult(data);
      } catch (err) {
        setError("Unable to load compliance result.");
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-xl mt-4 text-slate-300">Loading compliance data...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
        <Alert variant="destructive" className="max-w-md border-red-700/50 bg-red-900/20 backdrop-blur-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-red-300">Error</AlertTitle>
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    risk_tier,
    compliance_status,
    prohibited_practices_detected,
    high_risk_missing = [],
    high_risk_all_fulfilled,
    transparency_required,
    transparency_missing = [],
    monitoring_required,
    post_market_monitoring,
    incident_reporting,
    fria_completed,
    summary,
    reference = {},
    created_at,
  } = result;

  // Calculate compliance metrics for charts
  const totalObligations = Object.keys(highRiskObligationLabels).length;
  const fulfilledObligations = totalObligations - high_risk_missing.length;
  const compliancePercentage = Math.round((fulfilledObligations / totalObligations) * 100);

  // Enhanced color palette
  const COLORS = {
    fulfilled: "#10b981",
    fulfilledGradient: "url(#fulfilledGradient)",
    missing: "#ef4444",
    missingGradient: "url(#missingGradient)",
    pending: "#f59e0b",
    info: "#3b82f6",
    success: "#22c55e",
    danger: "#dc2626",
  };

  // Data for pie chart - Obligations Status
  const obligationsData = [
    { name: "Fulfilled", value: fulfilledObligations, color: COLORS.fulfilled, gradientId: "fulfilledGradient" },
    { name: "Missing", value: high_risk_missing.length, color: COLORS.missing, gradientId: "missingGradient" },
  ];

  // Data for bar chart - Individual Obligations with varied colors
  const obligationColors = [
    { fulfilled: "#10b981", missing: "#ef4444" },
    { fulfilled: "#3b82f6", missing: "#dc2626" },
    { fulfilled: "#8b5cf6", missing: "#dc2626" },
    { fulfilled: "#06b6d4", missing: "#dc2626" },
    { fulfilled: "#f59e0b", missing: "#dc2626" },
    { fulfilled: "#ec4899", missing: "#dc2626" },
  ];

  const obligationsBreakdown = Object.entries(highRiskObligationLabels).map(([key, label], idx) => {
    const isFulfilled = !high_risk_missing.includes(key);
    const colorSet = obligationColors[idx % obligationColors.length];
    return {
      name: label.split(" ")[0],
      fullName: label,
      fulfilled: isFulfilled,
      value: isFulfilled ? 100 : 0,
      color: isFulfilled ? colorSet.fulfilled : colorSet.missing,
      gradientId: `obligationGradient-${idx}`,
    };
  });

  // Data for monitoring status
  const monitoringData = monitoring_required
    ? [
        { name: "Post-Market Monitoring", value: post_market_monitoring ? 100 : 0 },
        { name: "Incident Reporting", value: incident_reporting ? 100 : 0 },
        { name: "FRIA Completed", value: fria_completed ? 100 : 0 },
      ]
    : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Compliance Dashboard</h1>
            <p className="text-purple-300 mt-2 text-lg font-medium">EU AI Act Compliance Assessment Result</p>
            {created_at && (
              <p className="text-sm text-slate-400 mt-1">
                Assessment Date: {new Date(created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          <div className="flex gap-2">
          </div>
        </div>

        {/* Alert Banner */}
        {prohibited_practices_detected && (
          <Alert variant="destructive" className="border-red-700/50 bg-red-900/30 backdrop-blur-sm">
            <Ban className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-300 font-bold">Prohibited Practices Detected</AlertTitle>
            <AlertDescription className="text-red-200">
              Immediate action required. This AI system engages in prohibited practices under the EU AI Act.
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Risk Tier</CardTitle>
              <Shield className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getRiskTierClasses(risk_tier)}`}>
                {risk_tier}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Compliance Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold border ${getComplianceStatusClasses(compliance_status)}`}>
                {compliance_status}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Obligations Fulfilled</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {fulfilledObligations}/{totalObligations}
              </div>
              <div className="text-sm text-slate-400 mt-1">{compliancePercentage}% Complete</div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Prohibited Practices</CardTitle>
              <Ban className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {prohibited_practices_detected ? (
                  <span className="text-red-400">Detected</span>
                ) : (
                  <span className="text-emerald-400">None</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Obligations Pie Chart */}
          <Card className="shadow-lg border-slate-700/50 bg-slate-900/60 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-b border-slate-700/50">
              <CardTitle className="text-white">Obligations Overview</CardTitle>
              <CardDescription className="text-slate-400">High-risk obligations fulfillment status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex items-center justify-center">
              <ChartContainer
                config={{
                  fulfilled: { color: COLORS.fulfilled },
                  missing: { color: COLORS.missing },
                }}
                className="h-[320px] w-full"
              >
                <PieChart>
                  <defs>
                    <linearGradient id="fulfilledGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="missingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <Pie
                    data={obligationsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value }) => value > 0 ? `${name}\n${(percent * 100).toFixed(0)}%` : ""}
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {obligationsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.gradientId ? `url(#${entry.gradientId})` : entry.color}
                        style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="bg-slate-800/95 backdrop-blur-sm p-4 border border-slate-700/50 rounded-lg shadow-xl">
                            <p className="font-bold text-lg mb-1 text-white">{data.name}</p>
                            <p className="text-2xl font-extrabold" style={{ color: data.payload.color }}>
                              {data.value} {data.value === 1 ? "Obligation" : "Obligations"}
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                              {((data.value / totalObligations) * 100).toFixed(1)}% of total
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Obligations Bar Chart */}
          <Card className="shadow-lg border-slate-700/50 bg-slate-900/60 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-b border-slate-700/50">
              <CardTitle className="text-white">Obligations Breakdown</CardTitle>
              <CardDescription className="text-slate-400">Individual obligation fulfillment status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 overflow-hidden">
              <div className="w-full h-[320px]">
                <ChartContainer
                  config={{
                    fulfilled: { color: COLORS.fulfilled },
                    missing: { color: COLORS.missing },
                  }}
                  className="h-full w-full"
                >
                  <BarChart data={obligationsBreakdown} margin={{ top: 10, right: 20, left: 10, bottom: 70 }}>
                    <defs>
                      {obligationsBreakdown.map((item, idx) => (
                        <linearGradient key={`obligationGradient-${idx}`} id={`obligationGradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={item.color} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={item.color} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#cbd5e1", fontSize: 11, fontWeight: 500 }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      axisLine={{ stroke: "#475569" }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      axisLine={{ stroke: "#475569" }}
                      width={35}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-800/95 backdrop-blur-sm p-4 border border-slate-700/50 rounded-lg shadow-xl">
                              <p className="font-bold text-lg mb-2 text-white">{data.fullName}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-2xl ${data.fulfilled ? "text-emerald-400" : "text-red-400"}`}>
                                  {data.fulfilled ? "✅" : "❌"}
                                </span>
                                <span className={`font-extrabold text-xl ${data.fulfilled ? "text-emerald-400" : "text-red-400"}`}>
                                  {data.fulfilled ? "Fulfilled" : "Missing"}
                                </span>
                              </div>
                              <p className="text-sm text-slate-400 mt-2">Score: {data.value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[8, 8, 0, 0]}
                      style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
                    >
                      {obligationsBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#obligationGradient-${index})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* High-Risk Obligations */}
          <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-purple-400" />
                High-Risk Obligations
              </CardTitle>
              <CardDescription className="text-slate-400">
                {high_risk_all_fulfilled
                  ? "All obligations are fulfilled"
                  : `${high_risk_missing.length} obligation(s) missing`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(highRiskObligationLabels).map(([key, label]) => {
                  const isFulfilled = !high_risk_missing.includes(key);
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isFulfilled
                          ? "bg-emerald-900/30 border-emerald-700/50"
                          : "bg-red-900/30 border-red-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isFulfilled ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-400" />
                        )}
                        <span className="font-medium text-white">{label}</span>
                      </div>
                      <Badge
                        variant={isFulfilled ? "default" : "destructive"}
                        className={isFulfilled 
                          ? "bg-emerald-600/80 text-white border-emerald-500/50" 
                          : "bg-red-600/80 text-white border-red-500/50"}
                      >
                        {isFulfilled ? "Fulfilled" : "Missing"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Transparency & Monitoring */}
          <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Eye className="h-5 w-5 text-purple-400" />
                Transparency & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transparency_required ? (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Transparency Requirements</h4>
                    <div className="space-y-2">
                      {Object.entries(transparencyLabels).map(([key, label]) => {
                        const isFulfilled = !transparency_missing.includes(key);
                        return (
                          <div
                            key={key}
                            className={`flex items-center gap-2 p-2 rounded ${
                              isFulfilled ? "bg-emerald-900/30 border border-emerald-700/50" : "bg-red-900/30 border border-red-700/50"
                            }`}
                          >
                            {isFulfilled ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400" />
                            )}
                            <span className="text-sm text-slate-300">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-300">
                      <strong className="text-white">Transparency Requirements:</strong> Not required for this AI system. 
                      Transparency obligations (Article 50) apply to limited-risk AI systems that 
                      interact with humans, generate synthetic content, or perform emotion/biometric recognition.
                    </p>
                  </div>
                )}

                {monitoring_required ? (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Monitoring & FRIA</h4>
                    <div className="space-y-2">
                      <div
                        className={`flex items-center gap-2 p-2 rounded ${
                          post_market_monitoring ? "bg-emerald-900/30 border border-emerald-700/50" : "bg-red-900/30 border border-red-700/50"
                        }`}
                      >
                        {post_market_monitoring ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-sm text-slate-300">
                          {monitoringFRIALabels.postMarketMonitoring}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-2 p-2 rounded ${
                          incident_reporting ? "bg-emerald-900/30 border border-emerald-700/50" : "bg-red-900/30 border border-red-700/50"
                        }`}
                      >
                        {incident_reporting ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-sm text-slate-300">
                          {monitoringFRIALabels.incidentReporting}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-2 p-2 rounded ${
                          fria_completed ? "bg-emerald-900/30 border border-emerald-700/50" : "bg-red-900/30 border border-red-700/50"
                        }`}
                      >
                        {fria_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="text-sm text-slate-300">
                          {monitoringFRIALabels.friaCompleted}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-300">
                      <strong className="text-white">Monitoring & FRIA:</strong> Not required for this AI system. 
                      Post-market monitoring and Fundamental Rights Impact Assessment (FRIA) 
                      are mandatory for high-risk AI systems only.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-slate-700/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-purple-400" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200 leading-relaxed text-lg">{summary}</p>
          </CardContent>
        </Card>

        {/* References Section */}
        {Object.keys(reference).length > 0 && (
          <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Regulatory References</CardTitle>
              <CardDescription className="text-slate-400">EU AI Act articles and provisions referenced</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(reference).map(([key, value]) => (
                  <div key={key} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="font-semibold text-white mb-1">{key}</div>
                    <div className="text-sm text-slate-300">
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
