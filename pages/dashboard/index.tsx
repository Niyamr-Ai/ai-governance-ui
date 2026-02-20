"use client";

import Head from "next/head";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { backendFetch } from "@/utils/backend-fetch";
import { supabase } from "@/utils/supabase/client";
import Sidebar from "@/components/sidebar";
import {
  AlertTriangle,
  ArrowUpRight,
  Ban,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  LogOut,
  ShieldCheck,
  UserCircle2,
  XCircle,
} from "lucide-react";

type ComplianceTone = "Compliant" | "Partially compliant" | "Non-compliant";
type RiskTone = "High" | "Medium" | "Low";
type Regulation = "EU AI Act" | "UK AI Act" | "MAS";

type UnifiedRow = {
  id: string;
  systemName: string;
  createdAt: string;
  regulation: Regulation;
  risk: RiskTone;
  status: ComplianceTone;
  score: string;
  scoreValue: number;
  accountability: string;
  detailsPath: string;
  deletePath: string;
  raw: any;
};

function normalizeStatus(value: string | undefined): ComplianceTone {
  const clean = (value || "").toLowerCase().trim();
  if (clean.includes("partial")) return "Partially compliant";
  if (clean.includes("non")) return "Non-compliant";
  return "Compliant";
}

function normalizeUkRisk(value: string | undefined): RiskTone {
  const clean = (value || "").toLowerCase();
  if (clean.includes("frontier") || clean.includes("high")) return "High";
  if (clean.includes("medium")) return "Medium";
  return "Low";
}

function normalizeMasRisk(value: string | undefined): RiskTone {
  const clean = (value || "").toLowerCase();
  if (clean.includes("critical") || clean.includes("high")) return "High";
  if (clean.includes("medium")) return "Medium";
  return "Low";
}

function normalizeEuRisk(value: string | undefined): RiskTone {
  const clean = (value || "").toLowerCase();
  if (clean.includes("prohibited") || clean.includes("unacceptable") || clean.includes("high")) return "High";
  if (clean.includes("limited") || clean.includes("medium")) return "Medium";
  return "Low";
}

function statusClasses(status: ComplianceTone): string {
  if (status === "Compliant") return "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]";
  if (status === "Partially compliant") return "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]";
  return "border-[#F1A4A4] bg-[#FFE0E0] text-[#C71F1F]";
}

function statusIcon(status: ComplianceTone) {
  if (status === "Compliant") return <CheckCircle2 className="h-[11px] w-[11px]" />;
  if (status === "Partially compliant") return <AlertTriangle className="h-[11px] w-[11px]" />;
  return <XCircle className="h-[11px] w-[11px]" />;
}

function riskClasses(risk: RiskTone): string {
  if (risk === "High") return "bg-[#FFE6EA] text-[#C71F1F]";
  if (risk === "Medium") return "bg-[#FFF5D9] text-[#A97B00]";
  return "bg-[#E8FAEF] text-[#178746]";
}

