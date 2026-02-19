"use client";

/**
 * Policies Tab Component
 * 
 * Displays and manages policy mappings for an AI system
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldCheck, Plus, ExternalLink, Globe, Building2, X } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { Policy, SystemPolicyMapping, ComplianceStatus } from "@/types/policy";

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

interface PoliciesTabProps {
  systemId: string;
}

export default function PoliciesTab({ systemId }: PoliciesTabProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mappings, setMappings] = useState<(SystemPolicyMapping & { policies: Policy })[]>([]);
  const [allPolicies, setAllPolicies] = useState<Policy[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingMapping, setUpdatingMapping] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<ComplianceStatus>("Not assessed");
  const [updateNotes, setUpdateNotes] = useState("");

  useEffect(() => {
    fetchMappings();
    fetchAllPolicies();
  }, [systemId]);

  const fetchMappings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await backendFetch(`/api/ai-systems/${systemId}/policies`);
      if (res.ok) {
        const data = await res.json();
        setMappings(data || []);
        // Clear error if fetch succeeds
        setError(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "Failed to fetch policy mappings");
      }
    } catch (err) {
      console.error("Error fetching mappings:", err);
      setError("Failed to load policy mappings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPolicies = async () => {
    try {
      const res = await backendFetch("/api/policies");
      if (res.ok) {
        const data = await res.json();
        setAllPolicies(data || []);
      }
    } catch (err) {
      console.error("Error fetching policies:", err);
    }
  };

  const handleAddMapping = async () => {
    if (!selectedPolicyId) {
      setError("Please select a policy");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(`/api/ai-systems/${systemId}/policies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policy_id: selectedPolicyId,
          compliance_status: "Not assessed",
        }),
      });

      if (res.ok) {
        await fetchMappings();
        setShowAddDialog(false);
        setSelectedPolicyId("");
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to add policy mapping");
      }
    } catch (err: any) {
      console.error("Error adding mapping:", err);
      setError(err.message || "Failed to add policy mapping");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMapping = async (mappingId: string) => {
    try {
      setUpdatingMapping(mappingId);
      const res = await fetch(`/api/ai-systems/${systemId}/policies/${mappingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compliance_status: updateStatus,
          notes: updateNotes,
        }),
      });

      if (res.ok) {
        await fetchMappings();
        setUpdatingMapping(null);
        setUpdateStatus("Not assessed");
        setUpdateNotes("");
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to update mapping");
      }
    } catch (err: any) {
      console.error("Error updating mapping:", err);
      setError(err.message || "Failed to update mapping");
    } finally {
      setUpdatingMapping(null);
    }
  };

  const handleRemoveMapping = async (mappingId: string) => {
    if (!confirm("Are you sure you want to remove this policy mapping?")) {
      return;
    }

    try {
      const res = await fetch(`/api/ai-systems/${systemId}/policies/${mappingId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchMappings();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Failed to remove mapping");
      }
    } catch (err: any) {
      console.error("Error removing mapping:", err);
      setError(err.message || "Failed to remove mapping");
    }
  };

  const getComplianceStatusBadge = (status: ComplianceStatus) => {
    const statusConfig = {
      "Compliant": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "Partially compliant": "bg-amber-50 text-amber-700 border-amber-200",
      "Non-compliant": "bg-red-50 text-red-700 border-red-200",
      "Not assessed": "bg-secondary text-muted-foreground border-border",
    };

    return (
      <Badge className={`${statusConfig[status]} rounded-xl`}>
        {status}
      </Badge>
    );
  };

  // Get policies not yet mapped
  const mappedPolicyIds = mappings.map(m => m.policy_id);
  const availablePolicies = allPolicies.filter(p => !mappedPolicyIds.includes(p.id));

  // Get background color for policy based on name or jurisdiction
  const getPolicyBgColor = (policy: Policy) => {
    const name = policy.name.toLowerCase();
    const jurisdiction = policy.jurisdiction?.toLowerCase() || "";

    // EU AI Act
    if (name.includes("eu ai act") || name.includes("european") || jurisdiction === "eu" || jurisdiction === "europe") {
      return "!bg-blue-50 hover:!bg-blue-100 focus:!bg-blue-100 data-[highlighted]:!bg-blue-100 border border-blue-200";
    }
    // UK AI Act
    if (name.includes("uk ai") || name.includes("uk regulatory") || jurisdiction === "uk" || jurisdiction === "united kingdom") {
      return "!bg-purple-50 hover:!bg-purple-100 focus:!bg-purple-100 data-[highlighted]:!bg-purple-100 border border-purple-200";
    }
    // MAS / Singapore
    if (name.includes("mas") || name.includes("singapore") || jurisdiction === "singapore" || jurisdiction === "mas") {
      return "!bg-emerald-50 hover:!bg-emerald-100 focus:!bg-emerald-100 data-[highlighted]:!bg-emerald-100 border border-emerald-200";
    }
    // Default
    return "!bg-secondary/50 hover:!bg-secondary focus:!bg-secondary data-[highlighted]:!bg-secondary border border-border";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Policies</h2>
          <p className="text-muted-foreground mt-1">
            {mappings.length} polic{mappings.length !== 1 ? "ies" : "y"} mapped to this system
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button
              variant="hero"
              className="rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Map Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel shadow-elevated rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">Map Policy to System</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Select a policy to map to this AI system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-foreground">Policy</Label>
                <Select value={selectedPolicyId} onValueChange={setSelectedPolicyId}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a policy" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {availablePolicies.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No policies available
                      </div>
                    ) : (
                      availablePolicies.map((policy) => (
                        <SelectItem
                          key={policy.id}
                          value={policy.id}
                          className={`${getPolicyBgColor(policy)} rounded-lg my-1 mx-1 transition-colors px-3 py-2`}
                        >
                          <div className="flex items-center gap-2 w-full">
                            {policy.policy_type === "External" ? (
                              <Globe className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <Building2 className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="flex-1 text-foreground">{policy.name}</span>
                            {policy.jurisdiction && (
                              <Badge className="ml-2 bg-primary/10 text-primary border-primary/30 text-xs rounded-xl flex-shrink-0">
                                {policy.jurisdiction}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setSelectedPolicyId("");
                    setError(null);
                  }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMapping}
                  disabled={submitting || !selectedPolicyId}
                  variant="hero"
                  className="rounded-xl"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Policy"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Alert */}
      {error && !showAddDialog && (
        <Card className="glass-panel border-red-200 rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <X className="h-4 w-4" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policies List */}
      {loading ? (
        <Card className="glass-panel shadow-elevated rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      ) : mappings.length === 0 ? (
        <Card className="glass-panel shadow-elevated rounded-xl">
          <CardContent className="pt-6">
            <div className="text-center py-12 space-y-4">
              <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <p className="text-foreground font-semibold text-lg">No policies mapped to this system yet.</p>
              <p className="text-muted-foreground text-sm">Map policies to track compliance status for this AI system.</p>
              <Button
                onClick={() => setShowAddDialog(true)}
                variant="hero"
                className="rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Map Your First Policy
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {mappings.map((mapping) => {
            const policy = mapping.policies;
            return (
              <Card
                key={mapping.id}
                className="glass-panel shadow-elevated rounded-xl hover:shadow-blue transition-all"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        {policy.policy_type === "External" ? (
                          <Globe className="h-5 w-5 text-primary" />
                        ) : (
                          <Building2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-foreground flex items-center gap-2">
                          {policy.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/policy-tracker/${policy.id}`)}
                            className="h-6 px-2 text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 rounded-xl">
                            {policy.policy_type}
                          </Badge>
                          {policy.jurisdiction && (
                            <Badge className="bg-primary/10 text-primary border-primary/30 rounded-xl">
                              {policy.jurisdiction}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMapping(mapping.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-sm mb-2 block font-semibold">Compliance Status</Label>
                    <div className="flex items-center gap-4">
                      {getComplianceStatusBadge(mapping.compliance_status)}
                      <Select
                        value={mapping.compliance_status}
                        onValueChange={(value: ComplianceStatus) => {
                          setUpdateStatus(value);
                          handleUpdateMapping(mapping.id);
                        }}
                        disabled={updatingMapping === mapping.id}
                      >
                        <SelectTrigger className="w-[200px] rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not assessed">
                            Not assessed
                          </SelectItem>
                          <SelectItem value="Compliant">
                            Compliant
                          </SelectItem>
                          <SelectItem value="Partially compliant">
                            Partially compliant
                          </SelectItem>
                          <SelectItem value="Non-compliant">
                            Non-compliant
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingMapping === mapping.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                    </div>
                  </div>
                  {mapping.notes && (
                    <div>
                      <Label className="text-muted-foreground text-sm mb-2 block font-semibold">Notes</Label>
                      <p className="text-foreground text-sm bg-secondary/50 p-3 rounded-xl">{mapping.notes}</p>
                    </div>
                  )}
                  {mapping.assessed_at && (
                    <div>
                      <Label className="text-muted-foreground text-sm mb-2 block font-semibold">Last Assessed</Label>
                      <p className="text-foreground text-sm">
                        {new Date(mapping.assessed_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

