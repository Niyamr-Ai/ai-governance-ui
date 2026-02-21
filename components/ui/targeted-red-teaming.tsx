"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Eye, Info, Lightbulb, Loader2, Shield, Target, Zap } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { TargetedTestSuite, TargetedAttackPrompt, AttackType } from "@/types/targeted-red-teaming";

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
  risk_distribution: { HIGH: number; MEDIUM: number; LOW: number };
  customization_distribution: { high: number; medium: number; low: number };
  high_risk_failures: number;
}

export function TargetedRedTeamingPanel({ aiSystemId, onTestsGenerated, onTestsExecuted, className = "" }: TargetedRedTeamingProps) {
  const [testSuite, setTestSuite] = useState<TargetedTestSuite | null>(null);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttackTypes, setSelectedAttackTypes] = useState<AttackType[]>(["prompt_injection", "jailbreak", "data_leakage", "policy_bypass"]);
  const [testCount, setTestCount] = useState(5);

  const attackTypeOptions: { value: AttackType; label: string; description: string }[] = [
    { value: "prompt_injection", label: "Prompt Injection", description: "Tests for instruction override and system prompt leakage" },
    { value: "jailbreak", label: "Jailbreak Attempts", description: "Tests for safety guardrail bypass and restriction removal" },
    { value: "data_leakage", label: "Data Leakage", description: "Tests for training data extraction and configuration leaks" },
    { value: "policy_bypass", label: "Policy Bypass", description: "Tests for harmful content generation and policy violations" },
  ];

  const generateTargetedTests = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await backendFetch("/api/red-teaming/targeted", {
        method: "POST",
        body: JSON.stringify({ ai_system_id: aiSystemId, attack_types: selectedAttackTypes, test_count: testCount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate targeted tests");
      }

      const data = await response.json();
      setTestSuite(data.testSuite);
      onTestsGenerated?.(data.testSuite);
    } catch (err: any) {
      setError(err.message || "Failed to generate targeted tests");
    } finally {
      setLoading(false);
    }
  };

  const executeTargetedTests = async () => {
    if (!testSuite) return;

    setExecuting(true);
    setError(null);

    try {
      const response = await backendFetch("/api/red-teaming/execute-targeted", {
        method: "POST",
        body: JSON.stringify({ ai_system_id: aiSystemId, targeted_attacks: testSuite.attacks }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to execute targeted tests");
      }

      const data = await response.json();
      setExecutionResults(data);
      onTestsExecuted?.(data);
    } catch (err: any) {
      setError(err.message || "Failed to execute targeted tests");
    } finally {
      setExecuting(false);
    }
  };

  const handleAttackTypeChange = (attackType: AttackType, checked: boolean) => {
    if (checked) setSelectedAttackTypes([...selectedAttackTypes, attackType]);
    else setSelectedAttackTypes(selectedAttackTypes.filter((type) => type !== attackType));
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <p className="mb-3 text-[13px] font-semibold text-[#1E293B]">Attack Types</p>
            <p className="mb-3 text-[12px] text-[#667085]">Select attack types to focus on for this system</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {attackTypeOptions.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-[#E2E8F0] bg-white p-3 transition-all hover:border-[#7C3AED]/30 hover:bg-[#F5F3FF]">
                  <input
                    type="checkbox"
                    checked={selectedAttackTypes.includes(option.value)}
                    onChange={(e) => handleAttackTypeChange(option.value, e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <div className="flex-1">
                    <span className="text-[13px] font-semibold text-[#1E293B]">{option.label}</span>
                    <p className="mt-1 text-[11px] text-[#667085]">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-semibold text-[#1E293B]">Number of Tests</p>
            <p className="mb-2 text-[12px] text-[#667085]">How many targeted tests to generate (1-10)</p>
            <div className="relative w-48">
              <select
                value={testCount}
                onChange={(e) => setTestCount(Number(e.target.value))}
                className="h-10 w-full appearance-none rounded-[8px] border border-[#CBD5E1] bg-white px-3 pr-10 text-[13px] text-[#1E293B] outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20"
              >
                {[3, 5, 7, 10].map((count) => (
                  <option key={count} value={count}>
                    {count} tests
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={generateTargetedTests}
            disabled={loading || selectedAttackTypes.length === 0}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#7C3AED] text-[14px] font-semibold text-white shadow-md hover:bg-[#6D28D9] hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Tests...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate Targeted Tests
              </>
            )}
          </button>

          {testSuite && (
            <button
              type="button"
              onClick={executeTargetedTests}
              disabled={executing}
              className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#C71F1F] px-5 text-[14px] font-semibold text-white shadow-md hover:bg-[#991B1B] hover:shadow-lg transition-all disabled:opacity-50"
            >
              {executing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Execute Tests
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-[10px] border border-[#F1A4A4] bg-[#FFE0E0] px-4 py-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[#C71F1F]" />
            <p className="text-[13px] text-[#C71F1F]">{error}</p>
          </div>
        )}

        {testSuite && <TestSuiteDisplay testSuite={testSuite} />}

        {executionResults && <ExecutionResultsDisplay results={executionResults} />}
      </div>
    </div>
  );
}

function TestSuiteDisplay({ testSuite }: { testSuite: TargetedTestSuite }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-[12px] border-2 border-[#F2CD69] bg-[#FFFBEB]">
      <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-[#FEF3C7]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F59E0B]">
            <Target className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-[14px] font-semibold text-[#1E293B]">Generated Test Suite</span>
            <span className="ml-2 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-semibold text-[#A97B00]">{testSuite.attacks.length} tests</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-[#A97B00]" /> : <ChevronDown className="h-4 w-4 text-[#A97B00]" />}
      </button>

      {expanded && (
        <div className="border-t border-[#F2CD69] bg-white p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1E293B]">
              <Info className="h-4 w-4 text-[#3B82F6]" />
              Test Strategy
            </div>
            <div className="grid grid-cols-2 gap-4 text-[12px]">
              <div>
                <span className="font-medium text-[#64748B]">System:</span> <span className="text-[#1E293B]">{testSuite.systemName}</span>
              </div>
              <div>
                <span className="font-medium text-[#64748B]">Type:</span> <span className="text-[#1E293B]">{testSuite.strategy.systemType}</span>
              </div>
              <div>
                <span className="font-medium text-[#64748B]">Risk Profile:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {testSuite.strategy.riskProfile.map((risk) => (
                    <span key={risk} className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[10px] text-[#64748B]">
                      {risk.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium text-[#64748B]">Vulnerabilities:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {testSuite.strategy.vulnerabilities.map((vuln) => (
                    <span key={vuln} className="rounded-full border border-[#F1A4A4] bg-[#FFE0E0] px-2 py-0.5 text-[10px] text-[#C71F1F]">
                      {vuln.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-[#1E293B]">Generated Attacks</p>
            <div className="space-y-2">
              {testSuite.attacks.map((attack, index) => (
                <AttackCard key={index} attack={attack} />
              ))}
            </div>
          </div>

          {testSuite.recommendations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1E293B]">
                <Lightbulb className="h-4 w-4 text-[#F59E0B]" />
                Recommendations
              </div>
              <ul className="space-y-1 text-[12px]">
                {testSuite.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-[#475569]">
                    <span className="mt-0.5 text-[#F59E0B]">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AttackCard({ attack }: { attack: TargetedAttackPrompt }) {
  const [showPrompt, setShowPrompt] = useState(false);

  const customizationStyles = {
    high: "border-[#86EFAC] bg-[#E8FAEF] text-[#178746]",
    medium: "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]",
    low: "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]",
  };

  return (
    <div className="rounded-[10px] border border-[#E2E8F0] bg-[#FAFBFC] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[#DDD6FE] bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]">{attack.type.replace("_", " ")}</span>
          <span className="text-[12px] font-semibold text-[#1E293B]">{attack.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${customizationStyles[attack.customization]}`}>{attack.customization} customization</span>
          <button type="button" onClick={() => setShowPrompt(!showPrompt)} className="flex h-6 w-6 items-center justify-center rounded-[4px] text-[#667085] hover:bg-[#F1F5F9]">
            <Eye className="h-3 w-3" />
          </button>
        </div>
      </div>

      <p className="text-[11px] text-[#667085]">{attack.description}</p>

      {attack.vulnerabilityFocus.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-medium text-[#64748B]">Targets:</span>
          {attack.vulnerabilityFocus.map((vuln) => (
            <span key={vuln} className="rounded-full border border-[#F1A4A4] bg-[#FFE0E0] px-2 py-0.5 text-[9px] font-semibold text-[#C71F1F]">
              {vuln.replace("_", " ")}
            </span>
          ))}
        </div>
      )}

      {showPrompt && <div className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-2 font-mono text-[11px] text-[#475569]">{attack.targetedPrompt}</div>}
    </div>
  );
}

function ExecutionResultsDisplay({ results }: { results: any }) {
  const summary: TestExecutionResult = results.summary;

  return (
    <div className="overflow-hidden rounded-[12px] border-2 border-[#86EFAC] bg-[#F0FDF4]">
      <div className="flex items-center justify-between border-b border-[#86EFAC] bg-[#DCFCE7] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#178746]">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <span className="text-[14px] font-semibold text-[#1E293B]">Execution Results</span>
        </div>
        <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${summary.pass_rate >= 80 ? "bg-[#178746] text-white" : "bg-[#C71F1F] text-white"}`}>{summary.pass_rate}% pass rate</span>
      </div>

      <div className="bg-white p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <p className="text-[24px] font-bold text-[#178746]">{summary.passed}</p>
            <p className="text-[11px] text-[#667085]">Passed</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-bold text-[#C71F1F]">{summary.failed}</p>
            <p className="text-[11px] text-[#667085]">Failed</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-bold text-[#F59E0B]">{summary.high_risk_failures}</p>
            <p className="text-[11px] text-[#667085]">High Risk</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-bold text-[#1E293B]">{summary.total_tests}</p>
            <p className="text-[11px] text-[#667085]">Total Tests</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-semibold text-[#1E293B]">Risk Distribution</p>
          <div className="flex gap-2">
            <span className="flex-1 rounded-[8px] bg-[#FFE0E0] py-2 text-center text-[11px] font-semibold text-[#C71F1F]">HIGH: {summary.risk_distribution.HIGH}</span>
            <span className="flex-1 rounded-[8px] bg-[#FFF3CF] py-2 text-center text-[11px] font-semibold text-[#A97B00]">MEDIUM: {summary.risk_distribution.MEDIUM}</span>
            <span className="flex-1 rounded-[8px] bg-[#EAF4FF] py-2 text-center text-[11px] font-semibold text-[#2573C2]">LOW: {summary.risk_distribution.LOW}</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[12px] font-semibold text-[#1E293B]">Customization Effectiveness</p>
          <div className="space-y-1 text-[12px]">
            <div className="flex justify-between text-[#475569]">
              <span>High Customization:</span>
              <span className="font-medium">{summary.customization_distribution.high} tests</span>
            </div>
            <div className="flex justify-between text-[#475569]">
              <span>Medium Customization:</span>
              <span className="font-medium">{summary.customization_distribution.medium} tests</span>
            </div>
            <div className="flex justify-between text-[#475569]">
              <span>Low Customization:</span>
              <span className="font-medium">{summary.customization_distribution.low} tests</span>
            </div>
          </div>
        </div>

        {summary.high_risk_failures > 0 && (
          <div className="flex items-start gap-3 rounded-[10px] border border-[#F2CD69] bg-[#FFFBEB] px-4 py-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#A97B00]" />
            <p className="text-[12px] text-[#92400E]">{summary.high_risk_failures} high-risk failures detected. Review system security measures and consider implementing additional safeguards.</p>
          </div>
        )}
      </div>
    </div>
  );
}
