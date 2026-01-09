"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Loader2, ShieldAlert, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";
import { SmartGovernanceSuggestions } from "@/components/ui/smart-governance-suggestions";
import type { GovernanceTask } from "@/types/governance-task";
import type { SmartSuggestion } from "@/types/smart-governance-suggestions";

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

type Props = {
  tasks: GovernanceTask[];
  loading: boolean;
  onRefresh: () => Promise<void> | void;
  // System context for smart suggestions
  systemId: string;
  systemName: string;
  systemDescription?: string;
  riskLevel?: string;
  complianceStatus?: string;
  lifecycleStage?: string;
  regulation?: string;
};

const statusStyles: Record<
  GovernanceTask["status"],
  { badge: string; label: string }
> = {
  Pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Pending",
  },
  Blocked: {
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Blocked",
  },
  Completed: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Completed",
  },
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
  regulation = "EU"
}: Props) {
  const { toast } = useToast();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [evidenceInputs, setEvidenceInputs] = useState<Record<string, string>>(
    {}
  );

  const groupedTasks = useMemo(() => {
    const grouped: Record<string, GovernanceTask[]> = {};
    tasks.forEach((task) => {
      grouped[task.regulation] = grouped[task.regulation] || [];
      grouped[task.regulation].push(task);
    });

    return Object.entries(grouped).sort(
      ([regA], [regB]) =>
        (regulationOrder[regA] ?? 99) - (regulationOrder[regB] ?? 99)
    );
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

      toast({
        title: "Task completed",
        description: task.title,
      });
      await onRefresh();
    } catch (error: any) {
      toast({
        title: "Unable to complete task",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setCompletingId(null);
    }
  };

  const handleCreateTaskFromSuggestion = (suggestion: SmartSuggestion) => {
    toast({
      title: "Smart suggestion noted",
      description: `"${suggestion.title}" - Consider implementing this governance task`,
    });
    // In a real implementation, this could create a new governance task
    // or add it to a backlog for manual review
  };

  // Prepare data for smart suggestions
  const existingTaskTitles = tasks.map(task => task.title);
  const completedTaskTitles = tasks.filter(task => task.status === 'Completed').map(task => task.title);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Governance To-Do</h2>
          <p className="text-muted-foreground mt-1">
            Tasks grouped by regulation with blockers highlighted.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => onRefresh()}
          className="rounded-xl"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Refresh
        </Button>
      </div>

      {/* Smart Governance Suggestions */}
      {regulation && ['EU', 'UK', 'MAS'].includes(regulation) && (
        <SmartGovernanceSuggestions
          systemId={systemId}
          systemName={systemName}
          systemDescription={systemDescription}
          riskLevel={riskLevel}
          complianceStatus={complianceStatus}
          lifecycleStage={lifecycleStage}
          regulation={regulation as 'EU' | 'UK' | 'MAS'}
          existingTasks={existingTaskTitles}
          completedTasks={completedTaskTitles}
          onTaskCreate={handleCreateTaskFromSuggestion}
        />
      )}

      {loading ? (
        <Card className="glass-panel shadow-elevated rounded-xl">
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card className="glass-panel shadow-elevated rounded-xl">
          <CardContent className="py-12 text-center">
            <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <p className="text-foreground font-semibold text-lg">No governance tasks found for this system.</p>
            <p className="text-muted-foreground text-sm mt-2">All governance requirements are satisfied.</p>
          </CardContent>
        </Card>
      ) : (
        groupedTasks.map(([regulation, items]) => (
          <Card
            key={regulation}
            className="glass-panel shadow-elevated rounded-xl hover:shadow-blue transition-all"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-foreground">
                <span className="text-lg font-bold">
                  {regulation === "EU"
                    ? "EU AI Act"
                    : regulation === "UK"
                    ? "UK AI Act"
                    : "MAS"}
                </span>
                <Badge className="bg-primary/10 text-primary border-primary/30 rounded-xl">
                  {items.length} task{items.length > 1 ? "s" : ""}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((task, idx) => (
                <div key={task.id}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${task.blocking ? 'bg-red-50' : 'bg-primary/10'}`}>
                          {task.blocking ? (
                            <ShieldAlert className={`h-4 w-4 ${task.blocking ? 'text-red-600' : 'text-primary'}`} />
                          ) : (
                            <Shield className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-foreground font-semibold">{task.title}</p>
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap ml-7">
                        <Badge className={`${statusStyles[task.status].badge} rounded-xl`}>
                          {statusStyles[task.status].label}
                        </Badge>
                        {task.blocking && (
                          <Badge className="bg-red-50 text-red-700 border-red-200 rounded-xl">
                            Blocking
                          </Badge>
                        )}
                        {task.related_entity_type === "risk_assessment" && (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 rounded-xl">
                            Risk Assessment
                          </Badge>
                        )}
                        {task.related_entity_type === "documentation" && (
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200 rounded-xl">
                            Documentation
                          </Badge>
                        )}
                      </div>
                      {task.status === "Completed" && task.evidence_link && (
                        <p className="text-xs text-emerald-700 ml-7 bg-emerald-50 p-2 rounded-lg">
                          <span className="font-semibold">Evidence:</span>{" "}
                          <a
                            className="underline hover:text-emerald-800"
                            href={task.evidence_link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {task.evidence_link}
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 min-w-[240px]">
                      {task.status !== "Completed" && (
                        <>
                          <Input
                            placeholder="Evidence link (optional)"
                            value={evidenceInputs[task.id] || ""}
                            onChange={(e) =>
                              setEvidenceInputs((prev) => ({
                                ...prev,
                                [task.id]: e.target.value,
                              }))
                            }
                            className="rounded-xl"
                          />
                          <Button
                            onClick={() => handleComplete(task)}
                            disabled={completingId === task.id}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                          >
                            {completingId === task.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Mark Completed
                          </Button>
                        </>
                      )}
                      {task.status === "Completed" && (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 justify-center rounded-xl py-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  {idx !== items.length - 1 && (
                    <Separator className="my-4 bg-border" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

