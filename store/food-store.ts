import { create } from "zustand";

import { FoodList } from "@/app/(root)/food/_components/food-post-list";
import { FoodReview } from "@/app/(root)/food/_components/food-post";

type SelectedReview = {
  id: number;
  comment: string;
};

interface FoodStore {
  isUpdateReviewOpen: boolean;
  setIsUpdateReviewOpen: (isOpen: boolean) => void;

  isPostOpen: boolean;
  setIsPostOpen: (isOpen: boolean) => void;

  post: FoodList;
  setPost: (post: FoodList) => void;
  clearPost: () => void;

  reviews: FoodReview[];
  setReviews: (reviews: FoodReview[]) => void;
  clearReviews: () => void;
  selectedReview: SelectedReview;
  setSelectedReview: (review: SelectedReview) => void;
}

export const useFoodStore = create<FoodStore>((set) => ({
  isUpdateReviewOpen: false,
  setIsUpdateReviewOpen: (isOpen: boolean) =>
    set({ isUpdateReviewOpen: isOpen }),

  isPostOpen: false,
  setIsPostOpen: (isOpen: boolean) => set({ isPostOpen: isOpen }),

  post: {
    id: 0,
    name: "",
    description: "",
    url: "",
    profiles: {
      email: "",
      name: "",
      user_id: "",
    },
    updated_at: "",
    created_at: "",
  },
  setPost: (post: FoodList) => set({ post }),
  clearPost: () =>
    set({
      post: {
        id: 0,
        name: "",
        description: "",
        url: "",
        profiles: { email: "", name: "", user_id: "" },
        updated_at: "",
        created_at: "",
      },
    }),

  reviews: [],
  setReviews: (reviews: FoodReview[]) => set({ reviews }),
  clearReviews: () => set({ reviews: [] }),
  selectedReview: {
    id: 0,
    comment: "",
  },
  setSelectedReview: (review: SelectedReview) =>
    set({ selectedReview: review }),
}));
