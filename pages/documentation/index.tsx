"use client";

import Head from "next/head";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { backendFetch } from "@/utils/backend-fetch";
import { supabase } from "@/utils/supabase/client";
import Sidebar from "@/components/sidebar";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCircle2,
  X,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DocumentationWithSystemInfo } from "../../types/documentation";

type DocumentStatus = "current" | "outdated" | "requires_regeneration";

function statusClasses(status: string): string {
  if (status === "current") return "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]";
  if (status === "outdated") return "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]";
  if (status === "requires_regeneration") return "border-[#F1A4A4] bg-[#FFE0E0] text-[#C71F1F]";
  return "border-[#CBD5E1] bg-[#F1F5F9] text-[#64748B]";
}

function statusIcon(status: string) {
  if (status === "current") return <CheckCircle2 className="h-3 w-3" />;
  if (status === "outdated") return <AlertCircle className="h-3 w-3" />;
  if (status === "requires_regeneration") return <RefreshCw className="h-3 w-3" />;
  return <FileText className="h-3 w-3" />;
}

function regulationClasses(regulation: string): string {
  if (regulation === "EU AI Act") return "bg-[#EAF4FF] text-[#2573C2]";
  if (regulation === "UK AI Act") return "bg-[#E8FAEF] text-[#178746]";
  if (regulation === "MAS") return "bg-[#F3E8FF] text-[#7C3AED]";
  return "bg-[#F1F5F9] text-[#64748B]";
}

