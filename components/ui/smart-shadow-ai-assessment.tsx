"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  Shield,
  ArrowRight,
  Zap,
  Target,
  Link,
  TrendingUp,
  Eye,
  FileText
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";
import type { ShadowAIAssessment, SystemLinkSuggestion, DiscoveryPrioritization } from '../../../ai-governance-backend/services/compliance/smart-shadow-ai-discovery';
import type { DiscoveredAIAsset } from '../../../ai-governance-backend/types/discovery';

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

interface SmartShadowAIAssessmentProps {
  asset: DiscoveredAIAsset;
  onAssessmentComplete?: (assessment: ShadowAIAssessment) => void;
  onLinkSuggestion?: (suggestion: SystemLinkSuggestion) => void;
}

const riskLevelStyles = {
  low: { badge: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
  medium: { badge: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle },
  high: { badge: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle },
  critical: { badge: "bg-red-100 text-red-800 border-red-300", icon: AlertTriangle }
};

const priorityStyles = {
  immediate: { badge: "bg-red-100 text-red-800 border-red-300", label: "Immediate" },
  high: { badge: "bg-red-50 text-red-700 border-red-200", label: "High" },
  medium: { badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Medium" },
  low: { badge: "bg-blue-50 text-blue-700 border-blue-200", label: "Low" }
};

const confidenceStyles = {
  high: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "High Confidence" },
  medium: { badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Medium Confidence" },
  low: { badge: "bg-red-50 text-red-700 border-red-200", label: "Low Confidence" }
};

export function SmartShadowAIAssessment({
  asset,
  onAssessmentComplete,
  onLinkSuggestion
}: SmartShadowAIAssessmentProps) {
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<ShadowAIAssessment | null>(null);
  const [linkSuggestions, setLinkSuggestions] = useState<SystemLinkSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const generateAssessment = async () => {
    setLoading(true);
    try {
      const response = await backendFetch('/api/discovery/smart-assessment', {
        method: 'POST',
        body: JSON.stringify({
          asset_id: asset.id,
          organization_context: {
            compliance_focus: 'EU' // Could be dynamic based on org settings
          }
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to generate assessment');
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

      // Auto-expand relevant sections based on risk level
      if (data.assessment.risk_level === 'high' || data.assessment.risk_level === 'critical') {
        setExpandedSections(new Set(['overview', 'compliance', 'actions']));
      }
    } catch (error) {
      console.error('Error generating assessment:', error);
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
      const response = await backendFetch('/api/discovery/link-suggestions', {
        method: 'POST',
        body: JSON.stringify({
          asset_id: asset.id,
          max_suggestions: 5
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to generate link suggestions');
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
      console.error('Error generating link suggestions:', error);
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
    setExpandedSections(prev => {
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
    <Card className="glass-panel shadow-elevated rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">Smart Shadow AI Assessment</CardTitle>
              <CardDescription>
                AI-powered analysis using regulatory knowledge and platform best practices
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateLinkSuggestions}
              disabled={loadingLinks}
              className="rounded-xl"
            >
              {loadingLinks ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Link className="h-4 w-4 mr-2" />
              )}
              Find Links
            </Button>
            <Button
              onClick={generateAssessment}
              disabled={loading}
              className="rounded-xl"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Analyze
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
            <span className="text-muted-foreground">Analyzing with AI governance intelligence...</span>
          </div>
        ) : !assessment ? (
          <div className="text-center py-8">
            <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <p className="text-foreground font-semibold">Ready for Smart Analysis</p>
            <p className="text-muted-foreground text-sm mt-1">
              Click "Analyze" to generate an AI-powered shadow AI assessment using regulatory knowledge.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overview Section */}
            <Card className="border border-border/50">
              <CardContent className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('overview')}
                >
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-foreground">Assessment Overview</h4>
                  </div>
                  {expandedSections.has('overview') ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {expandedSections.has('overview') && (
                  <div className="mt-4 space-y-4">
                    {/* Risk Level and Shadow Probability */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground mb-1">
                          {assessment.shadow_probability}%
                        </div>
                        <div className="text-sm text-muted-foreground">Shadow AI Probability</div>
                      </div>
                      <div className="text-center">
                        <Badge className={`${riskLevelStyles[assessment.risk_level].badge} rounded-xl mb-1`}>
                          {assessment.risk_level.toUpperCase()} RISK
                        </Badge>
                        <div className="text-sm text-muted-foreground">Risk Level</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground mb-1">
                          {assessment.confidence_score}%
                        </div>
                        <div className="text-sm text-muted-foreground">Confidence</div>
                      </div>
                    </div>

                    {/* System Classification */}
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <h5 className="font-medium text-foreground mb-2">System Classification</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Type:</strong> {assessment.classification.system_type}</div>
                        <div><strong>Use Case:</strong> {assessment.classification.use_case}</div>
                        <div><strong>Data Sensitivity:</strong> {assessment.classification.data_sensitivity}</div>
                        <div><strong>User-Facing:</strong> {assessment.classification.user_facing ? 'Yes' : 'No'}</div>
                      </div>
                    </div>

                    {/* Regulatory Concerns */}
                    {assessment.regulatory_concerns.length > 0 && (
                      <div>
                        <h5 className="font-medium text-foreground mb-2">Regulatory Concerns</h5>
                        <ul className="space-y-1">
                          {assessment.regulatory_concerns.map((concern, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compliance Gaps Section */}
            {assessment.compliance_gaps.length > 0 && (
              <Card className="border border-border/50">
                <CardContent className="p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('compliance')}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-foreground">Compliance Gaps</h4>
                      <Badge variant="outline" className="text-xs">
                        {assessment.compliance_gaps.length} regulation{assessment.compliance_gaps.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    {expandedSections.has('compliance') ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {expandedSections.has('compliance') && (
                    <div className="mt-4 space-y-3">
                      {assessment.compliance_gaps.map((gap, index) => (
                        <div key={index} className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-foreground">{gap.regulation} Regulation</h5>
                            <Badge className={`${gap.severity === 'high' ? 'bg-red-50 text-red-700 border-red-200' : gap.severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'} rounded-xl`}>
                              {gap.severity} severity
                            </Badge>
                          </div>
                          <ul className="space-y-1">
                            {gap.missing_requirements.map((req, reqIndex) => (
                              <li key={reqIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ArrowRight className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recommended Actions Section */}
            {assessment.recommended_actions.length > 0 && (
              <Card className="border border-border/50">
                <CardContent className="p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('actions')}
                  >
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-foreground">Recommended Actions</h4>
                      <Badge variant="outline" className="text-xs">
                        {assessment.recommended_actions.length} action{assessment.recommended_actions.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    {expandedSections.has('actions') ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {expandedSections.has('actions') && (
                    <div className="mt-4 space-y-3">
                      {assessment.recommended_actions
                        .sort((a, b) => {
                          const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
                          return priorityOrder[a.priority] - priorityOrder[b.priority];
                        })
                        .map((action, index) => (
                        <div key={index} className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={`${priorityStyles[action.priority].badge} rounded-xl`}>
                                  {priorityStyles[action.priority].label}
                                </Badge>
                              </div>
                              <h5 className="font-medium text-foreground mb-1">{action.action}</h5>
                              <p className="text-sm text-muted-foreground">{action.rationale}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Link Suggestions Section */}
            {linkSuggestions.length > 0 && (
              <Card className="border border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Link className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-foreground">System Link Suggestions</h4>
                    <Badge variant="outline" className="text-xs">
                      {linkSuggestions.length} match{linkSuggestions.length !== 1 ? 'es' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {linkSuggestions.map((suggestion, index) => (
                      <div key={index} className="bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-foreground">
                            {suggestion.system_name}
                          </h5>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${confidenceStyles[suggestion.confidence].badge} rounded-xl`}
                            >
                              {suggestion.similarity_score}% match
                            </Badge>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLinkSuggestionClick(suggestion)}
                              className="rounded-xl"
                            >
                              <Link className="h-3 w-3 mr-1" />
                              Link
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.rationale}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {suggestion.matching_factors.map((factor, factorIndex) => (
                            <Badge
                              key={factorIndex}
                              variant="outline"
                              className="text-xs"
                            >
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
