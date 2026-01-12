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
import Sidebar from "@/components/sidebar";
import type {
  Policy,
  CreateInternalPolicyInput,
} from "@/types/policy";

import { supabase } from "@/utils/supabase/client";

export default function CreateInternalPolicyPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const loggedIn = !!user;
      setIsLoggedIn(loggedIn);
      setIsLoading(false);

      if (!loggedIn) {
        router.push("/sign-in");
      }
    };

    checkAuth();
  }, [router]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
      <Sidebar onLogout={handleLogout} />

      <div className={`p-6 lg:p-8 ${isLoggedIn ? 'lg:pl-72' : ''}`}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push("/policy-tracker")}
              className="text-slate-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Policy Tracker
            </Button>
          </div>

          <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Create Internal Policy</CardTitle>
              <p className="text-slate-400 mt-2">
                Create a new organizational AI policy for your team.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                    <p className="text-red-300">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Policy Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-800/50 border-slate-700/50 text-white"
                    placeholder="e.g., AI Ethics Policy"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-800/50 border-slate-700/50 text-white"
                    placeholder="Describe the purpose and scope of this policy..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="applies_to" className="text-white">
                      Applies To
                    </Label>
                    <Select
                      value={formData.applies_to}
                      onValueChange={(value: "All AI" | "High-risk only" | "Specific systems") =>
                        setFormData({ ...formData, applies_to: value })
                      }
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="All AI" className="text-slate-300 hover:bg-slate-700">
                          All AI
                        </SelectItem>
                        <SelectItem value="High-risk only" className="text-slate-300 hover:bg-slate-700">
                          High-risk only
                        </SelectItem>
                        <SelectItem value="Specific systems" className="text-slate-300 hover:bg-slate-700">
                          Specific systems
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enforcement_level" className="text-white">
                      Enforcement Level
                    </Label>
                    <Select
                      value={formData.enforcement_level}
                      onValueChange={(value: "Mandatory" | "Advisory") =>
                        setFormData({ ...formData, enforcement_level: value })
                      }
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Mandatory" className="text-slate-300 hover:bg-slate-700">
                          Mandatory
                        </SelectItem>
                        <SelectItem value="Advisory" className="text-slate-300 hover:bg-slate-700">
                          Advisory
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner" className="text-white">
                      Policy Owner
                    </Label>
                    <Input
                      id="owner"
                      value={formData.owner}
                      onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                      className="bg-slate-800/50 border-slate-700/50 text-white"
                      placeholder="e.g., AI Governance Team"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version" className="text-white">
                      Version
                    </Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      className="bg-slate-800/50 border-slate-700/50 text-white"
                      placeholder="1.0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effective_date" className="text-white">
                    Effective Date
                  </Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={formData.effective_date}
                    onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                    className="bg-slate-800/50 border-slate-700/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_url" className="text-white">
                    Document URL (Optional)
                  </Label>
                  <Input
                    id="document_url"
                    type="url"
                    value={formData.document_url}
                    onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                    className="bg-slate-800/50 border-slate-700/50 text-white"
                    placeholder="https://example.com/policy-document.pdf"
                  />
                  <p className="text-xs text-slate-400">
                    Link to the full policy document (PDF/DOC)
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/policy-tracker")}
                    className="border-slate-700/50 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !formData.name}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
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
      </div>
    </div>
  );
}

