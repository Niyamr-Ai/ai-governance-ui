"use client";

/**
 * Documentation Tab Component
 * 
 * Displays and manages compliance documentation for an AI system
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FileText, Download, RefreshCw, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/utils/supabase/client";
import type { ComplianceDocumentation } from "@/types/documentation";

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

interface DocumentationTabProps {
  systemId: string;
  systemType: 'EU AI Act' | 'MAS' | 'UK AI Act' | null;
}

export default function DocumentationTab({ systemId, systemType }: DocumentationTabProps) {
  const [documentation, setDocumentation] = useState<ComplianceDocumentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegulation, setSelectedRegulation] = useState<string>("");
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("Compliance Summary");
  const [selectedDoc, setSelectedDoc] = useState<ComplianceDocumentation | null>(null);

  // Determine available regulations based on system type
  const availableRegulations = systemType ? [systemType] : ['EU AI Act', 'UK AI Act', 'MAS'];
  
  // Available document types
  const documentTypes = [
    'Compliance Summary',
    'AI System Card',
    'Technical Documentation',
    'Data Protection Impact Assessment',
    'Risk Assessment Report',
    'Algorithm Impact Assessment',
    'Audit Trail'
  ];

  useEffect(() => {
    fetchDocumentation();
    
    // Auto-refresh every 5 seconds to check for newly generated documentation
    const interval = setInterval(() => {
      fetchDocumentation();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [systemId]);

  const fetchDocumentation = async () => {
    try {
      // Don't show loading spinner on auto-refresh
      if (documentation.length === 0) {
        setLoading(true);
      }
      setError(null);
      const res = await backendFetch(`/api/ai-systems/${systemId}/documentation`);
      
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

  const handleGenerate = async () => {
    if (!selectedRegulation) {
      setError("Please select a regulation type");
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      const res = await backendFetch(`/api/ai-systems/${systemId}/documentation`, {
        method: "POST",
        body: JSON.stringify({
          regulation_type: selectedRegulation,
          document_type: selectedDocumentType
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate documentation");
      }

      const data = await res.json();
      
      // Refresh documentation list
      await fetchDocumentation();
      
      // Show success message
      alert(`Documentation generated successfully! Version ${data.documentation.version}`);
      
      // Reset selection
      setSelectedRegulation("");
    } catch (err: any) {
      console.error("Error generating documentation:", err);
      setError(err.message || "Failed to generate documentation");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async (docId: string) => {
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
  
      if (!accessToken) {
        alert("Not authenticated");
        return;
      }
  
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documentation/${docId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (!res.ok) {
        throw new Error("Failed to download PDF");
      }
  
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = `documentation-${docId}.pdf`;
      document.body.appendChild(a);
      a.click();
  
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("PDF download failed");
    }
  };
  
  
  
  

  const handleView = (doc: ComplianceDocumentation) => {
    setSelectedDoc(doc);
  };

  const handleCloseView = () => {
    setSelectedDoc(null);
  };

  // Group documentation by regulation type
  const docsByRegulation = documentation.reduce((acc, doc) => {
    if (!acc[doc.regulation_type]) {
      acc[doc.regulation_type] = [];
    }
    acc[doc.regulation_type].push(doc);
    return acc;
  }, {} as Record<string, ComplianceDocumentation[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedDoc) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/30">
          <div>
            <h3 className="text-3xl font-bold text-foreground mb-2">
              {selectedDoc.regulation_type} - Version {selectedDoc.version}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Generated: {new Date(selectedDoc.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCloseView}
              className="border-border/50 bg-secondary/30 text-foreground hover:bg-secondary/50 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold px-4 py-2"
            >
              Close
            </Button>
            <Button
              onClick={() => handleDownloadPDF(selectedDoc.id)}
              variant="hero"
              size="lg"
              className="rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="h-5 w-5 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <Card className="glass-panel shadow-elevated border-border/50 rounded-2xl overflow-hidden">
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-foreground font-mono text-sm bg-gradient-to-br from-secondary/20 to-secondary/10 p-6 rounded-xl overflow-auto max-h-[600px] border border-border/30 shadow-inner">
                {selectedDoc.content}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Alert about Auto-Generation */}
      {documentation.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 glass-panel">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <p className="text-blue-700">
            Documentation is automatically generated when you create an assessment. If you don't see it yet, it may still be generating in the background. 
            This page will auto-refresh every 5 seconds to check for new documentation.
          </p>
        </div>
      )}

      {/* Generate New Documentation */}
      <Card className="glass-panel shadow-elevated border-border/50 rounded-2xl overflow-hidden hover:shadow-blue transition-all duration-300">
        <CardHeader className="pb-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-2xl font-bold mb-2">Generate Compliance Documentation</CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Generate automated compliance documentation based on system data and approved risk assessments
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDocumentation}
              disabled={loading}
              className="border-border/50 bg-secondary/30 text-foreground hover:bg-secondary/50 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground uppercase tracking-wider">Regulation Type</label>
                <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                  <SelectTrigger className="w-full bg-background border-border/50 text-foreground rounded-xl shadow-sm hover:shadow-md transition-all h-12">
                    <SelectValue placeholder="Select regulation" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-border/50 rounded-xl shadow-lg">
                    {availableRegulations.map((reg) => (
                      <SelectItem key={reg} value={reg} className="text-foreground rounded-lg">
                        {reg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground uppercase tracking-wider">Document Type</label>
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger className="w-full bg-background border-border/50 text-foreground rounded-xl shadow-sm hover:shadow-md transition-all h-12">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-border/50 rounded-xl shadow-lg">
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-foreground rounded-lg">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!selectedRegulation || generating}
              variant="hero"
              size="lg"
              className="rounded-xl w-full shadow-lg hover:shadow-xl transition-all"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Documentation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documentation List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-border/30">
          <h3 className="text-3xl font-bold text-foreground">Generated Documentation</h3>
        </div>

        {documentation.length === 0 ? (
          <Card className="glass-panel shadow-elevated border-border/50 rounded-2xl">
            <CardContent className="pt-6 text-center py-16">
              <div className="p-4 bg-secondary/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold text-lg mb-2">No documentation generated yet</p>
              <p className="text-sm text-muted-foreground">
                Use the form above to generate compliance documentation
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(docsByRegulation).map(([regulation, docs]) => (
            <div key={regulation} className="space-y-4">
              <h4 className="text-xl font-bold text-foreground flex items-center gap-3">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                {regulation}
              </h4>
              {docs.map((doc) => (
                <Card
                  key={doc.id}
                  className="glass-panel shadow-elevated border-border/50 rounded-2xl overflow-hidden hover:shadow-blue hover:-translate-y-1 transition-all duration-300"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="font-bold text-foreground text-lg">
                              Version {doc.version}
                            </span>
                            {doc.document_type && doc.document_type !== 'Compliance Summary' && (
                              <Badge variant="outline" className="bg-secondary/30 text-foreground border-border/50 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                                {doc.document_type}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={
                                doc.status === 'current'
                                  ? "bg-gradient-to-r from-emerald-50 to-emerald-100/80 text-emerald-700 border-emerald-200/60 font-semibold px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                                  : doc.status === 'requires_regeneration'
                                  ? "bg-gradient-to-r from-red-50 to-red-100/80 text-red-700 border-red-200/60 font-semibold px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                                  : "bg-gradient-to-r from-amber-50 to-amber-100/80 text-amber-700 border-amber-200/60 font-semibold px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                              }
                            >
                              {doc.status === 'current' ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Current
                                </>
                              ) : doc.status === 'requires_regeneration' ? (
                                <>
                                  <RefreshCw className="h-4 w-4" />
                                  Requires Regeneration
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-4 w-4" />
                                  Outdated
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">
                            Generated: {new Date(doc.created_at).toLocaleString()}
                            {doc.ai_system_version && ` • System v${doc.ai_system_version}`}
                            {doc.risk_assessment_version && ` • Risk Assessment v${doc.risk_assessment_version}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(doc)}
                          className="border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 hover:shadow-md transition-all font-semibold rounded-xl px-4 py-2"
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadPDF(doc.id)}
                          className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:border-emerald-500/60 hover:shadow-md transition-all font-semibold rounded-xl px-4 py-2"
                          title="Download as PDF"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        {doc.status === 'outdated' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              setSelectedRegulation(doc.regulation_type);
                              setSelectedDocumentType(doc.document_type || 'Compliance Summary');
                              await handleGenerate();
                            }}
                            className="border-secondary/40 bg-secondary/30 text-foreground hover:bg-secondary/50 hover:border-primary/40 hover:shadow-md transition-all font-semibold rounded-xl px-4 py-2"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Regenerate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
