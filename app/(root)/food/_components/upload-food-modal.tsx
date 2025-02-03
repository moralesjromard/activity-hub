"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, LoaderCircle, Upload } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";

import { cn, formatFileSize } from "@/lib/utils";
import { uploadFood } from "@/actions/food";
import { useUserStore } from "@/store/user-store";

interface UploadFoodModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  updatePostsList: () => void;
}

const formSchema = z.object({
  foodName: z.string().min(3, {
    message: "Dish name is required",
  }),
  foodDescription: z.string().min(3, {
    message: "Dish description is required",
  }),
  foodImage: z.instanceof(File).refine(
    (file) => {
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      const ALLOWED_FILE_TYPES = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      return (
        ALLOWED_FILE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
      );
    },
    {
      message:
        "Invalid file type or size. Please upload an image file (JPEG, PNG, GIF, or WEBP) less than 10MB.",
    }
  ),
});

export const UploadFoodModal = ({
  isOpen,
  setIsOpen,
  updatePostsList,
}: UploadFoodModalProps) => {
  const { user } = useUserStore();

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodName: "",
      foodDescription: "",
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, onChange: (file: File) => void) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onChange(droppedFile);
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File) => void
  ) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onChange(selectedFile);
      setFile(selectedFile);
    }
  };

  const handleUpload = async ({
    userId,
    values,
  }: {
    userId: string;
    values: z.infer<typeof formSchema>;
  }) => {
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

      const result = await uploadFood({
        userId: userId,
        foodName: values.foodName,
        foodDescription: values.foodDescription,
        image: file,
      });

      if (result.error) {
        toast.error(result.message);
        console.log(result.serverError);
        return;
      }

      if (result.success) {
        toast.success(result.message);

        setProgress(100);
        setTimeout(() => {
          setFile(null);
          setProgress(0);
          setUploading(false);
          setIsOpen(false);
        }, 500);

        updatePostsList();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(false);
      setProgress(0);
      toast.error("Upload failed. Please try again.");
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user?.id) return;
    startTransition(() => {
      handleUpload({ userId: user?.id, values });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Food Experience</DialogTitle>
          <DialogDescription>
            Upload a photo and share your thoughts about the dish.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2 py-4">
              <Label className="text-base">Upload image</Label>
              <Controller
                name="foodImage"
                control={form.control}
                render={({ field, fieldState: { error } }) => (
                  <div>
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
                      onDrop={(e) => handleDrop(e, field.onChange)}
                      onClick={() =>
                        !uploading &&
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, field.onChange)}
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
                          <p className="font-medium">
                            Drag & drop an image here
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Supported formats: JPEG, PNG, GIF, WEBP (Max: 10MB)
                          </p>
                        </div>
                      )}
                    </div>
                    {error && (
                      <p className="text-sm text-red-600 mt-2">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="foodName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="text-sm"
                        placeholder="Dish name"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foodDescription"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Describe your experience..."
                        className="resize-none text-sm"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending && <LoaderCircle className="h-5 w-5 animate-spin" />}
                {isPending ? "Posting..." : "Post review"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
