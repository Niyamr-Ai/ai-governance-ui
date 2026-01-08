"use client";
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function DashboardSection() {
  const metrics = [
    { label: 'Active Agents', value: '247', change: '+12%', icon: Activity, positive: true },
    { label: 'Threats Blocked', value: '1,847', change: '+23%', icon: AlertTriangle, positive: true },
    { label: 'Policy Compliance', value: '98.7%', change: '+2.1%', icon: CheckCircle, positive: true },
    { label: 'Avg Response Time', value: '23ms', change: '-15%', icon: Clock, positive: true },
  ];

  const logs = [
    { time: '14:32:01', agent: 'GPT-4 Assistant', action: 'Query processed', status: 'success' },
    { time: '14:31:58', agent: 'Data Pipeline #3', action: 'Policy check passed', status: 'success' },
    { time: '14:31:55', agent: 'Claude Agent', action: 'Guardrail triggered', status: 'warning' },
    { time: '14:31:52', agent: 'Custom LLM', action: 'Request completed', status: 'success' },
    { time: '14:31:49', agent: 'Vision Model', action: 'Image analyzed', status: 'success' },
    { time: '14:31:45', agent: 'Embedding Service', action: 'Vectors generated', status: 'success' },
  ];

  return (
    <section className="py-12 relative overflow-hidden bg-gradient-to-b from-background via-secondary/10 to-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/20 mb-6">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Live Dashboard</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Enterprise{' '}
            <span className="gradient-text">Command Center</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time visibility and control over your entire AI ecosystem from a single pane of glass.
          </p>
        </div>

        <div className="glass-panel-glow p-2 rounded-3xl overflow-hidden shadow-premium">
          <div className="bg-background rounded-2xl overflow-hidden shadow-elevated">
            <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live • Updated just now
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {metrics.map((metric) => (
                  <div key={metric.label} className="dashboard-panel">
                    <div className="flex items-center justify-between mb-3">
                      <metric.icon className="w-5 h-5 text-muted-foreground" />
                      <span className={`text-xs font-medium ${metric.positive ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.change}
                      </span>
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 dashboard-panel">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-foreground">AI Activity Overview</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        Requests
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent" />
                        Blocked
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-48 relative">
                    <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                      {[...Array(4)].map((_, i) => (
                        <line key={i} x1="0" y1={i * 50} x2="500" y2={i * 50} stroke="currentColor" strokeOpacity="0.1" className="text-muted-foreground" />
                      ))}
                      
                      <path
                        d="M0,100 C50,80 100,90 150,70 C200,50 250,60 300,40 C350,20 400,30 450,10 C475,5 490,8 500,5 L500,150 L0,150 Z"
                        fill="url(#areaGradient1)"
                      />
                      
                      <path
                        d="M0,100 C50,80 100,90 150,70 C200,50 250,60 300,40 C350,20 400,30 450,10 C475,5 490,8 500,5"
                        fill="none"
                        stroke="#5B7FCE"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      
                      <path
                        d="M0,130 C50,125 100,128 150,120 C200,115 250,118 300,110 C350,105 400,108 450,100 C475,95 490,98 500,95"
                        fill="none"
                        stroke="#64C1FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="5,5"
                      />
                      
                      <defs>
                        <linearGradient id="areaGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#5B7FCE" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#5B7FCE" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                <div className="dashboard-panel">
                  <h3 className="font-semibold text-foreground mb-4">Activity Log</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {logs.map((log, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                          log.status === 'success' ? 'bg-green-500' : 
                          log.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-foreground truncate">{log.agent}</span>
                            <span className="text-xs text-muted-foreground shrink-0">{log.time}</span>
                          </div>
                          <span className="text-muted-foreground">{log.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {['SOC2', 'ISO 27001', 'GDPR', 'HIPAA'].map((cert) => (
                  <div key={cert} className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-foreground">{cert} Compliant</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

