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
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";
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
  }, []);

  useEffect(() => {
    fetchResults();
  }, [filterSystemId]);

  const fetchSystems = async () => {
    try {
      const session = await supabase.auth.getSession();

const res = await fetch("http://localhost:3001/api/ai-systems/list", {
  headers: {
    Authorization: `Bearer ${session.data.session?.access_token}`,
  },
});

      if (res.ok) {
        const data = await res.json();
        setSystems(data.systems || []);
        // Create a map of system IDs to names for quick lookup
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
      const url = filterSystemId && filterSystemId !== "all"
        ? `http://localhost:3001/api/red-teaming?ai_system_id=${filterSystemId}`
        : "http://localhost:3001/api/red-teaming";
        const session = await supabase.auth.getSession();

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        });
        

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

      const session = await supabase.auth.getSession();

const res = await fetch("http://localhost:3001/api/red-teaming", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.data.session?.access_token}`,
  },
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
        title: "Tests Completed",
        description: `Successfully ran ${data.results?.length || 0} red teaming test${data.results?.length !== 1 ? 's' : ''}.`,
      });
    } catch (err: any) {
      console.error("Error running red teaming tests:", err);
      setError(err.message || "Failed to run tests");
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
      {isLoggedIn && <Sidebar onLogout={handleLogout} />}

      <div className={`container mx-auto max-w-7xl py-8 px-4 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Red Teaming</h1>
              <p className="text-muted-foreground">
                Automated adversarial testing for AI/LLM systems
              </p>
            </div>
            <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <Play className="h-4 w-4" />
                  Run Tests
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Run Red Teaming Tests</DialogTitle>
                  <DialogDescription>
                    Select attack types to test or run all tests
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
                          <SelectItem value="no-systems" disabled>No systems available</SelectItem>
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
                      <label className="text-sm font-medium text-foreground">Attack Types</label>
                      <div className="space-y-2 bg-secondary/30 p-4 rounded-lg border border-border/50">
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
                    </div>
                  )}
                  <Button
                    onClick={handleRunTests}
                    disabled={runningTests || !selectedSystemId || (!testAll && selectedAttackTypes.length === 0)}
                    className="w-full"
                    variant="hero"
                  >
                    {runningTests ? "Running Tests..." : "Run Tests"}
                  </Button>
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

        {/* Targeted Red Teaming Panel */}
        {filterSystemId && filterSystemId !== "all" && (
          <div className="mb-8">
            <TargetedRedTeamingPanel 
              aiSystemId={filterSystemId}
              onTestsGenerated={(testSuite) => {
                console.log('Tests generated:', testSuite);
              }}
              onTestsExecuted={(results) => {
                console.log('Tests executed:', results);
                // Refresh results after execution
                fetchResults();
              }}
              className="glass-panel shadow-elevated rounded-xl"
            />
          </div>
        )}

        {/* Results Table */}
        <Card className="glass-panel shadow-elevated rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Recent red teaming test results</CardDescription>
              </div>
              <div className="w-64">
                <Select value={filterSystemId} onValueChange={setFilterSystemId}>
                  <SelectTrigger className="bg-white border-border/50">
                    <SelectValue placeholder="Filter by system" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border/50">
                    <SelectItem value="all" className="bg-white hover:bg-secondary/50">
                      All Systems
                    </SelectItem>
                    {systems.map((system) => (
                      <SelectItem 
                        key={system.id} 
                        value={system.id}
                        className="bg-white hover:bg-secondary/50"
                      >
                        {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>AI System</TableHead>
                      <TableHead>Attack Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Attack Prompt</TableHead>
                      <TableHead>Failure Reason</TableHead>
                      <TableHead>Tested At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium text-foreground">
                              {result.system_name || systemNames[result.ai_system_id] || `System ${result.ai_system_id.substring(0, 8)}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {result.ai_system_id.substring(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getAttackTypeBadge(result.attack_type)}</TableCell>
                        <TableCell>{getStatusBadge(result.test_status)}</TableCell>
                        <TableCell>{getRiskBadge(result.risk_level)}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={result.attack_prompt}>
                            {result.attack_prompt}
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.failure_reason ? (
                            <div className="max-w-xs text-sm text-red-700" title={result.failure_reason}>
                              {result.failure_reason}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(result.tested_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

