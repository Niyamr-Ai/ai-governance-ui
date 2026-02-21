"use client";

import { cn } from "@/utils/shared-utils";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
  variant?: "default" | "compact";
}

export function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
  className,
  variant = "default",
}: ProgressStepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isClickable = onStepClick && (isCompleted || index <= currentStep + 1);

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-2 group",
                  isClickable && "cursor-pointer",
                  !isClickable && "cursor-default"
                )}
              >
                <div
                  className={cn(
                    "relative flex items-center justify-center transition-all duration-300",
                    variant === "default" ? "h-10 w-10 rounded-full" : "h-8 w-8 rounded-full",
                    isCompleted && "bg-green-500 text-white",
                    isActive && "bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground border-2 border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className={cn(variant === "default" ? "h-5 w-5" : "h-4 w-4")} />
                  ) : step.icon ? (
                    <span className={cn(variant === "default" ? "h-5 w-5" : "h-4 w-4")}>{step.icon}</span>
                  ) : (
                    <span className={cn("font-medium", variant === "default" ? "text-sm" : "text-xs")}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {variant === "default" && (
                  <div className="hidden sm:block text-left">
                    <p
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isActive && "text-primary",
                        isCompleted && "text-green-600",
                        !isCompleted && !isActive && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    {step.description && (
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    )}
                  </div>
                )}

                {variant === "compact" && (
                  <p
                    className={cn(
                      "text-xs font-medium transition-colors hidden md:block",
                      isActive && "text-primary",
                      !isActive && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                )}
              </button>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 transition-colors duration-300",
                    variant === "compact" && "mx-1",
                    isCompleted ? "bg-green-500" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          Step {currentStep + 1} of {steps.length}
        </Badge>
        <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
