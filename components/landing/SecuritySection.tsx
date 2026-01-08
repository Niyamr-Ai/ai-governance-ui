"use client";
import { Shield, AlertTriangle, Lock, FileCheck } from 'lucide-react';

export default function SecuritySection() {
  const features = [
    { icon: AlertTriangle, title: 'Detect Risky Behaviors', desc: 'Real-time anomaly detection across all AI systems' },
    { icon: Lock, title: 'Prevent Data Leakage', desc: 'Advanced DLP controls for sensitive information' },
    { icon: Shield, title: 'Enforce AI Guardrails', desc: 'Automated policy enforcement at scale' },
    { icon: FileCheck, title: 'Ensure Compliance', desc: 'Continuous compliance monitoring & reporting' },
  ];

  return (
    <section className="py-12 relative overflow-hidden bg-gradient-to-b from-background via-secondary/10 to-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Security & Governance</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            AI Security{' '}
            <span className="gradient-text">Command Center</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade security controls with real-time threat detection, policy enforcement, and compliance automation.
          </p>
        </div>

        {/* Command Center Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Main Dashboard */}
          <div className="lg:col-span-2 glass-panel-glow p-8 shadow-premium">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Threat Detection Dashboard</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="relative h-48 mb-6">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#5B7FCE" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#5B7FCE" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[...Array(5)].map((_, i) => (
                  <line 
                    key={i} 
                    x1="0" 
                    y1={i * 37.5} 
                    x2="400" 
                    y2={i * 37.5} 
                    stroke="currentColor" 
                    strokeOpacity="0.1" 
                    className="text-muted-foreground"
                  />
                ))}
                <path
                  d="M0,120 C40,100 60,80 100,90 C140,100 160,40 200,50 C240,60 280,30 320,40 C360,50 380,20 400,25 L400,150 L0,150 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M0,120 C40,100 60,80 100,90 C140,100 160,40 200,50 C240,60 280,30 320,40 C360,50 380,20 400,25"
                  fill="none"
                  stroke="#5B7FCE"
                  strokeWidth="2"
                  className="neural-line"
                />
                <circle cx="100" cy="90" r="4" fill="#5B7FCE" className="animate-pulse-subtle" />
                <circle cx="200" cy="50" r="4" fill="#5B7FCE" className="animate-pulse-subtle" />
                <circle cx="320" cy="40" r="4" fill="#5B7FCE" className="animate-pulse-subtle" />
              </svg>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-secondary/30 shadow-soft">
                <div className="text-2xl font-bold text-foreground">1,247</div>
                <div className="text-xs text-muted-foreground">Threats Blocked</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary/30 shadow-soft">
                <div className="text-2xl font-bold text-green-500">99.9%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-secondary/30 shadow-soft">
                <div className="text-2xl font-bold gradient-text">23ms</div>
                <div className="text-xs text-muted-foreground">Avg Response</div>
              </div>
            </div>
          </div>

          {/* Side Panels */}
          <div className="space-y-6">
            {/* Risk Score Gauge */}
            <div className="glass-panel p-6 shadow-soft">
              <h4 className="text-sm font-medium text-foreground mb-4">Overall Risk Score</h4>
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                  <circle
                    cx="64" cy="64" r="56" fill="none" stroke="url(#gaugeGradient)" strokeWidth="8"
                    strokeDasharray="351.86" strokeDashoffset="52.78" strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="50%" stopColor="#5B7FCE" />
                      <stop offset="100%" stopColor="#64C1FF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-foreground">85</span>
                    <span className="text-xs text-muted-foreground block">Low Risk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Feed */}
            <div className="glass-panel p-6 shadow-soft">
              <h4 className="text-sm font-medium text-foreground mb-4">Recent Alerts</h4>
              <div className="space-y-3">
                {[
                  { type: 'warning', message: 'Unusual API pattern detected', time: '2m ago' },
                  { type: 'info', message: 'Policy updated successfully', time: '15m ago' },
                  { type: 'success', message: 'Threat neutralized', time: '1h ago' },
                ].map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      alert.type === 'warning' ? 'bg-yellow-500' : 
                      alert.type === 'info' ? 'bg-primary' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="module-card group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:to-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

