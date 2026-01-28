/**
 * Discovery Dashboard Page
 * 
 * Shows discovered AI assets, Shadow AI detection, and allows manual discovery input
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Search,
  Plus,
  Link as LinkIcon,
  XCircle,
  CheckCircle,
  Eye,
  AlertCircle,
  LayoutDashboard,
  Layers,
  FileText,
  Lock,
  ArrowRight,
  Brain,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import Sidebar from "@/components/sidebar";
import type {
  DiscoveredAIAssetWithTimestamps
} from "@/types/discovery";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SmartShadowAIAssessment } from "../../components/ui/smart-shadow-ai-assessment";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BaseDiscoveredAIAsset } from "../../types/discovery";
import type { DiscoveredAIAsset } from "@/types/discovery";

interface DiscoveryStats {
  total: number;
  potential_shadow: number;
  confirmed_shadow: number;
  linked: number;
}

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


export default function DiscoveryDashboard() {
  const router = useRouter();
  const [assets, setAssets] = useState<DiscoveredAIAssetWithTimestamps[]>([]);
  const [stats, setStats] = useState<DiscoveryStats>({
    total: 0,
    potential_shadow: 0,
    confirmed_shadow: 0,
    linked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<DiscoveredAIAssetWithTimestamps | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      console.log('🔍 Discovery: Auth check - user:', !!user, 'pathname:', window.location.pathname);
    };
    checkAuth();

    // Listen for route changes to debug redirects
    const handleRouteChange = (url: string) => {
      console.log('🔍 Discovery: Route changed to:', url);
      if (url !== '/discovery' && url !== window.location.pathname) {
        console.warn('⚠️ Discovery: Unexpected route change detected!', {
          from: window.location.pathname,
          to: url,
          stack: new Error().stack
        });
      }
    };

    router.events?.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events?.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Fetch discovered assets
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await backendFetch('/api/discovery');

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

  const handleLinkAsset = async (assetId: string) => {
    const systemId = prompt("Enter the AI system ID to link to:");
    if (!systemId) return;

    try {
      setActionLoading(assetId);
      const res = await backendFetch(`/api/discovery/${assetId}/link`, {
        method: "POST",
        body: JSON.stringify({ linked_system_id: systemId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to link asset");
      }

      await fetchAssets();
      alert("Asset linked successfully");
    } catch (err: any) {
      alert(err.message || "Failed to link asset");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkShadow = async (assetId: string) => {
    const notes = prompt("Enter notes (optional):");
    if (notes === null) return; // User cancelled

    try {
      setActionLoading(assetId);
      const res = await backendFetch(`/api/discovery/${assetId}/mark-shadow`, {
        method: "POST",
        body: JSON.stringify({ notes: notes || undefined }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to mark as Shadow AI");
      }

      await fetchAssets();
      alert("Asset marked as confirmed Shadow AI");
    } catch (err: any) {
      alert(err.message || "Failed to mark as Shadow AI");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (assetId: string) => {
    const notes = prompt("Enter resolution notes (optional):");
    if (notes === null) return;

    try {
      setActionLoading(assetId);
      const res = await backendFetch(`/api/discovery/${assetId}/resolve`, {
        method: "POST",
        body: JSON.stringify({ notes: notes || undefined }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to resolve asset");
      }

      await fetchAssets();
      alert("Asset resolved successfully");
    } catch (err: any) {
      alert(err.message || "Failed to resolve asset");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSystem = async (assetId: string) => {
    const systemName = prompt("Enter system name:");
    if (!systemName) return;

    const description = prompt("Enter description (optional):");
    const owner = prompt("Enter owner (optional):");

    try {
      setActionLoading(assetId);
      const res = await backendFetch(`/api/discovery/${assetId}/create-system`, {
        method: "POST",
        body: JSON.stringify({
          system_name: systemName,
          description: description || undefined,
          owner: owner || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create system");
      }

      const data = await res.json();
      await fetchAssets();
      alert(`System created successfully! ID: ${data.system.id}`);
      router.push(`/ai-systems/${data.system.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to create system");
    } finally {
      setActionLoading(null);
    }
  };

  const getSourceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      repo_scan: "bg-blue-50 text-blue-700 border-blue-200",
      api_scan: "bg-purple-50 text-purple-700 border-purple-200",
      vendor_detection: "bg-amber-50 text-amber-700 border-amber-200",
      manual_hint: "bg-secondary/80 text-muted-foreground border-border/50",
    };
    return (
      <Badge className={`${colors[type] || colors.manual_hint} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all`}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors: Record<string, string> = {
      high: "bg-emerald-50 text-emerald-700 border-emerald-200",
      medium: "bg-amber-50 text-amber-700 border-amber-200",
      low: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      <Badge className={`${colors[confidence] || colors.medium} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all`}>
        {confidence}
      </Badge>
    );
  };

  const getShadowStatusBadge = (status: string) => {
    if (status === 'confirmed') {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-red-100 transition-all flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Confirmed Shadow AI
        </Badge>
      );
    }
    if (status === 'resolved') {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-emerald-100 transition-all flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          Resolved
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-amber-100 transition-all">
        Potential
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Left sidebar - Only visible when logged in */}
      <Sidebar onLogout={handleLogout} />

      <div className={`p-6 lg:p-8 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        <div className="space-y-8">
          {/* Header */}
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground">
                  AI Asset <span className="gradient-text">Discovery</span>
                </h1>
                <p className="text-muted-foreground mt-3 text-lg font-medium">
                  Discover and manage AI systems in use, detect Shadow AI
                </p>
              </div>
              <AddDiscoveryDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={fetchAssets}
              />
            </div>
          </div>

          {/* Shadow AI Warning Banner */}
          {stats.confirmed_shadow > 0 && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 glass-panel">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-700 font-semibold">
                    {stats.confirmed_shadow} confirmed Shadow AI system{stats.confirmed_shadow !== 1 ? 's' : ''} detected.
                    Unregistered AI usage may block compliance approvals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Discovered
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Search className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-foreground">
                  {loading ? "..." : stats.total}
                </div>
                <p className="text-xs text-muted-foreground mt-2">All discovered assets</p>
              </CardContent>
            </Card>

            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/30">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Potential Shadow AI
                </CardTitle>
                <div className="p-2 bg-amber-100 rounded-lg border border-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-amber-600">
                  {loading ? "..." : stats.potential_shadow}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Not yet linked</p>
              </CardContent>
            </Card>

            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-red-300/30">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Confirmed Shadow AI
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-lg border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-red-600">
                  {loading ? "..." : stats.confirmed_shadow}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
              </CardContent>
            </Card>

            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/30">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Linked Assets
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg border border-emerald-200">
                  <LinkIcon className="h-5 w-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-emerald-600">
                  {loading ? "..." : stats.linked}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Linked to systems</p>
              </CardContent>
            </Card>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 glass-panel">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Discovered Assets Table */}
          <Card className="glass-panel shadow-elevated border-border/50 w-full max-w-7xl mx-auto">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-2xl font-bold text-foreground">Discovered Assets</CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-base">
                Review and manage discovered AI assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="ml-3 text-muted-foreground font-medium">Loading assets...</p>
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground font-medium mb-4">No discovered assets found.</p>
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    variant="hero"
                    className="rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Discovery
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Name</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Vendor</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Source</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Confidence</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Environment</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Shadow Status</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Linked System</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset) => (
                        <TableRow key={asset.id} className="hover:bg-secondary/20 transition-colors duration-150 border-b border-border/30">
                          <TableCell className="font-semibold text-foreground py-4">
                            {asset.detected_name}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4">
                            {asset.detected_vendor || "—"}
                          </TableCell>
                          <TableCell className="py-4">
                            {getSourceTypeBadge(asset.source_type)}
                          </TableCell>
                          <TableCell className="py-4">
                            {getConfidenceBadge(asset.confidence_score)}
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4">
                            {asset.environment || "—"}
                          </TableCell>
                          <TableCell className="py-4">
                            {getShadowStatusBadge(asset.shadow_status)}
                          </TableCell>
                          <TableCell className="py-4">
                            {asset.linked_system_id ? (
                              <Button
                                variant="link"
                                size="sm"
                                className="text-primary hover:text-primary/80 p-0 h-auto"
                                onClick={() => router.push(`/ai-systems/${asset.linked_system_id}`)}
                              >
                                {asset.linked_system_id.substring(0, 8)}...
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              {!asset.linked_system_id && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 hover:shadow-md transition-all font-medium rounded-xl px-3 py-1.5"
                                    onClick={() => handleLinkAsset(asset.id)}
                                    disabled={actionLoading === asset.id}
                                  >
                                    <LinkIcon className="w-4 h-4 mr-1" />
                                    Link
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 hover:shadow-md transition-all font-medium rounded-xl px-3 py-1.5"
                                    onClick={() => handleCreateSystem(asset.id)}
                                    disabled={actionLoading === asset.id}
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Create
                                  </Button>
                                </>
                              )}
                              {asset.shadow_status !== 'confirmed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500/40 bg-red-50/50 text-red-700 hover:bg-red-100/70 hover:border-red-500/60 hover:shadow-md transition-all font-medium rounded-xl px-3 py-1.5"
                                  onClick={() => handleMarkShadow(asset.id)}
                                  disabled={actionLoading === asset.id}
                                >
                                  <AlertTriangle className="w-4 h-4 mr-1" />
                                  Shadow
                                </Button>
                              )}
                              {asset.shadow_status !== 'resolved' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-border/50 bg-secondary/30 text-foreground hover:bg-secondary/50 hover:border-primary/40 hover:shadow-md transition-all font-medium rounded-xl px-3 py-1.5"
                                  onClick={() => handleResolve(asset.id)}
                                  disabled={actionLoading === asset.id}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Resolve
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-border/50 bg-secondary/30 text-foreground hover:bg-secondary/50 hover:border-primary/40 hover:shadow-md transition-all font-medium rounded-xl px-3 py-1.5"
                                onClick={() => setSelectedAsset(asset)}
                                disabled={actionLoading === asset.id}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Smart Assessment Dialog */}
        {selectedAsset && (
          <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-foreground">
                  Smart Shadow AI Analysis: {selectedAsset.detected_name}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  AI-powered assessment using regulatory knowledge and platform best practices
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <SmartShadowAIAssessment
                  asset={selectedAsset as DiscoveredAIAsset}
                  onAssessmentComplete={(assessment) => {
                    console.log('Assessment completed:', assessment);
                    // Could update the asset in the table with assessment results
                  }}
                  onLinkSuggestion={(suggestion) => {
                    console.log('Link suggestion:', suggestion);
                    // Could auto-populate link dialog with suggestion
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

// Add Discovery Dialog Component
function AddDiscoveryDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [sourceType, setSourceType] = useState<'api_scan' | 'repo_scan' | 'vendor_detection' | 'manual_hint'>('manual_hint');
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [vendor, setVendor] = useState<string>("");
  const [endpointOrRepo, setEndpointOrRepo] = useState("");
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high'>('medium');
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

      // Reset form
      setName("");
      setDescription("");
      setVendor("");
      setEndpointOrRepo("");
      setConfidence('medium');
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
      <DialogTrigger asChild>
        <Button variant="hero" className="rounded-xl flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Discovery
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-border/50 text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Add Discovered Asset</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manually add a discovered AI asset (API endpoint, repository, or vendor)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div>
            <Label htmlFor="source_type" className="text-foreground">Source Type</Label>
            <Select value={sourceType} onValueChange={(v: any) => setSourceType(v)}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-panel border-border/50">
                <SelectItem value="api_scan" className="text-foreground">API Endpoint Detection</SelectItem>
                <SelectItem value="repo_scan" className="text-foreground">Repository Signal</SelectItem>
                <SelectItem value="vendor_detection" className="text-foreground">Vendor Usage Declaration</SelectItem>
                <SelectItem value="manual_hint" className="text-foreground">Manual Hint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name" className="text-foreground">Detected Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-border text-foreground"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-foreground">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="vendor" className="text-foreground">Vendor</Label>
            <Select value={vendor} onValueChange={setVendor}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-border/50">
                <SelectItem value="OpenAI" className="text-foreground">OpenAI</SelectItem>
                <SelectItem value="Anthropic" className="text-foreground">Anthropic</SelectItem>
                <SelectItem value="AWS" className="text-foreground">AWS</SelectItem>
                <SelectItem value="Azure" className="text-foreground">Azure</SelectItem>
                <SelectItem value="Custom" className="text-foreground">Custom</SelectItem>
                <SelectItem value="Unknown" className="text-foreground">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="endpoint_or_repo" className="text-foreground">
              {sourceType === 'api_scan' ? 'API Endpoint' : sourceType === 'repo_scan' ? 'Repository URL' : 'Endpoint/Repo'}
            </Label>
            <Input
              id="endpoint_or_repo"
              value={endpointOrRepo}
              onChange={(e) => setEndpointOrRepo(e.target.value)}
              className="bg-background border-border text-foreground"
              placeholder={sourceType === 'api_scan' ? 'https://api.openai.com/v1/...' : 'https://github.com/...'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="confidence" className="text-foreground">Confidence</Label>
              <Select value={confidence} onValueChange={(v: any) => setConfidence(v)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-panel border-border/50">
                  <SelectItem value="low" className="text-foreground">Low</SelectItem>
                  <SelectItem value="medium" className="text-foreground">Medium</SelectItem>
                  <SelectItem value="high" className="text-foreground">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="environment" className="text-foreground">Environment</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-border/50">
                  <SelectItem value="dev" className="text-foreground">Development</SelectItem>
                  <SelectItem value="test" className="text-foreground">Test</SelectItem>
                  <SelectItem value="prod" className="text-foreground">Production</SelectItem>
                  <SelectItem value="unknown" className="text-foreground">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border/50 bg-secondary/30 text-foreground hover:bg-secondary/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name}
              variant="hero"
              className="rounded-xl"
            >
              {submitting ? "Adding..." : "Add Discovery"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
