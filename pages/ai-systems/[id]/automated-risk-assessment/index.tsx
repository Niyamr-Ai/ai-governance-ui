"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, AlertTriangle, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { AutomatedRiskAssessment } from "@/types/automated-risk-assessment";
import Sidebar from "@/components/sidebar";
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

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case "Critical":
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
    case "High":
      return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100";
    case "Medium":
      return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
    case "Low":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
    default:
      return "bg-secondary/80 text-muted-foreground border-border/50";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 9) return "#ef4444"; // red
  if (score >= 7) return "#f97316"; // orange
  if (score >= 4) return "#f59e0b"; // amber
  return "#10b981"; // emerald
};

const getScoreColorLight = (score: number) => {
  if (score >= 9) return "#dc2626"; // red
  if (score >= 7) return "#ea580c"; // orange
  if (score >= 4) return "#d97706"; // amber
  return "#059669"; // emerald
};

// Helper function to format JSON strings as readable text and convert markdown to HTML
function formatTextContent(text: string): string {
  if (!text) return "";
  
  // Try to parse as JSON
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'object' && parsed !== null) {
      return formatObjectAsText(parsed);
    }
  } catch {
    // Not JSON, continue to markdown processing
  }
  
  // Convert markdown syntax to formatted text
  let formatted = text;
  
  // Convert ## headings to bold text with spacing
  formatted = formatted.replace(/^##\s+(.+)$/gm, '\n\n**$1**\n');
  
  // Convert ### headings
  formatted = formatted.replace(/^###\s+(.+)$/gm, '\n\n**$1**\n');
  
  // Convert bullet points (- or *) - preserve them for HTML rendering
  formatted = formatted.replace(/^[-*]\s+(.+)$/gm, '• $1');
  
  // Convert numbered lists (keep the numbers)
  // formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '$1');
  
  // Clean up extra newlines (but keep double newlines for spacing)
  formatted = formatted.replace(/\n{4,}/g, '\n\n\n');
  
  return formatted.trim();
}

function formatObjectAsText(obj: any, indent = 0): string {
  if (typeof obj !== 'object' || obj === null) {
    return String(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        return `${'  '.repeat(indent)}${idx + 1}. ${formatObjectAsText(item, indent + 1)}`;
      }
      return `${'  '.repeat(indent)}• ${item}`;
    }).join('\n\n');
  }
  
  return Object.entries(obj)
    .map(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return `\n${'  '.repeat(indent)}## ${formattedKey}\n${formatObjectAsText(value, indent + 1)}`;
      }
      if (Array.isArray(value)) {
        return `\n${'  '.repeat(indent)}**${formattedKey}**:\n${formatObjectAsText(value, indent + 1)}`;
      }
      return `${'  '.repeat(indent)}**${formattedKey}**: ${value}`;
    })
    .join('\n\n');
}

