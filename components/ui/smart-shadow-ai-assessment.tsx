"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Shield,
  ArrowRight,
  Zap,
  Target,
  Link,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";
import type { ShadowAIAssessment, SystemLinkSuggestion, DiscoveredAIAsset } from "@/types/compliance";

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

interface SmartShadowAIAssessmentProps {
  asset: DiscoveredAIAsset;
  onAssessmentComplete?: (assessment: ShadowAIAssessment) => void;
  onLinkSuggestion?: (suggestion: SystemLinkSuggestion) => void;
}

const riskLevelStyles = {
  low: { bg: "bg-[#E8FAEF]", text: "text-[#178746]", border: "border-[#8EC4F8]" },
  medium: { bg: "bg-[#FFF5D9]", text: "text-[#A97B00]", border: "border-[#F2CD69]" },
  high: { bg: "bg-[#FFE6EA]", text: "text-[#C71F1F]", border: "border-[#F1A4A4]" },
  critical: { bg: "bg-[#FFE0E0]", text: "text-[#C71F1F]", border: "border-[#F1A4A4]" },
};

const priorityStyles = {
  immediate: { bg: "bg-[#FFE0E0]", text: "text-[#C71F1F]", label: "Immediate" },
  high: { bg: "bg-[#FFE6EA]", text: "text-[#C71F1F]", label: "High" },
  medium: { bg: "bg-[#FFF5D9]", text: "text-[#A97B00]", label: "Medium" },
  low: { bg: "bg-[#EAF4FF]", text: "text-[#2573C2]", label: "Low" },
};

const confidenceStyles = {
  high: { bg: "bg-[#E8FAEF]", text: "text-[#178746]", label: "High Confidence" },
  medium: { bg: "bg-[#FFF5D9]", text: "text-[#A97B00]", label: "Medium Confidence" },
  low: { bg: "bg-[#FFE6EA]", text: "text-[#C71F1F]", label: "Low Confidence" },
};

