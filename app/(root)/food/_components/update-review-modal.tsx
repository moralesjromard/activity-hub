"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { useFoodStore } from "@/store/food-store";
import { updateFoodReview } from "@/actions/food";
import { LoaderCircle } from "lucide-react";

export const UpdateReviewModal = ({
  updateReviewList,
}: {
  updateReviewList: () => void;
}) => {
  const { isUpdateReviewOpen, setIsUpdateReviewOpen, selectedReview } =
    useFoodStore();

  const [isPending, startTransition] = useTransition();

  const [newReview, setNewReview] = useState(selectedReview.comment);

  const handleUpdateReview = () => {
    if (!newReview.trim()) {
      return;
    }

    startTransition(async () => {
      const result = await updateFoodReview({
        foodReviewId: selectedReview.id,
        comment: newReview,
      });

      if (result.error) {
        toast.error(result.message);
        return;
      }

      if (result.success) {
        toast.success("Review updated successfully!");
        setNewReview("");
        updateReviewList();
        setIsUpdateReviewOpen(false);
        return;
      }
    });
  };

  useEffect(() => {
    setNewReview(selectedReview.comment);
  }, [selectedReview]);

  return (
    <Dialog open={isUpdateReviewOpen} onOpenChange={setIsUpdateReviewOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit review</DialogTitle>
          <DialogDescription>Edit your review</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Write your review..."
            onChange={(e) => setNewReview(e.target.value)}
            value={newReview}
          />
          <div className="flex justify-end">
            <Button
              disabled={!newReview.trim() || isPending}
              onClick={handleUpdateReview}
            >
              {isPending && <LoaderCircle className="h-5 w-5 animate-spin" />}
              {isPending ? "Updating..." : "Update review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