export default function AutomatedRiskAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const systemId = params?.id as string;
  const [assessment, setAssessment] = useState<AutomatedRiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const fetchAssessment = async () => {
    if (!systemId) return;
    
    try {
      setLoading(true);
      setError(null);
      const res = await backendFetch(`/api/ai-systems/${systemId}/automated-risk-assessment`);
      
      if (res.status === 404) {
        setAssessment(null);
        return;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch assessment");
      }
      
      const data = await res.json();
      setAssessment(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error fetching assessment");
    } finally {
      setLoading(false);
    }
  };

  const generateAssessment = async () => {
    if (!systemId) return;
    
    try {
      setGenerating(true);
      setError(null);
      const res = await backendFetch(`/api/ai-systems/${systemId}/automated-risk-assessment`, {
        method: "POST",
        body: JSON.stringify({ trigger_type: "manual" }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to generate assessment");
      }
      
      const data = await res.json();
      setAssessment(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error generating assessment");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [systemId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
       <Sidebar onLogout={handleLogout} />
        <div className={`flex items-center justify-center min-h-screen ${isLoggedIn ? 'lg:pl-72' : ''}`}>
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary relative" />
            </div>
            <p className="text-foreground text-lg font-medium">Loading risk assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar onLogout={handleLogout} />

        <div className={`flex items-center justify-center min-h-screen p-6 ${isLoggedIn ? 'lg:pl-72' : ''}`}>
          <Card className="max-w-md glass-panel shadow-elevated border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={fetchAssessment} variant="outline" className="w-full rounded-xl">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar onLogout={handleLogout} />

        <div className={`flex items-center justify-center min-h-screen p-6 ${isLoggedIn ? 'lg:pl-72' : ''}`}>
          <Card className="max-w-md glass-panel shadow-elevated border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">No Automated Risk Assessment</CardTitle>
              <CardDescription className="text-muted-foreground">
                Generate a comprehensive automated risk assessment for this AI system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The automated risk assessment analyzes your system across 5 dimensions:
                Technical, Operational, Legal/Regulatory, Ethical/Societal, and Business risks.
              </p>
              <Button
                onClick={generateAssessment}
                disabled={generating}
                className="w-full bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all rounded-xl"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Generate Assessment
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full rounded-xl"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Prepare heatmap data
  const heatmapData = [
    { dimension: "Technical", score: assessment.technical_risk_score },
    { dimension: "Operational", score: assessment.operational_risk_score },
    { dimension: "Legal/Regulatory", score: assessment.legal_regulatory_risk_score },
    { dimension: "Ethical/Societal", score: assessment.ethical_societal_risk_score },
    { dimension: "Business", score: assessment.business_risk_score },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      <div className={`container mx-auto max-w-7xl py-10 px-4 lg:px-6 space-y-8 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-3 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <span>Automated <span className="gradient-text">Risk Assessment</span></span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg">
              System ID: {systemId?.substring(0, 8)}... • Assessed: {new Date(assessment.assessed_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="border-border/50 bg-secondary/30 hover:bg-secondary/50 rounded-xl"
            >
              Back to Dashboard
            </Button>
            <Button
              onClick={generateAssessment}
              disabled={generating}
              className="bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all rounded-xl"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Overall Risk Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Overall Risk Level
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <AlertTriangle className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <Badge className={`${getRiskLevelColor(assessment.overall_risk_level)} text-lg px-4 py-2 font-bold`} variant="outline">
                {assessment.overall_risk_level}
              </Badge>
            </CardContent>
          </Card>
          <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Composite Score
              </CardTitle>
              <div className="p-2 bg-accent/10 rounded-lg border border-accent/20">
                <Shield className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold gradient-text">{assessment.composite_score.toFixed(2)}</div>
              <p className="text-muted-foreground text-sm mt-2">out of 10</p>
            </CardContent>
          </Card>
          <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Trigger Type
              </CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-medium px-3 py-1.5">
                {assessment.trigger_type.replace('_', ' ')}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Risk Heatmap */}
        <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">Risk Dimension Heatmap</CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-base">
              Visual representation of risk scores across 5 dimensions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis 
                  dataKey="dimension" 
                  stroke="#64748b" 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                />
                <YAxis 
                  domain={[0, 10]} 
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px -8px rgba(15, 23, 42, 0.12)",
                    color: "#1e293b",
                  }}
                  labelStyle={{ color: "#1e293b", fontWeight: 600 }}
                />
                <Bar dataKey="score" radius={[12, 12, 0, 0]}>
                  {heatmapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getScoreColorLight(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-slate max-w-none">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed text-base">{assessment.executive_summary}</p>
            </div>
          </CardContent>
        </Card>

        {/* Risk Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(assessment.dimension_details).map(([key, detail]: [string, any]) => (
            <Card key={key} className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="border-b border-border/30 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground capitalize">
                    {key.replace('_', ' ')} Risk
                  </CardTitle>
                  <Badge className={`${getRiskLevelColor(
                    detail.score >= 9 ? 'Critical' : 
                    detail.score >= 7 ? 'High' : 
                    detail.score >= 4 ? 'Medium' : 'Low'
                  )} font-bold px-3 py-1.5`}>
                    {detail.score}/10
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Rationale</h4>
                  <p className="text-foreground text-sm leading-relaxed">{detail.rationale}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Key Findings</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-foreground">
                    {detail.key_findings.map((finding: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{finding}</li>
                    ))}
                  </ul>
                </div>
                {detail.compliance_gaps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-600 mb-2 uppercase tracking-wide">Compliance Gaps</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-red-700">
                      {detail.compliance_gaps.map((gap: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-foreground">
                    {detail.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Compliance Checklist */}
        <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              Compliance Checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {assessment.compliance_checklist.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 hover:border-primary/30 transition-all"
                >
                  {item.status === 'compliant' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  ) : item.status === 'non_compliant' ? (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-foreground font-semibold">{item.item}</span>
                      <Badge
                        className={
                          item.status === 'compliant'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : item.status === 'non_compliant'
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }
                        variant="outline"
                      >
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{item.category}</span>
                      {item.regulation_reference && (
                        <>
                          <span>•</span>
                          <span>{item.regulation_reference}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Findings */}
        <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">Detailed Findings</CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-base">
              Comprehensive analysis of all identified risks and compliance gaps
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground">
              <div 
                className="text-foreground whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatTextContent(assessment.detailed_findings)
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                    .replace(/•/g, '<span class="text-primary mr-2 font-bold">•</span>')
                    .replace(/\n/g, '<br />')
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Remediation Plan */}
        <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">Remediation Plan</CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-base">
              Prioritized actions to address identified risks
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground">
              <div 
                className="text-foreground whitespace-pre-wrap leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatTextContent(assessment.remediation_plan)
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                    .replace(/•/g, '<span class="text-primary mr-2 font-bold">•</span>')
                    .replace(/\n/g, '<br />')
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Re-assessment Timeline */}
        {assessment.re_assessment_timeline && (
          <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                Re-assessment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-li:text-foreground">
                <div 
                  className="text-foreground whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: formatTextContent(assessment.re_assessment_timeline || '')
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                      .replace(/•/g, '<span class="text-primary mr-2 font-bold">•</span>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

