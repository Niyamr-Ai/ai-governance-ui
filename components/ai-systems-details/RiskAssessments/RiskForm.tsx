"use client";

/**
 * RiskForm Component
 * 
 * Clean, compact form for creating a new risk assessment.
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, X, AlertCircle, Info } from "lucide-react";
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
    // Check both the array and the input field (in case user typed but didn't click +)
    const hasEvidenceInArray = formData.evidence_links && formData.evidence_links.length > 0;
    const hasEvidenceInInput = evidenceLink.trim().length > 0;
    
    if (formData.risk_level === 'high' && !hasEvidenceInArray && !hasEvidenceInInput) {
      newErrors.evidence_links = "High-risk assessments require at least one evidence link. Click the '+' button to add the link.";
    } else if (formData.risk_level === 'high' && !hasEvidenceInArray && hasEvidenceInInput) {
      // User typed a link but didn't add it - show helpful message
      newErrors.evidence_links = "Please click the '+' button to add the evidence link before submitting.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-add evidence link from input field if user typed but didn't click +
    let finalFormData = { ...formData };
    if (evidenceLink.trim()) {
      finalFormData = {
        ...formData,
        evidence_links: [...(formData.evidence_links || []), evidenceLink.trim()],
      };
      // Clear the input since we're adding it
      setEvidenceLink("");
    }
    
    // Validate with the updated form data
    const newErrors: Record<string, string> = {};
    if (!finalFormData.category) {
      newErrors.category = "Category is required";
    }
    if (!finalFormData.summary || finalFormData.summary.trim().length < 10) {
      newErrors.summary = "Summary must be at least 10 characters";
    }
    if (!finalFormData.risk_level) {
      newErrors.risk_level = "Risk level is required";
    }
    
    // Governance Rule: High risk assessments require evidence
    const hasEvidence = finalFormData.evidence_links && finalFormData.evidence_links.length > 0;
    if (finalFormData.risk_level === 'high' && !hasEvidence) {
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

  const getRiskBadgeVariant = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Category-specific questions and guidance
  const getCategoryQuestions = (category: RiskCategory): string => {
    switch (category) {
      case 'bias':
        return 'What bias or fairness issues were identified? Include:\n• Demographic parity results (e.g., approval rates across groups)\n• Equal opportunity metrics\n• Calibration differences\n• Protected attributes tested\n• Specific examples of unfair treatment';
      case 'robustness':
        return 'What robustness or performance issues were found? Include:\n• Adversarial attack test results\n• Performance on edge cases or unusual inputs\n• Error handling failures\n• Accuracy degradation scenarios\n• Stress test outcomes';
      case 'privacy':
        return 'What privacy or data leakage risks were identified? Include:\n• Data minimization gaps\n• Anonymization effectiveness issues\n• Inference attack vulnerabilities\n• Re-identification risks\n• GDPR compliance concerns';
      case 'explainability':
        return 'What explainability gaps were discovered? Include:\n• Feature importance clarity\n• Decision transparency issues\n• Counterfactual explanation quality\n• Model interpretability limitations\n• User understanding barriers';
      default:
        return 'Describe the risk assessment findings and key observations...';
    }
  };

  const getCategoryPlaceholder = (category: RiskCategory): string => {
    switch (category) {
      case 'bias':
        return 'Example: Demographic parity analysis shows 15% disparity in approval rates between groups. Equal opportunity testing revealed...';
      case 'robustness':
        return 'Example: Model accuracy drops 8% on adversarial examples. Performance degrades significantly when handling edge cases such as...';
      case 'privacy':
        return 'Example: Data minimization review identified unnecessary collection of personal data. Anonymization techniques show potential for...';
      case 'explainability':
        return 'Example: Feature importance explanations are unclear for non-technical users. Decision transparency is limited when...';
      default:
        return 'Describe the risk assessment findings and key observations...';
    }
  };

  return (
    <Card className="glass-panel shadow-elevated border-border/50 rounded-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground text-xl">Create Risk Assessment</CardTitle>
            <CardDescription className="text-muted-foreground text-sm mt-1">
              Assess risks across bias, robustness, privacy, or explainability
            </CardDescription>
          </div>
          {formData.risk_level && (
            <Badge variant={getRiskBadgeVariant(formData.risk_level)} className="text-sm px-3 py-1">
              {formData.risk_level.charAt(0).toUpperCase() + formData.risk_level.slice(1)} Risk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category and Risk Level - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-foreground">
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
                  className="bg-background border-border/50 text-foreground focus:border-primary/50 rounded-lg h-10"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border/50 rounded-lg">
                  <SelectItem value="bias" className="text-foreground hover:bg-secondary/50">
                    Bias & Fairness
                  </SelectItem>
                  <SelectItem value="robustness" className="text-foreground hover:bg-secondary/50">
                    Robustness & Performance
                  </SelectItem>
                  <SelectItem value="privacy" className="text-foreground hover:bg-secondary/50">
                    Privacy & Data Leakage
                  </SelectItem>
                  <SelectItem value="explainability" className="text-foreground hover:bg-secondary/50">
                    Explainability
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.category}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk_level" className="text-sm font-medium text-foreground">
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
                  className="bg-background border-border/50 text-foreground focus:border-primary/50 rounded-lg h-10"
                >
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border/50 rounded-lg">
                  <SelectItem value="low" className="text-foreground hover:bg-secondary/50">
                    Low
                  </SelectItem>
                  <SelectItem value="medium" className="text-foreground hover:bg-secondary/50">
                    Medium
                  </SelectItem>
                  <SelectItem value="high" className="text-foreground hover:bg-secondary/50">
                    High
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.risk_level && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.risk_level}
                </p>
              )}
            </div>
          </div>

          {/* Summary with Category-Specific Guidance */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="summary" className="text-sm font-medium text-foreground">
                  Assessment Details *
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">{getCategoryQuestions(formData.category)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-3 mb-2">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                What to include:
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-line">
                {getCategoryQuestions(formData.category)}
              </p>
            </div>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              placeholder={getCategoryPlaceholder(formData.category)}
              className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 min-h-[120px] rounded-lg text-sm"
              required
            />
            {errors.summary && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.summary}
              </p>
            )}
            {!errors.summary && (
              <p className="text-xs text-muted-foreground">
                {formData.summary.length}/10 minimum characters
              </p>
            )}
          </div>

          {/* Evidence Links */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Evidence Links
                  {formData.risk_level === 'high' && (
                    <span className="text-red-600 ml-1">*</span>
                  )}
                </Label>
                {formData.risk_level === 'high' && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    Required
                  </Badge>
                )}
              </div>
            </div>
            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50 rounded-lg p-3 mb-2">
              <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                Why evidence links?
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Evidence links validate your assessment and support decision-making. Include test results, analysis reports, audit documentation, or compliance records. 
                {formData.risk_level === 'high' && (
                  <span className="font-semibold"> High-risk assessments require evidence for regulatory compliance and audit purposes.</span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                value={evidenceLink}
                onChange={(e) => setEvidenceLink(e.target.value)}
                placeholder="Enter URL or file path (e.g., https://docs.company.com/test-results.pdf)"
                className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 rounded-lg h-9 text-sm"
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
                size="sm"
                className="border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg h-9 px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.evidence_links && formData.evidence_links.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {formData.evidence_links.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-secondary/20 px-2.5 py-1.5 rounded-md border border-border/50"
                  >
                    <span className="text-foreground text-xs truncate flex-1">
                      {link}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEvidenceLink(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2 rounded-md h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {errors.evidence_links && (
              <div className="space-y-1">
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.evidence_links}
                </p>
                {evidenceLink.trim() && formData.risk_level === 'high' && (!formData.evidence_links || formData.evidence_links.length === 0) && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    💡 Tip: Click the "+" button to add the link you typed above.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Error Alert */}
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-lg py-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 text-sm">
                Please fix the errors above before submitting.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-border/50 bg-secondary/30 text-foreground hover:bg-secondary/50 rounded-lg h-9"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              className="rounded-lg h-9 px-4"
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
