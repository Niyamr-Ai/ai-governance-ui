"use client";

/**
 * RiskForm Component
 * 
 * Form for creating a new risk assessment.
 * Handles all four categories: bias, robustness, privacy, explainability.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X, AlertCircle } from "lucide-react";
import type { CreateRiskAssessmentInput, RiskCategory, RiskLevel } from "@/ai-governance-backend/types/risk-assessment";
import { RiskGuidancePanel, FieldGuidance } from "@/components/ui/risk-guidance";

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.summary || formData.summary.trim().length < 10) {
      newErrors.summary = "Summary must be at least 10 characters";
    }

    if (!formData.risk_level) {
      newErrors.risk_level = "Risk level is required";
    }

    // Governance Rule: High risk assessments require evidence
    if (formData.risk_level === 'high' && (!formData.evidence_links || formData.evidence_links.length === 0)) {
      newErrors.evidence_links = "High-risk assessments require at least one evidence link";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
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

  return (
    <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-white">Create Risk Assessment</CardTitle>
        <CardDescription className="text-slate-300">
          Assess risks across bias, robustness, privacy, or explainability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-white">
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value: RiskCategory) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger
                id="category"
                className="bg-slate-800/50 border-slate-700/50 text-white focus:border-purple-500/50"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="bias" className="text-white hover:bg-slate-700">
                  Bias & Fairness
                </SelectItem>
                <SelectItem value="robustness" className="text-white hover:bg-slate-700">
                  Robustness & Performance
                </SelectItem>
                <SelectItem value="privacy" className="text-white hover:bg-slate-700">
                  Privacy & Data Leakage
                </SelectItem>
                <SelectItem value="explainability" className="text-white hover:bg-slate-700">
                  Explainability
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-400">{errors.category}</p>
            )}
          </div>

          {/* RAG-Powered Guidance Panel */}
          {formData.category && (
            <RiskGuidancePanel 
              category={formData.category}
              riskLevel={formData.risk_level}
              className="bg-slate-800/30 border-slate-600/50"
            />
          )}

          {/* Risk Level */}
          <div className="space-y-2">
            <Label htmlFor="risk_level" className="text-white">
              Risk Level *
            </Label>
            <Select
              value={formData.risk_level}
              onValueChange={(value: RiskLevel) =>
                setFormData({ ...formData, risk_level: value })
              }
            >
              <SelectTrigger
                id="risk_level"
                className="bg-slate-800/50 border-slate-700/50 text-white focus:border-purple-500/50"
              >
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="low" className="text-white hover:bg-slate-700">
                  Low
                </SelectItem>
                <SelectItem value="medium" className="text-white hover:bg-slate-700">
                  Medium
                </SelectItem>
                <SelectItem value="high" className="text-white hover:bg-slate-700">
                  High
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.risk_level && (
              <p className="text-sm text-red-400">{errors.risk_level}</p>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <FieldGuidance field="summary" category={formData.category} riskLevel={formData.risk_level}>
              <Label htmlFor="summary" className="text-white">
                Summary *
              </Label>
            </FieldGuidance>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              placeholder="Provide a detailed summary of the risk assessment findings..."
              className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-purple-500/50 min-h-[120px]"
              required
            />
            {errors.summary && (
              <p className="text-sm text-red-400">{errors.summary}</p>
            )}
            <p className="text-xs text-slate-400">
              Minimum 10 characters required
            </p>
          </div>

          {/* Evidence Links */}
          <div className="space-y-2">
            <FieldGuidance field="evidence_links" category={formData.category} riskLevel={formData.risk_level}>
              <Label className="text-white">
                Evidence Links
                {formData.risk_level === 'high' && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </Label>
            </FieldGuidance>
            {formData.risk_level === 'high' && (
              <p className="text-xs text-amber-400">
                Required for high-risk assessments
              </p>
            )}
            <div className="flex gap-2">
              <Input
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
                placeholder="URL or file path to evidence"
                className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-purple-500/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEvidenceLink();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addEvidenceLink}
                variant="outline"
                className="border-purple-500/50 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.evidence_links && formData.evidence_links.length > 0 && (
              <div className="space-y-2 mt-2">
                {formData.evidence_links.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-800/30 px-3 py-2 rounded border border-slate-700/50"
                  >
                    <span className="text-slate-300 text-sm truncate flex-1">
                      {link}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvidenceLink(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Alert */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="bg-red-900/50 border-red-700/50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                Please fix the errors above before submitting.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-slate-700/50 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/50"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Assessment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
