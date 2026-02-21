"use client";

import { AlertTriangle, CheckCircle2, Clock, Eye, FileText, XCircle } from "lucide-react";
import type { RiskAssessment, RiskLevel, MitigationStatus, AssessmentStatus } from "@/types/risk-assessment";
import { format } from "date-fns";

interface RiskTableProps {
  assessments: RiskAssessment[];
  onViewDetail: (assessment: RiskAssessment) => void;
  loading?: boolean;
  userRole?: "user" | "admin";
}

export default function RiskTable({ assessments, onViewDetail, loading }: RiskTableProps) {
  const getRiskBadge = (level: RiskLevel) => {
    const variants = {
      low: "bg-[#D9EEFF] text-[#2573C2] border-[#8EC4F8]",
      medium: "bg-[#FFF3CF] text-[#A97B00] border-[#F2CD69]",
      high: "bg-[#FFE0E0] text-[#C71F1F] border-[#F1A4A4]",
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${variants[level]}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  const getMitigationBadge = (status: MitigationStatus) => {
    const variants = {
      not_started: "bg-[#F8FAFC] text-[#667085] border-[#E2E8F0]",
      in_progress: "bg-[#EAF4FF] text-[#2573C2] border-[#93C5FD]",
      mitigated: "bg-[#E8FAEF] text-[#178746] border-[#86EFAC]",
    };

    const icons = {
      not_started: <AlertTriangle className="mr-1 h-3 w-3" />,
      in_progress: <Clock className="mr-1 h-3 w-3" />,
      mitigated: <CheckCircle2 className="mr-1 h-3 w-3" />,
    };

    const labels = {
      not_started: "Not Started",
      in_progress: "In Progress",
      mitigated: "Mitigated",
    };

    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${variants[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const getStatusBadge = (status: AssessmentStatus) => {
    const variants = {
      draft: "bg-[#F8FAFC] text-[#667085] border-[#E2E8F0]",
      submitted: "bg-[#FFF3CF] text-[#A97B00] border-[#F2CD69]",
      approved: "bg-[#E8FAEF] text-[#178746] border-[#86EFAC]",
      rejected: "bg-[#FFE0E0] text-[#C71F1F] border-[#F1A4A4]",
    };

    const icons = {
      draft: <FileText className="mr-1 h-3 w-3" />,
      submitted: <Clock className="mr-1 h-3 w-3" />,
      approved: <CheckCircle2 className="mr-1 h-3 w-3" />,
      rejected: <XCircle className="mr-1 h-3 w-3" />,
    };

    const labels = {
      draft: "Draft",
      submitted: "Submitted",
      approved: "Approved",
      rejected: "Rejected",
    };

    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${variants[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
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
      <div className="flex items-center justify-center py-16 text-[#667085]">
        Loading risk assessments...
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-[#667085]">
        No risk assessments found. Create your first assessment to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Category</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Risk Level</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Status</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Mitigation Status</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Assessed At</th>
            <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {assessments.map((assessment) => (
            <tr key={assessment.id} className="transition-colors hover:bg-[#F8FAFC]">
              <td className="px-6 py-4 text-[13px] font-medium text-[#1E293B]">{getCategoryLabel(assessment.category)}</td>
              <td className="px-6 py-4">{getRiskBadge(assessment.risk_level)}</td>
              <td className="px-6 py-4">{getStatusBadge(assessment.status)}</td>
              <td className="px-6 py-4">{getMitigationBadge(assessment.mitigation_status)}</td>
              <td className="px-6 py-4 text-[13px] text-[#667085]">{format(new Date(assessment.assessed_at), "MMM dd, yyyy")}</td>
              <td className="px-6 py-4">
                <button
                  type="button"
                  onClick={() => onViewDetail(assessment)}
                  className="flex items-center gap-1 rounded-[8px] bg-[#EAF4FF] px-3 py-1.5 text-[12px] font-semibold text-[#3B82F6] transition-all hover:bg-[#3B82F6] hover:text-white"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
