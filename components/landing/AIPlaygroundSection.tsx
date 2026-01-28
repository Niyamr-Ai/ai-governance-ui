"use client";

import { useState } from "react";
import {
    Brain,
    Upload,
    Cog,
    CheckCircle2,
    ArrowRight,
    Activity,
    Shield,
    Scale,
    Eye,
    Database,
    ScrollText,
    ShieldAlert,
    HeartHandshake,
    Map,
    Search,
    FileCheck,
    type LucideIcon,
} from "lucide-react";

// ============================================
// RISK ASSESSMENT DEMO COMPONENT
// ============================================

const riskScores = {
    model: { score: 6.5, level: "Medium Risk", color: "text-orange-500" },
    privacy: { score: 3.2, level: "Low Risk", color: "text-green-500" },
    regulatory: { score: 8.1, level: "High Risk", color: "text-red-500" },
} as const;

type RiskCategory = keyof typeof riskScores;

const riskCategories: Array<{ id: RiskCategory; label: string; gradient: string }> = [
    { id: "model", label: "Model Risk", gradient: "from-blue-500 to-cyan-400" },
    { id: "privacy", label: "Data Privacy", gradient: "from-purple-500 to-pink-500" },
    { id: "regulatory", label: "Regulatory", gradient: "from-orange-500 to-amber-400" },
];

function RiskAssessmentDemo() {
    const [activeCategory, setActiveCategory] = useState<RiskCategory>("model");
    const currentRisk = riskScores[activeCategory];

    return (
        <div className="glass-panel rounded-3xl p-6 lg:p-8 shadow-premium">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Risk Assessment Engine</h3>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3 mb-8">
                {riskCategories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${activeCategory === category.id
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {activeCategory === category.id && (
                            <div
                                className={`absolute inset-0 rounded-xl bg-gradient-to-r ${category.gradient} opacity-20`}
                            />
                        )}
                        <div
                            className={`absolute inset-0 rounded-xl border ${activeCategory === category.id
                                ? "border-primary/30"
                                : "border-border hover:border-primary/20"
                                }`}
                        />
                        <span className="relative z-10">{category.label}</span>
                    </button>
                ))}
            </div>

            {/* Workflow Visualization */}
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 mb-8 py-4">
                {/* Input Node */}
                <div className="flex-1 glass-panel rounded-2xl p-5 border border-border text-center group hover:border-primary/30 transition-all">
                    <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-3">
                        <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">AI System Upload</p>
                    <p className="text-xs text-muted-foreground mt-1">Source Data</p>
                </div>

                {/* Arrow 1 */}
                <div className="hidden md:flex items-center justify-center w-16 relative">
                    <div className="w-full h-0.5 bg-gradient-to-r from-primary to-accent" />
                    <div className="absolute overflow-hidden w-full">
                        <ArrowRight className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                </div>
                <ArrowRight className="md:hidden w-6 h-6 text-primary rotate-90" />

                {/* Process Node */}
                <div className="flex-1 glass-panel rounded-2xl p-5 border border-primary/30 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5" />
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse-glow" />
                    <div className="relative z-10">
                        <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary to-accent mb-3">
                            <Cog
                                className="w-6 h-6 text-white animate-spin"
                                style={{ animationDuration: "4s" }}
                            />
                        </div>
                        <p className="text-sm font-medium text-foreground">Risk Analysis</p>
                        <div className="flex items-center justify-center gap-1.5 mt-1">
                            <Activity className="w-3 h-3 text-primary" />
                            <p className="text-xs text-primary">Processing...</p>
                        </div>
                    </div>
                </div>

                {/* Arrow 2 */}
                <div className="hidden md:flex items-center justify-center w-16 relative">
                    <div className="w-full h-0.5 bg-gradient-to-r from-accent to-green-500" />
                    <div className="absolute overflow-hidden w-full">
                        <ArrowRight className="w-4 h-4 text-accent animate-pulse" />
                    </div>
                </div>
                <ArrowRight className="md:hidden w-6 h-6 text-accent rotate-90" />

                {/* Output Node */}
                <div className="flex-1 glass-panel rounded-2xl p-5 border border-border text-center group hover:border-green-500/30 transition-all">
                    <div className="inline-flex p-3 rounded-xl bg-green-500/10 mb-3">
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <p className={`text-lg font-bold ${currentRisk.color}`}>{currentRisk.score}/10</p>
                    <p className={`text-xs font-medium ${currentRisk.color} mt-1`}>{currentRisk.level}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">500+</span> Systems Assessed
                    </span>
                </div>
                <div className="w-px h-4 bg-border hidden sm:block" />
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">99.8%</span> Accuracy
                    </span>
                </div>
            </div>
        </div>
    );
}

// ============================================
// RISK CATEGORY CARD COMPONENT
// ============================================

const badgeClasses = {
    success: "bg-green-500/10 text-green-500 border border-green-500/30",
    warning: "bg-orange-500/10 text-orange-500 border border-orange-500/30",
    danger: "bg-red-500/10 text-red-500 border border-red-500/30",
    info: "bg-blue-500/10 text-blue-500 border border-blue-500/30",
    purple: "bg-purple-500/10 text-purple-500 border border-purple-500/30",
    yellow: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30",
} as const;

type BadgeVariant = keyof typeof badgeClasses;

interface RiskCategoryCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    badgeText: string;
    badgeVariant: BadgeVariant;
}

