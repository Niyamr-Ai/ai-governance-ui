"use client";
import { Brain, Shield, Scale, Eye, Gauge, LayoutDashboard } from 'lucide-react';

export default function NeuralFlowSection() {
  const flowSteps = [
    { icon: Brain, label: 'AI Model', color: 'primary' },
    { icon: Shield, label: 'Guardrails', color: 'accent' },
    { icon: Scale, label: 'Policies', color: 'primary' },
    { icon: Eye, label: 'Observability', color: 'accent' },
    { icon: Gauge, label: 'Risk Engine', color: 'primary' },
    { icon: LayoutDashboard, label: 'Dashboard', color: 'accent' },
  ];

  return (
    <section className="section-wrapper relative overflow-hidden bg-gradient-to-b from-accent/5 to-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-accent/5 rounded-full px-4 py-2 mb-6 border border-accent/20">
            <Brain className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Neural Flow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Holographic{' '}
            <span className="gradient-text">AI Pipeline</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Watch your AI systems flow through our governance engine. 
            Every step monitored, every action controlled.
          </p>
        </div>

        <div className="relative">
          {/* Desktop Flow */}
          <div className="hidden lg:flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2">
              <div className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full opacity-20" />
              <div 
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full shimmer"
              />
            </div>

            {flowSteps.map((step, idx) => (
              <div 
                key={idx}
                className="relative z-10 flex flex-col items-center group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`
                  absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  ${step.color === 'primary' ? 'bg-primary/5' : 'bg-accent/5'}
                  blur-xl
                `} />
                
                <div className={`
                  relative w-20 h-20 rounded-2xl glass
                  flex items-center justify-center mb-4
                  group-hover:scale-110 transition-all duration-300 shadow-soft
                  ${step.color === 'primary' ? 'group-hover:shadow-blue' : 'group-hover:shadow-glow-accent'}
                `}>
                  <div className={`
                    w-12 h-12 rounded-xl 
                    ${step.color === 'primary' 
                      ? 'bg-primary/10' 
                      : 'bg-accent/10'
                    }
                    flex items-center justify-center
                  `}>
                    <step.icon className={`w-6 h-6 ${step.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                  </div>
                  
                  <div className={`
                    absolute inset-0 rounded-2xl border-2 
                    ${step.color === 'primary' ? 'border-primary/20' : 'border-accent/20'}
                    animate-ping opacity-0 group-hover:opacity-50
                  `} />
                </div>
                
                <span className="text-sm font-medium text-foreground">{step.label}</span>
                
                {idx < flowSteps.length - 1 && (
                  <div className="absolute -right-8 top-10 text-2xl text-muted-foreground hidden xl:block">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Flow */}
          <div className="lg:hidden space-y-4">
            {flowSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={`
                  w-14 h-14 rounded-xl glass flex items-center justify-center flex-shrink-0 shadow-soft
                  ${step.color === 'primary' ? 'shadow-blue' : 'shadow-glow-accent'}
                `}>
                  <step.icon className={`w-6 h-6 ${step.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                </div>
                <div className="flex-1 h-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full" />
                <span className="text-sm font-medium text-foreground">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Decorative orbs */}
          <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-64 h-64 hidden xl:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse-glow" />
          </div>
          <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-64 h-64 hidden xl:block">
            <div className="absolute inset-0 bg-gradient-to-bl from-accent/10 to-transparent rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 glass rounded-full px-6 py-3 shadow-soft">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-sm text-muted-foreground">Real-time data flowing through governance layers</span>
          </div>
        </div>
      </div>
    </section>
  );
}

