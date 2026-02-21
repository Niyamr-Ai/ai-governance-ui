"use client";

import { useState, useCallback } from "react";
import { cn } from "@/utils/shared-utils";
import { useFormContext, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  FileText,
  FileImage,
  File,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface EvidenceUploaderProps {
  name: string;
  label?: string;
  description?: string;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onUpload?: (files: File[]) => Promise<string[]>;
}

const fileTypeIcons: Record<string, typeof File> = {
  "application/pdf": FileText,
  "image/": FileImage,
  default: File,
};

function getFileIcon(type: string) {
  for (const [key, icon] of Object.entries(fileTypeIcons)) {
    if (type.startsWith(key) || key === "default") {
      return icon;
    }
  }
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function EvidenceUploader({
  name,
  label,
  description,
  accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg",
  maxSize = 10 * 1024 * 1024,
  maxFiles = 5,
  required = false,
  disabled = false,
  className,
  onUpload,
}: EvidenceUploaderProps) {
  const { control } = useFormContext();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null, existingFiles: File[]) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of fileArray) {
        if (existingFiles.length + validFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          break;
        }
        if (file.size > maxSize) {
          errors.push(`${file.name} exceeds ${formatFileSize(maxSize)} limit`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        setUploading(true);
        try {
          if (onUpload) {
            await onUpload(validFiles);
          }
          return [...existingFiles, ...validFiles];
        } finally {
          setUploading(false);
        }
      }

      return existingFiles;
    },
    [maxFiles, maxSize, onUpload]
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const files: File[] = Array.isArray(field.value) ? field.value : [];

        const handleDrop = async (e: React.DragEvent) => {
          e.preventDefault();
          setDragActive(false);
          const newFiles = await handleFiles(e.dataTransfer.files, files);
          if (newFiles) field.onChange(newFiles);
        };

        const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const newFiles = await handleFiles(e.target.files, files);
          if (newFiles) field.onChange(newFiles);
        };

        const removeFile = (index: number) => {
          field.onChange(files.filter((_, i) => i !== index));
        };

        return (
          <div className={cn("space-y-3", className)}>
            {label && (
              <label className="text-sm font-medium text-foreground">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}

            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl transition-all duration-200",
                dragActive && "border-primary bg-primary/5",
                !dragActive && "border-border/50 hover:border-primary/30",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept={accept}
                onChange={handleChange}
                disabled={disabled || uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />

              <div className="flex flex-col items-center justify-center py-8 px-4">
                <div
                  className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center mb-3",
                    dragActive ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  {uploading ? (
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <p className="text-sm font-medium text-foreground mb-1">
                  {uploading ? "Uploading..." : "Drop files here or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {description || `PDF, DOC, PNG, JPG up to ${formatFileSize(maxSize)}`}
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => {
                  const Icon = getFileIcon(file.type);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                        Ready
                      </Badge>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

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
