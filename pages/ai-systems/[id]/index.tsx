"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Info,
  Loader2,
  LogOut,
  Plus,
  ShieldCheck,
  UserCircle2,
  XCircle,
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import RiskTable from "@/components/ai-systems-details/RiskAssessments/RiskTable";
import RiskForm from "@/components/ai-systems-details/RiskAssessments/RiskForm";
import RiskDetail from "@/components/ai-systems-details/RiskAssessments/RiskDetail";
import DocumentationTab from "@/components/ai-systems-details/Documentation/DocumentationTab";
import TasksTab from "@/components/ai-systems-details/Tasks/TasksTab";
import { supabase } from "@/utils/supabase/client";
import type { RiskAssessment, CreateRiskAssessmentInput } from "@/types/risk-assessment";
import type { GovernanceTask } from "@/types/governance-task";
import type { LifecycleStage } from "@/types/lifecycle";
import { calculateOverallRiskLevel } from "@/lib/risk";
import { canCreateRiskAssessment, getLifecycleWarnings, getLifecycleConstraints } from "@/lib/lifecycle";

type TabType = "overview" | "risk-assessments" | "compliance" | "tasks" | "documentation";

export default function AISystemDetailPage() {
  const router = useRouter();
  const { id: systemId } = router.query;

  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [userRole, setUserRole] = useState<"user" | "admin">("user");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [loadingCompliance, setLoadingCompliance] = useState(true);
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage | null>(null);
  const [updatingLifecycle, setUpdatingLifecycle] = useState(false);
  const [tasks, setTasks] = useState<GovernanceTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

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

  useEffect(() => {
    const init = async () => {
      const sessionRes = await supabase.auth.getSession();
      const session = sessionRes.data.session;

      if (!session) {
        router.push("/sign-in");
        return;
      }

      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const tab = searchParams.get("tab");
        if (tab) {
          setActiveTab(tab as TabType);
        }
      }

      try {
        const res = await backendFetch("/api/user/role");
        if (res.ok) {
          const data = await res.json();
          if (data.userId) setCurrentUserId(data.userId);
          if (data.role === "admin") setUserRole("admin");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };

    if (router.isReady) {
      init();
    }
  }, [router.isReady]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const fetchAssessments = async () => {
    if (!systemId || typeof systemId !== "string") return;

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
      setError(err.message || "Failed to load risk assessments");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!systemId || typeof systemId !== "string") return;

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

  const fetchComplianceData = async () => {
    if (!systemId || typeof systemId !== "string") return;

    try {
      setLoadingCompliance(true);
      const res = await backendFetch(`/api/ai-systems/${systemId}/compliance-data`);

      if (res.ok) {
        const data = await res.json();
        setSystemInfo(data.systemInfo);
        setComplianceData(data.complianceData);
        if (data.systemInfo?.type === "EU AI Act" && data.systemInfo?.lifecycle_stage) {
          setLifecycleStage(data.systemInfo.lifecycle_stage as LifecycleStage);
        } else {
          setLifecycleStage(null);
        }
      } else {
        setSystemInfo(null);
        setComplianceData(null);
      }
    } catch (err: any) {
      setSystemInfo(null);
      setComplianceData(null);
    } finally {
      setLoadingCompliance(false);
    }
  };

  useEffect(() => {
    if (router.isReady && systemId) {
      fetchAssessments();
      fetchTasks();
      fetchComplianceData();
    }
  }, [router.isReady, systemId]);

  const handleLifecycleChange = async (newStage: LifecycleStage) => {
    if (!systemId || systemInfo?.type !== "EU AI Act" || newStage === lifecycleStage) return;

    const currentStage = lifecycleStage || "Draft";
    const isProhibited = complianceData?.eu && (complianceData.eu.risk_tier === "Prohibited" || complianceData.eu.prohibited_practices_detected);

    if (isProhibited && newStage === "Deployed") {
      toast.error("Cannot deploy: This system has been classified as 'Prohibited' under the EU AI Act.");
      return;
    }

    if (newStage === "Deployed") {
      const confirmed = window.confirm(
        "Moving to Production (Deployed) requires:\n• At least one APPROVED risk assessment\n• MAS: Accountability owner must be specified\n• UK AI Act: Governance and safety principles should be met\n\nDo you want to continue?"
      );
      if (!confirmed) return;
    }

    try {
      setUpdatingLifecycle(true);
      setError(null);

      const res = await backendFetch(`/api/ai-systems/${systemId}/lifecycle`, {
        method: "PUT",
        body: JSON.stringify({
          lifecycle_stage: newStage,
          change_reason: `Transition from ${currentStage} to ${newStage}`,
        }),
      });

      const responseData = await res.json();

      if (res.ok) {
        setLifecycleStage(newStage);
        toast.success("Lifecycle stage updated successfully");
        await fetchAssessments();
        await fetchTasks();
      } else {
        const errorMsg = responseData.reason || responseData.error || "Failed to update lifecycle stage";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Failed to update lifecycle stage";
      setError(errorMsg);
      toast.error(errorMsg);
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
        const errorMsg = err.details ? `${err.error}: ${err.details}` : err.error || "Failed to create risk assessment";
        throw new Error(errorMsg);
      }

      await fetchAssessments();
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to create risk assessment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    await fetchAssessments();
    await fetchTasks();
  };

  const getOverallRiskLevel = (): "low" | "medium" | "high" | null => {
    const result = calculateOverallRiskLevel(assessments);
    return result.assessment_count > 0 ? result.level : null;
  };

  const overallRisk = getOverallRiskLevel();

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "risk-assessments", label: "Risk Assessments" },
    { id: "compliance", label: "Compliance" },
    { id: "tasks", label: "To-Do" },
    { id: "documentation", label: "Documentation" },
  ];

  if (!systemId) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="rounded-[15px] border border-[#F1A4A4] bg-[#FFE0E0] px-6 py-4">
          <p className="text-[#C71F1F] font-semibold">Invalid system ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#18181B]" style={{ fontFamily: "Inter, Plus Jakarta Sans, sans-serif" }}>
      <Head>
        <title>AI System Details</title>
        <meta name="description" content="Detailed information and risk management for an AI system." />
      </Head>
      <Sidebar onLogout={handleLogout} />
      <div className="mx-auto w-full max-w-[1440px] lg:pl-[267px]">
        <main className="flex-1">
          <header className="flex h-[83px] items-center justify-between border-b border-[#E4E4E7] px-9">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[14px] font-medium text-[#667085] hover:text-[#18181B] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-6 w-px bg-[#E4E4E7]" />
              <h1 className="text-[22px] font-semibold tracking-[0.5px]">AI System Details</h1>
            </div>
            <div className="flex items-center gap-3">
              {overallRisk && activeTab !== "documentation" && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold ${
                    overallRisk === "high"
                      ? "border-[#F1A4A4] bg-[#FFE0E0] text-[#C71F1F]"
                      : overallRisk === "medium"
                      ? "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]"
                      : "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]"
                  }`}
                >
                  {overallRisk === "high" ? <AlertTriangle className="h-3.5 w-3.5" /> : overallRisk === "medium" ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  {overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)} Risk
                </span>
              )}
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
            <div className="mb-6 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-[#3B82F6] animate-pulse" />
              <p className="font-mono text-[13px] text-[#667085]">System ID: {systemId}</p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-[10px] border border-[#F1A4A4] bg-[#FFE0E0] px-4 py-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#C71F1F]" />
                <p className="text-[14px] text-[#C71F1F]">{error}</p>
              </div>
            )}

            <div className="mb-6 flex gap-1 rounded-[12px] border border-[#E4E4E7] bg-white p-1.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-[8px] px-5 py-2 text-[14px] font-semibold transition-all ${
                    activeTab === tab.id ? "bg-[#3B82F6] text-white shadow-md" : "text-[#667085] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6">
                {loadingCompliance ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
                  </div>
                ) : systemInfo ? (
                  <>
                    {systemInfo?.type === "EU AI Act" && lifecycleStage && (() => {
                      const hasApprovedAssessments = assessments.some((a) => a.status === "approved");
                      const warnings = getLifecycleWarnings(lifecycleStage as LifecycleStage, hasApprovedAssessments);

                      return (
                        warnings.length > 0 && (
                          <div className="space-y-3">
                            {warnings.map((warning: any, idx: number) => (
                              <div
                                key={idx}
                                className={`flex items-center gap-3 rounded-[10px] border px-4 py-3 ${
                                  warning.type === "error"
                                    ? "border-[#F1A4A4] bg-[#FFE0E0]"
                                    : warning.type === "warning"
                                    ? "border-[#F2CD69] bg-[#FFF3CF]"
                                    : "border-[#93C5FD] bg-[#EFF6FF]"
                                }`}
                              >
                                {warning.type === "error" ? (
                                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-[#C71F1F]" />
                                ) : warning.type === "warning" ? (
                                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[#A97B00]" />
                                ) : (
                                  <Info className="h-5 w-5 flex-shrink-0 text-[#3B82F6]" />
                                )}
                                <p className={`text-[13px] ${warning.type === "error" ? "text-[#C71F1F]" : warning.type === "warning" ? "text-[#A97B00]" : "text-[#1E40AF]"}`}>
                                  {warning.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )
                      );
                    })()}

                    <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
                      <div className="border-b border-[#E2E8F0] px-6 py-4">
                        <h2 className="text-[17px] font-bold text-[#1E293B]">System Information</h2>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          <InfoCard label="System Name" value={systemInfo.name} />
                          <InfoCard label="Regulation Type" value={systemInfo.type} badge />
                          <InfoCard label="Accountable Person" value={systemInfo.accountable_person || "N/A"} />
                          <InfoCard label="Created At" value={new Date(systemInfo.created_at).toLocaleDateString()} />
                          <InfoCard label="Risk Assessments" value={`${assessments.length} assessment${assessments.length !== 1 ? "s" : ""}`} />
                          {systemInfo?.type === "EU AI Act" && lifecycleStage && (
                            <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Lifecycle Stage</p>
                              <div className="relative">
                                <select
                                  value={lifecycleStage}
                                  onChange={(e) => handleLifecycleChange(e.target.value as LifecycleStage)}
                                  disabled={updatingLifecycle || lifecycleStage === "Retired"}
                                  className="h-10 w-full appearance-none rounded-[8px] border border-[#CBD5E1] bg-white px-3 pr-10 text-[14px] font-semibold text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:opacity-50"
                                >
                                  <option value="Draft">Draft</option>
                                  <option value="Development">Development</option>
                                  <option value="Testing">Testing</option>
                                  <option value="Deployed">Deployed</option>
                                  <option value="Monitoring">Monitoring</option>
                                  <option value="Retired">Retired</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    {systemInfo?.type === "EU AI Act" && lifecycleStage && (
                      <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
                        <div className="flex items-center gap-3 border-b border-[#E2E8F0] px-6 py-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF4FF]">
                            <Info className="h-5 w-5 text-[#3B82F6]" />
                          </div>
                          <h2 className="text-[17px] font-bold text-[#1E293B]">Lifecycle Governance Rules</h2>
                        </div>
                        <div className="p-6">
                          <ul className="space-y-2">
                            {getLifecycleConstraints(lifecycleStage as LifecycleStage).map((constraint: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-3 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#475569]">
                                <span className="mt-0.5 font-bold text-[#3B82F6]">•</span>
                                <span>{constraint}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </section>
                    )}

                    {overallRisk && (
                      <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
                        <div className="border-b border-[#E2E8F0] px-6 py-4">
                          <h2 className="text-[17px] font-bold text-[#1E293B]">Risk Summary</h2>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <MetricCard
                              label="Overall Risk Level"
                              value={overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)}
                              valueColor={overallRisk === "high" ? "#C71F1F" : overallRisk === "medium" ? "#A97B00" : "#178746"}
                              iconType={overallRisk as "high" | "medium" | "low"}
                            />
                            <MetricCard label="Total Assessments" value={String(assessments.length)} valueColor="#0D1C2E" iconType="total" />
                            <MetricCard
                              label="Approved Assessments"
                              value={String(assessments.filter((a) => a.status === "approved").length)}
                              valueColor="#178746"
                              iconType="approved"
                            />
                          </div>
                        </div>
                      </section>
                    )}
                  </>
                ) : (
                  <div className="rounded-[15px] border border-[#CBD5E1] bg-white p-8 text-center">
                    <p className="text-[#667085]">No system information found for this ID.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "risk-assessments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <div>
                    <h2 className="text-[18px] font-bold text-[#1E293B]">Risk Assessments</h2>
                    <p className="mt-1 text-[13px] text-[#667085]">{assessments.length} assessment{assessments.length !== 1 ? "s" : ""} found</p>
                  </div>
                  {!showForm &&
                    (systemInfo?.type === "EU AI Act" ? (lifecycleStage ? canCreateRiskAssessment(lifecycleStage as LifecycleStage) : true) : true) && (
                      <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className="flex h-10 items-center gap-2 rounded-[10px] bg-[#3B82F6] px-5 text-[14px] font-semibold text-white shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        New Assessment
                      </button>
                    )}
                </div>

                {showForm ? (
                  <RiskForm aiSystemId={systemId as string} onSubmit={handleCreateAssessment} onCancel={() => { setShowForm(false); setError(null); }} loading={submitting} />
                ) : (
                  <RiskTable assessments={assessments} onViewDetail={(a) => setSelectedAssessment(a)} loading={loading} userRole={userRole} />
                )}
              </div>
            )}

            {activeTab === "compliance" && (
              <div className="space-y-6">
                {loadingCompliance ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
                  </div>
                ) : complianceData ? (
                  <>
                    {complianceData?.eu && (
                      <ComplianceCard
                        title="EU AI Act Compliance"
                        status={complianceData.eu.compliance_status}
                        iconColor="#3B82F6"
                        fields={[
                          { label: "Risk Tier", value: complianceData.eu.risk_tier || "N/A" },
                          { label: "Prohibited Practices", value: complianceData.eu.prohibited_practices_detected ? "Detected" : "None", isAlert: complianceData.eu.prohibited_practices_detected },
                        ]}
                        onViewDetails={() => router.push(`/compliance/${systemId}`)}
                      />
                    )}

                    {complianceData?.mas && (
                      <ComplianceCard
                        title="MAS AI Risk Management"
                        status={complianceData.mas.overall_compliance_status}
                        iconColor="#7C3AED"
                        fields={[
                          { label: "Risk Level", value: complianceData.mas.overall_risk_level || "N/A" },
                          { label: "Sector", value: complianceData.mas.sector || "N/A" },
                        ]}
                        onViewDetails={() => router.push(`/mas/${systemId}`)}
                      />
                    )}

                    {complianceData?.uk && (
                      <ComplianceCard
                        title="UK AI Act Assessment"
                        status={complianceData.uk.overall_assessment}
                        iconColor="#178746"
                        fields={[
                          { label: "Risk Level", value: complianceData.uk.risk_level || "N/A" },
                          { label: "Sector", value: complianceData.uk.sector_regulation?.sector || "N/A" },
                        ]}
                        onViewDetails={() => router.push(`/uk/${systemId}`)}
                      />
                    )}

                    {!complianceData?.eu && !complianceData?.mas && !complianceData?.uk && (
                      <div className="rounded-[15px] border border-[#CBD5E1] bg-white p-8 text-center">
                        <p className="text-[#667085]">No compliance assessments found for this system ID.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-[15px] border border-[#CBD5E1] bg-white p-8 text-center">
                    <p className="text-[#667085]">No compliance data available for this system.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "tasks" && (
              <div>
                {complianceData ? (
                  <TasksTab
                    tasks={tasks}
                    loading={loadingTasks}
                    onRefresh={fetchTasks}
                    systemId={systemId as string}
                    systemName={systemInfo?.name || "Unnamed System"}
                    systemDescription={systemInfo?.description || ""}
                    riskLevel={systemInfo?.risk_tier || "unknown"}
                    complianceStatus={complianceData.eu?.compliance_status || complianceData.uk?.overall_assessment || complianceData.mas?.overall_compliance_status || "unknown"}
                    lifecycleStage={complianceData.eu?.lifecycle_stage || complianceData.uk?.lifecycle_stage || complianceData.mas?.lifecycle_stage || "Draft"}
                    regulation={complianceData.eu ? "EU" : complianceData.uk ? "UK" : complianceData.mas ? "MAS" : "EU"}
                  />
                ) : (
                  <div className="flex items-center justify-center py-16">
                    <p className="text-[#667085]">Loading compliance data...</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "documentation" && <DocumentationTab systemId={systemId as string} systemType={systemInfo?.type || null} />}
          </section>
        </main>
      </div>

      {selectedAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[15px] border border-[#CBD5E1] bg-white shadow-2xl">
            <RiskDetail
              assessment={selectedAssessment}
              onClose={() => setSelectedAssessment(null)}
              userRole={userRole}
              currentUserId={currentUserId || undefined}
              onStatusChange={handleStatusChange}
              lifecycleStage={systemInfo?.type === "EU AI Act" ? lifecycleStage : null}
              systemType={systemInfo?.type || null}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, badge }: { label: string; value: string; badge?: boolean }) {
  return (
    <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
      {badge ? (
        <span className="inline-flex rounded-full bg-[#F3E8FF] px-3 py-1 text-[13px] font-semibold text-[#7C3AED]">{value}</span>
      ) : (
        <p className="text-[15px] font-semibold text-[#1E293B]">{value}</p>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  valueColor,
  iconType,
}: {
  label: string;
  value: string;
  valueColor: string;
  iconType: "high" | "medium" | "low" | "total" | "approved";
}) {
  const iconByType = {
    high: <AlertTriangle className="h-5 w-5 text-[#C71F1F]" />,
    medium: <AlertCircle className="h-5 w-5 text-[#A97B00]" />,
    low: <CheckCircle2 className="h-5 w-5 text-[#178746]" />,
    total: <FileText className="h-5 w-5 text-[#3B82F6]" />,
    approved: <CheckCircle2 className="h-5 w-5 text-[#178746]" />,
  };

  const bgByType = {
    high: "bg-[#FFE8E8]",
    medium: "bg-[#FFF5D9]",
    low: "bg-[#E8FAEF]",
    total: "bg-[#EAF4FF]",
    approved: "bg-[#E8FAEF]",
  };

  return (
    <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
          <p className="mt-1 text-[24px] font-bold" style={{ color: valueColor }}>
            {value}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bgByType[iconType]}`}>{iconByType[iconType]}</div>
      </div>
    </div>
  );
}

function ComplianceCard({
  title,
  status,
  iconColor,
  fields,
  onViewDetails,
}: {
  title: string;
  status: string;
  iconColor: string;
  fields: { label: string; value: string; isAlert?: boolean }[];
  onViewDetails: () => void;
}) {
  const statusClasses =
    status === "Compliant"
      ? "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]"
      : status === "Partially compliant"
      ? "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]"
      : "border-[#F1A4A4] bg-[#FFE0E0] text-[#C71F1F]";

  return (
    <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColor}15` }}>
            <ShieldCheck className="h-5 w-5" style={{ color: iconColor }} />
          </div>
          <h2 className="text-[17px] font-bold text-[#1E293B]">{title}</h2>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold ${statusClasses}`}>
          {status === "Compliant" ? <CheckCircle2 className="h-3.5 w-3.5" /> : status === "Partially compliant" ? <AlertCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
          {status || "Unknown"}
        </span>
      </div>
      <div className="p-6">
        <div className="mb-6 grid grid-cols-2 gap-4">
          {fields.map((field, idx) => (
            <div key={idx} className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{field.label}</p>
              {field.isAlert ? (
                <span className="inline-flex rounded-full bg-[#FFE0E0] px-3 py-1 text-[13px] font-semibold text-[#C71F1F]">{field.value}</span>
              ) : (
                <span className="inline-flex rounded-full bg-[#F3E8FF] px-3 py-1 text-[13px] font-semibold text-[#7C3AED]">{field.value}</span>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onViewDetails}
          className="flex h-10 items-center gap-2 rounded-[10px] bg-[#3B82F6] px-5 text-[14px] font-semibold text-white shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all"
        >
          View Full Details
        </button>
      </div>
    </section>
  );
}