export default function DocumentationPage() {
  const router = useRouter();
  const [documentation, setDocumentation] = useState<DocumentationWithSystemInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const [regulationFilter, setRegulationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const sessionRes = await supabase.auth.getSession();
      const session = sessionRes.data.session;

      if (!session) {
        router.push("/sign-in");
        return;
      }

      await fetchDocumentation();
    };

    init();
  }, [router]);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (regulationFilter !== "all") params.append("regulation_type", regulationFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await backendFetch(`/api/documentation?${params.toString()}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch documentation");
      }

      const data = await res.json();
      setDocumentation(data.documentation || []);
    } catch (err: any) {
      setError(err.message || "Failed to load documentation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchDocumentation();
    }
  }, [regulationFilter, statusFilter]);

  const filteredDocs = useMemo(() => {
    return documentation.filter((doc) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        doc.system_name?.toLowerCase().includes(query) ||
        doc.regulation_type.toLowerCase().includes(query) ||
        doc.document_type?.toLowerCase().includes(query) ||
        doc.version.toLowerCase().includes(query)
      );
    });
  }, [documentation, searchQuery]);

  const metrics = useMemo(() => {
    const total = documentation.length;
    const current = documentation.filter((d) => d.status === "current").length;
    const outdated = documentation.filter((d) => d.status === "outdated").length;
    const requiresRegeneration = documentation.filter((d) => d.status === "requires_regeneration").length;
    return { total, current, outdated, requiresRegeneration };
  }, [documentation]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const handleViewDocument = (systemId: string) => {
    router.push(`/ai-systems/${systemId}?tab=documentation`);
  };

  const clearFilters = () => {
    setRegulationFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters = regulationFilter !== "all" || statusFilter !== "all" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#18181B]" style={{ fontFamily: "Inter, Plus Jakarta Sans, sans-serif" }}>
      <Head>
        <title>Documentation | AI Governance</title>
        <meta name="description" content="View and manage all compliance documentation across all AI systems." />
      </Head>
      <Sidebar onLogout={handleLogout} />
      <div className="mx-auto w-full max-w-[1440px] lg:pl-[267px]">
        <main className="flex-1">
          <header className="flex h-[83px] items-center justify-between border-b border-[#E4E4E7] px-9">
            <h1 className="text-[22px] font-semibold tracking-[0.5px]">Documentation</h1>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchDocumentation}
                disabled={loading}
                className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] bg-white px-4 text-[14px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
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
            <div className="mb-8 grid grid-cols-2 gap-[22px] xl:grid-cols-4">
              <MetricCard label="Total Documents" value={String(metrics.total)} footer="All Documentation" valueColor="#0D1C2E" iconType="total" />
              <MetricCard label="Current" value={String(metrics.current)} footer="Up to Date" valueColor="#178746" iconType="current" />
              <MetricCard label="Outdated" value={String(metrics.outdated)} footer="Needs Review" valueColor="#A97B00" iconType="outdated" />
              <MetricCard label="Requires Regeneration" value={String(metrics.requiresRegeneration)} footer="Action Required" valueColor="#C71F1F" iconType="regeneration" />
            </div>

            <section className="mb-6 overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
              <div className="flex items-start justify-between px-6 pb-3 pt-4">
                <div>
                  <h2 className="text-[17.5px] font-extrabold tracking-[-0.01em] text-[#1E293B]">All Documentation</h2>
                  <p className="text-[11px] text-[#667085]">{filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""} found</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-[180px] rounded-[10px] border border-[#CBD5E1] bg-white pl-10 pr-4 text-[12px] font-bold text-[#475569] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                    />
                  </div>
                  <Select value={regulationFilter} onValueChange={setRegulationFilter}>
                    <SelectTrigger className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] px-3 text-[12px] font-bold text-[#475569] shadow-none w-[150px] bg-white">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        <SelectValue placeholder="All Regulations" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50 rounded-[10px] text-[12px] font-semibold text-[#475569] shadow-md border-[#CBD5E1]">
                      <SelectItem value="all">All Regulations</SelectItem>
                      <SelectItem value="EU AI Act">EU AI Act</SelectItem>
                      <SelectItem value="UK AI Act">UK AI Act</SelectItem>
                      <SelectItem value="MAS">MAS</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] px-3 text-[12px] font-bold text-[#475569] shadow-none w-[130px] bg-white">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        <SelectValue placeholder="All Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50 rounded-[10px] text-[12px] font-semibold text-[#475569] shadow-md border-[#CBD5E1]">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                      <SelectItem value="outdated">Outdated</SelectItem>
                      <SelectItem value="requires_regeneration">Regenerate</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="flex h-9 items-center gap-1.5 rounded-[10px] border border-[#CBD5E1] bg-white px-3 text-[12px] font-bold text-[#475569] hover:bg-[#F8FAFC] transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
              <div className="overflow-x-auto">
                <div className="min-w-[920px]">
                  <div
                    className="grid grid-cols-[2fr_1fr_1.5fr_0.8fr_1.2fr_1fr_1fr] border-y border-[#CBD5E1] bg-[#F8FAFC] px-6 py-3 text-[12.2px] font-bold text-[#1E293B]"
                    style={{ fontFamily: "Plus Jakarta Sans, Inter, sans-serif" }}
                  >
                    <span>AI System</span>
                    <span>Regulation</span>
                    <span>Document Type</span>
                    <span>Version</span>
                    <span>Status</span>
                    <span>Last Generated</span>
                    <span>Actions</span>
                  </div>

                  {loading && (
                    <div className="flex items-center gap-2 px-6 py-8 text-[15px] text-[#667085]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading documentation...
                    </div>
                  )}

                  {!loading && error && (
                    <div className="px-6 py-8 text-center">
                      <AlertCircle className="mx-auto h-10 w-10 text-[#C71F1F]" />
                      <p className="mt-2 text-[15px] font-semibold text-[#C71F1F]">{error}</p>
                    </div>
                  )}

                  {!loading && !error && filteredDocs.length === 0 && (
                    <div className="px-6 py-12 text-center">
                      <FileText className="mx-auto h-12 w-12 text-[#CBD5E1]" />
                      <p className="mt-3 text-[15px] font-medium text-[#667085]">No documentation found</p>
                      <p className="mt-1 text-[13px] text-[#94A3B8]">
                        {documentation.length === 0 ? "Generate documentation from an AI system detail page" : "Try adjusting your filters"}
                      </p>
                    </div>
                  )}

                  {!loading &&
                    !error &&
                    filteredDocs.map((doc) => (
                      <article
                        key={doc.id}
                        className="grid grid-cols-[2fr_1fr_1.5fr_0.8fr_1.2fr_1fr_1fr] items-center border-b border-[#E2E8F0] px-6 py-[12px] text-[13px] transition-colors hover:bg-[#F8FAFC] last:border-b-0"
                        style={{ minHeight: "60px", fontFamily: "Plus Jakarta Sans, Inter, sans-serif" }}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-bold text-[#000000]">
                            {doc.system_name || `System ${doc.ai_system_id.substring(0, 8)}...`}
                          </p>
                        </div>

                        <span className={`inline-flex w-fit rounded-full px-[10px] py-[4px] text-[11px] font-semibold ${regulationClasses(doc.regulation_type)}`}>
                          {doc.regulation_type}
                        </span>

                        <span className="text-[13px] text-[#475569]">{doc.document_type || "Compliance Summary"}</span>

                        <span className="font-mono text-[13px] text-[#475569]">v{doc.version}</span>

                        <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-[10px] py-[4px] text-[10px] font-bold ${statusClasses(doc.status)}`}>
                          {statusIcon(doc.status)}
                          {doc.status === "current" ? "Current" : doc.status === "outdated" ? "Outdated" : "Regenerate"}
                        </span>

                        <span className="text-[13px] text-[#667085]">{new Date(doc.created_at).toLocaleDateString()}</span>

                        <div>
                          <button
                            type="button"
                            onClick={() => handleViewDocument(doc.ai_system_id)}
                            className="flex items-center gap-1.5 rounded-[8px] border border-[#3B82F6]/40 bg-[#3B82F6]/5 px-3 py-1.5 text-[12px] font-semibold text-[#3B82F6] hover:bg-[#3B82F6]/10 hover:border-[#3B82F6]/60 transition-all"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            View
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
  iconType: "total" | "current" | "outdated" | "regeneration";
}) {
  const iconByType = {
    total: <FileText className="h-4 w-4 text-[#61A9ED]" />,
    current: <CheckCircle2 className="h-4 w-4 text-[#178746]" />,
    outdated: <AlertCircle className="h-4 w-4 text-[#A97B00]" />,
    regeneration: <RefreshCw className="h-4 w-4 text-[#C71F1F]" />,
  } as const;

  const bgByType = {
    total: "bg-[#EAF4FF]",
    current: "bg-[#E8FAEF]",
    outdated: "bg-[#FFF5D9]",
    regeneration: "bg-[#FFE8E8]",
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
