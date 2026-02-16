"use client";

/**
 * Red Teaming Page
 * 
 * Displays red teaming test results and allows running new tests
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TestTube,
  Play,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Zap,
  Target,
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";
import { backendFetch } from "@/utils/backend-fetch";
import { TargetedRedTeamingPanel } from "@/components/ui/targeted-red-teaming";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Head from 'next/head';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [runningTests, setRunningTests] = useState(false);
  const [selectedAttackTypes, setSelectedAttackTypes] = useState<string[]>([]);
  const [testAll, setTestAll] = useState(false);
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState<string>("");
  const [systemNames, setSystemNames] = useState<Record<string, string>>({});
  const [filterSystemId, setFilterSystemId] = useState<string>("all");
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(new Set());

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Fetch AI systems and red teaming results
  useEffect(() => {
    fetchSystems();
    // Reset filter to "all" when component mounts (fresh page load)
    setFilterSystemId("all");
  }, []);


  useEffect(() => {
    fetchResults();
  }, [filterSystemId]);

  const fetchSystems = async () => {
    try {
      const res = await backendFetch("/api/ai-systems/list");

      if (res.ok) {
        const data = await res.json();
        setSystems(data.systems || []);
        // Create a map of system IDs to names for quick lookup
        const nameMap: Record<string, string> = {};
        (data.systems || []).forEach((sys: AISystem) => {
          nameMap[sys.id] = sys.name;
        });
        setSystemNames(nameMap);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("Error fetching systems:", err);
      }
    } catch (err) {
      console.error("Error fetching systems:", err);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = filterSystemId && filterSystemId !== "all"
        ? `/api/red-teaming?ai_system_id=${filterSystemId}`
        : `/api/red-teaming`;

      const res = await backendFetch(endpoint);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch red teaming results");
      }

      const data = await res.json();
      setResults(data.results || []);

      // Update system names map from results
      const nameMap: Record<string, string> = {};
      (data.results || []).forEach((result: RedTeamingResult) => {
        if (result.system_name) {
          nameMap[result.ai_system_id] = result.system_name;
        }
      });
      setSystemNames((prev) => ({ ...prev, ...nameMap }));
    } catch (err: any) {
      console.error("Error fetching red teaming results:", err);
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

      // Refresh results to show new tests
      await fetchResults();

      // Close dialog and reset form
      setShowRunDialog(false);
      setSelectedSystemId("");
      setSelectedAttackTypes([]);
      setTestAll(false);

      // Show success message
      toast({
        title: "Tests Completed Successfully",
        description: `Successfully ran ${data.results?.length || 0} red teaming test${data.results?.length !== 1 ? 's' : ''}. Results are now visible below.`,
      });
    } catch (err: any) {
      console.error("Error running red teaming tests:", err);
      const errorMessage = err.message || "Failed to run tests. Please check your connection and try again.";
      setError(errorMessage);
      toast({
        title: "Test Execution Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setRunningTests(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "PASS") {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Pass
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-50 text-red-700 border-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        Fail
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-blue-50 text-blue-700 border-blue-200",
      MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
      HIGH: "bg-red-50 text-red-700 border-red-200",
    };

    return (
      <Badge className={colors[risk] || colors.LOW}>
        {risk}
      </Badge>
    );
  };

  const getAttackTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      prompt_injection: "bg-purple-50 text-purple-700 border-purple-200",
      jailbreak: "bg-orange-50 text-orange-700 border-orange-200",
      data_leakage: "bg-pink-50 text-pink-700 border-pink-200",
      policy_bypass: "bg-red-50 text-red-700 border-red-200",
    };

    const labels: Record<string, string> = {
      prompt_injection: "Prompt Injection",
      jailbreak: "Jailbreak",
      data_leakage: "Data Leakage",
      policy_bypass: "Policy Bypass",
    };

    return (
      <Badge className={colors[type] || colors.prompt_injection}>
        {labels[type] || type}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const stats = {
    total: results.length,
    passed: results.filter(r => r.test_status === "PASS").length,
    failed: results.filter(r => r.test_status === "FAIL").length,
    highRisk: results.filter(r => r.risk_level === "HIGH").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {isLoggedIn && <Sidebar onLogout={handleLogout} />}
        <div className={`container mx-auto max-w-7xl py-8 px-4 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading red teaming results...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Red Teaming</title>
        <meta name="description" content="Adversarial testing and vulnerability assessment for AI systems." />
      </Head>
      {isLoggedIn && <Sidebar onLogout={handleLogout} />}

      <div className={`container mx-auto max-w-7xl py-8 px-4 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Red Teaming</h1>
              <p className="text-muted-foreground mb-3">
                Automated adversarial testing for AI/LLM systems
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <strong className="text-blue-900 block mb-1">Quick Start Guide:</strong>
                    <ol className="list-decimal list-inside space-y-1 text-blue-800">
                      <li>Click <strong>"Run Quick Tests"</strong> to run standard predefined tests</li>
                      <li>Or use <strong>"Generate Targeted Tests"</strong> (when viewing a specific system) for AI-generated, system-specific tests</li>
                      <li>View results grouped by system below - click to expand/collapse</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <Play className="h-4 w-4" />
                  Run Quick Tests
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Run Quick Red Teaming Tests</DialogTitle>
                  <DialogDescription>
                    Run standard predefined tests. For AI-generated system-specific tests, use "Generate Targeted Tests" when viewing a specific system.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Select AI System *</label>
                    <Select
                      value={selectedSystemId}
                      onValueChange={setSelectedSystemId}
                    >
                      <SelectTrigger className="bg-white border-border/50">
                        <SelectValue placeholder="Choose an AI system" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-border/50">
                        {systems.length === 0 ? (
                          <SelectItem value="no-systems" disabled>No systems available. Please add a system first.</SelectItem>
                        ) : (
                          systems.map((system) => (
                            <SelectItem
                              key={system.id}
                              value={system.id}
                              className="bg-white hover:bg-secondary/50"
                            >
                              {system.name} ({system.source})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {systems.length === 0 && (
                      <p className="text-xs text-amber-600">You need to create an AI system first before running tests.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Test Options</label>
                    <Select
                      value={testAll ? "all" : "selected"}
                      onValueChange={(value) => setTestAll(value === "all")}
                    >
                      <SelectTrigger className="bg-white border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-border/50">
                        <SelectItem value="all" className="bg-white hover:bg-secondary/50">Run All Tests</SelectItem>
                        <SelectItem value="selected" className="bg-white hover:bg-secondary/50">Select Attack Types</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!testAll && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Select Attack Types *</label>
                      <div className="space-y-2 bg-secondary/30 p-4 rounded-lg border border-border/50 max-h-48 overflow-y-auto">
                        {["prompt_injection", "jailbreak", "data_leakage", "policy_bypass"].map((type) => (
                          <label key={type} className="flex items-center space-x-2 cursor-pointer hover:bg-white/50 p-2 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={selectedAttackTypes.includes(type)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAttackTypes([...selectedAttackTypes, type]);
                                } else {
                                  setSelectedAttackTypes(selectedAttackTypes.filter(t => t !== type));
                                }
                              }}
                              className="rounded w-4 h-4 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-foreground capitalize">{type.replace("_", " ")}</span>
                          </label>
                        ))}
                      </div>
                      {selectedAttackTypes.length === 0 && (
                        <p className="text-xs text-amber-600">Please select at least one attack type to run tests.</p>
                      )}
                    </div>
                  )}
                  <Button
                    onClick={handleRunTests}
                    disabled={runningTests || !selectedSystemId || (!testAll && selectedAttackTypes.length === 0)}
                    className="w-full"
                    variant="hero"
                  >
                    {runningTests ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Running Tests... Please wait
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Tests
                      </>
                    )}
                  </Button>
                  {runningTests && (
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      Tests are being executed. This may take a few moments...
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-700" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-panel shadow-elevated rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="glass-panel shadow-elevated rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">{stats.passed}</div>
            </CardContent>
          </Card>
          <Card className="glass-panel shadow-elevated rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">{stats.failed}</div>
            </CardContent>
          </Card>
          <Card className="glass-panel shadow-elevated rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">{stats.highRisk}</div>
            </CardContent>
          </Card>
        </div>

        {/* Targeted Red Teaming Panel - Only show when a specific system is selected */}
        {filterSystemId && filterSystemId !== "all" && (
          <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Generate Targeted Tests (AI-Powered)
              </CardTitle>
              <CardDescription>
                Generate custom, system-specific test scenarios using AI. These tests are tailored to your system's specific vulnerabilities and context.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TargetedRedTeamingPanel
                aiSystemId={filterSystemId}
                onTestsGenerated={(testSuite) => {
                  console.log('Tests generated:', testSuite);
                  toast({
                    title: "Tests Generated",
                    description: `Generated ${testSuite.attacks.length} targeted test scenarios. Review and execute them below.`,
                  });
                }}
                onTestsExecuted={(results) => {
                  console.log('Tests executed:', results);
                  // Refresh results after execution
                  fetchResults();
                  toast({
                    title: "Targeted Tests Executed",
                    description: `Successfully executed ${results.results?.length || 0} targeted tests.`,
                  });
                }}
                className=""
              />
            </CardContent>
          </Card>
        )}

        {/* Results - Grouped by System */}
        <Card className="glass-panel shadow-elevated rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  {filterSystemId === "all"
                    ? "All red teaming test results grouped by system. Click on a system to expand and view details."
                    : `Test results for: ${systems.find(s => s.id === filterSystemId)?.name || "Selected System"}`}
                </CardDescription>
              </div>
              <div className="w-64">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">
                    Filter by System {filterSystemId !== "all" && (
                      <span className="ml-2 text-primary">(Filtered)</span>
                    )}
                  </label>
                  <Select value={filterSystemId} onValueChange={setFilterSystemId}>
                    <SelectTrigger className="bg-white border-border/50">
                      <SelectValue placeholder="All Systems" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border/50">
                      <SelectItem value="all" className="bg-white hover:bg-secondary/50">
                        📋 All Systems (Show All Tests)
                      </SelectItem>
                      {systems.map((system) => (
                        <SelectItem
                          key={system.id}
                          value={system.id}
                          className="bg-white hover:bg-secondary/50"
                        >
                          🔍 {system.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filterSystemId !== "all" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilterSystemId("all")}
                      className="w-full text-xs mt-1"
                    >
                      Clear Filter (Show All)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-12">
                <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No test results yet. Run tests to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  // Group results by system
                  const groupedResults = results.reduce((acc: Record<string, RedTeamingResult[]>, result) => {
                    const systemId = result.ai_system_id;
                    if (!acc[systemId]) {
                      acc[systemId] = [];
                    }
                    acc[systemId].push(result);
                    return acc;
                  }, {});

                  return Object.entries(groupedResults).map(([systemId, systemResults]) => {
                    const systemName = systemResults[0]?.system_name || systemNames[systemId] || `System ${systemId.substring(0, 8)}`;
                    const systemStats = {
                      total: systemResults.length,
                      passed: systemResults.filter(r => r.test_status === "PASS").length,
                      failed: systemResults.filter(r => r.test_status === "FAIL").length,
                      highRisk: systemResults.filter(r => r.risk_level === "HIGH").length,
                    };
                    const isExpanded = expandedSystems.has(systemId);

                    return (
                      <Card key={systemId} className="border-2 border-border/50 bg-white hover:shadow-md transition-shadow">
                        <CardHeader
                          className="pb-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                          onClick={() => {
                            const newExpanded = new Set(expandedSystems);
                            if (isExpanded) {
                              newExpanded.delete(systemId);
                            } else {
                              newExpanded.add(systemId);
                            }
                            setExpandedSystems(newExpanded);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newExpanded = new Set(expandedSystems);
                                  if (isExpanded) {
                                    newExpanded.delete(systemId);
                                  } else {
                                    newExpanded.add(systemId);
                                  }
                                  setExpandedSystems(newExpanded);
                                }}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                              <div className="flex-1">
                                <CardTitle className="text-xl flex items-center gap-2">
                                  <Shield className="h-5 w-5 text-primary" />
                                  {systemName}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {systemStats.total} test{systemStats.total !== 1 ? 's' : ''} •
                                  <span className="text-emerald-600 font-medium"> {systemStats.passed} passed</span> •
                                  <span className="text-red-600 font-medium"> {systemStats.failed} failed</span>
                                  {systemStats.highRisk > 0 && (
                                    <> • <span className="text-red-700 font-bold"> {systemStats.highRisk} high risk</span></>
                                  )}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {systemStats.passed > 0 && (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {systemStats.passed} Passed
                                </Badge>
                              )}
                              {systemStats.failed > 0 && (
                                <Badge className="bg-red-50 text-red-700 border-red-200">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {systemStats.failed} Failed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        {isExpanded && (
                          <CardContent>
                            <div className="space-y-3">
                              {systemResults.map((result) => (
                                <div
                                  key={result.id}
                                  className={`p-4 rounded-lg border-2 transition-all ${result.test_status === "FAIL"
                                    ? "bg-red-50/50 border-red-200/50 hover:border-red-300"
                                    : "bg-emerald-50/50 border-emerald-200/50 hover:border-emerald-300"
                                    }`}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {getAttackTypeBadge(result.attack_type)}
                                        {getStatusBadge(result.test_status)}
                                        {getRiskBadge(result.risk_level)}
                                      </div>
                                      <div className="text-sm text-foreground font-medium">
                                        {result.attack_prompt}
                                      </div>
                                      {result.failure_reason && (
                                        <div className="text-sm text-red-700 bg-red-100/50 p-2 rounded border border-red-200">
                                          <strong>Failure:</strong> {result.failure_reason}
                                        </div>
                                      )}
                                      {result.system_response && (
                                        <details className="text-sm">
                                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                            View System Response
                                          </summary>
                                          <div className="mt-2 p-3 bg-white/50 rounded border border-border/50 text-foreground">
                                            {result.system_response}
                                          </div>
                                        </details>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                      {formatDate(result.tested_at)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

