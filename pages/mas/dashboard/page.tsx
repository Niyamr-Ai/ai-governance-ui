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
import { Loader2, RefreshCcw } from "lucide-react";
import type { MasAssessmentResult, MasComplianceStatus, MasRiskLevel } from "@/ai-governance-backend/types";
import { DashboardInsightsPanel } from "@/components/ui/dashboard-insights";

export default function MasDashboardPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<MasAssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mas-compliance");
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
    const byRisk: Record<MasRiskLevel, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    const byStatus: Record<MasComplianceStatus, number> = {
      Compliant: 0,
      "Partially compliant": 0,
      "Non-compliant": 0,
    };
    assessments.forEach((a) => {
      byRisk[a.overall_risk_level] = (byRisk[a.overall_risk_level] || 0) + 1;
      byStatus[a.overall_compliance_status] =
        (byStatus[a.overall_compliance_status] || 0) + 1;
    });
    return { total, byRisk, byStatus };
  }, [assessments]);

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="container mx-auto max-w-6xl py-10 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-600 mb-1 font-medium">MAS / UK-style AI Risk</p>
          <h1 className="text-3xl font-bold text-gray-900">MAS Assessments Dashboard</h1>
            <p className="text-gray-700 mt-2 font-medium">
            View all MAS AI risk assessments and track risk/compliance status.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
              className="border-gray-300 bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
            <Button 
              onClick={() => router.push("/mas")} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
            New Assessment
          </Button>
        </div>
      </div>

      {error && (
          <Card className="border-red-300 bg-red-50 shadow-sm">
            <CardContent className="py-4">
              <p className="text-red-900 font-semibold">{error}</p>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Total assessments" value={summary.total} />
        <SummaryCard
          title="High / Critical risk"
          value={(summary.byRisk.High || 0) + (summary.byRisk.Critical || 0)}
        />
        <SummaryCard
          title="Compliant"
          value={summary.byStatus.Compliant || 0}
          subtitle={`Partial: ${summary.byStatus["Partially compliant"] || 0}, Non: ${
            summary.byStatus["Non-compliant"] || 0
          }`}
        />
      </div>

      {/* RAG-Powered MAS Compliance Insights */}
      {!loading && assessments.length > 0 && (
        <DashboardInsightsPanel 
          systemsData={assessments}
          regulationType="MAS"
          className="bg-white border-gray-200 shadow-sm"
        />
      )}

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="bg-white">
            <CardTitle className="text-2xl font-bold text-gray-900">Assessments</CardTitle>
            <CardDescription className="text-gray-700 font-medium">Recent MAS AI risk assessments.</CardDescription>
        </CardHeader>
          <CardContent className="bg-white">
          {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin mr-2 text-blue-600" />
                <span className="text-gray-700 font-medium">Loading...</span>
            </div>
          ) : assessments.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-800 font-medium">
              No assessments yet. Run your first assessment to see results here.
                </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-bold text-gray-900">System</TableHead>
                    <TableHead className="font-bold text-gray-900">Risk</TableHead>
                    <TableHead className="font-bold text-gray-900">Compliance</TableHead>
                    <TableHead className="font-bold text-gray-900">Created</TableHead>
                    <TableHead className="text-right font-bold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((a) => (
                    <TableRow key={a.id} className="hover:bg-gray-50">
                    <TableCell>
                        <div className="font-bold text-gray-900">{a.system_name}</div>
                        <div className="text-sm text-gray-700 font-medium">{a.sector}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge level={a.overall_risk_level} />
                    </TableCell>
                    <TableCell>
                      <ComplianceBadge status={a.overall_compliance_status} />
                    </TableCell>
                      <TableCell className="text-sm text-gray-800 font-medium">
                      {a.created_at
                        ? new Date(a.created_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                          className="border-gray-300 bg-white text-gray-900 hover:bg-gray-100 hover:text-gray-900 font-medium"
                        onClick={() => router.push(`/mas/${a.id}`)}
                      >
                        View details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, subtitle }: { title: string; value: number; subtitle?: string }) {
  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="pb-2 bg-white">
        <CardDescription className="text-gray-700 font-semibold">{title}</CardDescription>
        <CardTitle className="text-4xl font-bold text-gray-900">{value}</CardTitle>
        {subtitle && <p className="text-sm text-gray-700 font-medium mt-1">{subtitle}</p>}
      </CardHeader>
    </Card>
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
