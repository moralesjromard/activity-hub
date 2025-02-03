import { Download, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

import { SelectedFile } from "../page";
import { formatFileSize } from "@/lib/utils";

interface FileItemGridProps {
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

export const FileItemGrid = ({
  id,
  url,
  path,
  name,
  type,
  size,
  created_at,
  openDeleteDialog,
  openUpdateModal,
}: FileItemGridProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <img
            src={url}
            alt={name}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 rounded-t-xl">
            <a href={url} target="_blank">
              <Button size="icon" variant="secondary">
                <Eye className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <p className="font-medium truncate">{name}</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
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
                  <Pencil className="mr-2 h-4 w-4" /> Edit file
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="!text-red-600"
                  onClick={() => {
                    openDeleteDialog({ fileId: id, filePath: path });
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(created_at), "MMM d, yyyy")} •{" "}
            {formatFileSize(size)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
