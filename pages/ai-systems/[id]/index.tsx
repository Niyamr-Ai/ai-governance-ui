

/**
 * AI System Detail Page
 * 
 * Displays detailed information about an AI system with tabs for:
 * - Overview
 * - Risk Assessments
 * - Compliance
 */

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Loader2, AlertCircle, Info, AlertTriangle as AlertTriangleIcon, ShieldCheck } from "lucide-react";
import RiskTable from "@/components/ai-systems-details/RiskAssessments/RiskTable";
import RiskForm from "@/components/ai-systems-details/RiskAssessments/RiskForm";
import RiskDetail from "@/components/ai-systems-details/RiskAssessments/RiskDetail";
import DocumentationTab from "@/components/ai-systems-details/Documentation/DocumentationTab"
import type { RiskAssessment, CreateRiskAssessmentInput } from "@/types/risk-assessment";
import type { GovernanceTask } from "@/types/governance-task";
import type { LifecycleStage } from "@/types/lifecycle";
import { calculateOverallRiskLevel } from "@/lib/risk";
import {
  canCreateRiskAssessment,
  getLifecycleWarnings,
  getLifecycleConstraints
} from "@/lib/lifecycle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TasksTab from "@/components/ai-systems-details/Tasks/TasksTab";
import PoliciesTab from "@/components/ai-systems-details/Policies/PoliciesTab";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";

