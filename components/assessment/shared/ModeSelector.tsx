"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/shared-utils";
import { Zap, Shield, Loader2, ArrowRight } from "lucide-react";

type AssessmentMode = "rapid" | "comprehensive";

interface ModeSelectorProps {
  value: AssessmentMode | null;
  onChange: (mode: AssessmentMode) => void;
  rapidLabel?: string;
  comprehensiveLabel?: string;
  rapidDescription?: string;
  comprehensiveDescription?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function ModeSelector({
  value,
  onChange,
  rapidLabel = "Quick Scan",
  comprehensiveLabel = "Deep Review",
  rapidDescription = "Fast high-level risk classification using core indicators. Best for initial screening.",
  comprehensiveDescription = "Full compliance review with detailed controls, governance checks, and evidence requirements.",
  className,
  disabled = false,
  loading = false,
}: ModeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      <Card
        className={cn(
          "relative cursor-pointer transition-all duration-300 overflow-hidden group",
          "border-2 rounded-2xl",
          value === "rapid"
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : "border-border/50 bg-white hover:border-primary/30 hover:shadow-md",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && !loading && onChange("rapid")}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "h-14 w-14 rounded-xl flex items-center justify-center transition-colors",
                value === "rapid"
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              )}
            >
              {loading && value === "rapid" ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                <Zap className="h-7 w-7" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground">{rapidLabel}</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  ~5 min
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{rapidDescription}</p>
            </div>

            <div
              className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                value === "rapid"
                  ? "border-primary bg-primary"
                  : "border-border group-hover:border-primary/50"
              )}
            >
              {value === "rapid" && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Core risk indicators
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Essential compliance check
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Preliminary risk tier
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          "relative cursor-pointer transition-all duration-300 overflow-hidden group",
          "border-2 rounded-2xl",
          value === "comprehensive"
            ? "border-green-500 bg-green-50/50 shadow-lg shadow-green-500/10"
            : "border-border/50 bg-white hover:border-green-500/30 hover:shadow-md",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && !loading && onChange("comprehensive")}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "h-14 w-14 rounded-xl flex items-center justify-center transition-colors",
                value === "comprehensive"
                  ? "bg-green-500 text-white"
                  : "bg-green-100 text-green-600 group-hover:bg-green-200"
              )}
            >
              {loading && value === "comprehensive" ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                <Shield className="h-7 w-7" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-foreground">{comprehensiveLabel}</h3>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  ~20 min
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comprehensiveDescription}</p>
            </div>

            <div
              className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                value === "comprehensive"
                  ? "border-green-500 bg-green-500"
                  : "border-border group-hover:border-green-500/50"
              )}
            >
              {value === "comprehensive" && (
                <div className="h-2 w-2 rounded-full bg-white" />
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-green-500" />
                Complete regulatory mapping
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-green-500" />
                Governance & evidence checks
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-1 w-1 rounded-full bg-green-500" />
                Detailed recommendations
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
