"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowRight,
  HelpCircle,
  Zap,
  Target,
  BookOpen,
  Shield,
  Activity
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { SmartSuggestion, TaskSuggestionContext } from '@/ai-governance-backend/services/governance/smart-governance-suggestions';
import type { GovernanceRegulation } from '@/ai-governance-backend/types/governance-task';

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
  high: { badge: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
  medium: { badge: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  low: { badge: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle }
};

const categoryStyles = {
  compliance: { badge: "bg-purple-50 text-purple-700 border-purple-200", icon: Shield },
  risk_management: { badge: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
  documentation: { badge: "bg-blue-50 text-blue-700 border-blue-200", icon: BookOpen },
  governance: { badge: "bg-green-50 text-green-700 border-green-200", icon: Target },
  monitoring: { badge: "bg-orange-50 text-orange-700 border-orange-200", icon: Activity }
};

const effortStyles = {
  low: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Low Effort" },
  medium: { badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Medium Effort" },
  high: { badge: "bg-red-50 text-red-700 border-red-200", label: "High Effort" }
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
  onTaskCreate
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
        completedTasks
      };

      const response = await fetch('/api/governance-tasks/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to fetch suggestions');
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
      console.error('Error fetching smart suggestions:', error);
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

    setLoadingHelp(prev => new Set(prev).add(suggestion.id));
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
        completedTasks
      };

      const response = await fetch('/api/governance-tasks/contextual-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: suggestion.title,
          taskDescription: suggestion.description,
          ...context
        })
      });

      if (response.ok) {
        const data = await response.json();
        setContextualHelp(prev => ({
          ...prev,
          [suggestion.id]: data.contextual_help
        }));
      }
    } catch (error) {
      console.error('Error fetching contextual help:', error);
    } finally {
      setLoadingHelp(prev => {
        const newSet = new Set(prev);
        newSet.delete(suggestion.id);
        return newSet;
      });
    }
  };

  const toggleExpanded = (suggestionId: string) => {
    setExpandedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId);
      } else {
        newSet.add(suggestionId);
        // Fetch contextual help when expanding
        const suggestion = suggestions.find(s => s.id === suggestionId);
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

  // Auto-fetch suggestions on mount
  useEffect(() => {
    fetchSuggestions();
  }, [systemId, regulation]);

  return (
    <Card className="glass-panel shadow-elevated rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Smart Governance Suggestions</CardTitle>
              <CardDescription>
                AI-powered task recommendations based on system characteristics and platform best practices
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={fetchSuggestions}
            disabled={loading}
            className="rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Lightbulb className="h-4 w-4 mr-2" />
            )}
            Refresh Suggestions
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Generating smart suggestions...</span>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <p className="text-foreground font-semibold">No suggestions available</p>
            <p className="text-muted-foreground text-sm mt-1">
              All governance requirements appear to be well-covered, or try refreshing for new suggestions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => {
              const isExpanded = expandedSuggestions.has(suggestion.id);
              const PriorityIcon = priorityStyles[suggestion.priority].icon;
              const CategoryIcon = categoryStyles[suggestion.category].icon;
              
              return (
                <Card key={suggestion.id} className="border border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                            <CategoryIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{suggestion.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap ml-7">
                          <Badge className={`${priorityStyles[suggestion.priority].badge} rounded-xl`}>
                            <PriorityIcon className="h-3 w-3 mr-1" />
                            {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Priority
                          </Badge>
                          <Badge className={`${categoryStyles[suggestion.category].badge} rounded-xl`}>
                            {suggestion.category.replace('_', ' ').charAt(0).toUpperCase() + suggestion.category.replace('_', ' ').slice(1)}
                          </Badge>
                          <Badge className={`${effortStyles[suggestion.estimated_effort].badge} rounded-xl`}>
                            {effortStyles[suggestion.estimated_effort].label}
                          </Badge>
                        </div>

                        {/* Rationale */}
                        <div className="ml-7">
                          <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                            <strong>Why this matters:</strong> {suggestion.rationale}
                          </p>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="ml-7 space-y-4 pt-2 border-t border-border/30">
                            {/* Actionable Steps */}
                            <div>
                              <h5 className="font-medium text-foreground mb-2">Actionable Steps:</h5>
                              <ul className="space-y-1">
                                {suggestion.actionable_steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <ArrowRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                    {step}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Dependencies */}
                            {suggestion.dependencies && suggestion.dependencies.length > 0 && (
                              <div>
                                <h5 className="font-medium text-foreground mb-2">Dependencies:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {suggestion.dependencies.map((dep, depIndex) => (
                                    <Badge key={depIndex} variant="outline" className="text-xs">
                                      {dep}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Resources */}
                            {suggestion.resources && suggestion.resources.length > 0 && (
                              <div>
                                <h5 className="font-medium text-foreground mb-2">Helpful Resources:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {suggestion.resources.map((resource, resIndex) => (
                                    <Badge key={resIndex} variant="outline" className="text-xs">
                                      {resource}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Contextual Help */}
                            {contextualHelp[suggestion.id] && (
                              <div>
                                <h5 className="font-medium text-foreground mb-2">Contextual Guidance:</h5>
                                <div className="text-sm text-muted-foreground bg-blue-50/50 p-3 rounded-lg border border-blue-200/30">
                                  {contextualHelp[suggestion.id]}
                                </div>
                              </div>
                            )}

                            {loadingHelp.has(suggestion.id) && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Loading contextual guidance...
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(suggestion.id)}
                          className="rounded-xl"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              More
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleCreateTask(suggestion)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                        >
                          <Target className="h-3 w-3 mr-1" />
                          Create Task
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