export default function DashboardPage() {
  const router = useRouter();
  const [allRows, setAllRows] = useState<UnifiedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regulationFilter, setRegulationFilter] = useState<"all" | Regulation>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ComplianceTone>("all");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ukRes, masRes, euRes] = await Promise.all([
          backendFetch("/api/uk-compliance"),
          backendFetch("/api/mas-compliance"),
          backendFetch("/api/compliance"),
        ]);

        const ukData = ukRes.ok ? await ukRes.json() : [];
        const masData = masRes.ok ? await masRes.json() : [];
        const euData = euRes.ok ? await euRes.json() : [];

        const ukRows: UnifiedRow[] = Array.isArray(ukData)
          ? ukData.map((item: any) => {
              const fallbackScore = item.overall_assessment === "Compliant" ? 100 : item.overall_assessment === "Partially compliant" ? 65 : 30;
              const numericScore = item.compliance_score != null ? Math.round(Number(item.compliance_score)) : fallbackScore;
              return {
                id: String(item.id),
                systemName: item.raw_answers?.system_name || item.raw_answers?.name || "Untitled",
                createdAt: item.created_at,
                regulation: "UK AI Act",
                risk: normalizeUkRisk(item.risk_level),
                status: normalizeStatus(item.overall_assessment),
                score: `${numericScore}%`,
                scoreValue: numericScore,
                accountability: item.raw_answers?.owner || item.raw_answers?.accountability_owner || "N/A",
                detailsPath: `/uk/${item.id}`,
                deletePath: `/api/uk-compliance/${item.id}`,
                raw: item,
              };
            })
          : [];

        const masRows: UnifiedRow[] = Array.isArray(masData)
          ? masData.map((item: any) => {
              const pillars = [
                item.governance,
                item.inventory,
                item.dataManagement,
                item.transparency,
                item.fairness,
                item.humanOversight,
                item.thirdParty,
                item.algoSelection,
                item.evaluationTesting,
                item.techCybersecurity,
                item.monitoringChange,
                item.capabilityCapacity,
              ].filter(Boolean);
              const missingCount = pillars.filter((p: any) => p.status !== "Compliant").length;
              const fallbackScore = Math.max(0, 100 - missingCount * 8);
              const numericScore = item.compliance_score != null ? Math.round(Number(item.compliance_score)) : fallbackScore;
              return {
                id: String(item.id),
                systemName: item.system_name || "Untitled",
                createdAt: item.created_at,
                regulation: "MAS" as const,
                risk: normalizeMasRisk(item.overall_risk_level),
                status: normalizeStatus(item.overall_compliance_status),
                score: `${numericScore}%`,
                scoreValue: numericScore,
                accountability: item.owner || "N/A",
                detailsPath: `/mas/${item.id}`,
                deletePath: `/api/mas-compliance/${item.id}`,
                raw: item,
              };
            })
          : [];

        const euRows: UnifiedRow[] = Array.isArray(euData)
          ? euData.map((item: any) => {
              const fallbackScore = item.compliance_status === "Compliant" ? 100 : item.compliance_status === "Partially compliant" ? 65 : 30;
              const numericScore = item.compliance_score != null ? Math.round(Number(item.compliance_score)) : fallbackScore;
              return {
                id: String(item.id),
                systemName: item.system_name || item.raw_answers?.system_name || "Untitled",
                createdAt: item.created_at,
                regulation: "EU AI Act",
                risk: normalizeEuRisk(item.risk_tier),
                status: normalizeStatus(item.compliance_status),
                score: `${numericScore}%`,
                scoreValue: numericScore,
                accountability: item.raw_answers?.owner || item.accountable_owner || "N/A",
                detailsPath: `/compliance/${item.id}`,
                deletePath: `/api/compliance/${item.id}`,
                raw: item,
              };
            })
          : [];

        const merged = [...euRows, ...masRows, ...ukRows].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setAllRows(merged);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to load dashboard";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const rows = useMemo(() => {
    return allRows.filter((row) => {
      const matchRegulation = regulationFilter === "all" || row.regulation === regulationFilter;
      const matchStatus = statusFilter === "all" || row.status === statusFilter;
      return matchRegulation && matchStatus;
    });
  }, [allRows, regulationFilter, statusFilter]);

  const metrics = useMemo(() => {
    const prohibited = allRows.filter((row) => row.status === "Non-compliant").length;
    const highRisks = allRows.filter((row) => row.risk === "High").length;
    const total = allRows.length;
    const compliancePoints = allRows.reduce((acc, row) => acc + row.scoreValue, 0);
    const average = total > 0 ? Math.round(compliancePoints / total) : 0;
    return { prohibited, highRisks, total, average };
  }, [allRows]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const handleDeleteRow = async (row: UnifiedRow) => {
    const previousRows = allRows;
    setError(null);
    setAllRows((prev) => prev.filter((item) => !(item.id === row.id && item.regulation === row.regulation)));
    try {
      setDeletingId(row.id);
      const res = await backendFetch(row.deletePath, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Delete failed");
      }
    } catch (err: unknown) {
      setAllRows(previousRows);
      const message = err instanceof Error ? err.message : "Delete failed";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadRow = (row: UnifiedRow) => {
    const blob = new Blob([JSON.stringify(row.raw, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${row.regulation}-${row.systemName}-${row.id}.json`.replace(/\s+/g, "_");
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#18181B]" style={{ fontFamily: "Inter, Plus Jakarta Sans, sans-serif" }}>
      <Head>
        <title>Dashboard</title>
        <meta name="description" content="AI Systems Compliance Dashboard" />
      </Head>
      <Sidebar onLogout={handleLogout} />
      <div className="mx-auto w-full max-w-[1440px] lg:pl-[267px]">
        <main className="flex-1">
          <header className="flex h-[83px] items-center justify-between border-b border-[#E4E4E7] px-9">
            <h1 className="text-[22px] font-semibold tracking-[0.5px]">Dashboard</h1>
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
          </header>

          <section className="px-9 py-7">
            <div className="mb-8 grid grid-cols-2 gap-[22px] xl:grid-cols-4">
              <MetricCard label="Prohibited" value={String(metrics.prohibited)} footer="Critical Systems" valueColor="#E72C2C" iconType="prohibited" />
              <MetricCard label="High Risks" value={String(metrics.highRisks)} footer="Requires Attention" valueColor="#E7BB2C" iconType="highRisk" />
              <MetricCard label="Total Assessments" value={String(metrics.total)} footer="Total Assessments" valueColor="#0D1C2E" iconType="total" />
              <MetricCard label="Average Compliance Score" value={`${metrics.average}%`} footer="Overall Health Metric" valueColor="#0D1C2E" iconType="average" />
            </div>

            <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
              <div className="flex items-start justify-between px-[20.9px] pb-3 pt-4">
                <div>
                  <h2 className="text-[17.5px] font-extrabold tracking-[-0.01em] text-[#1E293B]">AI Systems Compliance Overview</h2>
                  <p className="text-[11px] text-[#667085]">Unified view of all AI compliance assessments across EU AI Act, MAS, and UK AI Act</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] px-3 text-[12px] font-bold text-[#475569]">
                    <ShieldCheck className="h-4 w-4" />
                    <select
                      value={regulationFilter}
                      onChange={(e) => setRegulationFilter(e.target.value as "all" | Regulation)}
                      className="bg-transparent text-[12px] font-bold outline-none"
                    >
                      <option value="all">All Regulations</option>
                      <option value="EU AI Act">EU AI Act</option>
                      <option value="UK AI Act">UK AI Act</option>
                      <option value="MAS">MAS</option>
                    </select>
                  </label>
                  <label className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] px-3 text-[12px] font-bold text-[#475569]">
                    <AlertTriangle className="h-4 w-4" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as "all" | ComplianceTone)}
                      className="bg-transparent text-[12px] font-bold outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="Compliant">Compliant</option>
                      <option value="Partially compliant">Partially</option>
                      <option value="Non-compliant">Non-compliant</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push("/assessment")}
                    className="flex h-9 items-center gap-2 rounded-[10px] bg-[#88BEF1] px-4 text-[15px] font-semibold text-white"
                  >
                    <span className="text-[18px] leading-none">+</span>
                    New Assessment
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[920px]">
                  <div
                    className="grid grid-cols-[2fr_1fr_1fr_1.4fr_1fr_1.3fr_1.2fr] border-y border-[#CBD5E1] bg-[#F8FAFC] px-[20.9px] py-3 text-[12.2px] font-bold text-[#1E293B]"
                    style={{ fontFamily: "Plus Jakarta Sans, Inter, sans-serif" }}
                  >
                    <span>System Name</span>
                    <span>Regulation</span>
                    <span>Risks</span>
                    <span>Status</span>
                    <span>Score</span>
                    <span>Accountability</span>
                    <span>Actions</span>
                  </div>

                  {loading && <div className="px-[20.9px] py-6 text-[15px] text-[#667085]">Loading assessments...</div>}
                  {!loading && error && <div className="px-[20.9px] py-6 text-[15px] font-semibold text-[#E72C2C]">{error}</div>}
                  {!loading && !error && rows.length === 0 && <div className="px-[20.9px] py-6 text-[15px] text-[#667085]">No records found.</div>}

                  {!loading &&
                    !error &&
                    rows.map((row) => (
                      <article
                        key={`${row.regulation}-${row.id}`}
                        className="grid grid-cols-[2fr_1fr_1fr_1.4fr_1fr_1.3fr_1.2fr] items-center border-b border-[#E2E8F0] px-[20.9px] py-[10.5px] text-[13px] transition-colors hover:bg-[#F8FAFC] last:border-b-0"
                        style={{ minHeight: "62.8px", fontFamily: "Plus Jakarta Sans, Inter, sans-serif" }}
                      >
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => router.push(row.detailsPath)}
                            className="block truncate text-left text-[14px] font-bold text-[#000000]"
                          >
                            {row.systemName}
                          </button>
                          <p className="truncate text-[11.5px] text-[#667085]">Created At: {new Date(row.createdAt).toLocaleString()}</p>
                        </div>

                        <p className="text-[15px] font-bold text-[#475569]">{row.regulation}</p>
                        <span className={`inline-flex w-fit rounded-full px-[10px] py-[4px] text-[12px] font-semibold ${riskClasses(row.risk)}`}>{row.risk}</span>
                        <span className={`inline-flex w-fit items-center gap-1 rounded-[10.4px] border px-[10.4px] py-[4px] text-[10px] font-bold ${statusClasses(row.status)}`}>
                          {statusIcon(row.status)}
                          {row.status === "Partially compliant" ? "Partially Compliant" : row.status}
                        </span>
                        <span className="text-[15px] text-[#000000]">{row.score}</span>
                        <span className="text-[15px] text-[#000000]">{row.accountability}</span>

                        <div className="flex items-center gap-[6px] text-[#475569]">
                          <button
                            type="button"
                            onClick={() => void handleDeleteRow(row)}
                            disabled={deletingId === row.id}
                            className="rounded p-1 hover:bg-[#F1F5F9] disabled:opacity-50"
                            aria-label="Delete row"
                          >
                            <Image src="/images/uipro/Button-Icon.svg" alt="" width={28} height={28} className="h-6 w-6" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadRow(row)}
                            className="rounded p-1 hover:bg-[#F1F5F9]"
                            aria-label="Download row"
                          >
                            <Image src="/images/uipro/Button-Icon1.svg" alt="" width={28} height={28} className="h-6 w-6" />
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(row.detailsPath)}
                            className="rounded p-1 hover:bg-[#F1F5F9]"
                            aria-label="Open row details"
                          >
                            <ArrowUpRight className="h-6 w-6" />
                          </button>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  footer,
  valueColor,
  iconType,
}: {
  label: string;
  value: string;
  footer: string;
  valueColor: string;
  iconType: "prohibited" | "highRisk" | "total" | "average";
}) {
  const iconByType = {
    prohibited: <Ban className="h-4 w-4 text-[#E72C2C]" />,
    highRisk: <AlertTriangle className="h-4 w-4 text-[#E7BB2C]" />,
    total: <BarChart3 className="h-4 w-4 text-[#61A9ED]" />,
    average: <ShieldCheck className="h-4 w-4 text-[#61A9ED]" />,
  } as const;

  const bgByType = {
    prohibited: "bg-[#FFE8E8]",
    highRisk: "bg-[#FFF8E2]",
    total: "bg-[#EAF4FF]",
    average: "bg-[#EAF4FF]",
  } as const;

  return (
    <article className="h-[136px] rounded-[15px] border border-[#E4E4E7] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-medium text-[#18181B]">{label}</p>
          <p className="mt-[5px] text-[23px] font-semibold leading-[38px]" style={{ color: valueColor }}>
            {value}
          </p>
          <p className="text-[13px] font-medium text-[#18181B]">{footer}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${bgByType[iconType]}`}>{iconByType[iconType]}</div>
      </div>
    </article>
  );
}
