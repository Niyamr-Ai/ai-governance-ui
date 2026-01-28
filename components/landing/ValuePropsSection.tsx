"use client";
import { Layers, Zap, Award, Eye, ShieldCheck, RefreshCw } from 'lucide-react';

export default function ValuePropsSection() {
  const values = [
    {
      icon: Layers,
      title: 'Complete AI Lifecycle Coverage',
      description: 'From model development to deployment, govern every stage of your AI journey',
    },
    {
      icon: Zap,
      title: 'Real-time Enforcement',
      description: 'Instant policy application and threat response across all AI systems',
    },
    {
      icon: Award,
      title: 'SOC2 / ISO-Ready Controls',
      description: 'Pre-built compliance frameworks for enterprise certification requirements',
    },
    {
      icon: Eye,
      title: 'Shadow AI Detection',
      description: 'Automatically discover and govern unauthorized AI usage in your organization',
    },
    {
      icon: ShieldCheck,
      title: 'Zero-Trust Compatible',
      description: 'Seamless integration with zero-trust security architectures',
    },
    {
      icon: RefreshCw,
      title: 'Continuous Monitoring',
      description: '24/7 automated surveillance of AI behaviors and compliance status',
    },
  ];

  return (
    <section className="section-wrapper relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-4 py-2 mb-6 border border-primary/10">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Why NiyamR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            The Complete{' '}
            <span className="gradient-text">AI Governance</span>
            {' '}Platform
          </h2>
          <p className="text-lg text-muted-foreground">
            Purpose-built for enterprises that demand the highest standards 
            of AI safety, security, and compliance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {values.map((value, idx) => (
            <div key={idx} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              
              <div className="relative p-6 rounded-2xl border border-transparent group-hover:border-border/30 transition-all duration-300 bg-background/50">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 glass rounded-2xl p-6 shadow-soft">
            <p className="text-foreground font-medium">
              Ready to secure your AI infrastructure?
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl shadow-glow hover:shadow-glow-accent transition-all duration-300 hover:scale-105">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

