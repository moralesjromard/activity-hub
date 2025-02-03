"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Heart,
  Loader,
  LoaderCircle,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FoodList } from "./food-post-list";

import { getNameInitials } from "@/lib/utils";
import {
  createFoodReview,
  deleteFoodReview,
  getFoodReviews,
} from "@/actions/food";
import { useUserStore } from "@/store/user-store";
import { useFoodStore } from "@/store/food-store";
import { formatDistanceToNow } from "date-fns";
import { UpdateReviewModal } from "./update-review-modal";

export type FoodReview = {
  id: number;
  food_id: number;
  user_id: number;
  comment: string;
  profiles: {
    user_id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
};

interface FoodPostProps {
  isOpen: boolean;
  onClose: () => void;
  post: FoodList;
}

export const FoodPost = ({ isOpen, onClose, post }: FoodPostProps) => {
  const { user } = useUserStore();
  const { reviews, setReviews, setIsUpdateReviewOpen, setSelectedReview } =
    useFoodStore();

  const [pending, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleGetFoodReviews = async () => {
    const res = await getFoodReviews({ foodId: post.id });

    if ("error" in res) {
      toast.error(res.message);
      return;
    }

    setReviews(res);
    setIsLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!user?.id) return;

    if (!newReview.trim()) {
      return toast.error("Please write a review first");
    }

    startTransition(async () => {
      const result = await createFoodReview({
        userId: user?.id,
        foodId: post.id,
        comment: newReview,
      });

      if (result.error) {
        toast.error(result.message);
        return;
      }

      if (result.success) {
        toast.success("Review posted successfully!");
        setNewReview("");
        handleGetFoodReviews();
      }
    });
  };

  const handleDeleteReview = async ({
    foodReviewId,
  }: {
    foodReviewId: number;
  }) => {
    const result = await deleteFoodReview({ foodReviewId });
    if (result.error) {
      toast.error(result.message);
      return;
    }

    if (result.success) {
      toast.success(result.message);
      handleGetFoodReviews();
      return;
    }
  };

  const handleOpenUpdateReviewModal = ({
    reviewId,
    comment,
  }: {
    reviewId: number;
    comment: string;
  }) => {
    setIsUpdateReviewOpen(true);
    setSelectedReview({ id: reviewId, comment: comment });
  };

  useEffect(() => {
    if (post) {
      setIsLoading(true);
      handleGetFoodReviews();
    }
  }, [post]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl p-0 gap-0 [&>button]:hidden border-none">
          <div className="flex h-[80vh]">
            {/* Left side - Image */}
            <div className="relative w-[60%] bg-black flex justfiy-center items-center rounded-l-xl">
              <Image
                src={post.url}
                alt={post.name}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Right side - Content */}
            <div className="w-[40%] flex flex-col h-full">
              {/* Header */}
              <header className="p-4 border-b">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 ">
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                          {getNameInitials(`${post?.profiles?.name}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <DialogTitle className="text-sm font-semibold">
                          {post.name}
                        </DialogTitle>
                        <span className="text-xs text-muted-foreground">
                          by {post?.profiles?.name}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogHeader>
              </header>

              {/* Description */}
              <div className="p-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {post?.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleLike}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isLiked ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    <span>0</span>
                  </Button>
                </div>
              </div>

              {/* Reviews Section */}

              {isLoading ? (
                <div className="py-12 w-full flex justify-center items-center">
                  <Loader className="h-6 w-6 animate-spin" />
                </div>
              ) : reviews.length > 0 ? (
                <ScrollArea className="flex-1 p-4 relative">
                  {reviews.map((review) => (
                    <div key={review.id} className="mb-4 relative">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm">
                            {getNameInitials(review.profiles.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-start gap-2">
                            <span className="text-sm font-medium">
                              {review.profiles.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                new Date(review.created_at),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </span>
                          </div>
                          <div className="absolute top-0 right-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleOpenUpdateReviewModal({
                                      reviewId: review.id,
                                      comment: review.comment,
                                    })
                                  }
                                >
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="!text-red-600 cursor-pointer"
                                  onClick={() =>
                                    handleDeleteReview({
                                      foodReviewId: review.id,
                                    })
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <p className="text-sm mt-1">{review.comment}</p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))}
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                  <p className="text-sm text-muted-foreground">
                    {" "}
                    No reviews yet
                  </p>
                </div>
              )}

              {/* Add Review Section */}
              <div className="p-4 border-t mt-auto">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Write a review..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitReview}
                    disabled={!newReview.trim() || pending}
                  >
                    {pending && (
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    )}
                    {pending ? "Posting..." : "Post review"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UpdateReviewModal updateReviewList={handleGetFoodReviews} />
    </>
  );
};
