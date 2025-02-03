// components/update-file-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileIcon, ImageIcon, FilmIcon, FileTextIcon } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

interface FileData {
  fileId: number;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface UpdateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFile: FileData;
  onUpdate: (fileId: number, newFile: File) => Promise<void>;
}

export function UpdateFileModal({
  isOpen,
  onClose,
  currentFile,
  onUpdate,
}: UpdateFileModalProps) {
  const [newFile, setNewFile] = useState<File | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

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
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const validateAndSetFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const currentFileType = currentFile.fileType?.split("/")[0] || "";
    const newFileType = file.type?.split("/")[0] || "";

    if (currentFileType && newFileType && currentFileType !== newFileType) {
      toast.error("Please select a file of the same type");
      return;
    }
    setNewFile(file);
  };

  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <FileIcon className="w-12 h-12 text-gray-500" />;

    if (fileType.startsWith("image/"))
      return <ImageIcon className="w-12 h-12 text-blue-500" />;
    if (fileType.startsWith("video/"))
      return <FilmIcon className="w-12 h-12 text-purple-500" />;
    if (fileType.startsWith("text/"))
      return <FileTextIcon className="w-12 h-12 text-orange-500" />;
    return <FileIcon className="w-12 h-12 text-gray-500" />;
  };

  const handleUpdate = async () => {
    if (!newFile || !currentFile.fileId) return;

    try {
      setUploading(true);
      let intervalId: NodeJS.Timeout | undefined;

      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            if (intervalId) clearInterval(intervalId);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      await onUpdate(currentFile.fileId, newFile);

      setProgress(100);
      setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
        setNewFile(undefined);
        setProgress(0);
        setUploading(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Update failed:", error);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update File</DialogTitle>
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
              !uploading && document.getElementById("file-update")?.click()
            }
          >
            <input
              id="file-update"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-center flex-col gap-2">
                {getFileIcon(newFile?.type || currentFile.fileType)}
                <div className="text-center">
                  <p className="font-medium">
                    {newFile?.name || currentFile.fileName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(newFile?.size || currentFile.fileSize)}
                  </p>
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Updating... {progress}%
                  </p>
                </div>
              )}

              {!uploading && (
                <p className="text-sm text-center text-muted-foreground">
                  Drag & drop to replace file or click to browse
                </p>
              )}

              <p className="text-xs text-center text-muted-foreground">
                Supported formats: JPEG, PNG, GIF, WEBP (Max: 10MB)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!newFile || uploading}>
              {uploading ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
