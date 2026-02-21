"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Info,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import type { ComplianceDocumentation } from "@/types/documentation";
import { toast } from "sonner";

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

interface DocumentationTabProps {
  systemId: string;
  systemType: "EU AI Act" | "MAS" | "UK AI Act" | null;
}

function statusClasses(status: string): string {
  if (status === "current") return "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]";
  if (status === "outdated") return "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]";
  if (status === "requires_regeneration") return "border-[#F1A4A4] bg-[#FFE0E0] text-[#C71F1F]";
  return "border-[#CBD5E1] bg-[#F1F5F9] text-[#64748B]";
}

function statusIcon(status: string) {
  if (status === "current") return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (status === "outdated") return <AlertCircle className="h-3.5 w-3.5" />;
  if (status === "requires_regeneration") return <RefreshCw className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
}

export default function DocumentationTab({ systemId, systemType }: DocumentationTabProps) {
  const [documentation, setDocumentation] = useState<ComplianceDocumentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegulation, setSelectedRegulation] = useState<string>("");
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("Compliance Summary");
  const [selectedDoc, setSelectedDoc] = useState<ComplianceDocumentation | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const availableRegulations = systemType ? [systemType] : ["EU AI Act", "UK AI Act", "MAS"];

  const allDocumentTypes = [
    "Compliance Summary",
    "AI System Card",
    "Technical Documentation",
    "Data Protection Impact Assessment",
    "Risk Assessment Report",
    "Algorithm Impact Assessment",
    "Audit Trail",
  ];
  const documentTypes = systemType === "EU AI Act" ? allDocumentTypes.filter((t) => t !== "Algorithm Impact Assessment") : allDocumentTypes;

  useEffect(() => {
    fetchDocumentation();
  }, [systemId]);

  useEffect(() => {
    if (systemType === "EU AI Act" && selectedDocumentType === "Algorithm Impact Assessment") {
      setSelectedDocumentType("Compliance Summary");
    }
  }, [systemType, selectedDocumentType]);

  const fetchDocumentation = async () => {
    try {
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
          document_type: selectedDocumentType,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 403 && err.prohibited_system) {
          setError(err.error || "Cannot generate documentation for prohibited systems.");
          setGenerating(false);
          return;
        }
        throw new Error(err.error || "Failed to generate documentation");
      }

      await fetchDocumentation();
      toast.success("Document generated successfully");
      setSelectedRegulation("");
    } catch (err: any) {
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
        toast.error("Not authenticated");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documentation/${docId}/pdf`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

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
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("PDF download failed");
    }
  };

  const handleView = async (doc: ComplianceDocumentation) => {
    setSelectedDoc(doc);

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        return;
      }

      const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documentation/${doc.id}/pdf`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (pdfResponse.ok) {
        const blob = await pdfResponse.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      }
    } catch (error) {
      console.error("Error loading PDF for view:", error);
    }
  };

  const handleCloseView = () => {
    setSelectedDoc(null);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const docsByRegulation = documentation.reduce((acc, doc) => {
    if (!acc[doc.regulation_type]) {
      acc[doc.regulation_type] = [];
    }
    acc[doc.regulation_type].push(doc);
    return acc;
  }, {} as Record<string, ComplianceDocumentation[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
        <p className="ml-3 text-[15px] text-[#667085]">Loading documentation...</p>
      </div>
    );
  }

  if (selectedDoc) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div>
            <h3 className="text-[20px] font-bold text-[#1E293B]">
              {selectedDoc.regulation_type} - Version {selectedDoc.version}
            </h3>
            <p className="mt-1 text-[13px] text-[#667085]">Generated: {new Date(selectedDoc.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCloseView}
              className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] bg-white px-4 text-[14px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-all"
            >
              <X className="h-4 w-4" />
              Close
            </button>
            <button
              type="button"
              onClick={() => handleDownloadPDF(selectedDoc.id)}
              className="flex h-9 items-center gap-2 rounded-[10px] bg-[#3B82F6] px-4 text-[14px] font-semibold text-white shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
          {pdfUrl ? (
            <div className="w-full bg-[#F1F5F9]" style={{ minHeight: "600px", height: "calc(100vh - 350px)" }}>
              <object data={`${pdfUrl}#toolbar=0&navpanes=0`} type="application/pdf" className="h-full w-full" style={{ minHeight: "600px" }}>
                <div className="flex h-full items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-[#667085] mb-4">PDF cannot be displayed in your browser.</p>
                    <button
                      type="button"
                      onClick={() => handleDownloadPDF(selectedDoc.id)}
                      className="flex items-center gap-2 rounded-[10px] bg-[#3B82F6] px-5 py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all mx-auto"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF to View
                    </button>
                  </div>
                </div>
              </object>
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ height: "600px" }}>
              <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {documentation.length === 0 && (
        <div className="flex items-center gap-3 rounded-[10px] border border-[#93C5FD] bg-[#EFF6FF] px-4 py-3">
          <Info className="h-5 w-5 flex-shrink-0 text-[#3B82F6]" />
          <p className="text-[13px] text-[#1E40AF]">
            Documentation is automatically generated when you create an assessment. If you don't see it yet, it may still be generating in the
            background. Use the Refresh button to check for new documentation.
          </p>
        </div>
      )}

      <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <div>
            <h2 className="text-[17px] font-bold text-[#1E293B]">Generate Compliance Documentation</h2>
            <p className="mt-1 text-[12px] text-[#667085]">Generate automated compliance documentation based on system data and approved risk assessments</p>
          </div>
          <button
            type="button"
            onClick={fetchDocumentation}
            disabled={loading}
            className="flex h-9 items-center gap-2 rounded-[10px] border border-[#CBD5E1] bg-white px-4 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div
              className={`mb-6 rounded-[10px] border px-4 py-3 ${
                error.toLowerCase().includes("prohibited") ? "border-[#F2CD69] bg-[#FFF3CF]" : "border-[#F1A4A4] bg-[#FFE0E0]"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className={`h-5 w-5 flex-shrink-0 ${error.toLowerCase().includes("prohibited") ? "text-[#A97B00]" : "text-[#C71F1F]"}`} />
                <div>
                  <p className={`text-[13px] font-semibold ${error.toLowerCase().includes("prohibited") ? "text-[#A97B00]" : "text-[#C71F1F]"}`}>
                    {error.toLowerCase().includes("prohibited") ? "Prohibited System" : "Error"}
                  </p>
                  <p className={`mt-1 text-[12px] ${error.toLowerCase().includes("prohibited") ? "text-[#92700C]" : "text-[#991B1B]"}`}>
                    {error.toLowerCase().includes("prohibited")
                      ? "This system has been classified as 'Prohibited' under the EU AI Act. Documentation cannot be generated for prohibited systems."
                      : error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[12px] font-semibold text-[#64748B]">Regulation Type</label>
              <div className="relative">
                <select
                  value={selectedRegulation}
                  onChange={(e) => setSelectedRegulation(e.target.value)}
                  className="h-11 w-full appearance-none rounded-[10px] border border-[#CBD5E1] bg-white px-4 pr-10 text-[14px] text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  <option value="">Select regulation</option>
                  {availableRegulations.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-semibold text-[#64748B]">Document Type</label>
              <div className="relative">
                <select
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value)}
                  className="h-11 w-full appearance-none rounded-[10px] border border-[#CBD5E1] bg-white px-4 pr-10 text-[14px] text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!selectedRegulation || generating}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#3B82F6] text-[15px] font-semibold text-white shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                Generate Documentation
              </>
            )}
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4 border-b border-[#E2E8F0] pb-3">
          <h3 className="text-[18px] font-bold text-[#1E293B]">Generated Documentation</h3>
        </div>

        {documentation.length === 0 ? (
          <div className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white py-12 text-center shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10),0px_1.7px_3.5px_-1.75px_rgba(23,23,23,0.06)]">
            <FileText className="mx-auto h-12 w-12 text-[#CBD5E1]" />
            <p className="mt-3 text-[15px] font-medium text-[#667085]">No documentation generated yet</p>
            <p className="mt-1 text-[13px] text-[#94A3B8]">Use the form above to generate compliance documentation</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(docsByRegulation).map(([regulation, docs]) => (
              <div key={regulation}>
                <h4 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-[#1E293B]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                  {regulation}
                </h4>
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <article
                      key={doc.id}
                      className="overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white p-4 shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#EAF4FF]">
                            <FileText className="h-5 w-5 text-[#3B82F6]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-bold text-[#1E293B]">Version {doc.version}</span>
                              {doc.document_type && doc.document_type !== "Compliance Summary" && (
                                <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[11px] font-semibold text-[#64748B]">{doc.document_type}</span>
                              )}
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusClasses(doc.status)}`}>
                                {statusIcon(doc.status)}
                                {doc.status === "current" ? "Current" : doc.status === "outdated" ? "Outdated" : "Regenerate"}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[12px] text-[#667085]">
                              Generated: {new Date(doc.created_at).toLocaleString()}
                              {doc.ai_system_version && ` • System v${doc.ai_system_version}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleView(doc)}
                            className="flex items-center gap-1.5 rounded-[8px] border border-[#3B82F6]/40 bg-[#3B82F6]/5 px-3 py-1.5 text-[12px] font-semibold text-[#3B82F6] hover:bg-[#3B82F6]/10 hover:border-[#3B82F6]/60 transition-all"
                          >
                            View
                          </button>
                          {doc.status === "outdated" && (
                            <button
                              type="button"
                              onClick={async () => {
                                setSelectedRegulation(doc.regulation_type);
                                setSelectedDocumentType(doc.document_type || "Compliance Summary");
                                await handleGenerate();
                              }}
                              className="flex items-center gap-1.5 rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-all"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Regenerate
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
