"use client";

import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabase/client";
import Sidebar from "@/components/sidebar";
import {
  AlertTriangle,
  ArrowUpRight,
  Ban,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Link as LinkIcon,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  UserCircle2,
  XCircle,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SmartShadowAIAssessment } from "@/components/ui/smart-shadow-ai-assessment";
import type { DiscoveredAIAsset } from "@/types/discovery";

type SourceType = "api_scan" | "repo_scan" | "vendor_detection" | "manual_hint";
type ConfidenceLevel = "low" | "medium" | "high";
type ShadowStatus = "potential" | "confirmed" | "resolved";

interface DiscoveredAsset {
  id: string;
  detected_name: string;
  detected_vendor?: string;
  source_type: SourceType;
  confidence_score: ConfidenceLevel;
  environment?: string;
  shadow_status: ShadowStatus;
  linked_system_id?: string;
  discovered_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

interface DiscoveryStats {
  total: number;
  potential_shadow: number;
  confirmed_shadow: number;
  linked: number;
}

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

function sourceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    api_scan: "API Scan",
    repo_scan: "Repo Scan",
    vendor_detection: "Vendor Detection",
    manual_hint: "Manual",
  };
  return labels[type] || type;
}

function sourceTypeClasses(type: string): string {
  const classes: Record<string, string> = {
    api_scan: "bg-[#EAF4FF] text-[#2573C2]",
    repo_scan: "bg-[#F3E8FF] text-[#7C3AED]",
    vendor_detection: "bg-[#FFF5D9] text-[#A97B00]",
    manual_hint: "bg-[#F0FDF4] text-[#15803D]",
  };
  return classes[type] || classes.manual_hint;
}

function confidenceClasses(confidence: string): string {
  const classes: Record<string, string> = {
    high: "bg-[#E8FAEF] text-[#178746]",
    medium: "bg-[#FFF5D9] text-[#A97B00]",
    low: "bg-[#FFE6EA] text-[#C71F1F]",
  };
  return classes[confidence] || classes.medium;
}

function shadowStatusClasses(status: string): string {
  const classes: Record<string, string> = {
    potential: "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]",
    confirmed: "border-[#F1A4A4] bg-[#FFE0E0] text-[#C71F1F]",
    resolved: "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]",
  };
  return classes[status] || classes.potential;
}

function shadowStatusIcon(status: string) {
  if (status === "confirmed") return <AlertTriangle className="h-[11px] w-[11px]" />;
  if (status === "resolved") return <CheckCircle2 className="h-[11px] w-[11px]" />;
  return <XCircle className="h-[11px] w-[11px]" />;
}

function shadowStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    potential: "Potential",
    confirmed: "Confirmed Shadow",
    resolved: "Resolved",
  };
  return labels[status] || status;
}

