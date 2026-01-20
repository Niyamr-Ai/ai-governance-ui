import type { ReactNode } from "react";


type ToggleSectionProps = {
    label: string;
    description?: string;
    value: boolean;
    onChange: () => void;
    children?: ReactNode;
  };
  
  
  export default function ToggleSection({
    label,
    description,
    value,
    onChange,
    children,
  }: ToggleSectionProps) {
    return (
      <div className="space-y-3 border border-border rounded-xl p-4 glass-panel">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <label className="text-base font-medium">{label}</label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
  
          <button
            type="button"
            role="switch"
            aria-checked={value}
            onClick={onChange}
            className={`relative inline-flex h-7 w-12 rounded-full border-2 ${
              value ? "bg-emerald-600" : "bg-gray-400"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 rounded-full bg-white transform ${
                value ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
  
        {value && (
          <div className="ml-4 mt-3 pl-4 border-l-2 border-emerald-500">
            {children}
          </div>
        )}
      </div>
    );
  }
  