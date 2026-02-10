import { useEffect, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";

type Props = {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  value?: string | null;
  onFileSelect: (file: File | null) => void;
};

export default function EvidenceUpload({
  label,
  accept = ".pdf,.doc,.docx",
  maxSizeMB = 10,
  value,
  onFileSelect,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);

  // ✅ CORRECT place for useEffect
  useEffect(() => {
    setFileName(value || null);
  }, [value]);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileChange = (file: File | null) => {
    setError(null);

    if (!file) {
      setFileName(null);
      resetInput();
      onFileSelect(null);
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be smaller than ${maxSizeMB}MB`);
      resetInput();
      return;
    }

    setFileName(file.name);
    onFileSelect(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>

      {!fileName ? (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-muted/40 px-4 py-3 hover:bg-muted">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Click to upload a file</span>
            <span className="text-xs text-muted-foreground">
              {accept} • Max {maxSizeMB}MB
            </span>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) =>
              handleFileChange(e.target.files?.[0] || null)
            }
          />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-emerald-600" />
            <div>
              <span className="text-sm font-medium text-emerald-800">
                {fileName}
              </span>
              <span className="text-xs text-emerald-600">
                File uploaded successfully
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleFileChange(null)}
            className="rounded-md p-1 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}