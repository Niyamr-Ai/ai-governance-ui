"use client";

import * as React from "react";
import { cn } from "@/utils/shared-utils";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  showStatus?: boolean;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
  showStatus = true,
}: ToggleSwitchProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border transition-colors",
        checked
          ? "bg-emerald-50 border-emerald-200"
          : "bg-slate-50 border-slate-200 hover:bg-slate-100",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {(label || description) && (
        <div className="space-y-0.5 flex-1 mr-4">
          {label && (
            <p className={cn(
              "text-sm font-semibold",
              checked ? "text-emerald-800" : "text-slate-700"
            )}>
              {label}
            </p>
          )}
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      )}
      <div className="flex items-center gap-2">
        {showStatus && (
          <span
            className={cn(
              "text-xs font-bold px-2 py-1 rounded transition-colors",
              checked
                ? "text-emerald-700 bg-emerald-100"
                : "text-slate-500 bg-slate-200"
            )}
          >
            {checked ? "YES" : "NO"}
          </span>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 ease-in-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
            disabled && "cursor-not-allowed"
          )}
          style={{ backgroundColor: checked ? "#10b981" : "#94a3b8" }}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}

export function ToggleSwitchInline({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 ease-in-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50"
      )}
      style={{ backgroundColor: checked ? "#10b981" : "#94a3b8" }}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}
