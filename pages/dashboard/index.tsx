"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { marked } from "marked";
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
  CheckCircle,
  XCircle,
  TrendingUp,
  Plus,
  Ban,
  FileText,
  Shield,
  Download,
  RefreshCw,
  LayoutDashboard,
  Layers,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Sidebar from "@/components/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";

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

interface ComplianceTest {
  id: string;
  risk_tier: string;
  compliance_status: string;
  prohibited_practices_detected: boolean;
  high_risk_all_fulfilled: boolean;
  high_risk_missing: string[];
  transparency_required: boolean;
  transparency_missing: string[];
  monitoring_required: boolean;
  post_market_monitoring: boolean;
  incident_reporting: boolean;
  fria_completed: boolean;
  summary: string;
  reference: string;
  created_at: string;
  has_detailed_check?: boolean; // <-- newly used flag from /api/compliance
}

interface MasAssessmentSummary {
  id: string;
  system_name?: string;
  sector?: string;
  overall_risk_level?: string;
  overall_compliance_status?: string;
  created_at?: string;
}

interface UkAssessmentSummary {
  id: string;
  risk_level?: string;
  overall_assessment?: string;
  sector_regulation?: { sector?: string };
  created_at?: string;
}

interface UnifiedAssessment {
  id: string;
  category: "EU AI Act" | "MAS" | "UK AI Act";
  name?: string;
  risk?: string;
  compliance_status?: string;
  sector?: string;
  created_at: string;
  has_detailed_check?: boolean;
  // EU-specific fields
  prohibited_practices_detected?: boolean;
  high_risk_all_fulfilled?: boolean;
  high_risk_missing?: string[];
  monitoring_required?: boolean;
  // Accountability fields
  accountability?: string;
  accountable_person?: string;
  raw_answers?: any;
  // Lifecycle governance
  lifecycle_stage?: string;
}

