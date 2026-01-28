"use client";
import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Download, Shield, FileCheck, AlertTriangle, Sparkles } from 'lucide-react';

export default function ComplianceCheckSection() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const quickCheckItems = [
    { id: 'pii', label: 'Processes PII or sensitive data', risk: 'high' },
    { id: 'thirdparty', label: 'Uses third-party foundation models', risk: 'medium' },
    { id: 'production', label: 'Deployed to production users', risk: 'high' },
    { id: 'critical', label: 'Safety-critical or regulated domain', risk: 'critical' },
  ];

  const complianceStandards = [
    { 
      id: 'euai', 
      name: 'EU AI Act', 
      icon: '🇪🇺',
      details: 'Risk class assessment & obligations',
      coverage: 85,
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      id: 'nist', 
      name: 'NIST AI RMF', 
      icon: '🛡️',
      details: 'Controls mapped & scored',
      coverage: 92,
      color: 'from-purple-500 to-pink-500'
    },
   
  
  ];

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    const newScore = (selectedItems.length / quickCheckItems.length) * 100;
    setScore(newScore);
    
    if (newScore === 100 && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [selectedItems]);

  const getRiskLevel = () => {
    const criticalSelected = selectedItems.includes('critical');
    const highRiskCount = selectedItems.filter(id => 
      quickCheckItems.find(item => item.id === id)?.risk === 'high'
    ).length;

    if (criticalSelected || highRiskCount >= 2) return { level: 'High Priority', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (highRiskCount === 1) return { level: 'Medium Priority', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { level: 'Standard Review', color: 'text-green-500', bg: 'bg-green-500/10' };
  };

  const riskLevel = getRiskLevel();

  return (
    <section className="relative py-12 overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-[fall_3s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#5B7FCE', '#64C1FF', '#22C55E', '#F59E0B'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/5 rounded-full px-4 py-2 mb-6 border border-accent/20">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">AI Compliance Check</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Instantly Evaluate Your{' '}
            <span className="gradient-text">AI Systems</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get a prioritized list of actions and export evidence for auditors. 
            Real-time assessment against leading global standards.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* LEFT - Quick Pre-Check */}
          <div className="space-y-6">
            <div className="glass-panel-glow p-8 shadow-premium">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Quick Pre-Check</h3>
                  <p className="text-sm text-muted-foreground">Select what applies to your AI system</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {quickCheckItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                        ${isSelected 
                          ? 'bg-primary/10 border-2 border-primary/30 shadow-blue' 
                          : 'bg-background/50 border-2 border-border/30 hover:border-primary/20'
                        }
                      `}
                    >
                      <div className={`
                        w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300
                        ${isSelected ? 'bg-gradient-to-br from-primary to-accent' : 'bg-secondary/50'}
                      `}>
                        {isSelected ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className={`
                        flex-1 text-left font-medium transition-colors
                        ${isSelected ? 'text-foreground' : 'text-muted-foreground'}
                      `}>
                        {item.label}
                      </span>
                      {item.risk === 'critical' && (
                        <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-semibold">
                          Critical
                        </span>
                      )}
                      {item.risk === 'high' && (
                        <span className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-500 text-xs font-semibold">
                          High
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Score Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Readiness Score</span>
                  <span className="font-bold text-foreground">{Math.round(score)}%</span>
                </div>
                <div className="h-3 bg-secondary/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out rounded-full"
                    style={{ width: `${score}%` }}
                  />
                </div>
                
                {/* Risk Level Badge */}
                {selectedItems.length > 0 && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl ${riskLevel.bg} animate-fade-in-up`}>
                    <AlertTriangle className={`w-5 h-5 ${riskLevel.color}`} />
                    <span className={`font-semibold ${riskLevel.color}`}>
                      Assessment Priority: {riskLevel.level}
                    </span>
                  </div>
                )}
              </div>

              {/* Tip Box */}
              <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-accent">💡 Tip:</span> Full checks also score 
                  documentation, logging, evals, data governance, and runtime protections.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT - Compliance Standards */}
          <div className="space-y-6 ">
            <div className="glass-panel p-8 shadow-premium rounded-xl">
              <div className="flex items-center gap-3 mb-6 ">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Standards Coverage</h3>
                  <p className="text-sm text-muted-foreground">Real-time compliance mapping</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {complianceStandards.map((standard) => (
                  <div 
                    key={standard.id}
                    className="group p-5 rounded-xl bg-background/50 border border-border/30 hover:border-primary/20 transition-all duration-300 hover:shadow-soft"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="text-3xl">{standard.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{standard.name}</h4>
                        <p className="text-sm text-muted-foreground">{standard.details}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold bg-gradient-to-r ${standard.color} bg-clip-text text-transparent`}>
                          {standard.coverage}%
                        </div>
                        <div className="text-xs text-muted-foreground">covered</div>
                      </div>
                    </div>
                    
                    {/* Coverage Bar */}
                    <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${standard.color} rounded-full transition-all duration-700`}
                        style={{ width: `${standard.coverage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full py-4 px-6 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-accent transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 group">
                  <Shield className="w-5 h-5" />
                  Check Full Compliance
                  <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                </button>
                
                <button className="w-full py-3 px-6 border-2 border-border/30 text-foreground font-medium rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Audit Evidence
                </button>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/30">
                <div className="text-center p-3 rounded-xl bg-primary/5">
                  <div className="text-xl font-bold gradient-text mb-1">
                    {selectedItems.length}/{quickCheckItems.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Factors Checked</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-accent/5">
                  <div className="text-xl font-bold gradient-text mb-1">4</div>
                  <div className="text-xs text-muted-foreground">Standards Mapped</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}

