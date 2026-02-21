"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { backendFetch } from "@/utils/backend-fetch";
import { supabase } from "@/utils/supabase/client";
import Sidebar from "@/components/sidebar";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  Globe,
  Link2,
  Loader2,
  LogOut,
  ShieldCheck,
  User,
  UserCircle2,
  XCircle,
} from "lucide-react";
import type { Policy, PolicyRequirement, ComplianceStatus } from "../../../types/policy";

function statusClasses(status: ComplianceStatus): string {
  if (status === "Compliant") return "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]";
  if (status === "Partially compliant") return "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]";
  if (status === "Non-compliant") return "border-[#F1A4A4] bg-[#FFE0E0] text-[#C71F1F]";
  return "border-[#CBD5E1] bg-[#F1F5F9] text-[#64748B]";
}

function statusIcon(status: ComplianceStatus) {
  if (status === "Compliant") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === "Partially compliant") return <AlertTriangle className="h-3.5 w-3.5" />;
  if (status === "Non-compliant") return <XCircle className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
}

export default function PolicyDetailPage() {
  const router = useRouter();
  const { id: policyId } = router.query;

  const [policy, setPolicy] = useState<(Policy & { requirements?: PolicyRequirement[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const sessionRes = await supabase.auth.getSession();
      const session = sessionRes.data.session;

      if (!session) {
        router.push("/sign-in");
        return;
      }

      if (policyId && typeof policyId === "string") {
        await fetchPolicy(policyId);
      }
    };

    if (router.isReady) {
      init();
    }
  }, [router.isReady, policyId]);

  const fetchPolicy = async (id: string) => {
    try {
      setLoading(true);
      const res = await backendFetch(`/api/policies/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPolicy(data);
      } else {
        setPolicy(null);
      }
    } catch (err) {
      setPolicy(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <Head>
          <title>Loading... | Policy Tracker</title>
        </Head>
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6] mx-auto mb-3" />
          <p className="text-[#667085] text-[15px]">Loading policy...</p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] text-[#18181B]" style={{ fontFamily: "Inter, Plus Jakarta Sans, sans-serif" }}>
        <Head>
          <title>Policy Not Found | Policy Tracker</title>
        </Head>
        <Sidebar onLogout={handleLogout} />
        <div className="mx-auto w-full max-w-[1440px] lg:pl-[267px]">
          <main className="flex-1">
            <header className="flex h-[83px] items-center justify-between border-b border-[#E4E4E7] px-9">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => router.push("/policy-tracker")}
                  className="flex items-center gap-2 text-[14px] font-medium text-[#667085] hover:text-[#18181B] transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Policy Tracker
                </button>
              </div>
            </header>
            <section className="px-9 py-7">
              <div className="mx-auto max-w-3xl">
                <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
                  <div className="p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFE0E0]">
                      <XCircle className="h-8 w-8 text-[#C71F1F]" />
                    </div>
                    <h2 className="text-[20px] font-bold text-[#1E293B]">Policy Not Found</h2>
                    <p className="mt-2 text-[14px] text-[#667085]">
                      The policy you're looking for doesn't exist or couldn't be loaded.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push("/policy-tracker")}
                      className="mt-6 inline-flex items-center gap-2 rounded-[10px] bg-[#3B82F6] px-5 py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all"
                    >
                      Go to Policy Tracker
                    </button>
                  </div>
                </section>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  const isExternal = policy.policy_type === "External";
  const isInternal = policy.policy_type === "Internal";
  const requirementsCount = policy.requirements?.length || 0;
  const assessedCount = policy.requirements?.filter((r) => r.compliance_status !== "Not assessed").length || 0;
  const compliantCount = policy.requirements?.filter((r) => r.compliance_status === "Compliant").length || 0;

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#18181B]" style={{ fontFamily: "Inter, Plus Jakarta Sans, sans-serif" }}>
      <Head>
        <title>{policy.name} | Policy Tracker</title>
        <meta name="description" content={`View details for ${policy.name} policy.`} />
      </Head>
      <Sidebar onLogout={handleLogout} />
      <div className="mx-auto w-full max-w-[1440px] lg:pl-[267px]">
        <main className="flex-1">
          <header className="flex h-[83px] items-center justify-between border-b border-[#E4E4E7] px-9">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/policy-tracker")}
                className="flex items-center gap-2 text-[14px] font-medium text-[#667085] hover:text-[#18181B] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="h-6 w-px bg-[#E4E4E7]" />
              <h1 className="text-[22px] font-semibold tracking-[0.5px]">{policy.name}</h1>
            </div>
            <div className="flex items-center gap-3">
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
              <MetricCard
                label="Total Requirements"
                value={String(requirementsCount)}
                footer="Policy Requirements"
                valueColor="#0D1C2E"
                iconType="total"
              />
              <MetricCard
                label="Assessed"
                value={String(assessedCount)}
                footer="Requirements Reviewed"
                valueColor="#2573C2"
                iconType="assessed"
              />
              <MetricCard
                label="Compliant"
                value={String(compliantCount)}
                footer="Meeting Requirements"
                valueColor="#178746"
                iconType="compliant"
              />
              <MetricCard
                label="Compliance Rate"
                value={requirementsCount > 0 ? `${Math.round((compliantCount / requirementsCount) * 100)}%` : "N/A"}
                footer="Overall Compliance"
                valueColor={requirementsCount > 0 && compliantCount === requirementsCount ? "#178746" : "#A97B00"}
                iconType="rate"
              />
            </div>

            <section className="mb-6 overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
              <div className="border-b border-[#E2E8F0] px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isExternal ? "bg-[#EAF4FF]" : "bg-[#F3E8FF]"}`}>
                    {isExternal ? <Globe className="h-6 w-6 text-[#2573C2]" /> : <Building2 className="h-6 w-6 text-[#7C3AED]" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[20px] font-bold text-[#1E293B]">{policy.name}</h2>
                      {isExternal && (
                        <span className="flex items-center gap-1 text-[11px] text-[#667085]">
                          <ExternalLink className="h-3 w-3" />
                          Read-only
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${isExternal ? "bg-[#EAF4FF] text-[#2573C2]" : "bg-[#F3E8FF] text-[#7C3AED]"}`}>
                        {policy.policy_type}
                      </span>
                      {policy.jurisdiction && (
                        <span className="inline-flex rounded-full bg-[#F3E8FF] px-3 py-1 text-[12px] font-semibold text-[#7C3AED]">
                          {policy.jurisdiction}
                        </span>
                      )}
                      {isInternal && policy.status && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-semibold ${
                            policy.status === "Active"
                              ? "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]"
                              : policy.status === "Draft"
                              ? "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]"
                              : "border-[#CBD5E1] bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {policy.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {policy.summary && (
                    <div className="md:col-span-2">
                      <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-[#94A3B8]">Summary</p>
                      <p className="text-[14px] leading-relaxed text-[#1E293B]">{policy.summary}</p>
                    </div>
                  )}
                  {policy.description && (
                    <div className="md:col-span-2">
                      <p className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-[#94A3B8]">Description</p>
                      <p className="text-[14px] leading-relaxed text-[#1E293B]">{policy.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 md:col-span-2 md:grid-cols-4">
                    <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Version</p>
                      <p className="text-[15px] font-semibold text-[#1E293B]">{policy.version}</p>
                    </div>

                    {isInternal && policy.owner && (
                      <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Owner</p>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#64748B]" />
                          <p className="text-[15px] font-semibold text-[#1E293B]">{policy.owner}</p>
                        </div>
                      </div>
                    )}

                    {isInternal && policy.enforcement_level && (
                      <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Enforcement</p>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                            policy.enforcement_level === "Mandatory" ? "bg-[#FFE0E0] text-[#C71F1F]" : "bg-[#EAF4FF] text-[#2573C2]"
                          }`}
                        >
                          {policy.enforcement_level}
                        </span>
                      </div>
                    )}

                    {isInternal && policy.applies_to && (
                      <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Applies To</p>
                        <p className="text-[15px] font-semibold text-[#1E293B]">{policy.applies_to}</p>
                      </div>
                    )}

                    {isInternal && policy.effective_date && (
                      <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Effective Date</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#64748B]" />
                          <p className="text-[15px] font-semibold text-[#1E293B]">{policy.effective_date}</p>
                        </div>
                      </div>
                    )}

                    {isInternal && policy.document_url && (
                      <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Document</p>
                        <a
                          href={policy.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[14px] font-semibold text-[#3B82F6] hover:underline"
                        >
                          <Link2 className="h-4 w-4" />
                          View Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF4FF]">
                    <ShieldCheck className="h-5 w-5 text-[#2573C2]" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold text-[#1E293B]">Policy Requirements</h2>
                    <p className="text-[12px] text-[#667085]">{requirementsCount} requirements defined</p>
                  </div>
                </div>
              </div>

              {!policy.requirements || policy.requirements.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-[#CBD5E1]" />
                  <p className="mt-3 text-[15px] font-medium text-[#667085]">
                    {isExternal ? "No requirements defined for this external policy yet." : "No requirements added to this policy yet."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {policy.requirements.map((requirement) => (
                    <article key={requirement.id} className="px-6 py-5 transition-colors hover:bg-[#F8FAFC]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h3 className="text-[15px] font-bold text-[#1E293B]">
                                {requirement.requirement_code && (
                                  <span className="mr-2 text-[#3B82F6]">{requirement.requirement_code}</span>
                                )}
                                {requirement.title}
                              </h3>
                              {requirement.description && (
                                <p className="mt-1.5 text-[13px] leading-relaxed text-[#667085]">{requirement.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="flex items-center gap-1.5 text-[12px] text-[#64748B]">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Applies to: <span className="font-semibold text-[#1E293B]">{requirement.applies_to_scope}</span>
                            </span>
                          </div>
                          {requirement.notes && (
                            <div className="mt-3 rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">Notes</p>
                              <p className="mt-1 text-[13px] text-[#475569]">{requirement.notes}</p>
                            </div>
                          )}
                        </div>
                        <span
                          className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${statusClasses(requirement.compliance_status)}`}
                        >
                          {statusIcon(requirement.compliance_status)}
                          {requirement.compliance_status}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
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
  iconType: "total" | "assessed" | "compliant" | "rate";
}) {
  const iconByType = {
    total: <ShieldCheck className="h-4 w-4 text-[#61A9ED]" />,
    assessed: <FileText className="h-4 w-4 text-[#2573C2]" />,
    compliant: <CheckCircle2 className="h-4 w-4 text-[#178746]" />,
    rate: <ShieldCheck className="h-4 w-4 text-[#A97B00]" />,
  } as const;

  const bgByType = {
    total: "bg-[#EAF4FF]",
    assessed: "bg-[#EAF4FF]",
    compliant: "bg-[#E8FAEF]",
    rate: "bg-[#FFF5D9]",
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
