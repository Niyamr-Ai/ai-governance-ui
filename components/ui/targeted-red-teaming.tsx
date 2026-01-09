"use client";

/**
 * Targeted Red Teaming Components
 * 
 * Provides interface for RAG-powered, system-specific red teaming tests
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Target, 
  Zap, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { TargetedTestSuite, TargetedAttackPrompt, AttackType } from "@/types/targeted-red-teaming";

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

interface TargetedRedTeamingProps {
  aiSystemId: string;
  onTestsGenerated?: (testSuite: TargetedTestSuite) => void;
  onTestsExecuted?: (results: any) => void;
  className?: string;
}

interface TestExecutionResult {
  total_tests: number;
  passed: number;
  failed: number;
  pass_rate: number;
  risk_distribution: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  customization_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  high_risk_failures: number;
}

/**
 * Main targeted red teaming component
 */
export function TargetedRedTeamingPanel({ 
  aiSystemId, 
  onTestsGenerated,
  onTestsExecuted,
  className = "" 
}: TargetedRedTeamingProps) {
  const [testSuite, setTestSuite] = useState<TargetedTestSuite | null>(null);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttackTypes, setSelectedAttackTypes] = useState<AttackType[]>([
    'prompt_injection', 'jailbreak', 'data_leakage', 'policy_bypass'
  ]);
  const [testCount, setTestCount] = useState(5);

  const attackTypeOptions: { value: AttackType; label: string; description: string }[] = [
    { 
      value: 'prompt_injection', 
      label: 'Prompt Injection', 
      description: 'Tests for instruction override and system prompt leakage' 
    },
    { 
      value: 'jailbreak', 
      label: 'Jailbreak Attempts', 
      description: 'Tests for safety guardrail bypass and restriction removal' 
    },
    { 
      value: 'data_leakage', 
      label: 'Data Leakage', 
      description: 'Tests for training data extraction and configuration leaks' 
    },
    { 
      value: 'policy_bypass', 
      label: 'Policy Bypass', 
      description: 'Tests for harmful content generation and policy violations' 
    }
  ];

  const generateTargetedTests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await backendFetch('/api/red-teaming/targeted', {
        method: 'POST',
        body: JSON.stringify({
          ai_system_id: aiSystemId,
          attack_types: selectedAttackTypes,
          test_count: testCount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate targeted tests');
      }

      const data = await response.json();
      setTestSuite(data.testSuite);
      onTestsGenerated?.(data.testSuite);

    } catch (err: any) {
      console.error('Error generating targeted tests:', err);
      setError(err.message || 'Failed to generate targeted tests');
    } finally {
      setLoading(false);
    }
  };

  const executeTargetedTests = async () => {
    if (!testSuite) return;

    setExecuting(true);
    setError(null);

    try {
      const response = await backendFetch('/api/red-teaming/execute-targeted', {
        method: 'POST',
        body: JSON.stringify({
          ai_system_id: aiSystemId,
          targeted_attacks: testSuite.attacks
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute targeted tests');
      }

      const data = await response.json();
      setExecutionResults(data);
      onTestsExecuted?.(data);

    } catch (err: any) {
      console.error('Error executing targeted tests:', err);
      setError(err.message || 'Failed to execute targeted tests');
    } finally {
      setExecuting(false);
    }
  };

  const handleAttackTypeChange = (attackType: AttackType, checked: boolean) => {
    if (checked) {
      setSelectedAttackTypes([...selectedAttackTypes, attackType]);
    } else {
      setSelectedAttackTypes(selectedAttackTypes.filter(type => type !== attackType));
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          Targeted Red Teaming
          <Badge variant="outline" className="ml-2">RAG-Enhanced</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate system-specific attack scenarios using AI system context and security methodologies
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        
        {/* Configuration */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Attack Types</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select attack types to focus on for this system
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attackTypeOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={option.value}
                    checked={selectedAttackTypes.includes(option.value)}
                    onCheckedChange={(checked) => handleAttackTypeChange(option.value, checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="testCount" className="text-base font-medium">
              Number of Tests
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              How many targeted tests to generate (1-10)
            </p>
            <select
              id="testCount"
              value={testCount}
              onChange={(e) => setTestCount(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
            >
              {[3, 5, 7, 10].map(count => (
                <option key={count} value={count}>{count} tests</option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Tests Button */}
        <div className="flex gap-3">
          <Button 
            onClick={generateTargetedTests}
            disabled={loading || selectedAttackTypes.length === 0}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Tests...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Targeted Tests
              </>
            )}
          </Button>

          {testSuite && (
            <Button 
              onClick={executeTargetedTests}
              disabled={executing}
              variant="destructive"
            >
              {executing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Execute Tests
                </>
              )}
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generated Test Suite */}
        {testSuite && (
          <TestSuiteDisplay testSuite={testSuite} />
        )}

        {/* Execution Results */}
        {executionResults && (
          <ExecutionResultsDisplay results={executionResults} />
        )}

      </CardContent>
    </Card>
  );
}

/**
 * Display generated test suite
 */
function TestSuiteDisplay({ testSuite }: { testSuite: TargetedTestSuite }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            Generated Test Suite
            <Badge variant="secondary">{testSuite.attacks.length} tests</Badge>
          </CardTitle>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          
          {/* Strategy Summary */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Test Strategy
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">System:</span> {testSuite.systemName}
              </div>
              <div>
                <span className="font-medium">Type:</span> {testSuite.strategy.systemType}
              </div>
              <div>
                <span className="font-medium">Risk Profile:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {testSuite.strategy.riskProfile.map(risk => (
                    <Badge key={risk} variant="outline" className="text-xs">
                      {risk.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Vulnerabilities:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {testSuite.strategy.vulnerabilities.map(vuln => (
                    <Badge key={vuln} variant="destructive" className="text-xs">
                      {vuln.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Attack List */}
          <div className="space-y-2">
            <h4 className="font-medium">Generated Attacks</h4>
            <div className="space-y-2">
              {testSuite.attacks.map((attack, index) => (
                <AttackCard key={index} attack={attack} />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {testSuite.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Recommendations
              </h4>
              <ul className="text-sm space-y-1">
                {testSuite.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>{rec}</span>
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
 * Display individual attack card
 */
function AttackCard({ attack }: { attack: TargetedAttackPrompt }) {
  const [showPrompt, setShowPrompt] = useState(false);

  const getCustomizationColor = () => {
    switch (attack.customization) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{attack.type.replace('_', ' ')}</Badge>
          <span className="font-medium text-sm">{attack.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getCustomizationColor()}>
            {attack.customization} customization
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPrompt(!showPrompt)}
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{attack.description}</p>

      {attack.vulnerabilityFocus.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs font-medium">Targets:</span>
          {attack.vulnerabilityFocus.map(vuln => (
            <Badge key={vuln} variant="destructive" className="text-xs">
              {vuln.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      )}

      {showPrompt && (
        <div className="bg-gray-50 p-2 rounded border text-xs font-mono">
          {attack.targetedPrompt}
        </div>
      )}
    </div>
  );
}

/**
 * Display execution results
 */
function ExecutionResultsDisplay({ results }: { results: any }) {
  const summary: TestExecutionResult = results.summary;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Execution Results
          <Badge variant={summary.pass_rate >= 80 ? "default" : "destructive"}>
            {summary.pass_rate}% pass rate
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
            <div className="text-xs text-muted-foreground">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{summary.high_risk_failures}</div>
            <div className="text-xs text-muted-foreground">High Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{summary.total_tests}</div>
            <div className="text-xs text-muted-foreground">Total Tests</div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div>
          <h4 className="font-medium mb-2">Risk Distribution</h4>
          <div className="flex gap-2">
            <Badge variant="destructive" className="flex-1 justify-center">
              HIGH: {summary.risk_distribution.HIGH}
            </Badge>
            <Badge variant="default" className="flex-1 justify-center">
              MEDIUM: {summary.risk_distribution.MEDIUM}
            </Badge>
            <Badge variant="secondary" className="flex-1 justify-center">
              LOW: {summary.risk_distribution.LOW}
            </Badge>
          </div>
        </div>

        {/* Customization Effectiveness */}
        <div>
          <h4 className="font-medium mb-2">Customization Effectiveness</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>High Customization:</span>
              <span>{summary.customization_distribution.high} tests</span>
            </div>
            <div className="flex justify-between">
              <span>Medium Customization:</span>
              <span>{summary.customization_distribution.medium} tests</span>
            </div>
            <div className="flex justify-between">
              <span>Low Customization:</span>
              <span>{summary.customization_distribution.low} tests</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {summary.high_risk_failures > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {summary.high_risk_failures} high-risk failures detected. Review system security measures and consider implementing additional safeguards.
            </AlertDescription>
          </Alert>
        )}

      </CardContent>
    </Card>
  );
}
