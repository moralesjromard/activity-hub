"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ImageIcon,
  Upload,
  Search,
  Grid2X2,
  List,
  Calendar,
  SortAsc,
} from "lucide-react";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadFileModal } from "./_components/upload-file-modal";
import { FileItemList } from "./_components/file-item-list";
import { FileItemGrid } from "./_components/file-item-grid";
import { deleteFile, getFiles, updateFile, uploadFile } from "@/actions/drive";
import { useUserStore } from "@/store/user-store";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { UpdateFileModal } from "./_components/update-file-modal";
import { format } from "date-fns";

type FileList = {
  id: number;
  created_at: string;
  name: string;
  path: string;
  size: number;
  type: string;
  updated_at: string;
  url: string;
  user_id: string;
};

export type SelectedFile = {
  fileId: number;
  filePath: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
};

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "date-newest"
  | "date-oldest";

const DrivePage = () => {
  const { user } = useUserStore();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [fileList, setFileList] = useState<FileList[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date-newest");
  const [selectedFile, setSelectedFile] = useState<SelectedFile>({
    fileId: 0,
    filePath: "",
  });

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = [...fileList];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter((file) => {
        const formattedDate = format(new Date(file.created_at), "MMM d, yyyy");

        return (
          file.name.toLowerCase().includes(query) ||
          formattedDate.toLowerCase().includes(query)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        case "name-desc":
          return b.name.toLowerCase().localeCompare(a.name.toLowerCase());
        case "date-newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "date-oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [fileList, searchQuery, sortOption]);

  const handleGetFiles = async () => {
    if (!user?.id) {
      toast.error("Please login to view files");
      return;
    }

    const result = await getFiles(user?.id);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success && Array.isArray(result.data)) {
      setFileList(result.data as unknown as FileList[]);
    } else {
      setFileList([]);
      toast.error("No files found or error loading files");
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user?.id) {
      toast.error("Please login to upload files");
      return;
    }

    const result = await uploadFile({
      file,
      userId: user.id,
    });

    if (result.success) {
      toast.success("File uploaded successfully!");
      handleGetFiles();
    } else {
      toast.error(result.error || "Failed to upload file");
    }
  };

  const handleOpenDeleteDialog = ({ fileId, filePath }: SelectedFile) => {
    setIsDeleteDialogOpen(true);
    setSelectedFile({ fileId, filePath });
  };

  const handleDeleteFile = async ({
    selectedFile,
  }: {
    selectedFile: SelectedFile;
  }) => {
    if (!user?.id) return;

    await deleteFile({
      fileId: selectedFile?.fileId,
      userId: user?.id,
      filePath: selectedFile.filePath,
    }).then((res) => {
      if (res.error) {
        setIsDeleteDialogOpen(false);
        console.log(res.serverError);
        return toast.error(res.message);
      }

      if (res.success) {
        toast.success(res.message);
        handleGetFiles();
        setIsDeleteDialogOpen(false);
      }
    });
  };

  const handleOpenUpdateModal = ({
    fileId,
    fileName,
    filePath,
    fileType,
    fileSize,
  }: SelectedFile) => {
    setIsUpdateModalOpen(true);
    setSelectedFile({
      fileId,
      filePath,
      fileName,
      fileType,
      fileSize,
    });
  };

  const handleFileUpdate = async (fileId: number, newFile: File) => {
    if (!user?.id) {
      toast.error("Please login to update files");
      return;
    }

    try {
      const result = await updateFile({
        fileId,
        userId: user.id,
        newFile,
        filePath: selectedFile.filePath,
      });

      if (result.success) {
        toast.success("File updated successfully!");
        handleGetFiles();
        setIsUpdateModalOpen(false);
      } else {
        toast.error(result.error || "Failed to update file");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong while updating the file");
    }
  };

  useEffect(() => {
    handleGetFiles();
  }, [user]);

  return (
    <main className="w-full h-full flex justify-center items-start flex-col p-6">
      <header className="flex flex-col mb-6 gap-6 w-full">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20 mr-4">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">Drive Lite</h2>
              <p className="text-muted-foreground">
                Upload, manage and search your photos
              </p>
            </div>
          </div>

          <Button
            className="shadow-lg"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Photo
          </Button>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Drive Lite</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {/* Toolbar */}
      <div className="w-full flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search photo by name or date..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select
          value={sortOption}
          onValueChange={(value) => setSortOption(value as SortOption)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">
              <div className="flex items-center">
                <SortAsc className="mr-2 h-4 w-4" />
                Name (A to Z)
              </div>
            </SelectItem>
            <SelectItem value="name-desc">
              <div className="flex items-center">
                <SortAsc className="mr-2 h-4 w-4 rotate-180" />
                Name (Z to A)
              </div>
            </SelectItem>
            <SelectItem value="date-newest">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Newest First
              </div>
            </SelectItem>
            <SelectItem value="date-oldest">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Oldest First
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Photos Grid/List View */}
      <div
        className={`w-full ${
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            : "space-y-2"
        }`}
      >
        {filteredAndSortedFiles.length === 0 ? (
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {searchQuery
                  ? "No matching files found"
                  : "No files uploaded yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                ) : (
                  "Upload your first photo to get started"
                )}
              </p>
            </div>
          </div>
        ) : (
          filteredAndSortedFiles.map((photo: FileList) =>
            viewMode === "grid" ? (
              <FileItemGrid
                key={photo.id}
                id={photo.id}
                url={photo.url}
                path={photo.path}
                name={photo.name}
                size={photo.size}
                type={photo.type}
                created_at={photo.created_at}
                openDeleteDialog={handleOpenDeleteDialog}
                openUpdateModal={handleOpenUpdateModal}
              />
            ) : (
              <FileItemList
                key={photo.id}
                id={photo.id}
                url={photo.url}
                path={photo.path}
                name={photo.name}
                size={photo.size}
                type={photo.type}
                created_at={photo.created_at}
                openDeleteDialog={handleOpenDeleteDialog}
                openUpdateModal={handleOpenUpdateModal}
              />
            )
          )
        )}
      </div>

      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleFileUpload}
      />

      <UpdateFileModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        currentFile={{
          fileId: selectedFile.fileId,
          filePath: selectedFile.filePath,
          fileName: selectedFile.fileName!,
          fileType: selectedFile.fileType!,
          fileSize: selectedFile.fileSize!,
        }}
        onUpdate={handleFileUpdate}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => handleDeleteFile({ selectedFile })}
        title="Delete file"
        description="Are you sure you want to delete this file?"
        cancelText="Cancel"
        confirmText="Confirm"
        variant="destructive"
      />
    </main>
  );
};

export default DrivePage;
