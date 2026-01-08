"use client";
import { useState } from 'react';
import { Workflow, FileText, Scale, Building2, CreditCard, FileCheck, Shield, Zap, ArrowRight, Check, FileSearch, AlertCircle, Search } from 'lucide-react';

export default function WorkflowShowcaseSection() {
  const [activeFlow, setActiveFlow] = useState(0);

  const workflows = [
    {
      title: 'Invoice Routing',
      condition: 'If invoice > ₹50,000',
      action: 'Route to manager',
      icon: CreditCard,
      colorClass: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      borderClass: 'border-blue-500',
    },
    {
      title: 'Compliance Check',
      condition: 'Extract clauses',
      action: 'Send to compliance agent',
      icon: Shield,
      colorClass: 'bg-gradient-to-r from-purple-500 to-pink-500',
      borderClass: 'border-purple-500',
    },
    {
      title: 'Expiry Alert',
      condition: 'Detect expiry date',
      action: 'Auto-notify legal team',
      icon: Zap,
      colorClass: 'bg-gradient-to-r from-orange-500 to-red-500',
      borderClass: 'border-orange-500',
    },
  ];

  const useCases = [
    {
      icon: FileText,
      title: 'Contract Extraction',
      description: 'Extract parties, dates, obligations, and payment terms automatically',
      metric: '95% accuracy',
    },
    {
      icon: CreditCard,
      title: 'Invoice Processing',
      description: 'Parse invoice data, validate amounts, and route for approval',
      metric: '10K/day',
    },
    {
      icon: Scale,
      title: 'Legal Clause Detection',
      description: 'Identify clauses, exceptions, and compliance requirements',
      metric: 'Real-time',
    },
    {
      icon: Shield,
      title: 'Regulatory Mapping',
      description: 'Map obligations to articles, detect gaps, classify risks',
      metric: '100% coverage',
    },
    {
      icon: Building2,
      title: 'Bank Statements',
      description: 'Extract transactions, categorize expenses, detect anomalies',
      metric: '99.9% uptime',
    },
    {
      icon: FileCheck,
      title: 'Insurance Claims',
      description: 'Process claims, validate documents, flag inconsistencies',
      metric: '3x faster',
    },
  ];

  const regulatoryFeatures = [
    {
      title: 'Article Extraction',
      description: 'Show all obligations from Article 6',
      example: 'Extracted 47 obligations from GDPR Article 6',
      icon: FileSearch,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-500/5',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Risk Classification',
      description: 'Highlight all high-risk clauses',
      example: '12 high-risk clauses detected in contract',
      icon: AlertCircle,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-500/5',
      borderColor: 'border-orange-500/20',
    },
    {
      title: 'Compliance Gaps',
      description: 'Summarize compliance gaps',
      example: '3 critical gaps found in SOC2 compliance',
      icon: Search,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-500/5',
      borderColor: 'border-purple-500/20',
    },
  ];

  const ActiveFlowIcon = workflows[activeFlow].icon;

  return (
    <section className="relative py-12 overflow-hidden bg-gradient-to-b from-background via-accent/5 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/5 rounded-full px-4 py-2 mb-6 border border-accent/20">
            <Workflow className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Intelligent Workflows</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Build Any{' '}
            <span className="gradient-text">AI Workflow</span>
            {' '}in Minutes
          </h2>
          <p className="text-lg text-muted-foreground">
            No-code workflow builder with rule-based automation. 
            Connect any document process to any action instantly.
          </p>
        </div>

        {/* Main Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto mb-20">
          {/* LEFT - Workflow Builder Visual */}
          <div className="space-y-6">
            <div className="glass-panel-glow p-8 shadow-premium">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Visual Workflow Builder</h3>
                  <p className="text-sm text-muted-foreground">Drag, drop, automate</p>
                </div>
              </div>

              {/* Workflow Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {workflows.map((flow, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFlow(idx)}
                    className={`
                      px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300
                      ${activeFlow === idx
                        ? `${flow.colorClass}  shadow-lg`
                        : 'bg-secondary/30 text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    {flow.title}
                  </button>
                ))}
              </div>

              {/* Active Flow Visualization */}
              <div className="space-y-4">
                {/* Input Node */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 flex items-center justify-center">
                    <ActiveFlowIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-background/50 border border-border/30">
                    <p className="text-sm font-semibold text-foreground">Document Upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, Images</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground animate-pulse" />
                </div>

                {/* Condition Node */}
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${workflows[activeFlow].colorClass} flex items-center justify-center shadow-lg`}>
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-background/50 border-2 border-accent/30">
                    <p className="text-sm font-semibold text-foreground">{workflows[activeFlow].condition}</p>
                    <p className="text-xs text-muted-foreground mt-1">AI-powered detection</p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-muted-foreground animate-pulse" />
                </div>

                {/* Action Node */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-green-500/10 border-2 border-green-500/30">
                    <p className="text-sm font-semibold text-foreground">{workflows[activeFlow].action}</p>
                    <p className="text-xs text-green-600 mt-1">Automated action</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border/30">
                <div className="text-center p-3 rounded-xl bg-primary/5">
                  <div className="text-2xl font-bold gradient-text mb-1">10K+</div>
                  <div className="text-xs text-muted-foreground">Workflows Created</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-accent/5">
                  <div className="text-2xl font-bold gradient-text mb-1">99.9%</div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Use Cases Grid */}
          <div className="space-y-6">
            <div className="glass-panel p-8 shadow-premium rounded-3xl">
              <h3 className="text-xl font-bold text-foreground mb-6">Enterprise Use Cases</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {useCases.map((useCase, idx) => (
                  <div
                    key={idx}
                    className="group p-4 rounded-xl bg-background/50 border border-border/30 hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <useCase.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-foreground text-sm">{useCase.title}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium whitespace-nowrap">
                            {useCase.metric}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {useCase.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - Regulatory AI Mode Strip */}
        <div className="max-w-7xl mx-auto">
          <div className="glass-panel-glow p-8 rounded-3xl shadow-premium border-2 border-accent/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">Regulatory AI Mode</h3>
                <p className="text-muted-foreground">NiyamR's secret weapon for compliance</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {regulatoryFeatures.map((feature, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-background/50 border border-border/30 hover:border-purple-500/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-4">
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                  <div className={`p-3 rounded-lg ${feature.bgColor} border ${feature.borderColor}`}>
                    <p className="text-xs text-purple-600 font-medium">{feature.example}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
        
          </div>
        </div>
      </div>
    </section>
  );
}

