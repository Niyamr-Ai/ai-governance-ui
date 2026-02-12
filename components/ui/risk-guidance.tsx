"use client";

/**
 * Risk Assessment Guidance Components
 * 
 * Provides contextual help and guidance for risk assessment forms
 * using RAG-powered content from Platform and Regulation knowledge bases.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  AlertTriangle, 
  BookOpen, 
  Scale,
  Loader2,
  Info
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { RiskCategory, RiskLevel } from "@/types/risk-assessment";
import ReactMarkdown from "react-markdown";

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

interface RiskGuidanceProps {
  category: RiskCategory;
  riskLevel?: RiskLevel;
  regulationType?: 'EU' | 'UK' | 'MAS';
  systemContext?: string;
  className?: string;
}

interface GuidanceData {
  categoryGuidance: string;
  regulatoryContext: string;
  platformGuidance: string;
  riskLevelGuidance: string;
  bestPractices: string[];
  commonPitfalls: string[];
}

/**
 * Main guidance panel component
 */
export function RiskGuidancePanel({ 
  category, 
  riskLevel, 
  regulationType, 
  systemContext,
  className = "" 
}: RiskGuidanceProps) {
  const [guidance, setGuidance] = useState<GuidanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Load guidance when category or risk level changes
  useEffect(() => {
    if (category) {
      loadGuidance();
    }
  }, [category, riskLevel, regulationType, systemContext]);

  const loadGuidance = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await backendFetch('/api/risk-assessment/guidance', {
        method: 'POST',
        body: JSON.stringify({
          category,
          riskLevel,
          regulationType,
          systemContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to load guidance');
      }

      const data = await response.json();
      setGuidance(data);
    } catch (err) {
      console.error('Error loading risk guidance:', err);
      setError('Unable to load guidance. Please try again.');
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
            <span className="text-sm text-muted-foreground">Loading guidance...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!guidance) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">Assessment Guidance</CardTitle>
            {riskLevel && (
              <Badge variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'default' : 'secondary'}>
                {riskLevel} risk
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0 space-y-4">
            
            {/* Category Guidance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Category Overview</h4>
              </div>
              <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-base font-semibold text-foreground mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm font-semibold text-foreground mb-2 mt-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-medium text-foreground mb-1 mt-2">{children}</h3>,
                    p: ({ children }) => <p className="mb-2">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 ml-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 ml-2">{children}</ol>,
                    li: ({ children }) => <li className="ml-2">{children}</li>,
                    code: ({ children }) => <code className="bg-secondary/50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                  }}
                >
                  {guidance.categoryGuidance}
                </ReactMarkdown>
              </div>
            </div>

            {/* Risk Level Guidance */}
            {guidance.riskLevelGuidance && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-orange-500" />
                  <h4 className="font-medium">Risk Level Guidance</h4>
                </div>
                <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-base font-semibold text-foreground mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-semibold text-foreground mb-2 mt-3">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-medium text-foreground mb-1 mt-2">{children}</h3>,
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 ml-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 ml-2">{children}</ol>,
                      li: ({ children }) => <li className="ml-2">{children}</li>,
                      code: ({ children }) => <code className="bg-secondary/50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    }}
                  >
                    {guidance.riskLevelGuidance}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Regulatory Context */}
            {guidance.regulatoryContext && guidance.regulatoryContext !== 'No specific regulatory requirements found for this assessment.' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium">Regulatory Requirements</h4>
                  {regulationType && (
                    <Badge variant="outline">{regulationType}</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground prose prose-sm max-w-none bg-purple-50 p-3 rounded-md">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-base font-semibold text-foreground mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-semibold text-foreground mb-2 mt-3">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-medium text-foreground mb-1 mt-2">{children}</h3>,
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 ml-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 ml-2">{children}</ol>,
                      li: ({ children }) => <li className="ml-2">{children}</li>,
                      code: ({ children }) => <code className="bg-secondary/50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                    }}
                  >
                    {guidance.regulatoryContext}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Best Practices */}
            {guidance.bestPractices.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  <h4 className="font-medium">Best Practices</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {guidance.bestPractices.map((practice, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Pitfalls */}
            {guidance.commonPitfalls.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h4 className="font-medium">Common Pitfalls</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {guidance.commonPitfalls.map((pitfall, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">⚠</span>
                      <span>{pitfall}</span>
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
 * Compact field guidance tooltip/popover
 */
interface FieldGuidanceProps {
  field: string;
  category: RiskCategory;
  riskLevel?: RiskLevel;
  children: React.ReactNode;
}

export function FieldGuidance({ field, category, riskLevel, children }: FieldGuidanceProps) {
  const [guidance, setGuidance] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showGuidance, setShowGuidance] = useState(false);

  const loadFieldGuidance = async () => {
    if (guidance || loading) return; // Already loaded or loading

    setLoading(true);
    try {
      const response = await backendFetch('/api/risk-assessment/field-guidance', {
        method: 'POST',
        body: JSON.stringify({ field, category, riskLevel })
      });

      if (response.ok) {
        const data = await response.json();
        setGuidance(data.guidance || 'No guidance available.');
      }
    } catch (err) {
      console.error('Error loading field guidance:', err);
      setGuidance('Unable to load guidance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {children}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onMouseEnter={loadFieldGuidance}
          onClick={() => {
            loadFieldGuidance();
            setShowGuidance(!showGuidance);
          }}
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-blue-500" />
        </Button>
      </div>
      
      {showGuidance && (
        <Card className="absolute top-full left-0 z-50 w-80 mt-1 shadow-lg">
          <CardContent className="p-3">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground prose prose-xs max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-xs font-semibold text-foreground mb-1">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xs font-semibold text-foreground mb-1 mt-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xs font-medium text-foreground mb-1">{children}</h3>,
                    p: ({ children }) => <p className="mb-1">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 ml-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 ml-1">{children}</ol>,
                    li: ({ children }) => <li className="ml-1">{children}</li>,
                    code: ({ children }) => <code className="bg-secondary/50 px-0.5 py-0 rounded text-xs font-mono">{children}</code>,
                  }}
                >
                  {guidance}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
