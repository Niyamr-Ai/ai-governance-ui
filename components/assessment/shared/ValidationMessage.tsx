"use client";

import { cn } from "@/utils/shared-utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type ValidationType = "error" | "warning" | "success" | "info";

interface ValidationMessageProps {
  type: ValidationType;
  message: string;
  className?: string;
}

const config = {
  error: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  warning: {
    icon: AlertCircle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  success: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
};

export function ValidationMessage({ type, message, className }: ValidationMessageProps) {
  const { icon: Icon, color, bgColor, borderColor } = config[type];

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border animate-fade-in-up",
        color,
        bgColor,
        borderColor,
        className
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
