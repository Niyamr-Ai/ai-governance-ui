"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ShieldCheck, FileText, Globe, Building2, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import Sidebar from "@/components/sidebar";
import type { Policy, ComplianceStatus } from "../../types/policy";

export default function PolicyTrackerPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [externalPolicies, setExternalPolicies] = useState<Policy[]>([]);
  const [internalPolicies, setInternalPolicies] = useState<Policy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  useEffect(() => {
    const init = async () => {
      const sessionRes = await supabase.auth.getSession();
      const session = sessionRes.data.session;
  
      if (!session) {
        router.push("/sign-in");
        return;
      }
  
      setIsLoggedIn(true);
      setIsLoading(false);
  
      await fetchPolicies(session.access_token);
    };
  
    init();
  }, [router]);
  

  const fetchPolicies = async (token: string) => {
    try {
      setLoadingPolicies(true);
  
      const res = await fetch("http://localhost:3001/api/policies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
  
      const data = await res.json();
      setExternalPolicies(data.filter((p: Policy) => p.policy_type === "External"));
      setInternalPolicies(data.filter((p: Policy) => p.policy_type === "Internal"));
    } catch (err) {
      console.error("Error fetching policies:", err);
    } finally {
      setLoadingPolicies(false);
    }
  };
  

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={handleLogout} />
      
      <div className={`p-6 lg:p-8 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground">
                  Policy <span className="gradient-text">Tracker</span>
                </h1>
                <p className="text-muted-foreground mt-3 text-lg font-medium">
                  Track external AI regulations and manage internal organizational policies
                </p>
              </div>
            </div>
          </div>

          {/* External Policies Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">External Policies</h2>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Preloaded regulatory frameworks. These policies are read-only and represent official AI regulations.
            </p>

            {loadingPolicies ? (
              <Card className="glass-panel shadow-elevated border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                </CardContent>
              </Card>
            ) : externalPolicies.length === 0 ? (
              <Card className="glass-panel shadow-elevated border-border/50">
                <CardContent className="pt-6">
                  <p className="text-foreground text-center py-8">No external policies found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {externalPolicies.map((policy) => (
                  <Card
                    key={policy.id}
                    className="glass-panel shadow-elevated border-border/50 hover:shadow-blue hover:border-primary/30 transition-all cursor-pointer hover:-translate-y-1"
                    onClick={() => router.push(`/policy-tracker/${policy.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-foreground flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            {policy.name}
                          </CardTitle>
                          {policy.jurisdiction && (
                            <Badge className="mt-2 bg-purple-50 text-purple-700 border-purple-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">
                              {policy.jurisdiction}
                            </Badge>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Policy Type</p>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">
                          {policy.policy_type}
                        </Badge>
                      </div>
                      {policy.summary && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Summary</p>
                          <p className="text-sm text-foreground line-clamp-2">
                            {policy.summary}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Version</p>
                        <p className="text-sm text-foreground">{policy.version}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-4 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 hover:shadow-md transition-all font-medium rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/policy-tracker/${policy.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Internal Policies Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Internal Policies</h2>
              </div>
              <Button
                onClick={() => router.push("/policy-tracker/new")}
                variant="hero"
                className="rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Internal Policy
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              Organizational AI policies created and managed by your team.
            </p>

            {loadingPolicies ? (
              <Card className="glass-panel shadow-elevated border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                </CardContent>
              </Card>
            ) : internalPolicies.length === 0 ? (
              <Card className="glass-panel shadow-elevated border-border/50">
                <CardContent className="pt-6">
                  <div className="text-center py-8 space-y-4">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-foreground">No internal policies created yet.</p>
                    <Button
                      onClick={() => router.push("/policy-tracker/new")}
                      variant="hero"
                      className="rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Policy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {internalPolicies.map((policy) => (
                  <Card
                    key={policy.id}
                    className="glass-panel shadow-elevated border-border/50 hover:shadow-blue hover:border-primary/30 transition-all cursor-pointer hover:-translate-y-1"
                    onClick={() => router.push(`/policy-tracker/${policy.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-foreground flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {policy.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Version</p>
                          <p className="text-sm text-foreground">{policy.version}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <Badge
                            className={
                              policy.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all"
                                : policy.status === "Draft"
                                ? "bg-amber-50 text-amber-700 border-amber-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all"
                                : "bg-secondary/80 text-muted-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all"
                            }
                          >
                            {policy.status || "Active"}
                          </Badge>
                        </div>
                      </div>
                      {policy.owner && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Owner</p>
                          <p className="text-sm text-foreground">{policy.owner}</p>
                        </div>
                      )}
                      {policy.enforcement_level && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Enforcement Level</p>
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
                      <Button
                        variant="outline"
                        className="w-full mt-4 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 hover:shadow-md transition-all font-medium rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/policy-tracker/${policy.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}