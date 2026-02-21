"use client";

import { cn } from "@/utils/shared-utils";
import { useFormContext, Controller } from "react-hook-form";
import { Check, Minus } from "lucide-react";

interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface StyledCheckboxProps {
  name: string;
  options: CheckboxOption[];
  label?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal" | "grid";
  columns?: number;
  className?: string;
  optionClassName?: string;
  noneOption?: string;
  excludeOnSelect?: string[];
}

export function StyledCheckbox({
  name,
  options,
  label,
  required = false,
  disabled = false,
  orientation = "vertical",
  columns = 2,
  className,
  optionClassName,
  noneOption = "none",
  excludeOnSelect = [],
}: StyledCheckboxProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selectedValues: string[] = Array.isArray(field.value) ? field.value : [];

        const handleToggle = (value: string) => {
          if (disabled) return;

          let newValues: string[];

          if (selectedValues.includes(value)) {
            newValues = selectedValues.filter((v) => v !== value);
          } else {
            if (value === noneOption) {
              newValues = [value];
            } else if (excludeOnSelect.includes(value)) {
              newValues = [...selectedValues.filter((v) => v !== noneOption), value];
            } else {
              newValues = [...selectedValues.filter((v) => v !== noneOption), value];
            }
          }

          field.onChange(newValues);
        };

        return (
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
                orientation === "vertical" && "flex flex-col",
                orientation === "horizontal" && "flex flex-wrap",
                orientation === "grid" && "grid grid-cols-1 sm:grid-cols-2 gap-3"
              )}
              style={
                orientation === "grid" && columns > 2
                  ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
                  : undefined
              }
            >
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                const isDisabled = disabled || option.disabled;
                const isNone = option.value === noneOption;

                return (
                  <label
                    key={option.value}
                    className={cn(
                      "relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                      "hover:border-primary/30 hover:bg-primary/5",
                      isSelected && !isNone && "border-primary bg-primary/10 shadow-sm",
                      isSelected && isNone && "border-gray-400 bg-gray-50",
                      !isSelected && "border-border/50 bg-white",
                      isDisabled && "opacity-50 cursor-not-allowed",
                      optionClassName
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(option.value)}
                      disabled={isDisabled}
                      className="sr-only"
                    />

                    <div
                      className={cn(
                        "h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                        isSelected && !isNone && "border-primary bg-primary",
                        isSelected && isNone && "border-gray-400 bg-gray-400",
                        !isSelected && "border-border bg-white",
                        isDisabled && "cursor-not-allowed"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isSelected && !isNone && "text-primary",
                          isSelected && isNone && "text-gray-600",
                          !isSelected && "text-foreground"
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
        );
      }}
    />
  );
}
