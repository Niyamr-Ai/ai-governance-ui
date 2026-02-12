"use client";

/**
 * RiskDetail Component
 * 
 * Displays detailed information about a specific risk assessment.
 * Shows summary, metrics, risk level, mitigation status, and evidence links.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ExternalLink, AlertTriangle, CheckCircle2, Clock, FileText, XCircle, Send, User, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { RiskAssessment, RiskLevel, MitigationStatus, AssessmentStatus } from "@/types/risk-assessment";
import { format } from "date-fns";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { isActionDisabled, getDisabledReason } from "@/lib/lifecycle-governance-helpers";
import type { LifecycleStage } from "@/types/lifecycle";
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

interface RiskDetailProps {
  assessment: RiskAssessment;
  onClose: () => void;
  userRole?: 'user' | 'admin';
  currentUserId?: string;
  onStatusChange?: () => void; // Callback to refresh data after status change
  lifecycleStage?: LifecycleStage | null; // For EU AI Act lifecycle governance
  systemType?: 'EU AI Act' | 'MAS' | 'UK AI Act' | null;
}

export default function RiskDetail({ 
  assessment, 
  onClose, 
  userRole = 'user',
  currentUserId,
  onStatusChange,
  lifecycleStage = null,
  systemType = null
}: RiskDetailProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isUpdatingMitigation, setIsUpdatingMitigation] = useState(false);

  const isCreator = currentUserId && assessment.assessed_by === currentUserId;
  const getRiskBadge = (level: RiskLevel) => {
    const variants = {
      low: "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-semibold px-4 py-2 rounded-full shadow-md",
      medium: "bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-700 border border-amber-200/60 font-semibold px-4 py-2 rounded-full shadow-md",
      high: "bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 border border-red-200/60 font-semibold px-4 py-2 rounded-full shadow-md",
    };
    return (
      <Badge className={variants[level]}>
        {level.charAt(0).toUpperCase() + level.slice(1)} Risk
      </Badge>
    );
  };

  const getMitigationBadge = (status: MitigationStatus) => {
    const variants = {
      not_started: "bg-secondary/30 text-muted-foreground border-border/50",
      in_progress: "bg-gradient-to-r from-blue-50 to-blue-100/80 text-blue-700 border border-blue-200/60 font-semibold px-4 py-2 rounded-full shadow-md",
      mitigated: "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-semibold px-4 py-2 rounded-full shadow-md",
    };

    const icons = {
      not_started: <AlertTriangle className="h-4 w-4 mr-1" />,
      in_progress: <Clock className="h-4 w-4 mr-1" />,
      mitigated: <CheckCircle2 className="h-4 w-4 mr-1" />,
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

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      bias: "Bias & Fairness",
      robustness: "Robustness & Performance",
      privacy: "Privacy & Data Leakage",
      explainability: "Explainability",
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: AssessmentStatus) => {
    const variants = {
      draft: "bg-secondary/30 text-muted-foreground border-border/50 font-semibold px-4 py-2 rounded-full shadow-md",
      submitted: "bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-700 border border-amber-200/60 font-semibold px-4 py-2 rounded-full shadow-md",
      approved: "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-semibold px-4 py-2 rounded-full shadow-md",
      rejected: "bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 border border-red-200/60 font-semibold px-4 py-2 rounded-full shadow-md",
    };

    const icons = {
      draft: <FileText className="h-4 w-4 mr-1" />,
      submitted: <Clock className="h-4 w-4 mr-1" />,
      approved: <CheckCircle2 className="h-4 w-4 mr-1" />,
      rejected: <XCircle className="h-4 w-4 mr-1" />,
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const res = await backendFetch(`/api/risk-assessments/${assessment.id}/submit`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errorMsg = err.error || "Failed to submit assessment";
        
        // Show toast for prohibited system errors
        if (err.prohibited_system) {
          toast.error(errorMsg, { duration: 6000 });
        } else {
          toast.error(errorMsg, { duration: 5000 });
        }
        
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

      const res = await backendFetch(`/api/risk-assessments/${assessment.id}/approve`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const errorMsg = err.error || "Failed to approve assessment";
        
        // Show toast for prohibited system errors
        if (err.prohibited_system) {
          toast.error(errorMsg, { duration: 6000 });
        } else {
          toast.error(errorMsg, { duration: 5000 });
        }
        
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

      const res = await backendFetch(`/api/risk-assessments/${assessment.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ review_comment: rejectComment }),
      });

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
    try {
      setIsUpdatingMitigation(true);
      setError(null);

      const res = await backendFetch(`/api/risk-assessments/${assessment.id}/mitigation-status`, {
        method: "PUT",
        body: JSON.stringify({ mitigation_status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update mitigation status");
      }

      if (onStatusChange) onStatusChange();
    } catch (err: any) {
      setError(err.message || "Failed to update mitigation status");
    } finally {
      setIsUpdatingMitigation(false);
    }
  };

  const renderMetrics = () => {
    if (!assessment.metrics || Object.keys(assessment.metrics).length === 0) {
      return (
        <p className="text-muted-foreground italic">No metrics provided</p>
      );
    }

    return (
      <div className="space-y-2">
        {Object.entries(assessment.metrics).map(([key, value]) => (
          <div
            key={key}
            className="flex justify-between items-center py-2 border-b border-border/50"
          >
            <span className="text-muted-foreground font-medium capitalize">
              {key.replace(/_/g, " ")}:
            </span>
            <span className="text-foreground">
              {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="glass-card shadow-premium rounded-2xl border-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground">
              {getCategoryLabel(assessment.category)}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Assessment ID: {assessment.id.substring(0, 8)}...
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status, Risk Level and Mitigation Status */}
        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            {getStatusBadge(assessment.status)}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Risk Level</p>
            {getRiskBadge(assessment.risk_level)}
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Mitigation Status</p>
            <div className="flex items-center gap-2">
              {getMitigationBadge(assessment.mitigation_status)}
              {/* Allow updating mitigation status for approved/submitted assessments */}
              {currentUserId && (assessment.status === 'approved' || assessment.status === 'submitted') && (() => {
                const mitigationDisabled = isActionDisabled(lifecycleStage, systemType, 'update_mitigation', assessment.status);
                const mitigationReason = getDisabledReason(lifecycleStage, systemType, 'update_mitigation', assessment.status);
                
                const selectComponent = (
                  <Select
                    value={assessment.mitigation_status}
                    onValueChange={(value) => handleMitigationStatusChange(value as MitigationStatus)}
                    disabled={isUpdatingMitigation || mitigationDisabled}
                  >
                  <SelectTrigger className="w-[140px] h-8 bg-background border-border text-foreground text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="not_started" className="text-foreground hover:bg-accent">
                      Not Started
                    </SelectItem>
                    <SelectItem value="in_progress" className="text-blue-600 hover:bg-accent">
                      In Progress
                    </SelectItem>
                    <SelectItem value="mitigated" className="text-emerald-600 hover:bg-accent">
                      Mitigated
                    </SelectItem>
                  </SelectContent>
                </Select>
                );
                
                if (mitigationDisabled && mitigationReason) {
                  return (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>{selectComponent}</div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">{mitigationReason}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }
                
                return selectComponent;
              })()}
            </div>
          </div>
        </div>

        {/* Assessment Metadata */}
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Assessed At</p>
            <p className="text-foreground">
              {format(new Date(assessment.assessed_at), "MMMM dd, yyyy 'at' HH:mm")}
            </p>
          </div>
          {assessment.assessed_by && (
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <User className="h-3 w-3" />
                Created By
              </p>
              <p className="text-foreground text-sm">
                {assessment.assessed_by.substring(0, 8)}...
              </p>
            </div>
          )}
          {assessment.reviewed_by && (
            <div>
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Reviewed By
              </p>
              <p className="text-foreground text-sm">
                {assessment.reviewed_by.substring(0, 8)}...
              </p>
            </div>
          )}
          {assessment.reviewed_at && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Reviewed At</p>
              <p className="text-foreground text-sm">
                {format(new Date(assessment.reviewed_at), "MMMM dd, yyyy 'at' HH:mm")}
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <p className="text-sm text-muted-foreground mb-2 font-semibold">Summary</p>
          <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
            {assessment.summary}
          </p>
        </div>

        {/* Metrics */}
        <div>
          <p className="text-sm text-muted-foreground mb-3 font-semibold">Metrics</p>
          <div className="bg-background/50 rounded-lg p-4 border border-border">
            {renderMetrics()}
          </div>
        </div>

        {/* Evidence Links */}
        {assessment.evidence_links && assessment.evidence_links.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-3 font-semibold">
              Evidence Links
            </p>
            <div className="space-y-2">
              {assessment.evidence_links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm truncate">{link}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Review Comment (if rejected) */}
        {assessment.status === 'rejected' && assessment.review_comment && (
          <div>
            <p className="text-sm text-muted-foreground mb-2 font-semibold">Review Comment</p>
            <Alert variant="destructive" className="bg-red-900/20 border-red-700/50">
              <AlertDescription className="text-red-300">
                {assessment.review_comment}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Workflow Actions */}
        <div className="pt-4 border-t border-border space-y-3">
          {/* User Actions: Submit for Review */}
          {userRole === 'user' && isCreator && assessment.status === 'draft' && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-amber-600 hover:bg-amber-700 text-foreground border border-amber-500/50"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          )}

          {/* Review Actions: Approve/Reject (currently available to all authenticated users) */}
          {currentUserId && assessment.status === 'submitted' && (
            <div className="space-y-3">
              {!showRejectForm ? (
                <div className="flex gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-foreground border border-emerald-500/50"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {isApproving ? "Approving..." : "Approve"}
                  </Button>
                  <Button
                    onClick={() => setShowRejectForm(true)}
                    disabled={isRejecting}
                    variant="destructive"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-foreground border border-red-500/50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="reject-comment" className="text-foreground">
                      Rejection Reason *
                    </Label>
                    <Textarea
                      id="reject-comment"
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      placeholder="Explain why this assessment is being rejected..."
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-red-500/50 mt-2"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleReject}
                      disabled={isRejecting || !rejectComment.trim()}
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-foreground border border-red-500/50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRejectForm(false);
                        setRejectComment("");
                      }}
                      variant="outline"
                      className="border-border bg-background text-muted-foreground hover:bg-accent/50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Messages */}
          {assessment.status === 'submitted' && !currentUserId && (
            <p className="text-sm text-amber-300 text-center">
              Assessment submitted and pending review
            </p>
          )}
          {assessment.status === 'approved' && (
            <p className="text-sm text-emerald-600 text-center">
              ✓ Assessment approved - counts toward overall risk level
            </p>
          )}
          {assessment.status === 'rejected' && (
            <p className="text-sm text-red-300 text-center">
              Assessment rejected - does not count toward overall risk level
            </p>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-700/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-slate-500">
            Created: {format(new Date(assessment.created_at), "MMM dd, yyyy")}
            {assessment.updated_at !== assessment.created_at && (
              <> • Updated: {format(new Date(assessment.updated_at), "MMM dd, yyyy")}</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