export default function AISystemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const systemId = params?.id as string;

  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('risk-assessments');
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [loadingCompliance, setLoadingCompliance] = useState(true);
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage | null>(null);
  const [updatingLifecycle, setUpdatingLifecycle] = useState(false);
  const [tasks, setTasks] = useState<GovernanceTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

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

  const handleLogout = async () => {
    router.push("/");
  };

  // Check URL for tab parameter on mount and get user role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tab = searchParams.get('tab');
      if (tab) {
        setActiveTab(tab);
      }

      // Get user role
      const fetchUserRole = async () => {
        console.log("🔍 [FRONTEND] fetchUserRole called");
        try {
          console.log("🔍 [FRONTEND] Calling backendFetch('/api/user/role')");
          const res = await backendFetch('/api/user/role');
          console.log("🔍 [FRONTEND] Response received, status:", res.status);

          if (res.ok) {
            console.log("✅ [FRONTEND] Response OK, parsing JSON");
            const data = await res.json();
            console.log("🔍 [FRONTEND] Response data:", data);

            if (data.userId) {
              console.log("🔍 [FRONTEND] Setting user ID:", data.userId);
              setCurrentUserId(data.userId);
            }
            if (data.role === 'admin') {
              console.log("🔍 [FRONTEND] Setting user role to admin");
              setUserRole('admin');
            } else {
              console.log("🔍 [FRONTEND] User role is:", data.role);
            }
          } else {
            console.log("❌ [FRONTEND] Response not OK, status:", res.status);
            const errorText = await res.text();
            console.log("❌ [FRONTEND] Error response:", errorText);
          }
        } catch (err) {
          console.error("❌ [FRONTEND] Error fetching user role:", err);
        }
      };
      fetchUserRole();
    }
  }, []);

  // Fetch risk assessments
  const fetchAssessments = async () => {
    if (!systemId) return;

    try {
      setLoading(true);
      setError(null);
      const res = await backendFetch(`/api/ai-systems/${systemId}/risk-assessments`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch risk assessments");
      }

      const data = await res.json();
      setAssessments(data || []);
    } catch (err: any) {
      console.error("Error fetching risk assessments:", err);
      setError(err.message || "Failed to load risk assessments");
    } finally {
      setLoading(false);
    }
  };

  // Fetch governance tasks
  const fetchTasks = async () => {
    if (!systemId) return;

    try {
      setLoadingTasks(true);
      const res = await backendFetch(`/api/ai-systems/${systemId}/tasks`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch tasks");
      }
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [systemId]);

  // Initial fetch tasks
  useEffect(() => {
    fetchTasks();
  }, [systemId]);

  // Fetch compliance data for Overview and Compliance tabs
  useEffect(() => {
    const fetchComplianceData = async () => {
      if (!systemId) return;

      try {
        setLoadingCompliance(true);
        const res = await backendFetch(`/api/ai-systems/${systemId}/compliance-data`);

        if (res.ok) {
          const data = await res.json();
          setSystemInfo(data.systemInfo);
          setComplianceData(data.complianceData);
          // Update lifecycle stage from system info - Only for EU AI Act
          if (data.systemInfo?.type === 'EU AI Act' && data.systemInfo?.lifecycle_stage) {
            setLifecycleStage(data.systemInfo.lifecycle_stage as LifecycleStage);
          } else {
            setLifecycleStage(null);
          }
        } else {
          setSystemInfo(null);
          setComplianceData(null);
        }
      } catch (err: any) {
        console.error("Error fetching compliance data:", err);
        setSystemInfo(null);
        setComplianceData(null);
      } finally {
        setLoadingCompliance(false);
      }
    };

    fetchComplianceData();
  }, [systemId]);

  // Fetch lifecycle stage - Only for EU AI Act
  useEffect(() => {
    const fetchLifecycle = async () => {
      if (!systemId || !systemInfo || systemInfo.type !== 'EU AI Act') {
        // Not an EU AI Act system, set to null
        setLifecycleStage(null);
        return;
      }

      try {
        const res = await backendFetch(`/api/ai-systems/${systemId}/lifecycle`);
        if (res.ok) {
          const data = await res.json();
          setLifecycleStage((data.lifecycle_stage as LifecycleStage) || 'Draft');
        }
      } catch (err) {
        console.error("Error fetching lifecycle:", err);
        setLifecycleStage(null);
      }
    };

    fetchLifecycle();
  }, [systemId, systemInfo]);

  // Handle lifecycle stage change - Only for EU AI Act
  const handleLifecycleChange = async (newStage: LifecycleStage) => {
    if (!systemId || systemInfo?.type !== 'EU AI Act' || newStage === lifecycleStage) return;

    const currentStage = lifecycleStage || 'Draft';

    // Show confirmation for Production (Deployed) transitions
    if (newStage === 'Deployed') {
      const confirmed = window.confirm(
        "Moving to Production (Deployed) requires:\n" +
        "• At least one APPROVED risk assessment\n" +
        "• MAS: Accountability owner must be specified\n" +
        "• UK AI Act: Governance and safety principles should be met\n\n" +
        "Do you want to continue?"
      );
      if (!confirmed) {
        return; // User cancelled
      }
    }

    try {
      setUpdatingLifecycle(true);
      setError(null); // Clear previous errors

      const res = await backendFetch(`/api/ai-systems/${systemId}/lifecycle`, {
        method: 'PUT',
        body: JSON.stringify({
          lifecycle_stage: newStage,
          change_reason: `Transition from ${currentStage} to ${newStage}`
        }),
      });

      const responseData = await res.json();

      if (res.ok) {
        setLifecycleStage(newStage);

        // Show warnings if any
        if (responseData.warnings && responseData.warnings.length > 0) {
          const warningMsg = "Lifecycle updated, but please note:\n" + responseData.warnings.join("\n");
          alert(warningMsg);
        }

        // Refresh compliance data to get updated lifecycle stage
        const complianceRes = await backendFetch(`/api/ai-systems/${systemId}/compliance-data`);
        if (complianceRes.ok) {
          const data = await complianceRes.json();
          setSystemInfo(data.systemInfo);
        }

        // Refresh assessments to update UI state
        await fetchAssessments();
        await fetchTasks();
      } else {
        // Show validation error
        const errorMsg = responseData.reason || responseData.error || 'Failed to update lifecycle stage';
        setError(errorMsg);

        // Show detailed error in alert for better visibility
        if (responseData.warnings && responseData.warnings.length > 0) {
          alert(errorMsg + "\n\nAdditional warnings:\n" + responseData.warnings.join("\n"));
        } else {
          alert(errorMsg);
        }
      }
    } catch (err: any) {
      console.error("Error updating lifecycle:", err);
      const errorMsg = err.message || 'Failed to update lifecycle stage';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setUpdatingLifecycle(false);
    }
  };

  const handleCreateAssessment = async (data: CreateRiskAssessmentInput) => {
    try {
      setSubmitting(true);
      setError(null);

      const res = await backendFetch(`/api/ai-systems/${systemId}/risk-assessments`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // Show detailed error message if available
        const errorMsg = err.details
          ? `${err.error}: ${err.details}`
          : err.error || "Failed to create risk assessment";
        throw new Error(errorMsg);
      }

      // Refresh assessments list
      await fetchAssessments();
      setShowForm(false);
    } catch (err: any) {
      console.error("Error creating risk assessment:", err);
      setError(err.message || "Failed to create risk assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = (assessment: RiskAssessment) => {
    setSelectedAssessment(assessment);
  };

  const handleCloseDetail = () => {
    setSelectedAssessment(null);
  };

  const handleStatusChange = async () => {
    // Refresh assessments and tasks after status change
    await fetchAssessments();
    await fetchTasks();
  };

  // Calculate overall risk level (only approved assessments count)
  const getOverallRiskLevel = (): "low" | "medium" | "high" | null => {
    const result = calculateOverallRiskLevel(assessments);
    return result.assessment_count > 0 ? result.level : null;
  };

  const overallRisk = getOverallRiskLevel();

  if (!systemId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="glass-panel shadow-elevated border-border/50">
          <CardContent className="pt-6">
            <p className="text-red-600">Invalid system ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      <div className="container mx-auto max-w-4xl py-12 px-4 lg:pl-72 pt-24">
 mx-auto max-w-7xl py-8 px-4 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground mb-6 hover:bg-secondary/50 rounded-lg px-3 py-2 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground mb-3 tracking-tight">
                AI System <span className="gradient-text">Details</span>
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <p className="text-muted-foreground font-mono text-sm break-all">
                    System ID: {systemId}
                  </p>
                </div>
              </div>
            </div>
            {overallRisk && (
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Risk</p>
                <Badge
                  className={
                    overallRisk === "high"
                      ? "bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 border border-red-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all text-sm"
                      : overallRisk === "medium"
                        ? "bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-700 border border-amber-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all text-sm"
                        : "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all text-sm"
                  }
                >
                  {overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)} Risk
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 glass-panel">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="glass-panel border-border/50 p-1.5 rounded-xl shadow-elevated bg-secondary/20">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-blue-500 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 text-muted-foreground rounded-lg px-6 py-2.5 font-semibold transition-all duration-300 hover:text-foreground hover:bg-secondary/50 data-[state=active]:scale-[1.02]"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="risk-assessments"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-blue-500 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 text-muted-foreground rounded-lg px-6 py-2.5 font-semibold transition-all duration-300 hover:text-foreground hover:bg-secondary/50 data-[state=active]:scale-[1.02]"
            >
              Risk Assessments
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-blue-500 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 text-muted-foreground rounded-lg px-6 py-2.5 font-semibold transition-all duration-300 hover:text-foreground hover:bg-secondary/50 data-[state=active]:scale-[1.02]"
            >
              Compliance
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-blue-500 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 text-muted-foreground rounded-lg px-6 py-2.5 font-semibold transition-all duration-300 hover:text-foreground hover:bg-secondary/50 data-[state=active]:scale-[1.02]"
            >
              To-Do
            </TabsTrigger>
            <TabsTrigger
              value="policies"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-blue-500 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 text-muted-foreground rounded-lg px-6 py-2.5 font-semibold transition-all duration-300 hover:text-foreground hover:bg-secondary/50 data-[state=active]:scale-[1.02]"
            >
              Policies
            </TabsTrigger>
            <TabsTrigger
              value="documentation"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-blue-500 data-[state=active]:shadow-lg data-[state=active]:shadow-primary/30 text-muted-foreground rounded-lg px-6 py-2.5 font-semibold transition-all duration-300 hover:text-foreground hover:bg-secondary/50 data-[state=active]:scale-[1.02]"
            >
              Documentation
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {loadingCompliance ? (
              <Card className="glass-panel shadow-elevated border-border/50 rounded-2xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </CardContent>
              </Card>
            ) : systemInfo ? (
              <div className="space-y-6">
                {/* Lifecycle Warnings - Only for EU AI Act */}
                {systemInfo?.type === 'EU AI Act' && lifecycleStage && (() => {
                  const hasApprovedAssessments = assessments.some(a => a.status === 'approved');
                  const warnings: Array<{ type: 'error' | 'warning' | 'info', message: string, action?: string }> = getLifecycleWarnings(
                    lifecycleStage as LifecycleStage,
                    hasApprovedAssessments
                  );

                  return warnings.length > 0 && (
                    <div className="space-y-3">
                      {warnings.map((warning, idx) => (
                        <div
                          key={idx}
                          className={
                            warning.type === 'error'
                              ? 'bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 glass-panel'
                              : warning.type === 'warning'
                                ? 'bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 glass-panel'
                                : 'bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 glass-panel'
                          }
                        >
                          {warning.type === 'error' ? (
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          ) : warning.type === 'warning' ? (
                            <AlertTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          ) : (
                            <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className={
                              warning.type === 'error'
                                ? 'text-red-700'
                                : warning.type === 'warning'
                                  ? 'text-amber-700'
                                  : 'text-blue-700'
                            }>
                              {warning.message}
                              {warning.action && (
                                <Button
                                  variant="link"
                                  className="ml-2 text-primary hover:text-primary/80 p-0 h-auto"
                                  onClick={() => {
                                    if (warning.action === 'Add Risk Assessment') {
                                      setShowForm(true);
                                      setActiveTab('risk-assessments');
                                    } else if (warning.action === 'Review Risk Assessments') {
                                      setActiveTab('risk-assessments');
                                    }
                                  }}
                                >
                                  {warning.action}
                                </Button>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <Card className="glass-panel shadow-elevated border-border/50 rounded-2xl overflow-hidden hover:shadow-blue transition-all duration-300">
                  <CardHeader className="pb-4 border-b border-border/30">
                    <CardTitle className="text-foreground text-2xl font-bold">System Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Name</p>
                        <p className="text-foreground font-semibold text-lg">{systemInfo.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Regulation Type</p>
                        <Badge className="bg-gradient-to-r from-purple-50 to-purple-100/80 text-purple-700 border-purple-200/60 font-semibold px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all">
                          {systemInfo.type}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System ID</p>
                        <p className="text-foreground text-sm font-mono bg-secondary/30 px-3 py-2 rounded-lg border border-border/50">{systemInfo.id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accountable Person</p>
                        <p className="text-foreground font-medium">{systemInfo.accountable_person}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created At</p>
                        <p className="text-foreground text-sm font-medium">
                          {new Date(systemInfo.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Assessments</p>
                        <p className="text-foreground font-semibold text-lg">{assessments.length} assessment{assessments.length !== 1 ? "s" : ""}</p>
                      </div>
                      {/* Lifecycle Stage - Only for EU AI Act */}
                      {systemInfo?.type === 'EU AI Act' && lifecycleStage && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lifecycle Stage</p>
                          <Select
                            value={lifecycleStage}
                            onValueChange={handleLifecycleChange}
                            disabled={updatingLifecycle || lifecycleStage === 'Retired'}
                          >
                            <SelectTrigger className="w-[200px] bg-background border-border/50 text-foreground rounded-xl shadow-sm hover:shadow-md transition-all">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-panel border-border/50 rounded-xl shadow-lg">
                              <SelectItem
                                value="Draft"
                                className="text-foreground rounded-lg"
                                disabled={lifecycleStage === 'Monitoring'}
                              >
                                Draft
                              </SelectItem>
                              <SelectItem
                                value="Development"
                                className="text-foreground rounded-lg"
                                disabled={lifecycleStage === 'Monitoring'}
                              >
                                Development
                              </SelectItem>
                              <SelectItem
                                value="Testing"
                                className="text-foreground rounded-lg"
                                disabled={lifecycleStage === 'Monitoring'}
                              >
                                Testing
                              </SelectItem>
                              <SelectItem
                                value="Deployed"
                                className="text-foreground rounded-lg"
                                disabled={lifecycleStage === 'Monitoring'}
                              >
                                Deployed
                              </SelectItem>
                              <SelectItem value="Monitoring" className="text-foreground rounded-lg">
                                Monitoring
                              </SelectItem>
                              <SelectItem value="Retired" className="text-foreground rounded-lg">
                                Retired
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {lifecycleStage === 'Retired' && (
                            <p className="text-xs text-muted-foreground mt-2 font-medium">Read-only mode</p>
                          )}
                          {lifecycleStage === 'Monitoring' && (
                            <p className="text-xs text-amber-600 mt-2 font-medium">Forward-only: Can only move to Retired</p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Lifecycle Constraints - Only for EU AI Act */}
                {systemInfo?.type === 'EU AI Act' && (
                  <Card className="glass-panel shadow-elevated border-border/50 rounded-2xl overflow-hidden hover:shadow-blue transition-all duration-300">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <CardTitle className="text-foreground flex items-center gap-3 text-xl font-bold">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Info className="h-5 w-5 text-primary" />
                        </div>
                        Lifecycle Governance Rules
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <ul className="space-y-3">
                        {lifecycleStage && getLifecycleConstraints(lifecycleStage as LifecycleStage).map((constraint, idx) => (
                          <li key={idx} className="text-sm text-foreground flex items-start gap-3 p-3 bg-secondary/20 rounded-lg border border-border/30">
                            <span className="text-primary mt-0.5 font-bold">•</span>
                            <span className="flex-1">{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {overallRisk && (
                  <Card className="glass-panel shadow-elevated border-border/50 rounded-2xl overflow-hidden hover:shadow-blue transition-all duration-300">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <CardTitle className="text-foreground text-xl font-bold">Risk Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl border border-border/30">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Overall Risk Level</p>
                          <Badge
                            className={
                              overallRisk === "high"
                                ? "bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 border border-red-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                                : overallRisk === "medium"
                                  ? "bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-700 border border-amber-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                                  : "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                            }
                          >
                            {overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl border border-border/30">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Total Assessments</p>
                          <p className="text-foreground text-4xl font-extrabold">{assessments.length}</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl border border-border/30">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Approved Assessments</p>
                          <p className="text-foreground text-4xl font-extrabold">
                            {assessments.filter(a => a.status === 'approved').length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="glass-panel shadow-elevated border-border/50">
                <CardHeader>
                  <CardTitle className="text-foreground">System Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">
                    No system information found for this ID. This system may only have risk assessments.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Risk Assessments Tab */}
          <TabsContent value="risk-assessments" className="space-y-6">
            {/* Action Bar */}
            <div className="flex justify-between items-center pb-4 border-b border-border/30">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Risk Assessments</h2>
                <p className="text-muted-foreground font-medium">
                  {assessments.length} assessment{assessments.length !== 1 ? "s" : ""} found
                </p>
              </div>
              {!showForm && (
                // For EU AI Act: check lifecycle stage
                // For other regulations: always allow
                (systemInfo?.type === 'EU AI Act'
                  ? (lifecycleStage ? canCreateRiskAssessment(lifecycleStage as LifecycleStage) : true)
                  : true
                ) && (
                  <Button
                    onClick={() => setShowForm(true)}
                    variant="hero"
                    size="lg"
                    className="rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Assessment
                  </Button>
                )
              )}
              {systemInfo?.type === 'EU AI Act' && lifecycleStage === 'Retired' && (
                <p className="text-sm text-muted-foreground italic">System is retired. No new assessments can be created.</p>
              )}
            </div>

            {/* Form or Table */}
            {showForm ? (
              <RiskForm
                aiSystemId={systemId}
                onSubmit={handleCreateAssessment}
                onCancel={() => {
                  setShowForm(false);
                  setError(null);
                }}
                loading={submitting}
              />
            ) : (
              <RiskTable
                assessments={assessments}
                onViewDetail={handleViewDetail}
                loading={loading}
                userRole={userRole}
              />
            )}
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            {loadingCompliance ? (
              <Card className="glass-panel shadow-elevated border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                </CardContent>
              </Card>
            ) : complianceData ? (
              <div className="space-y-6">
                {/* EU AI Act Compliance */}
                {complianceData?.eu && (
                  <Card className="glass-panel shadow-elevated border-border/50 rounded-2xl overflow-hidden hover:shadow-blue transition-all duration-300">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <CardTitle className="text-foreground flex items-center justify-between text-xl font-bold">
                        <span className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                          </div>
                          EU AI Act Compliance
                        </span>
                        <Badge
                          className={
                            complianceData?.eu?.compliance_status === "Compliant"
                              ? "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                              : complianceData?.eu?.compliance_status === "Partially compliant"
                                ? "bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-700 border border-amber-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                                : "bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 border border-red-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                          }
                        >
                          {complianceData?.eu?.compliance_status || "Unknown"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl border border-border/30">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Risk Tier</p>
                          <Badge className="bg-gradient-to-r from-purple-50 to-purple-100/80 text-purple-700 border-purple-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all">
                            {complianceData?.eu?.risk_tier || "N/A"}
                          </Badge>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl border border-border/30">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Prohibited Practices</p>
                          <div className="text-foreground">
                            {complianceData?.eu?.prohibited_practices_detected ? (
                              <Badge className="bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 border-red-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all">
                                Detected
                              </Badge>
                            ) : (
                              <Badge className="bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border-emerald-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all">
                                None
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/30">
                        <Button
                          onClick={() => router.push(`/compliance/${systemId}`)}
                          variant="hero"
                          size="lg"
                          className="rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                          View Full Compliance Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* MAS Compliance */}
                {complianceData?.mas && (
                  <Card className="glass-panel shadow-elevated border-border/50 rounded-2xl overflow-hidden hover:shadow-blue transition-all duration-300">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <CardTitle className="text-foreground flex items-center justify-between text-xl font-bold">
                        <span className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-purple-600" />
                          </div>
                          MAS AI Risk Management
                        </span>
                        <Badge
                          className={
                            (complianceData?.mas as any)?.overall_compliance_status === "Compliant"
                              ? "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                              : "bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-700 border border-amber-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                          }
                        >
                          {(complianceData?.mas as any)?.overall_compliance_status || "Unknown"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl border border-border/30">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Risk Level</p>
                          <Badge className="bg-gradient-to-r from-purple-50 to-purple-100/80 text-purple-700 border-purple-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all">
                            {(complianceData?.mas as any)?.overall_risk_level || "N/A"}
                          </Badge>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl border border-border/30">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sector</p>
                          <p className="text-foreground font-semibold text-lg">{(complianceData?.mas as any)?.sector || "N/A"}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/30">
                        <Button
                          onClick={() => router.push(`/mas/${systemId}`)}
                          variant="hero"
                          size="lg"
                          className="rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                          View Full MAS Assessment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* UK AI Act Compliance */}
                {complianceData?.uk && (
                  <Card className="glass-panel shadow-elevated border-border/50 rounded-2xl overflow-hidden hover:shadow-blue transition-all duration-300">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <CardTitle className="text-foreground flex items-center justify-between text-xl font-bold">
                        <span className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                          </div>
                          UK AI Act Assessment
                        </span>
                        <Badge
                          className={
                            complianceData?.uk?.overall_assessment === "Compliant"
                              ? "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                              : complianceData?.uk?.overall_assessment === "Partially compliant"
                                ? "bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-700 border border-amber-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                                : "bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 border border-red-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                          }
                        >
                          {complianceData?.uk?.overall_assessment || "Unknown"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl border border-border/30">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Risk Level</p>
                          <Badge className="bg-gradient-to-r from-purple-50 to-purple-100/80 text-purple-700 border-purple-200/60 font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all">
                            {complianceData?.uk?.risk_level || "N/A"}
                          </Badge>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl border border-border/30">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sector</p>
                          <p className="text-foreground font-semibold text-lg">
                            {complianceData?.uk?.sector_regulation?.sector || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/30">
                        <Button
                          onClick={() => router.push(`/uk/${systemId}`)}
                          variant="hero"
                          size="lg"
                          className="rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                          View Full UK Assessment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!complianceData?.eu && !complianceData?.mas && !complianceData?.uk && (
                  <Card className="glass-panel shadow-elevated border-border/50">
                    <CardContent className="pt-6">
                      <p className="text-foreground text-center">
                        No compliance assessments found for this system ID.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="glass-panel shadow-elevated border-border/50">
                <CardContent className="pt-6">
                  <p className="text-foreground text-center">
                    No compliance data available for this system.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Governance Tasks Tab */}
          <TabsContent value="tasks">
            {complianceData ? (
              <TasksTab
                tasks={tasks}
                loading={loadingTasks}
                onRefresh={fetchTasks}
                systemId={systemId}
                systemName={systemInfo?.name || "Unnamed System"}
                systemDescription={systemInfo?.description || ""}
                riskLevel={systemInfo?.risk_tier || "unknown"}
                complianceStatus={complianceData.eu?.compliance_status || complianceData.uk?.overall_assessment || complianceData.mas?.overall_compliance_status || "unknown"}
                lifecycleStage={complianceData.eu?.lifecycle_stage || complianceData.uk?.lifecycle_stage || complianceData.mas?.lifecycle_stage || "Draft"}
                regulation={complianceData.eu ? "EU" : complianceData.uk ? "UK" : complianceData.mas ? "MAS" : "EU"}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading compliance data...</p>
              </div>
            )}
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <PoliciesTab systemId={systemId} />
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="documentation">
            <DocumentationTab
              systemId={systemId}
              systemType={systemInfo?.type || null}
            />
          </TabsContent>
        </Tabs>

        {/* Risk Detail Modal */}
        {selectedAssessment && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto glass-panel rounded-lg border-border/50">
              <RiskDetail
                assessment={selectedAssessment}
                onClose={handleCloseDetail}
                userRole={userRole}
                currentUserId={currentUserId || undefined}
                onStatusChange={handleStatusChange}
                lifecycleStage={systemInfo?.type === 'EU AI Act' ? lifecycleStage : null}
                systemType={systemInfo?.type || null}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
