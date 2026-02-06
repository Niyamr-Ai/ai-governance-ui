"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, RadialBarChart, RadialBar } from "recharts";
import { CheckCircle2, XCircle, Shield, Database, FileText, Eye, Lock, ClipboardCheck, TrendingUp, AlertTriangle, ArrowLeft } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { supabase } from "@/utils/supabase/client";

const getStatusClasses = (fulfilled: boolean) => {
  return fulfilled 
    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
    : "bg-red-50 text-red-700 border-red-200";
};

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

const getStatusIcon = (fulfilled: boolean) => {
  return fulfilled 
    ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> 
    : <XCircle className="h-5 w-5 text-red-600" />;
};

const getStatusText = (fulfilled: boolean) => {
  return fulfilled ? "Fulfilled" : "Not Fulfilled";
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Risk Management": Shield,
  "Data Governance": Database,
  "Technical Documentation": FileText,
  "Transparency & Human Oversight": Eye,
  "Security & Robustness": Lock,
  "Conformity Assessment": ClipboardCheck,
};

export default function DetailedViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  console.log("🔍 Detailed view page: params:", params);
  console.log("🔍 Detailed view page: extracted id:", id);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await backendFetch(`/api/compliance/detailed?id=${id}`);
        if (res.status === 404) {
          // 404 means detailed assessment doesn't exist yet - this is expected, not an error
          setResult(null);
          setError(null);
        } else if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.statusText}`);
        } else {
        const data = await res.json();
        setResult(data);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error fetching compliance result");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <Sidebar onLogout={handleLogout} />
        <div className={`text-center ${isLoggedIn ? 'lg:pl-72 pt-24' : ''}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-foreground mt-4">Loading compliance results...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <Sidebar onLogout={handleLogout} />
        <Card className={`max-w-md glass-panel border-red-200 ${isLoggedIn ? 'lg:ml-72' : ''}`}>
          <CardHeader>
            <CardTitle className="text-red-700">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!result && !error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <Sidebar onLogout={handleLogout} />
        <Card className={`max-w-md glass-panel border-border/50 shadow-elevated ${isLoggedIn ? 'lg:ml-72' : ''}`}>
          <CardHeader>
            <CardTitle className="text-foreground">Detailed Assessment Not Found</CardTitle>
            <CardDescription className="text-muted-foreground">
              A detailed compliance assessment has not been created for this basic compliance check yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You can create a detailed assessment by filling out the detailed compliance form.
            </p>
            <Button
              onClick={() => router.push(`/compliance/detailed?id=${id}`)}
              variant="hero"
              className="w-full rounded-xl"
            >
              Create Detailed Assessment
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/compliance/${id}`)}
              className="w-full rounded-xl border-border/50"
            >
              View Basic Compliance
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const categories = [
    {
      title: "Risk Management",
      fulfilled: result.riskmanagement_fulfilled,
      details: [
        { label: "Risk Management System in Place", value: result.riskmanagement_details_system_in_place },
        { label: "Risk Analysis Capability", value: result.riskmanagement_details_risk_analysis },
        { label: "Misuse Mitigation Measures", value: result.riskmanagement_details_misuse_mitigation },
      ],
    },
    {
      title: "Data Governance",
      fulfilled: result.datagovernance_fulfilled,
      details: [
        { label: "Data Quality Assurance", value: result.datagovernance_details_data_quality },
        { label: "Bias Mitigation Measures", value: result.datagovernance_details_bias_mitigation },
        { label: "Contextual Relevance", value: result.datagovernance_details_contextual_relevance },
      ],
    },
    {
      title: "Technical Documentation",
      fulfilled: result.documentation_fulfilled,
      details: [
        { label: "Documentation Exists", value: result.documentation_details_documentation_exists },
        { label: "Logging Capability", value: result.documentation_details_logging_capability },
        { label: "Logged Events", value: result.documentation_details_logged_events },
      ],
    },
    {
      title: "Transparency & Human Oversight",
      fulfilled: result.transparency_fulfilled,
      details: [
        { label: "System Explanation", value: result.transparency_details_system_explanation },
        { label: "Oversight Measures", value: result.transparency_details_oversight_measures },
        { label: "Instructions of Use", value: result.transparency_details_instructions_of_use },
      ],
    },
    {
      title: "Security & Robustness",
      fulfilled: result.security_fulfilled,
      details: [
        { label: "Performance Levels", value: result.security_details_performance_levels },
        { label: "Resilience Measures", value: result.security_details_resilience_measures },
        { label: "Cybersecurity Controls", value: result.security_details_cybersecurity_controls },
      ],
    },
    {
      title: "Conformity Assessment",
      fulfilled: result.conformity_fulfilled,
      details: [
        { label: "Assessment Completed", value: result.conformity_details_assessment_completed },
        { label: "Quality Management", value: result.conformity_details_quality_management },
        { label: "Deployer Assessment", value: result.conformity_details_deployer_assessment },
      ],
    },
  ];

  const fulfilledCount = categories.filter((c) => c.fulfilled).length;
  const totalCount = categories.length;
  const compliancePercentage = Math.round((fulfilledCount / totalCount) * 100);

  // Enhanced color palette with gradients
  const COLORS = {
    fulfilled: "#10b981",
    fulfilledGradient: "url(#fulfilledGradient)",
    notFulfilled: "#ef4444",
    notFulfilledGradient: "url(#notFulfilledGradient)",
    warning: "#f59e0b",
    info: "#3b82f6",
    success: "#22c55e",
    danger: "#dc2626",
  };

  const complianceData = [
    { 
      name: "Fulfilled", 
      value: fulfilledCount, 
      color: COLORS.fulfilled,
      gradientId: "fulfilledGradient"
    },
    { 
      name: "Not Fulfilled", 
      value: totalCount - fulfilledCount, 
      color: COLORS.notFulfilled,
      gradientId: "notFulfilledGradient"
    },
  ];

  const categoryData = categories.map((cat, idx) => {
    const categoryColors = [
      { fulfilled: "#10b981", notFulfilled: "#ef4444" },
      { fulfilled: "#3b82f6", notFulfilled: "#dc2626" },
      { fulfilled: "#8b5cf6", notFulfilled: "#dc2626" },
      { fulfilled: "#06b6d4", notFulfilled: "#dc2626" },
      { fulfilled: "#f59e0b", notFulfilled: "#dc2626" },
      { fulfilled: "#ec4899", notFulfilled: "#dc2626" },
    ];
    const colorSet = categoryColors[idx % categoryColors.length];
    return {
      name: cat.title.split(" ")[0],
      fullName: cat.title,
      value: cat.fulfilled ? 100 : 0,
      fulfilled: cat.fulfilled,
      color: cat.fulfilled ? colorSet.fulfilled : colorSet.notFulfilled,
    };
  });

  const radialData = [
    {
      name: "Compliance",
      value: compliancePercentage,
      fill: compliancePercentage >= 80 
        ? "url(#radialSuccess)" 
        : compliancePercentage >= 50 
        ? "url(#radialWarning)" 
        : "url(#radialDanger)",
      color: compliancePercentage >= 80 
        ? COLORS.success 
        : compliancePercentage >= 50 
        ? COLORS.warning 
        : COLORS.danger,
    },
  ];

  return (
    <main className="min-h-screen bg-white pt-4 pb-8 px-4 sm:px-6 lg:px-8">
      <Sidebar onLogout={handleLogout} />
      <div className={`max-w-7xl mx-auto space-y-6 ${isLoggedIn ? 'lg:pl-72 pt-12' : ''}`}>
        <div className="flex items-center mb-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="glass-panel border-border/50 rounded-2xl shadow-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Compliance Dashboard</h1>
              <div className="text-muted-foreground space-y-1">
                <p className="text-lg font-medium text-primary">EU AI Act Compliance Assessment Result</p>
                <p>
                  <span className="font-semibold">System:</span> <span className="text-foreground">{result.system_name || "Unnamed AI System"}</span>
                </p>
                <p>
                  <span className="font-semibold">Assessment Date:</span>{" "}
                  <span className="text-foreground">
                    {result.assessment_date ? new Date(result.assessment_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Assessment ID:</span> {id}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-foreground">{compliancePercentage}%</div>
              <div className="text-sm text-muted-foreground">Overall Compliance</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-panel border-border/50 shadow-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories Fulfilled</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{fulfilledCount}/{totalCount}</div>
              <div className="text-sm text-muted-foreground mt-1">{compliancePercentage}% Complete</div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50 shadow-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{compliancePercentage}%</div>
              <div className="text-sm text-muted-foreground mt-1">{compliancePercentage >= 80 ? "Excellent" : compliancePercentage >= 50 ? "Needs Improvement" : "Critical"}</div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50 shadow-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
              {compliancePercentage >= 80 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{compliancePercentage >= 80 ? <span className="text-emerald-600">Compliant</span> : <span className="text-red-600">Non-Compliant</span>}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-panel border-border/50 shadow-elevated">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/50">
              <CardTitle className="text-foreground">Compliance Overview</CardTitle>
              <CardDescription className="text-muted-foreground">Categories fulfillment status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex items-center justify-center overflow-visible">
              <ChartContainer config={{ fulfilled: { color: COLORS.fulfilled }, notFulfilled: { color: COLORS.notFulfilled } }} className="h-[280px] w-full overflow-visible">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <defs>
                    <linearGradient id="fulfilledGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="notFulfilledGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
                      <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <Pie 
                    data={complianceData} 
                    cx="50%" 
                    cy="50%" 
                    labelLine={true}
                    label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                    outerRadius={75}
                    innerRadius={30}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {complianceData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.gradientId ? `url(#${entry.gradientId})` : entry.color}
                        style={{ filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" }}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        if (data.value === undefined) {
                          return null;
                        }
                        return (
                          <div className="bg-background/95 backdrop-blur-sm p-4 border border-border/50 rounded-lg shadow-xl">
                            <p className="font-bold text-lg mb-1 text-foreground">{data.name}</p>
                            <p className="text-2xl font-extrabold" style={{ color: data.payload.color }}>
                              {data.value} {data.value === 1 ? "Category" : "Categories"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                            {(((+data.value / +totalCount) * 100).toFixed(1))}% of total
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50 shadow-elevated">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/50">
              <CardTitle className="text-foreground">Overall Compliance</CardTitle>
              <CardDescription className="text-muted-foreground">Radial progress indicator</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex items-center justify-center relative">
              <div className="relative w-full h-[280px]">
                <ChartContainer config={{ compliance: { color: radialData[0].color } }} className="h-full w-full">
                  <RadialBarChart 
                    innerRadius="55%" 
                    outerRadius="80%" 
                    data={radialData} 
                    startAngle={90} 
                    endAngle={-270}
                  >
                    <defs>
                      <linearGradient id="radialSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="radialWarning" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.9} />
                      </linearGradient>
                      <linearGradient id="radialDanger" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity={1} />
                        <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <RadialBar 
                      dataKey="value" 
                      cornerRadius={15} 
                      fill={radialData[0].fill}
                      style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))" }}
                    />
                    <ChartTooltip 
                      content={({ active, payload, coordinate }) => {
                        if (active && payload && payload.length) {
                        const rawValue = payload[0]?.value;
                        if (rawValue === undefined) return null;
                        const value = Number(rawValue);
                        if (Number.isNaN(value)) return null;
                          return (
                            <div 
                              className="bg-background/95 backdrop-blur-sm p-4 border border-border/50 rounded-lg shadow-xl"
                              style={{
                                position: 'absolute',
                                left: coordinate?.x ? `${coordinate.x}px` : '50%',
                                top: '20px',
                                transform: 'translateX(-50%)',
                                pointerEvents: 'none',
                                zIndex: 100
                              }}
                            >
                              <p className="font-bold text-lg mb-1 text-foreground">{payload[0].payload.name}</p>
                              <p className="text-3xl font-extrabold" style={{ color: payload[0].payload.color }}>
                                {value}%
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {value >= 80 
                                  ? "Excellent Compliance" 
                                  : value >= 50 
                                  ? "Needs Improvement" 
                                  : "Critical Status"}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                      allowEscapeViewBox={{ x: true, y: true }}
                    />
                  </RadialBarChart>
                </ChartContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-foreground">{compliancePercentage}%</div>
                    <div className="text-sm text-muted-foreground mt-1">Compliance</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/50 shadow-elevated">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/50">
              <CardTitle className="text-foreground">Category Breakdown</CardTitle>
              <CardDescription className="text-muted-foreground">Individual category status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 overflow-hidden">
              <div className="w-full h-[280px]">
                <ChartContainer config={{ fulfilled: { color: COLORS.fulfilled }, notFulfilled: { color: COLORS.notFulfilled } }} className="h-full w-full">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <defs>
                      {categoryData.map((item, idx) => (
                        <linearGradient key={`barGradient-${idx}`} id={`barGradient-${idx}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={item.color} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={item.color} stopOpacity={0.6} />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      width={40}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 500 }} 
                      width={55}
                      axisLine={{ stroke: "hsl(var(--border))" }}
                    />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background/95 backdrop-blur-sm p-4 border border-border/50 rounded-lg shadow-xl">
                              <p className="font-bold text-lg mb-2 text-foreground">{data.fullName}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-2xl ${data.fulfilled ? "text-emerald-600" : "text-red-600"}`}>
                                  {data.fulfilled ? "✅" : "❌"}
                                </span>
                                <span className={`font-extrabold text-xl ${data.fulfilled ? "text-emerald-600" : "text-red-600"}`}>
                                  {data.fulfilled ? "Fulfilled" : "Not Fulfilled"}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">Score: {data.value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 12, 12, 0]}
                      style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))" }}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#barGradient-${index})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-panel border-border/50 shadow-elevated">
          <CardHeader>
            <CardTitle className="text-foreground">Compliance Overview</CardTitle>
            <CardDescription className="text-muted-foreground">Detailed breakdown of all compliance categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => {
                const Icon = categoryIcons[category.title] || Shield;
                return (
                  <div key={index} className={`p-4 rounded-xl border text-center transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 ${getStatusClasses(category.fulfilled)}`}>
                    <div className="flex justify-center mb-2">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-2xl mb-1">{getStatusIcon(category.fulfilled)}</div>
                    <div className="text-sm font-semibold mb-1">{category.title}</div>
                    <div className="text-xs">{getStatusText(category.fulfilled)}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {categories.map((category, categoryIndex) => {
            const Icon = categoryIcons[category.title] || Shield;
            return (
              <Card key={categoryIndex} className="glass-panel border-border/50 hover:shadow-lg hover:shadow-primary/20 transition-shadow">
                <div className={`px-6 py-4 border-b rounded-t-xl ${getStatusClasses(category.fulfilled)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6" />
                      <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
                    </div>
                    <Badge 
                      variant={category.fulfilled ? "default" : "destructive"} 
                      className={category.fulfilled 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-red-50 text-red-700 border-red-200"}
                    >
                      {getStatusText(category.fulfilled)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6 bg-secondary/30">
                  <div className="space-y-6">
                    {category.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="border-l-4 border-primary/50 pl-4 bg-secondary/50 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-foreground mb-2">{detail.label}</h4>
                        <p className="text-muted-foreground leading-relaxed">{detail.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}

