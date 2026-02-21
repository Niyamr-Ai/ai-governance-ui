"use client";

import Head from "next/head";
import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { backendFetch } from "@/utils/backend-fetch";
import { supabase } from "@/utils/supabase/client";
import Sidebar from "@/components/sidebar";
import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  Globe,
  Building2,
  LogOut,
  ShieldCheck,
  UserCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { Policy } from "../../types/policy";

type PolicyType = "External" | "Internal";
type PolicyStatus = "Active" | "Draft" | "Archived" | "All";

function typeClasses(type: PolicyType): string {
  if (type === "External") return "bg-[#EAF4FF] text-[#2573C2]";
  return "bg-[#F3E8FF] text-[#7C3AED]";
}

function statusClasses(status: string | undefined): string {
  if (status === "Active") return "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]";
  if (status === "Draft") return "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]";
  if (status === "Archived") return "border-[#CBD5E1] bg-[#F1F5F9] text-[#64748B]";
  return "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]";
}

export default function PolicyTrackerPage() {
  const router = useRouter();
  const [allPolicies, setAllPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | PolicyType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | PolicyStatus>("all");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const sessionRes = await supabase.auth.getSession();
      const session = sessionRes.data.session;

      if (!session) {
        router.push("/sign-in");
        return;
      }

      await fetchPolicies();
    };

    init();
  }, [router]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await backendFetch("/api/policies");

      if (!res.ok) {
        throw new Error("Failed to fetch policies");
      }

      const data = await res.json();
      setAllPolicies(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load policies";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const policies = useMemo(() => {
    return allPolicies.filter((policy) => {
      const matchType = typeFilter === "all" || policy.policy_type === typeFilter;
      const matchStatus = statusFilter === "all" || policy.status === statusFilter || (statusFilter === "Active" && policy.policy_type === "External");
      return matchType && matchStatus;
    });
  }, [allPolicies, typeFilter, statusFilter]);

  const metrics = useMemo(() => {
    const total = allPolicies.length;
    const external = allPolicies.filter((p) => p.policy_type === "External").length;
    const internal = allPolicies.filter((p) => p.policy_type === "Internal").length;
    const active = allPolicies.filter((p) => p.status === "Active" || p.policy_type === "External").length;
    return { total, external, internal, active };
  }, [allPolicies]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#18181B]" style={{ fontFamily: "Inter, Plus Jakarta Sans, sans-serif" }}>
      <Head>
        <title>Policy Tracker | AI Governance</title>
        <meta name="description" content="Track and manage AI regulations and organizational policies" />
      </Head>
      <Sidebar onLogout={handleLogout} />
      <div className="mx-auto w-full max-w-[1440px] lg:pl-[267px]">
        <main className="flex-1">
          <header className="flex h-[83px] items-center justify-between border-b border-[#E4E4E7] px-9">
            <h1 className="text-[22px] font-semibold tracking-[0.5px]">Policy Tracker</h1>
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
              <MetricCard label="Total Policies" value={String(metrics.total)} footer="All Policies" valueColor="#0D1C2E" iconType="total" />
              <MetricCard label="External Policies" value={String(metrics.external)} footer="Regulatory Frameworks" valueColor="#2573C2" iconType="external" />
              <MetricCard label="Internal Policies" value={String(metrics.internal)} footer="Organization Policies" valueColor="#7C3AED" iconType="internal" />
              <MetricCard label="Active Policies" value={String(metrics.active)} footer="Currently Enforced" valueColor="#178746" iconType="active" />
            </div>

            <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
              <div className="flex flex-col gap-4 px-[20.9px] pb-3 pt-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-[17.5px] font-extrabold tracking-[-0.01em] text-[#1E293B]">Policy Overview</h2>
                  <p className="text-[11px] text-[#667085]">Track external AI regulations and manage internal organizational policies</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] px-3 text-[12px] font-bold text-[#475569]">
                    <ShieldCheck className="h-4 w-4" />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as "all" | PolicyType)}
                      className="bg-transparent text-[12px] font-bold outline-none"
                    >
                      <option value="all">All Types</option>
                      <option value="External">External</option>
                      <option value="Internal">Internal</option>
                    </select>
                  </label>
                  <label className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] px-3 text-[12px] font-bold text-[#475569]">
                    <FileText className="h-4 w-4" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as "all" | PolicyStatus)}
                      className="bg-transparent text-[12px] font-bold outline-none"
                    >
                      <option value="all">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push("/policy-tracker/new")}
                    className="flex h-9 items-center gap-2 rounded-[10px] bg-[#3B82F6] px-4 text-[15px] font-semibold text-white shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all"
                  >
                    <span className="text-[18px] leading-none">+</span>
                    Create Policy
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[920px]">
                  <div
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.2fr] border-y border-[#CBD5E1] bg-[#F8FAFC] px-[20.9px] py-3 text-[12.2px] font-bold text-[#1E293B]"
                    style={{ fontFamily: "Plus Jakarta Sans, Inter, sans-serif" }}
                  >
                    <span>Policy Name</span>
                    <span>Type</span>
                    <span>Jurisdiction / Owner</span>
                    <span>Version</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>

                  {loading && (
                    <div className="flex items-center gap-2 px-[20.9px] py-6 text-[15px] text-[#667085]">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading policies...
                    </div>
                  )}
                  {!loading && error && <div className="px-[20.9px] py-6 text-[15px] font-semibold text-[#E72C2C]">{error}</div>}
                  {!loading && !error && policies.length === 0 && (
                    <div className="px-[20.9px] py-12 text-center">
                      <FileText className="mx-auto h-12 w-12 text-[#CBD5E1]" />
                      <p className="mt-3 text-[15px] text-[#667085]">No policies found.</p>
                      <button
                        type="button"
                        onClick={() => router.push("/policy-tracker/new")}
                        className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#3B82F6] px-4 py-2 text-[14px] font-semibold text-white shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all"
                      >
                        <span className="text-[16px] leading-none">+</span>
                        Create Your First Policy
                      </button>
                    </div>
                  )}

                  {!loading &&
                    !error &&
                    policies.map((policy) => (
                      <article
                        key={policy.id}
                        className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.2fr] items-center border-b border-[#E2E8F0] px-[20.9px] py-[10.5px] text-[13px] transition-colors hover:bg-[#F8FAFC] last:border-b-0"
                        style={{ minHeight: "62.8px", fontFamily: "Plus Jakarta Sans, Inter, sans-serif" }}
                      >
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => router.push(`/policy-tracker/${policy.id}`)}
                            className="flex items-center gap-2 text-left text-[14px] font-bold text-[#000000] hover:text-[#2573C2]"
                          >
                            {policy.policy_type === "External" ? (
                              <Globe className="h-4 w-4 flex-shrink-0 text-[#2573C2]" />
                            ) : (
                              <Building2 className="h-4 w-4 flex-shrink-0 text-[#7C3AED]" />
                            )}
                            <span className="truncate">{policy.name}</span>
                          </button>
                          {policy.summary && (
                            <p className="mt-0.5 truncate text-[11.5px] text-[#667085]">{policy.summary}</p>
                          )}
                        </div>

                        <span className={`inline-flex w-fit rounded-full px-[10px] py-[4px] text-[12px] font-semibold ${typeClasses(policy.policy_type)}`}>
                          {policy.policy_type}
                        </span>

                        <span className="text-[14px] text-[#475569]">
                          {policy.policy_type === "External" ? policy.jurisdiction || "—" : policy.owner || "—"}
                        </span>

                        <span className="text-[14px] text-[#000000]">{policy.version}</span>

                        <span className={`inline-flex w-fit items-center gap-1 rounded-[10.4px] border px-[10.4px] py-[4px] text-[10px] font-bold ${statusClasses(policy.status)}`}>
                          {policy.policy_type === "External" ? "Active" : policy.status || "Active"}
                        </span>

                        <div className="flex items-center gap-[6px] text-[#475569]">
                          <button
                            type="button"
                            onClick={() => router.push(`/policy-tracker/${policy.id}`)}
                            className="rounded p-1 hover:bg-[#F1F5F9]"
                            aria-label="View policy details"
                          >
                            <ArrowUpRight className="h-5 w-5" />
                          </button>
                          {policy.policy_type === "External" && (
                            <span className="flex items-center gap-1 text-[11px] text-[#667085]">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Read-only
                            </span>
                          )}
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
  iconType: "total" | "external" | "internal" | "active";
}) {
  const iconByType = {
    total: <ShieldCheck className="h-4 w-4 text-[#61A9ED]" />,
    external: <Globe className="h-4 w-4 text-[#2573C2]" />,
    internal: <Building2 className="h-4 w-4 text-[#7C3AED]" />,
    active: <FileText className="h-4 w-4 text-[#178746]" />,
  } as const;

  const bgByType = {
    total: "bg-[#EAF4FF]",
    external: "bg-[#EAF4FF]",
    internal: "bg-[#F3E8FF]",
    active: "bg-[#E8FAEF]",
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
