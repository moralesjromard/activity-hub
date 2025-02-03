import { format } from "date-fns";
import { Download, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { formatFileSize } from "@/lib/utils";
import { SelectedFile } from "../page";

interface FileItemListProps {
  id: number;
  url: string;
  path: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
  openDeleteDialog: ({ fileId, filePath }: SelectedFile) => void;
  openUpdateModal: ({
    fileId,
    filePath,
    fileName,
    fileType,
    fileSize,
  }: {
    fileId: number;
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => void;
}

export const FileItemList = ({
  id,
  url,
  path,
  name,
  type,
  size,
  created_at,
  openDeleteDialog,
  openUpdateModal,
}: FileItemListProps) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <img src={url} alt={name} className="w-12 h-12 rounded object-cover" />
        <div>
          <a
            href={url}
            target="_blank"
            className="font-medium cursor-pointer hover:underline"
          >
            {name}
          </a>
          <p className="text-sm text-muted-foreground">
            {format(new Date(created_at), "MMM d, yyyy")} •{" "}
            {formatFileSize(size)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() =>
            openUpdateModal({
              fileId: id,
              filePath: path,
              fileName: name,
              fileType: type,
              fileSize: size,
            })
          }
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            openDeleteDialog({ fileId: id, filePath: path });
          }}
        >
          <Trash2 className="h-4 w-4 !text-red-600" />
        </Button>
      </div>
    </div>
  );
};
