"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
  LogOut,
  Play,
  RefreshCw,
  Shield,
  Target,
  TestTube,
  UserCircle2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";
import { backendFetch } from "@/utils/backend-fetch";
import { TargetedRedTeamingPanel } from "@/components/ui/targeted-red-teaming";
import { useToast } from "@/hooks/use-toast";

interface RedTeamingResult {
  id: string;
  ai_system_id: string;
  system_name?: string | null;
  attack_type: string;
  attack_prompt: string;
  system_response: string;
  test_status: "PASS" | "FAIL";
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  failure_reason: string | null;
  tested_by: string | null;
  tested_at: string;
  created_at: string;
}

interface AISystem {
  id: string;
  name: string;
  source: string;
  created_at: string;
}

export default function RedTeamingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [results, setResults] = useState<RedTeamingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [runningTests, setRunningTests] = useState(false);
  const [selectedAttackTypes, setSelectedAttackTypes] = useState<string[]>([]);
  const [testAll, setTestAll] = useState(false);
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState<string>("");
  const [systemNames, setSystemNames] = useState<Record<string, string>>({});
  const [filterSystemId, setFilterSystemId] = useState<string>("all");
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set());
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/sign-in");
        return;
      }
      fetchSystems();
      setFilterSystemId("all");
    };
    init();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [filterSystemId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const fetchSystems = async () => {
    try {
      const res = await backendFetch("/api/ai-systems/list");
      if (res.ok) {
        const data = await res.json();
        setSystems(data.systems || []);
        const nameMap: Record<string, string> = {};
        (data.systems || []).forEach((sys: AISystem) => {
          nameMap[sys.id] = sys.name;
        });
        setSystemNames(nameMap);
      }
    } catch (err) {
      console.error("Error fetching systems:", err);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = filterSystemId && filterSystemId !== "all" ? `/api/red-teaming?ai_system_id=${filterSystemId}` : `/api/red-teaming`;
      const res = await backendFetch(endpoint);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch red teaming results");
      }

      const data = await res.json();
      setResults(data.results || []);

      const nameMap: Record<string, string> = {};
      (data.results || []).forEach((result: RedTeamingResult) => {
        if (result.system_name) {
          nameMap[result.ai_system_id] = result.system_name;
        }
      });
      setSystemNames((prev) => ({ ...prev, ...nameMap }));
    } catch (err: any) {
      setError(err.message || "Failed to load red teaming results");
    } finally {
      setLoading(false);
    }
  };

  const handleRunTests = async () => {
    if (!selectedSystemId) {
      setError("Please select an AI system");
      return;
    }

    try {
      setRunningTests(true);
      setError(null);

      const res = await backendFetch("/api/red-teaming", {
        method: "POST",
        body: JSON.stringify({
          ai_system_id: selectedSystemId,
          test_all: testAll,
          attack_types: testAll ? undefined : selectedAttackTypes,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to run red teaming tests");
      }

      const data = await res.json();
      await fetchResults();
      setShowRunDialog(false);
      setSelectedSystemId("");
      setSelectedAttackTypes([]);
      setTestAll(false);

      toast({
        title: "Tests Completed Successfully",
        description: `Successfully ran ${data.results?.length || 0} red teaming test${data.results?.length !== 1 ? "s" : ""}.`,
      });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to run tests.";
      setError(errorMessage);
      toast({ title: "Test Execution Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setRunningTests(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  const stats = {
    total: results.length,
    passed: results.filter((r) => r.test_status === "PASS").length,
    failed: results.filter((r) => r.test_status === "FAIL").length,
    highRisk: results.filter((r) => r.risk_level === "HIGH").length,
  };

  const attackTypeLabels: Record<string, string> = {
    prompt_injection: "Prompt Injection",
    jailbreak: "Jailbreak",
    data_leakage: "Data Leakage",
    policy_bypass: "Policy Bypass",
  };

  const attackTypeStyles: Record<string, string> = {
    prompt_injection: "bg-[#F3E8FF] text-[#7C3AED] border-[#DDD6FE]",
    jailbreak: "bg-[#FFF3CF] text-[#A97B00] border-[#F2CD69]",
    data_leakage: "bg-[#FCE7F3] text-[#BE185D] border-[#F9A8D4]",
    policy_bypass: "bg-[#FFE0E0] text-[#C71F1F] border-[#F1A4A4]",
  };

  const riskStyles: Record<string, string> = {
    LOW: "bg-[#EAF4FF] text-[#2573C2] border-[#93C5FD]",
    MEDIUM: "bg-[#FFF3CF] text-[#A97B00] border-[#F2CD69]",
    HIGH: "bg-[#FFE0E0] text-[#C71F1F] border-[#F1A4A4]",
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#18181B]" style={{ fontFamily: "Inter, Plus Jakarta Sans, sans-serif" }}>
      <Head>
        <title>Red Teaming | AI Governance</title>
        <meta name="description" content="Adversarial testing and vulnerability assessment for AI systems." />
      </Head>
      <Sidebar onLogout={handleLogout} />
      <div className="mx-auto w-full max-w-[1440px] lg:pl-[267px]">
        <main className="flex-1">
          <header className="flex h-[83px] items-center justify-between border-b border-[#E4E4E7] px-9">
            <h1 className="text-[22px] font-semibold tracking-[0.5px]">Red Teaming</h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowRunDialog(true)}
                className="flex h-10 items-center gap-2 rounded-[10px] bg-[#3B82F6] px-5 text-[14px] font-semibold text-white shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all"
              >
                <Play className="h-4 w-4" />
                Run Quick Tests
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-[#E4E4E7] bg-white px-2 py-1"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5E7EB]">
                    <UserCircle2 className="h-6 w-6 text-[#6B7280]" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#667085]" />
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-36 rounded-[10px] border border-[#E4E4E7] bg-white p-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        void handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[14px] text-[#E72C2C] hover:bg-[#FFF1F2]"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <section className="px-9 py-7">
            <p className="mb-4 text-[14px] text-[#667085]">Automated adversarial testing for AI/LLM systems</p>

            <div className="mb-6 rounded-[12px] border border-[#93C5FD] bg-[#EFF6FF] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#3B82F6]">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="mb-2 text-[13px] font-bold text-[#1E40AF]">Quick Start Guide:</p>
                  <ol className="list-inside list-decimal space-y-1 text-[12px] text-[#3B82F6]">
                    <li>
                      Click <strong>"Run Quick Tests"</strong> to run standard predefined tests
                    </li>
                    <li>
                      Or use <strong>"Generate Targeted Tests"</strong> (when viewing a specific system) for AI-generated, system-specific tests
                    </li>
                    <li>View results grouped by system below - click to expand/collapse</li>
                  </ol>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-[10px] border border-[#F1A4A4] bg-[#FFE0E0] px-4 py-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[#C71F1F]" />
                <p className="text-[14px] text-[#C71F1F]">{error}</p>
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <MetricCard label="Total Tests" value={stats.total} icon={<FileText className="h-5 w-5 text-[#3B82F6]" />} iconBg="bg-[#EAF4FF]" />
              <MetricCard label="Passed" value={stats.passed} valueColor="#178746" icon={<CheckCircle className="h-5 w-5 text-[#178746]" />} iconBg="bg-[#E8FAEF]" />
              <MetricCard label="Failed" value={stats.failed} valueColor="#C71F1F" icon={<XCircle className="h-5 w-5 text-[#C71F1F]" />} iconBg="bg-[#FFE0E0]" />
              <MetricCard label="High Risk" value={stats.highRisk} valueColor="#C71F1F" icon={<AlertTriangle className="h-5 w-5 text-[#C71F1F]" />} iconBg="bg-[#FFE0E0]" />
            </div>

            {filterSystemId && filterSystemId !== "all" && (
              <section className="mb-6 overflow-hidden rounded-[15px] border-2 border-[#DDD6FE] bg-gradient-to-br from-[#F5F3FF] to-[#EEF2FF] shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
                <div className="border-b border-[#DDD6FE] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C3AED]">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#1E293B]">Generate Targeted Tests (AI-Powered)</h3>
                      <p className="text-[12px] text-[#667085]">Generate custom, system-specific test scenarios using AI.</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <TargetedRedTeamingPanel
                    aiSystemId={filterSystemId}
                    onTestsGenerated={(testSuite) => {
                      toast({ title: "Tests Generated", description: `Generated ${testSuite.attacks.length} targeted test scenarios.` });
                    }}
                    onTestsExecuted={(executionResults) => {
                      fetchResults();
                      toast({ title: "Targeted Tests Executed", description: `Successfully executed ${executionResults.results?.length || 0} targeted tests.` });
                    }}
                    className=""
                  />
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
                <div>
                  <h2 className="text-[17px] font-bold text-[#1E293B]">Test Results</h2>
                  <p className="mt-1 text-[12px] text-[#667085]">
                    {filterSystemId === "all"
                      ? "All red teaming test results grouped by system. Click on a system to expand and view details."
                      : `Test results for: ${systems.find((s) => s.id === filterSystemId)?.name || "Selected System"}`}
                  </p>
                </div>
                <div className="w-64">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Filter by System</label>
                  <div className="relative">
                    <select
                      value={filterSystemId}
                      onChange={(e) => setFilterSystemId(e.target.value)}
                      className="h-10 w-full appearance-none rounded-[8px] border border-[#CBD5E1] bg-white px-3 pr-10 text-[13px] text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                    >
                      <option value="all">All Systems (Show All Tests)</option>
                      {systems.map((system) => (
                        <option key={system.id} value={system.id}>
                          {system.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F5F9]">
                      <TestTube className="h-8 w-8 text-[#94A3B8]" />
                    </div>
                    <p className="text-[14px] text-[#667085]">
                      No test results yet.{" "}
                      <button type="button" onClick={() => setShowRunDialog(true)} className="font-semibold text-[#3B82F6] hover:underline">
                        Run tests
                      </button>{" "}
                      to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const groupedResults = results.reduce((acc: Record<string, RedTeamingResult[]>, result) => {
                        const sysId = result.ai_system_id;
                        if (!acc[sysId]) acc[sysId] = [];
                        acc[sysId].push(result);
                        return acc;
                      }, {});

                      return Object.entries(groupedResults).map(([sysId, sysResults]) => {
                        const sysName = sysResults[0]?.system_name || systemNames[sysId] || `System ${sysId.substring(0, 8)}`;
                        const sysStats = {
                          total: sysResults.length,
                          passed: sysResults.filter((r) => r.test_status === "PASS").length,
                          failed: sysResults.filter((r) => r.test_status === "FAIL").length,
                          highRisk: sysResults.filter((r) => r.risk_level === "HIGH").length,
                        };
                        const isExpanded = expandedSystems.has(sysId);

                        return (
                          <article key={sysId} className={`overflow-hidden rounded-[12px] border bg-white shadow-sm transition-all hover:shadow-md ${isExpanded ? "border-[#3B82F6]/30 ring-1 ring-[#3B82F6]/10" : "border-[#E2E8F0]"}`}>
                            <button
                              type="button"
                              onClick={() => {
                                const newExpanded = new Set(expandedSystems);
                                if (isExpanded) newExpanded.delete(sysId);
                                else newExpanded.add(sysId);
                                setExpandedSystems(newExpanded);
                              }}
                              className={`flex w-full items-center justify-between px-5 py-4 text-left transition-colors ${isExpanded ? "bg-gradient-to-r from-[#F8FAFC] to-white" : "hover:bg-[#F8FAFC]"}`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Expand/collapse chevron */}
                                <div className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${isExpanded ? "bg-[#3B82F6]" : "bg-[#E2E8F0]"}`}>
                                  {isExpanded ? <ChevronDown className="h-4 w-4 text-white" /> : <ChevronRight className="h-4 w-4 text-[#64748B]" />}
                                </div>
                                <div>
                                  <h3 className="text-[15px] font-bold text-[#1E293B]">{sysName}</h3>
                                  <div className="mt-1 flex items-center gap-3 text-[12px] text-[#64748B]">
                                    <span className="flex items-center gap-1">
                                      <FileText className="h-3.5 w-3.5" />
                                      {sysStats.total} test{sysStats.total !== 1 ? "s" : ""}
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
                                    <span className="flex items-center gap-1 text-[#178746]">
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      {sysStats.passed} passed
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
                                    <span className="flex items-center gap-1 text-[#C71F1F]">
                                      <XCircle className="h-3.5 w-3.5" />
                                      {sysStats.failed} failed
                                    </span>
                                    {sysStats.highRisk > 0 && (
                                      <>
                                        <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
                                        <span className="flex items-center gap-1 font-semibold text-[#C71F1F]">
                                          <AlertTriangle className="h-3.5 w-3.5" />
                                          {sysStats.highRisk} high risk
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {sysStats.passed > 0 && (
                                  <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#86EFAC] bg-[#E8FAEF] px-3 py-1.5 text-[12px] font-bold text-[#178746]">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    {sysStats.passed} Passed
                                  </span>
                                )}
                                {sysStats.failed > 0 && (
                                  <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#F1A4A4] bg-[#FFE0E0] px-3 py-1.5 text-[12px] font-bold text-[#C71F1F]">
                                    <XCircle className="h-3.5 w-3.5" />
                                    {sysStats.failed} Failed
                                  </span>
                                )}
                              </div>
                            </button>
                            {isExpanded && (
                              <div className="border-t border-[#E2E8F0] bg-white">
                                <div className="divide-y divide-[#E2E8F0]">
                                  {sysResults.map((result, idx) => (
                                    <div key={result.id} className="px-5 py-4 hover:bg-[#FAFBFC] transition-colors">
                                      <div className="flex items-start gap-4">
                                        {/* Status indicator */}
                                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${result.test_status === "PASS" ? "bg-[#E8FAEF]" : "bg-[#FFE0E0]"}`}>
                                          {result.test_status === "PASS" ? (
                                            <CheckCircle className="h-5 w-5 text-[#178746]" />
                                          ) : (
                                            <XCircle className="h-5 w-5 text-[#C71F1F]" />
                                          )}
                                        </div>

                                        {/* Main content */}
                                        <div className="flex-1 min-w-0">
                                          {/* Header row with badges */}
                                          <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className={`inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-[11px] font-bold ${attackTypeStyles[result.attack_type] || attackTypeStyles.prompt_injection}`}>
                                              <Target className="h-3 w-3" />
                                              {attackTypeLabels[result.attack_type] || result.attack_type}
                                            </span>
                                            <span
                                              className={`inline-flex items-center gap-1 rounded-[6px] border px-2.5 py-1 text-[11px] font-bold ${
                                                result.test_status === "PASS" ? "border-[#86EFAC] bg-[#E8FAEF] text-[#178746]" : "border-[#F1A4A4] bg-[#FFE0E0] text-[#C71F1F]"
                                              }`}
                                            >
                                              {result.test_status === "PASS" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                              {result.test_status}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 rounded-[6px] border px-2.5 py-1 text-[11px] font-bold ${riskStyles[result.risk_level]}`}>
                                              {result.risk_level === "HIGH" && <AlertTriangle className="h-3 w-3" />}
                                              {result.risk_level}
                                            </span>
                                          </div>

                                          {/* Attack prompt */}
                                          <p className="text-[13px] leading-relaxed text-[#334155] mb-3">{result.attack_prompt}</p>

                                          {/* Failure reason box */}
                                          {result.failure_reason && (
                                            <div className="mb-3 flex items-start gap-2 rounded-[8px] border border-[#F1A4A4] bg-gradient-to-r from-[#FFF5F5] to-[#FEF2F2] px-3 py-2.5">
                                              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[#C71F1F] mt-0.5" />
                                              <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-[#C71F1F] mb-0.5">Failure Detected</p>
                                                <p className="text-[12px] text-[#991B1B]">{result.failure_reason}</p>
                                              </div>
                                            </div>
                                          )}

                                          {/* System response collapsible */}
                                          {result.system_response && (
                                            <details className="group">
                                              <summary className="flex cursor-pointer items-center gap-2 text-[12px] font-medium text-[#64748B] hover:text-[#3B82F6] transition-colors">
                                                <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
                                                <span>View System Response</span>
                                              </summary>
                                              <div className="mt-2 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                                                <pre className="whitespace-pre-wrap text-[12px] leading-relaxed text-[#475569] font-mono">{result.system_response}</pre>
                                              </div>
                                            </details>
                                          )}
                                        </div>

                                        {/* Timestamp */}
                                        <div className="flex-shrink-0 text-right">
                                          <p className="text-[11px] font-medium text-[#94A3B8]">{formatDate(result.tested_at)}</p>
                                          <p className="text-[10px] text-[#CBD5E1] mt-0.5">Test #{idx + 1}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </article>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </section>
          </section>
        </main>
      </div>

      {showRunDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[15px] border border-[#CBD5E1] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
              <div>
                <h2 className="text-[17px] font-bold text-[#1E293B]">Run Quick Red Teaming Tests</h2>
                <p className="mt-1 text-[12px] text-[#667085]">Run standard predefined tests on your AI system.</p>
              </div>
              <button type="button" onClick={() => setShowRunDialog(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#667085] hover:bg-[#F1F5F9]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#1E293B]">Select AI System *</label>
                <div className="relative">
                  <select
                    value={selectedSystemId}
                    onChange={(e) => setSelectedSystemId(e.target.value)}
                    className="h-10 w-full appearance-none rounded-[8px] border border-[#CBD5E1] bg-white px-3 pr-10 text-[13px] text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                  >
                    <option value="">Choose an AI system</option>
                    {systems.map((system) => (
                      <option key={system.id} value={system.id}>
                        {system.name} ({system.source})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                </div>
                {systems.length === 0 && <p className="text-[11px] text-[#A97B00]">You need to create an AI system first before running tests.</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-[#1E293B]">Test Options</label>
                <div className="relative">
                  <select
                    value={testAll ? "all" : "selected"}
                    onChange={(e) => setTestAll(e.target.value === "all")}
                    className="h-10 w-full appearance-none rounded-[8px] border border-[#CBD5E1] bg-white px-3 pr-10 text-[13px] text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                  >
                    <option value="all">Run All Tests</option>
                    <option value="selected">Select Attack Types</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                </div>
              </div>

              {!testAll && (
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-[#1E293B]">Select Attack Types *</label>
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    {["prompt_injection", "jailbreak", "data_leakage", "policy_bypass"].map((type) => (
                      <label key={type} className="flex cursor-pointer items-center gap-2 rounded-[6px] p-2 transition-colors hover:bg-white">
                        <input
                          type="checkbox"
                          checked={selectedAttackTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedAttackTypes([...selectedAttackTypes, type]);
                            else setSelectedAttackTypes(selectedAttackTypes.filter((t) => t !== type));
                          }}
                          className="h-4 w-4 rounded border-[#CBD5E1] text-[#3B82F6] focus:ring-[#3B82F6]"
                        />
                        <span className="text-[13px] capitalize text-[#1E293B]">{type.replace("_", " ")}</span>
                      </label>
                    ))}
                  </div>
                  {selectedAttackTypes.length === 0 && <p className="text-[11px] text-[#A97B00]">Please select at least one attack type to run tests.</p>}
                </div>
              )}

              <button
                type="button"
                onClick={handleRunTests}
                disabled={runningTests || !selectedSystemId || (!testAll && selectedAttackTypes.length === 0)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#3B82F6] text-[14px] font-semibold text-white shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all disabled:opacity-50"
              >
                {runningTests ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running Tests... Please wait
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Tests
                  </>
                )}
              </button>
              {runningTests && <p className="text-center text-[12px] text-[#667085]">Tests are being executed. This may take a few moments...</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, valueColor = "#0D1C2E", icon, iconBg }: { label: string; value: number; valueColor?: string; icon: React.ReactNode; iconBg: string }) {
  return (
    <div className="rounded-[15px] border border-[#CBD5E1] bg-white p-5 shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
          <p className="mt-1 text-[28px] font-bold" style={{ color: valueColor }}>
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}
