"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, CheckCircle2, XCircle, AlertTriangle, FileText, ExternalLink } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";
import { backendFetch } from "@/utils/backend-fetch";
import Head from 'next/head';

type JurisdictionResult = {
  id: "UK" | "EU" | "MAS";
  name: string;
  assessmentId?: string;
  data?: any;
  error?: string;
  loading: boolean;
};

export default function MultiJurisdictionResultsPage() {
  const router = useRouter();
  const { systemId } = router.query;

  const [jurisdictionResults, setJurisdictionResults] = useState<JurisdictionResult[]>([]);
  const [systemData, setSystemData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 [MULTI-RESULTS] Page loaded`);
  console.log(`   System ID: ${systemId}`);
  console.log(`${'='.repeat(80)}\n`);

  // Load system data and determine which jurisdictions to fetch
  useEffect(() => {
    // Normalize systemId - handle array case from Next.js router
    const normalizedSystemId = Array.isArray(systemId) ? systemId[0] : systemId;
    
    if (!normalizedSystemId) {
      console.warn(`⚠️  [MULTI-RESULTS] No systemId provided`);
      return;
    }

    const loadResults = async () => {
      try {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🔄 [MULTI-RESULTS] Starting to load results`);
        console.log(`   System ID (raw): ${systemId}`);
        console.log(`   System ID (normalized): ${normalizedSystemId}`);
        console.log(`   System ID type: ${typeof normalizedSystemId}`);
        console.log(`${'='.repeat(80)}\n`);

        setLoading(true);
        setError(null);

        // Fetch system data to determine which jurisdictions are selected
        const { data: systemDataResult, error: systemError } = await supabase
          .from("ai_systems")
          .select("*")
          .eq("id", normalizedSystemId)
          .single();

        if (systemError) {
          console.error(`❌ [MULTI-RESULTS] Error loading system data:`, systemError);
          throw new Error(`Failed to load system data: ${systemError.message}`);
        }

        console.log(`✅ [MULTI-RESULTS] System data loaded:`, {
          system_name: systemDataResult?.system_name,
          data_processing_locations: systemDataResult?.data_processing_locations,
        });

        setSystemData(systemDataResult);

        const dataProcessingLocations = systemDataResult?.data_processing_locations || [];
        const jurisdictions: JurisdictionResult[] = [];

        // Determine which jurisdictions to fetch
        if (dataProcessingLocations.includes("United Kingdom") || dataProcessingLocations.includes("UK")) {
          jurisdictions.push({ id: "UK", name: "United Kingdom", loading: true });
        }
        if (
          dataProcessingLocations.includes("European Union") ||
          dataProcessingLocations.includes("EU") ||
          dataProcessingLocations.some((loc: string) =>
            [
              "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
              "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
              "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
              "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
              "Slovenia", "Spain", "Sweden",
            ].some((c) => c.toLowerCase() === loc.toLowerCase())
          )
        ) {
          jurisdictions.push({ id: "EU", name: "European Union", loading: true });
        }
        if (dataProcessingLocations.includes("Singapore")) {
          jurisdictions.push({ id: "MAS", name: "Singapore (MAS)", loading: true });
        }

        console.log(`📋 [MULTI-RESULTS] Jurisdictions to fetch:`, jurisdictions.map((j) => j.id));

        setJurisdictionResults(jurisdictions);

        // Fetch results for each jurisdiction in parallel
        const fetchPromises = jurisdictions.map(async (jurisdiction) => {
          try {
            console.log(`\n${'='.repeat(80)}`);
            console.log(`🔄 [MULTI-RESULTS] Fetching ${jurisdiction.id} results`);
            console.log(`   System ID: ${normalizedSystemId}`);
            console.log(`${'='.repeat(80)}\n`);

            let result;
            if (jurisdiction.id === "UK") {
              const res = await backendFetch(`/api/uk-compliance`);
              if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch UK results: ${res.status}`);
              }
              const data = await res.json();
              // Find the assessment for this systemId
              result = Array.isArray(data) ? data.find((item: any) => {
                const itemSystemId = item.system_id ? String(item.system_id).trim() : null;
                const itemId = item.id ? String(item.id).trim() : null;
                const targetSystemId = normalizedSystemId ? String(normalizedSystemId).trim() : null;
                return itemSystemId === targetSystemId || itemId === targetSystemId;
              }) : null;
              console.log(`✅ [MULTI-RESULTS] UK results fetched:`, result ? "Found" : "Not found");
            } else if (jurisdiction.id === "MAS") {
              const res = await backendFetch(`/api/mas-compliance`);
              if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch MAS results: ${res.status}`);
              }
              const data = await res.json();
              console.log(`🔍 [MULTI-RESULTS] MAS API returned ${Array.isArray(data) ? data.length : 0} assessments`);
              console.log(`🔍 [MULTI-RESULTS] Looking for systemId: ${normalizedSystemId} (type: ${typeof normalizedSystemId})`);
              if (Array.isArray(data) && data.length > 0) {
                console.log(`🔍 [MULTI-RESULTS] All MAS assessments:`, data.map((item: any) => ({
                  id: item.id,
                  system_id: item.system_id,
                  system_id_type: typeof item.system_id,
                  system_name: item.system_name,
                  created_at: item.created_at
                })));
              }
              // Find the assessment for this systemId - try multiple matching strategies
              result = Array.isArray(data) ? data.find((item: any) => {
                // Normalize both values to strings for comparison
                const itemSystemId = item.system_id ? String(item.system_id).trim() : null;
                const itemId = item.id ? String(item.id).trim() : null;
                const targetSystemId = normalizedSystemId ? String(normalizedSystemId).trim() : null;
                
                // Try exact match first
                if (itemSystemId === targetSystemId || itemId === targetSystemId) {
                  console.log(`✅ [MULTI-RESULTS] MAS match found:`, { itemSystemId, itemId, targetSystemId });
                  return true;
                }
                // Try case-insensitive comparison
                if (itemSystemId && targetSystemId && itemSystemId.toLowerCase() === targetSystemId.toLowerCase()) {
                  console.log(`✅ [MULTI-RESULTS] MAS match found (case-insensitive):`, { itemSystemId, targetSystemId });
                  return true;
                }
                return false;
              }) : null;
              console.log(`✅ [MULTI-RESULTS] MAS results fetched:`, result ? `Found (ID: ${result.id}, system_id: ${result.system_id})` : "Not found");
              if (!result && Array.isArray(data) && data.length > 0) {
                const allSystemIds = data.map((item: any) => item.system_id).filter(Boolean);
                console.log(`⚠️ [MULTI-RESULTS] MAS assessment not found. Looking for: ${normalizedSystemId}`);
                console.log(`⚠️ [MULTI-RESULTS] Available system_ids in database:`, allSystemIds);
                console.log(`⚠️ [MULTI-RESULTS] Available assessment IDs:`, data.map((item: any) => item.id));
              }
            } else if (jurisdiction.id === "EU") {
              // For EU, we need to fetch by system_id
              const res = await backendFetch(`/api/compliance`);
              if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to fetch EU results: ${res.status}`);
              }
              const data = await res.json();
              // Find the assessment for this systemId
              result = Array.isArray(data) ? data.find((item: any) => {
                const itemSystemId = item.system_id ? String(item.system_id).trim() : null;
                const itemId = item.id ? String(item.id).trim() : null;
                const targetSystemId = normalizedSystemId ? String(normalizedSystemId).trim() : null;
                return itemSystemId === targetSystemId || itemId === targetSystemId;
              }) : null;
              console.log(`✅ [MULTI-RESULTS] EU results fetched:`, result ? "Found" : "Not found");
            }

            return {
              ...jurisdiction,
              data: result,
              assessmentId: result?.id,
              loading: false,
            };
          } catch (err: any) {
            console.error(`❌ [MULTI-RESULTS] Error fetching ${jurisdiction.id} results:`, err);
            return {
              ...jurisdiction,
              error: err.message || `Failed to load ${jurisdiction.name} results`,
              loading: false,
            };
          }
        });

        const results = await Promise.all(fetchPromises);
        console.log(`\n${'='.repeat(80)}`);
        console.log(`✅ [MULTI-RESULTS] All results loaded`);
        console.log(`   Total jurisdictions: ${results.length}`);
        results.forEach((r) => {
          console.log(`   ${r.id}: ${r.data ? "✅ Found" : r.error ? `❌ Error: ${r.error}` : "⏳ Loading"}`);
        });
        console.log(`${'='.repeat(80)}\n`);

        setJurisdictionResults(results);
        setLoading(false);
      } catch (err: any) {
        console.error(`\n${'='.repeat(80)}`);
        console.error(`❌ [MULTI-RESULTS] Critical error:`, err);
        console.error(`   Message: ${err.message}`);
        console.error(`   Stack: ${err.stack}`);
        console.error(`${'='.repeat(80)}\n`);
        setError(err.message || "Failed to load results");
        setLoading(false);
      }
    };

    loadResults();
  }, [systemId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar />
        <div className="lg:pl-72 pt-24 p-8">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">Loading compliance results...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Sidebar />
        <div className="lg:pl-72 pt-24 p-8">
          <div className="container mx-auto max-w-5xl">
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/dashboard")} className="mt-4" variant="outline">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = jurisdictionResults.filter((r) => r.data && !r.error).length;
  const totalCount = jurisdictionResults.length;

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Multi-Jurisdiction Compliance Results</title>
        <meta name="description" content="View compliance assessment results across multiple jurisdictions." />
      </Head>
      <Sidebar />
      <div className="lg:pl-72 pt-24 p-8">
        <div className="container mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <Card className="glass-panel shadow-elevated">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Multi-Jurisdiction Compliance Results
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {systemData?.system_name || "System"} - Assessment Results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant={completedCount === totalCount ? "default" : "secondary"}>
                  {completedCount} of {totalCount} assessments completed
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Jurisdiction Results */}
          {jurisdictionResults.map((jurisdiction) => (
            <Card key={jurisdiction.id} className="glass-panel shadow-elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {jurisdiction.loading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : jurisdiction.data ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : jurisdiction.error ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <CardTitle className="text-foreground">{jurisdiction.name} Assessment</CardTitle>
                  </div>
                  {jurisdiction.assessmentId && (
                    <Badge variant="outline">ID: {jurisdiction.assessmentId}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {jurisdiction.loading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading results...</span>
                  </div>
                ) : jurisdiction.error ? (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{jurisdiction.error}</AlertDescription>
                  </Alert>
                ) : jurisdiction.data ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {jurisdiction.id === "UK" && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Risk Level</p>
                            <p className="text-lg font-semibold text-foreground">
                              {jurisdiction.data.risk_level || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Overall Assessment</p>
                            <p className="text-lg font-semibold text-foreground">
                              {jurisdiction.data.overall_assessment || "N/A"}
                            </p>
                          </div>
                        </>
                      )}
                      {jurisdiction.id === "MAS" && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Risk Level</p>
                            <p className="text-lg font-semibold text-foreground">
                              {jurisdiction.data.overall_risk_level || jurisdiction.data.risk_classification || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Compliance Status</p>
                            <p className="text-lg font-semibold text-foreground">
                              {jurisdiction.data.overall_compliance_status || jurisdiction.data.compliance_status || "N/A"}
                            </p>
                          </div>
                        </>
                      )}
                      {jurisdiction.id === "EU" && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">Risk Tier</p>
                            <p className="text-lg font-semibold text-foreground">
                              {jurisdiction.data.risk_tier || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Compliance Status</p>
                            <p className="text-lg font-semibold text-foreground">
                              {jurisdiction.data.compliance_status || "N/A"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => {
                          if (jurisdiction.id === "UK") {
                            router.push(`/uk/${jurisdiction.assessmentId}`);
                          } else if (jurisdiction.id === "MAS") {
                            router.push(`/mas/${jurisdiction.assessmentId}`);
                          } else {
                            router.push(`/compliance/${jurisdiction.assessmentId}`);
                          }
                        }}
                        variant="default"
                        className="rounded-xl"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Full Report
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No Results Found</AlertTitle>
                    <AlertDescription>
                      No assessment results found for {jurisdiction.name}. The assessment may not be completed yet.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Back Button */}
          <div className="flex justify-end">
            <Button onClick={() => router.push("/dashboard")} variant="outline" className="rounded-xl">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

