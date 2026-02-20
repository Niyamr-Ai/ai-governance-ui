"use client";

import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { backendFetch } from "@/utils/backend-fetch";
import { supabase } from "@/utils/supabase/client";
import Sidebar from "@/components/sidebar";
import {
  ArrowLeft,
  Building2,
  Calendar,
  ChevronDown,
  FileText,
  Link2,
  Loader2,
  LogOut,
  Save,
  ShieldCheck,
  User,
  UserCircle2,
} from "lucide-react";
import type { CreateInternalPolicyInput } from "@/types/policy";

export default function CreateInternalPolicyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<CreateInternalPolicyInput>({
    name: "",
    description: "",
    applies_to: "All AI",
    enforcement_level: "Mandatory",
    owner: "",
    effective_date: "",
    version: "1.0",
    document_url: "",
  });

  useEffect(() => {
    const init = async () => {
      const sessionRes = await supabase.auth.getSession();
      const session = sessionRes.data.session;

      if (!session) {
        router.push("/sign-in");
        return;
      }

      setIsLoading(false);
    };

    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await backendFetch("/api/policies", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create policy");
      }

      const policy = await res.json();
      router.push(`/policy-tracker/${policy.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create policy");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6] mx-auto mb-3" />
          <p className="text-[#667085] text-[15px]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#18181B]" style={{ fontFamily: "Inter, Plus Jakarta Sans, sans-serif" }}>
      <Head>
        <title>Create Internal Policy | Policy Tracker</title>
        <meta name="description" content="Create a new internal AI policy for your organization." />
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
              <h1 className="text-[22px] font-semibold tracking-[0.5px]">Create Internal Policy</h1>
            </div>
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
            <div className="mx-auto max-w-3xl">
              <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
                <div className="border-b border-[#E2E8F0] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3E8FF]">
                      <Building2 className="h-5 w-5 text-[#7C3AED]" />
                    </div>
                    <div>
                      <h2 className="text-[18px] font-bold text-[#1E293B]">New Internal Policy</h2>
                      <p className="text-[13px] text-[#667085]">Create a new organizational AI policy for your team</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  {error && (
                    <div className="mb-6 rounded-[10px] border border-[#F1A4A4] bg-[#FFE0E0] px-4 py-3">
                      <p className="text-[14px] font-medium text-[#C71F1F]">{error}</p>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-[13px] font-semibold text-[#1E293B]">
                        Policy Name <span className="text-[#E72C2C]">*</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="e.g., AI Ethics Policy"
                          className="h-11 w-full rounded-[10px] border border-[#CBD5E1] bg-white pl-10 pr-4 text-[14px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="mb-2 block text-[13px] font-semibold text-[#1E293B]">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the purpose and scope of this policy..."
                        rows={4}
                        className="w-full rounded-[10px] border border-[#CBD5E1] bg-white px-4 py-3 text-[14px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label htmlFor="applies_to" className="mb-2 block text-[13px] font-semibold text-[#1E293B]">
                          Applies To
                        </label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                          <select
                            id="applies_to"
                            value={formData.applies_to}
                            onChange={(e) => setFormData({ ...formData, applies_to: e.target.value as "All AI" | "High-risk only" | "Specific systems" })}
                            className="h-11 w-full appearance-none rounded-[10px] border border-[#CBD5E1] bg-white pl-10 pr-10 text-[14px] text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                          >
                            <option value="All AI">All AI</option>
                            <option value="High-risk only">High-risk only</option>
                            <option value="Specific systems">Specific systems</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="enforcement_level" className="mb-2 block text-[13px] font-semibold text-[#1E293B]">
                          Enforcement Level
                        </label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                          <select
                            id="enforcement_level"
                            value={formData.enforcement_level}
                            onChange={(e) => setFormData({ ...formData, enforcement_level: e.target.value as "Mandatory" | "Advisory" })}
                            className="h-11 w-full appearance-none rounded-[10px] border border-[#CBD5E1] bg-white pl-10 pr-10 text-[14px] text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                          >
                            <option value="Mandatory">Mandatory</option>
                            <option value="Advisory">Advisory</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <label htmlFor="owner" className="mb-2 block text-[13px] font-semibold text-[#1E293B]">
                          Policy Owner
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                          <input
                            id="owner"
                            type="text"
                            value={formData.owner}
                            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                            placeholder="e.g., AI Governance Team"
                            className="h-11 w-full rounded-[10px] border border-[#CBD5E1] bg-white pl-10 pr-4 text-[14px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="version" className="mb-2 block text-[13px] font-semibold text-[#1E293B]">
                          Version
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                          <input
                            id="version"
                            type="text"
                            value={formData.version}
                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                            placeholder="1.0"
                            className="h-11 w-full rounded-[10px] border border-[#CBD5E1] bg-white pl-10 pr-4 text-[14px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="effective_date" className="mb-2 block text-[13px] font-semibold text-[#1E293B]">
                        Effective Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                          id="effective_date"
                          type="date"
                          value={formData.effective_date}
                          onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                          className="h-11 w-full rounded-[10px] border border-[#CBD5E1] bg-white pl-10 pr-4 text-[14px] text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="document_url" className="mb-2 block text-[13px] font-semibold text-[#1E293B]">
                        Document URL <span className="text-[12px] font-normal text-[#94A3B8]">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                        <input
                          id="document_url"
                          type="url"
                          value={formData.document_url}
                          onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                          placeholder="https://example.com/policy-document.pdf"
                          className="h-11 w-full rounded-[10px] border border-[#CBD5E1] bg-white pl-10 pr-4 text-[14px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                        />
                      </div>
                      <p className="mt-1.5 text-[12px] text-[#94A3B8]">Link to the full policy document (PDF/DOC)</p>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-end gap-3 border-t border-[#E2E8F0] pt-6">
                    <button
                      type="button"
                      onClick={() => router.push("/policy-tracker")}
                      className="h-10 rounded-[10px] border border-[#CBD5E1] bg-white px-5 text-[14px] font-semibold text-[#475569] transition-all hover:bg-[#F8FAFC] hover:border-[#94A3B8]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !formData.name}
                      className="flex h-10 items-center gap-2 rounded-[10px] bg-[#3B82F6] px-5 text-[14px] font-semibold text-white shadow-md transition-all hover:bg-[#2563EB] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#3B82F6] disabled:hover:shadow-md"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Create Policy
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
