import { useState } from "react";
import { Upload, FileText, X } from "lucide-react";

type Props = {
  label: string;
  accept?: string;
  onFileSelect: (file: File | null) => void;
};

export default function EvidenceUpload({ label, accept, onFileSelect }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>

      {!fileName ? (
        /* Upload state */
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 transition hover:bg-muted">
          <Upload className="h-5 w-5 text-muted-foreground" />

          <div className="flex flex-col">
            <span className="text-sm font-medium">
              Click to upload a file
            </span>
            <span className="text-xs text-muted-foreground">
              PDF, DOC, DOCX
            </span>
          </div>

          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setFileName(file?.name || null);
              onFileSelect(file);
            }}
          />
        </label>
      ) : (
        /* Uploaded state */
        <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-emerald-600" />
            <div className="flex flex-col">
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
            onClick={() => {
              setFileName(null);
              onFileSelect(null);
            }}
            className="rounded-md p-1 text-emerald-700 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
