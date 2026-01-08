"use client";

/**
 * RiskTable Component
 * 
 * Displays a table of risk assessments for an AI system.
 * Shows category, risk level, mitigation status, and assessment date.
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, AlertTriangle, CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import type { RiskAssessment, RiskLevel, MitigationStatus, AssessmentStatus } from "@/ai-governance-backend/types/risk-assessment";
import { format } from "date-fns";

interface RiskTableProps {
  assessments: RiskAssessment[];
  onViewDetail: (assessment: RiskAssessment) => void;
  loading?: boolean;
  userRole?: "user" | "admin";
}

export default function RiskTable({ assessments, onViewDetail, loading, userRole = 'user' }: RiskTableProps) {
  const getRiskBadge = (level: RiskLevel) => {
    const variants = {
      low: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50 hover:bg-emerald-800/70",
      medium: "bg-amber-900/50 text-amber-300 border-amber-700/50 hover:bg-amber-800/70",
      high: "bg-red-900/50 text-red-300 border-red-700/50 hover:bg-red-800/70",
    };
    return (
      <Badge className={variants[level]}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const getMitigationBadge = (status: MitigationStatus) => {
    const variants = {
      not_started: "bg-slate-800/50 text-slate-400 border-slate-700/50",
      in_progress: "bg-blue-900/50 text-blue-300 border-blue-700/50",
      mitigated: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
    };
    
    const icons = {
      not_started: <AlertTriangle className="h-3 w-3 mr-1" />,
      in_progress: <Clock className="h-3 w-3 mr-1" />,
      mitigated: <CheckCircle2 className="h-3 w-3 mr-1" />,
    };

    const labels = {
      not_started: "Not Started",
      in_progress: "In Progress",
      mitigated: "Mitigated",
    };

    return (
      <Badge className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const getStatusBadge = (status: AssessmentStatus) => {
    const variants = {
      draft: "bg-slate-800/50 text-slate-400 border-slate-700/50",
      submitted: "bg-amber-900/50 text-amber-300 border-amber-700/50",
      approved: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
      rejected: "bg-red-900/50 text-red-300 border-red-700/50",
    };

    const icons = {
      draft: <FileText className="h-3 w-3 mr-1" />,
      submitted: <Clock className="h-3 w-3 mr-1" />,
      approved: <CheckCircle2 className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
    };

    const labels = {
      draft: "Draft",
      submitted: "Submitted",
      approved: "Approved",
      rejected: "Rejected",
    };

    return (
      <Badge className={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      bias: "Bias & Fairness",
      robustness: "Robustness & Performance",
      privacy: "Privacy & Data Leakage",
      explainability: "Explainability",
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-400">
        Loading risk assessments...
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No risk assessments found. Create your first assessment to get started.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700/50 overflow-hidden">
      <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-800/80 hover:bg-slate-800/80 border-b border-slate-700">
                        <TableHead className="font-bold text-white text-xs uppercase tracking-wider">
                          Category
                        </TableHead>
                        <TableHead className="font-bold text-white text-xs uppercase tracking-wider">
                          Risk Level
                        </TableHead>
                        <TableHead className="font-bold text-white text-xs uppercase tracking-wider">
                          Status
                        </TableHead>
                        <TableHead className="font-bold text-white text-xs uppercase tracking-wider">
                          Mitigation Status
                        </TableHead>
                        <TableHead className="font-bold text-white text-xs uppercase tracking-wider">
                          Assessed At
                        </TableHead>
                        <TableHead className="font-bold text-white text-xs uppercase tracking-wider">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
        <TableBody>
          {assessments.map((assessment) => (
            <TableRow
              key={assessment.id}
              className="hover:bg-slate-800/40 transition-colors duration-150 border-b border-slate-800/50"
            >
                            <TableCell className="text-slate-200 font-medium py-4">
                              {getCategoryLabel(assessment.category)}
                            </TableCell>
                            <TableCell>{getRiskBadge(assessment.risk_level)}</TableCell>
                            <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                            <TableCell>{getMitigationBadge(assessment.mitigation_status)}</TableCell>
                            <TableCell className="text-slate-300 font-medium py-4">
                              {format(new Date(assessment.assessed_at), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewDetail(assessment)}
                                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
