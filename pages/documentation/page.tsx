"use client";

/**
 * Global Documentation Page
 * 
 * Lists all generated documentation across all AI systems
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  Filter,
  X,
  LayoutDashboard,
  Layers,
  Lock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/ai-governance-backend/utils/supabase/client";
import Sidebar from "@/components/sidebar";
import { signOutAction } from "@/app/actions";
import type { DocumentationWithSystemInfo } from "@/ai-governance-backend/types/documentation";

export default function DocumentationPage() {
  const router = useRouter();
  const [documentation, setDocumentation] = useState<DocumentationWithSystemInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Filters
  const [regulationFilter, setRegulationFilter] = useState<string>("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await signOutAction();
    router.push("/");
  };

  useEffect(() => {
    fetchDocumentation();
  }, [regulationFilter, documentTypeFilter, statusFilter]);

  const fetchDocumentation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (regulationFilter !== "all") params.append("regulation_type", regulationFilter);
      if (documentTypeFilter !== "all") params.append("document_type", documentTypeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/documentation?${params.toString()}`);
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch documentation");
      }

      const data = await res.json();
      setDocumentation(data.documentation || []);
    } catch (err: any) {
      console.error("Error fetching documentation:", err);
      setError(err.message || "Failed to load documentation");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (systemId: string) => {
    router.push(`/ai-systems/${systemId}?tab=documentation`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "current":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-emerald-100 transition-all flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Current
          </Badge>
        );
      case "outdated":
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-amber-100 transition-all flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            Outdated
          </Badge>
        );
      case "requires_regeneration":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-red-100 transition-all flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Requires Regeneration
          </Badge>
        );
      default:
        return <Badge className="bg-secondary/80 text-muted-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">{status}</Badge>;
    }
  };

  const getRegulationBadge = (regulation: string) => {
    const colors: Record<string, string> = {
      "EU AI Act": "bg-blue-50 text-blue-700 border-blue-200",
      "UK AI Act": "bg-emerald-50 text-emerald-700 border-emerald-200",
      "MAS": "bg-purple-50 text-purple-700 border-purple-200",
    };
    return (
      <Badge className={`${colors[regulation] || "bg-secondary/80 text-muted-foreground border-border/50"} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all`}>
        {regulation}
      </Badge>
    );
  };

  const getDocumentTypeBadge = (docType?: string) => {
    if (!docType || docType === "Compliance Summary") {
      return <span className="text-muted-foreground text-sm">Compliance Summary</span>;
    }
    return (
      <Badge variant="outline" className="bg-secondary/30 text-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">
        {docType}
      </Badge>
    );
  };

  // Filter documentation by search query
  const filteredDocs = documentation.filter((doc) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.system_name?.toLowerCase().includes(query) ||
      doc.regulation_type.toLowerCase().includes(query) ||
      doc.document_type?.toLowerCase().includes(query) ||
      doc.version.toLowerCase().includes(query)
    );
  });

  // Get unique values for filters
  const uniqueRegulations = Array.from(new Set(documentation.map(d => d.regulation_type)));
  const uniqueDocumentTypes = Array.from(
    new Set(documentation.map(d => d.document_type || "Compliance Summary").filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Left sidebar - Only visible when logged in */}
      {isLoggedIn && <Sidebar onLogout={handleLogout} />}

      <div className={`p-6 lg:p-8 ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground">
                Documentation <span className="gradient-text">Generator</span>
              </h1>
              <p className="text-muted-foreground mt-3 text-lg font-medium">
                View and manage all compliance documentation across all AI systems
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchDocumentation}
              disabled={loading}
              className="border-border/50 bg-secondary/30 text-foreground hover:bg-secondary/50 hover:border-primary/40 hover:shadow-md transition-all rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">
                  Total Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-foreground">
                  {loading ? "..." : documentation.length}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">
                  Current
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-emerald-600">
                  {loading ? "..." : documentation.filter(d => d.status === "current").length}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">
                  Outdated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-amber-600">
                  {loading ? "..." : documentation.filter(d => d.status === "outdated").length}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-red-300/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase">
                  Requires Regeneration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-red-600">
                  {loading ? "..." : documentation.filter(d => d.status === "requires_regeneration").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="glass-panel shadow-elevated border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-foreground mb-2 block">Search</label>
                  <Input
                    placeholder="Search by system name, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground mb-2 block">Regulation</label>
                  <Select value={regulationFilter} onValueChange={setRegulationFilter}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="All Regulations" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-border/50">
                      <SelectItem value="all" className="text-foreground">All Regulations</SelectItem>
                      {uniqueRegulations.map((reg) => (
                        <SelectItem key={reg} value={reg} className="text-foreground">
                          {reg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-foreground mb-2 block">Document Type</label>
                  <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-border/50">
                      <SelectItem value="all" className="text-foreground">All Types</SelectItem>
                      {uniqueDocumentTypes.map((type) => (
                        <SelectItem key={type} value={type} className="text-foreground">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-foreground mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-border/50">
                      <SelectItem value="all" className="text-foreground">All Statuses</SelectItem>
                      <SelectItem value="current" className="text-foreground">Current</SelectItem>
                      <SelectItem value="outdated" className="text-foreground">Outdated</SelectItem>
                      <SelectItem value="requires_regeneration" className="text-foreground">
                        Requires Regeneration
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(regulationFilter !== "all" || documentTypeFilter !== "all" || statusFilter !== "all" || searchQuery) && (
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRegulationFilter("all");
                      setDocumentTypeFilter("all");
                      setStatusFilter("all");
                      setSearchQuery("");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documentation Table */}
          <Card className="glass-panel shadow-elevated border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground">All Documentation</CardTitle>
              <CardDescription className="text-muted-foreground">
                {filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-3 text-muted-foreground font-medium">Loading documentation...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-foreground font-medium">No documentation found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {documentation.length === 0
                      ? "Generate documentation from an AI system detail page"
                      : "Try adjusting your filters"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="font-bold text-foreground">AI System</TableHead>
                        <TableHead className="font-bold text-foreground">Regulation</TableHead>
                        <TableHead className="font-bold text-foreground">Document Type</TableHead>
                        <TableHead className="font-bold text-foreground">Version</TableHead>
                        <TableHead className="font-bold text-foreground">Status</TableHead>
                        <TableHead className="font-bold text-foreground">Last Generated</TableHead>
                        <TableHead className="font-bold text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocs.map((doc) => (
                        <TableRow
                          key={doc.id}
                          className="hover:bg-secondary/20 transition-colors border-b border-border/30"
                        >
                          <TableCell className="font-semibold text-foreground">
                            {doc.system_name || `System ${doc.ai_system_id.substring(0, 8)}...`}
                          </TableCell>
                          <TableCell>{getRegulationBadge(doc.regulation_type)}</TableCell>
                          <TableCell>{getDocumentTypeBadge(doc.document_type)}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            v{doc.version}
                          </TableCell>
                          <TableCell>{getStatusBadge(doc.status)}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(doc.ai_system_id)}
                              className="border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 hover:shadow-md transition-all font-medium rounded-xl px-3 py-1.5"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </Button>
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
      </div>
    </div>
  );
}

