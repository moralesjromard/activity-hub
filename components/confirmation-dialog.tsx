"use client";

import React, { Dispatch, SetStateAction } from "react";
import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void | Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  variant?: "default" | "destructive" | "secondary";
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm to delete the selected row",
  description = "Are you sure you want to delete the selected row? This action cannot be undone.",
  cancelText = "Cancel",
  confirmText = "Delete",
  variant = "destructive",
}: ConfirmationDialogProps) => {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(() => {
      onConfirm();
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="mt-2 sm:mt-0">
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending && <LoaderCircle className="h-5 w-5 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