function RiskCategoryCard({ icon: Icon, title, description, badgeText, badgeVariant }: RiskCategoryCardProps) {
    return (
        <div className="group relative glass-panel rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 hover:shadow-blue cursor-pointer">
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-border">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClasses[badgeVariant]}`}>
                        {badgeText}
                    </span>
                </div>

                <div>
                    <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
            </div>
        </div>
    );
}

// ============================================
// RISK CATEGORIES GRID COMPONENT
// ============================================

const riskCategoriesData: Array<{
    icon: LucideIcon;
    title: string;
    description: string;
    badgeText: string;
    badgeVariant: BadgeVariant;
}> = [
    {
        icon: Scale,
        title: "Bias Detection",
        description: "Identify discriminatory patterns in AI outputs",
        badgeText: "Active",
        badgeVariant: "success",
    },
    {
        icon: Eye,
        title: "Explainability Gaps",
        description: "Ensure model transparency and interpretability",
        badgeText: "8 gaps",
        badgeVariant: "warning",
    },
    {
        icon: Database,
        title: "Data Governance",
        description: "Track data lineage & consent management",
        badgeText: "Monitored",
        badgeVariant: "info",
    },
    {
        icon: ScrollText,
        title: "Regulatory Alignment",
        description: "EU AI Act, GDPR compliance tracking",
        badgeText: "100%",
        badgeVariant: "purple",
    },
    {
        icon: ShieldAlert,
        title: "Security Vulnerabilities",
        description: "Detect model poisoning & adversarial risks",
        badgeText: "2 alerts",
        badgeVariant: "danger",
    },
    {
        icon: HeartHandshake,
        title: "Ethical Concerns",
        description: "Flag misalignment with organizational policies",
        badgeText: "Review",
        badgeVariant: "yellow",
    },
];

function RiskCategoriesGrid() {
    return (
        <div className="glass-panel rounded-3xl p-6 lg:p-8 shadow-premium">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-accent/20 border border-accent/20">
                    <ShieldAlert className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Enterprise Risk Coverage</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {riskCategoriesData.map((category, index) => (
                    <div
                        key={category.title}
                        className="animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <RiskCategoryCard {...category} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================
// REGULATORY FEATURE CARD COMPONENT
// ============================================

interface RegulatoryFeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    example: string;
}

function RegulatoryFeatureCard({ icon: Icon, title, description, example }: RegulatoryFeatureCardProps) {
    return (
        <div className="group glass-panel rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:border-accent/30 hover:shadow-glow-accent">
            <div className="flex flex-col gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-pink-500/10 border border-accent/20 w-fit">
                    <Icon className="w-6 h-6 text-accent" />
                </div>

                <div>
                    <h4 className="font-semibold text-lg text-foreground mb-2 group-hover:text-accent transition-colors">
                        {title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">{description}</p>
                    <div className="glass-panel rounded-xl p-3 border border-accent/20">
                        <p className="text-xs text-accent font-medium">{example}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// REGULATORY SECTION COMPONENT
// ============================================

const regulatoryFeatures = [
    {
        icon: Map,
        title: "Obligation Mapping",
        description: "Auto-map requirements to EU AI Act articles",
        example: "Mapped 89 obligations to Article 9",
    },
    {
        icon: Search,
        title: "Gap Analysis",
        description: "Identify compliance gaps instantly",
        example: "3 critical gaps in data governance",
    },
    {
        icon: FileCheck,
        title: "Evidence Collection",
        description: "Track compliance evidence & audit trail",
        example: "247 evidence items collected",
    },
];

function RegulatorySection() {
    return (
        <div className="relative rounded-3xl overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" />
            <div
                className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-500/20 rounded-full blur-3xl animate-pulse-glow"
                style={{ animationDelay: "1s" }}
            />

            <div className="relative glass-panel-glow rounded-3xl p-6 lg:p-10 border-2 border-accent/20 shadow-premium">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-accent to-pink-500 shadow-glow-accent">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                            Regulatory AI Engine
                        </h3>
                        <p className="text-muted-foreground">
                            Intelligent compliance automation for AI governance
                        </p>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {regulatoryFeatures.map((feature, index) => (
                        <div
                            key={feature.title}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <RegulatoryFeatureCard {...feature} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================
// MAIN RISK ASSESSMENT SHOWCASE COMPONENT
// ============================================

export default function AIPlaygroundSection() {
    return (
        <section className="relative min-h-screen py-20 lg:py-28 overflow-hidden bg-background">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />

            {/* Floating orbs */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
            <div
                className="absolute bottom-40 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-glow"
                style={{ animationDelay: "2s" }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-float" />

            <div className="container relative z-10 px-4 mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-16 lg:mb-20">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/30 mb-6 animate-fade-in-up shadow-soft">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">AI Risk Intelligence</span>
                    </div>

                    {/* Heading */}
                    <h2
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up"
                        style={{ animationDelay: "100ms" }}
                    >
                        Assess AI Risks in <span className="gradient-text">Real-Time</span>
                    </h2>

                    {/* Subtitle */}
                    <p
                        className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up"
                        style={{ animationDelay: "200ms" }}
                    >
                        Identify, classify, and mitigate AI risks across your entire organization with
                        automated risk scoring and intelligent compliance monitoring.
                    </p>
                </div>

                {/* Main Content - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                    {/* Left Column - Interactive Demo */}
                    <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                        <RiskAssessmentDemo />
                    </div>

                    {/* Right Column - Risk Categories */}
                    <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                        <RiskCategoriesGrid />
                    </div>
                </div>

                {/* Bottom Section - Regulatory AI Intelligence */}
                {/* <div className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
                    <RegulatorySection />
                </div> */}
            </div>
        </section>
    );
}

