"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Loader2, RefreshCw, Shield, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";
import { SmartGovernanceSuggestions } from "@/components/ui/smart-governance-suggestions";
import type { GovernanceTask } from "@/types/governance-task";
import type { SmartSuggestion } from "@/types/smart-governance-suggestions";

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

type Props = {
  tasks: GovernanceTask[];
  loading: boolean;
  onRefresh: () => Promise<void> | void;
  systemId: string;
  systemName: string;
  systemDescription?: string;
  riskLevel?: string;
  complianceStatus?: string;
  lifecycleStage?: string;
  regulation?: string;
};

const statusStyles: Record<GovernanceTask["status"], { bg: string; text: string; label: string }> = {
  Pending: { bg: "bg-[#FFF3CF]", text: "text-[#A97B00]", label: "Pending" },
  Blocked: { bg: "bg-[#FFE0E0]", text: "text-[#C71F1F]", label: "Blocked" },
  Completed: { bg: "bg-[#E8FAEF]", text: "text-[#178746]", label: "Completed" },
};

const regulationOrder: Record<string, number> = { EU: 0, UK: 1, MAS: 2 };

export default function TasksTab({
  tasks,
  loading,
  onRefresh,
  systemId,
  systemName,
  systemDescription = "",
  riskLevel = "unknown",
  complianceStatus = "unknown",
  lifecycleStage = "Draft",
  regulation = "EU",
}: Props) {
  const { toast } = useToast();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [evidenceInputs, setEvidenceInputs] = useState<Record<string, string>>({});

  const groupedTasks = useMemo(() => {
    const grouped: Record<string, GovernanceTask[]> = {};
    tasks.forEach((task) => {
      grouped[task.regulation] = grouped[task.regulation] || [];
      grouped[task.regulation].push(task);
    });

    return Object.entries(grouped).sort(([regA], [regB]) => (regulationOrder[regA] ?? 99) - (regulationOrder[regB] ?? 99));
  }, [tasks]);

  const handleComplete = async (task: GovernanceTask) => {
    setCompletingId(task.id);
    try {
      const res = await backendFetch(`/api/governance-tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "Completed",
          evidence_link: evidenceInputs[task.id] || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to complete task");
      }

      toast({ title: "Task completed", description: task.title });
      await onRefresh();
    } catch (error: any) {
      toast({ title: "Unable to complete task", description: error.message || "An error occurred", variant: "destructive" });
    } finally {
      setCompletingId(null);
    }
  };

  const handleCreateTaskFromSuggestion = (suggestion: SmartSuggestion) => {
    toast({ title: "Smart suggestion noted", description: `"${suggestion.title}" - Consider implementing this governance task` });
  };

  const existingTaskTitles = tasks.map((task) => task.title);
  const completedTaskTitles = tasks.filter((task) => task.status === "Completed").map((task) => task.title);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#1E293B]">Governance To-Do</h2>
          <p className="mt-1 text-[13px] text-[#667085]">Tasks grouped by regulation with blockers highlighted.</p>
        </div>
        <button
          type="button"
          onClick={() => onRefresh()}
          disabled={loading}
          className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {regulation && ["EU", "UK", "MAS"].includes(regulation) && (
        <SmartGovernanceSuggestions
          systemId={systemId}
          systemName={systemName}
          systemDescription={systemDescription}
          riskLevel={riskLevel}
          complianceStatus={complianceStatus}
          lifecycleStage={lifecycleStage}
          regulation={regulation as "EU" | "UK" | "MAS"}
          existingTasks={existingTaskTitles}
          completedTasks={completedTaskTitles}
          onTaskCreate={handleCreateTaskFromSuggestion}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white py-12 text-center shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF4FF]">
            <Shield className="h-8 w-8 text-[#3B82F6]" />
          </div>
          <p className="text-[15px] font-semibold text-[#1E293B]">No governance tasks found for this system.</p>
          <p className="mt-1 text-[13px] text-[#667085]">All governance requirements are satisfied.</p>
        </div>
      ) : (
        groupedTasks.map(([reg, items]) => (
          <section key={reg} className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
              <h3 className="text-[16px] font-bold text-[#1E293B]">{reg === "EU" ? "EU AI Act" : reg === "UK" ? "UK AI Act" : "MAS"}</h3>
              <span className="rounded-full bg-[#EAF4FF] px-3 py-1 text-[12px] font-semibold text-[#3B82F6]">
                {items.length} task{items.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {items.map((task) => (
                <article key={task.id} className="px-6 py-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] ${task.blocking ? "bg-[#FFE0E0]" : "bg-[#EAF4FF]"}`}>
                          {task.blocking ? <ShieldAlert className="h-4 w-4 text-[#C71F1F]" /> : <Shield className="h-4 w-4 text-[#3B82F6]" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-[14px] font-semibold text-[#1E293B]">{task.title}</p>
                          <p className="mt-1 text-[13px] text-[#667085]">{task.description}</p>
                        </div>
                      </div>
                      <div className="ml-11 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[task.status].bg} ${statusStyles[task.status].text}`}>
                          {statusStyles[task.status].label}
                        </span>
                        {task.blocking && <span className="inline-flex rounded-full bg-[#FFE0E0] px-2.5 py-1 text-[11px] font-semibold text-[#C71F1F]">Blocking</span>}
                        {task.related_entity_type === "risk_assessment" && (
                          <span className="inline-flex rounded-full bg-[#EAF4FF] px-2.5 py-1 text-[11px] font-semibold text-[#2573C2]">Risk Assessment</span>
                        )}
                        {task.related_entity_type === "documentation" && (
                          <span className="inline-flex rounded-full bg-[#F3E8FF] px-2.5 py-1 text-[11px] font-semibold text-[#7C3AED]">Documentation</span>
                        )}
                      </div>
                      {task.status === "Completed" && task.evidence_link && (
                        <div className="ml-11 rounded-[8px] bg-[#E8FAEF] px-3 py-2">
                          <p className="text-[12px] text-[#178746]">
                            <span className="font-semibold">Evidence:</span>{" "}
                            <a href={task.evidence_link} target="_blank" rel="noreferrer" className="underline hover:no-underline">
                              {task.evidence_link}
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-[180px] flex-col gap-2">
                      {task.status !== "Completed" ? (
                        <>
                          <input
                            type="text"
                            placeholder="Evidence link (optional)"
                            value={evidenceInputs[task.id] || ""}
                            onChange={(e) => setEvidenceInputs((prev) => ({ ...prev, [task.id]: e.target.value }))}
                            className="h-9 w-full rounded-[8px] border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleComplete(task)}
                            disabled={completingId === task.id}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-[8px] bg-[#178746] text-[13px] font-semibold text-white shadow-sm hover:bg-[#146B38] transition-all disabled:opacity-50"
                          >
                            {completingId === task.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            Mark Completed
                          </button>
                        </>
                      ) : (
                        <div className="flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#86EFAC] bg-[#E8FAEF] text-[13px] font-semibold text-[#178746]">
                          <CheckCircle className="h-4 w-4" />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
