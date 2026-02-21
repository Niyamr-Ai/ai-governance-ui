"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Settings } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssessmentCard } from "@/components/assessment/shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/shared-utils";

interface MasPage1IntroProps {
  assessmentMode: "rapid" | "comprehensive";
  onModeChange: (mode: "rapid" | "comprehensive") => void;
}

export default function MasPage1Intro({
  assessmentMode,
  onModeChange,
}: MasPage1IntroProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <AssessmentCard
      title="System Profile & Company Information"
      description="Tell us about your AI system and organization"
      icon={<Settings className="h-5 w-5" />}
      badge={<Badge variant="outline">Required</Badge>}
    >
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900">Assessment Mode</h4>
              <p className="text-xs text-blue-700">
                Quick Scan gives a fast high-level check. Deep Review covers full controls
                and FEAT principles.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onModeChange("rapid")}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  assessmentMode === "rapid"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-blue-200 text-blue-700 hover:bg-blue-100"
                )}
              >
                Quick Scan
              </button>
              <button
                type="button"
                onClick={() => onModeChange("comprehensive")}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  assessmentMode === "comprehensive"
                    ? "bg-green-600 text-white"
                    : "bg-white border border-green-200 text-green-700 hover:bg-green-100"
                )}
              >
                Deep Review
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-foreground">
              System name <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="system_name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g., Fraud Detection Engine"
                  className={cn("rounded-xl", errors.system_name && "border-red-500")}
                />
              )}
            />
            {errors.system_name && (
              <p className="text-sm text-red-500">{errors.system_name.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Owner / Team</Label>
            <Controller
              name="owner"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g., Risk Operations"
                  className="rounded-xl"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Jurisdiction(s)</Label>
            <Controller
              name="jurisdiction"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g., Singapore, Global"
                  className="rounded-xl"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">
              Sector / Industry <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="sector"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn("rounded-xl", errors.sector && "border-red-500")}
                  >
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-xl z-50">
                    <SelectItem value="banking">Banking</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="capital_markets">Capital Markets</SelectItem>
                    <SelectItem value="asset_management">Asset Management</SelectItem>
                    <SelectItem value="payments">Payments</SelectItem>
                    <SelectItem value="fintech">FinTech</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.sector && (
              <p className="text-sm text-red-500">{errors.sector.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">System Status</Label>
            <Controller
              name="system_status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-xl z-50">
                    <SelectItem value="envision">Envision - Planning</SelectItem>
                    <SelectItem value="development">Development - Being built</SelectItem>
                    <SelectItem value="staging">Staging - Testing</SelectItem>
                    <SelectItem value="production">Production - Live</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Business Purpose</Label>
            <Controller
              name="business_use_case"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="e.g., Credit scoring"
                  className="rounded-xl"
                />
              )}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-foreground">
              System Description <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Describe what your AI system does and its main purpose..."
                  className={cn("min-h-[100px] rounded-xl", errors.description && "border-red-500")}
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message as string}</p>
            )}
          </div>
        </div>
      </div>
    </AssessmentCard>
  );
}
