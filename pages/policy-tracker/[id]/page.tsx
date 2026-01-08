"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ShieldCheck, FileText, Edit, Globe, Building2 } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { signOutAction } from "@/app/actions";
import type { Policy, PolicyRequirement, ComplianceStatus } from "@/ai-governance-backend/types/policy";

export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const policyId = params?.id as string;

  const [policy, setPolicy] = useState<Policy & { requirements?: PolicyRequirement[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { createClient } = await import("@/ai-governance-backend/utils/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const loggedIn = !!user;
      setIsLoggedIn(loggedIn);

      if (!loggedIn) {
        router.push("/sign-in");
        return;
      }

      await fetchPolicy();
    };

    checkAuth();
  }, [policyId, router]);

  const fetchPolicy = async () => {
    if (!policyId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/policies/${policyId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPolicy(data);
      } else {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to fetch policy:", errorData);
        // Set policy to null to show "Policy not found" message
        setPolicy(null);
      }
    } catch (err) {
      console.error("Error fetching policy:", err);
      setPolicy(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutAction();
    router.push("/");
  };

  const getComplianceStatusBadge = (status: ComplianceStatus) => {
    const statusConfig = {
      "Compliant": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Partially compliant": "bg-amber-50 text-amber-700 border-amber-200",
      "Non-compliant": "bg-red-50 text-red-700 border-red-200",
      "Not assessed": "bg-secondary/80 text-muted-foreground border-border/50",
    };

    return (
      <Badge className={`${statusConfig[status]} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all`}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground">Loading policy...</p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar onLogout={handleLogout} />
        <div className={`p-6 lg:p-8 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
          <div className="max-w-7xl mx-auto space-y-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/policy-tracker")}
              className="text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Policy Tracker
            </Button>
            <Card className="glass-panel shadow-elevated border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">Policy Not Found</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-600">The policy you're looking for doesn't exist or couldn't be loaded.</p>
                <p className="text-foreground text-sm">
                  This could happen if:
                </p>
                <ul className="text-foreground text-sm list-disc list-inside space-y-1 ml-4">
                  <li>The database migration hasn't been run yet (run <code className="bg-secondary/50 px-1 rounded">supabase/migrations/create_policy_tracker.sql</code>)</li>
                  <li>The policy ID is invalid</li>
                  <li>You don't have permission to view this policy</li>
                </ul>
                <Button
                  onClick={() => router.push("/policy-tracker")}
                  variant="hero"
                  className="mt-4 rounded-xl"
                >
                  Go to Policy Tracker
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const isExternal = policy.policy_type === "External";
  const isInternal = policy.policy_type === "Internal";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={handleLogout} />

      <div className={`p-6 lg:p-8 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/policy-tracker")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Policy Tracker
            </Button>
            {isInternal && (
              <Button
                onClick={() => router.push(`/policy-tracker/${policyId}/edit`)}
                variant="hero"
                className="rounded-xl"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Policy
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {/* Policy Overview */}
            <Card className="glass-panel shadow-elevated border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {isExternal ? (
                      <Globe className="h-6 w-6 text-primary" />
                    ) : (
                      <Building2 className="h-6 w-6 text-primary" />
                    )}
                    <div>
                      <CardTitle className="text-2xl text-foreground">{policy.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">
                          {policy.policy_type}
                        </Badge>
                        {policy.jurisdiction && (
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">
                            {policy.jurisdiction}
                          </Badge>
                        )}
                        {isInternal && policy.status && (
                          <Badge
                            className={
                              policy.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all"
                                : policy.status === "Draft"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all"
                                  : "bg-secondary/80 text-muted-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all"
                            }
                          >
                            {policy.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {policy.summary && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Summary</p>
                    <p className="text-foreground">{policy.summary}</p>
                  </div>
                )}
                {policy.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-foreground">{policy.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Version</p>
                    <p className="text-foreground">{policy.version}</p>
                  </div>
                  {isInternal && policy.owner && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Owner</p>
                      <p className="text-foreground">{policy.owner}</p>
                    </div>
                  )}
                  {isInternal && policy.enforcement_level && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Enforcement Level</p>
                      <Badge
                        className={
                          policy.enforcement_level === "Mandatory"
                            ? "bg-red-50 text-red-700 border-red-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all"
                            : "bg-blue-50 text-blue-700 border-blue-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all"
                        }
                      >
                        {policy.enforcement_level}
                      </Badge>
                    </div>
                  )}
                  {isInternal && policy.applies_to && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Applies To</p>
                      <p className="text-foreground">{policy.applies_to}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Policy Requirements */}
            <Card className="glass-panel shadow-elevated border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Policy Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!policy.requirements || policy.requirements.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground">
                      {isExternal
                        ? "No requirements defined for this external policy yet."
                        : "No requirements added to this policy yet."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {policy.requirements.map((requirement) => (
                      <Card
                        key={requirement.id}
                        className="glass-panel border-border/50 shadow-sm hover:shadow-md transition-all"
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {requirement.requirement_code && (
                                    <span className="text-primary mr-2">
                                      {requirement.requirement_code}
                                    </span>
                                  )}
                                  {requirement.title}
                                </h3>
                                {requirement.description && (
                                  <p className="text-muted-foreground mt-2">
                                    {requirement.description}
                                  </p>
                                )}
                              </div>
                              {getComplianceStatusBadge(requirement.compliance_status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Applies to: </span>
                                <span className="text-foreground">{requirement.applies_to_scope}</span>
                              </div>
                            </div>
                            {requirement.notes && (
                              <div className="mt-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
                                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                                <p className="text-sm text-foreground">{requirement.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

