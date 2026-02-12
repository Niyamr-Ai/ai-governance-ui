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
import type { RiskAssessment, RiskLevel, MitigationStatus, AssessmentStatus } from "@/types/risk-assessment";
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
      low: "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-semibold px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all",
      medium: "bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-700 border border-amber-200/60 font-semibold px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all",
      high: "bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 border border-red-200/60 font-semibold px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all",
    };
    return (
      <Badge className={variants[level]}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const getMitigationBadge = (status: MitigationStatus) => {
    const variants = {
      not_started: "bg-secondary/30 text-muted-foreground border-border/50",
      in_progress: "bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-700 border border-blue-200/60",
      mitigated: "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200/60",
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
      draft: "bg-secondary/30 text-muted-foreground border-border/50",
      submitted: "bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-700 border border-amber-200/60",
      approved: "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200/60",
      rejected: "bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 border border-red-200/60",
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
      <div className="text-center py-8 text-muted-foreground">
        Loading risk assessments...
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No risk assessments found. Create your first assessment to get started.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-b border-border">
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">
                          Category
                        </TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">
                          Risk Level
                        </TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">
                          Status
                        </TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">
                          Mitigation Status
                        </TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">
                          Assessed At
                        </TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
        <TableBody>
          {assessments.map((assessment) => (
            <TableRow
              key={assessment.id}
              className="hover:bg-secondary/20 transition-colors duration-150 border-b border-border/30"
            >
                            <TableCell className="text-foreground font-medium py-4">
                              {getCategoryLabel(assessment.category)}
                            </TableCell>
                            <TableCell>{getRiskBadge(assessment.risk_level)}</TableCell>
                            <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                            <TableCell>{getMitigationBadge(assessment.mitigation_status)}</TableCell>
                            <TableCell className="text-muted-foreground font-medium py-4">
                              {format(new Date(assessment.assessed_at), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewDetail(assessment)}
                                className="text-primary hover:text-primary/80 hover:bg-primary/10 rounded-xl"
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
