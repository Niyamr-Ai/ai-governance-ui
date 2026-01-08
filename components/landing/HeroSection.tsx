"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Shield, Eye, Cpu } from "lucide-react";
import NeuralNetwork from "@/components/landing/NeuralNetwork";

/** ----------------------------------------
 * Types
 * ---------------------------------------*/
type Stat = {
  value: string;
  label: string;
};

/** ----------------------------------------
 * Component
 * ---------------------------------------*/
const HeroSection: React.FC = () => {
  const stats: Stat[] = [
    { value: "500+", label: "AI Agents Secured" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "SOC2", label: "Certified" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <NeuralNetwork />

      {/* Floating Glass Panels */}
      <div className="absolute top-1/4 left-10 glass rounded-2xl p-4 float hidden lg:block shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Security Status</p>
            <p className="text-sm font-semibold text-foreground">Protected</p>
          </div>
        </div>
      </div>

      <div className="absolute top-1/3 right-16 glass rounded-2xl p-4 float-delayed hidden lg:block shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">AI Agents</p>
            <p className="text-sm font-semibold text-foreground">127 Active</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-1/3 left-20 glass rounded-2xl p-4 float-slow hidden lg:block shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Compliance</p>
            <p className="text-sm font-semibold text-foreground">100%</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8 animate-fade-in-up shadow-soft">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">
              AI Governance Platform
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Govern AI with <span className="gradient-text">Confidence</span>
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl">
              Secure Every Agent, Every Workflow
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            The unified AI Governance OS for enterprise safety, compliance,
            trust, and observability. Complete visibility and control across
            your entire AI ecosystem.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button variant="hero" size="xl" className="group min-w-[180px]">
              Get a Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>

            <Button variant="hero-outline" size="xl" className="group min-w-[180px]">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Explore Platform
            </Button>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            {stats.map((stat: Stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;

