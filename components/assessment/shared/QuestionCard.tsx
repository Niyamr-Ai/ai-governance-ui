"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/shared-utils";
import { 
  HelpCircle, 
  CheckSquare, 
  Circle, 
  FileText, 
  AlertCircle,
  Info
} from "lucide-react";

type QuestionType = "text" | "radio" | "checkbox" | "select" | "textarea";
type Priority = "high" | "medium" | "low" | "info";

interface QuestionCardProps {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  priority?: Priority;
  required?: boolean;
  helperText?: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
  questionNumber?: number;
  totalQuestions?: number;
}

const typeIcons: Record<QuestionType, React.ComponentType<{ className?: string }>> = {
  text: FileText,
  textarea: FileText,
  radio: Circle,
  checkbox: CheckSquare,
  select: HelpCircle,
};

const priorityConfig: Record<Priority, { color: string; bgColor: string; borderColor: string; label: string }> = {
  high: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Critical",
  },
  medium: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    label: "Important",
  },
  low: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Standard",
  },
  info: {
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Info",
  },
};

export function QuestionCard({
  id,
  title,
  description,
  type,
  priority = "info",
  required = false,
  helperText,
  children,
  error,
  className,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const IconComponent = typeIcons[type];
  const priorityStyle = priorityConfig[priority];

  return (
    <Card
      className={cn(
        "rounded-xl border transition-all duration-200",
        error
          ? "border-red-300 bg-red-50/30"
          : "border-border/50 bg-white hover:border-primary/20",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
              error ? "bg-red-100" : "bg-primary/10"
            )}
          >
            <IconComponent className={cn("h-5 w-5", error ? "text-red-500" : "text-primary")} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {questionNumber !== undefined && (
                <span className="text-xs font-medium text-muted-foreground">
                  Q{questionNumber}{totalQuestions ? `/${totalQuestions}` : ""}
                </span>
              )}
              <h4 className="text-base font-medium text-foreground">
                {title}
              </h4>
              {required && (
                <span className="text-red-500 text-sm">*</span>
              )}
              {priority !== "info" && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    priorityStyle.color,
                    priorityStyle.bgColor,
                    priorityStyle.borderColor
                  )}
                >
                  {priorityStyle.label}
                </Badge>
              )}
              {helperText && (
                <span className="relative group">
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 max-w-xs">
                    {helperText}
                  </span>
                </span>
              )}
            </div>

            {description && (
              <p className="text-sm text-muted-foreground mb-4">
                {description}
              </p>
            )}

            <div className="mt-3">
              {children}
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-3 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
