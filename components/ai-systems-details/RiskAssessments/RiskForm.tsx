"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, Info, Plus, X } from "lucide-react";
import type { CreateRiskAssessmentInput, RiskCategory, RiskLevel } from "@/types/risk-assessment";

interface RiskFormProps {
  aiSystemId: string;
  onSubmit: (data: CreateRiskAssessmentInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function RiskForm({ aiSystemId, onSubmit, onCancel, loading }: RiskFormProps) {
  const [formData, setFormData] = useState<CreateRiskAssessmentInput>({
    ai_system_id: aiSystemId,
    category: "bias",
    summary: "",
    risk_level: "medium",
    metrics: {},
    evidence_links: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [evidenceLink, setEvidenceLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalFormData = { ...formData };
    if (evidenceLink.trim()) {
      finalFormData = {
        ...formData,
        evidence_links: [...(formData.evidence_links || []), evidenceLink.trim()],
      };
      setEvidenceLink("");
    }

    const newErrors: Record<string, string> = {};
    if (!finalFormData.category) newErrors.category = "Category is required";
    if (!finalFormData.summary || finalFormData.summary.trim().length < 10) newErrors.summary = "Summary must be at least 10 characters";
    if (!finalFormData.risk_level) newErrors.risk_level = "Risk level is required";

    const hasEvidence = finalFormData.evidence_links && finalFormData.evidence_links.length > 0;
    if (finalFormData.risk_level === "high" && !hasEvidence) {
      newErrors.evidence_links = "High-risk assessments require at least one evidence link";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      await onSubmit(finalFormData);
    } catch (error) {
      console.error("Error submitting risk assessment:", error);
    }
  };

  const addEvidenceLink = () => {
    if (evidenceLink.trim()) {
      setFormData({
        ...formData,
        evidence_links: [...(formData.evidence_links || []), evidenceLink.trim()],
      });
      setEvidenceLink("");
    }
  };

  const removeEvidenceLink = (index: number) => {
    setFormData({
      ...formData,
      evidence_links: formData.evidence_links?.filter((_, i) => i !== index) || [],
    });
  };

  const getCategoryQuestions = (category: RiskCategory): string => {
    switch (category) {
      case "bias":
        return "What bias or fairness issues were identified? Include:\n• Demographic parity results\n• Equal opportunity metrics\n• Calibration differences\n• Protected attributes tested";
      case "robustness":
        return "What robustness or performance issues were found? Include:\n• Adversarial attack test results\n• Performance on edge cases\n• Error handling failures";
      case "privacy":
        return "What privacy or data leakage risks were identified? Include:\n• Data minimization gaps\n• Anonymization effectiveness issues\n• Inference attack vulnerabilities";
      case "explainability":
        return "What explainability gaps were discovered? Include:\n• Feature importance clarity\n• Decision transparency issues\n• Model interpretability limitations";
      default:
        return "Describe the risk assessment findings and key observations...";
    }
  };

  const getCategoryPlaceholder = (category: RiskCategory): string => {
    switch (category) {
      case "bias":
        return "Example: Demographic parity analysis shows 15% disparity in approval rates between groups...";
      case "robustness":
        return "Example: Model accuracy drops 8% on adversarial examples...";
      case "privacy":
        return "Example: Data minimization review identified unnecessary collection of personal data...";
      case "explainability":
        return "Example: Feature importance explanations are unclear for non-technical users...";
      default:
        return "Describe the risk assessment findings...";
    }
  };

  const riskBadgeClasses = {
    low: "border-[#8EC4F8] bg-[#D9EEFF] text-[#2573C2]",
    medium: "border-[#F2CD69] bg-[#FFF3CF] text-[#A97B00]",
    high: "border-[#F1A4A4] bg-[#FFE0E0] text-[#C71F1F]",
  };

  return (
    <section className="overflow-hidden rounded-[15px] border border-[#CBD5E1] bg-white shadow-[0px_3.5px_7px_-1.75px_rgba(23,23,23,0.10)]">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
        <div>
          <h2 className="text-[17px] font-bold text-[#1E293B]">Create Risk Assessment</h2>
          <p className="mt-1 text-[13px] text-[#667085]">Assess risks across bias, robustness, privacy, or explainability</p>
        </div>
        {formData.risk_level && (
          <span className={`inline-flex rounded-full border px-3 py-1.5 text-[12px] font-bold ${riskBadgeClasses[formData.risk_level]}`}>
            {formData.risk_level.charAt(0).toUpperCase() + formData.risk_level.slice(1)} Risk
          </span>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-[#1E293B]">Category *</label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as RiskCategory })}
                className="h-10 w-full appearance-none rounded-[8px] border border-[#CBD5E1] bg-white px-3 pr-10 text-[14px] text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
              >
                <option value="bias">Bias & Fairness</option>
                <option value="robustness">Robustness & Performance</option>
                <option value="privacy">Privacy & Data Leakage</option>
                <option value="explainability">Explainability</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
            {errors.category && (
              <p className="flex items-center gap-1 text-[12px] text-[#C71F1F]">
                <AlertCircle className="h-3 w-3" />
                {errors.category}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-[#1E293B]">Risk Level *</label>
            <div className="relative">
              <select
                value={formData.risk_level}
                onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as RiskLevel })}
                className="h-10 w-full appearance-none rounded-[8px] border border-[#CBD5E1] bg-white px-3 pr-10 text-[14px] text-[#1E293B] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
            {errors.risk_level && (
              <p className="flex items-center gap-1 text-[12px] text-[#C71F1F]">
                <AlertCircle className="h-3 w-3" />
                {errors.risk_level}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[13px] font-semibold text-[#1E293B]">Assessment Details *</label>
            <div className="group relative">
              <Info className="h-3.5 w-3.5 cursor-help text-[#94A3B8]" />
              <div className="absolute left-1/2 top-full z-10 mt-2 hidden w-64 -translate-x-1/2 rounded-[8px] border border-[#E2E8F0] bg-white p-3 text-[11px] text-[#475569] shadow-lg group-hover:block">
                {getCategoryQuestions(formData.category)}
              </div>
            </div>
          </div>
          <div className="rounded-[8px] border border-[#93C5FD] bg-[#EFF6FF] p-3">
            <p className="mb-1 text-[11px] font-semibold text-[#1E40AF]">What to include:</p>
            <p className="whitespace-pre-line text-[11px] text-[#3B82F6]">{getCategoryQuestions(formData.category)}</p>
          </div>
          <textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder={getCategoryPlaceholder(formData.category)}
            className="min-h-[120px] w-full resize-y rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2.5 text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            required
          />
          {errors.summary ? (
            <p className="flex items-center gap-1 text-[12px] text-[#C71F1F]">
              <AlertCircle className="h-3 w-3" />
              {errors.summary}
            </p>
          ) : (
            <p className="text-[11px] text-[#94A3B8]">{formData.summary.length}/10 minimum characters</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[13px] font-semibold text-[#1E293B]">
              Evidence Links {formData.risk_level === "high" && <span className="text-[#C71F1F]">*</span>}
            </label>
            {formData.risk_level === "high" && (
              <span className="rounded-full bg-[#FFE0E0] px-2 py-0.5 text-[10px] font-semibold text-[#C71F1F]">Required</span>
            )}
          </div>
          <div className="rounded-[8px] border border-[#F2CD69] bg-[#FFFBEB] p-3">
            <p className="mb-1 text-[11px] font-semibold text-[#92400E]">Why evidence links?</p>
            <p className="text-[11px] text-[#B45309]">
              Evidence links validate your assessment and support decision-making.
              {formData.risk_level === "high" && <span className="font-semibold"> High-risk assessments require evidence for regulatory compliance.</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={evidenceLink}
              onChange={(e) => setEvidenceLink(e.target.value)}
              placeholder="Enter URL or file path"
              className="h-9 flex-1 rounded-[8px] border border-[#CBD5E1] bg-white px-3 text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addEvidenceLink();
                }
              }}
            />
            <button
              type="button"
              onClick={addEvidenceLink}
              className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#3B82F6] bg-[#EAF4FF] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {formData.evidence_links && formData.evidence_links.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {formData.evidence_links.map((link, index) => (
                <div key={index} className="flex items-center justify-between rounded-[6px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5">
                  <span className="truncate text-[12px] text-[#475569]">{link}</span>
                  <button type="button" onClick={() => removeEvidenceLink(index)} className="ml-2 p-1 text-[#C71F1F] hover:bg-[#FFE0E0] rounded transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.evidence_links && (
            <p className="flex items-center gap-1 text-[12px] text-[#C71F1F]">
              <AlertCircle className="h-3 w-3" />
              {errors.evidence_links}
            </p>
          )}
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="flex items-center gap-3 rounded-[8px] border border-[#F1A4A4] bg-[#FFE0E0] px-4 py-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#C71F1F]" />
            <p className="text-[13px] text-[#C71F1F]">Please fix the errors above before submitting.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-10 rounded-[8px] border border-[#CBD5E1] bg-white px-5 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-[8px] bg-[#3B82F6] px-5 text-[13px] font-semibold text-white shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Assessment"}
          </button>
        </div>
      </form>
    </section>
  );
}
