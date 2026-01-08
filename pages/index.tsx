"use client";

import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import VisibilitySection from '@/components/landing/VisibilitySection';
import SecuritySection from '@/components/landing/SecuritySection';
import ModulesSection from '@/components/landing/ModulesSection';
import NeuralFlowSection from '@/components/landing/NeuralFlowSection';
import UseCasesSection from '@/components/landing/UseCasesSection';
import DashboardSection from '@/components/landing/DashboardSection';
import ValuePropsSection from '@/components/landing/ValuePropsSection';
import TrustedBySection from '@/components/landing/TrustedBySection';
import Footer from '@/components/landing/Footer';
import ChallengeSection from '@/components/landing/ChallengeSection';
import ComplianceCheckSection from '@/components/landing/ComplianceCheckSection';
import AIPlaygroundSection from '@/components/landing/AIPlaygroundSection';

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <HeroSection />
        <VisibilitySection />
        <AIPlaygroundSection />
        <SecuritySection />
        <ModulesSection />
        <ChallengeSection />
        <ComplianceCheckSection />
        <NeuralFlowSection />
        <UseCasesSection />
        <DashboardSection />
        <ValuePropsSection />
        <TrustedBySection />
      </main>
      <Footer />
        </div>
  );
}