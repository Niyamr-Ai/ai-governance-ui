"use client";

import { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/utils/shared-utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ToggleSectionProps {
  name: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function ToggleSection({
  name,
  title,
  description,
  children,
  defaultExpanded = false,
}: ToggleSectionProps) {
  const { control, watch } = useFormContext();
  const isEnabled = watch(name);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Label className="text-base font-semibold">{title}</Label>
            <Badge
              variant={isEnabled ? "default" : "secondary"}
              className={cn(
                "text-xs",
                isEnabled && "bg-green-500 text-white"
              )}
            >
              {isEnabled ? "YES" : "NO"}
            </Badge>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <button
              type="button"
              role="switch"
              aria-checked={field.value || false}
              onClick={() => field.onChange(!field.value)}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors",
                field.value
                  ? "bg-green-500 border-green-400"
                  : "bg-gray-300 border-gray-400"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform",
                  field.value ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          )}
        />
      </div>

      {isEnabled && (
        <div className="pl-4 border-l-2 border-primary/20 space-y-4 animate-fade-in-up">
          {children}
        </div>
      )}
    </div>
  );
}

interface TextFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  type?: "text" | "textarea";
}

export function TextField({
  name,
  label,
  placeholder,
  required = false,
  description,
  type = "textarea",
}: TextFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Label className="text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) =>
          type === "textarea" ? (
            <Textarea
              {...field}
              value={field.value || ""}
              placeholder={placeholder}
              className={cn("rounded-xl min-h-[80px]", error && "border-red-500")}
            />
          ) : (
            <input
              {...field}
              value={field.value || ""}
              placeholder={placeholder}
              className={cn(
                "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                error && "border-red-500"
              )}
            />
          )
        }
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
