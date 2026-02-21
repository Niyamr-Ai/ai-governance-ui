"use client";

import { cn } from "@/utils/shared-utils";
import { useFormContext, Controller } from "react-hook-form";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface StyledRadioProps {
  name: string;
  options: RadioOption[];
  label?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  className?: string;
  optionClassName?: string;
}

export function StyledRadio({
  name,
  options,
  label,
  required = false,
  disabled = false,
  orientation = "vertical",
  className,
  optionClassName,
}: StyledRadioProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-2", className)}>
          {label && (
            <label className="text-sm font-medium text-foreground">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          <div
            className={cn(
              "gap-3",
              orientation === "vertical" ? "flex flex-col" : "flex flex-wrap"
            )}
          >
            {options.map((option) => {
              const isSelected = field.value === option.value;
              const isDisabled = disabled || option.disabled;

              return (
                <label
                  key={option.value}
                  className={cn(
                    "relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    "hover:border-primary/30 hover:bg-primary/5",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border/50 bg-white",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    optionClassName
                  )}
                >
                  <input
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={isSelected}
                    onChange={() => !isDisabled && field.onChange(option.value)}
                    disabled={isDisabled}
                    className="sr-only"
                  />

                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border bg-white",
                      isDisabled && "cursor-not-allowed"
                    )}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {option.label}
                    </span>
                    {option.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {fieldState.error && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-red-500" />
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
