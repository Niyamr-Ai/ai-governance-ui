"use client";
import { useState } from 'react';
import { AlertTriangle, TrendingDown, Eye, ShieldAlert, Zap, CheckCircle, Activity, Lock } from 'lucide-react';

export default function ChallengeSection() {
  const [activeTab, setActiveTab] = useState('challenge');

  const challenges = [
    {
      icon: AlertTriangle,
      title: 'Manual & Reactive Processes',
      description: 'Manual, reactive risk management processes inevitably lead to slower innovation cycles and missed opportunities.',
      gradient: 'from-red-500 to-orange-500',
    },
    {
      icon: Eye,
      title: 'Zero Visibility',
      description: 'A critical lack of comprehensive visibility into complex model behavior, data lineage, and decision-making processes.',
      gradient: 'from-orange-500 to-yellow-500',
    },
    {
      icon: ShieldAlert,
      title: 'Fragmented Security',
      description: 'Fragmented and disjointed toolchains create gaping security holes, compliance pitfalls, and ultimately, audit failures.',
      gradient: 'from-yellow-500 to-red-600',
    },
  ];

  const solutions = [
    {
      icon: Zap,
      title: 'Automated Real-Time Compliance',
      description: 'Automated, real-time compliance checks rigorously mapped against all leading global and industry standards.',
      gradient: 'from-primary to-accent',
      delay: '0s',
    },
    {
      icon: Activity,
      title: 'Continuous Monitoring',
      description: 'Continuous, sophisticated monitoring coupled with advanced adversarial testing to harden AI defenses.',
      gradient: 'from-primary to-accent',
      delay: '0.2s',
    },
    {
      icon: Lock,
      title: 'Unified Control Plane',
      description: 'A unified, intuitive single pane of glass for streamlining all AI governance and operational workflows.',
      gradient: 'from-primary to-accent',
      delay: '0.4s',
    },
  ];

  return (
    <section className="relative py-12 overflow-hidden bg-gradient-to-b from-background via-secondary/5 to-background">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-4 py-2 mb-6 border border-primary/10">
            <TrendingDown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">The Challenge & The Solution</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            From Navigating AI Risk to{' '}
            <span className="gradient-text">Driving Innovation</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            With unwavering confidence. Transform complexity into competitive advantage.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="glass-panel p-2 rounded-2xl inline-flex gap-2 shadow-soft">
            <button
              onClick={() => setActiveTab('challenge')}
              className={`
                px-8 py-3 rounded-xl font-semibold transition-all duration-300
                ${activeTab === 'challenge' 
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              The Challenge
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`
                px-8 py-3 rounded-xl font-semibold transition-all duration-300
                ${activeTab === 'solution' 
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              The Solution
            </button>
          </div>
        </div>

        {/* Split View Container */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto  ">
          {/* LEFT SIDE - THE CHALLENGE */}
          <div className={`
            space-y-6 transition-all duration-700
            ${activeTab === 'challenge' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}
          `}>
            <div className="glass-panel p-8 border-2 border-red-500/20 shadow-premium rounded-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">The Challenge</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Enterprises grapple with an intricate web of evolving risks when deploying AI, 
                ranging from stringent compliance requirements to insidious security vulnerabilities. 
                Navigating this landscape without the right tools can stifle innovation and lead to significant setbacks.
              </p>
              
              <div className="space-y-4">
                {challenges.map((challenge, idx) => (
                  <div 
                    key={idx}
                    className="group relative p-5 rounded-xl border border-border/30 bg-background/50 hover:border-red-500/30 transition-all duration-300 hover:shadow-lg"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`
                        w-10 h-10 rounded-lg bg-gradient-to-br ${challenge.gradient} 
                        flex items-center justify-center flex-shrink-0
                        group-hover:scale-110 transition-transform duration-300
                      `}>
                        <challenge.icon className="w-5 h-5 " />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          {challenge.title}
                          <span className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">⚠️</span>
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Danger pulse effect */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 animate-ping" />
                  </div>
                ))}
              </div>

              {/* Danger Stats */}
              {/* <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500 mb-1">67%</div>
                  <div className="text-xs text-muted-foreground">Slower Time-to-Market</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500 mb-1">$2.4M</div>
                  <div className="text-xs text-muted-foreground">Avg Compliance Fine</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500 mb-1">89%</div>
                  <div className="text-xs text-muted-foreground">Lack Visibility</div>
                </div>
              </div> */}
            </div>
          </div>

          {/* RIGHT SIDE - THE SOLUTION */}
          <div className={`
            space-y-6 transition-all duration-700
            ${activeTab === 'solution' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}
          `}>
            <div className="glass-panel-glow p-8 border-2 border-primary/20 shadow-premium">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">The Solution</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our cutting-edge platform delivers a proactive and automated paradigm for AI assurance, 
                seamlessly unifying governance, regulatory compliance, and robust security measures. 
                Empower your teams to build and deploy AI with unprecedented speed and trust.
              </p>
              
              <div className="space-y-4">
                {solutions.map((solution, idx) => (
                  <div 
                    key={idx}
                    className="group relative p-5 rounded-xl border border-border/30 bg-background/50 hover:border-primary/30 transition-all duration-300 hover:shadow-blue"
                    style={{ animationDelay: solution.delay }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`
                        w-10 h-10 rounded-lg bg-gradient-to-br ${solution.gradient} 
                        flex items-center justify-center flex-shrink-0
                        group-hover:scale-110 transition-transform duration-300
                      `}>
                        <solution.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                          {solution.title}
                          <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">✓</span>
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {solution.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Success pulse effect */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 animate-ping" />
                  </div>
                ))}
              </div>

           
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 glass-panel-glow p-8 rounded-2xl shadow-premium">
            <div className="text-left">
              <p className="text-lg font-semibold text-foreground mb-1">
                Ready to Transform Your AI Governance?
              </p>
              <p className="text-sm text-muted-foreground">
                Join 500+ enterprises building AI with confidence
              </p>
            </div>
            <button className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-accent transition-all duration-300 hover:scale-105 whitespace-nowrap">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