export default function ComplianceDashboard() {
  const router = useRouter();
  const [tests, setTests] = useState<ComplianceTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [mas, setMas] = useState<MasAssessmentSummary[]>([]);
  const [uk, setUk] = useState<UkAssessmentSummary[]>([]);
  const [shadowAIWarning, setShadowAIWarning] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<UnifiedAssessment | null>(null);
  const [systemDetails, setSystemDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [riskAssessments, setRiskAssessments] = useState<any[]>([]);
  const [loadingRiskAssessments, setLoadingRiskAssessments] = useState(false);
  const [documentation, setDocumentation] = useState<any[]>([]);
  const [loadingDocumentation, setLoadingDocumentation] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };
  const [automatedRiskAssessments, setAutomatedRiskAssessments] = useState<Map<string, { overall_risk_level: string; composite_score: number; assessed_at: string; approval_status?: string }>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [euRes, masRes, ukRes, discoveryRes] = await Promise.all([
          backendFetch("/api/compliance"),
          backendFetch("/api/mas-compliance"),
          backendFetch("/api/uk-compliance"),
          backendFetch("/api/discovery?shadow_status=confirmed"),
        ]);

        if (euRes.ok) {
          const data = await euRes.json();
          setTests(data || []);
        } else {
          setTests([]);
        }

        if (masRes.ok) {
          const data = await masRes.json();
          setMas(Array.isArray(data) ? data : []);
        } else {
          setMas([]);
        }

        if (ukRes.ok) {
          const data = await ukRes.json();
          setUk(Array.isArray(data) ? data : []);
        } else {
          setUk([]);
        }

        // Check for Shadow AI
        if (discoveryRes.ok) {
          const discoveryData = await discoveryRes.json();
          const confirmedShadowCount = discoveryData.stats?.confirmed_shadow || 0;
          if (confirmedShadowCount > 0) {
            setShadowAIWarning(`Unregistered AI usage detected: ${confirmedShadowCount} confirmed Shadow AI system${confirmedShadowCount !== 1 ? 's' : ''}. Compliance approvals may be blocked.`);
          }
        }

        // Fetch automated risk assessment data for all systems
        const allSystemIds = [
          ...tests.map(t => t.id),
          ...mas.map(m => m.id),
          ...uk.map(u => u.id),
        ];
        
        if (allSystemIds.length > 0) {
          // Fetch full assessment data for systems that have automated risk assessments
          const assessmentData = await Promise.all(
            allSystemIds.map(async (id) => {
              try {
                const res = await backendFetch(`/api/ai-systems/${id}/automated-risk-assessment`);
                if (res.ok) {
                  const data = await res.json();
                  return { id, data };
                }
                return null;
              } catch {
                return null;
              }
            })
          );
          
          const assessmentMap = new Map(
            assessmentData
              .filter((item): item is { id: string; data: any } => item !== null)
              .map(item => [item.id, {
                overall_risk_level: item.data.overall_risk_level,
                composite_score: item.data.composite_score,
                assessed_at: item.data.assessed_at,
                approval_status: item.data.approval_status
              }])
          );
          setAutomatedRiskAssessments(assessmentMap);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setTests([]);
        setMas([]);
        setUk([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper function to extract accountable person/role
  const getAccountablePerson = (assessment: any, category: string): string => {
    if (category === "EU AI Act") {
      // Get from accountable_person field or raw_answers.q10
      return assessment.accountable_person || assessment.raw_answers?.q10 || "Not specified";
    } else if (category === "UK AI Act") {
      // Get from accountable_person field or raw_answers.uk9
      return assessment.accountable_person || assessment.raw_answers?.uk9 || "Not specified";
    } else if (category === "MAS") {
      // MAS uses owner field
      return assessment.owner || "Not specified";
    }
    return "Not specified";
  };

  // Combine all assessments into unified structure
  const unifiedAssessments: UnifiedAssessment[] = [
    ...tests.map((t): UnifiedAssessment => ({
      id: t.id,
      category: "EU AI Act",
      name: (t as any).system_name,
      risk: t.risk_tier,
      compliance_status: t.compliance_status,
      created_at: t.created_at,
      has_detailed_check: t.has_detailed_check,
      prohibited_practices_detected: t.prohibited_practices_detected,
      high_risk_all_fulfilled: t.high_risk_all_fulfilled,
      high_risk_missing: t.high_risk_missing,
      monitoring_required: t.monitoring_required,
      raw_answers: (t as any).raw_answers,
      accountable_person: (t as any).accountable_person,
      accountability: getAccountablePerson(t, "EU AI Act"),
      lifecycle_stage: (t as any).lifecycle_stage || 'Draft',
    })),
    ...mas.map((m): UnifiedAssessment => ({
      id: m.id,
      category: "MAS",
      name: (m as any).system_name,
      risk: (m as any).overall_risk_level,
      compliance_status: (m as any).overall_compliance_status,
      sector: (m as any).sector,
      created_at: (m as any).created_at || new Date().toISOString(),
      accountability: getAccountablePerson(m, "MAS"),
      lifecycle_stage: (m as any).lifecycle_stage || 'Draft',
    })),
    ...uk.map((u): UnifiedAssessment => ({
      id: u.id,
      category: "UK AI Act",
      name: (u as any).system_name,
      risk: u.risk_level,
      compliance_status: u.overall_assessment,
      sector: u.sector_regulation?.sector,
      created_at: u.created_at || new Date().toISOString(),
      accountable_person: (u as any).accountable_person,
      accountability: getAccountablePerson(u, "UK AI Act"),
      lifecycle_stage: (u as any).lifecycle_stage || 'Draft',
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Stats - combined across all regulations
  const totalAssessments = unifiedAssessments.length;
  const prohibitedTests =
    unifiedAssessments.filter((a) => a.risk?.toLowerCase() === "prohibited").length || 0;
  const highRiskTests =
    unifiedAssessments.filter((a) => {
      const r = (a.risk || "").toLowerCase();
      return r === "high" || r === "critical" || r.includes("high-risk") || r.includes("frontier");
    }).length || 0;
  const failedTests =
    unifiedAssessments.filter((a) => 
      (a.compliance_status || "").toLowerCase().includes("non")
    ).length || 0;

  // Badges
  const getStatusBadge = (status: string, category?: string) => {
    if (!status) return <Badge className="bg-secondary/80 text-muted-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">Unknown</Badge>;
    const s = status.toLowerCase();
    
    // Color scheme based on AI Act
    const actColors = {
      "EU AI Act": {
        compliant: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        nonCompliant: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        partial: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      },
      "MAS": {
        compliant: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
        nonCompliant: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        partial: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      },
      "UK AI Act": {
        compliant: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
        nonCompliant: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        partial: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      },
    };
    
    const colors = actColors[category as keyof typeof actColors] || actColors["EU AI Act"];
    
    if (s.includes("pass") || (s.includes("compliant") && !s.includes("partial")))
      return (
        <Badge className={`${colors.compliant} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5`}>
          <CheckCircle className="w-3.5 h-3.5" /> {status}
        </Badge>
      );
    if (s.includes("fail") || s.includes("non"))
      return (
        <Badge className={`${colors.nonCompliant} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5`}>
          <XCircle className="w-3.5 h-3.5" /> {status}
        </Badge>
      );
    return (
      <Badge className={`${colors.partial} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5`}>
        <AlertTriangle className="w-3.5 h-3.5" /> {status}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string, category?: string) => {
    if (!risk) return <Badge className="bg-secondary/80 text-muted-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">Unknown</Badge>;
    const r = risk.toLowerCase();
    
    // Color scheme based on AI Act
    const actColors = {
      "EU AI Act": {
        prohibited: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        high: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        medium: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        low: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      },
      "MAS": {
        prohibited: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        high: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        medium: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        low: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
      },
      "UK AI Act": {
        prohibited: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        high: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        medium: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        low: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      },
    };
    
    const colors = actColors[category as keyof typeof actColors] || actColors["EU AI Act"];
    
    if (r === "prohibited")
      return (
        <Badge className={`${colors.prohibited} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5`}>
          <Ban className="w-3.5 h-3.5" /> Prohibited
        </Badge>
      );
    if (r === "high" || r.includes("high-risk"))
      return (
        <Badge className={`${colors.high} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-1.5`}>
          High Risk
        </Badge>
      );
    if (r === "medium" || r.includes("medium-risk"))
      return (
        <Badge className={`${colors.medium} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all`}>
          Medium Risk
        </Badge>
      );
    if (r === "low" || r.includes("low-risk"))
      return (
        <Badge className={`${colors.low} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all`}>
          Low Risk
        </Badge>
      );
    return <Badge className="bg-secondary/80 text-muted-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">{risk}</Badge>;
  };

  const getMasRiskBadge = (risk?: string) => {
    if (!risk) return <Badge className="bg-secondary/80 text-muted-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">Unknown</Badge>;
    const r = risk.toLowerCase();
    if (r === "critical" || r === "high")
      return <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-red-100 transition-all flex items-center gap-1.5">High</Badge>;
    if (r === "medium")
      return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-amber-100 transition-all">Medium</Badge>;
    return <Badge className="bg-purple-50 text-purple-700 border border-purple-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-purple-100 transition-all">Low</Badge>;
  };

  const getMasComplianceBadge = (status?: string) => {
    if (!status) return <Badge className="bg-secondary/80 text-muted-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">Unknown</Badge>;
    const s = status.toLowerCase();
    if (s.includes("compliant") && !s.includes("partial"))
      return <Badge className="bg-purple-50 text-purple-700 border border-purple-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-purple-100 transition-all">Compliant</Badge>;
    if (s.includes("partial"))
      return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-amber-100 transition-all">Partially compliant</Badge>;
    return <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-red-100 transition-all">Non-compliant</Badge>;
  };

  const getUkRiskBadge = (risk?: string) => {
    if (!risk) return <Badge className="bg-secondary/80 text-muted-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">Unknown</Badge>;
    const r = risk.toLowerCase();
    if (r.includes("frontier") || r.includes("high-risk"))
      return <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-red-100 transition-all flex items-center gap-1.5">High / Frontier</Badge>;
    if (r.includes("medium"))
      return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-amber-100 transition-all">Medium</Badge>;
    return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-emerald-100 transition-all">Low</Badge>;
  };

  const getUkComplianceBadge = (status?: string) => {
    if (!status) return <Badge className="bg-secondary/80 text-muted-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">Unknown</Badge>;
    const s = status.toLowerCase();
    if (s === "compliant")
      return <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-emerald-100 transition-all">Compliant</Badge>;
    if (s.includes("partial"))
      return <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-amber-100 transition-all">Partially compliant</Badge>;
    return <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-red-100 transition-all">Non-compliant</Badge>;
  };

  // Display accountable person/role as text instead of badge
  const renderAccountability = (accountablePerson?: string) => {
    if (!accountablePerson || accountablePerson === "Not specified") {
      return <span className="text-muted-foreground italic">Not specified</span>;
    }
    return <span className="text-foreground font-medium">{accountablePerson}</span>;
  };

  // Handle system click to show details
  const handleSystemClick = async (assessment: UnifiedAssessment) => {
    setSelectedSystem(assessment);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setSystemDetails(null);
    setRiskAssessments([]);
    setDocumentation([]);
  
    try {
      const [complianceRes, riskRes, docRes] = await Promise.all([
        backendFetch(`/api/ai-systems/${assessment.id}/compliance-data`),
        backendFetch(`/api/ai-systems/${assessment.id}/risk-assessments`),
        backendFetch(`/api/ai-systems/${assessment.id}/documentation`),
      ]);
  
      if (complianceRes.ok) {
        setSystemDetails(await complianceRes.json());
      }
  
      if (riskRes.ok) {
        setRiskAssessments(await riskRes.json());
      }
  
      if (docRes.ok) {
        const docData = await docRes.json();
        setDocumentation(docData.documentation || []);
      }
    } catch (error) {
      console.error("Error fetching system details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };
  

  // Handle document download as PDF
  const handleDownloadDocument = async (doc: any) => {
    try {
      // Convert markdown to HTML (await the async parse function)
      const htmlContent = await marked.parse(doc.content);
      
      // Create a temporary container with styled HTML
      // Use explicit hex colors to avoid html2canvas parsing issues with modern CSS color functions
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.padding = '25mm 20mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '11pt';
      tempDiv.style.lineHeight = '1.8';
      tempDiv.style.color = '#000000'; // Explicit black hex
      tempDiv.style.backgroundColor = '#ffffff'; // Explicit white hex
      tempDiv.style.boxSizing = 'border-box';
      
      // Enhanced HTML with better spacing and structure
      // All colors must be in hex format to avoid html2canvas parsing issues
      tempDiv.innerHTML = `
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body, div { background-color: #ffffff !important; color: #000000 !important; }
          h1 { font-size: 24pt; color: #1a1a1a !important; margin-bottom: 15px; margin-top: 0; font-weight: bold; }
          h2 { font-size: 18pt; color: #2a2a2a !important; margin-top: 25px; margin-bottom: 12px; font-weight: bold; border-bottom: 1px solid #dddddd; padding-bottom: 8px; }
          h3 { font-size: 14pt; color: #3a3a3a !important; margin-top: 20px; margin-bottom: 10px; font-weight: bold; }
          h4 { font-size: 12pt; color: #4a4a4a !important; margin-top: 18px; margin-bottom: 8px; font-weight: bold; }
          p { margin-bottom: 12px; margin-top: 0; text-align: justify; color: #000000 !important; }
          ul, ol { margin-top: 10px; margin-bottom: 15px; padding-left: 25px; }
          li { margin-bottom: 8px; line-height: 1.7; color: #000000 !important; }
          strong { font-weight: bold; color: #1a1a1a !important; }
          em { font-style: italic; }
          code { background-color: #f5f5f5 !important; color: #000000 !important; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 10pt; }
          pre { background-color: #f5f5f5 !important; color: #000000 !important; padding: 12px; border-radius: 5px; margin: 15px 0; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 10pt; line-height: 1.6; }
          blockquote { border-left: 4px solid #cccccc; padding-left: 15px; margin: 15px 0; color: #555555 !important; font-style: italic; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #dddddd; padding: 10px; text-align: left; color: #000000 !important; }
          th { background-color: #f5f5f5 !important; font-weight: bold; }
          hr { border: none; border-top: 1px solid #dddddd; margin: 20px 0; }
        </style>
        <div style="margin-bottom: 35px; border-bottom: 3px solid #333333; padding-bottom: 20px; background-color: #ffffff !important;">
          <h1 style="margin: 0 0 12px 0; font-size: 26pt; color: #1a1a1a !important; font-weight: bold;">${doc.regulation_type}</h1>
          <p style="margin: 0; color: #666666 !important; font-size: 11pt; line-height: 1.6;">
            <strong>Version:</strong> ${doc.version} &nbsp;|&nbsp; 
            <strong>Generated:</strong> ${new Date(doc.created_at).toLocaleString()}
            ${doc.document_type && doc.document_type !== 'Compliance Summary' ? ` &nbsp;|&nbsp; <strong>Type:</strong> ${doc.document_type}` : ''}
          </p>
        </div>
        <div style="margin-top: 25px; padding-top: 15px; background-color: #ffffff !important; color: #000000 !important;">
          ${htmlContent}
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      // Convert HTML to canvas with better settings
      // Use explicit hex background color and ignore external styles
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        ignoreElements: (element) => {
          // Ignore any elements that might have problematic styles
          return false;
        },
        onclone: (clonedDoc) => {
          // Ensure all styles are applied in the cloned document with explicit colors
          const clonedDiv = clonedDoc.querySelector('div');
          if (clonedDiv) {
            clonedDiv.style.width = '210mm';
            clonedDiv.style.padding = '25mm 20mm';
            clonedDiv.style.backgroundColor = '#ffffff';
            clonedDiv.style.color = '#000000';
          }
          // Remove any computed styles that might use modern color functions
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: any) => {
            if (el.style) {
              // Force explicit colors if they exist
              const computedStyle = window.getComputedStyle(el);
              if (computedStyle.backgroundColor && !computedStyle.backgroundColor.match(/^#[0-9a-fA-F]{3,6}$|^rgb/)) {
                el.style.backgroundColor = '#ffffff';
              }
              if (computedStyle.color && !computedStyle.color.match(/^#[0-9a-fA-F]{3,6}$|^rgb/)) {
                el.style.color = '#000000';
              }
            }
          });
        }
      });
      
      // Remove temporary element
      document.body.removeChild(tempDiv);
      
      // Create PDF with proper margins
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // Leave 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const margin = 10;
      let heightLeft = imgHeight;
      let position = margin;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 2 * margin);
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 2 * margin);
      }
      
      // Download PDF
      pdf.save(`${doc.regulation_type.replace(/\s+/g, '_')}_v${doc.version}_${doc.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      // Don't fallback to markdown - show error instead
      throw error;
    }
  };

  // Get lifecycle stage badge
  const getLifecycleBadge = (stage?: string) => {
    const s = (stage || 'Draft').toLowerCase();
    const variants: Record<string, string> = {
      draft: "bg-secondary/80 text-muted-foreground border-border/50",
      development: "bg-primary/10 text-primary border border-primary/30",
      testing: "bg-secondary/60 text-muted-foreground border border-border/50",
      deployed: "bg-primary/10 text-primary border border-primary/30",
      monitoring: "bg-accent/10 text-accent border border-accent/30",
      retired: "bg-secondary/60 text-muted-foreground border border-border/50",
    };
    return (
      <Badge className={`${variants[s] || variants.draft} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all`}>
        {stage || 'Draft'}
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
                  Compliance <span className="gradient-text">Dashboard</span>
                </h1>
                <p className="text-muted-foreground mt-3 text-lg font-medium">
                  Monitor and manage all AI compliance assessments across EU AI Act, MAS, and UK AI Act
                </p>
              </div>
            </div>
          </div>

          {/* Shadow AI Warning Banner */}
          {shadowAIWarning && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 glass-panel">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-700 font-semibold">{shadowAIWarning}</p>
                  <Button
                    variant="link"
                    className="text-red-600 hover:text-red-700 p-0 h-auto mt-1"
                    onClick={() => router.push("/discovery")}
                  >
                    View Discovery Dashboard →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-blue transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Total Assessments
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-foreground">
                  {loading ? "..." : totalAssessments}
                </div>
                <p className="text-xs text-muted-foreground mt-2">All assessments</p>
              </CardContent>
            </Card>

            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-red-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Prohibited / High Risk
                </CardTitle>
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <Ban className="h-5 w-5 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-red-500">
                  {loading ? "..." : prohibitedTests + highRiskTests}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Critical systems</p>
              </CardContent>
            </Card>

            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  High Risk
                </CardTitle>
                <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-orange-500">
                  {loading ? "..." : highRiskTests}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
              </CardContent>
            </Card>

            <Card className="glass-panel shadow-elevated border-border/50 hover:shadow-red-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Non-Compliant
                </CardTitle>
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-red-500">
                  {loading ? "..." : failedTests}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Action needed</p>
              </CardContent>
            </Card>
          </div>


          <div className="max-w-7xl mx-auto flex justify-end">
            <Button
              onClick={() => router.push("/assessment")}
              variant="hero"
              size="lg"
              className="flex items-center gap-2 rounded-xl"
            >
              <Plus className="w-5 h-5" />
              New Assessment
            </Button>
          </div>

          {/* Unified Assessments Table */}
          <Card className="glass-panel shadow-elevated border-border/50 w-full">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-2xl font-bold text-foreground">All Compliance Assessments</CardTitle>
              <CardDescription className="text-muted-foreground mt-1 text-base">
                Unified view of all AI compliance assessments across EU AI Act, MAS, and UK AI Act
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="ml-3 text-foreground font-medium">Loading assessments...</p>
                </div>
              ) : unifiedAssessments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-foreground font-medium">No assessments found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-b border-border">
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">AI Act</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Name</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Lifecycle</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Risk Tier</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Prohibited</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Obligations</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Monitoring</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Accountability</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Sector</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Date</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Detailed</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Risk Assessment</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Automated Risk</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Documentation</TableHead>
                        <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unifiedAssessments.map((assessment) => {
                        const getRiskBadgeForAssessment = () => {
                          if (assessment.category === "EU AI Act") {
                            return getRiskBadge(assessment.risk || "", "EU AI Act");
                          } else if (assessment.category === "MAS") {
                            return getMasRiskBadge(assessment.risk);
                          } else {
                            return getUkRiskBadge(assessment.risk);
                          }
                        };

                        const getComplianceBadgeForAssessment = () => {
                          if (assessment.category === "EU AI Act") {
                            return getStatusBadge(assessment.compliance_status || "", "EU AI Act");
                          } else if (assessment.category === "MAS") {
                            return getMasComplianceBadge(assessment.compliance_status);
                          } else {
                            return getUkComplianceBadge(assessment.compliance_status);
                          }
                        };

                        const getCategoryBadge = () => {
                          const colors = {
                            "EU AI Act": "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100",
                            "MAS": "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100",
                            "UK AI Act": "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100",
                          };
                          return (
                            <Badge className={`${colors[assessment.category]} font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all`}>
                              {assessment.category}
                            </Badge>
                          );
                        };

                        const handleViewDetails = () => {
                          if (assessment.category === "EU AI Act") {
                            router.push(`/compliance/${assessment.id}`);
                          } else if (assessment.category === "MAS") {
                            router.push(`/mas/${assessment.id}`);
                          } else {
                            router.push(`/uk/${assessment.id}`);
                          }
                        };

                        return (
                          <TableRow 
                            key={`${assessment.category}-${assessment.id}`} 
                            className="hover:bg-secondary/20 transition-colors duration-150 border-b border-border/30"
                          >
                            <TableCell 
                              className="py-4 cursor-pointer hover:bg-secondary/30 rounded"
                              onClick={() => handleSystemClick(assessment)}
                            >
                              {getCategoryBadge()}
                            </TableCell>
                            <TableCell 
                              className="font-semibold text-foreground py-4 cursor-pointer hover:bg-secondary/30 rounded"
                              onClick={() => handleSystemClick(assessment)}
                            >
                              {assessment.name || `ID: ${assessment.id.substring(0, 8)}...`}
                            </TableCell>
                            <TableCell className="py-4">
                              {assessment.category === 'EU AI Act' 
                                ? getLifecycleBadge(assessment.lifecycle_stage)
                                : <span className="text-muted-foreground text-sm">N/A</span>
                              }
                            </TableCell>
                            <TableCell>{getRiskBadgeForAssessment()}</TableCell>
                            <TableCell>{getComplianceBadgeForAssessment()}</TableCell>
                            <TableCell className="py-4">
                              {assessment.category === "EU AI Act" ? (
                                assessment.prohibited_practices_detected ? (
                                  <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-red-100 transition-all">Detected</Badge>
                                ) : (
                                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-blue-100 transition-all">None</Badge>
                                )
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              {assessment.category === "EU AI Act" ? (
                                assessment.high_risk_all_fulfilled ? (
                                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-blue-100 transition-all">Fulfilled</Badge>
                                ) : (
                                  <Badge className="bg-red-50 text-red-700 border border-red-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-red-100 transition-all">
                                    {(assessment.high_risk_missing || []).length} Missing
                                  </Badge>
                                )
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              {assessment.category === "EU AI Act" ? (
                                assessment.monitoring_required ? (
                                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md hover:bg-blue-100 transition-all">Monitoring Required</Badge>
                                ) : (
                                  <Badge className="bg-secondary/80 text-muted-foreground border-border/50 font-medium px-2.5 py-1 rounded-full shadow-sm hover:shadow-md transition-all">N/A</Badge>
                                )
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              {renderAccountability(assessment.accountability)}
                            </TableCell>
                            <TableCell className="text-foreground font-medium py-4">
                              {assessment.sector || <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground font-medium py-4">
                              {new Date(assessment.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="py-4">
                              {assessment.category === "EU AI Act" ? (
                                assessment.has_detailed_check ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 hover:shadow-md transition-all font-medium rounded-xl px-3 py-1.5"
                                    onClick={() => {
                                      console.log("🔍 Dashboard: Clicking detailed assessment for assessment:", assessment);
                                      console.log("🔍 Dashboard: assessment.id:", assessment.id);
                                      router.push(`/compliance/detailed/${assessment.id}`);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4" /> 
                                    <span>View Detailed</span>
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-md flex items-center gap-2 transition-all font-medium rounded-xl px-3 py-1.5"
                                    onClick={() => {
                                      console.log("🔍 Dashboard: Clicking detailed assessment for assessment:", assessment);
                                      console.log("🔍 Dashboard: assessment.id:", assessment.id);
                                      router.push(`/compliance/detailed/${assessment.id}`);
                                    }}
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>Run Detailed</span>
                                  </Button>
                                )
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-secondary/40 bg-secondary/30 text-foreground hover:bg-secondary/50 hover:border-primary/40 hover:shadow-md transition-all font-medium flex items-center gap-2 rounded-xl px-3 py-1.5"
                                onClick={() => router.push(`http://localhost:3000/ai-systems/${assessment.id}?tab=risk-assessments`)}
                              >
                                <AlertTriangle className="w-4 h-4" />
                                <span>Check Assessment</span>
                              </Button>
                            </TableCell>
                            <TableCell className="py-4">
                              {automatedRiskAssessments.has(assessment.id) ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 hover:shadow-md transition-all font-medium flex items-center gap-2 rounded-xl px-3 py-1.5"
                                  onClick={() => router.push(`http://localhost:3000/ai-systems/${assessment.id}/automated-risk-assessment`)}
                                >
                                  <Shield className="w-4 h-4" />
                                  <span>View Report</span>
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="bg-green-500/10 text-green-600 border border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 hover:shadow-md transition-all font-medium flex items-center gap-2 rounded-xl px-3 py-1.5 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/40 dark:hover:bg-green-500/30"
                                  onClick={() => router.push(`http://localhost:3000/ai-systems/${assessment.id}/automated-risk-assessment`)}
                                >
                                  <Shield className="w-4 h-4" />
                                  <span>Generate</span>
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 hover:shadow-md transition-all font-medium flex items-center gap-2 rounded-xl px-3 py-1.5"
                                onClick={() => router.push(`http://localhost:3000/ai-systems/${assessment.id}?tab=documentation`)}
                              >
                                <FileText className="w-4 h-4" />
                                <span>Generate</span>
                              </Button>
                            </TableCell>
                            <TableCell className="py-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-border/50 bg-secondary/30 text-foreground hover:bg-secondary/50 hover:border-primary/40 hover:shadow-md transition-all font-medium rounded-xl px-3 py-1.5"
                                onClick={handleViewDetails}
                              >
                                View details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Details Modal */}
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto glass-card shadow-premium rounded-2xl border-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl">
              <DialogHeader className="pb-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/30">
                      <Shield className="h-6 w-6 text-primary" />
        </div>
                    <div>
                      <DialogTitle className="text-3xl font-extrabold text-foreground">
                        AI System Details
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground mt-1.5 text-base">
                        Complete information about the selected AI system
                      </DialogDescription>
      </div>
    </div>
                  {selectedSystem && (() => {
                    const colors = {
                      "EU AI Act": "bg-blue-50 text-blue-700 border-blue-200 shadow-sm",
                      "MAS": "bg-purple-50 text-purple-700 border-purple-200 shadow-sm",
                      "UK AI Act": "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm",
                    };
                    return (
                      <Badge className={`${colors[selectedSystem.category]} font-bold px-4 py-1.5 text-sm border rounded-xl`}>
                        {selectedSystem.category}
                      </Badge>
                    );
                  })()}
                </div>
              </DialogHeader>

              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
                    <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
                  </div>
                  <p className="ml-3 text-muted-foreground mt-4 font-medium">Loading system details...</p>
                </div>
              ) : systemDetails && selectedSystem ? (
                <div className="space-y-6 mt-6">
                  {/* System Information */}
                  <Card className="glass-card shadow-premium rounded-2xl border-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl">
                    <CardHeader className="pb-4 border-b border-border/50">
                      <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/30">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        System Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">System Name</p>
                          <p className="text-foreground font-bold text-lg">{systemDetails.systemInfo?.name || selectedSystem.name || "Unnamed System"}</p>
                        </div>
                        <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">System ID</p>
                          <p className="text-foreground text-sm font-mono bg-secondary/50 px-2 py-1 rounded-xl border border-border inline-block">{selectedSystem.id}</p>
                        </div>
                        <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Regulation Type</p>
                          <Badge className="bg-primary/10 text-primary border-primary/30 border px-3 py-1 font-semibold rounded-xl">
                            {systemDetails.systemInfo?.type || selectedSystem.category}
                          </Badge>
                        </div>
                        <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Accountable Person</p>
                          <p className="text-foreground font-semibold">{systemDetails.systemInfo?.accountable_person || selectedSystem.accountability || "Not specified"}</p>
                        </div>
                        <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Created At</p>
                          <p className="text-foreground text-sm font-medium">
                            {new Date(systemDetails.systemInfo?.created_at || selectedSystem.created_at).toLocaleString()}
                          </p>
                        </div>
                        {selectedSystem.category === 'EU AI Act' && (
                          <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Lifecycle Stage</p>
                            {getLifecycleBadge(systemDetails.systemInfo?.lifecycle_stage || selectedSystem.lifecycle_stage)}
                          </div>
                        )}
                        {selectedSystem.sector && (
                          <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Sector</p>
                            <p className="text-foreground font-semibold">{selectedSystem.sector}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>


                  {/* Risk & Compliance Summary */}
                  <Card className="glass-card shadow-premium rounded-2xl border-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl">
                    <CardHeader className="pb-4 border-b border-border/50">
                      <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </div>
                        Risk & Compliance Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Risk Tier</p>
                          <div className="flex items-center">
                            {(() => {
                              if (selectedSystem.category === "EU AI Act") {
                                return getRiskBadge(selectedSystem.risk || "");
                              } else if (selectedSystem.category === "MAS") {
                                return getMasRiskBadge(selectedSystem.risk);
                              } else {
                                return getUkRiskBadge(selectedSystem.risk);
                              }
                            })()}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Compliance Status</p>
                          <div className="flex items-center">
                            {(() => {
                              if (selectedSystem.category === "EU AI Act") {
                                return getStatusBadge(selectedSystem.compliance_status || "");
                              } else if (selectedSystem.category === "MAS") {
                                return getMasComplianceBadge(selectedSystem.compliance_status);
                              } else {
                                return getUkComplianceBadge(selectedSystem.compliance_status);
                              }
                            })()}
                          </div>
                        </div>
                        {selectedSystem.category === "EU AI Act" && (
                          <>
                            <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Prohibited Practices</p>
                              {selectedSystem.prohibited_practices_detected ? (
                                <Badge className="bg-red-50 text-red-700 border-red-200 border px-3 py-1 font-semibold rounded-xl">Detected</Badge>
                              ) : (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border px-3 py-1 font-semibold rounded-xl">None</Badge>
                              )}
                            </div>
                            <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">High-Risk Obligations</p>
                              {selectedSystem.high_risk_all_fulfilled ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border px-3 py-1 font-semibold rounded-xl">All Fulfilled</Badge>
                              ) : (
                                <Badge className="bg-red-50 text-red-700 border-red-200 border px-3 py-1 font-semibold rounded-xl">
                                  {(selectedSystem.high_risk_missing || []).length} Missing
                                </Badge>
                              )}
                            </div>
                            {selectedSystem.monitoring_required && (
                              <div className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Monitoring</p>
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 border px-3 py-1 font-semibold rounded-xl">Required</Badge>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Compliance Details */}
                  {systemDetails.complianceData && (
                    <Card className="glass-card shadow-premium rounded-2xl border-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl">
                      <CardHeader className="pb-4 border-b border-border/50">
                        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/30">
                            <CheckCircle className="h-4 w-4 text-primary" />
                          </div>
                          Compliance Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {selectedSystem.category === "EU AI Act" && systemDetails.complianceData.eu && (
                          <div className="space-y-4">
                            {systemDetails.complianceData.eu.summary && (
                              <div className="p-4 rounded-xl glass-panel border border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Summary</p>
                                <p className="text-foreground text-sm leading-relaxed">{systemDetails.complianceData.eu.summary}</p>
                              </div>
                            )}
                            {systemDetails.complianceData.eu.reference && typeof systemDetails.complianceData.eu.reference === 'object' && (
                              <div className="p-4 rounded-xl glass-panel border border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Reference</p>
                                <div className="text-foreground text-sm space-y-2.5">
                                  {systemDetails.complianceData.eu.reference.riskTierBasis && (
                                    <div className="flex items-start gap-2">
                                      <span className="font-bold text-primary min-w-[140px]">Risk Tier Basis:</span>
                                      <span className="text-foreground">{systemDetails.complianceData.eu.reference.riskTierBasis}</span>
                                    </div>
                                  )}
                                  {systemDetails.complianceData.eu.reference.transparencyBasis && (
                                    <div className="flex items-start gap-2">
                                      <span className="font-bold text-primary min-w-[140px]">Transparency Basis:</span>
                                      <span className="text-foreground">{systemDetails.complianceData.eu.reference.transparencyBasis}</span>
                                    </div>
                                  )}
                                  {systemDetails.complianceData.eu.reference.missingObligations && Array.isArray(systemDetails.complianceData.eu.reference.missingObligations) && systemDetails.complianceData.eu.reference.missingObligations.length > 0 && (
                                    <div className="flex items-start gap-2">
                                      <span className="font-bold text-primary min-w-[140px]">Missing Obligations:</span>
                                      <span className="text-foreground">{systemDetails.complianceData.eu.reference.missingObligations.join(", ")}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {systemDetails.complianceData.eu.reference && typeof systemDetails.complianceData.eu.reference === 'string' && (
                              <div className="p-4 rounded-xl glass-panel border border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Reference</p>
                                <p className="text-foreground text-sm">{systemDetails.complianceData.eu.reference}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {selectedSystem.category === "MAS" && systemDetails.complianceData.mas && (
                          <div className="space-y-4">
                            {systemDetails.complianceData.mas.description && (
                              <div className="p-4 rounded-xl glass-panel border border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Description</p>
                                <p className="text-foreground text-sm leading-relaxed">{systemDetails.complianceData.mas.description}</p>
                              </div>
                            )}
                            {systemDetails.complianceData.mas.business_use_case && (
                              <div className="p-4 rounded-xl glass-panel border border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Business Use Case</p>
                                <p className="text-foreground text-sm leading-relaxed">{systemDetails.complianceData.mas.business_use_case}</p>
                              </div>
                            )}
                          </div>
                        )}
                        {selectedSystem.category === "UK AI Act" && systemDetails.complianceData.uk && (
                          <div className="space-y-4">
                            {systemDetails.complianceData.uk.summary && (
                              <div className="p-4 rounded-xl glass-panel border border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Summary</p>
                                <p className="text-foreground text-sm leading-relaxed">{systemDetails.complianceData.uk.summary}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Risk Assessments */}
                  <Card className="glass-card shadow-premium rounded-2xl border-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl">
                    <CardHeader className="pb-4 border-b border-border/50">
                      <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        Risk Assessments
                        <Badge className="ml-auto bg-secondary text-foreground border-border rounded-xl">
                          {riskAssessments.length} {riskAssessments.length === 1 ? 'Assessment' : 'Assessments'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {riskAssessments.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground text-sm">No risk assessments found</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {riskAssessments.slice(0, 3).map((assessment: any) => (
                            <div key={assessment.id} className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className={
                                      assessment.risk_level === 'high'
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : assessment.risk_level === 'medium'
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }>
                                      {assessment.risk_level?.charAt(0).toUpperCase() + assessment.risk_level?.slice(1) || 'Unknown'}
                                    </Badge>
                                    <Badge variant="outline" className="bg-secondary text-foreground border-border text-xs rounded-xl">
                                      {assessment.category || 'General'}
                                    </Badge>
                                    <Badge variant="outline" className={
                                      assessment.status === 'approved'
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : assessment.status === 'submitted'
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-secondary text-foreground border-border"
                                    }>
                                      {assessment.status || 'Draft'}
                                    </Badge>
                                  </div>
                                  {assessment.summary && (
                                    <p className="text-foreground text-sm line-clamp-2">{assessment.summary}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(assessment.assessed_at || assessment.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {riskAssessments.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                              +{riskAssessments.length - 3} more assessment{riskAssessments.length - 3 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Documentation */}
                  <Card className="glass-card shadow-premium rounded-2xl border-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl">
                    <CardHeader className="pb-4 border-b border-border/50">
                      <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/30">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        Documentation
                        <Badge className="ml-auto bg-secondary text-foreground border-border rounded-xl">
                          {documentation.length} {documentation.length === 1 ? 'Document' : 'Documents'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {documentation.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm mb-2">No documentation generated yet</p>
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={() => {
                              setShowDetailsModal(false);
                              router.push(`/ai-systems/${selectedSystem.id}?tab=documentation`);
                            }}
                            className="mt-2 rounded-xl"
                          >
                            Generate Documentation
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {documentation.slice(0, 3).map((doc: any) => (
                            <div key={doc.id} className="p-4 rounded-xl glass-panel border border-border/50 hover:border-primary/30 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-foreground">
                                      Version {doc.version}
                                    </span>
                                    <Badge className={
                                      doc.status === 'current'
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : doc.status === 'requires_regeneration'
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                    }>
                                      {doc.status === 'current' ? 'Current' : doc.status === 'requires_regeneration' ? 'Requires Regeneration' : 'Outdated'}
                                    </Badge>
                                    {doc.document_type && doc.document_type !== 'Compliance Summary' && (
                                      <Badge variant="outline" className="bg-secondary text-foreground border-border text-xs rounded-xl">
                                        {doc.document_type}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-foreground text-sm font-medium mb-1">{doc.regulation_type}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Generated: {new Date(doc.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadDocument(doc)}
                                  className="border-green-500/50 bg-green-500/10 text-green-700 hover:bg-green-500/20 ml-3 rounded-xl"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {documentation.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">
                              +{documentation.length - 3} more document{documentation.length - 3 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-border/50">
                    <Button
                      onClick={() => {
                        setShowDetailsModal(false);
                        router.push(`http://localhost:3000/ai-systems/${selectedSystem.id}`);
                      }}
                      variant="hero"
                      className="rounded-xl"
                    >
                      View Full Details
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDetailsModal(false);
                        if (selectedSystem.category === "EU AI Act") {
                          router.push(`/compliance/${selectedSystem.id}`);
                        } else if (selectedSystem.category === "MAS") {
                          router.push(`/mas/${selectedSystem.id}`);
                        } else {
                          router.push(`/uk/${selectedSystem.id}`);
                        }
                      }}
                      className="rounded-xl"
                    >
                      View Compliance
                    </Button>
                    {documentation.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDetailsModal(false);
                          router.push(`http://localhost:3000/ai-systems/${selectedSystem.id}?tab=documentation`);
                        }}
                        className="rounded-xl"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View All Docs
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Failed to load system details</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
