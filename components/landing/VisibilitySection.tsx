"use client";
import { Brain, Server, GitBranch, Database, Activity, Shield, Scissors, FileStack, Scale, Search } from 'lucide-react';

export default function VisibilitySection() {
  const nodes = [
    { id: 1, label: 'AI Agent', icon: Brain, x: 15, y: 25, type: 'primary', pulse: true },
    { id: 2, label: 'Auto Redaction', icon: Scissors, x: 35, y: 15, type: 'accent', feature: true },
    { id: 3, label: 'Workflow', icon: GitBranch, x: 55, y: 25, type: 'primary', pulse: true },
    { id: 4, label: 'Bulk Processing', icon: FileStack, x: 75, y: 15, type: 'accent', feature: true },
    { id: 5, label: 'Compliance Hub', icon: Scale, x: 85, y: 35, type: 'accent', feature: true },
    { id: 6, label: 'Data Pipeline', icon: Database, x: 25, y: 50, type: 'primary', pulse: true },
    { id: 7, label: 'Regulatory AI', icon: Search, x: 50, y: 55, type: 'accent', feature: true },
    { id: 8, label: 'Analytics', icon: Activity, x: 70, y: 65, type: 'primary', pulse: true },
  ];

  const connections = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 1, to: 6 },
    { from: 6, to: 7 },
    { from: 7, to: 8 },
    { from: 3, to: 7 },
    { from: 5, to: 8 },
  ];

  const features = [
    {
      icon: Scissors,
      title: 'Automated Redaction',
      description: 'Detect & remove PII, PHI, emails, addresses, phone numbers, and sensitive financial data',
      stats: '99.9% accuracy',
    },
    {
      icon: FileStack,
      title: 'Bulk Processing',
      description: 'Process 100-500 PDFs simultaneously with real-time progress tracking and batch export',
      stats: '500 docs/min',
    },
    {
      icon: Scale,
      title: 'Compliance Hub',
      description: 'SOC2, GDPR, HIPAA ready with automated obligation extraction and risk classification',
      stats: '100% compliant',
    },
    {
      icon: Search,
      title: 'Regulatory AI Mode',
      description: 'Extract obligations, detect exceptions, map clauses, and classify risk statements automatically',
      stats: 'Real-time',
    },
  ];

  return (
    <section id="platform" className="section-wrapper relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-4 py-2 mb-6 border border-primary/10">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Complete Visibility</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            End-to-End Intelligence of{' '}
            <span className="gradient-text">Every Document</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Map your entire document processing ecosystem with real-time observability. 
            From upload to extraction, every step secured and monitored.
          </p>
        </div>

        {/* Interactive Node Graph */}
        <div className="relative h-[500px] lg:h-[600px] rounded-3xl glass overflow-hidden shadow-premium mb-12">
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(91, 127, 206, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(91, 127, 206, 0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          
          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5B7FCE" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#64C1FF" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              return (
                <line
                  key={idx}
                  x1={`${fromNode.x}%`}
                  y1={`${fromNode.y}%`}
                  x2={`${toNode.x}%`}
                  y2={`${toNode.y}%`}
                  stroke="url(#connection-gradient)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  className="animate-flow"
                  style={{ animationDelay: `${idx * 0.2}s` }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className={`
                relative glass rounded-2xl p-5 transition-all duration-300 cursor-pointer
                hover:scale-110 shadow-soft
                ${node.type === 'primary' ? 'hover:shadow-blue' : 'hover:shadow-glow-accent'}
                ${node.feature ? 'border-2 border-accent/30' : ''}
              `}>
               
                {/* Icon */}
                <div className={`
                  relative w-12 h-12 rounded-xl flex items-center justify-center mb-3
                  ${node.type === 'primary' 
                    ? 'bg-primary/10' 
                    : 'bg-accent/10'
                  }
                `}>
                  <node.icon className={`w-6 h-6 ${node.type === 'primary' ? 'text-primary' : 'text-accent'}`} />
                </div>
                
                <p className="text-sm font-semibold text-foreground text-center whitespace-nowrap">
                  {node.label}
                </p>
               
              </div>
            </div>
          ))}

          {/* Stats Overlay */}
          <div className="absolute bottom-6 left-6 glass rounded-xl p-4 shadow-soft">
            <p className="text-xs text-muted-foreground mb-2">Processing Speed</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-8 h-2 rounded-full bg-green-500 animate-pulse" />
                <div className="w-6 h-2 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-4 h-2 rounded-full bg-green-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="text-sm font-medium text-foreground">Real-time</span>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="absolute bottom-6 right-6 glass rounded-xl p-4 max-w-xs shadow-soft">
            <p className="text-xs text-muted-foreground mb-3">Live Processing</p>
            <div className="space-y-2">
              {[
                { label: 'Redacted 47 PII fields', time: '2s ago', status: 'success' },
                { label: 'Batch processing: 234/500', time: 'live', status: 'info' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    item.status === 'success' ? 'bg-green-500' : 'bg-primary'
                  } animate-pulse`} />
                  <span className="text-xs text-foreground truncate">{item.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group premium-card hover:border-accent/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                  {feature.stats}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

