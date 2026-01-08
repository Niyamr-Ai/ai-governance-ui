"use client";
import { Building2, Landmark, Heart, Cpu, ShoppingBag } from 'lucide-react';

export default function UseCasesSection() {
  const useCases = [
    {
      icon: Landmark,
      industry: 'Financial Services',
      description: 'Secure AI-driven trading, risk modeling, and fraud detection with complete regulatory compliance',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Building2,
      industry: 'Government',
      description: 'Protect citizen data and ensure AI transparency in public services and decision-making',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Heart,
      industry: 'Healthcare',
      description: 'HIPAA-compliant AI governance for diagnostics, patient care, and medical research',
      gradient: 'from-rose-500 to-pink-500',
    },
    {
      icon: Cpu,
      industry: 'Technology',
      description: 'Scale AI operations securely with automated governance for development teams',
      gradient: 'from-primary to-accent',
    },
    {
      icon: ShoppingBag,
      industry: 'Retail',
      description: 'Govern AI recommendations, pricing models, and customer data with enterprise controls',
      gradient: 'from-orange-500 to-amber-500',
    },
  ];

  return (
    <section id="use-cases" className="section-wrapper relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-4 py-2 mb-6 border border-primary/10">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-medium text-primary">Enterprise Use Cases</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Built for{' '}
            <span className="gradient-text">Every Industry</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Industry-specific AI governance solutions designed to meet 
            unique regulatory and operational requirements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, idx) => (
            <div
              key={idx}
              className={`
                group relative premium-card overflow-hidden
                ${idx === 3 ? 'lg:col-span-2' : ''}
                hover:border-primary/20 transition-all duration-500
              `}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div 
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${useCase.gradient} opacity-5`}
                  style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
                />
                <div className="absolute inset-[1px] rounded-2xl bg-background" />
              </div>
              
              <div className="relative z-10">
                <div className={`
                  w-14 h-14 rounded-2xl bg-gradient-to-br ${useCase.gradient}
                  flex items-center justify-center mb-5
                  group-hover:scale-110 group-hover:rotate-6 transition-all duration-300
                  shadow-lg
                `}>
                  <useCase.icon className="w-7 h-7 " />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {useCase.industry}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
                
                <div className="mt-5 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <span className={`bg-gradient-to-r ${useCase.gradient} bg-clip-text text-transparent`}>
                    View case study
                  </span>
                  <span className="text-lg">→</span>
                </div>
              </div>
              
              <div className={`
                absolute -bottom-8 -right-8 w-32 h-32 rounded-full
                bg-gradient-to-br ${useCase.gradient} opacity-5
                group-hover:opacity-10 transition-opacity
              `} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

