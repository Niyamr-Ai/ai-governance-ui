"use client";

import { useState, useEffect } from "react";
import { Activity, AlertTriangle, ArrowRight, BookOpen, CheckCircle, ChevronDown, ChevronUp, Clock, Lightbulb, Loader2, RefreshCw, Shield, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";
import type { SmartSuggestion, TaskSuggestionContext } from "@/types/smart-governance-suggestions";
import type { GovernanceRegulation } from "@/types/governance-task";

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

interface SmartGovernanceSuggestionsProps {
  systemId: string;
  systemName: string;
  systemDescription: string;
  riskLevel: string;
  complianceStatus: string;
  lifecycleStage: string;
  regulation: GovernanceRegulation;
  existingTasks: string[];
  completedTasks: string[];
  onTaskCreate?: (suggestion: SmartSuggestion) => void;
}

const priorityStyles = {
  high: { bg: "bg-[#FFE0E0]", text: "text-[#C71F1F]", border: "border-[#F1A4A4]" },
  medium: { bg: "bg-[#FFF3CF]", text: "text-[#A97B00]", border: "border-[#F2CD69]" },
  low: { bg: "bg-[#EAF4FF]", text: "text-[#2573C2]", border: "border-[#93C5FD]" },
};

const categoryStyles = {
  compliance: { bg: "bg-[#F3E8FF]", text: "text-[#7C3AED]", icon: Shield },
  risk_management: { bg: "bg-[#FFE0E0]", text: "text-[#C71F1F]", icon: AlertTriangle },
  documentation: { bg: "bg-[#EAF4FF]", text: "text-[#2573C2]", icon: BookOpen },
  governance: { bg: "bg-[#E8FAEF]", text: "text-[#178746]", icon: Target },
  monitoring: { bg: "bg-[#FFF3CF]", text: "text-[#A97B00]", icon: Activity },
};

const effortStyles = {
  low: { bg: "bg-[#E8FAEF]", text: "text-[#178746]", label: "Low Effort" },
  medium: { bg: "bg-[#FFF3CF]", text: "text-[#A97B00]", label: "Medium Effort" },
  high: { bg: "bg-[#FFE0E0]", text: "text-[#C71F1F]", label: "High Effort" },
};

export function SmartGovernanceSuggestions({
  systemId,
  systemName,
  systemDescription,
  riskLevel,
  complianceStatus,
  lifecycleStage,
  regulation,
  existingTasks,
  completedTasks,
  onTaskCreate,
}: SmartGovernanceSuggestionsProps) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(new Set());
  const [contextualHelp, setContextualHelp] = useState<Record<string, string>>({});
  const [loadingHelp, setLoadingHelp] = useState<Set<string>>(new Set());

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const context: TaskSuggestionContext = {
        systemId,
        systemName,
        systemDescription,
        riskLevel,
        complianceStatus,
        lifecycleStage,
        regulation,
        existingTasks,
        completedTasks,
      };

      const response = await backendFetch("/api/governance-tasks/suggestions", {
        method: "POST",
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to fetch suggestions");
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);

      if (data.suggestions?.length > 0) {
        toast({
          title: "Smart suggestions generated",
          description: `Found ${data.suggestions.length} personalized governance recommendations`,
        });
      }
    } catch (error) {
      console.error("Error fetching smart suggestions:", error);
      toast({
        title: "Unable to generate suggestions",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchContextualHelp = async (suggestion: SmartSuggestion) => {
    if (contextualHelp[suggestion.id] || loadingHelp.has(suggestion.id)) return;

    setLoadingHelp((prev) => new Set(prev).add(suggestion.id));
    try {
      const context: TaskSuggestionContext = {
        systemId,
        systemName,
        systemDescription,
        riskLevel,
        complianceStatus,
        lifecycleStage,
        regulation,
        existingTasks,
        completedTasks,
      };

      const response = await backendFetch("/api/governance-tasks/contextual-help", {
        method: "POST",
        body: JSON.stringify({
          taskTitle: suggestion.title,
          taskDescription: suggestion.description,
          ...context,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setContextualHelp((prev) => ({
          ...prev,
          [suggestion.id]: data.contextual_help,
        }));
      }
    } catch (error) {
      console.error("Error fetching contextual help:", error);
    } finally {
      setLoadingHelp((prev) => {
        const newSet = new Set(prev);
        newSet.delete(suggestion.id);
        return newSet;
      });
    }
  };

  const toggleExpanded = (suggestionId: string) => {
    setExpandedSuggestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId);
      } else {
        newSet.add(suggestionId);
        const suggestion = suggestions.find((s) => s.id === suggestionId);
        if (suggestion) {
          fetchContextualHelp(suggestion);
        }
      }
      return newSet;
    });
  };

  const handleCreateTask = (suggestion: SmartSuggestion) => {
    if (onTaskCreate) {
      onTaskCreate(suggestion);
    } else {
      toast({
        title: "Task creation not available",
        description: "Please create this task manually in your governance system",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [systemId, regulation]);

  return (
    <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF4FF]">
            <Zap className="h-5 w-5 text-[#3B82F6]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1E293B]">Smart Governance Suggestions</h3>
            <p className="text-[12px] text-[#667085]">AI-powered task recommendations based on system characteristics and platform best practices</p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchSuggestions}
          disabled={loading}
          className="flex h-9 items-center gap-2 rounded-[8px] border border-[#CBD5E1] bg-white px-4 text-[12px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Suggestions
        </button>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="mr-3 h-6 w-6 animate-spin text-[#3B82F6]" />
            <span className="text-[13px] text-[#667085]">Generating smart suggestions...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF4FF]">
              <Lightbulb className="h-7 w-7 text-[#3B82F6]" />
            </div>
            <p className="text-[14px] font-semibold text-[#1E293B]">No suggestions available</p>
            <p className="mt-1 text-[12px] text-[#667085]">All governance requirements appear to be well-covered, or try refreshing for new suggestions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => {
              const isExpanded = expandedSuggestions.has(suggestion.id);
              const CategoryIcon = categoryStyles[suggestion.category]?.icon || Target;

              return (
                <article key={suggestion.id} className="rounded-[12px] border border-[#E2E8F0] bg-[#FAFBFC] p-4 transition-all hover:border-[#3B82F6]/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[6px] ${categoryStyles[suggestion.category]?.bg || "bg-[#EAF4FF]"}`}>
                          <CategoryIcon className={`h-4 w-4 ${categoryStyles[suggestion.category]?.text || "text-[#3B82F6]"}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-[14px] font-semibold text-[#1E293B]">{suggestion.title}</h4>
                          <p className="mt-1 text-[12px] text-[#667085]">{suggestion.description}</p>
                        </div>
                      </div>

                      <div className="ml-11 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${priorityStyles[suggestion.priority].bg} ${priorityStyles[suggestion.priority].text}`}>
                          {suggestion.priority === "high" ? <AlertTriangle className="h-3 w-3" /> : suggestion.priority === "medium" ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                          {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Priority
                        </span>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${categoryStyles[suggestion.category]?.bg || "bg-[#EAF4FF]"} ${categoryStyles[suggestion.category]?.text || "text-[#3B82F6]"}`}>
                          {suggestion.category.replace("_", " ").charAt(0).toUpperCase() + suggestion.category.replace("_", " ").slice(1)}
                        </span>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${effortStyles[suggestion.estimated_effort].bg} ${effortStyles[suggestion.estimated_effort].text}`}>
                          {effortStyles[suggestion.estimated_effort].label}
                        </span>
                      </div>

                      <div className="ml-11 rounded-[8px] bg-[#F1F5F9] p-2.5">
                        <p className="text-[11px] text-[#475569]">
                          <span className="font-semibold">Why this matters:</span> {suggestion.rationale}
                        </p>
                      </div>

                      {isExpanded && (
                        <div className="ml-11 space-y-4 border-t border-[#E2E8F0] pt-4">
                          <div>
                            <h5 className="mb-2 text-[12px] font-semibold text-[#1E293B]">Actionable Steps:</h5>
                            <ul className="space-y-1">
                              {suggestion.actionable_steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-2 text-[11px] text-[#667085]">
                                  <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-[#3B82F6]" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {suggestion.dependencies && suggestion.dependencies.length > 0 && (
                            <div>
                              <h5 className="mb-2 text-[12px] font-semibold text-[#1E293B]">Dependencies:</h5>
                              <div className="flex flex-wrap gap-1">
                                {suggestion.dependencies.map((dep, depIndex) => (
                                  <span key={depIndex} className="rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] text-[#475569]">
                                    {dep}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {suggestion.resources && suggestion.resources.length > 0 && (
                            <div>
                              <h5 className="mb-2 text-[12px] font-semibold text-[#1E293B]">Helpful Resources:</h5>
                              <div className="flex flex-wrap gap-1">
                                {suggestion.resources.map((resource, resIndex) => (
                                  <span key={resIndex} className="rounded-full border border-[#E2E8F0] bg-white px-2 py-0.5 text-[10px] text-[#475569]">
                                    {resource}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {contextualHelp[suggestion.id] && (
                            <div>
                              <h5 className="mb-2 text-[12px] font-semibold text-[#1E293B]">Contextual Guidance:</h5>
                              <div className="rounded-[8px] border border-[#93C5FD] bg-[#EFF6FF] p-3 text-[11px] text-[#1E40AF]">{contextualHelp[suggestion.id]}</div>
                            </div>
                          )}

                          {loadingHelp.has(suggestion.id) && (
                            <div className="flex items-center gap-2 text-[11px] text-[#667085]">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Loading contextual guidance...
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-[100px] flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(suggestion.id)}
                        className="flex h-8 w-full items-center justify-center gap-1 rounded-[6px] border border-[#CBD5E1] bg-white text-[11px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-all"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            More
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateTask(suggestion)}
                        className="flex h-8 w-full items-center justify-center gap-1 rounded-[6px] bg-[#3B82F6] text-[11px] font-semibold text-white hover:bg-[#2563EB] transition-all"
                      >
                        <Target className="h-3 w-3" />
                        Create Task
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
