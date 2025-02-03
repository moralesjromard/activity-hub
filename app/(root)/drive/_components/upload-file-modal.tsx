import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { toast } from "sonner";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export function UploadFileModal({
  isOpen,
  onClose,
  onUpload,
}: UploadFileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Please upload an image file (JPEG, PNG, GIF, or WEBP)");
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);

      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      await onUpload(file);

      setProgress(100);
      setTimeout(() => {
        setFile(null);
        setProgress(0);
        setUploading(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
      setProgress(0);
      toast.error("Upload failed. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 transition-colors",
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-gray-300",
              "cursor-pointer"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() =>
              !uploading && document.getElementById("file-upload")?.click()
            }
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
              accept="image/jpeg,image/png,image/gif,image/webp"
            />

            {file ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center flex-col gap-2">
                  <ImageIcon className="w-12 h-12 text-blue-500" />
                  <div className="text-center">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      Uploading... {progress}%
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">Drag & drop an image here</p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: JPEG, PNG, GIF, WEBP (Max: 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
