"use client";
import { Package, Search, ShieldCheck, Target, LineChart, Award } from 'lucide-react';

export default function ModulesSection() {
  const modules = [
    {
      icon: Package,
      title: 'AI Asset Inventory',
      description: 'Comprehensive catalog of all AI models, agents, and integrations across your organization.',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      icon: Search,
      title: 'Automated Risk Detection',
      description: 'ML-powered threat identification with predictive risk scoring and anomaly detection.',
      gradient: 'from-purple-500 to-pink-400',
    },
    {
      icon: ShieldCheck,
      title: 'Policy Enforcement Engine',
      description: 'Define, deploy, and enforce AI policies at scale with zero-touch automation.',
      gradient: 'from-primary to-accent',
    },
    {
      icon: Target,
      title: 'AI Red Teaming & Auditing',
      description: 'Continuous security testing with automated adversarial simulations and audit trails.',
      gradient: 'from-orange-500 to-red-400',
    },
    {
      icon: LineChart,
      title: 'Real-time Observability',
      description: 'Full-stack monitoring with distributed tracing, metrics, and intelligent alerting.',
      gradient: 'from-green-500 to-emerald-400',
    },
    {
      icon: Award,
      title: 'Compliance & Certifications',
      description: 'Automated compliance workflows for SOC2, ISO 27001, GDPR, and industry regulations.',
      gradient: 'from-indigo-500 to-violet-400',
    },
  ];

  return (
    <section id="solutions" className="py-12 relative bg-gradient-to-b from-background via-secondary/5 to-background">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/20 mb-6">
            <Package className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Governance Modules</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            AI Governance{' '}
            <span className="gradient-text">Engine</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Modular, extensible governance capabilities designed for enterprise-scale AI operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <div key={module.title} className="group relative" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="module-card h-full">
                <div className="relative mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.gradient} p-0.5 transform group-hover:scale-110 transition-transform duration-500`}>
                    <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                      <module.icon className="w-8 h-8 " />
                    </div>
                  </div>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${module.gradient} blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {module.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {module.description}
                </p>

                <div className="mt-6 pt-6 border-t border-border/30">
                  <button 
                    className="text-sm font-medium text-primary hover:text-accent transition-colors flex items-center gap-2 group/link"
                    onClick={() => {
                      const contactSection = document.querySelector('#contact');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    Learn more
                    <svg className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {index < modules.length - 1 && (index + 1) % 3 !== 0 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-border/20 to-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* Connection Flow */}
        <div className="relative h-24 mt-12 hidden lg:block">
          <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
            <defs>
              <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#5B7FCE" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#64C1FF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#5B7FCE" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <path
              d="M0 10 Q 25 0, 50 10 T 100 10"
              fill="none"
              stroke="url(#flow-gradient)"
              strokeWidth="0.3"
              strokeDasharray="2 1"
              className="animate-flow"
            />
          </svg>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 glass rounded-full px-6 py-2 shadow-soft">
            <span className="text-sm font-medium gradient-text">Unified Control Plane</span>
          </div>
        </div>
      </div>
    </section>
  );
}

