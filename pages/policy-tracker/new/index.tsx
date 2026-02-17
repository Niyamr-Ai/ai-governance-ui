"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import type {
  Policy,
  CreateInternalPolicyInput,
} from "@/types/policy";

import { supabase } from "@/utils/supabase/client";

export default function CreateInternalPolicyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create policy");
      }

      const policy = await res.json();
      router.push(`/policy-tracker/${policy.id}`);
    } catch (err: any) {
      console.error("Error creating policy:", err);
      setError(err.message || "Failed to create policy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
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
        </div>

        <Card className="glass-panel shadow-elevated border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Create Internal Policy</CardTitle>
            <p className="text-muted-foreground mt-2">
              Create a new organizational AI policy for your team.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                  <p className="text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Policy Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., AI Ethics Policy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the purpose and scope of this policy..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applies_to" className="text-foreground">
                    Applies To
                  </Label>
                  <Select
                    value={formData.applies_to}
                    onValueChange={(value: "All AI" | "High-risk only" | "Specific systems") =>
                      setFormData({ ...formData, applies_to: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All AI">All AI</SelectItem>
                      <SelectItem value="High-risk only">High-risk only</SelectItem>
                      <SelectItem value="Specific systems">Specific systems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enforcement_level" className="text-foreground">
                    Enforcement Level
                  </Label>
                  <Select
                    value={formData.enforcement_level}
                    onValueChange={(value: "Mandatory" | "Advisory") =>
                      setFormData({ ...formData, enforcement_level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mandatory">Mandatory</SelectItem>
                      <SelectItem value="Advisory">Advisory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner" className="text-foreground">
                    Policy Owner
                  </Label>
                  <Input
                    id="owner"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="e.g., AI Governance Team"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version" className="text-foreground">
                    Version
                  </Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="effective_date" className="text-foreground">
                  Effective Date
                </Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_url" className="text-foreground">
                  Document URL (Optional)
                </Label>
                <Input
                  id="document_url"
                  type="url"
                  value={formData.document_url}
                  onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                  placeholder="https://example.com/policy-document.pdf"
                />
                <p className="text-xs text-muted-foreground">
                  Link to the full policy document (PDF/DOC)
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/policy-tracker")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !formData.name}
                  variant="hero"
                  className="rounded-xl"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Policy
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}

