"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Clock, ExternalLink, FileText, Send, Shield, User, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { isActionDisabled, getDisabledReason } from "@/lib/lifecycle-governance-helpers";
import { supabase } from "@/utils/supabase/client";
import type { RiskAssessment, RiskLevel, MitigationStatus, AssessmentStatus } from "@/types/risk-assessment";
import type { LifecycleStage } from "@/types/lifecycle";

async function backendFetch(path: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error("User not authenticated");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${normalizedPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

interface RiskDetailProps {
  assessment: RiskAssessment;
  onClose: () => void;
  userRole?: "user" | "admin";
  currentUserId?: string;
  onStatusChange?: () => void;
  lifecycleStage?: LifecycleStage | null;
  systemType?: "EU AI Act" | "MAS" | "UK AI Act" | null;
}

export default function RiskDetail({ assessment, onClose, userRole = "user", currentUserId, onStatusChange, lifecycleStage = null, systemType = null }: RiskDetailProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isUpdatingMitigation, setIsUpdatingMitigation] = useState(false);
  const [localMitigationStatus, setLocalMitigationStatus] = useState<MitigationStatus>(assessment.mitigation_status);

  useEffect(() => {
    setLocalMitigationStatus(assessment.mitigation_status);
  }, [assessment.mitigation_status]);

  const isCreator = currentUserId && assessment.assessed_by === currentUserId;

  const riskBadgeClasses: Record<RiskLevel, string> = {
    low: "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]",
    medium: "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]",
    high: "border-[#F1A4A4] bg-[#FFE0E0] text-[#C71F1F]",
  };

  const mitigationBadgeClasses: Record<MitigationStatus, string> = {
    not_started: "border-[#E2E8F0] bg-[#F8FAFC] text-[#667085]",
    in_progress: "border-[#93C5FD] bg-[#EAF4FF] text-[#2573C2]",
    mitigated: "border-[#86EFAC] bg-[#E8FAEF] text-[#178746]",
  };

  const statusBadgeClasses: Record<AssessmentStatus, string> = {
    draft: "border-[#E2E8F0] bg-[#F8FAFC] text-[#667085]",
    submitted: "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]",
    approved: "border-[#86EFAC] bg-[#E8FAEF] text-[#178746]",
    rejected: "border-[#F1A4A4] bg-[#FFE0E0] text-[#C71F1F]",
  };

  const mitigationIcons: Record<MitigationStatus, JSX.Element> = {
    not_started: <AlertTriangle className="mr-1 h-3 w-3" />,
    in_progress: <Clock className="mr-1 h-3 w-3" />,
    mitigated: <CheckCircle2 className="mr-1 h-3 w-3" />,
  };

  const statusIcons: Record<AssessmentStatus, JSX.Element> = {
    draft: <FileText className="mr-1 h-3 w-3" />,
    submitted: <Clock className="mr-1 h-3 w-3" />,
    approved: <CheckCircle2 className="mr-1 h-3 w-3" />,
    rejected: <XCircle className="mr-1 h-3 w-3" />,
  };

  const mitigationLabels: Record<MitigationStatus, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    mitigated: "Mitigated",
  };

  const statusLabels: Record<AssessmentStatus, string> = {
    draft: "Draft",
    submitted: "Submitted",
    approved: "Approved",
    rejected: "Rejected",
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const res = await backendFetch(`/api/risk-assessments/${assessment.id}/submit`, { method: "POST" });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errorMsg = err.error || "Failed to submit assessment";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      toast.success("Assessment submitted for review");
      if (onStatusChange) onStatusChange();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      setError(null);

      const res = await backendFetch(`/api/risk-assessments/${assessment.id}/approve`, { method: "POST", body: JSON.stringify({}) });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errorMsg = err.error || "Failed to approve assessment";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      toast.success("Assessment approved successfully");
      if (onStatusChange) onStatusChange();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to approve assessment");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      setError("Review comment is required when rejecting an assessment");
      return;
    }

    try {
      setIsRejecting(true);
      setError(null);

      const res = await backendFetch(`/api/risk-assessments/${assessment.id}/reject`, { method: "POST", body: JSON.stringify({ review_comment: rejectComment }) });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to reject assessment");
      }

      if (onStatusChange) onStatusChange();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to reject assessment");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleMitigationStatusChange = async (newStatus: MitigationStatus) => {
    setLocalMitigationStatus(newStatus);

    try {
      setIsUpdatingMitigation(true);
      setError(null);

      const res = await backendFetch(`/api/risk-assessments/${assessment.id}/mitigation-status`, { method: "PUT", body: JSON.stringify({ mitigation_status: newStatus }) });

      if (!res.ok) {
        setLocalMitigationStatus(assessment.mitigation_status);
        const err = await res.json().catch(() => ({}));
        const errorMsg = err.error || "Failed to update mitigation status";
        setError(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      const response = await res.json();
      if (response.assessment?.mitigation_status) {
        setLocalMitigationStatus(response.assessment.mitigation_status);
      }

      const statusLabel = mitigationLabels[newStatus];
      toast.success(`Mitigation status updated to "${statusLabel}"`);
      if (onStatusChange) onStatusChange();
    } catch (err: any) {
      console.error("Error updating mitigation status:", err);
    } finally {
      setIsUpdatingMitigation(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[15px] bg-white">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
        <div>
          <h2 className="text-[17px] font-bold text-[#1E293B]">{getCategoryLabel(assessment.category)}</h2>
          <p className="mt-1 text-[12px] text-[#667085]">Assessment ID: {assessment.id.substring(0, 8)}...</p>
        </div>
        <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-[#667085] hover:bg-[#F1F5F9] transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Status</p>
            <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-semibold ${statusBadgeClasses[assessment.status]}`}>
              {statusIcons[assessment.status]}
              {statusLabels[assessment.status]}
            </span>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Risk Level</p>
            <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-semibold ${riskBadgeClasses[assessment.risk_level]}`}>
              {assessment.risk_level.charAt(0).toUpperCase() + assessment.risk_level.slice(1)} Risk
            </span>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Mitigation Status</p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-semibold ${mitigationBadgeClasses[localMitigationStatus]}`}>
                {mitigationIcons[localMitigationStatus]}
                {mitigationLabels[localMitigationStatus]}
              </span>
              {currentUserId && assessment.status === "submitted" && (() => {
                const mitigationDisabled = isActionDisabled(lifecycleStage, systemType, "update_mitigation", assessment.status);

                return (
                  <div className="relative">
                    <select
                      value={localMitigationStatus}
                      onChange={(e) => handleMitigationStatusChange(e.target.value as MitigationStatus)}
                      disabled={isUpdatingMitigation || mitigationDisabled}
                      className="h-8 w-[130px] appearance-none rounded-[6px] border border-[#CBD5E1] bg-white px-2 pr-8 text-[11px] text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] disabled:opacity-50"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="mitigated">Mitigated</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Assessed At</p>
            <p className="text-[13px] font-medium text-[#1E293B]">{format(new Date(assessment.assessed_at), "MMM dd, yyyy 'at' HH:mm")}</p>
          </div>
          {assessment.assessed_by && (
            <div>
              <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                <User className="h-3 w-3" />
                Created By
              </p>
              <p className="text-[13px] font-medium text-[#1E293B]">{assessment.assessed_by.substring(0, 8)}...</p>
            </div>
          )}
          {assessment.reviewed_by && (
            <div>
              <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                <Shield className="h-3 w-3" />
                Reviewed By
              </p>
              <p className="text-[13px] font-medium text-[#1E293B]">{assessment.reviewed_by.substring(0, 8)}...</p>
            </div>
          )}
          {assessment.reviewed_at && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Reviewed At</p>
              <p className="text-[13px] font-medium text-[#1E293B]">{format(new Date(assessment.reviewed_at), "MMM dd, yyyy 'at' HH:mm")}</p>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-[#1E293B]">Summary</p>
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#475569]">{assessment.summary}</p>
        </div>

        {assessment.evidence_links && assessment.evidence_links.length > 0 && (
          <div>
            <p className="mb-3 text-[13px] font-semibold text-[#1E293B]">Evidence Links</p>
            <div className="space-y-2">
              {assessment.evidence_links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] text-[#3B82F6] transition-colors hover:bg-[#EAF4FF]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="truncate">{link}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {assessment.status === "rejected" && assessment.review_comment && (
          <div className="rounded-[10px] border border-[#F1A4A4] bg-[#FFE0E0] p-4">
            <p className="mb-2 text-[12px] font-semibold text-[#C71F1F]">Review Comment</p>
            <p className="text-[13px] text-[#991B1B]">{assessment.review_comment}</p>
          </div>
        )}

        <div className="space-y-3 border-t border-[#E2E8F0] pt-4">
          {userRole === "user" && isCreator && assessment.status === "draft" && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#F59E0B] text-[13px] font-semibold text-white shadow-sm hover:bg-[#D97706] transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>
          )}

          {currentUserId && assessment.status === "submitted" && (
            <div className="space-y-3">
              {!showRejectForm ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#178746] text-[13px] font-semibold text-white shadow-sm hover:bg-[#146B38] transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isApproving ? "Approving..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    disabled={isRejecting}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#C71F1F] text-[13px] font-semibold text-white shadow-sm hover:bg-[#991B1B] transition-all disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[13px] font-semibold text-[#1E293B]">Rejection Reason *</label>
                    <textarea
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="Explain why this assessment is being rejected..."
                      className="mt-2 min-h-[80px] w-full resize-y rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2.5 text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#C71F1F] focus:ring-2 focus:ring-[#C71F1F]/20"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={isRejecting || !rejectComment.trim()}
                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#C71F1F] text-[13px] font-semibold text-white shadow-sm hover:bg-[#991B1B] transition-all disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectComment("");
                      }}
                      className="h-10 rounded-[8px] border border-[#CBD5E1] bg-white px-5 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {assessment.status === "submitted" && !currentUserId && (
            <p className="text-center text-[13px] text-[#A97B00]">Assessment submitted and pending review</p>
          )}
          {assessment.status === "approved" && (
            <p className="text-center text-[13px] text-[#178746]">✓ Assessment approved - counts toward overall risk level</p>
          )}
          {assessment.status === "rejected" && (
            <p className="text-center text-[13px] text-[#C71F1F]">Assessment rejected - does not count toward overall risk level</p>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-[10px] border border-[#F2CD69] bg-[#FFFBEB] px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#B45309]" />
              <div className="flex-1 space-y-2">
                <p className="text-[13px] font-medium text-[#92400E]">{error}</p>
                {error.includes("Prohibited") && (
                  <div className="mt-2 border-t border-[#F2CD69] pt-2">
                    <p className="mb-1 text-[11px] font-semibold text-[#92400E]">What you can do:</p>
                    <ul className="space-y-0.5 text-[11px] text-[#B45309]">
                      <li>• Review your EU AI Act compliance assessment</li>
                      <li>• Remove prohibited practices from your system</li>
                      <li>• Update the system's risk tier classification</li>
                      <li>• Contact your compliance officer for assistance</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-[#E2E8F0] pt-4">
          <p className="text-[11px] text-[#94A3B8]">
            Created: {format(new Date(assessment.created_at), "MMM dd, yyyy")}
            {assessment.updated_at !== assessment.created_at && <> • Updated: {format(new Date(assessment.updated_at), "MMM dd, yyyy")}</>}
          </p>
        </div>
      </div>
    </div>
  );
}
