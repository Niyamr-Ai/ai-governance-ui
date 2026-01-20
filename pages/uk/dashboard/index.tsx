"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCcw, Shield, Plus, TrendingUp, AlertTriangle, CheckCircle, CheckCircle2, XCircle } from "lucide-react";
import type { UKAssessmentResult, UKRiskLevel, UKComplianceStatus } from "@/types/uk";
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

export default function UKDashboardPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<UKAssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await backendFetch("/api/uk-compliance");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load assessments");
      }
      const data = await res.json();
      setAssessments(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const summary = useMemo(() => {
    const total = assessments.length;
    const byRisk: Record<UKRiskLevel, number> = {
      "Frontier / High-Impact Model": 0,
      "High-Risk (Sector)": 0,
      "Medium-Risk": 0,
      "Low-Risk": 0,
    };
    const byStatus: Record<UKComplianceStatus, number> = {
      Compliant: 0,
      "Partially compliant": 0,
      "Non-compliant": 0,
    };
    assessments.forEach((a) => {
      byRisk[a.risk_level] = (byRisk[a.risk_level] || 0) + 1;
      byStatus[a.overall_assessment] = (byStatus[a.overall_assessment] || 0) + 1;
    });
    return { total, byRisk, byStatus };
  }, [assessments]);

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      <Sidebar onLogout={handleLogout} /> mx-auto max-w-7xl py-10 px-4 lg:px-6 space-y-8 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1 font-medium uppercase tracking-wide">UK AI Regulatory Framework</p>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-3 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="h-8 w-8 text-emerald-500" />
              </div>
              <span>UK Assessments <span className="gradient-text">Dashboard</span></span>
            </h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium">
              View all UK AI regulatory framework assessments and track compliance status.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-border/50 bg-secondary/30 hover:bg-secondary/50 rounded-xl"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button 
              onClick={() => router.push("/assessment")} 
              variant="hero"
              className="rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Button>
          </div>
        </div>

        {error && (
          <Card className="glass-panel shadow-elevated border-red-200">
            <CardContent className="py-4">
              <p className="text-red-700 font-semibold">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard title="Total assessments" value={summary.total} />
          <SummaryCard
            title="High / Frontier risk"
            value={(summary.byRisk["High-Risk (Sector)"] || 0) + (summary.byRisk["Frontier / High-Impact Model"] || 0)}
          />
          <SummaryCard
            title="Compliant"
            value={summary.byStatus.Compliant || 0}
            subtitle={`Partial: ${summary.byStatus["Partially compliant"] || 0}, Non: ${
              summary.byStatus["Non-compliant"] || 0
            }`}
          />
        </div>

        <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-2xl font-bold text-foreground">Assessments</CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-base">
              Recent UK AI regulatory framework assessments.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
                  <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary relative" />
                </div>
                <span className="text-foreground font-medium ml-3">Loading...</span>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-foreground font-medium">
                  No assessments yet. Run your first assessment to see results here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table className="w-full min-w-[1400px]">
                  <TableHeader>
                    <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-b border-border">
                      <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Name</TableHead>
                      <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Risk Level</TableHead>
                      <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Compliance</TableHead>
                      <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-center">Safety & Security</TableHead>
                      <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-center">Transparency</TableHead>
                      <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-center">Fairness</TableHead>
                      <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-center">Governance</TableHead>
                      <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-center">Contestability</TableHead>
                      <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Sector</TableHead>
                      <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Created</TableHead>
                      <TableHead className="text-right font-bold text-foreground text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assessments.map((a) => {
                      const raw = (a as any).raw_answers || {};
                      const systemName = raw.system_name || raw.name || "—";
                      return (
                        <TableRow key={a.id} className="hover:bg-secondary/20 transition-colors duration-150 border-b border-border/30">
                          <TableCell className="font-semibold text-foreground py-4">
                            {systemName}
                          </TableCell>
                          <TableCell className="py-4">
                            <RiskLevelBadge level={a.risk_level} />
                          </TableCell>
                          <TableCell className="py-4">
                            <ComplianceBadge status={a.overall_assessment} />
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <PrincipleStatusBadge 
                              meetsPrinciple={a.safety_and_security?.meetsPrinciple ?? false}
                              principle="Safety & Security"
                            />
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <PrincipleStatusBadge 
                              meetsPrinciple={a.transparency?.meetsPrinciple ?? false}
                              principle="Transparency"
                            />
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <PrincipleStatusBadge 
                              meetsPrinciple={a.fairness?.meetsPrinciple ?? false}
                              principle="Fairness"
                            />
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <PrincipleStatusBadge 
                              meetsPrinciple={a.governance?.meetsPrinciple ?? false}
                              principle="Governance"
                            />
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <PrincipleStatusBadge 
                              meetsPrinciple={a.contestability?.meetsPrinciple ?? false}
                              principle="Contestability"
                            />
                          </TableCell>
                          <TableCell className="text-foreground font-medium py-4">
                            {a.sector_regulation?.sector || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-medium py-4">
                            {a.created_at
                              ? new Date(a.created_at).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-primary/40 hover:shadow-md transition-all font-medium rounded-xl"
                              onClick={() => router.push(`/uk/${a.id}`)}
                            >
                              View details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, subtitle }: { title: string; value: number; subtitle?: string }) {
  return (
    <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-extrabold gradient-text">{value}</div>
        {subtitle && <p className="text-sm text-muted-foreground font-medium mt-2">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function RiskLevelBadge({ level }: { level: UKRiskLevel }) {
  const color =
    level === "Frontier / High-Impact Model"
      ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
      : level === "High-Risk (Sector)"
      ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
      : level === "Medium-Risk"
      ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
      : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
  return <Badge className={`${color} font-semibold px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all`}>{level}</Badge>;
}

function ComplianceBadge({ status }: { status: UKComplianceStatus }) {
  const color =
    status === "Compliant"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
      : status === "Partially compliant"
      ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
  return (
    <Badge className={`${color} font-semibold px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5`}>
      {status === "Compliant" && <CheckCircle className="w-3.5 h-3.5" />}
      {status === "Partially compliant" && <AlertTriangle className="w-3.5 h-3.5" />}
      {status === "Non-compliant" && <AlertTriangle className="w-3.5 h-3.5" />}
      {status}
    </Badge>
  );
}

function PrincipleStatusBadge({ 
  meetsPrinciple, 
  principle 
}: { 
  meetsPrinciple: boolean; 
  principle: string;
}) {
  if (meetsPrinciple) {
    return (
      <div className="flex flex-col items-center gap-1" title={`${principle}: Met`}>
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        <span className="text-xs text-emerald-700 font-medium">Met</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1" title={`${principle}: Not Met`}>
      <XCircle className="h-5 w-5 text-red-500" />
      <span className="text-xs text-red-700 font-medium">Not Met</span>
    </div>
  );
}
