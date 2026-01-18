type Props = {
    label: string;
    accept?: string;
    onFileSelect: (file: File | null) => void;
  };
  
  export default function EvidenceUpload({ label, accept, onFileSelect }: Props) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <input
          type="file"
          accept={accept}
          onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md"
        />
      </div>
    );
  }
  