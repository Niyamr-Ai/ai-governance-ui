"use client";

/**
 * Dashboard Insights Components
 * 
 * Displays RAG-powered contextual insights for compliance dashboards
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  RefreshCw,
  Loader2,
  Info,
  Scale,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { DashboardInsights, ComplianceInsight, SystemInsights } from "@/types/dashboard-insights";

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

interface DashboardInsightsProps {
  systemsData: any[];
  regulationType?: 'EU' | 'UK' | 'MAS';
  className?: string;
}

interface SystemInsightsProps {
  systemData: any;
  regulationType?: 'EU' | 'UK' | 'MAS';
  className?: string;
}

/**
 * Main dashboard insights panel
 */
export function DashboardInsightsPanel({ 
  systemsData, 
  regulationType = 'EU',
  className = "" 
}: DashboardInsightsProps) {
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load insights when data changes
  useEffect(() => {
    if (systemsData.length > 0) {
      loadInsights();
    }
  }, [systemsData, regulationType]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await backendFetch('/api/dashboard/insights', {
        method: 'POST',
        body: JSON.stringify({
          systemsData,
          regulationType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to load insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.error('Error loading dashboard insights:', err);
      setError('Unable to load insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadInsights}
            className="ml-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">Compliance Insights</CardTitle>
            <Badge variant="outline">{regulationType}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                loadInsights();
              }}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          
          {/* Overall Guidance */}
          {insights.overallGuidance && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Regulatory Guidance</h4>
              </div>
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md whitespace-pre-line">
                {insights.overallGuidance}
              </div>
            </div>
          )}

          {/* Key Insights */}
          {insights.keyInsights.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <h4 className="font-medium">Key Insights</h4>
              </div>
              <div className="space-y-2">
                {insights.keyInsights.map((insight, index) => (
                  <InsightCard key={index} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {insights.nextSteps.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <h4 className="font-medium">Recommended Next Steps</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {insights.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </CardContent>
      )}
    </Card>
  );
}

/**
 * Individual insight card component
 */
function InsightCard({ insight }: { insight: ComplianceInsight }) {
  const getInsightIcon = () => {
    switch (insight.type) {
      case 'obligation':
        return <Scale className="h-4 w-4 text-red-500" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'next_step':
        return <ArrowRight className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (insight.priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`p-3 rounded-md border ${getPriorityColor()}`}>
      <div className="flex items-start gap-2">
        {getInsightIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="font-medium text-sm">{insight.title}</h5>
            <Badge 
              variant={insight.priority === 'high' ? 'destructive' : 
                     insight.priority === 'medium' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {insight.priority}
            </Badge>
            {insight.actionable && (
              <Badge variant="outline" className="text-xs">
                Actionable
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{insight.description}</p>
          {insight.regulatoryContext && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              Source: {insight.regulatoryContext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * System-specific insights component
 */
export function SystemInsightsCard({ 
  systemData, 
  regulationType = 'EU',
  className = "" 
}: SystemInsightsProps) {
  const [insights, setInsights] = useState<SystemInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load insights when system data changes
  useEffect(() => {
    if (systemData) {
      loadSystemInsights();
    }
  }, [systemData, regulationType]);

  const loadSystemInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await backendFetch('/api/dashboard/system-insights', {
        method: 'POST',
        body: JSON.stringify({
          systemData,
          regulationType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to load system insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.error('Error loading system insights:', err);
      setError('Unable to load system insights.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading system insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !insights) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Scale className="h-4 w-4 text-blue-500" />
          System Insights
          <Badge variant="outline">{regulationType}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {/* System Status */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Risk Tier:</span>
          <Badge variant={insights.riskTier === 'high_risk' || insights.riskTier === 'prohibited' ? 'destructive' : 'secondary'}>
            {insights.riskTier.replace('_', ' ')}
          </Badge>
          <span className="text-muted-foreground">Status:</span>
          <Badge variant={insights.complianceStatus === 'compliant' ? 'default' : 'destructive'}>
            {insights.complianceStatus.replace('_', ' ')}
          </Badge>
        </div>

        {/* Regulatory Context */}
        {insights.regulatoryContext && (
          <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border-l-2 border-blue-200">
            {insights.regulatoryContext}
          </div>
        )}

        {/* System Insights */}
        {insights.insights.length > 0 && (
          <div className="space-y-2">
            {insights.insights.slice(0, 2).map((insight, index) => (
              <div key={index} className="text-sm">
                <div className="flex items-center gap-1 mb-1">
                  {insight.type === 'warning' ? (
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                  ) : insight.type === 'obligation' ? (
                    <Scale className="h-3 w-3 text-red-500" />
                  ) : (
                    <Info className="h-3 w-3 text-blue-500" />
                  )}
                  <span className="font-medium">{insight.title}</span>
                </div>
                <p className="text-muted-foreground text-xs ml-4">{insight.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recommended Actions */}
        {insights.recommendedActions.length > 0 && (
          <div className="space-y-1">
            <h5 className="text-sm font-medium">Recommended Actions:</h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              {insights.recommendedActions.slice(0, 2).map((action, index) => (
                <li key={index} className="flex items-start gap-1">
                  <ArrowRight className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