export function SmartShadowAIAssessment({ asset, onAssessmentComplete, onLinkSuggestion }: SmartShadowAIAssessmentProps) {
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<ShadowAIAssessment | null>(null);
  const [linkSuggestions, setLinkSuggestions] = useState<SystemLinkSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview"]));

  const generateAssessment = async () => {
    setLoading(true);
    try {
      const response = await backendFetch("/api/discovery/smart-assessment", {
        method: "POST",
        body: JSON.stringify({
          asset_id: asset.id,
          organization_context: {
            compliance_focus: "EU",
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to generate assessment");
      }

      const data = await response.json();
      setAssessment(data.assessment);

      if (onAssessmentComplete) {
        onAssessmentComplete(data.assessment);
      }

      toast({
        title: "Smart assessment generated",
        description: `Risk level: ${data.assessment.risk_level}, Shadow probability: ${data.assessment.shadow_probability}%`,
      });

      if (data.assessment.risk_level === "high" || data.assessment.risk_level === "critical") {
        setExpandedSections(new Set(["overview", "compliance", "actions"]));
      }
    } catch (error) {
      console.error("Error generating assessment:", error);
      toast({
        title: "Unable to generate assessment",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLinkSuggestions = async () => {
    setLoadingLinks(true);
    try {
      const response = await backendFetch("/api/discovery/link-suggestions", {
        method: "POST",
        body: JSON.stringify({
          asset_id: asset.id,
          max_suggestions: 5,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to generate link suggestions");
      }

      const data = await response.json();
      setLinkSuggestions(data.suggestions || []);

      if (data.suggestions?.length > 0) {
        toast({
          title: "Link suggestions generated",
          description: `Found ${data.suggestions.length} potential system matches`,
        });
      } else {
        toast({
          title: "No similar systems found",
          description: "This appears to be a unique AI system",
        });
      }
    } catch (error) {
      console.error("Error generating link suggestions:", error);
      toast({
        title: "Unable to generate link suggestions",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoadingLinks(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleLinkSuggestionClick = (suggestion: SystemLinkSuggestion) => {
    if (onLinkSuggestion) {
      onLinkSuggestion(suggestion);
    } else {
      toast({
        title: "Link suggestion",
        description: `Consider linking to ${suggestion.system_name} (${suggestion.similarity_score}% match)`,
      });
    }
  };

  return (
    <div className="rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
      <div className="flex items-center justify-between border-b border-[#E4E4E7] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF4FF]">
            <Brain className="h-4 w-4 text-[#2573C2]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1E293B]">Smart Shadow AI Assessment</h3>
            <p className="text-[11px] text-[#667085]">AI-powered analysis using regulatory knowledge</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={generateLinkSuggestions}
            disabled={loadingLinks}
            className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50"
          >
            {loadingLinks ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
            Find Links
          </button>
          <button
            type="button"
            onClick={generateAssessment}
            disabled={loading}
            className="flex h-9 items-center gap-2 rounded-[10px] bg-[#3B82F6] px-4 text-[13px] font-semibold text-white hover:bg-[#2563EB] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Analyze
          </button>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
            <span className="ml-3 text-[14px] text-[#667085]">Analyzing with AI governance intelligence...</span>
          </div>
        ) : !assessment ? (
          <div className="text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF4FF]">
              <Brain className="h-8 w-8 text-[#2573C2]" />
            </div>
            <p className="mt-4 text-[15px] font-semibold text-[#1E293B]">Ready for Smart Analysis</p>
            <p className="mt-1 text-[13px] text-[#667085]">
              Click "Analyze" to generate an AI-powered shadow AI assessment using regulatory knowledge.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AssessmentSection
              icon={<Eye className="h-4 w-4 text-[#2573C2]" />}
              title="Assessment Overview"
              sectionId="overview"
              expanded={expandedSections.has("overview")}
              onToggle={() => toggleSection("overview")}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-[28px] font-bold text-[#1E293B]">{assessment.shadow_probability}%</div>
                  <div className="text-[12px] text-[#667085]">Shadow AI Probability</div>
                </div>
                <div className="text-center">
                  <span
                    className={`inline-flex items-center rounded-[10px] border px-3 py-1.5 text-[11px] font-bold ${
                      riskLevelStyles[assessment.risk_level].bg
                    } ${riskLevelStyles[assessment.risk_level].text} ${riskLevelStyles[assessment.risk_level].border}`}
                  >
                    {assessment.risk_level.toUpperCase()} RISK
                  </span>
                  <div className="mt-1 text-[12px] text-[#667085]">Risk Level</div>
                </div>
                <div className="text-center">
                  <div className="text-[28px] font-bold text-[#1E293B]">{assessment.confidence_score}%</div>
                  <div className="text-[12px] text-[#667085]">Confidence</div>
                </div>
              </div>

              <div className="mt-4 rounded-[10px] bg-[#F8FAFC] p-4">
                <h5 className="text-[13px] font-semibold text-[#1E293B] mb-2">System Classification</h5>
                <div className="grid grid-cols-2 gap-2 text-[12px] text-[#475569]">
                  <div>
                    <strong>Type:</strong> {assessment.classification.system_type}
                  </div>
                  <div>
                    <strong>Use Case:</strong> {assessment.classification.use_case}
                  </div>
                  <div>
                    <strong>Data Sensitivity:</strong> {assessment.classification.data_sensitivity}
                  </div>
                  <div>
                    <strong>User-Facing:</strong> {assessment.classification.user_facing ? "Yes" : "No"}
                  </div>
                </div>
              </div>

              {assessment.regulatory_concerns.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-[13px] font-semibold text-[#1E293B] mb-2">Regulatory Concerns</h5>
                  <ul className="space-y-1">
                    {assessment.regulatory_concerns.map((concern, index) => (
                      <li key={index} className="flex items-start gap-2 text-[12px] text-[#667085]">
                        <AlertTriangle className="h-3 w-3 text-[#E7BB2C] mt-0.5 flex-shrink-0" />
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AssessmentSection>

            {assessment.compliance_gaps.length > 0 && (
              <AssessmentSection
                icon={<Shield className="h-4 w-4 text-[#2573C2]" />}
                title="Compliance Gaps"
                sectionId="compliance"
                expanded={expandedSections.has("compliance")}
                onToggle={() => toggleSection("compliance")}
                badge={`${assessment.compliance_gaps.length} regulation${assessment.compliance_gaps.length !== 1 ? "s" : ""}`}
              >
                <div className="space-y-3">
                  {assessment.compliance_gaps.map((gap, index) => (
                    <div key={index} className="rounded-[10px] bg-[#F8FAFC] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-[13px] font-semibold text-[#1E293B]">{gap.regulation} Regulation</h5>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            gap.severity === "high"
                              ? "bg-[#FFE6EA] text-[#C71F1F]"
                              : gap.severity === "medium"
                              ? "bg-[#FFF5D9] text-[#A97B00]"
                              : "bg-[#EAF4FF] text-[#2573C2]"
                          }`}
                        >
                          {gap.severity} severity
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {gap.missing_requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start gap-2 text-[12px] text-[#667085]">
                            <ArrowRight className="h-3 w-3 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AssessmentSection>
            )}

            {assessment.recommended_actions.length > 0 && (
              <AssessmentSection
                icon={<Target className="h-4 w-4 text-[#2573C2]" />}
                title="Recommended Actions"
                sectionId="actions"
                expanded={expandedSections.has("actions")}
                onToggle={() => toggleSection("actions")}
                badge={`${assessment.recommended_actions.length} action${assessment.recommended_actions.length !== 1 ? "s" : ""}`}
              >
                <div className="space-y-3">
                  {assessment.recommended_actions
                    .sort((a, b) => {
                      const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map((action, index) => (
                      <div key={index} className="rounded-[10px] bg-[#F8FAFC] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                  priorityStyles[action.priority].bg
                                } ${priorityStyles[action.priority].text}`}
                              >
                                {priorityStyles[action.priority].label}
                              </span>
                            </div>
                            <h5 className="text-[13px] font-semibold text-[#1E293B] mb-1">{action.action}</h5>
                            <p className="text-[12px] text-[#667085]">{action.rationale}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </AssessmentSection>
            )}

            {linkSuggestions.length > 0 && (
              <div className="rounded-[10px] border border-[#E4E4E7] bg-white p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Link className="h-4 w-4 text-[#2573C2]" />
                  <h4 className="text-[14px] font-semibold text-[#1E293B]">System Link Suggestions</h4>
                  <span className="rounded-full bg-[#EAF4FF] px-2 py-0.5 text-[10px] font-semibold text-[#2573C2]">
                    {linkSuggestions.length} match{linkSuggestions.length !== 1 ? "es" : ""}
                  </span>
                </div>
                <div className="space-y-3">
                  {linkSuggestions.map((suggestion, index) => (
                    <div key={index} className="rounded-[10px] bg-[#F8FAFC] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-[13px] font-semibold text-[#1E293B]">{suggestion.system_name}</h5>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              confidenceStyles[suggestion.confidence].bg
                            } ${confidenceStyles[suggestion.confidence].text}`}
                          >
                            {suggestion.similarity_score}% match
                          </span>
                          <button
                            type="button"
                            onClick={() => handleLinkSuggestionClick(suggestion)}
                            className="rounded-[8px] border border-[#CBD5E1] bg-white px-2 py-1 text-[11px] font-semibold hover:bg-[#F8FAFC]"
                          >
                            Link
                          </button>
                        </div>
                      </div>
                      <p className="text-[12px] text-[#667085] mb-2">{suggestion.rationale}</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.matching_factors.map((factor, factorIndex) => (
                          <span
                            key={factorIndex}
                            className="rounded-full bg-white border border-[#E4E4E7] px-2 py-0.5 text-[10px] text-[#475569]"
                          >
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AssessmentSection({
  icon,
  title,
  sectionId,
  expanded,
  onToggle,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  sectionId: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[10px] border border-[#E4E4E7] bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#F8FAFC] transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <h4 className="text-[14px] font-semibold text-[#1E293B]">{title}</h4>
          {badge && (
            <span className="rounded-full bg-[#F8FAFC] border border-[#E4E4E7] px-2 py-0.5 text-[10px] font-semibold text-[#475569]">
              {badge}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-[#667085]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#667085]" />
        )}
      </button>
      {expanded && <div className="border-t border-[#E4E4E7] p-4">{children}</div>}
    </div>
  );
}