export default function DiscoveryPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<DiscoveredAsset[]>([]);
  const [stats, setStats] = useState<DiscoveryStats>({
    total: 0,
    potential_shadow: 0,
    confirmed_shadow: 0,
    linked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<"all" | SourceType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ShadowStatus>("all");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showMarkShadowDialog, setShowMarkShadowDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showCreateSystemDialog, setShowCreateSystemDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<DiscoveredAsset | null>(null);
  const [viewAsset, setViewAsset] = useState<DiscoveredAsset | null>(null);

  const [linkSystemId, setLinkSystemId] = useState("");
  const [shadowNotes, setShadowNotes] = useState("");
  const [resolveNotes, setResolveNotes] = useState("");
  const [newSystemName, setNewSystemName] = useState("");
  const [newSystemDescription, setNewSystemDescription] = useState("");
  const [newSystemOwner, setNewSystemOwner] = useState("");

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await backendFetch("/api/discovery");

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch discovered assets");
      }

      const data = await res.json();
      setAssets(data.assets || []);
      setStats(data.stats || { total: 0, potential_shadow: 0, confirmed_shadow: 0, linked: 0 });
    } catch (err: any) {
      console.error("Error fetching discovered assets:", err);
      setError(err.message || "Failed to load discovered assets");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchSource = sourceFilter === "all" || asset.source_type === sourceFilter;
      const matchStatus = statusFilter === "all" || asset.shadow_status === statusFilter;
      return matchSource && matchStatus;
    });
  }, [assets, sourceFilter, statusFilter]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const openLinkDialog = (asset: DiscoveredAsset) => {
    setSelectedAsset(asset);
    setLinkSystemId("");
    setShowLinkDialog(true);
  };

  const openMarkShadowDialog = (asset: DiscoveredAsset) => {
    setSelectedAsset(asset);
    setShadowNotes("");
    setShowMarkShadowDialog(true);
  };

  const openResolveDialog = (asset: DiscoveredAsset) => {
    setSelectedAsset(asset);
    setResolveNotes("");
    setShowResolveDialog(true);
  };

  const openCreateSystemDialog = (asset: DiscoveredAsset) => {
    setSelectedAsset(asset);
    setNewSystemName(asset.detected_name);
    setNewSystemDescription("");
    setNewSystemOwner("");
    setShowCreateSystemDialog(true);
  };

  const handleLinkAsset = async () => {
    if (!selectedAsset || !linkSystemId.trim()) return;

    try {
      setActionLoading(selectedAsset.id);
      const res = await backendFetch(`/api/discovery/${selectedAsset.id}/link`, {
        method: "POST",
        body: JSON.stringify({ linked_system_id: linkSystemId.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to link asset");
      }

      await fetchAssets();
      setShowLinkDialog(false);
      setSelectedAsset(null);
    } catch (err: any) {
      setError(err.message || "Failed to link asset");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkShadow = async () => {
    if (!selectedAsset) return;

    try {
      setActionLoading(selectedAsset.id);
      const res = await backendFetch(`/api/discovery/${selectedAsset.id}/mark-shadow`, {
        method: "POST",
        body: JSON.stringify({ notes: shadowNotes || undefined }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to mark as Shadow AI");
      }

      await fetchAssets();
      setShowMarkShadowDialog(false);
      setSelectedAsset(null);
    } catch (err: any) {
      setError(err.message || "Failed to mark as Shadow AI");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async () => {
    if (!selectedAsset) return;

    try {
      setActionLoading(selectedAsset.id);
      const res = await backendFetch(`/api/discovery/${selectedAsset.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ notes: resolveNotes || undefined }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to resolve asset");
      }

      await fetchAssets();
      setShowResolveDialog(false);
      setSelectedAsset(null);
    } catch (err: any) {
      setError(err.message || "Failed to resolve asset");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSystem = async () => {
    if (!selectedAsset || !newSystemName.trim()) return;

    try {
      setActionLoading(selectedAsset.id);
      const res = await backendFetch(`/api/discovery/${selectedAsset.id}/create-system`, {
        method: "POST",
        body: JSON.stringify({
          system_name: newSystemName.trim(),
          description: newSystemDescription || undefined,
          owner: newSystemOwner || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create system");
      }

      const data = await res.json();
      await fetchAssets();
      setShowCreateSystemDialog(false);
      setSelectedAsset(null);
      router.push(`/ai-systems/${data.system.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create system");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] text-[#18181B]" style={{ fontFamily: "Inter, Plus Jakarta Sans, sans-serif" }}>
      <Head>
        <title>Discovery | AI Governance</title>
        <meta name="description" content="Discover and manage AI systems in use, detect Shadow AI." />
      </Head>
      <Sidebar onLogout={handleLogout} />
      <div className="mx-auto w-full max-w-[1440px] lg:pl-[267px]">
        <main className="flex-1">
          <header className="flex h-[83px] items-center justify-between border-b border-[#E4E4E7] px-9">
            <h1 className="text-[22px] font-semibold tracking-[0.5px]">AI Asset Discovery</h1>
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
            {stats.confirmed_shadow > 0 && (
              <div className="mb-6 rounded-[15px] border border-[#F1A4A4] bg-[#FFE0E0] p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-[#C71F1F]" />
                  <p className="text-[14px] font-semibold text-[#C71F1F]">
                    {stats.confirmed_shadow} confirmed Shadow AI system{stats.confirmed_shadow !== 1 ? "s" : ""} detected.
                    Unregistered AI usage may block compliance approvals.
                  </p>
                </div>
              </div>
            )}

            <div className="mb-8 grid grid-cols-2 gap-[22px] xl:grid-cols-4">
              <MetricCard
                label="Total Discovered"
                value={String(stats.total)}
                footer="All discovered assets"
                valueColor="#0D1C2E"
                iconType="total"
              />
              <MetricCard
                label="Potential Shadow AI"
                value={String(stats.potential_shadow)}
                footer="Not yet linked"
                valueColor="#E7BB2C"
                iconType="potential"
              />
              <MetricCard
                label="Confirmed Shadow AI"
                value={String(stats.confirmed_shadow)}
                footer="Requires attention"
                valueColor="#E72C2C"
                iconType="confirmed"
              />
              <MetricCard
                label="Linked Assets"
                value={String(stats.linked)}
                footer="Linked to systems"
                valueColor="#178746"
                iconType="linked"
              />
            </div>

            <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
              <div className="flex items-start justify-between px-[20.9px] pb-3 pt-4">
                <div>
                  <h2 className="text-[17.5px] font-extrabold tracking-[-0.01em] text-[#1E293B]">Discovered Assets</h2>
                  <p className="text-[11px] text-[#667085]">Review and manage discovered AI assets</p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as "all" | SourceType)}>
                    <SelectTrigger className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] px-3 text-[12px] font-bold text-[#475569] shadow-none w-[160px] bg-white">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <SelectValue placeholder="All Sources" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50 rounded-[10px] text-[12px] font-semibold text-[#475569] shadow-md border-[#CBD5E1]">
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="api_scan">API Scan</SelectItem>
                      <SelectItem value="repo_scan">Repo Scan</SelectItem>
                      <SelectItem value="vendor_detection">Vendor Detection</SelectItem>
                      <SelectItem value="manual_hint">Manual</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | ShadowStatus)}>
                    <SelectTrigger className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] px-3 text-[12px] font-bold text-[#475569] shadow-none w-[150px] bg-white">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <SelectValue placeholder="All Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50 rounded-[10px] text-[12px] font-semibold text-[#475569] shadow-md border-[#CBD5E1]">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="potential">Potential</SelectItem>
                      <SelectItem value="confirmed">Confirmed Shadow</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => setShowAddDialog(true)}
                    className="flex h-9 items-center gap-2 rounded-[10px] bg-[#3B82F6] px-4 text-[15px] font-semibold text-white hover:bg-[#2563EB] transition-colors"
                  >
                    <span className="text-[18px] leading-none">+</span>
                    Add Discovery
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[1100px]">
                  <div
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.2fr_1.5fr] border-y border-[#CBD5E1] bg-[#F8FAFC] px-[20.9px] py-3 text-[12.2px] font-bold text-[#1E293B]"
                    style={{ fontFamily: "Plus Jakarta Sans, Inter, sans-serif" }}
                  >
                    <span>Name</span>
                    <span>Vendor</span>
                    <span>Source</span>
                    <span>Confidence</span>
                    <span>Environment</span>
                    <span>Shadow Status</span>
                    <span>Actions</span>
                  </div>

                  {loading && (
                    <div className="px-[20.9px] py-6 text-[15px] text-[#667085]">Loading assets...</div>
                  )}
                  {!loading && error && (
                    <div className="px-[20.9px] py-6 text-[15px] font-semibold text-[#E72C2C]">{error}</div>
                  )}
                  {!loading && !error && filteredAssets.length === 0 && (
                    <div className="px-[20.9px] py-6 text-[15px] text-[#667085]">No discovered assets found.</div>
                  )}

                  {!loading &&
                    !error &&
                    filteredAssets.map((asset) => (
                      <article
                        key={asset.id}
                        className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.2fr_1.5fr] items-center border-b border-[#E2E8F0] px-[20.9px] py-[10.5px] text-[13px] transition-colors hover:bg-[#F8FAFC] last:border-b-0"
                        style={{ minHeight: "62.8px", fontFamily: "Plus Jakarta Sans, Inter, sans-serif" }}
                      >
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setViewAsset(asset)}
                            className="block truncate text-left text-[14px] font-bold text-[#000000]"
                          >
                            {asset.detected_name}
                          </button>
                          <p className="truncate text-[11.5px] text-[#667085]">
                            Discovered: {new Date(asset.discovered_at).toLocaleDateString()}
                          </p>
                        </div>

                        <p className="text-[15px] font-bold text-[#475569]">{asset.detected_vendor || "—"}</p>

                        <span
                          className={`inline-flex w-fit rounded-full px-[10px] py-[4px] text-[12px] font-semibold ${sourceTypeClasses(
                            asset.source_type
                          )}`}
                        >
                          {sourceTypeLabel(asset.source_type)}
                        </span>

                        <span
                          className={`inline-flex w-fit rounded-full px-[10px] py-[4px] text-[12px] font-semibold ${confidenceClasses(
                            asset.confidence_score
                          )}`}
                        >
                          {asset.confidence_score}
                        </span>

                        <p className="text-[15px] text-[#000000]">{asset.environment || "—"}</p>

                        <span
                          className={`inline-flex w-fit items-center gap-1 rounded-[10.4px] border px-[10.4px] py-[4px] text-[10px] font-bold ${shadowStatusClasses(
                            asset.shadow_status
                          )}`}
                        >
                          {shadowStatusIcon(asset.shadow_status)}
                          {shadowStatusLabel(asset.shadow_status)}
                        </span>

                        <div className="flex items-center gap-[6px] text-[#475569]">
                          {!asset.linked_system_id && (
                            <>
                              <button
                                type="button"
                                onClick={() => openLinkDialog(asset)}
                                disabled={actionLoading === asset.id}
                                className="rounded-[8px] border border-[#CBD5E1] bg-white px-2 py-1 text-[11px] font-semibold hover:bg-[#F8FAFC] disabled:opacity-50"
                              >
                                Link
                              </button>
                              <button
                                type="button"
                                onClick={() => openCreateSystemDialog(asset)}
                                disabled={actionLoading === asset.id}
                                className="rounded-[8px] bg-[#3B82F6] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#2563EB] disabled:opacity-50"
                              >
                                Create
                              </button>
                            </>
                          )}
                          {asset.shadow_status !== "confirmed" && (
                            <button
                              type="button"
                              onClick={() => openMarkShadowDialog(asset)}
                              disabled={actionLoading === asset.id}
                              className="rounded-[8px] border border-[#F1A4A4] bg-[#FFE0E0] px-2 py-1 text-[11px] font-semibold text-[#C71F1F] hover:bg-[#FFD0D0] disabled:opacity-50"
                            >
                              Shadow
                            </button>
                          )}
                          {asset.shadow_status !== "resolved" && (
                            <button
                              type="button"
                              onClick={() => openResolveDialog(asset)}
                              disabled={actionLoading === asset.id}
                              className="rounded-[8px] border border-[#CBD5E1] bg-white px-2 py-1 text-[11px] font-semibold hover:bg-[#F8FAFC] disabled:opacity-50"
                            >
                              Resolve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setViewAsset(asset)}
                            className="rounded p-1 hover:bg-[#F1F5F9]"
                            aria-label="View asset details"
                          >
                            <ArrowUpRight className="h-5 w-5" />
                          </button>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>

      <AddDiscoveryDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={fetchAssets} />

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="max-w-md rounded-[15px] border border-[#CBD5E1] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold text-[#1E293B]">Link to Existing System</DialogTitle>
            <DialogDescription className="text-[13px] text-[#667085]">
              Enter the AI system ID to link this asset to an existing registered system.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="linkSystemId" className="text-[14px] font-medium text-[#18181B]">
                System ID
              </Label>
              <Input
                id="linkSystemId"
                value={linkSystemId}
                onChange={(e) => setLinkSystemId(e.target.value)}
                placeholder="Enter system UUID"
                className="mt-1.5 rounded-[10px] border-[#CBD5E1] text-[14px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
                className="rounded-[10px] border-[#CBD5E1] text-[14px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleLinkAsset}
                disabled={!linkSystemId.trim() || actionLoading === selectedAsset?.id}
                className="rounded-[10px] bg-[#3B82F6] text-[14px] hover:bg-[#2563EB]"
              >
                {actionLoading === selectedAsset?.id ? "Linking..." : "Link Asset"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMarkShadowDialog} onOpenChange={setShowMarkShadowDialog}>
        <DialogContent className="max-w-md rounded-[15px] border border-[#CBD5E1] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold text-[#1E293B]">Mark as Shadow AI</DialogTitle>
            <DialogDescription className="text-[13px] text-[#667085]">
              Confirm this asset as Shadow AI - an unauthorized AI system in use.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="shadowNotes" className="text-[14px] font-medium text-[#18181B]">
                Notes (optional)
              </Label>
              <Textarea
                id="shadowNotes"
                value={shadowNotes}
                onChange={(e) => setShadowNotes(e.target.value)}
                placeholder="Add any relevant notes about this Shadow AI..."
                className="mt-1.5 min-h-[80px] rounded-[10px] border-[#CBD5E1] text-[14px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMarkShadowDialog(false)}
                className="rounded-[10px] border-[#CBD5E1] text-[14px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleMarkShadow}
                disabled={actionLoading === selectedAsset?.id}
                className="rounded-[10px] bg-[#E72C2C] text-[14px] hover:bg-[#C71F1F]"
              >
                {actionLoading === selectedAsset?.id ? "Marking..." : "Confirm Shadow AI"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="max-w-md rounded-[15px] border border-[#CBD5E1] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold text-[#1E293B]">Resolve Asset</DialogTitle>
            <DialogDescription className="text-[13px] text-[#667085]">
              Mark this asset as resolved after taking appropriate action.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="resolveNotes" className="text-[14px] font-medium text-[#18181B]">
                Resolution Notes (optional)
              </Label>
              <Textarea
                id="resolveNotes"
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Describe how this asset was resolved..."
                className="mt-1.5 min-h-[80px] rounded-[10px] border-[#CBD5E1] text-[14px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResolveDialog(false)}
                className="rounded-[10px] border-[#CBD5E1] text-[14px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleResolve}
                disabled={actionLoading === selectedAsset?.id}
                className="rounded-[10px] bg-[#178746] text-[14px] hover:bg-[#15803D]"
              >
                {actionLoading === selectedAsset?.id ? "Resolving..." : "Resolve Asset"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateSystemDialog} onOpenChange={setShowCreateSystemDialog}>
        <DialogContent className="max-w-lg rounded-[15px] border border-[#CBD5E1] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold text-[#1E293B]">Create New AI System</DialogTitle>
            <DialogDescription className="text-[13px] text-[#667085]">
              Register this discovered asset as a new AI system in the governance platform.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="systemName" className="text-[14px] font-medium text-[#18181B]">
                System Name *
              </Label>
              <Input
                id="systemName"
                value={newSystemName}
                onChange={(e) => setNewSystemName(e.target.value)}
                className="mt-1.5 rounded-[10px] border-[#CBD5E1] text-[14px]"
              />
            </div>
            <div>
              <Label htmlFor="systemDesc" className="text-[14px] font-medium text-[#18181B]">
                Description
              </Label>
              <Textarea
                id="systemDesc"
                value={newSystemDescription}
                onChange={(e) => setNewSystemDescription(e.target.value)}
                placeholder="Describe the AI system..."
                className="mt-1.5 min-h-[80px] rounded-[10px] border-[#CBD5E1] text-[14px]"
              />
            </div>
            <div>
              <Label htmlFor="systemOwner" className="text-[14px] font-medium text-[#18181B]">
                Owner
              </Label>
              <Input
                id="systemOwner"
                value={newSystemOwner}
                onChange={(e) => setNewSystemOwner(e.target.value)}
                placeholder="System owner name or email"
                className="mt-1.5 rounded-[10px] border-[#CBD5E1] text-[14px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateSystemDialog(false)}
                className="rounded-[10px] border-[#CBD5E1] text-[14px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateSystem}
                disabled={!newSystemName.trim() || actionLoading === selectedAsset?.id}
                className="rounded-[10px] bg-[#3B82F6] text-[14px] hover:bg-[#2563EB]"
              >
                {actionLoading === selectedAsset?.id ? "Creating..." : "Create System"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewAsset} onOpenChange={() => setViewAsset(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[15px] border border-[#CBD5E1] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-bold text-[#1E293B]">
              Smart Shadow AI Analysis: {viewAsset?.detected_name}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#667085]">
              AI-powered assessment using regulatory knowledge and platform best practices
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {viewAsset && (
              <SmartShadowAIAssessment
                asset={viewAsset as DiscoveredAIAsset}
                onAssessmentComplete={(assessment) => {
                  console.log("Assessment completed:", assessment);
                }}
                onLinkSuggestion={(suggestion) => {
                  console.log("Link suggestion:", suggestion);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
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
  iconType: "total" | "potential" | "confirmed" | "linked";
}) {
  const iconByType = {
    total: <Search className="h-4 w-4 text-[#61A9ED]" />,
    potential: <AlertTriangle className="h-4 w-4 text-[#E7BB2C]" />,
    confirmed: <Ban className="h-4 w-4 text-[#E72C2C]" />,
    linked: <LinkIcon className="h-4 w-4 text-[#178746]" />,
  } as const;

  const bgByType = {
    total: "bg-[#EAF4FF]",
    potential: "bg-[#FFF8E2]",
    confirmed: "bg-[#FFE8E8]",
    linked: "bg-[#E8FAEF]",
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
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${bgByType[iconType]}`}>
          {iconByType[iconType]}
        </div>
      </div>
    </article>
  );
}

function AddDiscoveryDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [sourceType, setSourceType] = useState<SourceType>("manual_hint");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vendor, setVendor] = useState<string>("");
  const [endpointOrRepo, setEndpointOrRepo] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceLevel>("medium");
  const [environment, setEnvironment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await backendFetch("/api/discovery", {
        method: "POST",
        body: JSON.stringify({
          source_type: sourceType,
          detected_name: name,
          detected_description: description || undefined,
          detected_vendor: vendor || undefined,
          detected_endpoint_or_repo: endpointOrRepo || undefined,
          confidence_score: confidence,
          environment: environment || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create discovery");
      }

      setName("");
      setDescription("");
      setVendor("");
      setEndpointOrRepo("");
      setConfidence("medium");
      setEnvironment("");
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create discovery");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[15px] border border-[#CBD5E1] bg-white p-6">
        <DialogHeader>
          <DialogTitle className="text-[17px] font-bold text-[#1E293B]">Add Discovered Asset</DialogTitle>
          <DialogDescription className="text-[13px] text-[#667085]">
            Manually add a discovered AI asset (API endpoint, repository, or vendor)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-[10px] border border-[#F1A4A4] bg-[#FFE0E0] p-3 text-[14px] text-[#C71F1F]">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="source_type" className="text-[14px] font-medium text-[#18181B]">
              Source Type
            </Label>
            <Select value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
              <SelectTrigger className="mt-1.5 rounded-[10px] border-[#CBD5E1] text-[14px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-[10px] border-[#CBD5E1]">
                <SelectItem value="api_scan">API Endpoint Detection</SelectItem>
                <SelectItem value="repo_scan">Repository Signal</SelectItem>
                <SelectItem value="vendor_detection">Vendor Usage Declaration</SelectItem>
                <SelectItem value="manual_hint">Manual Hint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name" className="text-[14px] font-medium text-[#18181B]">
              Detected Name *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 rounded-[10px] border-[#CBD5E1] text-[14px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-[14px] font-medium text-[#18181B]">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 min-h-[60px] rounded-[10px] border-[#CBD5E1] text-[14px]"
            />
          </div>

          <div>
            <Label htmlFor="vendor" className="text-[14px] font-medium text-[#18181B]">
              Vendor
            </Label>
            <Select value={vendor} onValueChange={setVendor}>
              <SelectTrigger className="mt-1.5 rounded-[10px] border-[#CBD5E1] text-[14px]">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-[10px] border-[#CBD5E1]">
                <SelectItem value="OpenAI">OpenAI</SelectItem>
                <SelectItem value="Anthropic">Anthropic</SelectItem>
                <SelectItem value="AWS">AWS</SelectItem>
                <SelectItem value="Azure">Azure</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="endpoint_or_repo" className="text-[14px] font-medium text-[#18181B]">
              {sourceType === "api_scan" ? "API Endpoint" : sourceType === "repo_scan" ? "Repository URL" : "Endpoint/Repo"}
            </Label>
            <Input
              id="endpoint_or_repo"
              value={endpointOrRepo}
              onChange={(e) => setEndpointOrRepo(e.target.value)}
              placeholder={sourceType === "api_scan" ? "https://api.openai.com/v1/..." : "https://github.com/..."}
              className="mt-1.5 rounded-[10px] border-[#CBD5E1] text-[14px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="confidence" className="text-[14px] font-medium text-[#18181B]">
                Confidence
              </Label>
              <Select value={confidence} onValueChange={(v) => setConfidence(v as ConfidenceLevel)}>
                <SelectTrigger className="mt-1.5 rounded-[10px] border-[#CBD5E1] text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-[10px] border-[#CBD5E1]">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="environment" className="text-[14px] font-medium text-[#18181B]">
                Environment
              </Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger className="mt-1.5 rounded-[10px] border-[#CBD5E1] text-[14px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-[10px] border-[#CBD5E1]">
                  <SelectItem value="dev">Development</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="prod">Production</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-[10px] border-[#CBD5E1] text-[14px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name}
              className="rounded-[10px] bg-[#3B82F6] text-[14px] hover:bg-[#2563EB]"
            >
              {submitting ? "Adding..." : "Add Discovery"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
