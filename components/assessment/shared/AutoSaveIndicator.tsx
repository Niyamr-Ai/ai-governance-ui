"use client";

import { cn } from "@/utils/shared-utils";
import { Loader2, Check, AlertCircle, CloudOff } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  className?: string;
}

const statusConfig = {
  idle: {
    icon: null,
    text: "Ready",
    color: "text-muted-foreground",
  },
  saving: {
    icon: Loader2,
    text: "Saving...",
    color: "text-blue-600",
    animate: true,
  },
  saved: {
    icon: Check,
    text: "Saved",
    color: "text-green-600",
  },
  error: {
    icon: CloudOff,
    text: "Failed to save",
    color: "text-red-600",
  },
};

export function AutoSaveIndicator({ status, lastSaved, className }: AutoSaveIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs font-medium transition-all duration-300",
        config.color,
        className
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            "animate" in config && config.animate && "animate-spin"
          )}
        />
      )}
      <span>{config.text}</span>
      {status === "saved" && lastSaved && (
        <span className="text-muted-foreground">
          at {formatTime(lastSaved)}
        </span>
      )}
      {status === "error" && (
        <button
          type="button"
          className="underline hover:no-underline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      )}
    </div>
  );
}
